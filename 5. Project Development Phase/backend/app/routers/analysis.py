from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.models import Loan, FinancialAnalysis, AuditLog
from backend.app.schemas.schemas import AnalysisOut
from backend.app.auth.auth import get_current_user, User

router = APIRouter(prefix="/analyze", tags=["Financial Analysis"])

@router.post("", response_model=AnalysisOut)
def analyze_financial_health(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loans = db.query(Loan).filter(
        Loan.user_id == current_user.id,
        Loan.status.in_(["Active", "Overdue"])
    ).all()

    total_debt = sum(l.outstanding_amount for l in loans)
    total_original = sum(l.original_amount for l in loans)
    total_emi = sum(l.emi for l in loans)
    overdue_count = sum(1 for l in loans if l.status == "Overdue")

    income = current_user.monthly_income
    dti_ratio = (total_emi / income) if income > 0 else (1.0 if total_emi > 0 else 0.0)
    monthly_surplus = max(income - total_emi, 0.0)
    
    # Simple disposable estimate (surplus)
    disposable_income = monthly_surplus

    # Debt Stress Index calculation
    dti_component = min(dti_ratio * 60, 60.0)
    overdue_component = min(overdue_count * 15, 25.0)
    debt_ratio_component = ((total_debt / total_original) * 15.0) if total_original > 0 else 0.0
    stress_index = min(dti_component + overdue_component + debt_ratio_component, 100.0)

    # Stability Score
    stability_score = max(100.0 - stress_index, 0.0)

    # Red / Yellow / Green indicators
    if stress_index >= 60.0 or overdue_count > 0 or dti_ratio > 0.5:
        status_indicator = "Red"
    elif 30.0 <= stress_index < 60.0 or 0.3 <= dti_ratio <= 0.5:
        status_indicator = "Yellow"
    else:
        status_indicator = "Green"

    # Save to Database
    analysis_record = FinancialAnalysis(
        user_id=current_user.id,
        debt_to_income_ratio=dti_ratio,
        monthly_surplus=monthly_surplus,
        disposable_income=disposable_income,
        debt_stress_index=stress_index,
        stability_score=stability_score,
        status_indicator=status_indicator
    )
    db.add(analysis_record)
    db.commit()
    db.refresh(analysis_record)

    # Audit Log
    log = AuditLog(
        user_id=current_user.id,
        action=f"Generated financial analysis: stress score {stress_index:.1f}% (Indicator: {status_indicator})"
    )
    db.add(log)
    db.commit()

    return analysis_record

@router.get("/history", response_model=list[AnalysisOut])
def get_analysis_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(FinancialAnalysis).filter(
        FinancialAnalysis.user_id == current_user.id
    ).order_by(FinancialAnalysis.generated_at.desc()).all()
