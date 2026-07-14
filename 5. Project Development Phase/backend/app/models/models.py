from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    monthly_income = Column(Float, default=0.0)
    occupation = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    loans = relationship("Loan", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("SettlementRecommendation", back_populates="user", cascade="all, delete-orphan")
    letters = relationship("NegotiationLetter", back_populates="user", cascade="all, delete-orphan")
    analyses = relationship("FinancialAnalysis", back_populates="user", cascade="all, delete-orphan")
    chats = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")

class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    loan_name = Column(String, nullable=False)
    lender_name = Column(String, nullable=False)
    loan_type = Column(String, nullable=False)
    outstanding_amount = Column(Float, nullable=False)
    original_amount = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False)
    emi = Column(Float, nullable=False)
    due_date = Column(String, nullable=False)
    overdue_months = Column(Integer, default=0)
    status = Column(String, default="Active")  # Active, Overdue, Settled, Closed
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="loans")
    recommendations = relationship("SettlementRecommendation", back_populates="loan", cascade="all, delete-orphan")
    letters = relationship("NegotiationLetter", back_populates="loan", cascade="all, delete-orphan")

class SettlementRecommendation(Base):
    __tablename__ = "settlement_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    loan_id = Column(Integer, ForeignKey("loans.id"), nullable=False)
    recommended_settlement_pct = Column(Float, nullable=False)
    expected_range = Column(String, nullable=False)
    recommended_monthly_payment = Column(Float, nullable=False)
    stress_level = Column(String, nullable=False)  # Low, Medium, High, Severe
    settlement_probability = Column(Float, nullable=False)
    priority_loans = Column(String, nullable=True)
    risk_level = Column(String, nullable=False)
    recovery_advice = Column(Text, nullable=False)
    raw_ai_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="recommendations")
    loan = relationship("Loan", back_populates="recommendations")

class NegotiationLetter(Base):
    __tablename__ = "negotiation_letters"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    loan_id = Column(Integer, ForeignKey("loans.id"), nullable=False)
    recipient_lender = Column(String, nullable=False)
    letter_type = Column(String, nullable=False)  # e.g., "Settlement Request", "Hardship Letter"
    generated_content = Column(Text, nullable=False)
    suggested_settlement_amount = Column(Float, nullable=False)
    suggested_installments = Column(String, nullable=True)
    status = Column(String, default="Draft")  # Draft, Sent, Accepted, Rejected
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="letters")
    loan = relationship("Loan", back_populates="letters")

class FinancialAnalysis(Base):
    __tablename__ = "financial_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    debt_to_income_ratio = Column(Float, nullable=False)
    monthly_surplus = Column(Float, nullable=False)
    disposable_income = Column(Float, nullable=False)
    debt_stress_index = Column(Float, nullable=False)
    stability_score = Column(Float, nullable=False)
    status_indicator = Column(String, nullable=False)  # Green, Yellow, Red
    generated_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="analyses")

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sender = Column(String, nullable=False)  # User, AI
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="chats")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    report_type = Column(String, nullable=False)  # PDF, Excel
    file_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="reports")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="audit_logs")
