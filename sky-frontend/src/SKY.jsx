import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getVisiblePlanets, getMoonInfo, getSunTimes, getStargazingScore } from './lib/astronomy';

// ─── Constants ───────────────────────────────────────────────────────────────

const LAT = 41.6938;
const LON = 44.8015;

const PLANETS = [
  { id: 'venus',   ka: 'ვენერა',    emoji: '🟡', constellation: 'თევზები',    maxAlt: 15, mag: -3.9, visible: true,  eye: true  },
  { id: 'jupiter', ka: 'იუპიტერი',  emoji: '🟠', constellation: 'ტყუპები',    maxAlt: 65, mag: -2.2, visible: true,  eye: true  },
  { id: 'saturn',  ka: 'სატურნი',   emoji: '🪐', constellation: 'თევზები',    maxAlt: 12, mag:  1.0, visible: true,  eye: true  },
  { id: 'mars',    ka: 'მარსი',     emoji: '🔴', constellation: 'კირჩხიბი',   maxAlt:  8, mag:  1.3, visible: false, eye: false },
  { id: 'mercury', ka: 'მერკური',   emoji: '⚫', constellation: 'თევზები',    maxAlt:  5, mag:  0.5, visible: false, eye: false },
  { id: 'uranus',  ka: 'ურანი',     emoji: '🔵', constellation: 'ხარი',       maxAlt: 58, mag:  5.8, visible: true,  eye: false },
  { id: 'neptune', ka: 'ნეპტუნი',   emoji: '🌀', constellation: 'თევზები',    maxAlt:  6, mag:  8.0, visible: true,  eye: false },
];

const PLANET_IMAGES = {
  venus:   'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Venus-real_color.jpg/1024px-Venus-real_color.jpg',
  jupiter: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Jupiter_and_its_shrunken_Great_Red_Spot.jpg/1024px-Jupiter_and_its_shrunken_Great_Red_Spot.jpg',
  saturn:  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/1024px-Saturn_during_Equinox.jpg',
  mars:    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/1024px-OSIRIS_Mars_true_color.jpg',
  mercury: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mercury_in_true_color.jpg/1024px-Mercury_in_true_color.jpg',
  uranus:  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Uranus2.jpg/1024px-Uranus2.jpg',
  neptune: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg/1024px-Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg',
  moon:    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/1024px-FullMoon2010.jpg',
};

const PLANET_FACTS = {
  venus:   'ვენერა ყველაზე ცხელი პლანეტაა — 465°C. ატმოსფერა CO₂-ია, წნევა 90-ჯერ მეტი დედამიწაზე.',
  jupiter: 'იუპიტერი ყველაზე დიდი პლანეტაა. ქარიშხალი ატარებს 350+ წლის ისტორიას. 95 მთვარე.',
  saturn:  'სატურნის რგოლები ყინულისა და კლდის ნაჭრებისაგანაა. რგოლები 1 კმ სისქის, 200,000 კმ სიგანის.',
  mars:    'მარსი "წითელი პლანეტაა" — რკინის ოქსიდი. Olympus Mons — 22კმ, სამყაროს უმაღლესი ვულკანი.',
  mercury: 'მერკური ყველაზე სწრაფია — 88 დღე ერთი წელი. ღამით -180°C, დღით +430°C.',
  uranus:  'ურანი "გვერდზე" ბრუნავს — 98° დახრა. ყინული ამიაკია, -224°C. 27 მთვარე.',
  neptune: 'ნეპტუნი ყველაზე ძლიერი ქარებია. ქარი 2,100 კმ/სთ — სამყაროს ყველაზე სწრაფი ქარი.',
};

const COSMOS_DATES = [
  '2024-04-24','2024-03-11','2024-01-09','2024-06-12','2023-11-01',
  '2024-02-19','2023-09-12','2024-05-03','2023-07-12','2024-08-06',
  '2023-10-22','2024-03-25','2023-12-14','2024-01-29','2023-08-16',
  '2024-07-04','2024-09-10','2023-05-22','2024-10-01','2023-04-10',
  '2024-11-05','2023-03-15','2024-12-03','2023-02-20','2024-02-05',
  '2023-01-18','2024-10-29','2023-08-30','2024-06-28','2023-06-01',
];

const WEATHER_CODES = {
  0: 'მოწმენდილი ☀️', 1: 'ძირითადად მოწმენდილი', 2: 'ნაწილობრივ მოღრუბლული ⛅',
  3: 'მოღრუბლული ☁️', 45: 'ნისლი 🌫', 48: 'ყინვიანი ნისლი',
  51: 'მსუბუქი წვიმა 🌦', 61: 'წვიმა 🌧', 71: 'თოვლი ❄️', 80: 'ნალექის წვიმა 🌦',
  95: 'ჭექა-ქუხილი ⛈',
};

const GEO_MONTHS = ['იანვარი','თებერვალი','მარტი','აპრილი','მაისი','ივნისი',
                    'ივლისი','აგვისტო','სექტემბერი','ოქტომბერი','ნოემბერი','დეკემბერი'];
