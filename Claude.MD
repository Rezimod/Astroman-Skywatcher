# Astroman Skywatcher

Unified Astroman platform being migrated from:

- `_legacy/app` FastAPI astronomy backend
- `_legacy/sky-frontend` Vite frontend
- `/tmp/sky-astroman-ref` Next.js reference design system

Primary stack:

- Next.js 14 App Router
- React 18 + TypeScript
- Tailwind CSS
- Supabase auth, Postgres, Storage
- astronomy-engine
- Open-Meteo and NASA APOD APIs

Product constraints:

- All user-facing UI text in Georgian by default
- Visual system follows the Sky-Astroman dark cosmic theme
- Default observing location is Tbilisi (`41.7151, 44.8271`)
- Keep astronomy, sky conditions, NASA APOD, telescope recommendations, missions, leaderboard, gallery, profile, and chat-oriented surface area
