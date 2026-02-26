"""
Astroman Skywatcher — Configuration
"""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Application
    app_name: str = "Astroman Skywatcher"
    app_env: str = "development"
    app_debug: bool = False
    app_secret_key: str = "change-me-in-production"
    app_host: str = "0.0.0.0"
    app_port: int = 8000

    # Admin
    admin_username: str = "admin"
    admin_password: str = "admin"

    # Location (Tbilisi defaults)
    location_lat: float = 41.7151
    location_lon: float = 44.8271
    location_name: str = "თბილისი"
    timezone: str = "Asia/Tbilisi"

    # OpenWeather
    openweather_api_key: str = ""

    # Email
    email_provider: str = "smtp"
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = "sky@astroman.ge"
    smtp_from_name: str = "Astroman Skywatcher"
    sendgrid_api_key: str = ""
    sendgrid_from_email: str = "sky@astroman.ge"

    # Telegram
    telegram_bot_token: str = ""
    telegram_enabled: bool = False

    # Scheduler
    daily_send_hour: int = 17
    daily_send_minute: int = 0
    weekly_summary_day: int = 0

    # Store
    astroman_store_url: str = "https://astroman.ge"
    astroman_products_url: str = "https://astroman.ge/products"

    # WooCommerce API
    woo_api_url: str = ""           # e.g. https://astroman.ge/wp-json/wc/v3
    woo_consumer_key: str = ""
    woo_consumer_secret: str = ""
    woo_cache_ttl_seconds: int = 600  # 10 minutes

    # Store Physical Location
    store_name: str = "ASTROMAN"
    store_address: str = "თბილისი, საქართველო"
    store_city: str = "თბილისი"
    store_country: str = "საქართველო"
    store_google_maps_url: str = "https://maps.google.com/?q=ASTROMAN+Tbilisi"
    store_phone: str = ""
    store_email: str = "info@astroman.ge"
    store_working_hours_weekday: str = "10:00–20:00"
    store_working_hours_weekend: str = "11:00–18:00"
    store_instagram: str = "https://instagram.com/astroman.ge"
    store_facebook: str = "https://facebook.com/astroman.ge"

    # Notifications (future architecture)
    notifications_enabled: bool = False
    clear_sky_alert_threshold: int = 15   # cloud % below which to alert
    planet_rise_alert_enabled: bool = False

    # Database
    database_url: str = f"sqlite:///{BASE_DIR / 'astroman.db'}"

    @property
    def db_path(self) -> str:
        return str(BASE_DIR / "astroman.db")


settings = Settings()
