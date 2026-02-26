"""
ASTROMAN Sky Intelligence System
Main FastAPI Application
"""
import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db, seed_telescopes
from app.services.scheduler import start_scheduler, stop_scheduler
from app.api.routes_dashboard import router as dashboard_router
from app.api.routes_admin import router as admin_router
from app.api.routes_subscribers import router as subscriber_router
from app.api.routes_api import router as api_router
from app.api.routes_sky import router as sky_router
from app.api.routes_store import router as store_router

# --- Logging ---
logging.basicConfig(
    level=logging.DEBUG if settings.app_debug else logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("astroman.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger("astroman")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — startup & shutdown."""
    logger.info("🔭 ASTROMAN Sky Intelligence starting...")

    # Initialize database
    await init_db()
    await seed_telescopes()
    logger.info("Database ready")

    # Start scheduler
    start_scheduler()
    logger.info(f"Scheduler active — daily at {settings.daily_send_hour}:{settings.daily_send_minute:02d}")

    logger.info(f"🚀 System running ({settings.app_env})")
    yield

    # Shutdown
    stop_scheduler()
    logger.info("ASTROMAN Sky Intelligence stopped")


# --- App ---
app = FastAPI(
    title="ASTROMAN Sky Intelligence",
    description="ავტომატური ასტრონომიული დაკვირვების სისტემა",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.app_debug else None,
    redoc_url="/redoc" if settings.app_debug else None,
)

# --- Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.app_debug else [settings.astroman_store_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Static Files ---
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# --- Routes ---
app.include_router(dashboard_router)
app.include_router(admin_router)
app.include_router(subscriber_router)
app.include_router(api_router)
app.include_router(sky_router)
app.include_router(store_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=settings.app_debug,
    )
