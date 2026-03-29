"""
Astroman Skywatcher — Daily Pipeline
Orchestrates data collection, text generation, and notifications.
"""
import json
import logging
from datetime import datetime
from zoneinfo import ZoneInfo

import aiosqlite

from app.config import settings
from app.database import DB_PATH
from app.models import ObservationData
from app.core.astronomy import (
    get_planet_positions, get_moon_phase,
    get_sunset_time, get_best_visible_planet,
)
from app.core.weather import get_evening_forecast
from app.core.observation import generate_observation_text
from app.core.telescope import recommend_telescope, TelescopeRecommendation
from app.services.email_service import send_observation_email
from app.services.telegram_service import (
    send_telegram_message, format_telegram_observation,
)

logger = logging.getLogger("astroman.pipeline")


async def collect_daily_data() -> ObservationData:
    """Collect all astronomical and weather data for today."""
    tz = ZoneInfo(settings.timezone)
    now = datetime.now(tz)
    date_str = now.strftime("%Y-%m-%d")

    logger.info(f"Collecting data for {date_str}")

    # Astronomy
    planets = get_planet_positions()
    moon_phase, moon_illumination = get_moon_phase()
    sunset_time = get_sunset_time()
    best_planet = get_best_visible_planet(planets)

    # Weather
    weather = await get_evening_forecast()
    cloud_coverage = weather.cloud_coverage if weather else 50
    temperature = weather.temperature if weather else 15.0
    humidity = weather.humidity if weather else 60
    wind_speed = weather.wind_speed if weather else 3.0

    # Generate observation text
    obs_text = generate_observation_text(
        best_planet=best_planet,
        planets=planets,
        moon_phase=moon_phase,
        moon_illumination=moon_illumination,
        sunset_time=sunset_time,
        cloud_coverage=cloud_coverage,
        temperature=temperature,
    )

    # Telescope recommendation
    telescope = recommend_telescope(best_planet, cloud_coverage, moon_illumination)

    best_object_name = best_planet.name_ka if best_planet else ""

    observation = ObservationData(
        date=date_str,
        planets=planets,
        moon_phase=moon_phase,
        moon_illumination=moon_illumination,
        sunset_time=sunset_time,
        cloud_coverage=cloud_coverage,
        temperature=temperature,
        humidity=humidity,
        wind_speed=wind_speed,
        observation_text=obs_text,
        recommended_telescope=telescope.name,
        product_link=telescope.product_url,
        best_object=best_object_name,
    )

    # Save to database
    await _save_observation(observation)

    return observation


async def _save_observation(obs: ObservationData):
    """Persist observation data to SQLite."""
    planets_json = json.dumps(
        [p.model_dump() for p in obs.planets], ensure_ascii=False
    )
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(
                """INSERT OR REPLACE INTO observations
                   (date, planets_data, moon_phase, moon_illumination,
                    sunset_time, cloud_coverage, temperature, humidity,
                    wind_speed, observation_text, recommended_telescope,
                    product_link)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    obs.date, planets_json, obs.moon_phase,
                    obs.moon_illumination, obs.sunset_time,
                    obs.cloud_coverage, obs.temperature,
                    obs.humidity, obs.wind_speed,
                    obs.observation_text, obs.recommended_telescope,
                    obs.product_link,
                ),
            )
            await db.commit()
            logger.info(f"Observation saved for {obs.date}")
    except Exception as e:
        logger.error(f"Error saving observation: {e}")


async def send_daily_notifications():
    """Full daily pipeline: collect data + send to all subscribers."""
    logger.info("Starting daily notification pipeline")

    # 1. Collect data
    observation = await collect_daily_data()

    # 2. Check for admin override
    override_text = await _check_override(observation.date)
    if override_text:
        observation.observation_text = override_text
        logger.info("Using admin override text")

    # 3. Get telescope recommendation
    best_planet = get_best_visible_planet(observation.planets)
    telescope = recommend_telescope(
        best_planet, observation.cloud_coverage, observation.moon_illumination
    )

    # 4. Fetch subscribers
    subscribers = await _get_active_subscribers()
    logger.info(f"Sending to {len(subscribers)} subscribers")

    # 5. Send emails
    sent_count = 0
    for sub in subscribers:
        email = sub["email"]
        success = await send_observation_email(email, observation, telescope)
        if success:
            sent_count += 1
            await _log_email(sub["id"], observation.date, "sent")
        else:
            await _log_email(sub["id"], observation.date, "failed")

    logger.info(f"Emails sent: {sent_count}/{len(subscribers)}")

    # 6. Send Telegram notifications
    if settings.telegram_enabled:
        telegram_subs = [s for s in subscribers if s.get("telegram_chat_id")]
        for sub in telegram_subs:
            msg = format_telegram_observation(
                best_object=observation.best_object,
                moon_phase=observation.moon_phase,
                moon_illumination=observation.moon_illumination,
                sunset_time=observation.sunset_time,
                cloud_coverage=observation.cloud_coverage,
                observation_text=observation.observation_text,
                product_url=telescope.product_url,
                telescope_name=telescope.name,
            )
            await send_telegram_message(sub["telegram_chat_id"], msg)

    return {
        "date": observation.date,
        "subscribers": len(subscribers),
        "sent": sent_count,
        "best_object": observation.best_object,
    }


async def _check_override(date_str: str) -> str | None:
    """Check if there's an admin override for this date."""
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT override_text FROM observations WHERE date=? AND is_override=1",
                (date_str,),
            )
            row = await cursor.fetchone()
            return row["override_text"] if row else None
    except Exception:
        return None


async def _get_active_subscribers() -> list[dict]:
    """Get all active subscribers."""
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT * FROM subscribers WHERE is_active=1"
            )
            rows = await cursor.fetchall()
            return [dict(r) for r in rows]
    except Exception as e:
        logger.error(f"Error fetching subscribers: {e}")
        return []


async def _log_email(subscriber_id: int, date_str: str, status: str):
    """Log email send status."""
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(
                """INSERT INTO email_log (subscriber_id, subject, status)
                   VALUES (?, ?, ?)""",
                (subscriber_id, f"observation-{date_str}", status),
            )
            await db.commit()
    except Exception:
        pass


async def get_today_observation() -> ObservationData | None:
    """Get today's cached observation or generate new one."""
    tz = ZoneInfo(settings.timezone)
    today = datetime.now(tz).strftime("%Y-%m-%d")

    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT * FROM observations WHERE date=?", (today,)
            )
            row = await cursor.fetchone()
            if row:
                planets_data = json.loads(row["planets_data"]) if row["planets_data"] else []
                from app.models import PlanetInfo
                planets = [PlanetInfo(**p) for p in planets_data]
                best = get_best_visible_planet(planets)
                return ObservationData(
                    date=row["date"],
                    planets=planets,
                    moon_phase=row["moon_phase"],
                    moon_illumination=row["moon_illumination"],
                    sunset_time=row["sunset_time"],
                    cloud_coverage=row["cloud_coverage"],
                    temperature=row["temperature"],
                    humidity=row["humidity"],
                    wind_speed=row["wind_speed"],
                    observation_text=row["override_text"] if row["is_override"] else row["observation_text"],
                    recommended_telescope=row["recommended_telescope"],
                    product_link=row["product_link"],
                    best_object=best.name_ka if best else "",
                )
    except Exception as e:
        logger.error(f"Error loading observation: {e}")

    # Generate fresh if not cached
    return await collect_daily_data()
