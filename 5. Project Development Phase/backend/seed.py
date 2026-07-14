import os
import sys
from datetime import datetime

# Adjust Python path to resolve app directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.database.database import engine, SessionLocal, Base
from backend.app.models.models import User, Loan, FinancialAnalysis, ChatHistory, AuditLog
from backend.app.auth.auth import get_password_hash

def seed_db():
    print("Initialising database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if user already exists
        test_email = "test@example.com"
        user = db.query(User).filter(User.email == test_email).first()
        if user:
            print("Database already seeded. Skipping...")
            return
            
        print("Creating mock user...")
        hashed_password = get_password_hash("password123")
        user = User(
            full_name="John Doe",
            email=test_email,
            password_hash=hashed_password,
            phone="+1 555-0199",
            monthly_income=5000.0,
            occupation="Software Engineer"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print("Creating mock loans...")
        loans = [
            Loan(
                user_id=user.id,
                loan_name="Chase Sapphire Credit Card",
                lender_name="Chase Bank",
                loan_type="Credit Card",
                outstanding_amount=12500.0,
                original_amount=15000.0,
                interest_rate=18.9,
                emi=350.0,
                due_date="25th",
                overdue_months=3,
                status="Overdue"
            ),
            Loan(
                user_id=user.id,
                loan_name="Undergrad Student Loan",
                lender_name="Sallie Mae",
                loan_type="Student Loan",
                outstanding_amount=28000.0,
                original_amount=30000.0,
                interest_rate=5.5,
                emi=250.0,
                due_date="10th",
                overdue_months=0,
                status="Active"
            ),
            Loan(
                user_id=user.id,
                loan_name="Debt Consolidation Loan",
                lender_name="Discover Bank",
                loan_type="Personal Loan",
                outstanding_amount=4200.0,
                original_amount=8000.0,
                interest_rate=11.2,
                emi=180.0,
                due_date="15th",
                overdue_months=0,
                status="Active"
            )
        ]
        
        for l in loans:
            db.add(l)
        db.commit()
        
        print("Creating initial financial analysis...")
        total_emi = 350.0 + 250.0 + 180.0
        dti_ratio = total_emi / 5000.0
        surplus = 5000.0 - total_emi
        
        analysis = FinancialAnalysis(
            user_id=user.id,
            debt_to_income_ratio=dti_ratio,
            monthly_surplus=surplus,
            disposable_income=surplus,
            debt_stress_index=68.5,  # Calculated stress based on overdue and high DTI
            stability_score=31.5,
            status_indicator="Red"
        )
        db.add(analysis)
        
        print("Creating mock chat history...")
        chats = [
            ChatHistory(
                user_id=user.id,
                sender="User",
                message="Hi, I have a high-interest credit card debt. Should I prioritize it or my student loans?"
            ),
            ChatHistory(
                user_id=user.id,
                sender="AI",
                message="Hello! In your situation, prioritizing the credit card debt is highly recommended (the 'Debt Avalanche' method). Credit cards have significantly higher interest rates (18.9%) compared to student loans (5.5%). Settling or paying down high-interest liabilities first reduces the total interest paid over time. Additionally, credit card debt carries a higher collection risk and greater impact on credit utilization."
            )
        ]
        
        for c in chats:
            db.add(c)
            
        print("Creating initial audit logs...")
        logs = [
            AuditLog(user_id=user.id, action="Registration seed successful"),
            AuditLog(user_id=user.id, action="Created loan Chase Sapphire Credit Card"),
            AuditLog(user_id=user.id, action="Created loan Undergrad Student Loan"),
            AuditLog(user_id=user.id, action="Created loan Debt Consolidation Loan"),
            AuditLog(user_id=user.id, action="Generated initial financial health report")
        ]
        for log in logs:
            db.add(log)
            
        db.commit()
        print("Seeding completed successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
