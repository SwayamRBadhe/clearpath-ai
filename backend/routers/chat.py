from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from models.database import get_db
from models.conversation import Conversation
from services.rag import ask_question

# Create router
router = APIRouter(prefix="/chat", tags=["Chat"])


# Request body schema
class ChatRequest(BaseModel):
    question: str
    session_id: str  # groups messages into one conversation
    user_id: int     # which user is asking


# Chat route - takes a question and returns an answer from RAG pipeline
@router.post("/ask")
async def ask(request: Request, chat_request: ChatRequest, db: Session = Depends(get_db)):
    # Make sure RAG pipeline is ready
    qa_chain = getattr(request.app.state, "qa_chain", None)
    if qa_chain is None:
        raise HTTPException(status_code=503, detail="RAG pipeline not ready yet")

    # Load previous messages for this session from PostgreSQL
    chat_history = db.query(Conversation).filter(
        Conversation.session_id == chat_request.session_id,
        Conversation.user_id == chat_request.user_id
    ).order_by(Conversation.created_at.asc()).all()

    # Get answer from RAG pipeline with chat history
    result = ask_question(qa_chain, chat_request.question, chat_history)

    # Save user question to PostgreSQL
    user_msg = Conversation(
        user_id=chat_request.user_id,
        session_id=chat_request.session_id,
        role="user",
        message=chat_request.question
    )
    db.add(user_msg)

    # Save assistant answer to PostgreSQL
    assistant_msg = Conversation(
        user_id=chat_request.user_id,
        session_id=chat_request.session_id,
        role="assistant",
        message=result["answer"]
    )
    db.add(assistant_msg)
    db.commit()

    return result