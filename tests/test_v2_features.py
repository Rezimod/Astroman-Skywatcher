"""
Astroman Skywatcher — Tests for v2.0 Features
"""
import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.visibility import calculate_visibility_score
from app.core.observation import recommend_telescope_smart
from app.core.store import get_store_info, _get_fallback_products
from app.core.astronomy import (
    get_planet_positions_live,
    get_moon_live,
    get_sun_times,
    get_best_viewing_window,
    get_best_visible_planet_live,
)


# ─────────────────────────────────────────────
# Feature 2: Visibility Score Engine
# ─────────────────────────────────────────────

class TestVisibilityScore:

    def test_perfect_conditions(self):
        """Clear sky, low humidity, calm wind, new moon → high score."""
        result = calculate_visibility_score(
            cloud_pct=5, humidity_pct=40, wind_speed=2.0, moon_illumination=2.0
        )
        assert result.score >= 80
        assert result.grade == "A"
        assert result.recommendation == "Excellent"

    def test_terrible_conditions(self):
        """Overcast, humid, windy, full moon → low score."""
        result = calculate_visibility_score(
            cloud_pct=95, humidity_pct=95, wind_speed=20.0, moon_illumination=100.0
        )
        assert result.score <= 20
        assert result.grade in ("D", "F")

    def test_moderate_conditions(self):
        """Mixed conditions → middle range."""
        result = calculate_visibility_score(
            cloud_pct=40, humidity_pct=65, wind_speed=8.0, moon_illumination=50.0
        )
        assert 30 <= result.score <= 70

    def test_score_bounds(self):
        """Score should always be 0–100."""
        for clouds in (0, 50, 100):
            for humidity in (0, 50, 100):
                for wind in (0.0, 15.0, 30.0):
                    for moon in (0.0, 50.0, 100.0):
                        result = calculate_visibility_score(clouds, humidity, wind, moon)
                        assert 0 <= result.score <= 100

    def test_factors_present(self):
        """All four factors should be in the response."""
        result = calculate_visibility_score(20, 50, 5.0, 30.0)
        assert "clouds" in result.factors
        assert "humidity" in result.factors
        assert "wind" in result.factors
        assert "moon" in result.factors

    def test_tips_generated(self):
        """Tips should be a list."""
        result = calculate_visibility_score(70, 85, 15.0, 80.0)
        assert isinstance(result.tips, list)
        assert len(result.tips) > 0


# ─────────────────────────────────────────────
# Feature 4: Smart Observation Advisor
# ─────────────────────────────────────────────

class TestSmartAdvisor:

    def test_low_visibility_projector(self):
        """Very low visibility → projector."""
        result = recommend_telescope_smart("Jupiter", 15)
        assert result.suggested_product_type == "projector"
        assert "galaxy-projector" in result.product_slug

    def test_low_visibility_binoculars(self):
        """Low visibility → binoculars."""
        result = recommend_telescope_smart("Jupiter", 35)
        assert result.suggested_product_type == "binoculars"

    def test_moon_beginner(self):
        """Moon → beginner telescope."""
        result = recommend_telescope_smart("Moon", 70)
        assert result.suggested_product_type == "beginner_telescope"

    def test_jupiter_midpower(self):
        """Jupiter → mid-power telescope."""
        result = recommend_telescope_smart("Jupiter", 70)
        assert result.suggested_product_type == "mid_power_telescope"

    def test_saturn_midpower(self):
        """Saturn → mid-power telescope."""
        result = recommend_telescope_smart("Saturn", 80)
        assert result.suggested_product_type == "mid_power_telescope"

    def test_deep_sky_advanced(self):
        """Deep sky object → advanced telescope."""
        result = recommend_telescope_smart("Orion Nebula", 80)
        assert result.suggested_product_type == "advanced_telescope"

    def test_mars_advanced(self):
        """Mars → advanced telescope."""
        result = recommend_telescope_smart("Mars", 75)
        assert result.suggested_product_type == "advanced_telescope"

    def test_georgian_names(self):
        """Georgian object names should work."""
        result = recommend_telescope_smart("იუპიტერი", 70)
        assert result.suggested_product_type == "mid_power_telescope"

        result = recommend_telescope_smart("მთვარე", 70)
        assert result.suggested_product_type == "beginner_telescope"

    def test_product_url_present(self):
        """All recommendations should have product_url."""
        for obj in ("Moon", "Jupiter", "Saturn", "Mars", "Orion Nebula"):
            result = recommend_telescope_smart(obj, 70)
            assert result.product_url is not None
            assert "astroman.ge" in result.product_url


# ─────────────────────────────────────────────
# Feature 3/5: Store
# ─────────────────────────────────────────────

class TestStore:

    def test_fallback_products(self):
        """Fallback catalog should return products."""
        products = _get_fallback_products()
        assert len(products) >= 5
        slugs = [p.slug for p in products]
        assert "voyager-70mm" in slugs
        assert "galaxy-projector" in slugs

    def test_store_info(self):
        """Store info should return valid data."""
        info = get_store_info()
        assert info.name == "ASTROMAN"
        assert info.city == "თბილისი"
        assert "weekday" in info.working_hours


# ─────────────────────────────────────────────
# Feature 1: Live Sky (astronomy extensions)
# ─────────────────────────────────────────────

class TestSkyLive:

    def test_planets_live_tbilisi(self):
        """Live planets for Tbilisi should return all 7."""
        planets = get_planet_positions_live(41.7151, 44.8271)
        assert len(planets) == 7
        names = {p.name for p in planets}
        assert "Jupiter" in names
        assert "Saturn" in names

    def test_planets_have_rise_set(self):
        """At least some planets should have rise/set times."""
        planets = get_planet_positions_live(41.7151, 44.8271)
        has_rise = any(p.rise_time and p.rise_time != "N/A" for p in planets)
        # At moderate latitudes, at least some planets should have rise times
        assert has_rise

    def test_planets_have_direction(self):
        """All planets should have direction strings."""
        planets = get_planet_positions_live(41.7151, 44.8271)
        for p in planets:
            assert isinstance(p.direction, str)
            assert len(p.direction) > 0

    def test_moon_live(self):
        """Moon live data should have phase and illumination."""
        moon = get_moon_live(41.7151, 44.8271)
        assert isinstance(moon.phase, str)
        assert 0 <= moon.illumination <= 100

    def test_sun_times(self):
        """Sun times should return rise, set, is_night."""
        sun = get_sun_times(41.7151, 44.8271)
        assert "rise" in sun
        assert "set" in sun
        assert "is_night" in sun
        assert isinstance(sun["is_night"], bool)

    def test_viewing_window(self):
        """Viewing window should return start, end, reason."""
        window = get_best_viewing_window(41.7151, 44.8271)
        assert "start" in window
        assert "end" in window
        assert "reason" in window

    def test_best_visible_live(self):
        """Best visible should return brightest if any visible."""
        planets = get_planet_positions_live(41.7151, 44.8271)
        best = get_best_visible_planet_live(planets)
        # May be None if no planets currently above horizon
        if best is not None:
            assert best.is_visible
            assert best.magnitude <= min(
                p.magnitude for p in planets if p.is_visible
            )

    def test_different_location(self):
        """Should work for locations other than Tbilisi."""
        # New York
        planets = get_planet_positions_live(40.7128, -74.0060)
        assert len(planets) == 7

        # Sydney
        planets = get_planet_positions_live(-33.8688, 151.2093)
        assert len(planets) == 7


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
