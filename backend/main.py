import logging
import sys

# Set up logging to stdout so Render can capture it
logging.basicConfig(
    stream=sys.stdout,
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

logger.info("Starting imports...")

try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from dotenv import load_dotenv
    import os
    logger.info("FastAPI imports OK")
except Exception as e:
    logger.error(f"FastAPI import failed: {e}")
    sys.exit(1)

try:
    from models.database import engine, Base
    from models import user  # noqa: F401
    from models import conversation  # noqa: F401
    logger.info("Models imports OK")
except Exception as e:
    logger.error(f"Models import failed: {e}")
    sys.exit(1)

try:
    from routers import auth as auth_router
    logger.info("Auth router OK")
except Exception as e:
    logger.error(f"Auth router import failed: {e}")
    sys.exit(1)

try:
    from routers import chat as chat_router
    logger.info("Chat router OK")
except Exception as e:
    logger.error(f"Chat router import failed: {e}")
    sys.exit(1)

try:
    from routers import predictor as predictor_router
    logger.info("Predictor router OK")
except Exception as e:
    logger.error(f"Predictor router import failed: {e}")
    sys.exit(1)

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

logger.info("Creating database tables...")
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created OK")
except Exception as e:
    logger.error(f"Database table creation failed: {e}")
    sys.exit(1)

app = FastAPI(
    title="ClearPath AI",
    description="AI-powered immigration assistant for international students",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(chat_router.router)
app.include_router(predictor_router.router)

app.state.qa_chain = None

@app.get("/")
def root():
    return {
        "status": "ClearPath AI backend is running",
        "database_connected": DATABASE_URL is not None,
        "groq_connected": GROQ_API_KEY is not None
    }

logger.info("App initialized successfully")