from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.models import Loan, SettlementRecommendation, AuditLog
from backend.app.schemas.schemas import RecommendationRequest, RecommendationOut
from backend.app.auth.auth import get_current_user, User
from backend.app.services.gemini_service import get_recommendation

router = APIRouter(prefix="/recommend", tags=["Settlement Recommendation"])

@router.post("", response_model=RecommendationOut)
def generate_recommendation(
    req: RecommendationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch target loan
    loan = db.query(Loan).filter(Loan.id == req.loan_id, Loan.user_id == current_user.id).first()
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
    
    # Fetch all user loans for full context
    all_loans = db.query(Loan).filter(Loan.user_id == current_user.id).all()
    loans_list = [
        {
            "loan_name": l.loan_name,
            "lender_name": l.lender_name,
            "loan_type": l.loan_type,
            "outstanding_amount": l.outstanding_amount,
            "original_amount": l.original_amount,
            "interest_rate": l.interest_rate,
            "emi": l.emi,
            "due_date": l.due_date,
            "overdue_months": l.overdue_months,
            "status": l.status
        }
        for l in all_loans
    ]

    # Calculate temporary stress score for AI context
    total_debt = sum(l.outstanding_amount for l in all_loans)
    total_emi = sum(l.emi for l in all_loans)
    income = current_user.monthly_income
    emi_ratio = (total_emi / income) if income > 0 else 0.0
    overdue_count = sum(1 for l in all_loans if l.status == "Overdue")
    stress_score = min((emi_ratio * 60) + (overdue_count * 15) + 10.0, 100.0)

    # Call Gemini service
    try:
        ai_res = get_recommendation(
            income=income,
            loans=loans_list,
            stress_score=stress_score
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate recommendation from AI: {str(e)}"
        )

    # Save to Database
    new_rec = SettlementRecommendation(
        user_id=current_user.id,
        loan_id=loan.id,
        recommended_settlement_pct=ai_res.get("recommended_settlement_pct", 45.0),
        expected_range=ai_res.get("expected_range", "40% - 50%"),
        recommended_monthly_payment=ai_res.get("recommended_monthly_payment", 0.0),
        stress_level=ai_res.get("stress_level", "Medium"),
        settlement_probability=ai_res.get("settlement_probability", 0.50),
        priority_loans=", ".join(ai_res.get("priority_loans", [])),
        risk_level=ai_res.get("risk_level", "Medium"),
        recovery_advice=ai_res.get("recovery_advice", ""),
        raw_ai_response=str(ai_res)
    )
    db.add(new_rec)
    db.commit()
    db.refresh(new_rec)

    # Audit Log
    log = AuditLog(
        user_id=current_user.id,
        action=f"Generated settlement recommendation for loan {loan.loan_name}"
    )
    db.add(log)
    db.commit()

    return new_rec

@router.get("", response_model=list[RecommendationOut])
def get_recommendations_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(SettlementRecommendation).filter(
        SettlementRecommendation.user_id == current_user.id
    ).order_by(SettlementRecommendation.created_at.desc()).all()
