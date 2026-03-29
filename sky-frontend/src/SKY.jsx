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

function Navbar({ menuOpen, setMenuOpen, skyStatus, visibleCount }) {
  return (
    <nav className="astroman-nav" style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(8,12,20,0.96)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      padding: '0 20px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

        {/* Brand */}
        <a href="https://astroman.ge" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo-icon.png" alt="Astroman" style={{ height: 42, width: 'auto', filter: 'invert(1) drop-shadow(0 0 8px rgba(201,168,76,0.6))' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: S.gold, letterSpacing: 1, lineHeight: 1 }}>ასტრომანი</span>
            <span style={{ fontSize: 10, color: S.dim, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: "'Chakra Petch', monospace" }}>Sky Intelligence</span>
          </div>
        </a>

        {/* Live status pill — center */}
        {skyStatus && (
          <div className="desktop-nav" style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: `${skyStatus.color}14`,
            border: `1px solid ${skyStatus.color}40`,
            borderRadius: 100, padding: '6px 16px',
            fontSize: 12, color: skyStatus.color, fontWeight: 500,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: skyStatus.color, display: 'inline-block',
              animation: 'pulseGlow 2s cubic-bezier(0.4,0,0.2,1) infinite',
            }} />
            {skyStatus.label}
            {visibleCount > 0 && (
              <span style={{
                marginLeft: 8, paddingLeft: 8,
                borderLeft: `1px solid ${skyStatus.color}40`,
                color: S.gold, fontFamily: "'Chakra Petch', monospace", fontSize: 11,
              }}>
                {visibleCount} 🪐
              </span>
            )}
          </div>
        )}

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }} className="desktop-nav">
          <a href="#planets" className="nav-link" style={{ color: S.dim, textDecoration: 'none', fontSize: 14 }}>🪐 პლანეტები</a>
          <a href="#sky-map" className="nav-link" style={{ color: S.dim, textDecoration: 'none', fontSize: 14 }}>🗺 ცის რუკა</a>
          <a href="https://astroman.ge" className="nav-link" style={{
            color: S.gold, textDecoration: 'none', fontSize: 14, fontWeight: 600,
            border: `1px solid ${S.gold}44`, borderRadius: 8, padding: '5px 14px',
          }}>მაღაზია ↗</a>
        </div>

        {/* Hamburger */}
        <button onClick={() => setMenuOpen(o => !o)}
          style={{ background: 'none', border: 'none', color: '#E8EDF5', fontSize: 24, cursor: 'pointer', padding: 8 }}
          aria-label="მენიუ" className="hamburger">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background: 'rgba(8,12,20,0.98)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '16px 20px 24px',
          display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          {skyStatus && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: `${skyStatus.color}14`, border: `1px solid ${skyStatus.color}40`,
              borderRadius: 100, padding: '6px 16px',
              fontSize: 13, color: skyStatus.color, alignSelf: 'flex-start',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: skyStatus.color, display: 'inline-block', animation: 'pulseGlow 2s infinite' }} />
              {skyStatus.label}
            </div>
          )}
          <a href="#planets"  onClick={() => setMenuOpen(false)} className="nav-link" style={{ color: S.dim, textDecoration: 'none', fontSize: 16 }}>🪐 პლანეტები</a>
          <a href="#sky-map"  onClick={() => setMenuOpen(false)} className="nav-link" style={{ color: S.dim, textDecoration: 'none', fontSize: 16 }}>🗺 ცის რუკა</a>
          <a href="https://astroman.ge" className="nav-link" style={{ color: S.gold, textDecoration: 'none', fontSize: 16 }}>🏠 მაღაზია</a>
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

