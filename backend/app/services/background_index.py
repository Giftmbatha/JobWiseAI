import asyncio
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.ai_matching import get_ai_matcher
import logging

logger = logging.getLogger(__name__)

async def build_initial_index():
    """Build initial AI index on application startup"""
    try:
        logger.info("Building initial AI job index...")
        db = next(get_db())
        matcher = get_ai_matcher()
        matcher.build_job_index_from_db(db, include_external=True)
        logger.info("Initial AI job index built successfully")
    except Exception as e:
        logger.error(f"Failed to build initial index: {e}")

# Call this during your FastAPI startup event