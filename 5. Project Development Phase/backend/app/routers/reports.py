import io
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.models import Loan, SettlementRecommendation, FinancialAnalysis, Report
from backend.app.auth.auth import get_current_user, User
from backend.app.services.reports_service import generate_pdf_report, generate_excel_report

router = APIRouter(prefix="/reports", tags=["Report Generation"])

@router.get("/pdf")
def download_pdf_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch user data
    loans = db.query(Loan).filter(Loan.user_id == current_user.id).all()
    recommendations = db.query(SettlementRecommendation).filter(SettlementRecommendation.user_id == current_user.id).all()
    analysis = db.query(FinancialAnalysis).filter(
        FinancialAnalysis.user_id == current_user.id
    ).order_by(FinancialAnalysis.generated_at.desc()).first()

    try:
        pdf_bytes = generate_pdf_report(
            user=current_user,
            loans=loans,
            recommendations=recommendations,
            analysis=analysis
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF report: {str(e)}"
        )

    # Save record to Database (Optional tracking)
    rep_record = Report(
        user_id=current_user.id,
        report_type="PDF",
        file_path="in-memory"
    )
    db.add(rep_record)
    db.commit()

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=financial_recovery_report.pdf"}
    )

@router.get("/excel")
def download_excel_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch user data
    loans = db.query(Loan).filter(Loan.user_id == current_user.id).all()
    recommendations = db.query(SettlementRecommendation).filter(SettlementRecommendation.user_id == current_user.id).all()
    analysis = db.query(FinancialAnalysis).filter(
        FinancialAnalysis.user_id == current_user.id
    ).order_by(FinancialAnalysis.generated_at.desc()).first()

    try:
        excel_bytes = generate_excel_report(
            user=current_user,
            loans=loans,
            recommendations=recommendations,
            analysis=analysis
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate Excel ledger: {str(e)}"
        )

    # Save record to Database (Optional tracking)
    rep_record = Report(
        user_id=current_user.id,
        report_type="Excel",
        file_path="in-memory"
    )
    db.add(rep_record)
    db.commit()

    return StreamingResponse(
        io.BytesIO(excel_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=financial_recovery_ledger.xlsx"}
    )
