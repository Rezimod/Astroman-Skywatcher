# 🔭 Astroman Skywatcher System

**ავტომატური ასტრონომიული დაკვირვების სისტემა თბილისისთვის**

ყოველდღიურად აგზავნის პერსონალიზებულ ასტრონომიულ გზამკვლევს: პლანეტების პოზიციები, მთვარის ფაზა, ამინდის პროგნოზი და ტელესკოპის რეკომენდაცია.

---

## 🏗 ტექნოლოგიური სტეკი

| კომპონენტი | ტექნოლოგია |
|---|---|
| Backend | Python 3.11+, FastAPI |
| Scheduler | APScheduler |
| Astronomy | Skyfield + Ephem |
| Weather | OpenWeather API |
| Email | SMTP / SendGrid |
| Telegram | python-telegram-bot |
| Frontend | HTML + Tailwind CSS |
| Database | SQLite (aiofiles) |
| Deployment | Docker, Railway/Render |

## 📁 პროექტის სტრუქტურა

```
astroman-skywatcher/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI application entry
│   ├── config.py                # Settings & environment
│   ├── database.py              # SQLite setup
│   ├── models.py                # DB models
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes_dashboard.py  # Dashboard routes
│   │   ├── routes_admin.py      # Admin panel routes
│   │   ├── routes_subscribers.py # Subscriber management
│   │   └── routes_api.py        # REST API endpoints
│   ├── core/
│   │   ├── __init__.py
│   │   ├── astronomy.py         # Planet positions, moon phase
│   │   ├── weather.py           # OpenWeather integration
│   │   ├── observation.py       # AI observation text generator
│   │   └── telescope.py         # Smart telescope linking
│   ├── services/
│   │   ├── __init__.py
│   │   ├── email_service.py     # Email sender (SMTP/SendGrid)
│   │   ├── telegram_service.py  # Telegram bot
│   │   ├── scheduler.py         # Cron job scheduler
│   │   └── daily_pipeline.py    # Daily data pipeline
│   ├── templates/
│   │   ├── base.html
│   │   ├── dashboard.html
│   │   ├── admin.html
│   │   ├── subscribe.html
│   │   └── email/
│   │       ├── daily_observation.html
│   │       └── weekly_summary.html
│   └── static/
│       ├── css/
│       │   └── style.css
│       └── js/
│           └── admin.js
├── scripts/
│   └── init_db.py
├── tests/
│   └── test_astronomy.py
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

## 🚀 სწრაფი დაწყება

### 1. კლონირება და სეტაპი

```bash
git clone https://github.com/your-org/astroman-skywatcher.git
cd astroman-skywatcher
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Variables

```bash
cp .env.example .env
# შეავსეთ .env ფაილი თქვენი API keys-ით
```

### 3. მონაცემთა ბაზის ინიციალიზაცია

```bash
python scripts/init_db.py
```

### 4. გაშვება

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Dashboard: http://localhost:8000
Admin: http://localhost:8000/admin

## 🐳 Docker Deployment

```bash
docker-compose up --build -d
```

## ☁️ Railway/Render Deployment

### Railway
1. შექმენით ახალი პროექტი Railway-ზე
2. დააკავშირეთ GitHub repo
3. დააყენეთ Environment Variables
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Render
1. შექმენით ახალი Web Service
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. დააყენეთ Environment Variables

## 🔐 Security

- ყველა API key `.env` ფაილში
- Admin panel დაცულია პაროლით
- Rate limiting API endpoints-ზე
- Input validation ყველა ფორმაზე
- CORS კონფიგურაცია

## 📄 ლიცენზია

© ASTROMAN — ყველა უფლება დაცულია.
