"""
Astroman Skywatcher — Store API

GET /api/store/products     → WooCommerce product listing
GET /api/store/products/{slug} → Single product by slug
GET /api/store/info         → Physical store information
POST /api/store/cache/clear → Admin: clear product cache
"""
import logging
from fastapi import APIRouter, Query, Request, HTTPException

from app.config import settings
from app.core.store import (
    get_products,
    get_product_by_slug,
    get_store_info,
    clear_product_cache,
)

logger = logging.getLogger("astroman.api.store")

router = APIRouter(prefix="/api/store", tags=["Store"])


@router.get("/products")
async def store_products(
    per_page: int = Query(default=20, ge=1, le=100),
    category: str | None = Query(default=None, description="Filter by category slug"),
    refresh: bool = Query(default=False, description="Force cache refresh"),
):
    """
    Fetch products from WooCommerce (or fallback catalog).
    Results are cached for 10 minutes by default.
    """
    products = await get_products(
        per_page=per_page,
        category=category,
        force_refresh=refresh,
    )
    return {
        "count": len(products),
        "products": [p.model_dump() for p in products],
    }


@router.get("/products/{slug}")
async def store_product_detail(slug: str):
    """Fetch a single product by slug."""
    product = await get_product_by_slug(slug)
    if not product:
        raise HTTPException(404, f"პროდუქტი '{slug}' ვერ მოიძებნა")
    return product.model_dump()


@router.get("/info")
async def store_info():
    """
    Physical store location and contact information.
    Returns hardcoded config values (Feature 5).
    """
    info = get_store_info()
    return info.model_dump()


@router.post("/cache/clear")
async def store_cache_clear(request: Request):
    """Admin: Clear product cache to force WooCommerce re-fetch."""
    # Simple auth check via cookie (same as admin panel)
    if request.cookies.get("admin_auth") != settings.app_secret_key:
        raise HTTPException(401, "ავტორიზაცია საჭიროა")
    clear_product_cache()
    return {"success": True, "message": "Product cache cleared"}