const GEO_DAYS   = ['კვირა','ორშაბათი','სამშაბათი','ოთხშაბათი','ხუთშაბათი','პარასკევი','შაბათი'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMoonPhase(date = new Date()) {
  const known = new Date(2000, 0, 6);
  const diff  = date - known;
  const days  = diff / 86400000;
  const cycle = 29.53058867;
  const age   = ((days % cycle) + cycle) % cycle;
  const illumination = Math.round((1 - Math.cos(2 * Math.PI * age / cycle)) / 2 * 100);
  const phases = [
    { name: 'ახალი მთვარე',         emoji: '🌑', min: 0,     max: 1.85  },
    { name: 'სიახლოვის მთვარე',     emoji: '🌒', min: 1.85,  max: 7.38  },
    { name: 'მეოთხედი (პირველი)',    emoji: '🌓', min: 7.38,  max: 11.08 },
    { name: 'სავსის მეოთხედი',      emoji: '🌔', min: 11.08, max: 14.77 },
    { name: 'სავსე მთვარე',         emoji: '🌕', min: 14.77, max: 16.62 },
    { name: 'კლებადი სავსე',        emoji: '🌖', min: 16.62, max: 22.15 },
    { name: 'მეოთხედი (კლებადი)',   emoji: '🌗', min: 22.15, max: 25.85 },
    { name: 'კლებადი სიახლოვე',     emoji: '🌘', min: 25.85, max: 29.5  },
  ];
  const phase = phases.find(p => age >= p.min && age < p.max) || phases[0];
  return { age: age.toFixed(1), illumination, ...phase };
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const R    = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a    = Math.sin(dLat / 2) ** 2 +
               Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
               Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatGeoDate(date) {
  return `${date.getDate()} ${GEO_MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
}
function formatGeoDay(date) {
  return GEO_DAYS[date.getDay()];
}
function formatTime(date) {
  return date.toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function getSkyStatus(sunrise, sunset, twilight, now) {
  if (!sunrise || !sunset || !twilight) return null;
  const s = new Date(sunrise), e = new Date(sunset), t = new Date(twilight);
  if (now >= s && now < e) return { label: 'დღეა', emoji: '☀️', color: '#f5c842' };
  if (now >= e && now < t) return { label: 'შესანამდე', emoji: '🌇', color: '#ff9f43' };
  return { label: 'ღამეა — ვარსკვლავები ჩანს!', emoji: '🌌', color: '#60a5fa' };
}

function relativeTime(target, now) {
  if (!target) return '';
  const t   = new Date(target);
  const diff = t - now;
  const abs  = Math.abs(diff);
  const mins = Math.floor(abs / 60000);
  const hrs  = Math.floor(mins / 60);
  const rem  = mins % 60;
  const past = diff < 0;
  if (hrs > 0) return past ? `${hrs}სთ ${rem}წთ წინ` : `${hrs}სთ ${rem}წთ-ში`;
  return past ? `${mins} წუთის წინ` : `${mins} წუთში`;
}

// ─── Styles (inline, no Tailwind dependency) ─────────────────────────────────

const S = {
  root: {
    background: '#080C14',
    minHeight: '100vh',
    color: '#E8EDF5',
    fontFamily: "'Noto Sans Georgian', 'Sylfaen', system-ui, sans-serif",
  },
  glass: {
    background: '#0D1420',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 12,
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
  },
  glassHover: {
    background: '#111A2B',
  },
  gold: '#C9A84C',
  dim: '#5A6A80',
  blue: '#4FC3C3',
  danger: '#ff6b6b',
  success: '#4ade80',
};

// ─── Components ──────────────────────────────────────────────────────────────

function Navbar({ menuOpen, setMenuOpen }) {
  return (
    <nav className="astroman-nav" style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(8,12,20,0.92)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0 20px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <a href="https://astroman.ge" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo-icon.png" alt="Astroman" style={{ height: 40, width: 'auto', filter: 'invert(1) drop-shadow(0 0 6px rgba(201,168,76,0.5))' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: S.gold, letterSpacing: 1, lineHeight: 1 }}>ასტრომანი</span>
            <span style={{ fontSize: 10, color: S.dim, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: "'Chakra Petch', monospace" }}>Sky Intelligence</span>
          </div>
        </a>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }} className="desktop-nav">
          <a href="#planets"  className="nav-link" style={{ color: S.dim, textDecoration: 'none', fontSize: 15 }}>🪐 პლანეტები</a>
          <a href="#store"    className="nav-link" style={{ color: S.dim, textDecoration: 'none', fontSize: 15 }}>⭐ მაღაზია</a>
          <a href="https://astroman.ge" className="nav-link" style={{ color: S.dim, textDecoration: 'none', fontSize: 15 }}>🏠 მთავარი</a>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          style={{ background: 'none', border: 'none', color: '#E8EDF5', fontSize: 24, cursor: 'pointer', padding: 8 }}
          aria-label="მენიუ"
          className="hamburger"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(8,12,20,0.97)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 20px 20px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          <a href="#planets"  onClick={() => setMenuOpen(false)} className="nav-link" style={{ color: S.dim, textDecoration: 'none', fontSize: 16 }}>🪐 პლანეტები</a>
          <a href="#store"    onClick={() => setMenuOpen(false)} className="nav-link" style={{ color: S.dim, textDecoration: 'none', fontSize: 16 }}>⭐ მაღაზია</a>
          <a href="https://astroman.ge" className="nav-link" style={{ color: S.dim, textDecoration: 'none', fontSize: 16 }}>🏠 მთავარი</a>
        </div>
      )}

      <style>{`
        .nav-link { transition: color 0.2s ease !important; }
        .nav-link:hover { color: #C9A84C !important; }
      `}</style>
    </nav>
  );
}

function Hero({ now, skyStatus, sunset }) {
  const countdownLabel = sunset
    ? (new Date(sunset) > now ? `მზის ჩასვლამდე ${relativeTime(sunset, now)}` : `მზე ჩავიდა ${relativeTime(sunset, now)}`)
    : '';

  return (
    <section className="hero-section hero-card" style={{ textAlign: 'center', padding: '60px 20px 40px', maxWidth: 700, margin: '0 auto', position: 'relative' }}>
      {/* Corner bracket decorations */}
      <span className="corner-tl" />
      <span className="corner-tr" />
      <span className="corner-bl" />
      <span className="corner-br" />

      {/* Live label */}
      <div className="live-label">ASTROMAN · AI · REAL-TIME</div>

      <div style={{ fontSize: 13, color: S.dim, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12, fontFamily: "'Chakra Petch', monospace" }}>
        {formatGeoDay(now)} · {formatGeoDate(now)}
      </div>
      <h1 style={{ fontSize: 'clamp(28px, 6vw, 52px)', fontWeight: 700, marginBottom: 16, lineHeight: 1.2, textShadow: '0 0 40px rgba(201,168,76,0.3)' }}>
        ცოცხალი ცის<br />
        <span className="gold-word-span" style={{ color: S.gold }}>ინტელიგენცია</span>
      </h1>

      {/* Live clock */}
      <div className="hero-time" style={{ fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: 20, fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <span className="live-dot" />
        {formatTime(now)}
      </div>

      {/* Status badge */}
      {skyStatus && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${skyStatus.color}44`,
          borderRadius: 100, padding: '8px 20px', marginBottom: 16,
          fontSize: 16, color: skyStatus.color,
        }}>
          <span>{skyStatus.emoji}</span>
          <span>{skyStatus.label}</span>
        </div>
      )}

      {/* Countdown */}
      {countdownLabel && (
        <div style={{ color: S.dim, fontSize: 14, marginBottom: 8 }}>{countdownLabel}</div>
      )}
    </section>
  );
}

