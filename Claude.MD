# ASTROMAN SKY INTELLIGENCE — Project Brain (CLAUDE.md)

> **Repo**: https://github.com/Rezimod/Astroman-Skywatcher
> **Live**: sky.astroman.ge (Railway)
> **Brand**: astroman.ge (Georgian astronomy e-commerce)
> **Design Reference**: https://astroman-stellar-v2.vercel.app/

---

## 🎯 PROJECT VISION

ASTROMAN Sky Intelligence is a **gamified astronomy web app** for Tbilisi, Georgia. It combines:
1. **Real-time sky dashboard** — live visibility data for planets, moon, constellations, nebulas, galaxies
2. **Celestial object encyclopedia** — card-style info pages (like carrd.co) for each sky object
3. **User accounts & missions** — gamified observation challenges with real rewards
4. **Photo verification system** — users capture celestial objects, AI verifies, rewards are issued
5. **E-commerce integration** — telescope recommendations + Astroman store links

This is NOT just a dashboard. It's an **astronomy game** that drives telescope sales.

---

## 🏗 TECH STACK

| Layer | Technology |
|-------|-----------|
| Backend | **Python 3.11+, FastAPI** |
| Database | **SQLite** (aiofiles) → future: PostgreSQL |
| Astronomy Engine | **ephem** + **Skyfield** |
| Weather | **OpenWeather API** |
| Auth | **FastAPI sessions** + **bcrypt** (simple email/password) |
| Frontend | **Jinja2 templates** + **Tailwind CSS** + **vanilla JS** |
| E-commerce | **WooCommerce REST API** (astroman.ge) |
| Notifications | Email (SMTP) + Telegram bot |
| Scheduler | **APScheduler** |
| External APIs | NASA APOD, OpenWeather, WooCommerce |
| Deployment | **Docker** → **Railway** |
| Version Control | **GitHub** (push-based deploy) |

---

## 🎨 DESIGN SYSTEM (Match Stellar V2 Aesthetic)

