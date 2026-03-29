"""
Astroman Skywatcher — Visibility Score Engine

Calculates a 0–100 observation visibility score from weather conditions
and moon brightness. The formula is intentionally simple and tunable.

Score Weights (adjustable):
    Cloud coverage:   40%  (primary factor)
    Humidity:         20%  (high humidity = haze/dew)
    Wind speed:       15%  (vibration + turbulence)
    Moon brightness:  25%  (light pollution from moon)
"""
import logging
from dataclasses import dataclass
from app.models import VisibilityScore

logger = logging.getLogger("astroman.visibility")

# ─────────────────────────────────────────────
# Tunable Weights — must sum to 1.0
# ─────────────────────────────────────────────
W_CLOUDS = 0.40
W_HUMIDITY = 0.20
W_WIND = 0.15
W_MOON = 0.25

# Thresholds
MAX_WIND_GOOD = 25.0      # m/s — above this, visibility is heavily degraded
HUMIDITY_THRESHOLD = 85    # % — above this, severe haze expected


def _score_clouds(cloud_pct: int) -> float:
    """0 clouds → 100, 100 clouds → 0. Linear inverse."""
    return max(0.0, 100.0 - cloud_pct)


def _score_humidity(humidity_pct: int) -> float:
    """
    Below 60% → perfect (100).
    60–85% → gradual decline.
    Above 85% → heavy penalty.
    """
    if humidity_pct <= 60:
        return 100.0
    elif humidity_pct <= HUMIDITY_THRESHOLD:
        # Linear from 100 → 30 over 60%→85%
        return 100.0 - ((humidity_pct - 60) / 25.0) * 70.0
    else:
        # 85%+ → drops to 0–30 range
        return max(0.0, 30.0 - ((humidity_pct - HUMIDITY_THRESHOLD) / 15.0) * 30.0)


def _score_wind(wind_speed: float) -> float:
    """
    0–5 m/s → 100 (calm).
    5–15 m/s → linear decline to 50 (moderate turbulence).
    15–25 m/s → decline to 10 (strong vibration).
    25+ → 0.
    """
    if wind_speed <= 5:
        return 100.0
    elif wind_speed <= 15:
        return 100.0 - ((wind_speed - 5) / 10.0) * 50.0
    elif wind_speed <= MAX_WIND_GOOD:
        return 50.0 - ((wind_speed - 15) / 10.0) * 40.0
    return 0.0


def _score_moon(moon_illumination: float) -> float:
    """
    New moon (0%) → 100 (no light pollution).
    Full moon (100%) → 15 (planets still visible, DSOs washed out).
    """
    return max(15.0, 100.0 - (moon_illumination * 0.85))


def _grade_from_score(score: int) -> str:
    """A/B/C/D/F grading."""
    if score >= 80:
        return "A"
    elif score >= 60:
        return "B"
    elif score >= 40:
        return "C"
    elif score >= 20:
        return "D"
    return "F"


def _recommendation_from_score(score: int) -> tuple[str, str]:
    """Return (english, georgian) recommendation text."""
    if score >= 80:
        return "Excellent", "შესანიშნავი"
    elif score >= 60:
        return "Good", "კარგი"
    elif score >= 40:
        return "Moderate", "საშუალო"
    elif score >= 20:
        return "Poor", "ცუდი"
    return "Not Recommended", "არ არის რეკომენდებული"


def _generate_tips(
    cloud_pct: int,
    humidity_pct: int,
    wind_speed: float,
    moon_illumination: float,
    score: int,
) -> list[str]:
    """Generate actionable observation tips based on conditions."""
    tips = []

    if cloud_pct > 60:
        tips.append("ღრუბლიანობა მაღალია — შეიძლება ღრუბლებს შორის დაკვირვება")
    if humidity_pct > 80:
        tips.append("მაღალი ტენიანობა — ლინზის ბუროზე გადასვლა შესაძლებელია, Anti-dew ზოლის გამოყენება რეკომენდებულია")
    if wind_speed > 10:
        tips.append("ქარი ძლიერია — დაბალი გადიდება რეკომენდებულია ვიბრაციის შესამცირებლად")
    if moon_illumination > 70:
        tips.append("ნათელი მთვარე — პლანეტები და ორმაგი ვარსკვლავები მაინც კარგად ჩანს")
    if score >= 80:
        tips.append("იდეალური ღამეა ღრმა კოსმოსის ობიექტებისთვის (ნისლეულები, გალაქტიკები)")
    if score < 30:
        tips.append("ASTROMAN Galaxy Projector — საუკეთესო არჩევანია ასეთ ღამეს")

    return tips


def calculate_visibility_score(
    cloud_pct: int,
    humidity_pct: int,
    wind_speed: float,
    moon_illumination: float,
) -> VisibilityScore:
    """
    Main entry point. Calculate composite visibility score.

    Args:
        cloud_pct:          0–100 cloud coverage percentage
        humidity_pct:       0–100 relative humidity
        wind_speed:         m/s wind speed
        moon_illumination:  0–100 moon illumination percentage

    Returns:
        VisibilityScore with score, grade, recommendation, factors, tips
    """
    # Individual factor scores (each 0–100)
    s_clouds = _score_clouds(cloud_pct)
    s_humidity = _score_humidity(humidity_pct)
    s_wind = _score_wind(wind_speed)
    s_moon = _score_moon(moon_illumination)

    # Weighted composite
    raw = (
        s_clouds * W_CLOUDS
        + s_humidity * W_HUMIDITY
        + s_wind * W_WIND
        + s_moon * W_MOON
    )
    score = max(0, min(100, round(raw)))

    grade = _grade_from_score(score)
    rec_en, rec_ka = _recommendation_from_score(score)
    tips = _generate_tips(cloud_pct, humidity_pct, wind_speed, moon_illumination, score)

    return VisibilityScore(
        score=score,
        grade=grade,
        recommendation=rec_en,
        recommendation_ka=rec_ka,
        factors={
            "clouds": {"value": cloud_pct, "score": round(s_clouds, 1), "weight": W_CLOUDS},
            "humidity": {"value": humidity_pct, "score": round(s_humidity, 1), "weight": W_HUMIDITY},
            "wind": {"value": round(wind_speed, 1), "score": round(s_wind, 1), "weight": W_WIND},
            "moon": {"value": round(moon_illumination, 1), "score": round(s_moon, 1), "weight": W_MOON},
        },
        tips=tips,
    )
