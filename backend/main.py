from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables from backend/.env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

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

# Health check route
@app.get("/")
def root():
    return {
        "status": "ClearPath AI backend is running",
        "database_connected": DATABASE_URL is not None,
        "groq_connected": GROQ_API_KEY is not None
    }