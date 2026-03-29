"""
ASTROMAN — Dashboard Routes
Public-facing observation panel.
"""
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from app.config import settings
from app.services.daily_pipeline import get_today_observation, collect_daily_data
from app.services.ai_recap import generate_daily_recap
from app.core.astronomy import (
    get_best_visible_planet, get_sun_times, get_planet_positions_live
)
from app.core.telescope import recommend_telescope
from app.core.weather import get_current_weather, get_evening_forecast

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

_GEO_MONTHS = [
    "", "იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი",
    "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"
]

def _datetimeformat(value: str) -> str:
    try:
        dt = datetime.strptime(str(value), "%Y-%m-%d")
        return f"{dt.day} {_GEO_MONTHS[dt.month]}, {dt.year}"
    except Exception:
        return str(value)

def _azimuth_direction(az: float) -> str:
    dirs = ["ჩ", "ჩ-აღ", "აღ", "სამ-აღ", "სამ", "სამ-დ", "დას", "ჩ-დ"]
    idx = round(az / 45) % 8
    return dirs[idx]

templates.env.filters["datetimeformat"] = _datetimeformat
templates.env.filters["azimuth_direction"] = _azimuth_direction

# ─────────────────────────────────────────────
# Planet Explorer Data
# ─────────────────────────────────────────────
PLANET_DATA = {
    "moon": {
        "slug": "moon", "name_ka": "მთვარე", "name_en": "Moon", "emoji": "🌕", "color": "#f0e68c",
        "type": "სატელიტი", "distance_ka": "დედამიწიდან ~384,400 კმ",
        "desc_ka": "დედამიწის ერთადერთი ბუნებრივი თანამგზავრი. ყველაზე ადვილი სამიზნე — კრატერები, მთები და ზღვები (მარია) ნათლად ჩანს 70mm-ითაც კი. ნახევარი ფაზა ყველაზე შთამბეჭდავია ტერმინატორის გასწვრივ ჩრდილების გამო.",
        "best_time_ka": "ნახევარი ფაზა — ტერმინატორის ჩრდილები 3D ეფექტს ქმნის",
        "views": [
            {"aperture": "70mm", "label_ka": "70mm ტელესკოპი — რეალური ხედი", "mag": "80x–120x",
             "desc_ka": "კრატერების კიდეები, მთის ჯაჭვები, ტიხო და კოპერნიკი ნათლად ჩანს. ასეთი სურათი გელოდებათ Foreseen 80mm-ით.",
             "img": "https://i.redd.it/mr5wqq1ppc3y.jpg"},
        ],
    },
    "mercury": {
        "slug": "mercury", "name_ka": "მერკური", "name_en": "Mercury", "emoji": "⚫", "color": "#9ca3af",
        "type": "კლდოვანი პლანეტა", "distance_ka": "მზიდან ~77 მლნ კმ (საშ.)",
        "desc_ka": "მზის ყველაზე ახლო პლანეტა — ჩანს მხოლოდ ჰორიზონტთან ახლოს, მზის ამოსვლის ან ჩასვლის მახლობლად. 70mm ტელესკოპით ფაზა ჩანს — ვენერის მსგავსი ნამგალი.",
        "best_time_ka": "მზის ჩასვლიდან 1 საათში, სამხ-დასავლეთ ჰორიზონტზე",
        "views": [
            {"aperture": "70mm", "label_ka": "70mm ტელესკოპი — რეალური ხედი", "mag": "70x–100x",
             "desc_ka": "მცირე კაშკაშა დისკი ჩანს, ფაზა შესამჩნევია. ყოველთვის ჰორიზონტთან ახლოს — ატმოსფერული ცინცხა ამახინჯებს სურათს.",
             "img": "https://c02.purpledshub.com/uploads/sites/48/2022/09/mercury-planet-phase.jpg?webp=1&w=1200"},
        ],
    },
    "venus": {
        "slug": "venus", "name_ka": "ვენერა", "name_en": "Venus", "emoji": "🟡", "color": "#fbbf24",
        "type": "კლდოვანი პლანეტა", "distance_ka": "დედამიწიდან ~38–261 მლნ კმ",
        "desc_ka": "ყველაზე კაშკაშა პლანეტა ცაზე (−3.5 to −4.9 mag). ფაზები ჩანს — სრული, ნახევარი ან ნამგალი. ატმოსფერო ძალიან ღრუბლიანია, ზედაპირი არ ჩანს.",
        "best_time_ka": "მზის ჩასვლამდე/შემდეგ — 'საღამოს ვარსკვლავი'",
        "views": [
            {"aperture": "70mm", "label_ka": "70mm ტელესკოპი — რეალური ხედი", "mag": "60x–100x",
             "desc_ka": "კაშკაშა თეთრი ნამგალი ან ნახევარი ფაზა — ზუსტად ისე, როგორც ეს ფოტო გვიჩვენებს. ზედაპირი არ ჩანს ღრუბლების გამო.",
             "img": "https://c02.purpledshub.com/uploads/sites/48/2021/03/Venus-50-percent-phase-bb022cf.jpg?webp=1&w=1200"},
        ],
    },
    "mars": {
        "slug": "mars", "name_ka": "მარსი", "name_en": "Mars", "emoji": "🔴", "color": "#f87171",
        "type": "კლდოვანი პლანეტა", "distance_ka": "დედამიწიდან ~54–401 მლნ კმ",
        "desc_ka": "წითელი პლანეტა — ჟანგის მტვრით დაფარული. ოპოზიციის დროს (ყოველ ~2 წელიწადში) პოლარული ყინვის ქუდი და მუქი ზღვები ჩანს.",
        "best_time_ka": "ოპოზიციის სეზონი — პლანეტა ყველაზე მსხვილი და კაშკაშაა",
        "views": [
            {"aperture": "70mm", "label_ka": "70mm ტელესკოპი — რეალური ხედი", "mag": "100x–150x",
             "desc_ka": "პატარა ნარინჯისფერ-წითელი დისკი. ოპოზიციის დროს პოლარული ყინვა და მუქი ზღვები ჩანს.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/200px-OSIRIS_Mars_true_color.jpg"},
        ],
    },
    "jupiter": {
        "slug": "jupiter", "name_ka": "იუპიტერი", "name_en": "Jupiter", "emoji": "🟠", "color": "#fb923c",
        "type": "გაზის გიგანტი", "distance_ka": "დედამიწიდან ~588–968 მლნ კმ",
        "desc_ka": "ყველაზე პოპულარული სამიზნე! 2 ღრუბლოვანი ზოლი 50x-ზე ჩანს. 4 გალილეური თანამგზავრი (იო, ევროპა, განიმედი, კალისტო) ცვლიან პოზიციას ყოველ ღამე.",
        "best_time_ka": "ოპოზიციის პერიოდი — მთელი ღამე ხელმისაწვდომია",
        "views": [
            {"aperture": "70mm", "label_ka": "70mm ტელესკოპი — რეალური ხედი", "mag": "80x–120x",
             "desc_ka": "2–4 ღრუბლოვანი ზოლი, 4 გალილეური თანამგზავრი — ეს ზუსტად ის სურათია, რასაც Foreseen 80mm გაჩვენებთ.",
             "img": "https://cdn.astrobin.com/thumbs/RJy-HT14EBc9_620x0_YU5xgF4r.jpg"},
        ],
    },
    "saturn": {
        "slug": "saturn", "name_ka": "სატურნი", "name_en": "Saturn", "emoji": "🪐", "color": "#eab308",
        "type": "გაზის გიგანტი", "distance_ka": "დედამიწიდან ~1.2–1.7 მლრდ კმ",
        "desc_ka": "ყველაზე შთამბეჭდავი ხედი ტელესკოპში! რგოლები 50x-ზე მკაფიოდ ჩანს. Foreseen 80mm-ით კასინის ხვრელი (რგოლებს შორის ბნელი ზოლი) ასევე შესამჩნევია.",
        "best_time_ka": "ოპოზიცია — რგოლები ყველაზე ფართოდ გახსნილია",
        "views": [
            {"aperture": "70mm", "label_ka": "70mm ტელესკოპი — რეალური ხედი", "mag": "80x–120x",
             "desc_ka": "რგოლები ნათლად ჩანს — ეს ყველაზე გასაოცარი სანახაობაა ამ ზომის ტელესკოპში. კასინის ხვრელი კარგ ღამეს შესამჩნევია.",
             "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvAcKsao-m8eWWW4sIRqTkBueM8GIgRpmVHQ&s"},
        ],
    },
    "uranus": {
        "slug": "uranus", "name_ka": "ურანი", "name_en": "Uranus", "emoji": "🔵", "color": "#22d3ee",
        "type": "ყინულის გიგანტი", "distance_ka": "დედამიწიდან ~2.6–3.2 მლრდ კმ",
        "desc_ka": "მეთანის ატმოსფეროს გამო ცისფერ-მწვანე ფერის. 70mm-ით ვარსკვლავს ჰგავს, მაგრამ მოცისფრო ფერი განარჩევს. პატარა დისკი მხოლოდ მაღალ გადიდებაზე.",
        "best_time_ka": "ოქტომბერ-ნოემბერი — ოპოზიციის სეზონი",
        "views": [
            {"aperture": "70mm", "label_ka": "70mm ტელესკოპი — რეალური ხედი", "mag": "100x–150x",
             "desc_ka": "ცისფერ-მწვანე წერტილი — ვარსკვლავისგან ფერი განარჩევს. მაღალ გადიდებაზე პატარა დისკი ჩანს.",
             "img": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdCbhVFWh9vzW2oO2EeDa9zTiLQVEqAwFmHw&s"},
        ],
    },
    "neptune": {
        "slug": "neptune", "name_ka": "ნეპტუნი", "name_en": "Neptune", "emoji": "💙", "color": "#60a5fa",
        "type": "ყინულის გიგანტი", "distance_ka": "დედამიწიდან ~4.3–4.7 მლრდ კმ",
        "desc_ka": "ყველაზე შორეული პლანეტა — 1846 წელს მათემატიკური გამოთვლებით აღმოაჩინეს. mag 7.8 — ბინოკლით ხელმისაწვდომი, 70mm+-ით ცისფერი წერტილი ჩანს.",
        "best_time_ka": "სექტემბერი — ოპოზიცია; ვარსკვლავური რუქა სავალდებულოა",
        "views": [
            {"aperture": "70mm", "label_ka": "70mm ტელესკოპი — რეალური ხედი", "mag": "100x–150x",
             "desc_ka": "ძლივს შესამჩნევი ცისფერი წერტილი — მაღალ გადიდებაზე ვარსკვლავებისგან ფერი განარჩევს. ვარსკვლავური რუქა სავალდებულოა.",
             "img": "https://c02.purpledshub.com/uploads/sites/48/2019/08/Planet-Neptune-98b9c5f-e1604308755157.jpg?webp=1&w=1200"},
        ],
    },
}

PLANET_LIST = list(PLANET_DATA.values())


@router.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Main dashboard — today's sky observation."""
    observation = await get_today_observation()
    if not observation:
        observation = await collect_daily_data()

    try:
        live_weather = await get_evening_forecast()
        if live_weather:
            observation.cloud_coverage = live_weather.cloud_coverage
            observation.temperature = live_weather.temperature
            observation.humidity = live_weather.humidity
            observation.wind_speed = live_weather.wind_speed
    except Exception:
        pass

    # ── Live planet positions (real-time) ──
    try:
        tz = ZoneInfo(settings.timezone)
        now = datetime.now(tz)
        live_planets = get_planet_positions_live(settings.location_lat, settings.location_lon, tz)
        observation.planets = live_planets
    except Exception:
        tz = ZoneInfo(settings.timezone)
        now = datetime.now(tz)

    best_planet = get_best_visible_planet(observation.planets)
    telescope = recommend_telescope(
        best_planet, observation.cloud_coverage, observation.moon_illumination
    )
    visible_planets = [p for p in observation.planets if p.is_visible]

    try:
        sun = get_sun_times(settings.location_lat, settings.location_lon, tz)
        is_night = sun["is_night"]
        is_twilight = sun.get("is_civil_twilight", False)
        current_time = now.strftime("%H:%M:%S")
    except Exception:
        sun = {"rise": "N/A", "set": "N/A", "altitude": 0, "is_night": True, "is_civil_twilight": False}
        is_night = True
        is_twilight = False
        current_time = "00:00:00"

    # ── AI Sky Recap (cached daily) ──
    try:
        ai_recap = await generate_daily_recap(observation, visible_planets, is_night)
    except Exception:
        ai_recap = ""

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
        "last_updated": datetime.now(ZoneInfo(settings.timezone)).strftime("%H:%M"),
        "ai_recap": ai_recap,
    })


@router.get("/planets", response_class=HTMLResponse)
async def planets_page(request: Request):
    """Planet explorer grid."""
    return templates.TemplateResponse("planets.html", {
        "request": request,
        "planets": PLANET_LIST,
    })


@router.get("/planets/{slug}", response_class=HTMLResponse)
async def planet_detail(request: Request, slug: str):
    """Individual planet detail page."""
    planet = PLANET_DATA.get(slug.lower())
    if not planet:
        raise HTTPException(status_code=404, detail="Planet not found")
    
    # Find adjacent planets for prev/next nav
    slugs = list(PLANET_DATA.keys())
    idx = slugs.index(slug.lower())
    prev_planet = PLANET_DATA[slugs[idx - 1]] if idx > 0 else None
    next_planet = PLANET_DATA[slugs[idx + 1]] if idx < len(slugs) - 1 else None

    return templates.TemplateResponse("planet_detail.html", {
        "request": request,
        "planet": planet,
        "prev_planet": prev_planet,
        "next_planet": next_planet,
    })


@router.get("/subscribe", response_class=HTMLResponse)
async def subscribe_page(request: Request):
    """Subscription page."""
    return templates.TemplateResponse("subscribe.html", {
        "request": request,
    })
