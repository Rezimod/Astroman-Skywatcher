"""
ASTROMAN Sky Intelligence — Astronomy Engine
Uses Skyfield and Ephem for accurate astronomical calculations.
Supports both default (Tbilisi) and arbitrary lat/lon queries.
"""
import ephem
import logging
import math
from datetime import datetime, timedelta
from typing import Optional
from zoneinfo import ZoneInfo

from app.config import settings
from app.models import PlanetInfo, PlanetLiveInfo, MoonLiveInfo

logger = logging.getLogger("astroman.astronomy")

# Planet name mapping
PLANETS = {
    "Mercury": ("მერკური", ephem.Mercury),
    "Venus": ("ვენერა", ephem.Venus),
    "Mars": ("მარსი", ephem.Mars),
    "Jupiter": ("იუპიტერი", ephem.Jupiter),
    "Saturn": ("სატურნი", ephem.Saturn),
    "Uranus": ("ურანი", ephem.Uranus),
    "Neptune": ("ნეპტუნი", ephem.Neptune),
}

MOON_PHASES_KA = {
    "New Moon": "ახალი მთვარე",
    "Waxing Crescent": "მზარდი ნამგალი",
    "First Quarter": "პირველი მეოთხედი",
    "Waxing Gibbous": "მზარდი სავსე",
    "Full Moon": "სავსე მთვარე",
    "Waning Gibbous": "კლებადი სავსე",
    "Last Quarter": "ბოლო მეოთხედი",
    "Waning Crescent": "კლებადი ნამგალი",
}

MOON_PHASES_EN = {v: k for k, v in MOON_PHASES_KA.items()}

CONSTELLATION_MAP = {
    "Ari": "ვერძი", "Tau": "კურო", "Gem": "ტყუპები",
    "Cnc": "კირჩხიბი", "Leo": "ლომი", "Vir": "ქალწული",
    "Lib": "სასწორი", "Sco": "ღრიანკალი", "Sgr": "მშვილდოსანი",
    "Cap": "თხის რქა", "Aqr": "მერწყული", "Psc": "თევზები",
    "Oph": "გველის მტარებელი", "Aql": "არწივი", "Cyg": "გედი",
    "Lyr": "ლირა", "Ori": "ორიონი", "UMa": "დიდი დათვი",
    "Cas": "კასიოპეა", "And": "ანდრომედა",
}

# Magnification guide (used by both observation.py and live API)
MAGNIFICATION_GUIDE = {
    "Mercury": {"min": 50, "max": 100, "note": "მცირე დისკი, რთული სამიზნე"},
    "Venus": {"min": 30, "max": 100, "note": "ფაზები ჩანს უკვე 30x-ზე"},
    "Mars": {"min": 100, "max": 250, "note": "ზედაპირის დეტალებისთვის საჭიროა მაღალი გადიდება"},
    "Jupiter": {"min": 40, "max": 200, "note": "ზოლები და თანამგზავრები ჩანს 40x-დანაც"},
    "Saturn": {"min": 50, "max": 200, "note": "რგოლები ჩანს 50x-დან, კასინის ხვრელი 150x+"},
    "Uranus": {"min": 100, "max": 200, "note": "მოცისფრო დისკი მაღალ გადიდებაზე"},
    "Neptune": {"min": 150, "max": 250, "note": "ძალიან სუსტი, საჭიროა მინიმუმ 130mm ტელესკოპი"},
}


# ─────────────────────────────────────────────
# Observer Factory
# ─────────────────────────────────────────────

def _get_observer(
    dt: Optional[datetime] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    elevation: int = 490,
) -> ephem.Observer:
    """Create an ephem Observer. Uses Tbilisi defaults if lat/lon not given."""
    observer = ephem.Observer()
    observer.lat = str(lat if lat is not None else settings.location_lat)
    observer.lon = str(lon if lon is not None else settings.location_lon)
    observer.elevation = elevation
    if dt:
        observer.date = ephem.Date(dt)
    else:
        tz = ZoneInfo(settings.timezone)
        now = datetime.now(tz)
        observer.date = ephem.Date(now)
    return observer


