from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.models import Loan, AuditLog
from backend.app.schemas.schemas import LoanCreate, LoanUpdate, LoanOut
from backend.app.auth.auth import get_current_user, User

router = APIRouter(prefix="/loans", tags=["Loan Management"])

@router.get("", response_model=List[LoanOut])
def get_loans(
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Loan).filter(Loan.user_id == current_user.id)
    
    if status_filter:
        query = query.filter(Loan.status == status_filter)
        
    if search:
        query = query.filter(
            (Loan.loan_name.ilike(f"%{search}%")) | 
            (Loan.lender_name.ilike(f"%{search}%")) |
            (Loan.loan_type.ilike(f"%{search}%"))
        )
        
    return query.all()

@router.post("", response_model=LoanOut, status_code=status.HTTP_201_CREATED)
def create_loan(
    loan_data: LoanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_loan = Loan(
        user_id=current_user.id,
        loan_name=loan_data.loan_name,
        lender_name=loan_data.lender_name,
        loan_type=loan_data.loan_type,
        outstanding_amount=loan_data.outstanding_amount,
        original_amount=loan_data.original_amount,
        interest_rate=loan_data.interest_rate,
        emi=loan_data.emi,
        due_date=loan_data.due_date,
        overdue_months=loan_data.overdue_months,
        status=loan_data.status
    )
    db.add(new_loan)
    db.commit()
    db.refresh(new_loan)

    # Log action
    log = AuditLog(user_id=current_user.id, action=f"Created loan {new_loan.loan_name}")
    db.add(log)
    db.commit()

    return new_loan

@router.get("/{loan_id}", response_model=LoanOut)
def get_loan(
    loan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.user_id == current_user.id).first()
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
    return loan

@router.put("/{loan_id}", response_model=LoanOut)
def update_loan(
    loan_id: int,
    loan_data: LoanUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.user_id == current_user.id).first()
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
        
    for key, value in loan_data.dict(exclude_unset=True).items():
        setattr(loan, key, value)
        
    db.add(loan)
    db.commit()
    db.refresh(loan)

    # Log action
    log = AuditLog(user_id=current_user.id, action=f"Updated loan {loan.loan_name}")
    db.add(log)
    db.commit()

    return loan

@router.delete("/{loan_id}")
def delete_loan(
    loan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.user_id == current_user.id).first()
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
        
    loan_name = loan.loan_name
    db.delete(loan)
    db.commit()

    # Log action
    log = AuditLog(user_id=current_user.id, action=f"Deleted loan {loan_name}")
    db.add(log)
    db.commit()

    return {"detail": "Loan successfully deleted"}