function StatsRow({ weather, sunData }) {
  const moon = getMoonPhase();
  const cards = [
    {
      icon: '🌅',
      label: 'მზის ჩასვლა',
      value: sunData?.sunset ? new Date(sunData.sunset).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit', hour12: false }) : '…',
    },
    {
      icon: '🌙',
      label: `მთვარე ${moon.emoji}`,
      value: `${moon.illumination}%`,
      sub: moon.name,
    },
    {
      icon: '☁️',
      label: 'ღრუბლიანობა',
      value: weather ? `${weather.cloud_cover}%` : '…',
      sub: weather ? (WEATHER_CODES[weather.weather_code] || '') : '',
    },
    {
      icon: '🌡',
      label: 'ტემპერატურა',
      value: weather ? `${Math.round(weather.temperature_2m)}°C` : '…',
      sub: weather ? `💨 ${weather.wind_speed_10m}კმ/სთ` : '',
    },
  ];

  return (
    <div style={{ overflowX: 'auto', padding: '0 16px 4px', marginBottom: 32 }}>
      <div style={{ display: 'flex', gap: 12, minWidth: 'max-content', maxWidth: 1100, margin: '0 auto' }}>
        {cards.map((c, i) => (
          <div key={i} className="stat-card" style={{
            ...S.glass,
            minWidth: 160, padding: '16px 20px',
            display: 'flex', flexDirection: 'column', gap: 4,
            flex: '1 1 160px',
          }}>
            <div className="stat-icon">{c.icon}</div>
            <div style={{ fontSize: 12, color: S.dim }}>{c.label}</div>
            <div className="numeric-value" style={{ fontSize: 22, fontWeight: 700, color: '#E8EDF5' }}>{c.value}</div>
            {c.sub && <div style={{ fontSize: 12, color: S.dim }}>{c.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanetCard({ planet, onClick }) {
  const dim = !planet.visible;
  return (
    <button
      onClick={() => onClick(planet)}
      style={{
        ...S.glass,
        minWidth: 140, padding: '16px 14px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        cursor: 'pointer', border: 'none', color: '#E8EDF5',
        opacity: dim ? 0.4 : 1,
        transition: 'transform 0.15s, opacity 0.15s',
        flexShrink: 0,
        background: planet.visible ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
      }}
      onMouseEnter={e => { if (!dim) e.currentTarget.style.transform = 'translateY(-4px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
      aria-label={planet.ka}
    >
      <span style={{ fontSize: 36 }}>{planet.emoji}</span>
      <span style={{ fontWeight: 700, fontSize: 15 }}>{planet.ka}</span>
      <span style={{ fontSize: 11, color: S.dim }}>{planet.constellation}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', fontSize: 11, color: S.dim }}>
        <span>alt: {planet.maxAlt}°</span>
        <span>mag: {planet.mag}</span>
      </div>
      <div style={{
        padding: '3px 10px', borderRadius: 100, fontSize: 11,
        background: planet.visible ? 'rgba(74,222,128,0.15)' : 'rgba(255,107,107,0.15)',
        color: planet.visible ? S.success : S.danger,
        border: `1px solid ${planet.visible ? S.success : S.danger}44`,
      }}>
        {planet.visible
          ? (planet.eye ? '👁 შეუიარაღებელი' : '🔭 ტელესკოპი')
          : '🚫 არ ჩანს'}
      </div>
    </button>
  );
}

function PlanetsSection({ onPlanetClick }) {
  return (
    <section id="planets" style={{ maxWidth: 1100, margin: '0 auto 40px', padding: '0 16px' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        🪐 <span>დღის ცის</span>
      </h2>
      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{ display: 'flex', gap: 12, minWidth: 'max-content' }}>
          {PLANETS.map(p => <PlanetCard key={p.id} planet={p} onClick={onPlanetClick} />)}
        </div>
      </div>
      <style>{`
        @media (min-width: 768px) {
          #planets .planet-row { flex-wrap: wrap; overflow-x: visible; }
        }
      `}</style>
    </section>
  );
}

function ISSTracker({ iss }) {
  const dist = iss ? Math.round(distanceKm(LAT, LON, iss.latitude, iss.longitude)) : null;
  const alertLevel = dist !== null
    ? (dist < 500 ? 'danger' : dist < 1000 ? 'warn' : 'ok')
    : 'ok';
  const alertColor = alertLevel === 'danger' ? S.danger : alertLevel === 'warn' ? '#C9A84C' : S.dim;
  const alertMsg   = alertLevel === 'danger' ? '🔴 ISS ახლოსაა! ზეცაში ადევნეთ თვალი!' :
                     alertLevel === 'warn'   ? '🟡 ISS ახლოვდება!' : '';

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto 40px', padding: '0 16px' }}>
      <div style={{ ...S.glass, padding: '24px 28px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          🛸 ISS — საერთაშორისო კოსმოსური სადგური
        </h2>
        {iss ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: '1 1 200px' }}>
              <div style={{ fontSize: 14 }}>📍 {iss.latitude.toFixed(2)}°N, {iss.longitude.toFixed(2)}°E</div>
              <div style={{ fontSize: 14 }}>⬆️ სიმაღლე: {Math.round(iss.altitude)} კმ</div>
              <div style={{ fontSize: 14 }}>⚡ სიჩქარე: {Math.round(iss.velocity).toLocaleString()} კმ/სთ</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: '1 1 200px' }}>
              <div style={{ fontSize: 14 }}>📏 დაშორება: <span style={{ color: alertColor, fontWeight: 700 }}>{dist?.toLocaleString()} კმ</span></div>
              {alertMsg && <div style={{ color: alertColor, fontSize: 13, fontWeight: 600 }}>{alertMsg}</div>}
              {/* Distance bar */}
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 100, height: 8, overflow: 'hidden', maxWidth: 220 }}>
                <div style={{
                  height: '100%', borderRadius: 100,
                  background: alertColor,
                  width: `${Math.max(5, Math.min(100, 100 - (dist / 20000) * 100))}%`,
                  transition: 'width 0.5s',
                }} />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: S.dim, fontSize: 14 }}>ISS მონაცემები იტვირთება…</div>
        )}
      </div>
    </section>
  );
}

function APODSection({ apod }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => { setImgError(false); }, [apod]);

  if (!apod) {
    return (
      <section style={{ maxWidth: 1100, margin: '0 auto 40px', padding: '0 16px' }}>
        <div style={{ ...S.glass, padding: 24, textAlign: 'center', color: S.dim }}>
          📡 NASA სურათი იტვირთება…
        </div>
      </section>
    );
  }

  const isVideo = apod.media_type === 'video';

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto 40px', padding: '0 16px' }}>
      <div style={{ ...S.glass, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 12px', fontWeight: 700, fontSize: 17 }}>
          📡 დღის სამყაროს სურათი
        </div>

        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', margin: '0 0 0 0' }}>
          {isVideo ? (
            <a href={apod.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', position: 'relative', height: '100%' }}>
              <div style={{
                width: '100%', height: '100%',
                background: 'radial-gradient(ellipse, #0a1628, #080C14)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 64 }}>▶️</span>
              </div>
            </a>
          ) : imgError ? (
            <div style={{
              width: '100%', height: '100%',
              background: 'radial-gradient(ellipse, #0a1628, #080C14)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12,
            }}>
              <span style={{ fontSize: 48 }}>🌌</span>
              <span style={{ color: S.dim, fontSize: 13 }}>სურათი ვერ ჩაიტვირთა</span>
            </div>
          ) : (
            <img
              src={apod.hdurl || apod.url}
              alt={apod.title}
              onError={() => setImgError(true)}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                animation: 'fadeIn 0.8s ease',
              }}
            />
          )}
        </div>

        {/* Caption */}
        <div style={{ padding: '16px 24px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{apod.title}</div>
          <div style={{ color: S.dim, fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
            {(apod.explanation || '').slice(0, 200)}…
          </div>
          <a
            href={apod.url} target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-block', padding: '8px 18px',
              background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: 100, color: S.gold, textDecoration: 'none', fontSize: 13,
            }}
          >
            ↗ NASA-ზე სრული სურათი
          </a>
        </div>
      </div>
    </section>
  );
}

function CosmosGallery({ cosmos }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => { setImgError(false); }, [cosmos]);

  if (!cosmos) {
    return (
      <section style={{ maxWidth: 1100, margin: '0 auto 40px', padding: '0 16px' }}>
        <div style={{ ...S.glass, padding: 24, textAlign: 'center', color: S.dim }}>
          🌌 სამყაროს გალერეა იტვირთება…
        </div>
      </section>
    );
  }

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto 40px', padding: '0 16px' }}>
      <div style={{ ...S.glass, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 12px', fontWeight: 700, fontSize: 17 }}>
          🌌 სამყაროს გალერეა
        </div>

        <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
          {imgError ? (
            <div style={{
              width: '100%', height: '100%',
              background: 'radial-gradient(ellipse, #0a1628, #080C14)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12,
            }}>
              <span style={{ fontSize: 48 }}>🌠</span>
              <span style={{ color: S.dim, fontSize: 13 }}>სურათი ვერ ჩაიტვირთა</span>
            </div>
          ) : (
            <img
              src={cosmos.hdurl || cosmos.url}
              alt={cosmos.title}
              onError={() => setImgError(true)}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                animation: 'fadeScaleIn 0.8s ease',
                transformOrigin: 'center',
              }}
            />
          )}
        </div>

        <div style={{ padding: '16px 24px 20px' }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>✦ {cosmos.title}</div>
          <div style={{ color: S.dim, fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
            {(cosmos.explanation || '').slice(0, 200)}…
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ color: S.dim, fontSize: 12 }}>
              📅 {cosmos.date} · 🔭 Webb / NASA
            </span>
            <a
              href={cosmos.hdurl || cosmos.url} target="_blank" rel="noopener noreferrer"
              style={{
                padding: '6px 16px',
                background: 'rgba(79,195,195,0.12)', border: '1px solid rgba(79,195,195,0.3)',
                borderRadius: 100, color: S.blue, textDecoration: 'none', fontSize: 12,
              }}
            >
              ↗ სრული სურათი NASA-ზე
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function SkyMap() {
  return (
    <section style={{ maxWidth: 1100, margin: '0 auto 40px', padding: '0 16px' }}>
      <div style={{ ...S.glass, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 12px', fontWeight: 700, fontSize: 17 }}>
          🗺 ვარსკვლავური რუკა
        </div>
        <div style={{ padding: '0 0 8px', color: S.dim, fontSize: 12, paddingLeft: 24 }}>
          შეეხეთ და გადაიტანეთ ცის სანახავად · Tbilisi, Georgia
        </div>
        <div style={{ position: 'relative', height: 400, overflow: 'hidden', borderRadius: '0 0 20px 20px' }}>
          <iframe
            src="https://stellarium-web.org/"
            title="Stellarium Sky Map"
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="fullscreen"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

function ObservingTips({ cloudCover }) {
  const tips = cloudCover === null ? null
    : cloudCover <= 20 ? { icon: '☀️', level: 'შესანიშნავი', text: '0–20%: შესანიშნავია! ღამე ვარსკვლავებს ნახავთ. დააკვირდით იუპიტერს!', color: S.success }
    : cloudCover <= 60 ? { icon: '⛅', level: 'საშუალო',    text: '20–60%: სასიამოვნო. ხანდახან ვარსკვლავები ჩანს.', color: S.gold }
    :                    { icon: '☁️', level: 'ცუდი',        text: '60%+: ძლიერი ღრუბლიანობა. დაელოდეთ მოწმენდას.', color: S.danger };

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto 40px', padding: '0 16px' }}>
      <div className="observing-card" style={{ ...S.glass, padding: '20px 24px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>💡 დაკვირვების რჩევები</h2>
        {tips ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span className={`tip-icon${tips.icon === '☀️' ? ' sun-rotating' : ''}`} style={{ fontSize: 32 }}>{tips.icon}</span>
            <div>
              <div style={{ fontWeight: 700, color: tips.color, marginBottom: 4 }}>
                პირობები: {tips.level}
              </div>
              <div style={{ color: S.dim, fontSize: 14, lineHeight: 1.6 }}>{tips.text}</div>
            </div>
          </div>
        ) : (
          <div style={{ color: S.dim, fontSize: 14 }}>ამინდის მონაცემები იტვირთება…</div>
        )}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '32px 20px',
      textAlign: 'center',
      color: S.dim,
      fontSize: 13,
    }}>
      <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <img src="/logo-icon.png" alt="Astroman" style={{ height: 44, width: 'auto', filter: 'invert(1) drop-shadow(0 0 6px rgba(201,168,76,0.5))' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: S.gold, letterSpacing: 1, lineHeight: 1 }}>ასტრომანი</span>
            <span style={{ fontSize: 10, color: S.dim, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: "'Chakra Petch', monospace" }}>Sky Intelligence</span>
          </div>
        </div>
        <div>სამყაროს ყოველდღიური სახელმძღვანელო</div>
        <div>📍 თბილისი, ქ. ყიფიანის 17 | 📞 599 39 67 21 | ✉️ info@astroman.ge</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 4 }}>
          <a href="https://astroman.ge" style={{ color: S.dim, textDecoration: 'none' }}>🏠 მთავარი</a>
          <a href="https://astroman.ge" style={{ color: S.dim, textDecoration: 'none' }}>⭐ მაღაზია</a>
          <a href="https://astroman.ge" style={{ color: S.dim, textDecoration: 'none' }}>📱 აპლიკაცია</a>
        </div>
        <div style={{ fontSize: 12, marginTop: 8 }}>© 2026 ASTROMAN</div>
      </div>
    </footer>
  );
}

function PlanetModal({ planet, onClose }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!planet) return;
    setImgError(false);
    document.body.style.overflow = 'hidden';
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [planet, onClose]);

  if (!planet) return null;

  const imgSrc = PLANET_IMAGES[planet.id];
  const fact   = PLANET_FACTS[planet.id];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          ...S.glass,
          width: '100%', maxWidth: 520,
          maxHeight: '90vh', overflowY: 'auto',
          borderRadius: '20px 20px 0 0',
          animation: 'slideUp 0.3s ease',
          background: 'rgba(8,12,20,0.97)',
        }}
        className="planet-modal-inner"
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px 0' }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{planet.emoji} {planet.ka}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: S.dim, fontSize: 20, cursor: 'pointer', padding: 4 }}>✕</button>
        </div>

        {/* Planet image */}
        <div style={{ margin: '12px 0', aspectRatio: '16/9', overflow: 'hidden', position: 'relative' }}>
          {imgError ? (
            <div style={{
              width: '100%', height: '100%',
              background: 'radial-gradient(ellipse, #0a1628, #080C14)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 120, filter: 'drop-shadow(0 0 40px rgba(201,168,76,0.4))' }}>{planet.emoji}</span>
            </div>
          ) : (
            <img
              src={imgSrc}
              alt={planet.ka}
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', animation: 'fadeIn 0.6s ease' }}
            />
          )}
        </div>

        {/* Stats */}
        <div style={{ padding: '0 20px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              ['📍 ამჟამინდელი თანავარსკვლავედი', planet.constellation],
              ['📐 სიმაღლე ჰორიზონტიდან', `${planet.maxAlt}°`],
              ['✨ სიკაშკაშე (mag)', String(planet.mag)],
              ['👁 ხილვადობა', planet.visible ? 'შეიმჩნევა ღამით' : 'ახლა არ ჩანს'],
              ['🔭 ტელესკოპი', planet.eye ? 'არ სჭირდება' : 'საჭიროა'],
            ].map(([k, v]) => (
              <div key={k} style={{ ...S.glass, padding: '10px 12px', borderRadius: 12 }}>
                <div style={{ fontSize: 11, color: S.dim, marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Fun fact */}
          {fact && (
            <div style={{ ...S.glass, padding: '12px 16px', borderRadius: 14, marginTop: 4 }}>
              <div style={{ fontSize: 12, color: S.dim, marginBottom: 6 }}>💫 საინტერესო ფაქტი</div>
              <div style={{ fontSize: 13, lineHeight: 1.7 }}>{fact}</div>
            </div>
          )}

          {/* Telescope link */}
          <a
            href="https://astroman.ge"
            style={{
              display: 'block', textAlign: 'center', padding: '12px',
              background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: 14, color: S.gold, textDecoration: 'none', fontWeight: 600, fontSize: 14,
              marginBottom: 20,
            }}
          >
            🔭 ტელესკოპი ამ პლანეტისთვის — მაღაზია
          </a>
        </div>
      </div>

      <style>{`
        @media (min-width: 640px) {
          .planet-modal-inner {
            border-radius: 20px !important;
            margin-bottom: 40px;
          }
        }
        @keyframes slideUp   { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn    { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeScaleIn { from { opacity: 0; transform: scale(1.02); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

function TonightsSkyCard({ weather }) {
  const cloudCover = weather?.cloud_cover ?? null;

  const astro = useMemo(() => {
    const now = new Date();
    const sun     = getSunTimes(now);
    const moon    = getMoonInfo(now);
    const planets = getVisiblePlanets(now).filter(p => p.visible);
    const score   = getStargazingScore(
      cloudCover ?? 50,
      moon.illumination,
      now.getHours()
    );
    return { sun, moon, planets, score };
  }, [cloudCover]);

  function fmt(date) {
    if (!date) return '—';
    return new Date(date).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  function cloudLabel(pct) {
    if (pct === null) return '—';
    if (pct <= 10)  return 'მოწმენდილი';
    if (pct <= 30)  return 'ძირითადად მოწმენდილი';
    if (pct <= 60)  return 'ნაწილობრივ მოღრუბლული';
    return 'მოღრუბლული';
  }

  function scoreColor(s) {
    if (s >= 80) return '#4FC3C3';
    if (s >= 60) return '#4ade80';
    if (s >= 30) return '#f59e0b';
    return '#ff6b6b';
  }

  function scoreLabel(s) {
    if (s >= 80) return 'შესანიშნავი';
    if (s >= 60) return 'კარგი';
    if (s >= 30) return 'საშუალო';
    return 'ცუდი';
  }

  const now = new Date();
  const dateStr = `${now.getDate()} ${GEO_MONTHS[now.getMonth()]}`;

  const viewStart = astro.sun.astroTwilightEnd || astro.sun.sunset;
  const viewEnd   = astro.sun.astroTwilightBegin || astro.sun.sunrise;

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto 32px', padding: '0 16px' }}>
      <a
        href="/sky-tools/conditions"
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <div
          style={{
            ...S.glass,
            padding: '24px 28px',
            cursor: 'pointer',
            transition: 'border-color 0.2s, background 0.2s',
            border: '1px solid rgba(201,168,76,0.15)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)'; e.currentTarget.style.background = S.glassHover.background; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.15)'; e.currentTarget.style.background = S.glass.background; }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>🌌 დღეს ღამის ცა</div>
              <div style={{ fontSize: 12, color: S.dim, marginTop: 2 }}>{dateStr} · თბილისი</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 48, fontWeight: 700, lineHeight: 1,
                color: scoreColor(astro.score),
                fontFamily: "'Chakra Petch', monospace",
              }}>
                {astro.score}
              </div>
              <div style={{ fontSize: 11, color: scoreColor(astro.score), textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {scoreLabel(astro.score)}
              </div>
            </div>
          </div>

          {/* Row 1: Sun + Cloud */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 18, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 11, color: S.dim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>მზე</div>
              <div style={{ fontSize: 13, display: 'flex', gap: 16 }}>
                <span>🌅 {fmt(astro.sun.sunset)}</span>
                <span>🌄 {fmt(astro.sun.sunrise)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 11, color: S.dim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>ღრუბლიანობა</div>
              <div style={{ fontSize: 13 }}>
                {cloudCover !== null
                  ? `☁️ ${cloudCover}% — ${cloudLabel(cloudCover)}`
                  : '—'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 11, color: S.dim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>საუკეთესო პერიოდი</div>
              <div style={{ fontSize: 13, color: '#4FC3C3', fontFamily: "'Chakra Petch', monospace" }}>
                🔭 {fmt(viewStart)} — {fmt(viewEnd)}
              </div>
            </div>
          </div>

          {/* Moon */}
          <div style={{
            ...S.glass,
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px 16px', marginBottom: 16, borderRadius: 10,
            background: 'rgba(255,255,255,0.03)',
          }}>
            <span style={{ fontSize: 28 }}>{astro.moon.phaseEmoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{astro.moon.phaseName}</div>
              <div style={{ fontSize: 11, color: S.dim }}>{astro.moon.illumination}% განათება · {astro.moon.age} დღე</div>
            </div>
            <div style={{ fontSize: 12, color: S.dim, textAlign: 'right' }}>
              <div>↑ {fmt(astro.moon.rise)}</div>
              <div>↓ {fmt(astro.moon.set)}</div>
            </div>
          </div>

          {/* Visible Planets */}
          {astro.planets.length > 0 ? (
            <div>
              <div style={{ fontSize: 11, color: S.dim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                ხილული პლანეტები ({astro.planets.length})
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {astro.planets.map(p => (
                  <div key={p.id} style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 8, padding: '8px 12px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    minWidth: 72,
                  }}>
                    <span style={{ fontSize: 20 }}>{p.emoji}</span>
                    <span style={{ fontSize: 11, fontWeight: 600 }}>{p.ka}</span>
                    <span style={{ fontSize: 10, color: S.dim }}>{p.altitude}°</span>
                    <span style={{ fontSize: 10, color: S.dim }}>↑ {fmt(p.rise)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: S.dim }}>ამჟამად პლანეტები ჰორიზონტის ქვემოთაა</div>
          )}

          {/* Footer hint */}
          <div style={{ marginTop: 16, fontSize: 11, color: S.dim, textAlign: 'right' }}>
            სრული ინფო → /sky-tools/conditions ↗
          </div>
        </div>
      </a>
    </section>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function SKY() {
  const [now,        setNow]        = useState(new Date());
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [weather,    setWeather]    = useState(null);
  const [sunData,    setSunData]    = useState(null);
  const [iss,        setISS]        = useState(null);
  const [apod,       setApod]       = useState(null);
  const [cosmos,     setCosmos]     = useState(null);
  const [selPlanet,  setSelPlanet]  = useState(null);

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Weather + Sun — fetch all data every 10 min
  const fetchAllData = useCallback(async () => {
    try {
      const [wRes, sRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,cloud_cover,wind_speed_10m,weather_code,precipitation&timezone=Asia/Tbilisi`),
        fetch(`https://api.sunrise-sunset.org/json?lat=${LAT}&lng=${LON}&formatted=0&tzid=Asia/Tbilisi`),
      ]);
      if (wRes.ok) {
        const w = await wRes.json();
        setWeather(w.current);
      }
      if (sRes.ok) {
        const s = await sRes.json();
        if (s.status === 'OK') setSunData(s.results);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchAllData();
    const id = setInterval(fetchAllData, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchAllData]);

  // ISS — every 5 seconds
  const fetchISS = useCallback(async () => {
    try {
      const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
      if (res.ok) setISS(await res.json());
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchISS();
    const id = setInterval(fetchISS, 5000);
    return () => clearInterval(id);
  }, [fetchISS]);

  // NASA APOD — today
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
        if (res.ok) setApod(await res.json());
      } catch (_) {}
    };
    load();
  }, []);

  // NASA Cosmos Gallery — rotating archive
  useEffect(() => {
    const load = async () => {
      const dayIndex = Math.floor(Date.now() / 86400000) % COSMOS_DATES.length;
      for (let i = 0; i < COSMOS_DATES.length; i++) {
        const date = COSMOS_DATES[(dayIndex + i) % COSMOS_DATES.length];
        try {
          const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=${date}`);
          if (res.ok) {
            const data = await res.json();
            if (data.media_type === 'image') { setCosmos(data); break; }
          }
        } catch (_) {}
      }
    };
    load();
  }, []);

  const skyStatus = getSkyStatus(sunData?.sunrise, sunData?.sunset, sunData?.civil_twilight_end, now);

  return (
    <div style={S.root}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <Hero now={now} skyStatus={skyStatus} sunset={sunData?.sunset} />

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <StatsRow weather={weather} sunData={sunData} />
      </div>

      <TonightsSkyCard weather={weather} />

      <PlanetsSection onPlanetClick={setSelPlanet} />

      <ISSTracker iss={iss} />

      <APODSection apod={apod} />

      <CosmosGallery cosmos={cosmos} />

      <SkyMap />

      <ObservingTips cloudCover={weather ? weather.cloud_cover : null} />

      <Footer />

      {selPlanet && <PlanetModal planet={selPlanet} onClose={() => setSelPlanet(null)} />}

      <style>{`
        /* ─── Base ─── */
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.4); border-radius: 2px; }

        /* ─── Keyframes ─── */
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.6); opacity: 0.5; }
        }
        @keyframes sunRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes slideUp     { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn      { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeScaleIn { from { opacity: 0; transform: scale(1.02); } to { opacity: 1; transform: scale(1); } }

        /* ─── Page load animations ─── */
        .astroman-nav  { animation: fadeSlideUp 0.5s cubic-bezier(0.4,0,0.2,1) both; }
        .hero-section  { animation: fadeSlideUp 0.5s cubic-bezier(0.4,0,0.2,1) 0.1s both; }
        .stat-card     { animation: fadeSlideUp 0.5s cubic-bezier(0.4,0,0.2,1) both; }
        .stat-card:nth-child(1) { animation-delay: 0.2s; }
        .stat-card:nth-child(2) { animation-delay: 0.25s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:nth-child(4) { animation-delay: 0.35s; }

        /* ─── Hero card — star field + radial glow ─── */
        .hero-card {
          background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 70%);
        }
        .hero-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 1px; height: 1px;
          background: white;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          box-shadow:
            45px 23px 0 rgba(255,255,255,0.3),   120px 67px 0 rgba(255,255,255,0.15),
            230px 34px 0 rgba(255,255,255,0.25),  340px 89px 0 rgba(255,255,255,0.1),
            450px 15px 0 rgba(255,255,255,0.35),  560px 78px 0 rgba(255,255,255,0.2),
            640px 45px 0 rgba(255,255,255,0.15),   80px 145px 0 rgba(255,255,255,0.2),
            190px 112px 0 rgba(255,255,255,0.3),  290px 178px 0 rgba(255,255,255,0.1),
            410px 134px 0 rgba(255,255,255,0.25), 510px 167px 0 rgba(255,255,255,0.15),
            620px 123px 0 rgba(255,255,255,0.35),  30px 200px 0 rgba(255,255,255,0.1),
            160px 234px 0 rgba(255,255,255,0.25), 270px 256px 0 rgba(255,255,255,0.2),
            380px 278px 0 rgba(255,255,255,0.1),  490px 213px 0 rgba(255,255,255,0.3),
            590px 245px 0 rgba(255,255,255,0.15), 680px 198px 0 rgba(255,255,255,0.2),
             70px 312px 0 rgba(255,255,255,0.1),  155px 345px 0 rgba(255,255,255,0.2),
            245px 323px 0 rgba(255,255,255,0.25), 350px 356px 0 rgba(255,255,255,0.15),
            460px 334px 0 rgba(255,255,255,0.1),  555px 367px 0 rgba(255,255,255,0.3),
            645px 345px 0 rgba(255,255,255,0.15),  15px  89px 0 rgba(255,255,255,0.2),
             95px 178px 0 rgba(255,255,255,0.15), 175px 156px 0 rgba(255,255,255,0.25),
            265px  89px 0 rgba(255,255,255,0.1),  355px  45px 0 rgba(255,255,255,0.2),
            435px 234px 0 rgba(255,255,255,0.15), 525px 112px 0 rgba(255,255,255,0.3),
            615px 267px 0 rgba(255,255,255,0.1),   22px 267px 0 rgba(255,255,255,0.25),
            112px 289px 0 rgba(255,255,255,0.15), 202px 312px 0 rgba(255,255,255,0.2),
            302px 134px 0 rgba(255,255,255,0.1),  402px 167px 0 rgba(255,255,255,0.25),
            502px  89px 0 rgba(255,255,255,0.15), 602px  56px 0 rgba(255,255,255,0.3),
            692px 278px 0 rgba(255,255,255,0.1),   55px 367px 0 rgba(255,255,255,0.2),
            148px 378px 0 rgba(255,255,255,0.15), 238px 389px 0 rgba(255,255,255,0.25),
            328px 345px 0 rgba(255,255,255,0.1),  418px 312px 0 rgba(255,255,255,0.2),
            518px 289px 0 rgba(255,255,255,0.15), 608px 334px 0 rgba(255,255,255,0.3),
              8px 145px 0 rgba(255,255,255,0.1),   88px  56px 0 rgba(255,255,255,0.25),
            188px  23px 0 rgba(255,255,255,0.2),  288px 167px 0 rgba(255,255,255,0.15),
            388px  56px 0 rgba(255,255,255,0.3),  488px 178px 0 rgba(255,255,255,0.1),
            578px  23px 0 rgba(255,255,255,0.2),  668px  89px 0 rgba(255,255,255,0.15),
             38px  56px 0 rgba(255,255,255,0.25), 138px 123px 0 rgba(255,255,255,0.1),
            218px 200px 0 rgba(255,255,255,0.2),  318px 223px 0 rgba(255,255,255,0.15),
            418px  56px 0 rgba(255,255,255,0.3),  518px 234px 0 rgba(255,255,255,0.1),
            618px 178px 0 rgba(255,255,255,0.25), 698px 145px 0 rgba(255,255,255,0.15),
             62px 289px 0 rgba(255,255,255,0.2),  162px 167px 0 rgba(255,255,255,0.3),
            252px  45px 0 rgba(255,255,255,0.1),  362px 312px 0 rgba(255,255,255,0.25),
            472px 256px 0 rgba(255,255,255,0.15), 572px 312px 0 rgba(255,255,255,0.2),
            662px  23px 0 rgba(255,255,255,0.1),   42px 134px 0 rgba(255,255,255,0.3),
            142px  78px 0 rgba(255,255,255,0.15), 232px 267px 0 rgba(255,255,255,0.25),
            332px  56px 0 rgba(255,255,255,0.1),  432px 389px 0 rgba(255,255,255,0.2),
            532px 145px 0 rgba(255,255,255,0.3),  632px 389px 0 rgba(255,255,255,0.15);
        }
        .hero-card > * { position: relative; z-index: 1; }

        /* ─── Corner bracket decorations ─── */
        .corner-tl, .corner-tr, .corner-bl, .corner-br {
          position: absolute;
          width: 16px; height: 16px;
          pointer-events: none;
          z-index: 2;
        }
        .corner-tl { top: 16px; left: 16px;   border-top:    2px solid #C9A84C; border-left:  2px solid #C9A84C; }
        .corner-tr { top: 16px; right: 16px;  border-top:    2px solid #C9A84C; border-right: 2px solid #C9A84C; }
        .corner-bl { bottom: 16px; left: 16px;  border-bottom: 2px solid #C9A84C; border-left:  2px solid #C9A84C; }
        .corner-br { bottom: 16px; right: 16px; border-bottom: 2px solid #C9A84C; border-right: 2px solid #C9A84C; }

        /* ─── ASTROMAN live label ─── */
        .live-label {
          letter-spacing: 0.25em;
          font-size: 10px;
          color: #5A6A80;
          font-family: 'Chakra Petch', monospace;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        /* ─── Pulsing cyan live dot ─── */
        .live-dot {
          display: inline-block;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #4FC3C3;
          animation: pulseGlow 2s cubic-bezier(0.4,0,0.2,1) infinite;
          flex-shrink: 0;
        }

        /* ─── Hero time — Chakra Petch instrument font ─── */
        .hero-time { font-family: 'Chakra Petch', monospace !important; }

        /* ─── Gold word: thin HR rules above and below ─── */
        .gold-word-span { display: block; }
        .gold-word-span::before,
        .gold-word-span::after {
          content: '';
          display: block;
          height: 1px;
          background: rgba(201,168,76,0.3);
          margin: 8px auto;
          width: 60%;
        }

        /* ─── Numeric values — instrument typeface ─── */
        .numeric-value { font-family: 'Chakra Petch', monospace !important; }

        /* ─── Stat cards ─── */
        .stat-card {
          border-top: 2px solid #C9A84C !important;
          background: linear-gradient(180deg, rgba(201,168,76,0.04) 0%, transparent 40%), #0D1420 !important;
          border-radius: 12px !important;
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1) !important;
        }
        .stat-card:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
          border-top-color: #daba6a !important;
        }
        .stat-icon {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
        }

        /* ─── Sun icon rotation (clear sky condition) ─── */
        .tip-icon { display: inline-block; }
        .sun-rotating { animation: sunRotate 30s linear infinite; }

        /* ─── Responsive (preserved from components) ─── */
        @media (min-width: 768px) { .hamburger { display: none !important; } }
        @media (max-width: 767px) { .desktop-nav { display: none !important; } }
        @media (min-width: 640px) { .planet-modal-inner { border-radius: 20px !important; margin-bottom: 40px; } }
      `}</style>
    </div>
  );
}
