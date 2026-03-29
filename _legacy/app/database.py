"""
Astroman Skywatcher — Database Layer (SQLite)
"""
import os
import aiosqlite
import logging

logger = logging.getLogger("astroman.db")

# Resolve DB path without importing settings (avoids pydantic-settings at import time)
DB_PATH = os.environ.get(
    "DATABASE_URL",
    f"sqlite:///{os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'astroman.db')}"
).replace("sqlite:///", "")


async def get_db() -> aiosqlite.Connection:
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    return db


async def init_db():
    """Create tables if they don't exist."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript("""
            CREATE TABLE IF NOT EXISTS subscribers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                name TEXT DEFAULT '',
                telegram_chat_id TEXT DEFAULT '',
                is_active INTEGER DEFAULT 1,
                level TEXT DEFAULT 'beginner',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS observations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL UNIQUE,
                planets_data TEXT DEFAULT '{}',
                moon_phase TEXT DEFAULT '',
                moon_illumination REAL DEFAULT 0,
                sunset_time TEXT DEFAULT '',
                cloud_coverage INTEGER DEFAULT 0,
                temperature REAL DEFAULT 0,
                humidity INTEGER DEFAULT 0,
                wind_speed REAL DEFAULT 0,
                observation_text TEXT DEFAULT '',
                recommended_telescope TEXT DEFAULT '',
                product_link TEXT DEFAULT '',
                is_override INTEGER DEFAULT 0,
                override_text TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS email_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subscriber_id INTEGER,
                observation_id INTEGER,
                subject TEXT DEFAULT '',
                status TEXT DEFAULT 'pending',
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (subscriber_id) REFERENCES subscribers(id),
                FOREIGN KEY (observation_id) REFERENCES observations(id)
            );

            CREATE TABLE IF NOT EXISTS telescope_promotions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                slug TEXT NOT NULL,
                category TEXT DEFAULT 'beginner',
                min_aperture INTEGER DEFAULT 0,
                description TEXT DEFAULT '',
                is_active INTEGER DEFAULT 1,
                priority INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS admin_settings (
                key TEXT PRIMARY KEY,
                value TEXT DEFAULT ''
            );
        """)
        await db.commit()
        logger.info("Database initialized successfully")


async def seed_telescopes():
    """Seed default telescope products."""
    telescopes = [
        ("ASTROMAN Voyager 70mm", "voyager-70mm", "beginner", 70,
         "დამწყებთათვის იდეალური რეფრაქტორი"),
        ("ASTROMAN Explorer 90mm", "explorer-90mm", "intermediate", 90,
         "საშუალო დონის რეფრაქტორი პლანეტების დასაკვირვებლად"),
        ("ASTROMAN DeepSky 130mm", "deepsky-130mm", "advanced", 130,
         "ღრმა კოსმოსის ობიექტებისთვის რეფლექტორი"),
        ("ASTROMAN ProStar 200mm", "prostar-200mm", "professional", 200,
         "პროფესიონალური დობსონის ტელესკოპი"),
        ("ASTROMAN Galaxy Projector", "galaxy-projector", "accessory", 0,
         "გალაქტიკის პროექტორი ღრუბლიანი ღამეებისთვის"),
        ("ASTROMAN Luna Binoculars", "luna-binoculars", "beginner", 50,
         "ასტრონომიული ბინოკლი მთვარის დასაკვირვებლად"),
    ]
    async with aiosqlite.connect(DB_PATH) as db:
        for t in telescopes:
            await db.execute(
                """INSERT OR IGNORE INTO telescope_promotions
                   (name, slug, category, min_aperture, description, is_active, priority)
                   VALUES (?, ?, ?, ?, ?, 1, 0)""",
                t
            )
        await db.commit()
        logger.info("Telescope products seeded")
