from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# Authentication & User
class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None
    monthly_income: float = Field(default=0.0, ge=0.0)
    occupation: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None

class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: Optional[str]
    monthly_income: float
    occupation: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    monthly_income: Optional[float] = None
    occupation: Optional[str] = None

# Loan
class LoanCreate(BaseModel):
    loan_name: str
    lender_name: str
    loan_type: str
    outstanding_amount: float = Field(..., ge=0.0)
    original_amount: float = Field(..., ge=0.0)
    interest_rate: float = Field(..., ge=0.0)
    emi: float = Field(..., ge=0.0)
    due_date: str
    overdue_months: int = Field(default=0, ge=0)
    status: str = Field(default="Active")  # Active, Overdue, Settled, Closed

class LoanUpdate(BaseModel):
    loan_name: Optional[str] = None
    lender_name: Optional[str] = None
    loan_type: Optional[str] = None
    outstanding_amount: Optional[float] = None
    original_amount: Optional[float] = None
    interest_rate: Optional[float] = None
    emi: Optional[float] = None
    due_date: Optional[str] = None
    overdue_months: Optional[int] = None
    status: Optional[str] = None

class LoanOut(BaseModel):
    id: int
    user_id: int
    loan_name: str
    lender_name: str
    loan_type: str
    outstanding_amount: float
    original_amount: float
    interest_rate: float
    emi: float
    due_date: str
    overdue_months: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Settlement Recommendation
class RecommendationRequest(BaseModel):
    loan_id: int

class RecommendationOut(BaseModel):
    id: int
    user_id: int
    loan_id: int
    recommended_settlement_pct: float
    expected_range: str
    recommended_monthly_payment: float
    stress_level: str
    settlement_probability: float
    priority_loans: Optional[str] = None
    risk_level: str
    recovery_advice: str
    created_at: datetime

    class Config:
        from_attributes = True

# Negotiation Letter
class LetterGenerateRequest(BaseModel):
    loan_id: int
    recipient_lender: str
    letter_type: str  # e.g., "Email Template", "Settlement Request Letter"

class LetterUpdateStatus(BaseModel):
    status: str  # Draft, Sent, Accepted, Rejected

class LetterOut(BaseModel):
    id: int
    user_id: int
    loan_id: int
    recipient_lender: str
    letter_type: str
    generated_content: str
    suggested_settlement_amount: float
    suggested_installments: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Financial Analysis
class AnalysisOut(BaseModel):
    id: int
    user_id: int
    debt_to_income_ratio: float
    monthly_surplus: float
    disposable_income: float
    debt_stress_index: float
    stability_score: float
    status_indicator: str
    generated_at: datetime

    class Config:
        from_attributes = True

# Chat
class ChatMessageCreate(BaseModel):
    message: str

class ChatOut(BaseModel):
    id: int
    user_id: int
    sender: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard Summary
class DashboardSummary(BaseModel):
    total_debt: float
    monthly_income: float
    total_emi: float
    emi_ratio: float
    debt_stress_score: float
    settlement_probability: float
    monthly_surplus: float
    savings_estimate: float
    recent_activity: List[dict] = []
    upcoming_emis: List[dict] = []