### Core Principles
- **Dark theme ONLY** — deep space black (#0a0a0f) with subtle blue undertones
- **Glassmorphism** — frosted glass cards with backdrop-blur, subtle borders
- **Cosmic accent palette**: Electric purple (#7c3aed), Stellar blue (#3b82f6), Nebula pink (#ec4899), Star gold (#f59e0b)
- **Typography**: Display font for headers (Space Grotesk or similar bold geometric), clean sans for body
- **Animations**: Subtle star twinkle effects, smooth card hover transitions, parallax star background
- **Georgian language support**: All UI bilingual (ქართული / English toggle)

### Layout Pattern (from Stellar V2)
```
┌─────────────────────────────────────────────┐
│  NAVBAR: Logo + Nav links + Auth button     │
├─────────────────────────────────────────────┤
│  HERO: Big headline + subtitle + CTA        │
│  (subtle star particle background)          │
├─────────────────────────────────────────────┤
│  SECTION: Cards grid (glassmorphism)        │
│  — Section divider: "— Title —"             │
├─────────────────────────────────────────────┤
│  SECTION: Feature cards / content           │
├─────────────────────────────────────────────┤
│  FOOTER: Logo + links + © Astroman          │
└─────────────────────────────────────────────┘
```

### Card Design
- Background: rgba(255,255,255,0.05)
- Border: 1px solid rgba(255,255,255,0.1)
- Backdrop-filter: blur(10px)
- Border-radius: 16px
- Hover: slight scale(1.02) + glow border
- Section dividers use em-dash style: `— Section Title —`

---

## 📄 PAGES & ROUTES

### 1. `/` — Landing Page (Hero + Dashboard Preview)
**Purpose**: Hook visitors, show tonight's sky at a glance, drive signups

**Sections**:
- **Hero**: "See What's Above Tbilisi Tonight" + animated star bg + CTA buttons (Explore Sky / Sign Up)
- **Tonight's Sky Summary**: Glassmorphism card showing # visible planets, moon phase icon, sky quality score, best viewing time
- **Visible Objects Carousel**: Horizontal scroll of planet/moon cards with thumbnails, name, visibility %
- **How It Works**: 3-step cards (1. Check the sky → 2. Accept a mission → 3. Capture & earn rewards)
- **Featured Mission**: Tonight's highlighted mission with difficulty badge
- **Telescope Spotlight**: Featured Foreseen 80mm telescope card → links to https://astroman.ge/telescopebi/foreseen-80mm/
- **Astroman Ecosystem**: Grid linking to astroman.ge, club.astroman.ge, sky.astroman.ge, Telegram
- **NASA APOD**: Today's Astronomy Picture of the Day
- **Footer**: Logo, links, social, © 2026 Astroman — Built with love in Tbilisi

### 2. `/sky` — Live Sky Dashboard
**Purpose**: Real-time visibility data for tonight

**Sections**:
- **Sky Conditions Banner**: Weather, cloud cover %, temperature, humidity, viewing quality score (1-10)
- **Moon Phase Widget**: Current phase name + illumination % + icon + rise/set times
- **Planets Grid**: Cards for each visible planet (Mercury through Neptune) with:
  - Planet image (use reliable CDN/static images, NOT Wikipedia thumbnails)
  - Altitude in degrees
  - Azimuth direction
  - Rise/transit/set times
  - Visibility rating (excellent/good/fair/poor)
  - Constellation it's currently in
- **Constellations Section**: Currently visible constellations with brief descriptions
- **Deep Sky Objects**: Nebulas, galaxies visible tonight (M31, M42, etc.) with difficulty ratings
- **Altitude Chart**: Bar chart showing object altitudes over time
- **Best Viewing Windows**: Timeline showing optimal observation periods

### 3. `/explore` — Celestial Object Encyclopedia
**Purpose**: Card-style info pages for each celestial object (carrd.co aesthetic)

**Design**: Grid of beautiful cards, clicking opens a detail page

**Object Categories**:
- 🪐 **Planets**: Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune
- 🌙 **Moon**: Phases, features, best observation tips
- ⭐ **Constellations**: Major visible constellations from Tbilisi
- 🌌 **Nebulas**: M42 (Orion), M8 (Lagoon), M17 (Omega), etc.
- 🌀 **Galaxies**: M31 (Andromeda), M33 (Triangulum), M81/M82, etc.
- 🌟 **Star Clusters**: Pleiades, Hyades, Double Cluster, etc.

**Each Object Card Shows**:
- Beautiful header image
- Name (English + Georgian)
- Quick stats (distance, magnitude, size)
- Best viewing conditions
- Recommended telescope
- Fun fact
- "Start Mission" button (if mission exists for this object)

### 4. `/missions` — Mission Center (🔒 Login Required)
**Purpose**: Gamified observation challenges

**Mission Structure**:
```
Mission = {
    id, title, title_ge,
    description, description_ge,
    object_type: "planet" | "constellation" | "nebula" | "galaxy" | "moon" | "cluster",
    target_object: "Jupiter" | "M31" | ...,
    difficulty: "easy" | "medium" | "hard",
    points: 10 | 25 | 50,
    reward_type: "discount" | "voucher" | "physical" | "points",
    reward_value: "10% off" | "free lamp" | "50 GEL voucher",
    requirements: {
        min_sky_quality: 3,
        target_altitude_min: 15,
        needs_telescope: false | true,
        verification_type: "photo" | "checkin"
    },
    active: true,
    expires_at: datetime | null
}
```

**Difficulty Levels**:
- 🟢 **Easy** (10 pts): Find a bright planet (Jupiter, Venus, Mars), identify the Moon phase, spot a major constellation (Orion)
- 🟡 **Medium** (25 pts): Photograph Saturn's rings, find the Andromeda galaxy, identify 3 constellations in one session
- 🔴 **Hard** (50 pts): Capture a nebula through telescope, photograph a planet with moons visible, find a Messier object

**Rewards**:
- 10 pts mission → 5% discount code at astroman.ge
- 25 pts mission → 10% discount code OR free Starry Sky lamp
- 50 pts mission → 50 GEL voucher at astroman.ge
- Accumulate 200+ pts → Astroman Ambassador badge + special perks

**Mission Page Layout**:
- Active missions grid with difficulty badges (color-coded)
- Filter by: difficulty, object type, reward type
- Each card: object thumbnail, mission title, difficulty pill, reward preview, "Accept Mission" CTA
- My Active Missions sidebar
- Leaderboard (top observers this month)

### 5. `/missions/<id>/submit` — Photo Submission & Verification (🔒)
**Purpose**: User submits photo proof of observation

**Verification Pipeline**:
1. **Upload**: User takes/uploads photo
2. **Metadata Check**: EXIF data → timestamp, GPS location (if available)
3. **Sky Conditions Verify**: Was the target object actually visible from Tbilisi at that time? (ephem calculation)
4. **Location Check**: Is the user's location within Georgia? (GPS or IP-based)
5. **Time Window Check**: Was the photo taken during the mission's valid window?
6. **Basic Image Analysis**: Is this a sky/telescope photo? (simple ML check or manual review queue)
7. **Admin Review Queue**: Flag for manual verification if confidence is low
8. **Reward Issued**: Generate discount code via WooCommerce API or mark physical reward for pickup

**Submission Page**:
- Drag-and-drop photo upload area
- Auto-detected metadata display (time, location)
- Mission details reminder
- "Submit for Verification" button
- Status tracker: Uploaded → Processing → Verified ✓ / Rejected ✗

### 6. `/profile` — User Profile (🔒)
**Purpose**: Personal dashboard

**Sections**:
- Avatar + name + join date
- Stats: Total missions, completed, points earned, rank
- Achievement badges grid
- Active missions with status
- Completed missions history
- Rewards earned (with redeem status)
- Observation log (dates, objects seen, photos)
- Settings: Email, password, notification preferences, language

### 7. `/auth/login` & `/auth/register` — Authentication
**Design**: Clean centered card with glassmorphism, star bg

**Login**: Email + password + "Remember me" + Forgot password link
**Register**: Name + email + password + confirm password + optional: phone for Telegram notifications

### 8. `/leaderboard` — Community Rankings
- Monthly / All-time toggle
- Top observers by points
- Most missions completed
- Avatars, names, badges, point counts

### 9. `/admin` — Admin Panel (🔒 Admin only)
- Mission CRUD (create/edit/delete missions)
- Photo verification review queue
- User management
- Reward code generation
- Analytics dashboard (active users, missions completed, rewards issued)
- Sky data health check

---

## 🗄 DATABASE SCHEMA

```sql
-- Users
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT DEFAULT NULL,
    role TEXT DEFAULT 'user',  -- 'user' | 'admin'
    points INTEGER DEFAULT 0,
    rank TEXT DEFAULT 'Beginner Stargazer',
    language TEXT DEFAULT 'ka',  -- 'ka' | 'en'
    telegram_chat_id TEXT DEFAULT NULL,
    notify_email BOOLEAN DEFAULT 1,
    notify_telegram BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT NULL
);

-- Missions (template)
CREATE TABLE missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    title_ge TEXT,
    description TEXT NOT NULL,
    description_ge TEXT,
    object_type TEXT NOT NULL,
    target_object TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK(difficulty IN ('easy','medium','hard')),
    points INTEGER NOT NULL,
    reward_type TEXT NOT NULL,
    reward_value TEXT NOT NULL,
    reward_description TEXT,
    reward_description_ge TEXT,
    min_sky_quality INTEGER DEFAULT 1,
    target_altitude_min REAL DEFAULT 10.0,
    needs_telescope BOOLEAN DEFAULT 0,
    verification_type TEXT DEFAULT 'photo',
    is_active BOOLEAN DEFAULT 1,
    is_recurring BOOLEAN DEFAULT 0,
    expires_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Mission Progress
CREATE TABLE user_missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    mission_id INTEGER NOT NULL REFERENCES missions(id),
    status TEXT DEFAULT 'accepted' CHECK(status IN ('accepted','submitted','verified','rejected','expired')),
    accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP DEFAULT NULL,
    verified_at TIMESTAMP DEFAULT NULL,
    photo_url TEXT DEFAULT NULL,
    photo_metadata JSON DEFAULT NULL,
    verification_notes TEXT DEFAULT NULL,
    reward_code TEXT DEFAULT NULL,
    reward_redeemed BOOLEAN DEFAULT 0,
    UNIQUE(user_id, mission_id)
);

-- Observation Log
CREATE TABLE observations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    object_name TEXT NOT NULL,
    object_type TEXT NOT NULL,
    observed_at TIMESTAMP NOT NULL,
    latitude REAL DEFAULT 41.7151,
    longitude REAL DEFAULT 44.8271,
    sky_quality INTEGER,
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rewards / Discount Codes
CREATE TABLE rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    user_mission_id INTEGER REFERENCES user_missions(id),
    reward_type TEXT NOT NULL,
    reward_value TEXT NOT NULL,
    code TEXT UNIQUE,
    is_redeemed BOOLEAN DEFAULT 0,
    redeemed_at TIMESTAMP DEFAULT NULL,
    expires_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Celestial Objects Catalog
CREATE TABLE celestial_objects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    name_ge TEXT,
    type TEXT NOT NULL,  -- planet, moon, constellation, nebula, galaxy, cluster
    catalog_id TEXT,  -- M31, NGC7000, etc.
    description TEXT,
    description_ge TEXT,
    image_url TEXT,
    magnitude REAL,
    distance TEXT,
    size TEXT,
    best_season TEXT,
    best_time TEXT,
    recommended_telescope TEXT,
    fun_fact TEXT,
    fun_fact_ge TEXT,
    difficulty TEXT DEFAULT 'easy',
    ra_hours REAL,
    dec_degrees REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sky Conditions Cache (hourly updates)
CREATE TABLE sky_conditions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TIMESTAMP NOT NULL,
    cloud_cover INTEGER,
    temperature REAL,
    humidity INTEGER,
    wind_speed REAL,
    visibility_km REAL,
    sky_quality_score INTEGER,  -- 1-10
    moon_phase TEXT,
    moon_illumination REAL,
    sunset_time TEXT,
    sunrise_time TEXT,
    astronomical_twilight_end TEXT,
    astronomical_twilight_start TEXT,
    raw_weather_data JSON
);

-- Achievements / Badges
CREATE TABLE achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_ge TEXT,
    description TEXT,
    icon TEXT,  -- emoji or icon class
    requirement_type TEXT,  -- 'missions_completed', 'points_earned', 'streak', 'specific_object'
    requirement_value INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_achievements (
    user_id INTEGER NOT NULL REFERENCES users(id),
    achievement_id INTEGER NOT NULL REFERENCES achievements(id),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id)
);
```

---

## 📁 TARGET FILE STRUCTURE

```
astroman-skywatcher/
├── CLAUDE.md                          # THIS FILE - project brain
├── .claude/
│   └── commands/
│       ├── fix-ui.md                  # Quick UI fixes
│       ├── deploy-check.md            # Pre-deploy checklist
│       ├── add-feature.md             # Feature implementation guide
│       ├── add-mission.md             # Create new mission template
│       └── seed-data.md               # Seed celestial objects + missions
├── app/
│   ├── __init__.py
│   ├── main.py                        # FastAPI app entry + middleware
│   ├── config.py                      # Settings & environment
│   ├── database.py                    # SQLite setup + migrations
│   ├── models.py                      # SQLAlchemy / raw SQL models
│   ├── auth.py                        # Auth helpers (hash, verify, sessions)
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes_pages.py            # HTML page routes (landing, sky, explore, etc.)
│   │   ├── routes_auth.py             # Login, register, logout, profile
│   │   ├── routes_missions.py         # Mission CRUD, accept, submit, verify
│   │   ├── routes_api.py              # JSON API endpoints (sky data, objects)
│   │   ├── routes_admin.py            # Admin panel routes
│   │   └── routes_subscribers.py      # Email subscriber management
│   ├── core/
│   │   ├── __init__.py
│   │   ├── astronomy.py               # Planet positions, moon phase, visibility
│   │   ├── weather.py                 # OpenWeather integration
│   │   ├── deep_sky.py                # Nebulas, galaxies, clusters visibility
│   │   ├── constellations.py          # Constellation visibility calculator
│   │   ├── observation.py             # AI observation text generator
│   │   ├── telescope.py               # Telescope recommendation engine
│   │   └── verification.py            # Photo verification pipeline
│   ├── services/
│   │   ├── __init__.py
│   │   ├── email_service.py           # Email sender
│   │   ├── telegram_service.py        # Telegram bot
│   │   ├── scheduler.py               # Cron jobs
│   │   ├── daily_pipeline.py          # Daily data pipeline
│   │   ├── reward_service.py          # Generate discount codes, manage rewards
│   │   └── woocommerce_service.py     # WooCommerce API integration
│   ├── templates/
│   │   ├── base.html                  # Base layout (dark theme, nav, footer)
│   │   ├── landing.html               # / — Hero + dashboard preview
│   │   ├── sky.html                   # /sky — Live sky dashboard
│   │   ├── explore.html               # /explore — Object catalog grid
│   │   ├── explore_detail.html        # /explore/<id> — Single object card page
│   │   ├── missions.html              # /missions — Mission center
│   │   ├── mission_detail.html        # /missions/<id> — Single mission + submit
│   │   ├── profile.html               # /profile — User dashboard
│   │   ├── leaderboard.html           # /leaderboard
│   │   ├── auth/
│   │   │   ├── login.html
│   │   │   └── register.html
│   │   ├── admin/
│   │   │   ├── dashboard.html
│   │   │   ├── missions.html
│   │   │   ├── verification_queue.html
│   │   │   └── users.html
│   │   ├── components/
│   │   │   ├── navbar.html
│   │   │   ├── footer.html
│   │   │   ├── planet_card.html
│   │   │   ├── mission_card.html
│   │   │   ├── object_card.html
│   │   │   ├── moon_widget.html
│   │   │   ├── sky_quality_badge.html
│   │   │   └── achievement_badge.html
│   │   └── email/
│   │       ├── daily_observation.html
│   │       ├── weekly_summary.html
│   │       ├── mission_verified.html
│   │       └── reward_issued.html
│   └── static/
│       ├── css/
│       │   └── style.css              # Tailwind + custom cosmic styles
│       ├── js/
│       │   ├── app.js                 # Global scripts
│       │   ├── sky-dashboard.js       # Live sky data fetcher
│       │   ├── missions.js            # Mission interactions
│       │   ├── photo-upload.js        # Photo submission handler
│       │   └── particles.js           # Star particle background
│       └── images/
│           ├── planets/               # Static planet images (NOT Wikipedia URLs!)
│           │   ├── mercury.webp
│           │   ├── venus.webp
│           │   ├── mars.webp
│           │   ├── jupiter.webp
│           │   ├── saturn.webp
│           │   ├── uranus.webp
│           │   └── neptune.webp
│           ├── moon-phases/           # Moon phase icons
│           ├── constellations/        # Constellation illustrations
│           ├── deep-sky/              # Nebula/galaxy thumbnails
│           └── badges/                # Achievement badge icons
├── scripts/
│   ├── init_db.py                     # Database initialization
│   ├── seed_objects.py                # Seed celestial objects catalog
│   ├── seed_missions.py               # Seed initial missions
│   └── seed_achievements.py           # Seed achievement definitions
├── tests/
│   ├── test_astronomy.py
│   ├── test_missions.py
│   ├── test_auth.py
│   └── test_verification.py
├── Dockerfile
├── docker-compose.yml
├── railway.toml
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔧 KEY IMPLEMENTATION NOTES

### Planet Images — CRITICAL FIX
**Problem**: All planets render as Saturn because Wikipedia thumbnail URLs are unreliable.
**Solution**: Use static images stored in `/static/images/planets/`. Use high-quality public domain images from NASA. Download and bundle them in the repo. Reference as `/static/images/planets/jupiter.webp`.

### Dark Theme Enforcement
All pages MUST use dark theme. In `base.html`:
```html
<body class="bg-[#0a0a0f] text-white min-h-screen">
```
Never allow light backgrounds. All cards use glassmorphism on dark.

### Georgian Language
- All user-facing text should have Georgian translations
- Store both `title` and `title_ge` for database records
- Language toggle in navbar (KA | EN)
- Default language: Georgian (ka)

### Telescope Product Links
Always link to the specific product page:
- Foreseen 80mm: `https://astroman.ge/telescopebi/foreseen-80mm/`
- Generic store: `https://astroman.ge`
- Loyalty club: `https://club.astroman.ge`

### NASA APOD
Fetch daily from `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY`
Cache the response. Display image with title and explanation (truncated).

### Photo Verification Logic (simplified v1)
```python
async def verify_submission(photo, mission, user):
    # 1. Check timestamp
    photo_time = extract_exif_time(photo)  # or use submission time
    
    # 2. Check if target was visible at that time
    target = get_object_position(mission.target_object, photo_time, TBILISI_LAT, TBILISI_LON)
    if target.altitude < mission.target_altitude_min:
        return {"status": "rejected", "reason": "Object was not visible at submission time"}
    
    # 3. Check sky conditions at that time
    weather = get_cached_weather(photo_time)
    if weather.cloud_cover > 80:
        return {"status": "rejected", "reason": "Sky was too cloudy"}
    
    # 4. Basic image check (is it a sky photo?)
    # v1: Skip ML, use manual admin review
    return {"status": "pending_review"}
```

### Reward Code Generation
```python
import secrets
def generate_reward_code(prefix="ASTRO"):
    return f"{prefix}-{secrets.token_hex(4).upper()}"
# Example: ASTRO-A3F2B1C9
```

---

## ⚡ ENVIRONMENT VARIABLES

```env
# App
SECRET_KEY=your-secret-key-here
ADMIN_PASSWORD=your-admin-password
DEBUG=false
BASE_URL=https://sky.astroman.ge

# Location (Tbilisi)
LATITUDE=41.7151
LONGITUDE=44.8271
TIMEZONE=Asia/Tbilisi
CITY_NAME=Tbilisi

# APIs
OPENWEATHER_API_KEY=your-key
NASA_API_KEY=DEMO_KEY
WOOCOMMERCE_URL=https://astroman.ge
WOOCOMMERCE_KEY=your-key
WOOCOMMERCE_SECRET=your-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-app-password
EMAIL_FROM=sky@astroman.ge

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHANNEL_ID=your-channel-id

# Auth
JWT_SECRET=your-jwt-secret
SESSION_EXPIRY_HOURS=168
```

---

## 🚀 DEPLOYMENT CHECKLIST

Before every push:
1. ✅ Dark theme enforced on ALL pages (no white backgrounds)
2. ✅ All planet images use static paths, not Wikipedia
3. ✅ Telescope links point to specific Foreseen 80mm URL
4. ✅ NASA APOD shows image with proper fallback
5. ✅ AI recap shows correct planet count (not "0 planets")
6. ✅ No existing sections deleted (chat widget, APOD, sky map, altitude bars, planet explorer all preserved)
7. ✅ Georgian translations present for all user-facing text
8. ✅ Mobile responsive (test at 375px, 768px, 1024px)
9. ✅ All routes return 200 (no 500 errors)
10. ✅ Database migrations applied

---

## 🎮 INITIAL SEED MISSIONS

```json
[
  {
    "title": "First Light",
    "title_ge": "პირველი შუქი",
    "description": "Find and identify Jupiter in tonight's sky",
    "target_object": "Jupiter",
    "difficulty": "easy",
    "points": 10,
    "reward_type": "discount",
    "reward_value": "5% off at astroman.ge"
  },
  {
    "title": "Lunar Explorer",
    "title_ge": "მთვარის მკვლევარი",
    "description": "Photograph the Moon showing at least 3 craters",
    "target_object": "Moon",
    "difficulty": "medium",
    "points": 25,
    "reward_type": "physical",
    "reward_value": "Free Starry Sky lamp"
  },
  {
    "title": "Ring Master",
    "title_ge": "რგოლების ოსტატი",
    "description": "Capture Saturn's rings through a telescope",
    "target_object": "Saturn",
    "difficulty": "hard",
    "points": 50,
    "reward_type": "voucher",
    "reward_value": "50 GEL voucher at astroman.ge"
  },
  {
    "title": "Orion's Belt",
    "title_ge": "ორიონის ქამარი",
    "description": "Identify and photograph all 3 stars of Orion's Belt",
    "target_object": "Orion",
    "difficulty": "easy",
    "points": 10,
    "reward_type": "discount",
    "reward_value": "5% off at astroman.ge"
  },
  {
    "title": "Andromeda Hunter",
    "title_ge": "ანდრომედას მონადირე",
    "description": "Find and photograph the Andromeda Galaxy (M31)",
    "target_object": "M31",
    "difficulty": "hard",
    "points": 50,
    "reward_type": "voucher",
    "reward_value": "50 GEL voucher at astroman.ge"
  },
  {
    "title": "Red Planet Spotter",
    "title_ge": "წითელი პლანეტის დამზვერავი",
    "description": "Find Mars and note its current constellation",
    "target_object": "Mars",
    "difficulty": "easy",
    "points": 10,
    "reward_type": "discount",
    "reward_value": "5% off at astroman.ge"
  },
  {
    "title": "Nebula Master",
    "title_ge": "ნისლეულის ოსტატი",
    "description": "Photograph the Orion Nebula (M42) through a telescope",
    "target_object": "M42",
    "difficulty": "hard",
    "points": 50,
    "reward_type": "voucher",
    "reward_value": "50 GEL voucher at astroman.ge"
  },
  {
    "title": "Constellation Collector",
    "title_ge": "თანავარსკვლავედების კოლექციონერი",
    "description": "Identify and photograph 3 different constellations in one session",
    "target_object": "any_constellation",
    "difficulty": "medium",
    "points": 25,
    "reward_type": "physical",
    "reward_value": "Free Starry Sky lamp"
  }
]
```

---

## 🧠 WORKING PRINCIPLES FOR CLAUDE CODE

1. **Single-task prompts** > broad multi-task prompts (avoids incomplete delivery)
2. **Always deliver complete files** — not snippets or partial code
3. **Never delete existing sections** — only add, modify, or redesign
4. **Test every route** before committing
5. **Use `/compact` to compress long sessions**
6. **Use Sonnet for routine tasks; Opus for architecture decisions**
7. **Check the deployment checklist before every push**
