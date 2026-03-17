from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from models.database import engine, Base
from models import user  # noqa: F401
from models import conversation  # noqa: F401
from routers import auth as auth_router
from routers import chat as chat_router
from routers import predictor as predictor_router
# from services.rag import build_rag_pipeline  # temporarily disabled for deployment

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Create all tables in the database
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="ClearPath AI",
    description="AI-powered immigration assistant for international students",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router.router)
app.include_router(chat_router.router)
app.include_router(predictor_router.router)

# RAG startup temporarily disabled for deployment diagnosis
# @app.on_event("startup")
# async def startup_event():
#     try:
#         print("Initializing RAG pipeline...")
#         app.state.qa_chain = build_rag_pipeline()
#         print("RAG pipeline ready.")
#     except Exception as e:
#         print(f"RAG pipeline not initialized: {e}")
#         app.state.qa_chain = None

app.state.qa_chain = None

# Health check route
@app.get("/")
def root():
    return {
        "status": "ClearPath AI backend is running",
        "database_connected": DATABASE_URL is not None,
        "groq_connected": GROQ_API_KEY is not None
    }