def _ephem_to_local_str(
    ephem_date,
    tz: ZoneInfo | None = None,
    fmt: str = "%H:%M",
) -> str:
    """Convert ephem Date to local time string."""
    if tz is None:
        tz = ZoneInfo(settings.timezone)
    try:
        utc_dt = ephem.Date(ephem_date).datetime().replace(tzinfo=ZoneInfo("UTC"))
        return utc_dt.astimezone(tz).strftime(fmt)
    except Exception:
        return "N/A"


# ─────────────────────────────────────────────
# Core: Planet Positions (existing — preserved)
# ─────────────────────────────────────────────

def get_planet_positions(dt: Optional[datetime] = None) -> list[PlanetInfo]:
    """Calculate all planet positions for given datetime."""
    observer = _get_observer(dt)
    results = []

    for eng_name, (ka_name, planet_class) in PLANETS.items():
        try:
            body = planet_class()
            body.compute(observer)

            alt_deg = math.degrees(float(body.alt))
            az_deg = math.degrees(float(body.az))
            mag = float(body.mag)

            # Get constellation
            constellation_abbr = ephem.constellation(body)[0]
            constellation_ka = CONSTELLATION_MAP.get(constellation_abbr, constellation_abbr)

            is_visible = alt_deg > 5  # Above 5° horizon

            results.append(PlanetInfo(
                name=eng_name,
                name_ka=ka_name,
                altitude=round(alt_deg, 2),
                azimuth=round(az_deg, 2),
                is_visible=is_visible,
                magnitude=round(mag, 2),
                constellation=constellation_ka,
            ))
        except Exception as e:
            logger.warning(f"Error computing {eng_name}: {e}")

    return results


# ─────────────────────────────────────────────
# NEW: Real-time Sky — Location-Parametric
# ─────────────────────────────────────────────

def get_planet_positions_live(
    lat: float,
    lon: float,
    tz: Optional[ZoneInfo] = None,
) -> list[PlanetLiveInfo]:
    """
    Calculate all planet positions with rise/set/transit times.
    Location-parametric: works for any lat/lon.
    """
    observer = _get_observer(lat=lat, lon=lon)
    if tz is None:
        tz = ZoneInfo(settings.timezone)
    results = []

    for eng_name, (ka_name, planet_class) in PLANETS.items():
        try:
            body = planet_class()
            body.compute(observer)

            alt_deg = math.degrees(float(body.alt))
            az_deg = math.degrees(float(body.az))
            mag = float(body.mag)
            is_visible = alt_deg > 5

            constellation_abbr = ephem.constellation(body)[0]
            constellation_ka = CONSTELLATION_MAP.get(constellation_abbr, constellation_abbr)

            # Rise / Set / Transit times
            rise_time = None
            set_time = None
            transit_time = None
            try:
                rise_time = _ephem_to_local_str(observer.next_rising(body), tz)
            except (ephem.NeverUpError, ephem.AlwaysUpError):
                pass
            except Exception:
                pass
            try:
                set_time = _ephem_to_local_str(observer.next_setting(body), tz)
            except (ephem.NeverUpError, ephem.AlwaysUpError):
                pass
            except Exception:
                pass
            try:
                transit_time = _ephem_to_local_str(observer.next_transit(body), tz)
            except Exception:
                pass

            # Magnification
            mag_guide = MAGNIFICATION_GUIDE.get(eng_name, {})

            results.append(PlanetLiveInfo(
                name=eng_name,
                name_ka=ka_name,
                altitude=round(alt_deg, 2),
                azimuth=round(az_deg, 2),
                is_visible=is_visible,
                magnitude=round(mag, 2),
                constellation=constellation_ka,
                rise_time=rise_time,
                set_time=set_time,
                transit_time=transit_time,
                direction=get_azimuth_direction(az_deg),
                magnification_min=mag_guide.get("min", 0),
                magnification_max=mag_guide.get("max", 0),
                magnification_note=mag_guide.get("note", ""),
            ))
        except Exception as e:
            logger.warning(f"Error computing live {eng_name}: {e}")

    return results


