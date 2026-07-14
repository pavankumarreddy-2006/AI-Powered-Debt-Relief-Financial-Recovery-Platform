from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.models import Loan, NegotiationLetter, AuditLog
from backend.app.schemas.schemas import LetterGenerateRequest, LetterUpdateStatus, LetterOut
from backend.app.auth.auth import get_current_user, User
from backend.app.services.gemini_service import get_negotiation_letter

router = APIRouter(prefix="/negotiation", tags=["Negotiation Strategy"])

@router.post("/generate-letter", response_model=LetterOut)
def generate_lender_letter(
    req: LetterGenerateRequest,
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

    # Prepare borrower profile dictionary
    profile = {
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "monthly_income": current_user.monthly_income,
        "occupation": current_user.occupation
    }

    # Prepare loan dictionary
    loan_dict = {
        "id": loan.id,
        "loan_name": loan.loan_name,
        "original_amount": loan.original_amount,
        "outstanding_amount": loan.outstanding_amount,
        "interest_rate": loan.interest_rate,
        "emi": loan.emi,
        "due_date": loan.due_date,
        "overdue_months": loan.overdue_months,
        "status": loan.status
    }

    # Call Gemini service
    try:
        letter_data = get_negotiation_letter(
            user_profile=profile,
            loan=loan_dict,
            letter_type=req.letter_type,
            recipient_lender=req.recipient_lender
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate negotiation letter from AI: {str(e)}"
        )

    # Save to Database
    new_letter = NegotiationLetter(
        user_id=current_user.id,
        loan_id=loan.id,
        recipient_lender=req.recipient_lender,
        letter_type=req.letter_type,
        generated_content=letter_data.get("letter_content", ""),
        suggested_settlement_amount=letter_data.get("suggested_settlement_amount", loan.outstanding_amount * 0.45),
        suggested_installments=letter_data.get("suggested_installments", ""),
        status="Draft"
    )
    db.add(new_letter)
    db.commit()
    db.refresh(new_letter)

    # Log action
    log = AuditLog(
        user_id=current_user.id,
        action=f"Generated {req.letter_type} for lender {req.recipient_lender}"
    )
    db.add(log)
    db.commit()

    return new_letter

@router.get("", response_model=list[LetterOut])
def get_letters_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(NegotiationLetter).filter(
        NegotiationLetter.user_id == current_user.id
    ).order_by(NegotiationLetter.created_at.desc()).all()

@router.put("/{letter_id}/status", response_model=LetterOut)
def update_letter_status(
    letter_id: int,
    status_update: LetterUpdateStatus,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    letter = db.query(NegotiationLetter).filter(
        NegotiationLetter.id == letter_id,
        NegotiationLetter.user_id == current_user.id
    ).first()
    
    if not letter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Letter not found"
        )
        
    letter.status = status_update.status
    db.add(letter)
    db.commit()
    db.refresh(letter)

    # Log action
    log = AuditLog(
        user_id=current_user.id,
        action=f"Updated letter {letter.id} status to {status_update.status}"
    )
    db.add(log)
    db.commit()

    return letter
