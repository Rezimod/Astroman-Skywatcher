"""
ASTROMAN Sky Intelligence — REST API
Programmatic access to observation data.
"""
import json
import logging
from datetime import datetime
from zoneinfo import ZoneInfo

import aiosqlite
from fastapi import APIRouter, HTTPException

from app.config import settings
from app.database import DB_PATH
from app.services.daily_pipeline import collect_daily_data, get_today_observation
from app.core.astronomy import (
    get_planet_positions, get_moon_phase, get_sunset_time,
    get_best_visible_planet,
)
from app.core.weather import get_current_weather, get_evening_forecast
from app.core.telescope import recommend_telescope

logger = logging.getLogger("astroman.api")
router = APIRouter(prefix="/api/v1")


@router.get("/observation/today")
async def api_today_observation():
    """Get today's full observation data."""
    obs = await get_today_observation()
    if not obs:
        obs = await collect_daily_data()
    return obs.model_dump()


@router.get("/planets")
async def api_planets():
    """Get current planet positions."""
    planets = get_planet_positions()
    return {
        "location": settings.location_name,
        "planets": [p.model_dump() for p in planets],
        "visible": [p.model_dump() for p in planets if p.is_visible],
    }


@router.get("/moon")
async def api_moon():
    """Get current moon phase."""
    phase, illumination = get_moon_phase()
    return {
        "phase": phase,
        "illumination": illumination,
    }


@router.get("/weather")
async def api_weather():
    """Get current weather conditions."""
    weather = await get_current_weather()
    if not weather:
        raise HTTPException(503, "ამინდის მონაცემები მიუწვდომელია")
    return {
        "cloud_coverage": weather.cloud_coverage,
        "temperature": weather.temperature,
        "humidity": weather.humidity,
        "wind_speed": weather.wind_speed,
        "description": weather.description_ka,
        "observation_quality": weather.observation_quality,
        "visibility_km": weather.visibility_km,
    }


@router.get("/recommendation")
async def api_recommendation():
    """Get telescope recommendation for tonight."""
    planets = get_planet_positions()
    best_planet = get_best_visible_planet(planets)
    _, moon_illum = get_moon_phase()
    weather = await get_evening_forecast()
    clouds = weather.cloud_coverage if weather else 50

    telescope = recommend_telescope(best_planet, clouds, moon_illum)
    return {
        "telescope": telescope.name,
        "category": telescope.category,
        "reason": telescope.reason_ka,
        "product_url": telescope.product_url,
        "best_object": best_planet.name_ka if best_planet else "მთვარე",
    }


@router.get("/observations/history")
async def api_observation_history(days: int = 7):
    """Get observation history."""
    if days > 30:
        days = 30
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT date, moon_phase, moon_illumination, cloud_coverage, "
                "recommended_telescope, sunset_time FROM observations "
                "ORDER BY date DESC LIMIT ?",
                (days,),
            )
            rows = await cursor.fetchall()
            return {"observations": [dict(r) for r in rows]}
    except Exception as e:
        logger.error(f"History fetch error: {e}")
        return {"observations": []}


@router.get("/health")
async def health_check():
    """Service health check."""
    from app.services.scheduler import get_scheduler_status
    return {
        "status": "ok",
        "service": "ASTROMAN Sky Intelligence",
        "version": "2.0.0",
        "timezone": settings.timezone,
        "location": settings.location_name,
        "features": {
            "sky_live_api": True,
            "visibility_engine": True,
            "woocommerce": bool(settings.woo_api_url),
            "smart_advisor": True,
            "notifications": settings.notifications_enabled,
            "telegram": settings.telegram_enabled,
        },
        "scheduler": get_scheduler_status(),
    }
