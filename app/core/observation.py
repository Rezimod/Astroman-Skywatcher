"""
Astroman Skywatcher — Observation Text Generator
Generates premium Georgian-language observation guides.
"""
import logging
from typing import Optional
from app.models import PlanetInfo, ObservationData, AdvisorRecommendation
from app.core.astronomy import get_azimuth_direction

logger = logging.getLogger("astroman.observation")

# Magnification recommendations per planet
MAGNIFICATION_GUIDE = {
    "Mercury": {"min": 50, "max": 100, "note": "მცირე დისკი, რთული სამიზნე"},
    "Venus": {"min": 30, "max": 100, "note": "ფაზები ჩანს უკვე 30x-ზე"},
    "Mars": {"min": 100, "max": 250, "note": "ზედაპირის დეტალებისთვის საჭიროა მაღალი გადიდება"},
    "Jupiter": {"min": 40, "max": 200, "note": "ზოლები და თანამგზავრები ჩანს 40x-დანაც"},
    "Saturn": {"min": 50, "max": 200, "note": "რგოლები ჩანს 50x-დან, კასინის ხვრელი 150x+"},
    "Uranus": {"min": 100, "max": 200, "note": "მოცისფრო დისკი მაღალ გადიდებაზე"},
    "Neptune": {"min": 150, "max": 250, "note": "ძალიან სუსტი, საჭიროა მინიმუმ 130mm ტელესკოპი"},
}

LEVEL_TEXT = {
    "beginner": "დამწყები",
    "intermediate": "საშუალო",
    "advanced": "მოწინავე",
}


def _get_difficulty(planet: PlanetInfo) -> str:
    """Determine observation difficulty level."""
    if planet.name in ("Venus", "Jupiter"):
        return "beginner"
    elif planet.name in ("Saturn", "Mars"):
        return "intermediate"
    else:
        return "advanced"


# ─────────────────────────────────────────────
# NEW: Smart Observation Advisor (Feature 4)
# ─────────────────────────────────────────────

