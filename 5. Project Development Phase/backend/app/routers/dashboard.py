from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.models import Loan, AuditLog, SettlementRecommendation
from backend.app.schemas.schemas import DashboardSummary
from backend.app.auth.auth import get_current_user, User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardSummary)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch active and overdue loans
    loans = db.query(Loan).filter(
        Loan.user_id == current_user.id,
        Loan.status.in_(["Active", "Overdue"])
    ).all()

    total_debt = sum(l.outstanding_amount for l in loans)
    total_original = sum(l.original_amount for l in loans)
    total_emi = sum(l.emi for l in loans)
    overdue_count = sum(1 for l in loans if l.status == "Overdue")

    # Ratio Calculations
    income = current_user.monthly_income
    emi_ratio = (total_emi / income) if income > 0 else 0.0

    # Debt Stress Score (0 - 100)
    # Calculated based on: DTI (60%), Overdue Loan presence (25%), Debt outstanding ratio (15%)
    dti_component = min(emi_ratio * 60, 60.0)
    overdue_component = min(overdue_count * 12.5, 25.0)
    debt_ratio_component = ( (total_debt / total_original) * 15.0 ) if total_original > 0 else 0.0
    
    debt_stress_score = min(dti_component + overdue_component + debt_ratio_component, 100.0)

    # Settlement Probability
    recs = db.query(SettlementRecommendation).filter(SettlementRecommendation.user_id == current_user.id).all()
    if recs:
        settlement_probability = sum(r.settlement_probability for r in recs) / len(recs)
    else:
        # Default fallback calculation if no AI recommendation has run yet
        if overdue_count > 0:
            settlement_probability = 0.70  # Overdue loans are easier to settle
        elif total_debt > 15000:
            settlement_probability = 0.55
        else:
            settlement_probability = 0.45

    # Monthly Surplus and Savings Estimate
    monthly_surplus = max(income - total_emi, 0.0)
    savings_estimate = monthly_surplus * 0.20  # Recommend saving 20% of surplus

    # Recent Audit Activity
    logs = db.query(AuditLog).filter(
        AuditLog.user_id == current_user.id
    ).order_by(AuditLog.timestamp.desc()).limit(5).all()
    
    recent_activity = [
        {"action": log.action, "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M")}
        for log in logs
    ]

    # Upcoming EMIs
    upcoming_emis = [
        {
            "id": l.id,
            "loan_name": l.loan_name,
            "lender_name": l.lender_name,
            "emi": l.emi,
            "due_date": l.due_date,
            "status": l.status
        }
        for l in loans
    ]

    return {
        "total_debt": total_debt,
        "monthly_income": income,
        "total_emi": total_emi,
        "emi_ratio": emi_ratio,
        "debt_stress_score": debt_stress_score,
        "settlement_probability": settlement_probability,
        "monthly_surplus": monthly_surplus,
        "savings_estimate": savings_estimate,
        "recent_activity": recent_activity,
        "upcoming_emis": upcoming_emis
    }
