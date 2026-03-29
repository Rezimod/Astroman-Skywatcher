"""
Astroman Skywatcher — Subscriber Routes
"""
import logging
import aiosqlite
from fastapi import APIRouter, Form, HTTPException
from fastapi.responses import RedirectResponse
from starlette.status import HTTP_303_SEE_OTHER

from app.database import DB_PATH

logger = logging.getLogger("astroman.subscribers")
router = APIRouter(prefix="/api/subscribers")


@router.post("/subscribe")
async def subscribe(
    email: str = Form(...),
    name: str = Form(""),
    level: str = Form("beginner"),
):
    """Subscribe to daily observations."""
    email = email.strip().lower()
    if not email or "@" not in email:
        raise HTTPException(400, "არასწორი ელ-ფოსტის მისამართი")

    try:
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(
                """INSERT OR IGNORE INTO subscribers (email, name, level, is_active)
                   VALUES (?, ?, ?, 1)""",
                (email, name, level),
            )
            # Reactivate if previously unsubscribed
            await db.execute(
                "UPDATE subscribers SET is_active=1 WHERE email=?", (email,)
            )
            await db.commit()
        logger.info(f"New subscriber: {email}")
    except Exception as e:
        logger.error(f"Subscribe error: {e}")
        raise HTTPException(500, "გამოწერის შეცდომა")

    return RedirectResponse(
        url="/subscribe?success=1", status_code=HTTP_303_SEE_OTHER
    )


@router.post("/unsubscribe")
async def unsubscribe(email: str = Form(...)):
    """Unsubscribe from notifications."""
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(
                "UPDATE subscribers SET is_active=0 WHERE email=?",
                (email.strip().lower(),),
            )
            await db.commit()
        logger.info(f"Unsubscribed: {email}")
    except Exception as e:
        logger.error(f"Unsubscribe error: {e}")

    return {"success": True}


@router.get("/count")
async def subscriber_count():
    """Get active subscriber count."""
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "SELECT COUNT(*) as cnt FROM subscribers WHERE is_active=1"
        )
        row = await cursor.fetchone()
        return {"count": row[0]}
