"""
ASTROMAN Sky Intelligence — Real-Time Sky API

GET /api/sky/live?lat=...&lon=...

Returns complete real-time sky data for any location:
    - Visible planets with rise/set/transit times
    - Moon phase + position
    - Sun rise/set + is_night
    - Best viewing window
    - Visibility score (integrated from visibility engine)
    - Smart telescope advisor recommendation
"""
import logging
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Query

from app.config import settings
from app.core.astronomy import (
    get_planet_positions_live,
    get_moon_live,
    get_sun_times,
    get_best_visible_planet_live,
    get_best_viewing_window,
)
from app.core.weather import get_weather_at
from app.core.visibility import calculate_visibility_score
from app.core.observation import recommend_telescope_smart
from app.models import SkyLiveResponse

logger = logging.getLogger("astroman.api.sky")

router = APIRouter(prefix="/api/sky", tags=["Sky Live"])


@router.get("/live")
async def sky_live(
    lat: float = Query(
        default=settings.location_lat,
        ge=-90, le=90,
        description="Latitude (-90 to 90). Defaults to Tbilisi.",
    ),
    lon: float = Query(
        default=settings.location_lon,
        ge=-180, le=180,
        description="Longitude (-180 to 180). Defaults to Tbilisi.",
    ),
):
    """
    Real-time sky visibility for any location.

    Returns planets, moon, sun, visibility score, and telescope advisor.
    Defaults to Tbilisi (41.7151, 44.8271) if no coordinates provided.
    """
    tz = ZoneInfo(settings.timezone)
    now = datetime.now(tz)

    # ── Astronomy ──
    planets = get_planet_positions_live(lat, lon, tz)
    moon = get_moon_live(lat, lon, tz)
    sun = get_sun_times(lat, lon, tz)
    best_planet = get_best_visible_planet_live(planets)
    viewing_window = get_best_viewing_window(lat, lon, tz)

    visible = [p for p in planets if p.is_visible]

    # ── Weather ──
    weather = await get_weather_at(lat, lon)
    cloud_pct = weather.cloud_coverage if weather else 50
    humidity_pct = weather.humidity if weather else 60
    wind_speed = weather.wind_speed if weather else 3.0

    # ── Visibility Score (Feature 2) ──
    vis_score = calculate_visibility_score(
        cloud_pct=cloud_pct,
        humidity_pct=humidity_pct,
        wind_speed=wind_speed,
        moon_illumination=moon.illumination,
    )

    # ── Smart Advisor (Feature 4) ──
    target_object = best_planet.name if best_planet else "Moon"
    advisor = recommend_telescope_smart(target_object, vis_score.score)

    # ── Location label ──
    is_default = (
        abs(lat - settings.location_lat) < 0.01
        and abs(lon - settings.location_lon) < 0.01
    )
    location_name = settings.location_name if is_default else f"{lat:.4f}, {lon:.4f}"

    return SkyLiveResponse(
        timestamp=now.isoformat(),
        location={
            "lat": lat,
            "lon": lon,
            "name": location_name,
            "timezone": settings.timezone,
        },
        sun=sun,
        moon=moon,
        planets=planets,
        visible_planets=visible,
        best_object=best_planet,
        best_viewing_window=viewing_window,
        visibility=vis_score.model_dump(),
        advisor=advisor.model_dump(),
    )


@router.get("/visibility")
async def sky_visibility(
    lat: float = Query(default=settings.location_lat, ge=-90, le=90),
    lon: float = Query(default=settings.location_lon, ge=-180, le=180),
):
    """
    Standalone visibility score endpoint.
    Useful for quick "should I go outside tonight?" checks.
    """
    weather = await get_weather_at(lat, lon)
    _, moon_illum = None, 0.0

    # Get moon illumination
    moon = get_moon_live(lat, lon)

    if not weather:
        return {"error": "ამინდის მონაცემები მიუწვდომელია", "score": None}

    score = calculate_visibility_score(
        cloud_pct=weather.cloud_coverage,
        humidity_pct=weather.humidity,
        wind_speed=weather.wind_speed,
        moon_illumination=moon.illumination,
    )
    return score.model_dump()


@router.get("/advisor")
async def sky_advisor(
    target: str = Query(
        default="Moon",
        description="Celestial object name (e.g. Jupiter, Saturn, Moon, Orion Nebula)",
    ),
    visibility_score: int = Query(
        default=70,
        ge=0, le=100,
        description="Current visibility score (0-100). Use /api/sky/visibility to get this.",
    ),
):
    """
    Smart observation advisor.
    Given a target object and visibility conditions, recommends equipment.
    """
    advisor = recommend_telescope_smart(target, visibility_score)
    return advisor.model_dump()