def get_moon_live(
    lat: float,
    lon: float,
    tz: Optional[ZoneInfo] = None,
) -> MoonLiveInfo:
    """Get detailed moon info for any location."""
    observer = _get_observer(lat=lat, lon=lon)
    if tz is None:
        tz = ZoneInfo(settings.timezone)

    moon = ephem.Moon()
    moon.compute(observer)

    illumination = float(moon.phase)
    alt_deg = math.degrees(float(moon.alt))
    az_deg = math.degrees(float(moon.az))

    phase_ka, _ = get_moon_phase()  # reuse existing logic
    phase_en = MOON_PHASES_EN.get(phase_ka, "")

    # Rise / Set
    rise_time = None
    set_time = None
    try:
        rise_time = _ephem_to_local_str(observer.next_rising(moon), tz)
    except (ephem.NeverUpError, ephem.AlwaysUpError):
        pass
    try:
        set_time = _ephem_to_local_str(observer.next_setting(moon), tz)
    except (ephem.NeverUpError, ephem.AlwaysUpError):
        pass

    return MoonLiveInfo(
        phase=phase_ka,
        phase_en=phase_en,
        illumination=round(illumination, 1),
        altitude=round(alt_deg, 2),
        azimuth=round(az_deg, 2),
        is_visible=alt_deg > 2,
        rise_time=rise_time,
        set_time=set_time,
    )


def get_sun_times(
    lat: float,
    lon: float,
    tz: Optional[ZoneInfo] = None,
) -> dict:
    """Get sunrise, sunset, and whether it's currently night."""
    observer = _get_observer(lat=lat, lon=lon)
    observer.horizon = "0"
    if tz is None:
        tz = ZoneInfo(settings.timezone)

    sun = ephem.Sun()
    sun.compute(observer)

    sun_alt = math.degrees(float(sun.alt))
    is_night = sun_alt < -6  # Civil twilight

    rise_str = "N/A"
    set_str = "N/A"
    try:
        rise_str = _ephem_to_local_str(observer.next_rising(sun), tz)
    except Exception:
        pass
    try:
        set_str = _ephem_to_local_str(observer.next_setting(sun), tz)
    except Exception:
        pass

    return {
        "rise": rise_str,
        "set": set_str,
        "altitude": round(sun_alt, 2),
        "is_night": is_night,
        "is_civil_twilight": -6 <= sun_alt < 0,
    }


def get_best_viewing_window(
    lat: float,
    lon: float,
    tz: Optional[ZoneInfo] = None,
) -> dict:
    """
    Calculate the best observation window for tonight.
    Best = after civil twilight ends AND before moon rises too high.
    """
    observer = _get_observer(lat=lat, lon=lon)
    if tz is None:
        tz = ZoneInfo(settings.timezone)

    sun = ephem.Sun()
    sun.compute(observer)

    # Evening: after sunset + 1 hour (astronomical darkness begins)
    try:
        observer.horizon = "-12"  # Nautical twilight
        twilight_end = observer.next_setting(sun, use_center=True)
        start = _ephem_to_local_str(twilight_end, tz)
    except Exception:
        start = "N/A"

    # End: before sunrise
    try:
        observer.horizon = "-6"
        dawn = observer.next_rising(sun, use_center=True)
        end = _ephem_to_local_str(dawn, tz)
    except Exception:
        end = "N/A"

    # Moon factor
    moon = ephem.Moon()
    moon.compute(observer)
    moon_illum = float(moon.phase)

    if moon_illum > 80:
        reason = "სავსე მთვარე ამცირებს ღრმა კოსმოსის ხილვადობას; პლანეტები მაინც კარგად ჩანს"
    elif moon_illum > 50:
        reason = "ნაწილობრივი მთვარე — საშუალო ხილვადობა"
    else:
        reason = "მუქი ცა — იდეალური პირობები ყველა ტიპის დაკვირვებისთვის"

    return {
        "start": start,
        "end": end,
        "moon_impact": f"{moon_illum:.0f}%",
        "reason": reason,
    }


