"""
Astroman Skywatcher — Sky Recap Service
Generates a daily Georgian-language sky summary from live observation data.
No external API required. Cached per day.
"""
import logging
from datetime import date

logger = logging.getLogger("astroman.services.ai_recap")

# In-memory daily cache: {date_str: recap_text}
_recap_cache: dict[str, str] = {}


def _sky_condition_text(clouds: int) -> tuple[str, str]:
    if clouds <= 15:
        return "🌟", "ცა სრულიად წმინდაა — ტელესკოპისთვის იდეალური საღამო"
    elif clouds <= 35:
        return "✨", "ცა თითქმის წმინდაა — შესანიშნავი პირობები დაკვირვებისთვის"
    elif clouds <= 55:
        return "⛅", "ნაწილობრივ ღრუბლიანი — ღრუბლებს შორის კარგი ხედვა"
    elif clouds <= 75:
        return "🌥", "მეტწილად ღრუბლიანი — დაკვირვება შეზღუდულია"
    else:
        return "☁️", "ძლიერ ღრუბლიანი — ღამე არახელსაყრელია დასაკვირვებლად"


def _moon_text(illumination: float, phase: str) -> str:
    if illumination < 10:
        return f"მთვარე პრაქტიკულად უხილავია ({round(illumination)}%) — ღრმა კოსმოსის ობიექტებისთვის სრულყოფილი პირობები 🌑"
    elif illumination < 35:
        return f"მთვარე {round(illumination)}%-ით განათებულია ({phase}) — ბნელი ცა ღრმა კოსმოსისთვის კარგია"
    elif illumination < 65:
        return f"მთვარე {round(illumination)}%-ით განათებულია ({phase}) — პლანეტები კარგად ჩანს, ნისლეულები ნაკლებად"
    elif illumination < 85:
        return f"მთვარე {round(illumination)}%-ით კაშკაშაა ({phase}) — ფილტრის გამოყენება რეკომენდებულია"
    else:
        return f"სავსე მთვარე ({round(illumination)}%) ცას ანათებს — პლანეტები და ორმაგი ვარსკვლავები კარგი სამიზნეებია 🌕"


def _best_planet_text(best, visible_planets: list) -> str:
    if not best:
        return "ამ მომენტში ნათელი პლანეტები ჰორიზონტზე არ ჩანს."

    direction_map = {
        "ჩ": "ჩრდილოეთით", "ჩ-აღ": "ჩრდილო-აღმოსავლეთით",
        "აღ": "აღმოსავლეთით", "სამ-აღ": "სამხრეთ-აღმოსავლეთით",
        "სამ": "სამხრეთით", "სამ-დ": "სამხრეთ-დასავლეთით",
        "დას": "დასავლეთით", "ჩ-დ": "ჩრდილო-დასავლეთით",
    }
    dirs = ["ჩ", "ჩ-აღ", "აღ", "სამ-აღ", "სამ", "სამ-დ", "დას", "ჩ-დ"]

    az = getattr(best, "azimuth", 180)
    dir_short = dirs[round(az / 45) % 8]
    dir_long = direction_map.get(dir_short, dir_short)
    alt = round(getattr(best, "altitude", 0))
    mag = getattr(best, "magnitude", "?")
    name_ka = getattr(best, "name_ka", "")
    constellation = getattr(best, "constellation", "")

    planet_str = (
        f"დღეს საღამოს ყველაზე კაშკაშა სანახაობაა "
        f"⭐ {name_ka} — {dir_long}, ჰორიზონტიდან {alt}°-ზე, "
        f"{constellation} თანავარსკვლავედში (სიკაშკაშე {mag} mag)."
    )

    others = [p for p in visible_planets if p != best]
    if others:
        other_names = ", ".join(p.name_ka for p in others[:4])
        planet_str += f" ასევე ჩანს: {other_names}."

    return planet_str


def _observation_tip(best, clouds: int, moon: float, temp: float) -> str:
    tips = []

    if best:
        name = getattr(best, "name", "")
        if name == "Saturn":
            tips.append("სატურნის რგოლები 50mm ტელესკოპითაც შთამბეჭდავად ჩანს")
        elif name == "Jupiter":
            tips.append("იუპიტერის ოთხი გალილეური თანამგზავრი 40x გადიდებაზე ჩანს")
        elif name == "Venus":
            tips.append("ვენერა იმდენად კაშკაშაა, რომ შეუიარაღებელი თვალითაც ნათლად ჩანს")
        elif name == "Mars":
            tips.append("მარსის პოლარული ყინვის ქუდი 70mm ტელესკოპით ჩანს")
        elif name == "Moon":
            tips.append("ტერმინატორის ხაზზე კრატერების ჩრდილები 3D ეფექტს ქმნის")

    if moon > 80 and tips:
        tips.append("მთვარის ფილტრი კონტრასტს გაუმჯობესებს")

    if clouds > 40:
        tips.append("ღრუბლების გარდინის გაქრობის მოლოდინში მოემზადე ტელესკოპი")

    if temp < 5:
        tips.append(f"ცივა ({round(temp)}°C) — თბილი ტანსაცმელი სავალდებულოა")

    if not tips:
        return "🔭 ტელესკოპი გაასხვა, ამ ღამეს ცა გელის!"

    return "💡 " + "; ".join(tips[:2]) + "."


async def generate_daily_recap(observation, visible_planets: list, is_night: bool) -> str:
    """
    Returns a rich Georgian sky recap built from live observation data.
    Cached once per calendar day. No external API required.
    """
    today = str(date.today())

    if today in _recap_cache:
        return _recap_cache[today]

    try:
        clouds = observation.cloud_coverage
        moon = observation.moon_illumination
        temp = observation.temperature
        phase = observation.moon_phase

        sky_emoji, sky_text = _sky_condition_text(clouds)
        moon_text = _moon_text(moon, phase)

        sorted_planets = sorted(
            visible_planets,
            key=lambda p: float(str(getattr(p, "magnitude", 99)).replace("−", "-"))
        )
        best = sorted_planets[0] if sorted_planets else None

        planet_text = _best_planet_text(best, sorted_planets)
        tip = _observation_tip(best, clouds, moon, temp)

        recap = f"{sky_emoji} {sky_text}. {planet_text} {moon_text}. {tip}"

        _recap_cache[today] = recap
        logger.info("Recap generated for %s", today)
        return recap

    except Exception as exc:
        logger.warning("Recap generation failed: %s", exc)
        fallback = (
            f"🔭 დღეს {len(visible_planets)} პლანეტა ჩანს ცაზე. "
            f"მთვარე {round(observation.moon_illumination)}%-ით განათებულია. "
            f"ამინდი: {observation.cloud_coverage}% ღრუბლიანობა, {round(observation.temperature)}°C."
        )
        _recap_cache[today] = fallback
        return fallback