def recommend_telescope_smart(
    celestial_object: str,
    visibility_score: int,
) -> AdvisorRecommendation:
    """
    Smart product-type recommendation based on what you're observing
    and current visibility conditions.

    Rules:
        visibility < 40  → binoculars (or projector if < 20)
        Moon              → beginner telescope
        Jupiter / Saturn  → mid-power telescope
        Deep sky / faint  → advanced telescope

    This returns a product *type*, not a specific WooCommerce SKU.
    The linking to actual products happens at the API layer.
    """
    from app.config import settings
    base_url = settings.astroman_products_url

    obj = celestial_object.strip().lower()

    # ── Very poor visibility → projector / binoculars ──
    if visibility_score < 20:
        return AdvisorRecommendation(
            celestial_object=celestial_object,
            suggested_product_type="projector",
            magnification_range="N/A",
            reason="Visibility too low for telescope observation",
            reason_ka="ხილვადობა ძალიან დაბალია — Galaxy Projector საუკეთესო არჩევანია",
            difficulty="beginner",
            product_slug="galaxy-projector",
            product_url=f"{base_url}/galaxy-projector",
        )

    if visibility_score < 40:
        return AdvisorRecommendation(
            celestial_object=celestial_object,
            suggested_product_type="binoculars",
            magnification_range="7x50 – 10x50",
            reason="Low visibility — binoculars work better in poor conditions",
            reason_ka="დაბალი ხილვადობა — ბინოკლი უკეთესად მუშაობს ასეთ პირობებში",
            difficulty="beginner",
            product_slug="luna-binoculars",
            product_url=f"{base_url}/luna-binoculars",
        )

    # ── Moon ──
    if obj in ("moon", "მთვარე", "luna"):
        return AdvisorRecommendation(
            celestial_object=celestial_object,
            suggested_product_type="beginner_telescope",
            magnification_range="50x – 150x",
            reason="Moon is an easy target — any telescope works well",
            reason_ka="მთვარე მარტივი სამიზნეა — ნებისმიერი ტელესკოპი კარგად მუშაობს",
            difficulty="beginner",
            product_slug="voyager-70mm",
            product_url=f"{base_url}/voyager-70mm",
        )

    # ── Jupiter ──
    if obj in ("jupiter", "იუპიტერი"):
        return AdvisorRecommendation(
            celestial_object=celestial_object,
            suggested_product_type="mid_power_telescope",
            magnification_range="40x – 200x",
            reason="Jupiter bands and Galilean moons need 70mm+ aperture",
            reason_ka="იუპიტერის ზოლები და თანამგზავრები 70mm+ აპერტურას მოითხოვს",
            difficulty="intermediate",
            product_slug="explorer-90mm",
            product_url=f"{base_url}/explorer-90mm",
        )

    # ── Saturn ──
    if obj in ("saturn", "სატურნი"):
        return AdvisorRecommendation(
            celestial_object=celestial_object,
            suggested_product_type="mid_power_telescope",
            magnification_range="50x – 200x",
            reason="Saturn's rings become visible at 50x with 70mm+ aperture",
            reason_ka="სატურნის რგოლები 50x-დან ჩანს, 70mm+ აპერტურით",
            difficulty="intermediate",
            product_slug="explorer-90mm",
            product_url=f"{base_url}/explorer-90mm",
        )

    # ── Venus ──
    if obj in ("venus", "ვენერა"):
        return AdvisorRecommendation(
            celestial_object=celestial_object,
            suggested_product_type="beginner_telescope",
            magnification_range="30x – 100x",
            reason="Venus is very bright — phases visible even with small scopes",
            reason_ka="ვენერა ძალიან კაშკაშია — ფაზები პატარა ტელესკოპითაც ჩანს",
            difficulty="beginner",
            product_slug="voyager-70mm",
            product_url=f"{base_url}/voyager-70mm",
        )

    # ── Mars ──
    if obj in ("mars", "მარსი"):
        return AdvisorRecommendation(
            celestial_object=celestial_object,
            suggested_product_type="advanced_telescope",
            magnification_range="100x – 250x",
            reason="Mars surface detail requires high magnification and aperture",
            reason_ka="მარსის ზედაპირის დეტალები მაღალ გადიდებას და აპერტურას მოითხოვს",
            difficulty="intermediate",
            product_slug="deepsky-130mm",
            product_url=f"{base_url}/deepsky-130mm",
        )

    # ── Deep Sky (nebulae, galaxies, clusters) ──
    deep_sky_keywords = (
        "nebula", "galaxy", "cluster", "andromeda", "orion",
        "ნისლეული", "გალაქტიკა", "ბურთულოვანი", "ღრმა",
        "m31", "m42", "m13", "m45", "pleiades",
        "deep sky", "deep_sky", "dso",
    )
    if any(kw in obj for kw in deep_sky_keywords):
        return AdvisorRecommendation(
            celestial_object=celestial_object,
            suggested_product_type="advanced_telescope",
            magnification_range="30x – 100x (wide field)",
            reason="Deep sky objects need large aperture (130mm+) and dark skies",
            reason_ka="ღრმა კოსმოსის ობიექტები დიდ აპერტურას (130mm+) და მუქ ცას მოითხოვს",
            difficulty="advanced",
            product_slug="deepsky-130mm",
            product_url=f"{base_url}/deepsky-130mm",
        )

    # ── Distant planets ──
    if obj in ("uranus", "neptune", "ურანი", "ნეპტუნი"):
        return AdvisorRecommendation(
            celestial_object=celestial_object,
            suggested_product_type="advanced_telescope",
            magnification_range="100x – 250x",
            reason="Distant planets require 130mm+ aperture to resolve as disks",
            reason_ka="შორეული პლანეტები 130mm+ აპერტურას მოითხოვს დისკის დასანახად",
            difficulty="advanced",
            product_slug="deepsky-130mm",
            product_url=f"{base_url}/deepsky-130mm",
        )

    # ── Mercury ──
    if obj in ("mercury", "მერკური"):
        return AdvisorRecommendation(
            celestial_object=celestial_object,
            suggested_product_type="beginner_telescope",
            magnification_range="50x – 100x",
            reason="Mercury is close to horizon — any scope works but timing is key",
            reason_ka="მერკური ჰორიზონტთან ახლოსაა — ნებისმიერი ტელესკოპი, მაგრამ დრო მნიშვნელოვანია",
            difficulty="intermediate",
            product_slug="voyager-70mm",
            product_url=f"{base_url}/voyager-70mm",
        )

    # ── Generic / unknown object → mid-range default ──
    return AdvisorRecommendation(
        celestial_object=celestial_object,
        suggested_product_type="mid_power_telescope",
        magnification_range="40x – 150x",
        reason="General-purpose telescope for versatile observation",
        reason_ka="უნივერსალური ტელესკოპი მრავალმხრივი დაკვირვებისთვის",
        difficulty="beginner",
        product_slug="explorer-90mm",
        product_url=f"{base_url}/explorer-90mm",
    )


