"""
Astroman Skywatcher — Dashboard Routes
Public-facing observation panel.
"""
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from app.config import settings
from app.services.daily_pipeline import get_today_observation, collect_daily_data
from app.core.astronomy import get_best_visible_planet, get_sun_times
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
        "desc_ka": "დედამიწის ერთადერთი ბუნებრივი თანამგზავრი. ყველაზე ადვილი სამიზნე ტელესკოპისთვის — კრატერები, მთები და ზღვები (მარია) ნათლად ჩანს უმარტივესი ოპტიკითაც კი.",
        "best_time_ka": "ნახევარი ფაზა — ტერმინატორის გასწვრივ დეტალები ყველაზე კარგად ჩანს",
        "views": [
            {"aperture": "50mm", "label_ka": "50mm — დამწყებთათვის", "mag": "25x–50x",
             "desc_ka": "სრული დისკი, ძირითადი კრატერები და მარია (ბნელი ვაკეები) ჩანს.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/500px-FullMoon2010.jpg"},
            {"aperture": "70mm", "label_ka": "70mm — საშუალო დეტალი", "mag": "50x–100x",
             "desc_ka": "კრატერების კიდეები, მთის ჯაჭვები და რეი-სისტემები ნათლად ჩანს. ტიხო და კოპერნიკი შთამბეჭდავია.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Full_Moon_Luc_Viatour.jpg/500px-Full_Moon_Luc_Viatour.jpg"},
            {"aperture": "90mm", "label_ka": "90mm — მაღალი დეტალი", "mag": "100x–150x",
             "desc_ka": "კრატერების შიდა სტრუქტურა, ცენტრალური მთები და ვულკანური ნაოჭები. ტერმინატორზე ჩრდილები სამგანზომილებიან სურათს ქმნის.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Clair_de_Lune_%E2%80%94_Moon_in_high_resolution_%28cropped%29.jpg/500px-Clair_de_Lune_%E2%80%94_Moon_in_high_resolution_%28cropped%29.jpg"},
        ],
    },
    "mercury": {
        "slug": "mercury", "name_ka": "მერკური", "name_en": "Mercury", "emoji": "⚫", "color": "#9ca3af",
        "type": "კლდოვანი პლანეტა", "distance_ka": "მზიდან ~77 მლნ კმ (საშ.)",
        "desc_ka": "მზის ყველაზე ახლო პლანეტა — ჰორიზონტთან ახლოს ჩანს, მხოლოდ ჩასვლის ან ამოსვლის შემდეგ. ვენერის მსგავსი ფაზები უჩვენებს ტელესკოპი.",
        "best_time_ka": "მზის ჩასვლიდან 1 საათის განმავლობაში, სამხ-დასავლეთ ჰორიზონტზე",
        "views": [
            {"aperture": "50mm", "label_ka": "50mm — მხოლოდ პუნქტი", "mag": "25x–50x",
             "desc_ka": "50mm-ით მერკური ნათელ წერტილად ჩანს. ფაზები არ ჩანს, მაგრამ ვარსკვლავებისგან გამოარჩევს.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mercury_in_color_-_Prockter07_centered.jpg/500px-Mercury_in_color_-_Prockter07_centered.jpg"},
            {"aperture": "70mm", "label_ka": "70mm — პატარა დისკი", "mag": "70x–100x",
             "desc_ka": "70mm-ით მცირე დისკი ჩანს. კარგ პირობებში ფაზა შესამჩნევია — ვენერის მსგავსი ნამგალი ან ნახევარი.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Mercury_in_true_color.jpg/500px-Mercury_in_true_color.jpg"},
            {"aperture": "90mm", "label_ka": "90mm — ფაზა ჩანს", "mag": "100x–150x",
             "desc_ka": "90mm-ით ფაზა მკაფიოდ ჩანს. ზედაპირის დეტალები ატმოსფერული დამახინჯების გამო ძნელია — მერკური ყოველთვის დაბალ ჰორიზონტზეა.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Mercury_Mariner_10.jpg/500px-Mercury_Mariner_10.jpg"},
        ],
    },
    "venus": {
        "slug": "venus", "name_ka": "ვენერა", "name_en": "Venus", "emoji": "🟡", "color": "#fbbf24",
        "type": "კლდოვანი პლანეტა", "distance_ka": "დედამიწიდან ~38–261 მლნ კმ",
        "desc_ka": "ყველაზე კაშკაშა პლანეტა ცაზე (-3.5 to -4.9 mag). ვენერის ფაზები გალილეომ 1610 წელს დააფიქსირა. ატმოსფერო მჟავა ღრუბლებითაა სავსე.",
        "best_time_ka": "მზის ჩასვლამდე/შემდეგ — 'საღამოს ვარსკვლავი' ან 'დილის ვარსკვლავი'",
        "views": [
            {"aperture": "50mm", "label_ka": "50mm — ძალიან კაშკაშა", "mag": "30x–50x",
             "desc_ka": "50mm-ით ვენერა განსაკუთრებულად კაშკაშაა. ფაზა შესამჩნევია — სრული, ნახევარი ან ნამგალი ჩანს.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Venus-real_color.jpg/500px-Venus-real_color.jpg"},
            {"aperture": "70mm", "label_ka": "70mm — ფაზა მკაფიოდ", "mag": "50x–100x",
             "desc_ka": "70mm-ით ვენერის ფაზა მკაფიოდ ჩანს. დიდი ნამგალის დროს დისკი შთამბეჭდავია.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/PIA23791.jpg/500px-PIA23791.jpg"},
            {"aperture": "90mm", "label_ka": "90mm — ღრუბლების სტრუქტურა", "mag": "100x–150x",
             "desc_ka": "90mm + UV ფილტრით ღრუბლოვანი ნიმუშები ჩანს. ფილტრი კონტრასტს გაუმჯობესებს.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Venuspioneeruv.jpg/500px-Venuspioneeruv.jpg"},
        ],
    },
    "mars": {
        "slug": "mars", "name_ka": "მარსი", "name_en": "Mars", "emoji": "🔴", "color": "#f87171",
        "type": "კლდოვანი პლანეტა", "distance_ka": "დედამიწიდან ~54–401 მლნ კმ",
        "desc_ka": "წითელი პლანეტა — ჟანგის მტვრით დაფარული. ოპოზიციის დროს ზედაპირის დეტალები, პოლარული ყინვები და ოლიმპ მონსი ჩანს.",
        "best_time_ka": "ოპოზიციის სეზონი (ყოველ ~2 წელიწადში) — პლანეტა ყველაზე მსხვილია",
        "views": [
            {"aperture": "50mm", "label_ka": "50mm — ნარინჯისფერი დისკი", "mag": "50x–75x",
             "desc_ka": "50mm-ით მარსი ნარინჯისფერ-წითელ დისკად ჩანს. ოპოზიციის გარეთ დეტალები ძნელია.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/500px-OSIRIS_Mars_true_color.jpg"},
            {"aperture": "70mm", "label_ka": "70mm — პოლარული ყინვა", "mag": "100x–150x",
             "desc_ka": "70mm-ით ოპოზიციის დროს პოლარული ყინვის ქუდი ჩანს. მუქი ზღვები და ნათელი უდაბნოები გამოირჩევა.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Mars_transparent.png/500px-Mars_transparent.png"},
            {"aperture": "90mm", "label_ka": "90mm — ზედაპირის დეტალი", "mag": "150x–200x",
             "desc_ka": "90mm-ით ვალეს მარინერის სისტემა და მსხვილი კრატერები ჩანს. 150x+ ვულკანებს ავლენს.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Mars_Valles_Marineris.jpeg/500px-Mars_Valles_Marineris.jpeg"},
        ],
    },
    "jupiter": {
        "slug": "jupiter", "name_ka": "იუპიტერი", "name_en": "Jupiter", "emoji": "🟠", "color": "#fb923c",
        "type": "გაზის გიგანტი", "distance_ka": "დედამიწიდან ~588–968 მლნ კმ",
        "desc_ka": "მზის სისტემის უდიდესი პლანეტა. 4 გალილეური თანამგზავრი 40x-ზე ჩანს. დიდი წითელი ლაქა — 400 წლის ჭექა-ქუხილი.",
        "best_time_ka": "ოპოზიციის პერიოდში — მთელი ღამე ხელმისაწვდომია",
        "views": [
            {"aperture": "50mm", "label_ka": "50mm — ზოლები + 4 თანამგზავრი", "mag": "40x–70x",
             "desc_ka": "50mm-ით 2 მთავარი ღრუბლოვანი ზოლი ჩანს. 4 გალილეური თანამგზავრი პატარა ვარსკვლავებივით.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Jupiter.jpg/500px-Jupiter.jpg"},
            {"aperture": "70mm", "label_ka": "70mm — ღრუბლოვანი ნიმუშები", "mag": "80x–120x",
             "desc_ka": "70mm-ით 4–6 ზოლი ჩანს. დიდი წითელი ლაქა (GRS) სამხრეთ ეკვატორულ ზოლში.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Jupiter_and_its_shrunken_Great_Red_Spot.jpg/500px-Jupiter_and_its_shrunken_Great_Red_Spot.jpg"},
            {"aperture": "90mm", "label_ka": "90mm — GRS მკაფიოდ", "mag": "150x–200x",
             "desc_ka": "90mm-ით დიდი წითელი ლაქა მკაფიოდ ჩანს. ზოლების ფესტონები და ატმოსფერული ტურბულენტობა შთამბეჭდავია.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Latest_NASA_Juno_Image_of_Jupiter.jpg/500px-Latest_NASA_Juno_Image_of_Jupiter.jpg"},
        ],
    },
    "saturn": {
        "slug": "saturn", "name_ka": "სატურნი", "name_en": "Saturn", "emoji": "🪐", "color": "#eab308",
        "type": "გაზის გიგანტი", "distance_ka": "დედამიწიდან ~1.2–1.7 მლრდ კმ",
        "desc_ka": "სოლარული სისტემის ყველაზე ლამაზი სანახაობა. რგოლები ყინულისა და კლდის ნაწილაკებისგანაა — 50x-ზე მკაფიოდ ჩანს.",
        "best_time_ka": "ოპოზიციის გარშემო — რგოლები ყველაზე ფართოა",
        "views": [
            {"aperture": "50mm", "label_ka": "50mm — რგოლები ჩანს!", "mag": "50x–70x",
             "desc_ka": "50mm-ით სატურნის რგოლები მკაფიოდ ჩანს — ეს ერთ-ერთი ყველაზე შთამბეჭდავი სანახაობაა ამ ზომის ტელესკოპში.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Saturn_%28planet%29_large.jpg/500px-Saturn_%28planet%29_large.jpg"},
            {"aperture": "70mm", "label_ka": "70mm — კასინის ხვრელი", "mag": "80x–120x",
             "desc_ka": "70mm-ით კასინის ხვრელი (რგოლებს შორის ბნელი სივრცე) ჩანს. ტიტანი — ყვითელი მთვარე — სატურნის გვერდით.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/500px-Saturn_during_Equinox.jpg"},
            {"aperture": "90mm", "label_ka": "90mm — რგოლების სტრუქტურა", "mag": "150x–200x",
             "desc_ka": "90mm-ით A, B და C რგოლები გამოირჩევა. ბნელი ზოლები ატმოსფეროში და ენცელადუსი ჩანს.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Saturn_from_Cassini_Orbiter_%282004-10-06%29.jpg/500px-Saturn_from_Cassini_Orbiter_%282004-10-06%29.jpg"},
        ],
    },
    "uranus": {
        "slug": "uranus", "name_ka": "ურანი", "name_en": "Uranus", "emoji": "🔵", "color": "#22d3ee",
        "type": "ყინულის გიგანტი", "distance_ka": "დედამიწიდან ~2.6–3.2 მლრდ კმ",
        "desc_ka": "მეთანის ატმოსფეროს გამო ცისფერ-მწვანე ფერის. ბინოკლით ხელმისაწვდომია, ტელესკოპით პატარა დისკი ჩანს.",
        "best_time_ka": "ოქტომბერ-ნოემბერი — ოპოზიციის სეზონი",
        "views": [
            {"aperture": "50mm", "label_ka": "50mm — ვარსკვლავი ან დისკი?", "mag": "50x–100x",
             "desc_ka": "50mm-ით ურანი ვარსკვლავს ჰგავს, მაგრამ მოცისფრო-მწვანე ფერი გამოარჩევს.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Uranus2.jpg/500px-Uranus2.jpg"},
            {"aperture": "70mm", "label_ka": "70mm — მოცისფრო დისკი", "mag": "100x–150x",
             "desc_ka": "70mm-ით ურანის დისკი მკაფიოა. ეგზოტიკური ცისფერ-მწვანე ფერი — მეთანი ითვისებს წითელ სინათლეს.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Uranus_as_seen_by_NASA%27s_Voyager_2_%28remastered%29_-_JPEG_converted.jpg/500px-Uranus_as_seen_by_NASA%27s_Voyager_2_%28remastered%29_-_JPEG_converted.jpg"},
            {"aperture": "90mm", "label_ka": "90mm — უნიკალური ფერი", "mag": "150x–200x",
             "desc_ka": "90mm-ით ურანის მოცისფრო-მწვანე ფერი შთამბეჭდავია. ტიტანია/ობერონი (მსხვილი მთვარეები) ხელმისაწვდომია.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Uranus_rings.jpg/500px-Uranus_rings.jpg"},
        ],
    },
    "neptune": {
        "slug": "neptune", "name_ka": "ნეპტუნი", "name_en": "Neptune", "emoji": "💙", "color": "#60a5fa",
        "type": "ყინულის გიგანტი", "distance_ka": "დედამიწიდან ~4.3–4.7 მლრდ კმ",
        "desc_ka": "ყველაზე შორეული პლანეტა — 1846 წელს მათემატიკური გამოთვლებით აღმოაჩინეს. 90mm+ ტელესკოპით პატარა ცისფერი დისკი ჩანს.",
        "best_time_ka": "სექტემბერი — ოპოზიცია; mag 7.8 — ბინოკლით ხელმისაწვდომია",
        "views": [
            {"aperture": "50mm", "label_ka": "50mm — ძნელი სამიზნე", "mag": "50x–75x",
             "desc_ka": "50mm-ით ნეპტუნი ძლივს შესამჩნევი ვარსკვლავია (mag 7.9). ვარსკვლავური რუქის გარეშე ძნელია პოვნა.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg/500px-Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg"},
            {"aperture": "70mm", "label_ka": "70mm — ცისფერი ელფერი", "mag": "100x–150x",
             "desc_ka": "70mm-ით ნეპტუნი ძლივს ჩანს. ცისფერი ელფერი მაღალ გადიდებაზე.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Neptunstorm.jpg/500px-Neptunstorm.jpg"},
            {"aperture": "90mm", "label_ka": "90mm — ცისფერი დისკი!", "mag": "150x–200x",
             "desc_ka": "90mm-ზე ნეპტუნი პატარა ცისფერ დისკად ჩანს — ეს შთამბეჭდავი მიღწევაა.",
             "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Neptune_Voyager2_trim.jpg/500px-Neptune_Voyager2_trim.jpg"},
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

    best_planet = get_best_visible_planet(observation.planets)
    telescope = recommend_telescope(
        best_planet, observation.cloud_coverage, observation.moon_illumination
    )
    visible_planets = [p for p in observation.planets if p.is_visible]

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
        "last_updated": datetime.now(ZoneInfo(settings.timezone)).strftime("%H:%M"),
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
