"""
ASTROMAN — Telescope Smart Linking
Dynamic product recommendation based on observation conditions.
All recommendations link to the Foreseen 80mm — ASTROMAN's primary product.
"""
import logging
from typing import Optional
from dataclasses import dataclass

from app.config import settings
from app.models import PlanetInfo

logger = logging.getLogger("astroman.telescope")

FORESEEN_NAME = "Foreseen 80mm"
FORESEEN_SLUG = "telescope-foreseen-80mm"


@dataclass
class TelescopeRecommendation:
    name: str
    slug: str
    category: str
    reason_ka: str
    product_url: str


def recommend_telescope(
    best_planet: Optional[PlanetInfo],
    cloud_coverage: int,
    moon_illumination: float,
) -> TelescopeRecommendation:
    """
    Smart telescope recommendation based on:
    - Which planet is brightest / most visible
    - Cloud coverage
    - Moon phase
    All recommendations link to the Foreseen 80mm.
    """
    base_url = settings.astroman_products_url
    product_url = f"{base_url}/{FORESEEN_SLUG}"

    # HIGH CLOUDS — still recommend the scope
    if cloud_coverage > 75:
        return TelescopeRecommendation(
            name=FORESEEN_NAME,
            slug=FORESEEN_SLUG,
            category="beginner",
            reason_ka="ღამე ღრუბლიანია — მაგრამ Foreseen 80mm ყოველ მოწმენდილ ღამეს მზადაა!",
            product_url=product_url,
        )

    if not best_planet:
        if moon_illumination > 20:
            return TelescopeRecommendation(
                name=FORESEEN_NAME,
                slug=FORESEEN_SLUG,
                category="beginner",
                reason_ka="მთვარის კრატერები Foreseen 80mm-ით შთამბეჭდავად ჩანს",
                product_url=product_url,
            )
        return TelescopeRecommendation(
            name=FORESEEN_NAME,
            slug=FORESEEN_SLUG,
            category="beginner",
            reason_ka="საუკეთესო არჩევანი ყოველღამის ასტრონომიული დაკვირვებისთვის",
            product_url=product_url,
        )

    planet = best_planet.name

    if planet == "Venus":
        return TelescopeRecommendation(
            name=FORESEEN_NAME,
            slug=FORESEEN_SLUG,
            category="beginner",
            reason_ka=f"ვენერას ფაზები Foreseen 80mm-ით ნათლად ჩანს — კაშკაშა სამიზნე",
            product_url=product_url,
        )

    if planet == "Jupiter":
        return TelescopeRecommendation(
            name=FORESEEN_NAME,
            slug=FORESEEN_SLUG,
            category="beginner",
            reason_ka="იუპიტერის ზოლები და გალილეოს 4 თანამგზავრი Foreseen 80mm-ით კარგად ჩანს",
            product_url=product_url,
        )

    if planet == "Saturn":
        return TelescopeRecommendation(
            name=FORESEEN_NAME,
            slug=FORESEEN_SLUG,
            category="beginner",
            reason_ka="სატურნის რგოლები Foreseen 80mm-ით განსაკუთრებით ლამაზად გამოჩნდება",
            product_url=product_url,
        )

    if planet == "Mars":
        return TelescopeRecommendation(
            name=FORESEEN_NAME,
            slug=FORESEEN_SLUG,
            category="beginner",
            reason_ka="მარსის ნარინჯისფერი დისკი Foreseen 80mm-ით კარგად ჩანს ოპოზიციის დროს",
            product_url=product_url,
        )

    if planet in ("Uranus", "Neptune"):
        return TelescopeRecommendation(
            name=FORESEEN_NAME,
            slug=FORESEEN_SLUG,
            category="beginner",
            reason_ka=f"{best_planet.name_ka} Foreseen 80mm-ით ხელმისაწვდომია — ცისფერი წერტილი ჩანს",
            product_url=product_url,
        )

    if planet == "Mercury":
        return TelescopeRecommendation(
            name=FORESEEN_NAME,
            slug=FORESEEN_SLUG,
            category="beginner",
            reason_ka="მერკურის ფაზა Foreseen 80mm-ით შესამჩნევია — ჰორიზონტთან ახლოს ეძებეთ",
            product_url=product_url,
        )

    return TelescopeRecommendation(
        name=FORESEEN_NAME,
        slug=FORESEEN_SLUG,
        category="beginner",
        reason_ka="Foreseen 80mm — ASTROMAN-ის საუკეთესო არჩევანი დამწყები ასტრონომისთვის",
        product_url=product_url,
    )