def generate_observation_text(
    best_planet: Optional[PlanetInfo],
    planets: list[PlanetInfo],
    moon_phase: str,
    moon_illumination: float,
    sunset_time: str,
    cloud_coverage: int,
    temperature: float,
) -> str:
    """Generate a premium Georgian observation guide."""

    lines = []

    # --- Header ---
    lines.append("═══════════════════════════════════")
    lines.append("🔭 ASTROMAN — ღამის ცის გზამკვლევი")
    lines.append("═══════════════════════════════════")
    lines.append("")

    # --- Weather Summary ---
    if cloud_coverage <= 20:
        sky_status = "🌟 ცა წმინდაა — შესანიშნავი საღამოა დაკვირვებისთვის!"
    elif cloud_coverage <= 50:
        sky_status = "⛅ ნაწილობრივ ღრუბლიანი — დაკვირვება შესაძლებელია ღრუბლებს შორის"
    elif cloud_coverage <= 80:
        sky_status = "☁️ ღრუბლიანი — დაკვირვება შეზღუდულია"
    else:
        sky_status = "🌧 სრულად ღრუბლიანი — ღამის ცა არ ჩანს"

    lines.append(sky_status)
    lines.append(f"🌡 ტემპერატურა: {temperature:.0f}°C")
    lines.append(f"🌅 მზის ჩასვლა: {sunset_time}")
    lines.append(f"🌙 მთვარე: {moon_phase} ({moon_illumination:.0f}%)")
    lines.append("")

    # --- Cloudy night fallback ---
    if cloud_coverage > 80:
        lines.append("─────────────────────────────────")
        lines.append("💡 რეკომენდაცია ღრუბლიანი ღამისთვის:")
        lines.append("")
        lines.append("ღამის ცა დღეს ღრუბლებმა დაფარა, მაგრამ ეს არ ნიშნავს,")
        lines.append("რომ კოსმოსთან კავშირი შეწყდეს.")
        lines.append("")
        lines.append("🪐 ASTROMAN Galaxy Projector-ით შეგიძლიათ კოსმოსი")
        lines.append("   სახლში შემოიტანოთ — 10,000+ ვარსკვლავის პროექცია")
        lines.append("   თქვენს ჭერზე.")
        lines.append("")
        return "\n".join(lines)

    # --- Best Object ---
    if best_planet:
        lines.append("─────────────────────────────────")
        lines.append("⭐ დღეს საღამოს ცის მთავარი ობიექტი:")
        lines.append(f"   {best_planet.name_ka.upper()}")
        lines.append("")

        direction = get_azimuth_direction(best_planet.azimuth)
        lines.append(f"📍 სად მოძებნო:")
        lines.append(f"   მიმართულება: {direction}")
        lines.append(f"   სიმაღლე ჰორიზონტიდან: {best_planet.altitude:.0f}°")
        lines.append(f"   სიკაშკაშე: {best_planet.magnitude:.1f} mag")
        if best_planet.constellation:
            lines.append(f"   თანავარსკვლავედი: {best_planet.constellation}")
        lines.append("")

        # Magnification guide
        mag_guide = MAGNIFICATION_GUIDE.get(best_planet.name, {})
        if mag_guide:
            lines.append(f"🔍 რეკომენდებული გადიდება:")
            lines.append(f"   {mag_guide['min']}x — {mag_guide['max']}x")
            lines.append(f"   💡 {mag_guide['note']}")
            lines.append("")

        # Difficulty level
        difficulty = _get_difficulty(best_planet)
        level_text = LEVEL_TEXT.get(difficulty, "საშუალო")
        lines.append(f"📊 სირთულის დონე: {level_text}")
        lines.append("")

    # --- All visible planets ---
    visible = [p for p in planets if p.is_visible]
    if visible:
        lines.append("─────────────────────────────────")
        lines.append("🪐 დღეს ხილული პლანეტები:")
        lines.append("")
        for p in visible:
            direction = get_azimuth_direction(p.azimuth)
            icon = "⭐" if p == best_planet else "•"
            lines.append(f"  {icon} {p.name_ka} — {direction}, {p.altitude:.0f}°, mag {p.magnitude:.1f}")
        lines.append("")

    # --- Moon observation tip ---
    if moon_illumination > 5:
        lines.append("─────────────────────────────────")
        lines.append("🌙 მთვარის დაკვირვება:")
        lines.append("")
        if moon_illumination < 50:
            lines.append("  ტერმინატორის ხაზზე (სინათლე/ჩრდილის საზღვარი)")
            lines.append("  კრატერები განსაკუთრებით კარგად ჩანს.")
            lines.append("  რეკომენდებული გადიდება: 50x-150x")
        elif moon_illumination < 90:
            lines.append("  თითქმის სავსე მთვარე — ზედაპირის დეტალები")
            lines.append("  ნაკლებად კონტრასტულია, მაგრამ სხივთა სისტემები")
            lines.append("  (რეი სისტემები) კარგად ჩანს.")
        else:
            lines.append("  სავსე მთვარე ძალიან ნათელია!")
            lines.append("  მთვარის ფილტრის გამოყენება რეკომენდებულია.")
            lines.append("  ⚠️ სავსე მთვარე ღრმა კოსმოსის ობიექტების")
            lines.append("  დაკვირვებას ართულებს.")
        lines.append("")

    # --- Footer ---
    lines.append("═══════════════════════════════════")
    lines.append("🔭 ASTROMAN — ცის ინტელექტი თქვენთვის")
    lines.append("═══════════════════════════════════")

    return "\n".join(lines)
