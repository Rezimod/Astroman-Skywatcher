"""
Astroman Skywatcher — Weather Service
OpenWeather API integration for observation conditions.
Falls back to Open-Meteo (free, no key required) when no OpenWeather key is set.
"""
import httpx
import logging
from typing import Optional
from dataclasses import dataclass

from app.config import settings

logger = logging.getLogger("astroman.weather")

OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"
OPENWEATHER_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"
OPENMETEO_URL = "https://api.open-meteo.com/v1/forecast"


# ─────────────────────────────────────────────
# Data class — defined first so all functions can reference it
# ─────────────────────────────────────────────

@dataclass
class WeatherData:
    cloud_coverage: int  # 0-100
    temperature: float   # Celsius
    humidity: int        # 0-100
    wind_speed: float    # m/s
    description: str
    description_ka: str
    is_clear: bool
    visibility_km: float

    @property
    def observation_quality(self) -> str:
        """Rate observation quality based on weather."""
        if self.cloud_coverage <= 10:
            return "შესანიშნავი"
        elif self.cloud_coverage <= 30:
            return "კარგი"
        elif self.cloud_coverage <= 60:
            return "საშუალო"
        elif self.cloud_coverage <= 80:
            return "ცუდი"
        else:
            return "არაკეთილსასურველი"


# ─────────────────────────────────────────────
# Description maps
# ─────────────────────────────────────────────

WEATHER_DESCRIPTIONS_KA = {
    "clear sky": "წმინდა ცა",
    "few clouds": "მცირე ღრუბლიანობა",
    "scattered clouds": "ნაწილობრივ ღრუბლიანი",
    "broken clouds": "ღრუბლიანი",
    "overcast clouds": "სრულად ღრუბლიანი",
    "light rain": "მსუბუქი წვიმა",
    "moderate rain": "ზომიერი წვიმა",
    "heavy intensity rain": "ძლიერი წვიმა",
    "thunderstorm": "ჭექა-ქუხილი",
    "snow": "თოვლი",
    "mist": "ნისლი",
    "fog": "ნისლი",
    "haze": "ბურუსი",
}

# WMO weather code → (english description, georgian description)
WMO_CODES: dict[int, tuple[str, str]] = {
    0:  ("clear sky",             "წმინდა ცა"),
    1:  ("mainly clear",          "ძირითადად წმინდა"),
    2:  ("partly cloudy",         "ნაწილობრივ ღრუბლიანი"),
    3:  ("overcast clouds",       "სრულად ღრუბლიანი"),
    45: ("fog",                   "ნისლი"),
    48: ("icy fog",               "ყინულოვანი ნისლი"),
    51: ("light drizzle",         "მსუბუქი ნამქერი"),
    53: ("moderate drizzle",      "ზომიერი ნამქერი"),
    55: ("heavy drizzle",         "ძლიერი ნამქერი"),
    61: ("light rain",            "მსუბუქი წვიმა"),
    63: ("moderate rain",         "ზომიერი წვიმა"),
    65: ("heavy intensity rain",  "ძლიერი წვიმა"),
    71: ("light snow",            "მსუბუქი თოვლი"),
    73: ("moderate snow",         "ზომიერი თოვლი"),
    75: ("heavy snow",            "ძლიერი თოვლი"),
    77: ("snow grains",           "ფიფქი"),
    80: ("light rain",            "მსუბუქი ხანმოკლე წვიმა"),
    81: ("moderate rain",         "ზომიერი ხანმოკლე წვიმა"),
    82: ("heavy intensity rain",  "ძლიერი ხანმოკლე წვიმა"),
    85: ("light snow",            "მსუბუქი ხანმოკლე თოვლი"),
    86: ("heavy snow",            "ძლიერი ხანმოკლე თოვლი"),
    95: ("thunderstorm",          "ჭექა-ქუხილი"),
    96: ("thunderstorm",          "ჭექა-ქუხილი სეტყვით"),
    99: ("thunderstorm",          "ჭექა-ქუხილი ძლიერი სეტყვით"),
}


# ─────────────────────────────────────────────
# Open-Meteo fallback (free, no API key)
# ─────────────────────────────────────────────

