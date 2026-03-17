from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from models.database import engine, Base
from models import user  # noqa: F401 - needed to register the User model
from routers import auth as auth_router
from services.rag import build_rag_pipeline

# Load environment variables from backend/.env
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

# CORS - allows React frontend on port 3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router.router)

# Initialize RAG pipeline lazily on first request
app.state.qa_chain = None

@app.on_event("startup")
async def startup_event():
    try:
        print("Initializing RAG pipeline...")
        app.state.qa_chain = build_rag_pipeline()
        print("RAG pipeline ready.")
    except Exception as e:
        print(f"RAG pipeline not initialized: {e}")
        app.state.qa_chain = None

# Health check route
@app.get("/")
def root():
    return {
        "status": "ClearPath AI backend is running",
        "database_connected": DATABASE_URL is not None,
        "groq_connected": GROQ_API_KEY is not None
    }