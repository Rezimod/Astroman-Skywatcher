"""
Astroman Skywatcher — AI Sky Recap Service
Generates a daily Georgian-language sky summary using Claude AI.
Caches the result per day to avoid redundant API calls.
"""
import logging
from datetime import date
from typing import Optional

import httpx

from app.config import settings

logger = logging.getLogger("astroman.services.ai_recap")

# In-memory daily cache: {date_str: recap_html}
_recap_cache: dict[str, str] = {}


def _build_prompt(observation, visible_planets: list, is_night: bool) -> str:
    vis_names = [p.name_ka for p in visible_planets] if visible_planets else []
    planet_details = []
    for p in visible_planets:
        planet_details.append(
            f"{p.name_ka} ({p.name}): სიმაღლე {round(p.altitude, 1)}°, სიკაშკაშე {p.magnitude} mag, "
            f"თანავარსკვლავედი {p.constellation}"
        )

    return f"""შენ ხარ ASTROMAN-ის ასტრო-გზამკვლევი, მოკლე და ამაღელვებელი ტექსტის ავტორი ქართულ ენაზე.

დღევანდელი მონაცემები თბილისისთვის:
- პლანეტები ცაზე: {', '.join(vis_names) if vis_names else 'ამ მომენტში არ ჩანს'}
- პლანეტების დეტალები: {chr(10).join(planet_details) if planet_details else 'N/A'}
- მთვარე: {round(observation.moon_illumination)}% ({observation.moon_phase})
- ღრუბლიანობა: {observation.cloud_coverage}%
- ტემპერატურა: {round(observation.temperature)}°C
- ქარი: {observation.wind_speed} მ/წმ
- მზის ჩასვლა: {observation.sunset_time}
- ღამის რეჟიმი: {'კი' if is_night else 'არა'}

დაწერე 2-3 მოკლე წინადადება ქართულ ენაზე, რომელიც:
1. ასახავს დღევანდელ ყველაზე საინტერესო ასტრო-სანახაობას (კონკრეტული პლანეტა, ან მთვარე)
2. ამბობს სად ან როგორ მოიძიონ ის ცაზე
3. ახსენებს დაკვირვების პირობებს (ამინდი, მთვარის სინათლე)

ტონი: მღელვარე, მოკლე, ინფორმაციული. გამოიყენე ემოჯი (1-2 ცალი).
პასუხი: მხოლოდ ტექსტი, HTML ან markdown გარეშე."""


async def generate_daily_recap(observation, visible_planets: list, is_night: bool) -> str:
    """
    Returns AI-generated Georgian sky recap for today.
    Result is cached per calendar day; Claude API is called at most once/day.
    Falls back to a template-generated summary if API key is missing or call fails.
    """
    today = str(date.today())

    if today in _recap_cache:
        return _recap_cache[today]

    if not settings.anthropic_api_key:
        summary = _fallback_recap(observation, visible_planets)
        _recap_cache[today] = summary
        return summary

    prompt = _build_prompt(observation, visible_planets, is_night)

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": settings.anthropic_api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-haiku-4-5-20251001",
                    "max_tokens": 300,
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            resp.raise_for_status()
            data = resp.json()
            text = data["content"][0]["text"].strip()
            _recap_cache[today] = text
            logger.info("AI recap generated for %s", today)
            return text
    except Exception as exc:
        logger.warning("AI recap failed (%s), using fallback", exc)
        summary = _fallback_recap(observation, visible_planets)
        _recap_cache[today] = summary
        return summary


def _fallback_recap(observation, visible_planets: list) -> str:
    """Template-based fallback when Claude API is unavailable."""
    count = len(visible_planets)
    moon_pct = round(observation.moon_illumination)
    clouds = observation.cloud_coverage
    temp = round(observation.temperature)

    best = visible_planets[0] if visible_planets else None
    best_str = (
        f" ყველაზე კაშკაშა — {best.name_ka} ({best.magnitude} mag)."
        if best else ""
    )

    cond = (
        "☀️ დღისია — ვარსკვლავები ჩასვლის შემდეგ გამოჩნდება."
        if clouds > 80
        else ("⛅ ნაწილობრივ ღრუბლიანი — დაიმედე გასაქვეთებლად." if clouds > 40 else "🌟 წმინდა ცა — შესანიშნავი პირობები!")
    )

    return (
        f"🔭 დღეს ცაზე {count} პლანეტა ჩანს.{best_str} "
        f"მთვარე {moon_pct}%-ით განათებულია ({observation.moon_phase}). "
        f"{cond} ტემპერატურა: {temp}°C, ღრუბლიანობა: {clouds}%."
    )
