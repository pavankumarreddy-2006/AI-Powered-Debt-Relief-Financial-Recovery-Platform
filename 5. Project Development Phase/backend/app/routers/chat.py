from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.models import ChatHistory
from backend.app.schemas.schemas import ChatMessageCreate, ChatOut
from backend.app.auth.auth import get_current_user, User
from backend.app.services.gemini_service import chat_advisor

router = APIRouter(prefix="/chat", tags=["AI Advisor Chat"])

@router.post("", response_model=ChatOut)
def send_chat_message(
    chat_input: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch recent chat logs for context
    history_records = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id
    ).order_by(ChatHistory.created_at.asc()).limit(15).all()

    history_list = [
        {"sender": rec.sender, "message": rec.message}
        for rec in history_records
    ]

    # Save User message
    user_msg = ChatHistory(
        user_id=current_user.id,
        sender="User",
        message=chat_input.message
    )
    db.add(user_msg)
    db.commit()

    # Call Gemini chat service
    try:
        advisor_response = chat_advisor(
            chat_history=history_list,
            user_message=chat_input.message
        )
    except Exception as e:
        advisor_response = f"I apologize, but I encountered an error checking my advisor networks: {str(e)}"

    # Save AI message
    ai_msg = ChatHistory(
        user_id=current_user.id,
        sender="AI",
        message=advisor_response
    )
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    return ai_msg

@router.get("", response_model=list[ChatOut])
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id
    ).order_by(ChatHistory.created_at.asc()).all()

@router.delete("/clear")
def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).delete()
    db.commit()
    return {"detail": "Chat history cleared successfully"}
