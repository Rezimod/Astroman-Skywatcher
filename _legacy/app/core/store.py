"""
Astroman Skywatcher — WooCommerce Store Integration

Fetches products from WooCommerce REST API v3.
Includes simple in-memory TTL cache (no Redis needed for MVP).
Server-side only — API keys never leave the backend.
"""
import logging
import time
from typing import Optional

import httpx

from app.config import settings
from app.models import StoreProduct, StoreInfo

logger = logging.getLogger("astroman.store")


# ─────────────────────────────────────────────
# In-Memory TTL Cache
# ─────────────────────────────────────────────

class _MemoryCache:
    """Simple thread-safe-ish TTL cache. Good enough for single-process FastAPI."""

    def __init__(self):
        self._store: dict[str, tuple[float, any]] = {}

    def get(self, key: str) -> Optional[any]:
        entry = self._store.get(key)
        if entry is None:
            return None
        expires_at, value = entry
        if time.time() > expires_at:
            del self._store[key]
            return None
        return value

    def set(self, key: str, value: any, ttl_seconds: int = 600):
        self._store[key] = (time.time() + ttl_seconds, value)

    def clear(self):
        self._store.clear()


_cache = _MemoryCache()

CACHE_KEY_PRODUCTS = "woo_products"
CACHE_KEY_PRODUCT_DETAIL = "woo_product_{slug}"


# ─────────────────────────────────────────────
# WooCommerce API Client
# ─────────────────────────────────────────────

def _is_configured() -> bool:
    """Check if WooCommerce credentials are set."""
    return bool(
        settings.woo_api_url
        and settings.woo_consumer_key
        and settings.woo_consumer_secret
    )


async def _woo_get(endpoint: str, params: dict | None = None) -> dict | list | None:
    """Execute authenticated GET against WooCommerce REST API."""
    if not _is_configured():
        logger.debug("WooCommerce API not configured")
        return None

    url = f"{settings.woo_api_url.rstrip('/')}/{endpoint.lstrip('/')}"
    auth_params = {
        "consumer_key": settings.woo_consumer_key,
        "consumer_secret": settings.woo_consumer_secret,
    }
    if params:
        auth_params.update(params)

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(url, params=auth_params)
            resp.raise_for_status()
            return resp.json()
    except httpx.HTTPStatusError as e:
        logger.error(f"WooCommerce API HTTP {e.response.status_code}: {e}")
        return None
    except Exception as e:
        logger.error(f"WooCommerce API error: {e}")
        return None


# ─────────────────────────────────────────────
# Product Fetching
# ─────────────────────────────────────────────

def _parse_product(raw: dict) -> StoreProduct:
    """Parse a WooCommerce product JSON into StoreProduct."""
    images = raw.get("images", [])
    image_url = images[0]["src"] if images else ""

    categories = [c.get("name", "") for c in raw.get("categories", [])]

    return StoreProduct(
        id=raw.get("id", 0),
        name=raw.get("name", ""),
        slug=raw.get("slug", ""),
        price=raw.get("price", ""),
        regular_price=raw.get("regular_price", ""),
        sale_price=raw.get("sale_price", ""),
        in_stock=raw.get("in_stock", True),
        stock_quantity=raw.get("stock_quantity"),
        short_description=raw.get("short_description", ""),
        image_url=image_url,
        permalink=raw.get("permalink", ""),
        categories=categories,
    )


async def get_products(
    per_page: int = 20,
    category: str | None = None,
    force_refresh: bool = False,
) -> list[StoreProduct]:
    """
    Fetch products from WooCommerce with caching.

    Args:
        per_page: number of products (max 100)
        category: optional WooCommerce category slug filter
        force_refresh: bypass cache
    """
    cache_key = f"{CACHE_KEY_PRODUCTS}_{category or 'all'}_{per_page}"

    if not force_refresh:
        cached = _cache.get(cache_key)
        if cached is not None:
            logger.debug(f"Cache hit: {cache_key}")
            return cached

    # Fallback: return hardcoded catalog if WooCommerce not configured
    if not _is_configured():
        return _get_fallback_products()

    params = {
        "per_page": min(per_page, 100),
        "status": "publish",
        "orderby": "popularity",
    }
    if category:
        params["category"] = category

    raw_products = await _woo_get("products", params)
    if raw_products is None:
        logger.warning("WooCommerce fetch failed, using fallback")
        return _get_fallback_products()

    products = [_parse_product(p) for p in raw_products]
    _cache.set(cache_key, products, settings.woo_cache_ttl_seconds)
    logger.info(f"Fetched {len(products)} products from WooCommerce")

    return products


