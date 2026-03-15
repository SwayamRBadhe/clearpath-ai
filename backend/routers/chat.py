from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from services.rag import ask_question

# Create router
router = APIRouter(prefix="/chat", tags=["Chat"])


# Request body schema
class ChatRequest(BaseModel):
    question: str


# Chat route - takes a question and returns an answer from RAG pipeline
@router.post("/ask")
async def ask(request: Request, chat_request: ChatRequest):
    # Make sure RAG pipeline is ready
    qa_chain = getattr(request.app.state, "qa_chain", None)
    if qa_chain is None:
        raise HTTPException(status_code=503, detail="RAG pipeline not ready yet")

    # Get answer from RAG pipeline
    result = ask_question(qa_chain, chat_request.question)
    return result