# ─────────────────────────────────────────────
# Core: Moon Phase (existing — preserved)
# ─────────────────────────────────────────────

def get_moon_phase(dt: Optional[datetime] = None) -> tuple[str, float]:
    """Return (phase_name_ka, illumination_percent)."""
    observer = _get_observer(dt)
    moon = ephem.Moon()
    moon.compute(observer)

    illumination = float(moon.phase)  # 0-100

    # Determine phase name
    if illumination < 2:
        phase = "New Moon"
    elif illumination < 25:
        # Check if waxing or waning
        next_full = ephem.next_full_moon(observer.date)
        prev_full = ephem.previous_full_moon(observer.date)
        if float(next_full - observer.date) < float(observer.date - prev_full):
            phase = "Waxing Crescent"
        else:
            phase = "Waning Crescent"
    elif 25 <= illumination < 50:
        next_full = ephem.next_full_moon(observer.date)
        prev_full = ephem.previous_full_moon(observer.date)
        if float(next_full - observer.date) < float(observer.date - prev_full):
            phase = "First Quarter"
        else:
            phase = "Last Quarter"
    elif 50 <= illumination < 75:
        next_full = ephem.next_full_moon(observer.date)
        prev_full = ephem.previous_full_moon(observer.date)
        if float(next_full - observer.date) < float(observer.date - prev_full):
            phase = "Waxing Gibbous"
        else:
            phase = "Waning Gibbous"
    else:
        phase = "Full Moon"

    return MOON_PHASES_KA.get(phase, phase), round(illumination, 1)


# ─────────────────────────────────────────────
# Core: Sunset (existing — preserved)
# ─────────────────────────────────────────────

def get_sunset_time(dt: Optional[datetime] = None) -> str:
    """Get sunset time for Tbilisi."""
    observer = _get_observer(dt)
    observer.horizon = "0"
    sun = ephem.Sun()
    try:
        sunset = observer.next_setting(sun)
        tz = ZoneInfo(settings.timezone)
        sunset_dt = ephem.Date(sunset).datetime().replace(tzinfo=ZoneInfo("UTC"))
        local_sunset = sunset_dt.astimezone(tz)
        return local_sunset.strftime("%H:%M")
    except Exception as e:
        logger.error(f"Error calculating sunset: {e}")
        return "N/A"


# ─────────────────────────────────────────────
# Core: Best Planet (existing — preserved)
# ─────────────────────────────────────────────

def get_best_visible_planet(planets: list[PlanetInfo]) -> Optional[PlanetInfo]:
    """Determine the best object to observe tonight."""
    visible = [p for p in planets if p.is_visible]
    if not visible:
        return None
    # Sort by brightness (lower magnitude = brighter)
    visible.sort(key=lambda p: p.magnitude)
    return visible[0]


def get_best_visible_planet_live(planets: list[PlanetLiveInfo]) -> Optional[PlanetLiveInfo]:
    """Same as above but for PlanetLiveInfo objects."""
    visible = [p for p in planets if p.is_visible]
    if not visible:
        return None
    visible.sort(key=lambda p: p.magnitude)
    return visible[0]


# ─────────────────────────────────────────────
# Core: Azimuth Direction (existing — preserved)
# ─────────────────────────────────────────────

def get_azimuth_direction(azimuth: float) -> str:
    """Convert azimuth degrees to Georgian compass direction."""
    directions = [
        (0, "ჩრდილოეთი"), (45, "ჩრდ-აღმოსავლეთი"),
        (90, "აღმოსავლეთი"), (135, "სამხ-აღმოსავლეთი"),
        (180, "სამხრეთი"), (225, "სამხ-დასავლეთი"),
        (270, "დასავლეთი"), (315, "ჩრდ-დასავლეთი"),
        (360, "ჩრდილოეთი"),
    ]
    for i in range(len(directions) - 1):
        if directions[i][0] <= azimuth < directions[i + 1][0]:
            # Return closest
            if azimuth - directions[i][0] < directions[i + 1][0] - azimuth:
                return directions[i][1]
            return directions[i + 1][1]
    return "ჩრდილოეთი"
