"""
ASTROMAN Sky Intelligence — Dashboard Routes
Public-facing observation panel.
"""
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from app.config import settings
from app.services.daily_pipeline import get_today_observation, collect_daily_data
from app.core.astronomy import get_best_visible_planet, get_sun_times
from app.core.telescope import recommend_telescope
from app.core.weather import get_current_weather

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")


@router.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Main dashboard — today's sky observation."""
    observation = await get_today_observation()
    if not observation:
        observation = await collect_daily_data()

    # Always fetch live weather — overrides the daily DB cache so data is never stale
    try:
        live_weather = await get_current_weather()
        if live_weather:
            observation.cloud_coverage = live_weather.cloud_coverage
            observation.temperature = live_weather.temperature
            observation.humidity = live_weather.humidity
            observation.wind_speed = live_weather.wind_speed
    except Exception:
        pass  # Keep cached weather if live fetch fails

    best_planet = get_best_visible_planet(observation.planets)
    telescope = recommend_telescope(
        best_planet, observation.cloud_coverage, observation.moon_illumination
    )
    visible_planets = [p for p in observation.planets if p.is_visible]

    # Day / Night / Twilight detection
    try:
        tz = ZoneInfo(settings.timezone)
        now = datetime.now(tz)
        sun = get_sun_times(settings.location_lat, settings.location_lon, tz)
        is_night = sun["is_night"]
        is_twilight = sun.get("is_civil_twilight", False)
        current_time = now.strftime("%H:%M:%S")
    except Exception:
        sun = {"rise": "N/A", "set": "N/A", "altitude": 0, "is_night": True, "is_civil_twilight": False}
        is_night = True
        is_twilight = False
        current_time = "00:00:00"

    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "observation": observation,
        "visible_planets": visible_planets,
        "best_planet": best_planet,
        "telescope": telescope,
        "is_night": is_night,
        "is_twilight": is_twilight,
        "current_time": current_time,
        "sun": sun,
    })


@router.get("/subscribe", response_class=HTMLResponse)
async def subscribe_page(request: Request):
    """Subscription page."""
    return templates.TemplateResponse("subscribe.html", {
        "request": request,
    })
