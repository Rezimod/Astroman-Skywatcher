"""
Astroman Skywatcher — Tests
"""
import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.astronomy import (
    get_planet_positions,
    get_moon_phase,
    get_sunset_time,
    get_best_visible_planet,
    get_azimuth_direction,
)
from app.core.telescope import recommend_telescope
from app.core.observation import generate_observation_text
from app.models import PlanetInfo


def test_get_planet_positions():
    """Test that planet positions are returned."""
    planets = get_planet_positions()
    assert len(planets) > 0
    assert all(isinstance(p, PlanetInfo) for p in planets)
    # Check all expected planets
    names = {p.name for p in planets}
    assert "Venus" in names
    assert "Mars" in names
    assert "Jupiter" in names
    assert "Saturn" in names


def test_get_moon_phase():
    """Test moon phase calculation."""
    phase, illumination = get_moon_phase()
    assert isinstance(phase, str)
    assert len(phase) > 0
    assert 0 <= illumination <= 100


def test_get_sunset_time():
    """Test sunset time calculation."""
    sunset = get_sunset_time()
    assert isinstance(sunset, str)
    assert sunset != "N/A"
    # Should be in HH:MM format
    parts = sunset.split(":")
    assert len(parts) == 2


def test_get_azimuth_direction():
    """Test azimuth to direction conversion."""
    assert get_azimuth_direction(0) == "ჩრდილოეთი"
    assert get_azimuth_direction(90) == "აღმოსავლეთი"
    assert get_azimuth_direction(180) == "სამხრეთი"
    assert get_azimuth_direction(270) == "დასავლეთი"


def test_recommend_telescope_cloudy():
    """Test that cloudy weather recommends Galaxy Projector."""
    rec = recommend_telescope(None, cloud_coverage=90, moon_illumination=50)
    assert "Galaxy Projector" in rec.name


def test_recommend_telescope_jupiter():
    """Test Jupiter recommendation."""
    jupiter = PlanetInfo(
        name="Jupiter", name_ka="იუპიტერი",
        altitude=45, azimuth=180,
        is_visible=True, magnitude=-2.5,
        constellation="ვერძი",
    )
    rec = recommend_telescope(jupiter, cloud_coverage=10, moon_illumination=30)
    assert "90mm" in rec.name or "Explorer" in rec.name


def test_generate_observation_text():
    """Test observation text generation."""
    planets = [
        PlanetInfo(name="Venus", name_ka="ვენერა", altitude=30, azimuth=270,
                   is_visible=True, magnitude=-4.0, constellation="ვერძი"),
        PlanetInfo(name="Mars", name_ka="მარსი", altitude=-10, azimuth=90,
                   is_visible=False, magnitude=1.5, constellation="კურო"),
    ]
    text = generate_observation_text(
        best_planet=planets[0],
        planets=planets,
        moon_phase="მზარდი ნამგალი",
        moon_illumination=25,
        sunset_time="19:45",
        cloud_coverage=15,
        temperature=18,
    )
    assert "ASTROMAN" in text
    assert "ვენერა" in text.upper() or "ვენერა" in text


def test_best_visible_planet():
    """Test best planet selection by brightness."""
    planets = [
        PlanetInfo(name="Venus", name_ka="ვენერა", altitude=30, azimuth=270,
                   is_visible=True, magnitude=-4.0, constellation=""),
        PlanetInfo(name="Jupiter", name_ka="იუპიტერი", altitude=45, azimuth=180,
                   is_visible=True, magnitude=-2.5, constellation=""),
        PlanetInfo(name="Mars", name_ka="მარსი", altitude=-5, azimuth=90,
                   is_visible=False, magnitude=1.5, constellation=""),
    ]
    best = get_best_visible_planet(planets)
    assert best is not None
    assert best.name == "Venus"  # Brightest (lowest magnitude)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