async def get_product_by_slug(slug: str) -> Optional[StoreProduct]:
    """Fetch a single product by slug."""
    cache_key = CACHE_KEY_PRODUCT_DETAIL.format(slug=slug)
    cached = _cache.get(cache_key)
    if cached is not None:
        return cached

    if not _is_configured():
        # Check fallback
        for p in _get_fallback_products():
            if p.slug == slug:
                return p
        return None

    raw = await _woo_get("products", {"slug": slug})
    if not raw or not isinstance(raw, list) or len(raw) == 0:
        return None

    product = _parse_product(raw[0])
    _cache.set(cache_key, product, settings.woo_cache_ttl_seconds)
    return product


def clear_product_cache():
    """Admin: force cache refresh."""
    _cache.clear()
    logger.info("Product cache cleared")


# ─────────────────────────────────────────────
# Fallback Catalog (when WooCommerce is not configured)
# ─────────────────────────────────────────────

def _get_fallback_products() -> list[StoreProduct]:
    """Hardcoded product catalog for development / fallback."""
    base = settings.astroman_products_url
    return [
        StoreProduct(
            id=1, name="ASTROMAN Voyager 70mm", slug="voyager-70mm",
            price="299", regular_price="299", in_stock=True,
            short_description="დამწყებთათვის იდეალური რეფრაქტორი ტელესკოპი",
            permalink=f"{base}/voyager-70mm", categories=["ტელესკოპები", "დამწყები"],
        ),
        StoreProduct(
            id=2, name="ASTROMAN Explorer 90mm", slug="explorer-90mm",
            price="549", regular_price="549", in_stock=True,
            short_description="საშუალო დონის რეფრაქტორი პლანეტების დასაკვირვებლად",
            permalink=f"{base}/explorer-90mm", categories=["ტელესკოპები", "საშუალო"],
        ),
        StoreProduct(
            id=3, name="ASTROMAN DeepSky 130mm", slug="deepsky-130mm",
            price="899", regular_price="899", in_stock=True,
            short_description="ღრმა კოსმოსის ობიექტებისთვის რეფლექტორი",
            permalink=f"{base}/deepsky-130mm", categories=["ტელესკოპები", "მოწინავე"],
        ),
        StoreProduct(
            id=4, name="ASTROMAN ProStar 200mm", slug="prostar-200mm",
            price="1899", regular_price="1899", in_stock=True,
            short_description="პროფესიონალური დობსონის ტელესკოპი",
            permalink=f"{base}/prostar-200mm", categories=["ტელესკოპები", "პროფესიონალური"],
        ),
        StoreProduct(
            id=5, name="ASTROMAN Galaxy Projector", slug="galaxy-projector",
            price="89", regular_price="89", in_stock=True,
            short_description="გალაქტიკის პროექტორი ღრუბლიანი ღამეებისთვის",
            permalink=f"{base}/galaxy-projector", categories=["აქსესუარები"],
        ),
        StoreProduct(
            id=6, name="ASTROMAN Luna Binoculars", slug="luna-binoculars",
            price="149", regular_price="149", in_stock=True,
            short_description="ასტრონომიული ბინოკლი მთვარის დასაკვირვებლად",
            permalink=f"{base}/luna-binoculars", categories=["ბინოკლები", "დამწყები"],
        ),
    ]


# ─────────────────────────────────────────────
# Store Info
# ─────────────────────────────────────────────

def get_store_info() -> StoreInfo:
    """Return physical store information from config."""
    return StoreInfo(
        name=settings.store_name,
        address=settings.store_address,
        city=settings.store_city,
        country=settings.store_country,
        google_maps_url=settings.store_google_maps_url,
        phone=settings.store_phone,
        email=settings.store_email,
        website=settings.astroman_store_url,
        working_hours={
            "weekday": settings.store_working_hours_weekday,
            "saturday": settings.store_working_hours_weekend,
            "sunday": "დაკეტილი",
        },
        social={
            "instagram": settings.store_instagram,
            "facebook": settings.store_facebook,
        },
    )
