"""
ASTROMAN Sky Intelligence — Database Initialization Script
Run: python scripts/init_db.py
"""
import asyncio
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import init_db, seed_telescopes


async def main():
    print("🔧 Initializing ASTROMAN database...")
    await init_db()
    print("✅ Tables created")

    await seed_telescopes()
    print("✅ Telescope products seeded")

    print("🔭 Database ready!")


if __name__ == "__main__":
    asyncio.run(main())
