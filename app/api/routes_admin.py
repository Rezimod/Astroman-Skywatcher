"""
ASTROMAN Sky Intelligence — Admin Routes
Protected admin panel with observation management.
"""
import json
import logging
from datetime import datetime
from zoneinfo import ZoneInfo

import aiosqlite
from fastapi import APIRouter, Request, Form, Depends, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from starlette.status import HTTP_303_SEE_OTHER

from app.config import settings
from app.database import DB_PATH
from app.services.daily_pipeline import send_daily_notifications, collect_daily_data
from app.services.email_service import send_observation_email
from app.core.astronomy import get_best_visible_planet
from app.core.telescope import recommend_telescope

logger = logging.getLogger("astroman.admin")
router = APIRouter(prefix="/admin")
templates = Jinja2Templates(directory="app/templates")


def _check_auth(request: Request) -> bool:
    """Simple session-based auth check."""
    return request.cookies.get("admin_auth") == settings.app_secret_key


@router.get("", response_class=HTMLResponse)
async def admin_panel(request: Request):
    """Admin dashboard."""
    if not _check_auth(request):
        return templates.TemplateResponse("admin.html", {
            "request": request,
            "authenticated": False,
        })

    # Load stats
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row

        # Subscriber count
        cursor = await db.execute("SELECT COUNT(*) as cnt FROM subscribers WHERE is_active=1")
        row = await cursor.fetchone()
        subscriber_count = row["cnt"]

        # Recent emails
        cursor = await db.execute(
            "SELECT * FROM email_log ORDER BY sent_at DESC LIMIT 20"
        )
        recent_emails = [dict(r) for r in await cursor.fetchall()]

        # Recent observations
        cursor = await db.execute(
            "SELECT date, moon_phase, cloud_coverage, recommended_telescope, is_override FROM observations ORDER BY date DESC LIMIT 7"
        )
        recent_obs = [dict(r) for r in await cursor.fetchall()]

        # Subscribers list
        cursor = await db.execute("SELECT * FROM subscribers ORDER BY created_at DESC")
        subscribers = [dict(r) for r in await cursor.fetchall()]

    return templates.TemplateResponse("admin.html", {
        "request": request,
        "authenticated": True,
        "subscriber_count": subscriber_count,
        "recent_emails": recent_emails,
        "recent_observations": recent_obs,
        "subscribers": subscribers,
    })


@router.post("/login")
async def admin_login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
):
    """Admin login."""
    if username == settings.admin_username and password == settings.admin_password:
        response = RedirectResponse(url="/admin", status_code=HTTP_303_SEE_OTHER)
        response.set_cookie("admin_auth", settings.app_secret_key, httponly=True, max_age=86400)
        return response
    return templates.TemplateResponse("admin.html", {
        "request": request,
        "authenticated": False,
        "error": "არასწორი მომხმარებელი ან პაროლი",
    })


@router.get("/logout")
async def admin_logout():
    """Admin logout."""
    response = RedirectResponse(url="/admin", status_code=HTTP_303_SEE_OTHER)
    response.delete_cookie("admin_auth")
    return response


@router.post("/send-test-email")
async def send_test_email(request: Request, email: str = Form(...)):
    """Send a test observation email."""
    if not _check_auth(request):
        raise HTTPException(401)

    observation = await collect_daily_data()
    best_planet = get_best_visible_planet(observation.planets)
    telescope = recommend_telescope(
        best_planet, observation.cloud_coverage, observation.moon_illumination
    )
    success = await send_observation_email(email, observation, telescope)

    return {"success": success, "email": email}


@router.post("/override-observation")
async def override_observation(
    request: Request,
    date: str = Form(...),
    text: str = Form(...),
):
    """Override observation text for a specific date."""
    if not _check_auth(request):
        raise HTTPException(401)

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE observations SET is_override=1, override_text=? WHERE date=?",
            (text, date),
        )
        await db.commit()

    return RedirectResponse(url="/admin", status_code=HTTP_303_SEE_OTHER)


@router.post("/trigger-daily")
async def trigger_daily(request: Request):
    """Manually trigger the daily pipeline."""
    if not _check_auth(request):
        raise HTTPException(401)

    result = await send_daily_notifications()
    return {"success": True, "result": result}


@router.post("/add-promotion")
async def add_promotion(
    request: Request,
    name: str = Form(...),
    slug: str = Form(...),
    category: str = Form("beginner"),
    description: str = Form(""),
):
    """Add a telescope promotion."""
    if not _check_auth(request):
        raise HTTPException(401)

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """INSERT INTO telescope_promotions (name, slug, category, description, is_active)
               VALUES (?, ?, ?, ?, 1)""",
            (name, slug, category, description),
        )
        await db.commit()

    return RedirectResponse(url="/admin", status_code=HTTP_303_SEE_OTHER)