async def _get_weather_openmeteo(lat: float, lon: float) -> Optional[WeatherData]:
    """Fetch live weather from Open-Meteo — free, no API key required."""
    try:
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,precipitation,cloud_cover,wind_speed_10m,weather_code",
            "wind_speed_unit": "ms",
            "timezone": "auto",
        }
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(OPENMETEO_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        current = data.get("current", {})
        cloud_cover = int(current.get("cloud_cover", 20))
        temperature = float(current.get("temperature_2m", 15.0))
        humidity = int(current.get("relative_humidity_2m", 60))
        wind_speed = float(current.get("wind_speed_10m", 3.0))
        weather_code = int(current.get("weather_code", 1))

        desc_en, desc_ka = WMO_CODES.get(weather_code, ("partly cloudy", "ნაწილობრივ ღრუბლიანი"))

        return WeatherData(
            cloud_coverage=cloud_cover,
            temperature=round(temperature, 1),
            humidity=humidity,
            wind_speed=round(wind_speed, 1),
            description=desc_en,
            description_ka=desc_ka,
            is_clear=cloud_cover <= 30,
            visibility_km=10.0,
        )
    except Exception as e:
        logger.error(f"Open-Meteo fetch error: {e}")
        return None


# ─────────────────────────────────────────────
# Primary weather functions
# ─────────────────────────────────────────────

async def get_current_weather() -> Optional[WeatherData]:
    """Fetch current weather data for Tbilisi."""
    if not settings.openweather_api_key:
        logger.info("OpenWeather API key not set — using Open-Meteo (free, no key required)")
        return await _get_weather_openmeteo(settings.location_lat, settings.location_lon)

    try:
        params = {
            "lat": settings.location_lat,
            "lon": settings.location_lon,
            "appid": settings.openweather_api_key,
            "units": "metric",
            "lang": "en",
        }
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(OPENWEATHER_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        clouds = data.get("clouds", {}).get("all", 0)
        main = data.get("main", {})
        wind = data.get("wind", {})
        weather_desc = data.get("weather", [{}])[0].get("description", "")
        visibility = data.get("visibility", 10000) / 1000

        desc_ka = WEATHER_DESCRIPTIONS_KA.get(weather_desc, weather_desc)

        return WeatherData(
            cloud_coverage=clouds,
            temperature=main.get("temp", 0),
            humidity=main.get("humidity", 0),
            wind_speed=wind.get("speed", 0),
            description=weather_desc,
            description_ka=desc_ka,
            is_clear=clouds <= 30,
            visibility_km=round(visibility, 1),
        )

    except httpx.HTTPError as e:
        logger.error(f"OpenWeather API error: {e}")
        return None
    except Exception as e:
        logger.error(f"Weather fetch error: {e}")
        return None


async def get_evening_forecast() -> Optional[WeatherData]:
    """Fetch evening forecast (18:00-23:00) for today."""
    if not settings.openweather_api_key:
        return await get_current_weather()

    try:
        params = {
            "lat": settings.location_lat,
            "lon": settings.location_lon,
            "appid": settings.openweather_api_key,
            "units": "metric",
            "cnt": 8,
        }
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(OPENWEATHER_FORECAST_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        best = None
        for item in data.get("list", []):
            dt_txt = item.get("dt_txt", "")
            hour = int(dt_txt.split(" ")[1].split(":")[0]) if " " in dt_txt else 0
            if 17 <= hour <= 22:
                best = item
                break

        if not best:
            best = data.get("list", [{}])[-1]

        clouds = best.get("clouds", {}).get("all", 0)
        main = best.get("main", {})
        wind = best.get("wind", {})
        weather_desc = best.get("weather", [{}])[0].get("description", "")
        visibility = best.get("visibility", 10000) / 1000

        desc_ka = WEATHER_DESCRIPTIONS_KA.get(weather_desc, weather_desc)

        return WeatherData(
            cloud_coverage=clouds,
            temperature=main.get("temp", 0),
            humidity=main.get("humidity", 0),
            wind_speed=wind.get("speed", 0),
            description=weather_desc,
            description_ka=desc_ka,
            is_clear=clouds <= 30,
            visibility_km=round(visibility, 1),
        )

    except Exception as e:
        logger.error(f"Forecast fetch error: {e}")
        return await get_current_weather()


# ─────────────────────────────────────────────
# Location-parametric weather
# ─────────────────────────────────────────────

async def get_weather_at(lat: float, lon: float) -> Optional[WeatherData]:
    """
    Fetch current weather for any lat/lon.
    Used by the real-time sky API (GET /api/sky/live).
    """
    if not settings.openweather_api_key:
        logger.info("OpenWeather API key not set — using Open-Meteo for custom location")
        return await _get_weather_openmeteo(lat, lon)

    try:
        params = {
            "lat": lat,
            "lon": lon,
            "appid": settings.openweather_api_key,
            "units": "metric",
            "lang": "en",
        }
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(OPENWEATHER_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        clouds = data.get("clouds", {}).get("all", 0)
        main = data.get("main", {})
        wind = data.get("wind", {})
        weather_desc = data.get("weather", [{}])[0].get("description", "")
        visibility = data.get("visibility", 10000) / 1000

        desc_ka = WEATHER_DESCRIPTIONS_KA.get(weather_desc, weather_desc)

        return WeatherData(
            cloud_coverage=clouds,
            temperature=main.get("temp", 0),
            humidity=main.get("humidity", 0),
            wind_speed=wind.get("speed", 0),
            description=weather_desc,
            description_ka=desc_ka,
            is_clear=clouds <= 30,
            visibility_km=round(visibility, 1),
        )

    except Exception as e:
        logger.error(f"Weather fetch error for ({lat},{lon}): {e}")
        return None
