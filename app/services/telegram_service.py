"""
ASTROMAN Sky Intelligence — Telegram Bot Service
Optional Telegram notification integration.
"""
import logging
import httpx
from typing import Optional

from app.config import settings

logger = logging.getLogger("astroman.telegram")

TELEGRAM_API = "https://api.telegram.org/bot{token}"


async def send_telegram_message(
    chat_id: str,
    text: str,
    parse_mode: str = "HTML",
) -> bool:
    """Send a message via Telegram Bot API."""
    if not settings.telegram_enabled or not settings.telegram_bot_token:
        logger.debug("Telegram disabled or token missing")
        return False

    try:
        url = f"{TELEGRAM_API.format(token=settings.telegram_bot_token)}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": parse_mode,
            "disable_web_page_preview": False,
        }
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            logger.info(f"Telegram message sent to {chat_id}")
            return True

    except Exception as e:
        logger.error(f"Telegram send error to {chat_id}: {e}")
        return False


def format_telegram_observation(
    best_object: str,
    moon_phase: str,
    moon_illumination: float,
    sunset_time: str,
    cloud_coverage: int,
    observation_text: str,
    product_url: str,
    telescope_name: str,
) -> str:
    """Format observation data for Telegram."""

    if cloud_coverage <= 20:
        emoji = "🌟"
    elif cloud_coverage <= 50:
        emoji = "⛅"
    else:
        emoji = "☁️"

    msg = f"""<b>🔭 ASTROMAN — ღამის ცის გზამკვლევი</b>

{emoji} <b>დღეს საღამოს:</b> {best_object if best_object else "მთვარის დაკვირვება"}

🌅 მზის ჩასვლა: {sunset_time}
🌙 მთვარე: {moon_phase} ({moon_illumination:.0f}%)
☁️ ღრუბლიანობა: {cloud_coverage}%

━━━━━━━━━━━━━━━━━

{observation_text[:500]}

━━━━━━━━━━━━━━━━━

🔭 რეკომენდებული: <b>{telescope_name}</b>
🛒 <a href="{product_url}">იხილე ტელესკოპი</a>

<i>astroman.ge — ცის ინტელექტი</i>"""

    return msg
