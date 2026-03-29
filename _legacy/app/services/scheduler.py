"""
Astroman Skywatcher — Scheduler
APScheduler-based cron jobs for daily and weekly tasks.

NOTIFICATION ARCHITECTURE (Feature 6):
    Currently uses APScheduler running in-process.
    Future scaling path:
        Phase 1 (current): APScheduler + SQLite → supports ~1000 subscribers
        Phase 2: APScheduler + Redis broker → supports ~10,000 subscribers
        Phase 3: Celery + Redis + separate worker → supports 100,000+ subscribers
    
    Alert Types (designed, not yet fully implemented):
        1. Clear Sky Alert — triggered when cloud % drops below threshold
        2. Planet Rise Alert — triggered N minutes before a planet rises
        3. Special Event Alert — eclipses, conjunctions, meteor showers
    
    To upgrade to Phase 2:
        1. pip install redis celery
        2. Add REDIS_URL to .env
        3. Replace APScheduler jobs with Celery beat schedule
        4. Run: celery -A app.services.celery_worker worker --beat
"""
import asyncio
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from app.config import settings

logger = logging.getLogger("astroman.scheduler")

scheduler = AsyncIOScheduler(timezone=settings.timezone)


# ─────────────────────────────────────────────
# Existing Jobs (preserved)
# ─────────────────────────────────────────────

async def _run_daily_pipeline():
    """Wrapper to run the daily pipeline."""
    from app.services.daily_pipeline import send_daily_notifications
    try:
        result = await send_daily_notifications()
        logger.info(f"Daily pipeline completed: {result}")
    except Exception as e:
        logger.error(f"Daily pipeline error: {e}", exc_info=True)


async def _run_weekly_summary():
    """Placeholder for weekly sky summary."""
    logger.info("Weekly summary job triggered (not yet implemented)")
    # TODO: Implement weekly summary aggregation and email


# ─────────────────────────────────────────────
# NEW: Notification Alert Jobs (Feature 6)
# ─────────────────────────────────────────────

async def _check_clear_sky_alert():
    """
    CLEAR SKY ALERT — Check every 30 min if sky has cleared.

    Logic:
        1. Fetch current weather for Tbilisi
        2. If cloud_coverage < settings.clear_sky_alert_threshold
           AND it wasn't clear 30 min ago → trigger alert
        3. Send notification to subscribers who opted in

    Future: This should run as a Celery task with Redis state tracking
    to avoid duplicate alerts within the same clear-sky window.
    """
    if not settings.notifications_enabled:
        return

    try:
        from app.core.weather import get_current_weather
        weather = await get_current_weather()
        if weather is None:
            return

        threshold = settings.clear_sky_alert_threshold
        if weather.cloud_coverage <= threshold:
            logger.info(
                f"🌟 Clear sky detected: {weather.cloud_coverage}% clouds "
                f"(threshold: {threshold}%). Alert would fire here."
            )
            # TODO Phase 2: Check last_alert_sent timestamp in Redis/SQLite
            # TODO Phase 2: Send push to opted-in subscribers
            # TODO Phase 2: Record alert timestamp to prevent duplicates
        else:
            logger.debug(f"Sky check: {weather.cloud_coverage}% clouds — no alert")

    except Exception as e:
        logger.error(f"Clear sky alert check error: {e}")


async def _check_planet_rise_alerts():
    """
    PLANET RISE ALERT — Check if any major planet is about to rise.

    Logic:
        1. Calculate rise times for Jupiter, Saturn, Venus, Mars
        2. If any rise within next 30–60 min → trigger alert
        3. Send notification: "[პლანეტა] 30 წუთში ამოვა!"

    Future: Per-subscriber planet watchlists stored in SQLite.
    """
    if not settings.planet_rise_alert_enabled:
        return

    try:
        from app.core.astronomy import get_planet_positions_live
        from zoneinfo import ZoneInfo
        from datetime import datetime

        tz = ZoneInfo(settings.timezone)
        now = datetime.now(tz)
        planets = get_planet_positions_live(
            settings.location_lat, settings.location_lon, tz
        )

        for planet in planets:
            if planet.rise_time and planet.rise_time != "N/A":
                # Parse rise time and check if within next 30-60 min
                try:
                    rise_hour, rise_min = map(int, planet.rise_time.split(":"))
                    rise_minutes = rise_hour * 60 + rise_min
                    now_minutes = now.hour * 60 + now.minute
                    diff = rise_minutes - now_minutes

                    if 30 <= diff <= 60:
                        logger.info(
                            f"🪐 Planet rise alert: {planet.name_ka} rises in "
                            f"~{diff} min ({planet.rise_time})"
                        )
                        # TODO Phase 2: Send notification
                        # TODO Phase 2: Check subscriber watchlists
                except ValueError:
                    pass

    except Exception as e:
        logger.error(f"Planet rise alert check error: {e}")


# ─────────────────────────────────────────────
# Scheduler Management
# ─────────────────────────────────────────────

def start_scheduler():
    """Start all scheduled jobs."""
    # ── Daily observation email ──
    scheduler.add_job(
        _run_daily_pipeline,
        CronTrigger(
            hour=settings.daily_send_hour,
            minute=settings.daily_send_minute,
            timezone=settings.timezone,
        ),
        id="daily_observation",
        name="Daily Sky Observation",
        replace_existing=True,
    )

    # ── Weekly summary (Monday by default) ──
    scheduler.add_job(
        _run_weekly_summary,
        CronTrigger(
            day_of_week=settings.weekly_summary_day,
            hour=10,
            minute=0,
            timezone=settings.timezone,
        ),
        id="weekly_summary",
        name="Weekly Sky Summary",
        replace_existing=True,
    )

    # ── Clear Sky Alert (every 30 min, evening hours only) ──
    if settings.notifications_enabled:
        scheduler.add_job(
            _check_clear_sky_alert,
            IntervalTrigger(minutes=30, timezone=settings.timezone),
            id="clear_sky_alert",
            name="Clear Sky Alert Check",
            replace_existing=True,
        )
        logger.info(
            f"Clear sky alerts enabled (threshold: "
            f"{settings.clear_sky_alert_threshold}% clouds)"
        )

    # ── Planet Rise Alert (every 15 min) ──
    if settings.planet_rise_alert_enabled:
        scheduler.add_job(
            _check_planet_rise_alerts,
            IntervalTrigger(minutes=15, timezone=settings.timezone),
            id="planet_rise_alert",
            name="Planet Rise Alert Check",
            replace_existing=True,
        )
        logger.info("Planet rise alerts enabled")

    scheduler.start()
    logger.info(
        f"Scheduler started — daily at {settings.daily_send_hour}:"
        f"{settings.daily_send_minute:02d} ({settings.timezone})"
    )


def stop_scheduler():
    """Gracefully stop the scheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")


def get_scheduler_status() -> dict:
    """Return current job status for admin panel."""
    jobs = []
    for job in scheduler.get_jobs():
        jobs.append({
            "id": job.id,
            "name": job.name,
            "next_run": str(job.next_run_time) if job.next_run_time else None,
            "trigger": str(job.trigger),
        })
    return {
        "running": scheduler.running,
        "timezone": settings.timezone,
        "jobs": jobs,
    }
