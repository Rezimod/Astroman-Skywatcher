"""
Astroman Skywatcher — Telescope Smart Linking
Dynamic product recommendation based on observation conditions.
"""
import logging
from typing import Optional
from dataclasses import dataclass

from app.config import settings
from app.models import PlanetInfo

logger = logging.getLogger("astroman.telescope")


@dataclass
class TelescopeRecommendation:
    name: str
    slug: str
    category: str
    reason_ka: str
    product_url: str


# Product catalog
TELESCOPE_CATALOG = {
    "voyager-70mm": {
        "name": "ASTROMAN Voyager 70mm",
        "category": "beginner",
        "aperture": 70,
    },
    "explorer-90mm": {
        "name": "ASTROMAN Explorer 90mm",
        "category": "intermediate",
        "aperture": 90,
    },
    "deepsky-130mm": {
        "name": "ASTROMAN DeepSky 130mm",
        "category": "advanced",
        "aperture": 130,
    },
    "prostar-200mm": {
        "name": "ASTROMAN ProStar 200mm",
        "category": "professional",
        "aperture": 200,
    },
    "galaxy-projector": {
        "name": "ASTROMAN Galaxy Projector",
        "category": "accessory",
        "aperture": 0,
    },
    "luna-binoculars": {
        "name": "ASTROMAN Luna Binoculars",
        "category": "beginner",
        "aperture": 50,
    },
}


def recommend_telescope(
    best_planet: Optional[PlanetInfo],
    cloud_coverage: int,
    moon_illumination: float,
) -> TelescopeRecommendation:
    """
    Smart telescope recommendation based on:
    - Which planet is brightest
    - Cloud coverage
    - Moon phase
    """

    base_url = settings.astroman_products_url

    # HIGH CLOUDS → Galaxy Projector
    if cloud_coverage > 75:
        return TelescopeRecommendation(
            name="ASTROMAN Galaxy Projector",
            slug="galaxy-projector",
            category="accessory",
            reason_ka="ღრუბლიანი ღამეა — Galaxy Projector-ით კოსმოსი სახლში შემოიტანეთ",
            product_url=f"{base_url}/galaxy-projector",
        )

    if not best_planet:
        # Moon is the main target
        if moon_illumination > 20:
            return TelescopeRecommendation(
                name="ASTROMAN Luna Binoculars",
                slug="luna-binoculars",
                category="beginner",
                reason_ka="მთვარის შესანიშნავი ხედი ასტრონომიული ბინოკლით",
                product_url=f"{base_url}/luna-binoculars",
            )
        return TelescopeRecommendation(
            name="ASTROMAN Voyager 70mm",
            slug="voyager-70mm",
            category="beginner",
            reason_ka="უნივერსალური ტელესკოპი ყოველღამის დაკვირვებისთვის",
            product_url=f"{base_url}/voyager-70mm",
        )

    planet = best_planet.name

    # BRIGHT PLANETS (Venus, Jupiter) → Beginner scope
    if planet in ("Venus",) and best_planet.magnitude < -3:
        return TelescopeRecommendation(
            name="ASTROMAN Voyager 70mm",
            slug="voyager-70mm",
            category="beginner",
            reason_ka=f"{best_planet.name_ka} ისეთი კაშკაშია, რომ 70mm ტელესკოპითაც ბრწყინვალედ ჩანს",
            product_url=f"{base_url}/voyager-70mm",
        )

    # JUPITER → 70mm+ recommended
    if planet == "Jupiter":
        return TelescopeRecommendation(
            name="ASTROMAN Explorer 90mm",
            slug="explorer-90mm",
            category="intermediate",
            reason_ka="იუპიტერის ზოლები და გალილეოს თანამგზავრები 90mm-ზე შესანიშნავად ჩანს",
            product_url=f"{base_url}/explorer-90mm",
        )

    # SATURN → 70mm+ for rings
    if planet == "Saturn":
        return TelescopeRecommendation(
            name="ASTROMAN Explorer 90mm",
            slug="explorer-90mm",
            category="intermediate",
            reason_ka="სატურნის რგოლები 90mm ტელესკოპით განსაკუთრებით ლამაზად გამოჩნდება",
            product_url=f"{base_url}/explorer-90mm",
        )

    # MARS → Needs higher aperture for detail
    if planet == "Mars":
        return TelescopeRecommendation(
            name="ASTROMAN DeepSky 130mm",
            slug="deepsky-130mm",
            category="advanced",
            reason_ka="მარსის ზედაპირის დეტალებისთვის 130mm აპერტურა იდეალურია",
            product_url=f"{base_url}/deepsky-130mm",
        )

    # DISTANT PLANETS (Uranus, Neptune) → Large aperture
    if planet in ("Uranus", "Neptune"):
        return TelescopeRecommendation(
            name="ASTROMAN DeepSky 130mm",
            slug="deepsky-130mm",
            category="advanced",
            reason_ka=f"{best_planet.name_ka} შორეული პლანეტაა — საჭიროა მინიმუმ 130mm აპერტურა",
            product_url=f"{base_url}/deepsky-130mm",
        )

    # MERCURY → Beginner, but tricky
    if planet == "Mercury":
        return TelescopeRecommendation(
            name="ASTROMAN Voyager 70mm",
            slug="voyager-70mm",
            category="beginner",
            reason_ka="მერკური ჰორიზონტთან ახლოს ჩანს — 70mm ტელესკოპი საკმარისია",
            product_url=f"{base_url}/voyager-70mm",
        )

    # Default
    return TelescopeRecommendation(
        name="ASTROMAN Voyager 70mm",
        slug="voyager-70mm",
        category="beginner",
        reason_ka="საუკეთესო არჩევანი ყოველღამის ასტრონომიული დაკვირვებისთვის",
        product_url=f"{base_url}/voyager-70mm",
    )