function StatsRow({ weather, sunData, now }) {
  const moon = getMoonPhase();

  function fmtT(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  function windDirLabel(deg) {
    if (deg == null) return '';
    return ['N','NE','E','SE','S','SW','W','NW'][Math.round(deg / 45) % 8];
  }
  function cloudColor(pct) {
    if (pct <= 20) return '#4ade80';
    if (pct <= 60) return '#f59e0b';
    return '#ff6b6b';
  }
  function tempColor(t) {
    if (t > 25) return '#f59e0b';
    if (t > 5)  return '#4FC3C3';
    return '#93c5fd';
  }
  function seeingScore() {
    if (!weather) return null;
    let s = 10 - Math.floor(weather.cloud_cover / 10);
    if (weather.wind_speed_10m > 20) s -= 2;
    if (weather.wind_speed_10m > 40) s -= 2;
    return Math.max(1, Math.min(10, s));
  }
  const seeing = seeingScore();
  const seeingColor = seeing ? (seeing >= 7 ? '#4ade80' : seeing >= 4 ? '#f59e0b' : '#ff6b6b') : S.dim;
  const cc = weather?.cloud_cover ?? 0;
  const wsp = weather?.wind_speed_10m ?? 0;

  const cards = [
    {
      id: 'sunset', icon: '🌅', label: 'მზის ჩასვლა',
      value: fmtT(sunData?.sunset),
      sub: sunData?.sunset ? relativeTime(sunData.sunset, now) : '',
    },
    {
      id: 'sunrise', icon: '🌄', label: 'მზის ამოსვლა',
      value: fmtT(sunData?.sunrise),
      sub: sunData?.sunrise ? relativeTime(sunData.sunrise, now) : '',
    },
    {
      id: 'moon', icon: moon.emoji, label: 'მთვარე',
      value: `${moon.illumination}%`,
      sub: moon.name,
      bar: { pct: moon.illumination, color: '#94a3b8' },
    },
    {
      id: 'clouds', icon: '☁️', label: 'ღრუბლიანობა',
      value: weather ? `${cc}%` : '…',
      sub: weather ? (WEATHER_CODES[weather.weather_code] || '') : '',
      bar: weather ? { pct: cc, color: cloudColor(cc) } : null,
      valueColor: weather ? cloudColor(cc) : '#E8EDF5',
    },
    {
      id: 'temp', icon: '🌡', label: 'ტემპერატურა',
      value: weather ? `${Math.round(weather.temperature_2m)}°C` : '…',
      sub: weather?.apparent_temperature != null ? `შეგრძნება ${Math.round(weather.apparent_temperature)}°C` : '',
      valueColor: weather ? tempColor(weather.temperature_2m) : '#E8EDF5',
    },
    {
      id: 'wind', icon: '💨', label: 'ქარი',
      value: weather ? `${Math.round(wsp)} კმ/სთ` : '…',
      sub: weather?.wind_direction_10m != null ? windDirLabel(weather.wind_direction_10m) : '',
      windDeg: weather?.wind_direction_10m,
    },
    {
      id: 'seeing', icon: '🔭', label: 'ცის ხილვადობა',
      value: seeing != null ? `${seeing}/10` : '…',
      sub: seeing != null ? (seeing >= 7 ? 'შესანიშნავი' : seeing >= 4 ? 'საშუალო' : 'ცუდი') : '',
      bar: seeing != null ? { pct: seeing * 10, color: seeingColor } : null,
      valueColor: seeingColor,
    },
  ];

  return (
    <div style={{ overflowX: 'auto', padding: '0 16px 4px', marginBottom: 32 }}>
      <div style={{ display: 'flex', gap: 12, minWidth: 'max-content', maxWidth: 1100, margin: '0 auto' }}>
        {cards.map(c => (
          <div key={c.id} className="stat-card" style={{
            ...S.glass,
            minWidth: 148, padding: '16px 18px',
            display: 'flex', flexDirection: 'column', gap: 5,
            flex: '1 1 148px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="stat-icon" style={{ fontSize: 17, width: 36, height: 36 }}>{c.icon}</div>
              <div style={{ fontSize: 11, color: S.dim, lineHeight: 1.3 }}>{c.label}</div>
            </div>
            <div className="numeric-value" style={{ fontSize: 22, fontWeight: 700, color: c.valueColor || '#E8EDF5', lineHeight: 1.1 }}>
              {c.value}
            </div>
            {c.sub && (
              <div style={{ fontSize: 11, color: S.dim, display: 'flex', alignItems: 'center', gap: 5 }}>
                {c.windDeg != null && (
                  <span style={{
                    display: 'inline-block',
                    transform: `rotate(${c.windDeg}deg)`,
                    fontSize: 13, lineHeight: 1,
                  }}>↑</span>
                )}
                {c.sub}
              </div>
            )}
            {c.bar && (
              <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginTop: 2 }}>
                <div style={{ height: '100%', width: `${Math.min(100, c.bar.pct)}%`, background: c.bar.color, borderRadius: 2, transition: 'width 0.6s ease' }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AltGauge({ alt, size = 64 }) {
  const pct  = Math.max(0, Math.min(90, alt)) / 90;
  const cx   = size / 2, cy = size * 0.62, r = size * 0.42;
  const endA = Math.PI - pct * Math.PI;
  const dot  = { x: cx + r * Math.cos(endA), y: cy - r * Math.sin(endA) };
  const lg   = pct > 0.5 ? 1 : 0;
  const col  = alt > 40 ? '#4ade80' : alt > 15 ? '#f59e0b' : S.blue;
  return (
    <svg width={size} height={size * 0.72} style={{ overflow: 'visible', display: 'block' }}>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`}
        fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={2.5} strokeLinecap="round" />
      {pct > 0.01 && (
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${lg} 0 ${dot.x} ${dot.y}`}
          fill="none" stroke={col} strokeWidth={2.5} strokeLinecap="round" />
      )}
      {pct > 0.01 && <circle cx={dot.x} cy={dot.y} r={3.5} fill={col} />}
      <text x={cx} y={cy - 1} textAnchor="middle" fill="#E8EDF5"
        fontSize={11} fontFamily="'Chakra Petch', monospace" fontWeight="700">{alt}°</text>
    </svg>
  );
}

function PlanetCard({ planet, onClick }) {
  const dim = !planet.visible;
  function fmtRise(d) {
    if (!d) return null;
    return new Date(d).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return (
    <button
      onClick={() => onClick(planet)}
      style={{
        ...S.glass,
        minWidth: 148, padding: '16px 14px 14px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        cursor: 'pointer', border: 'none', color: '#E8EDF5',
        opacity: dim ? 0.38 : 1,
        transition: 'transform 0.18s, box-shadow 0.18s, opacity 0.18s',
        flexShrink: 0,
        background: planet.visible ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
        boxShadow: planet.visible ? `0 0 0 1px ${S.success}28, 0 4px 24px rgba(74,222,128,0.06)` : 'none',
        position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => { if (!dim) { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 0 0 1px ${S.success}60, 0 12px 32px rgba(74,222,128,0.15)`; }}}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = planet.visible ? `0 0 0 1px ${S.success}28, 0 4px 24px rgba(74,222,128,0.06)` : 'none'; }}
      aria-label={planet.ka}
    >
      {/* Glow bg for visible */}
      {planet.visible && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, transparent, ${S.success}80, transparent)`,
        }} />
      )}

      <span style={{ fontSize: 38, filter: planet.visible ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none' }}>
        {planet.emoji}
      </span>
      <span style={{ fontWeight: 700, fontSize: 15 }}>{planet.ka}</span>
      <span style={{ fontSize: 10, color: S.dim }}>{planet.constellation}</span>

      {/* Altitude gauge */}
      <AltGauge alt={planet.altitude} size={68} />

      {/* Rise / Set */}
      <div style={{ display: 'flex', gap: 10, fontSize: 10, color: S.dim, width: '100%', justifyContent: 'center' }}>
        {fmtRise(planet.rise) && <span>↑ {fmtRise(planet.rise)}</span>}
        {fmtRise(planet.set)  && <span>↓ {fmtRise(planet.set)}</span>}
      </div>

      {/* Mag */}
      <div style={{ fontSize: 10, color: S.dim }}>mag {planet.mag}</div>

      {/* Visibility badge */}
      <div style={{
        padding: '3px 10px', borderRadius: 100, fontSize: 10, marginTop: 2,
        background: planet.visible ? 'rgba(74,222,128,0.12)' : 'rgba(255,107,107,0.12)',
        color: planet.visible ? S.success : S.danger,
        border: `1px solid ${planet.visible ? S.success : S.danger}44`,
      }}>
        {planet.visible ? (planet.eye ? '👁 შეუიარაღებელი' : '🔭 ტელესკოპი') : '🚫 არ ჩანს'}
      </div>
    </button>
  );
}

function PlanetsSection({ onPlanetClick }) {
  const livePlanets = useMemo(() => {
    const live = getVisiblePlanets();
    return PLANETS.map(p => {
      const ld = live.find(l => l.id === p.id) || {};
      return {
        ...p,
        altitude: ld.altitude != null ? ld.altitude : p.maxAlt,
        azimuth:  ld.azimuth  != null ? ld.azimuth  : 0,
        visible:  ld.visible  != null ? ld.visible   : p.visible,
        rise: ld.rise || null,
        set:  ld.set  || null,
      };
    });
  }, []);

  const visibleNow  = livePlanets.filter(p => p.visible);
  const hiddenNow   = livePlanets.filter(p => !p.visible);

  return (
    <section id="planets" style={{ maxWidth: 1100, margin: '0 auto 44px', padding: '0 16px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>🪐 პლანეტები ღამის ცაზე</h2>
        <span style={{
          fontSize: 12, color: S.success, fontFamily: "'Chakra Petch', monospace",
          background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
          borderRadius: 100, padding: '2px 10px',
        }}>{visibleNow.length} ჩანს</span>
      </div>
      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{ display: 'flex', gap: 12, minWidth: 'max-content' }}>
          {[...visibleNow, ...hiddenNow].map(p => (
            <PlanetCard key={p.id} planet={p} onClick={onPlanetClick} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ISSGlobe({ lat, lon }) {
  const W = 160, H = 100;
  const cx = W / 2, cy = H / 2, r = 44;
  const tbX = cx + (44.8271 / 180) * r * 2;
  const tbY = cy - (41.7151 / 90) * r;
  const issX = cx + ((lon > 180 ? lon - 360 : lon) / 180) * r * 2;
  const issY = cy - (lat / 90) * r;
  return (
    <svg width={W} height={H} style={{ flexShrink: 0 }}>
      {/* Earth ellipse */}
      <ellipse cx={cx} cy={cy} rx={r * 2} ry={r} fill="rgba(29,78,216,0.12)" stroke="rgba(59,130,246,0.25)" strokeWidth={1} />
      {/* Equator */}
      <line x1={cx - r * 2} y1={cy} x2={cx + r * 2} y2={cy} stroke="rgba(255,255,255,0.07)" strokeWidth={0.5} />
      {/* Prime meridian */}
      <ellipse cx={cx} cy={cy} rx={0.5} ry={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={0.5} />
      {/* Tbilisi dot */}
      <circle cx={tbX} cy={tbY} r={3} fill={S.gold} opacity={0.8} />
      <circle cx={tbX} cy={tbY} r={6} fill="none" stroke={S.gold} strokeWidth={0.8} opacity={0.4} />
      {/* ISS */}
      <circle cx={issX} cy={issY} r={5} fill={S.blue} />
      <circle cx={issX} cy={issY} r={10} fill="none" stroke={S.blue} strokeWidth={1} opacity={0.5} className="iss-ring-pulse" />
      {/* Legend */}
      <text x={tbX + 8} y={tbY + 4} fill={S.gold} fontSize={8} fontFamily="'Chakra Petch', monospace">TBS</text>
      <text x={issX + 8} y={issY + 4} fill={S.blue} fontSize={8} fontFamily="'Chakra Petch', monospace">ISS</text>
    </svg>
  );
}

function ISSTracker({ iss }) {
  const dist = iss ? Math.round(distanceKm(LAT, LON, iss.latitude, iss.longitude)) : null;
  const alertLevel = dist !== null ? (dist < 500 ? 'danger' : dist < 1500 ? 'warn' : 'ok') : 'ok';
  const alertColor = alertLevel === 'danger' ? S.danger : alertLevel === 'warn' ? S.gold : S.dim;
  const alertMsg   = alertLevel === 'danger' ? '🔴 ISS ახლოსაა — ადევნეთ თვალი ზეცას!' :
                     alertLevel === 'warn'   ? '🟡 ISS ახლოვდება თბილისს' : null;
  const velKms = iss ? (iss.velocity / 3600).toFixed(2) : null;

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto 44px', padding: '0 16px' }}>
      <div style={{ ...S.glass, padding: '24px 28px', overflow: 'hidden', position: 'relative' }}>

        {/* Subtle orbital bg decoration */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 220, height: 220, borderRadius: '50%',
          border: '1px solid rgba(79,195,195,0.08)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 140, height: 140, borderRadius: '50%',
          border: '1px solid rgba(79,195,195,0.12)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              🛸 ISS — საერთაშორისო კოსმოსური სადგური
            </h2>
            <div style={{ fontSize: 11, color: S.dim, fontFamily: "'Chakra Petch', monospace" }}>
              REAL-TIME · 5s REFRESH · ALTITUDE ~408 KM
            </div>
          </div>
          {iss && <ISSGlobe lat={iss.latitude} lon={iss.longitude} />}
        </div>

        {iss ? (
          <>
            {alertMsg && (
              <div style={{
                marginBottom: 16, padding: '10px 16px', borderRadius: 10,
                background: `${alertColor}18`, border: `1px solid ${alertColor}44`,
                color: alertColor, fontSize: 13, fontWeight: 600,
              }}>{alertMsg}</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {[
                { icon: '📍', label: 'კოორდინატები', value: `${iss.latitude.toFixed(2)}°, ${iss.longitude.toFixed(2)}°` },
                { icon: '⬆️', label: 'სიმაღლე', value: `${Math.round(iss.altitude)} კმ`, bar: { pct: (iss.altitude / 450) * 100, color: S.blue } },
                { icon: '⚡', label: 'სიჩქარე', value: `${Math.round(iss.velocity).toLocaleString()} კმ/სთ`, sub: `${velKms} კმ/წმ` },
                { icon: '📏', label: 'დაშორება (თბ.)', value: `${dist?.toLocaleString()} კმ`, valueColor: alertColor, bar: { pct: Math.max(2, Math.min(100, 100 - (dist / 20000) * 100)), color: alertColor } },
              ].map(item => (
                <div key={item.label} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10, padding: '12px 14px',
                }}>
                  <div style={{ fontSize: 11, color: S.dim, marginBottom: 4 }}>{item.icon} {item.label}</div>
                  <div className="numeric-value" style={{ fontSize: 20, fontWeight: 700, color: item.valueColor || '#E8EDF5' }}>{item.value}</div>
                  {item.sub && <div style={{ fontSize: 11, color: S.dim, marginTop: 2 }}>{item.sub}</div>}
                  {item.bar && (
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
                      <div style={{ height: '100%', width: `${item.bar.pct}%`, background: item.bar.color, borderRadius: 2, transition: 'width 0.5s' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ color: S.dim, fontSize: 14 }}>ISS მონაცემები იტვირთება…</div>
        )}
      </div>
      <style>{`
        @keyframes issRingPulse { 0%,100% { r: 10; opacity: 0.5; } 50% { r: 15; opacity: 0.1; } }
        .iss-ring-pulse { animation: issRingPulse 2s ease-in-out infinite; }
      `}</style>
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
    <section id="sky-map" style={{ maxWidth: 1100, margin: '0 auto 44px', padding: '0 16px' }}>
      <div style={{ ...S.glass, overflow: 'hidden', border: '1px solid rgba(79,195,195,0.15)' }}>

        {/* Header */}
        <div style={{ padding: '20px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>🗺 ცოცხალი ვარსკვლავური რუკა</div>
            <div style={{ fontSize: 11, color: S.dim, fontFamily: "'Chakra Petch', monospace" }}>
              STELLARIUM · TBILISI · 41.71°N 44.82°E · ALT 491M
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { label: 'გადაიტანე', icon: '✋' },
              { label: 'ზუმი', icon: '🔍' },
              { label: 'სრული ეკრანი', icon: '⛶' },
            ].map(h => (
              <div key={h.label} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, padding: '5px 10px', fontSize: 11, color: S.dim,
              }}>
                <span>{h.icon}</span> {h.label}
              </div>
            ))}
          </div>
        </div>

        {/* Coordinate strip */}
        <div style={{
          margin: '14px 28px 0',
          padding: '8px 14px',
          background: 'rgba(79,195,195,0.06)', border: '1px solid rgba(79,195,195,0.15)',
          borderRadius: 8,
          display: 'flex', gap: 24, flexWrap: 'wrap',
        }}>
          {[
            { label: 'LAT', value: '41.7151° N' },
            { label: 'LON', value: '44.8271° E' },
            { label: 'ALT', value: '491 m' },
            { label: 'TZ',  value: 'Asia/Tbilisi (UTC+4)' },
          ].map(c => (
            <div key={c.label} style={{ fontSize: 11 }}>
              <span style={{ color: S.dim, fontFamily: "'Chakra Petch', monospace" }}>{c.label} </span>
              <span style={{ color: S.blue, fontFamily: "'Chakra Petch', monospace", fontWeight: 700 }}>{c.value}</span>
            </div>
          ))}
        </div>

        {/* Map iframe */}
        <div style={{ position: 'relative', height: 520, overflow: 'hidden', margin: '14px 0 0', borderRadius: '0 0 12px 12px' }}>
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
      background: 'linear-gradient(180deg, transparent, rgba(201,168,76,0.03))',
      padding: '48px 20px 28px',
      color: S.dim,
      fontSize: 13,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Top grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>

          {/* Brand column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="/logo-icon.png" alt="Astroman" style={{ height: 44, filter: 'invert(1) drop-shadow(0 0 8px rgba(201,168,76,0.5))' }} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: S.gold, lineHeight: 1 }}>ასტრომანი</div>
                <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: "'Chakra Petch', monospace", marginTop: 2 }}>Sky Intelligence</div>
              </div>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: S.dim, maxWidth: 220 }}>
              სამყაროს ყოველდღიური სახელმძღვანელო. ცოცხალი სამყაროს ინტელექტი.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {['FB', 'IG', 'YT', 'TG'].map(s => (
                <div key={s} style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontFamily: "'Chakra Petch', monospace", color: S.dim,
                  cursor: 'pointer',
                }}>
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: S.gold, fontFamily: "'Chakra Petch', monospace", marginBottom: 16 }}>ნავიგაცია</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { href: '#planets',   label: '🪐 პლანეტები' },
                { href: '#sky-map',   label: '🗺 ცის რუკა' },
                { href: '#planets',   label: '🌌 NASA სურათი' },
                { href: 'https://astroman.ge', label: '🛍 ტელესკოპები' },
                { href: 'https://club.astroman.ge', label: '⭐ ასტრომანი კლუბი' },
              ].map(l => (
                <a key={l.label} href={l.href} style={{ color: S.dim, textDecoration: 'none', fontSize: 13, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = S.gold}
                  onMouseLeave={e => e.target.style.color = S.dim}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: S.gold, fontFamily: "'Chakra Petch', monospace", marginBottom: 16 }}>კონტაქტი</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '📍', text: 'თბილისი, ქ. ყიფიანის 17' },
                { icon: '📞', text: '599 39 67 21' },
                { icon: '✉️', text: 'info@astroman.ge' },
                { icon: '🌐', text: 'astroman.ge' },
              ].map(c => (
                <div key={c.icon} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13 }}>
                  <span>{c.icon}</span>
                  <span style={{ color: S.dim }}>{c.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sky status / live */}
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: S.gold, fontFamily: "'Chakra Petch', monospace", marginBottom: 16 }}>ცოცხალი სტატუსი</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
              <div style={{ color: S.dim }}>📡 Open-Meteo — ამინდი</div>
              <div style={{ color: S.dim }}>🛸 WhereTheISS — ISS</div>
              <div style={{ color: S.dim }}>🔭 Stellarium — ცის რუკა</div>
              <div style={{ color: S.dim }}>🌙 NASA APOD — სურათი</div>
              <div style={{ color: S.dim }}>☀️ Sunrise-Sunset API</div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 20 }} />

        {/* Bottom row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 12 }}>© 2026 ASTROMAN — ყველა უფლება დაცულია</div>
          <div style={{ fontSize: 11, fontFamily: "'Chakra Petch', monospace", color: S.dim }}>
            sky.astroman.ge · TBILISI · 41.71°N
          </div>
        </div>
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
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,apparent_temperature,cloud_cover,wind_speed_10m,wind_direction_10m,weather_code,precipitation,relative_humidity_2m&timezone=Asia/Tbilisi`),
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

  const skyStatus    = getSkyStatus(sunData?.sunrise, sunData?.sunset, sunData?.civil_twilight_end, now);
  const visibleCount = useMemo(() => getVisiblePlanets().filter(p => p.visible).length, []);

  return (
    <div style={S.root}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} skyStatus={skyStatus} visibleCount={visibleCount} />

      <Hero now={now} skyStatus={skyStatus} sunset={sunData?.sunset} />

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <StatsRow weather={weather} sunData={sunData} now={now} />
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
