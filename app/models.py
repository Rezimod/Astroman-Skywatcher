"""
Astroman Skywatcher — Pydantic Models
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ─────────────────────────────────────────────
# Subscriber
# ─────────────────────────────────────────────
class SubscriberCreate(BaseModel):
    email: str
    name: str = ""
    level: str = "beginner"


class SubscriberOut(BaseModel):
    id: int
    email: str
    name: str
    is_active: bool
    level: str
    created_at: Optional[str] = None


# ─────────────────────────────────────────────
# Core Astronomy
# ─────────────────────────────────────────────
class PlanetInfo(BaseModel):
    name: str
    name_ka: str
    altitude: float
    azimuth: float
    is_visible: bool
    magnitude: float
    constellation: str = ""


class PlanetLiveInfo(PlanetInfo):
    """Extended planet info for real-time sky API."""
    rise_time: Optional[str] = None
    set_time: Optional[str] = None
    transit_time: Optional[str] = None
    direction: str = ""
    magnification_min: int = 0
    magnification_max: int = 0
    magnification_note: str = ""


class MoonLiveInfo(BaseModel):
    phase: str = ""
    phase_en: str = ""
    illumination: float = 0.0
    altitude: float = 0.0
    azimuth: float = 0.0
    is_visible: bool = False
    rise_time: Optional[str] = None
    set_time: Optional[str] = None


class SkyLiveResponse(BaseModel):
    """Full response for GET /api/sky/live"""
    timestamp: str
    location: dict  # {lat, lon, name, timezone}
    sun: dict       # {rise, set, is_night}
    moon: MoonLiveInfo
    planets: list[PlanetLiveInfo] = []
    visible_planets: list[PlanetLiveInfo] = []
    best_object: Optional[PlanetLiveInfo] = None
    best_viewing_window: dict = {}  # {start, end, reason}
    visibility: dict = {}  # from visibility engine
    advisor: dict = {}     # from smart advisor


# ─────────────────────────────────────────────
# Visibility Score Engine
# ─────────────────────────────────────────────
class VisibilityScore(BaseModel):
    score: int  # 0-100
    grade: str  # A / B / C / D / F
    recommendation: str  # "Excellent" | "Good" | "Moderate" | "Poor" | "Not Recommended"
    recommendation_ka: str
    factors: dict = {}  # breakdown of each factor's contribution
    tips: list[str] = []


# ─────────────────────────────────────────────
# Smart Observation Advisor
# ─────────────────────────────────────────────
class AdvisorRecommendation(BaseModel):
    celestial_object: str = ""
    suggested_product_type: str = ""
    magnification_range: str = ""
    reason: str = ""
    reason_ka: str = ""
    difficulty: str = "beginner"
    product_slug: Optional[str] = None
    product_url: Optional[str] = None


# ─────────────────────────────────────────────
# WooCommerce Store
# ─────────────────────────────────────────────
class StoreProduct(BaseModel):
    id: int
    name: str
    slug: str
    price: str = ""
    regular_price: str = ""
    sale_price: str = ""
    in_stock: bool = True
    stock_quantity: Optional[int] = None
    short_description: str = ""
    image_url: str = ""
    permalink: str = ""
    categories: list[str] = []


class StoreInfo(BaseModel):
    name: str = "ASTROMAN"
    address: str = ""
    city: str = ""
    country: str = ""
    google_maps_url: str = ""
    phone: str = ""
    email: str = ""
    website: str = ""
    working_hours: dict = {}
    social: dict = {}


# ─────────────────────────────────────────────
# Daily Observation (existing, unchanged)
# ─────────────────────────────────────────────
class ObservationData(BaseModel):
    date: str
    planets: list[PlanetInfo] = []
    moon_phase: str = ""
    moon_illumination: float = 0.0
    sunset_time: str = ""
    cloud_coverage: int = 0
    temperature: float = 0.0
    humidity: int = 0
    wind_speed: float = 0.0
    observation_text: str = ""
    recommended_telescope: str = ""
    product_link: str = ""
    best_object: str = ""


# ─────────────────────────────────────────────
# Admin (existing, unchanged)
# ─────────────────────────────────────────────
class AdminLogin(BaseModel):
    username: str
    password: str


class OverrideText(BaseModel):
    date: str
    text: str


class TestEmailRequest(BaseModel):
    email: str


class TelescopePromotion(BaseModel):
    name: str
    slug: str
    category: str = "beginner"
    min_aperture: int = 0
    description: str = ""
