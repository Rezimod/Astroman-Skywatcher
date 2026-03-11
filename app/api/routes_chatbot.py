"""
ASTROMAN — Astronomy Chatbot API
Powered by Claude Haiku. Answers telescope, planet, deep-sky questions in Georgian.
Suggests products from astroman.ge with direct links.
"""
import logging
from typing import List, Dict

import httpx
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.config import settings

logger = logging.getLogger("astroman.chatbot")
router = APIRouter()

# ── Astroman product catalog ─────────────────────────────────────────────────
ASTROMAN_PRODUCTS = """
ASTROMAN.GE — პროდუქციის კატალოგი:

ტელესკოპები:
- Foreseen 80mm რეფრაქტორი — 856₾ — https://astroman.ge/telescope-foreseen-80mm/ — დამწყებთათვის საუკეთესო, 80mm აპერტურა, 500mm ფოკუსი, კომპლექტში: K25 + K10 ლინზა + ოდენიანი სათვალი + თანავარსკვლავედების რუქა
- Celestron PowerSeeker 70AZ — https://astroman.ge/celestron-powerseeker-70az/ — 70mm, 700mm ფოკუსი, AZ სამფეხა, კარგი დამწყებთათვის
- Celestron AstroMaster 70AZ — https://astroman.ge/celestron-astromaster-70az/ — 70mm, სწრაფი და ადვილი გამართვა
- Sky-Watcher BK 707AZ2 — https://astroman.ge/sky-watcher-bk-707az2/ — 70mm, კლასიკური ხარისხი
- Sky-Watcher BK 909AZ3 — https://astroman.ge/sky-watcher-bk-909az3/ — 90mm, ბოლნური დამწყებთათვის
- Celestron NexStar 4SE — https://astroman.ge/celestron-nexstar-4se/ — კომპიუტერული, GoTo სისტემა, 102mm
- Sky-Watcher Dobson 8" — https://astroman.ge/sky-watcher-dobson-8/ — 203mm, ღრმა ცის ობიექტებისთვის, ძლიერი

ბინოკლები:
- Celestron SkyMaster 20x80 — https://astroman.ge/celestron-skymaster-20x80/ — ასტრო-ბინოკლი, ვარსკვლავური გროვები, ნისლეულები
- Levenhuk Sherman PLUS 10x50 — https://astroman.ge/levenhuk-sherman-plus-10x50/ — მრავალმხრივი, ასტრო + ბუნება

აქსესუარები:
- ლინზების კომპლექტი (პლოსლი) — https://astroman.ge/category/aksesuarebi/ — 4mm, 9mm, 17mm, 25mm
- Barlow 2x ლინზა — https://astroman.ge/category/aksesuarebi/ — გადიდების გაორმაგება
- ვარსკვლავური ფილტრები — https://astroman.ge/category/aksesuarebi/ — მთვარის, ნისლეულების
- ასტრო-კამერები — https://astroman.ge/category/aksesuarebi/ — ტელესკოპის ფოტოგრაფიისთვის
- Planisphere — https://astroman.ge/category/aksesuarebi/ — ვარსკვლავთა რუქა

სრული კატალოგი: https://astroman.ge/category/telescopes/
"""

SYSTEM_PROMPT = f"""შენ ხარ ASTROMAN-ის ექსპერტი ასტრო-კონსულტანტი — Georgia-ს პირველი ასტრონომიული მაღაზიის ჭკვიანი ასისტენტი.

შენი ცოდნა:
- ტელესკოპები: რეფრაქტორი, რეფლექტორი, კატადიოპტრიკი; Celestron, Sky-Watcher, Levenhuk
- პლანეტები: მთვარე, ვენერა, მარსი, იუპიტერი, სატურნი, ურანი, ნეპტუნი — როგორ ჩანს ტელესკოპში
- ღრმა ცა (Deep Sky): ნისლეულები (Nebula), გალაქტიკები, ვარსკვლავური გროვები, M-კატალოგი
- ასტრო-ფოტოგრაფია: ექსპოზიცია, ISO, სამდგამი
- ტელესკოპის გამოყენება: კოლიმაცია, ლინზების მოვლა, ობიექტების ძიება
- ვარსკვლავური ცა: თანავარსკვლავედები, ვარსკვლავები, კატალოგები
- ასტრონომიის ისტორია და მეცნიერება

{ASTROMAN_PRODUCTS}

წესები:
1. პასუხი გასცე ქართულ ენაზე, მოკლედ და მკაფიოდ
2. მხოლოდ ასტრონომიასთან, ტელესკოპებთან და ცის დაკვირვებასთან დაკავშირებული კითხვები
3. სხვა თემებზე (პოლიტიკა, მედიცინა, ბიზნესი, ა.შ.) უარი თქვი: "ვამჯობინებ ასტრონომიაზე ვისაუბროთ 🔭"
4. პროდუქტების რეკომენდაციისას ჩართე პირდაპირი ბმული
5. პრაქტიკული, გამოსადეგი რჩევები გასცე
6. ემოჯი გამოიყენე ზომიერად"""


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


@router.post("/api/chatbot")
async def chatbot(req: ChatRequest):
    if not settings.anthropic_api_key:
        return JSONResponse({"reply": "⚠️ AI სერვისი ამჟამად მიუწვდომელია. გთხოვ ეწვიე astroman.ge ან დაგვიკავშირდი 599 39 67 21."})

    # Keep last 10 messages max
    history = [{"role": m.role, "content": m.content} for m in req.messages[-10:]]

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": settings.anthropic_api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-haiku-4-5-20251001",
                    "max_tokens": 500,
                    "system": SYSTEM_PROMPT,
                    "messages": history,
                },
            )
            resp.raise_for_status()
            text = resp.json()["content"][0]["text"].strip()
            return JSONResponse({"reply": text})
    except Exception as exc:
        logger.warning("Chatbot error: %s", exc)
        return JSONResponse({"reply": "⚠️ კავშირის შეცდომა. გთხოვ სცადე კიდევ ერთხელ."})
