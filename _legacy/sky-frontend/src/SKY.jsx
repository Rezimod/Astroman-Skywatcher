import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getMoonInfo, getSunTimes, getVisiblePlanets } from './lib/astronomy';

const LAT = 41.6938;
const LON = 44.8015;

const PLANETS = [
  { id: 'venus', ka: 'ვენერა', constellation: 'თევზები', maxAlt: 15, mag: -3.9, eye: true, tone: 'var(--accent-solar)' },
  { id: 'jupiter', ka: 'იუპიტერი', constellation: 'ტყუპები', maxAlt: 65, mag: -2.2, eye: true, tone: 'var(--accent-solar)' },
  { id: 'saturn', ka: 'სატურნი', constellation: 'თევზები', maxAlt: 12, mag: 1.0, eye: true, tone: 'var(--accent-solar)' },
  { id: 'mars', ka: 'მარსი', constellation: 'კირჩხიბი', maxAlt: 8, mag: 1.3, eye: false, tone: 'var(--accent-mars)' },
  { id: 'mercury', ka: 'მერკური', constellation: 'თევზები', maxAlt: 5, mag: 0.5, eye: false, tone: 'var(--text-secondary)' },
  { id: 'uranus', ka: 'ურანი', constellation: 'ხარი', maxAlt: 58, mag: 5.8, eye: false, tone: 'var(--accent-comet)' },
  { id: 'neptune', ka: 'ნეპტუნი', constellation: 'თევზები', maxAlt: 6, mag: 8.0, eye: false, tone: 'var(--accent-comet)' },
];

const PLANET_IMAGES = {
  venus: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Venus-real_color.jpg/1024px-Venus-real_color.jpg',
  jupiter: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Jupiter_and_its_shrunken_Great_Red_Spot.jpg/1024px-Jupiter_and_its_shrunken_Great_Red_Spot.jpg',
  saturn: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/1024px-Saturn_during_Equinox.jpg',
  mars: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/1024px-OSIRIS_Mars_true_color.jpg',
  mercury: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mercury_in_true_color.jpg/1024px-Mercury_in_true_color.jpg',
  uranus: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Uranus2.jpg/1024px-Uranus2.jpg',
  neptune: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg/1024px-Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg',
};

const PLANET_FACTS = {
  venus: 'ვენერა ყველაზე ცხელი პლანეტაა. მისი მკვრივი CO₂ ატმოსფერო ზედაპირს 465°C-მდე ათბობს.',
  jupiter: 'იუპიტერი ყველაზე დიდი პლანეტაა. მისი დიდი წითელი ლაქა მრავალსაუკუნოვანი შტორმია.',
  saturn: 'სატურნის რგოლები ყინულისა და ქვის ნაწილაკებისგან შედგება და ასობით ათასი კილომეტრით იშლება.',
  mars: 'მარსი რკინის ოქსიდის გამო წითელია. Olympus Mons მზის სისტემის უდიდესი ვულკანია.',
  mercury: 'მერკური ყველაზე სწრაფად მოძრაობს მზის გარშემო. ერთი წელი იქ მხოლოდ 88 დედამიწის დღეა.',
  uranus: 'ურანი თითქმის გვერდულად ბრუნავს. მისი ღერძი დაახლოებით 98 გრადუსით არის გადახრილი.',
  neptune: 'ნეპტუნზე ქარები 2,000 კმ/სთ-ზე სწრაფად მოძრაობს და მზის სისტემაში ერთ-ერთი ყველაზე აგრესიული ამინდია.',
};

const COSMOS_DATES = [
  '2024-04-24', '2024-03-11', '2024-01-09', '2024-06-12', '2023-11-01',
  '2024-02-19', '2023-09-12', '2024-05-03', '2023-07-12', '2024-08-06',
  '2023-10-22', '2024-03-25', '2023-12-14', '2024-01-29', '2023-08-16',
  '2024-07-04', '2024-09-10', '2023-05-22', '2024-10-01', '2023-04-10',
  '2024-11-05', '2023-03-15', '2024-12-03', '2023-02-20', '2024-02-05',
  '2023-01-18', '2024-10-29', '2023-08-30', '2024-06-28', '2023-06-01',
];

const WEATHER_CODES = {
  0: 'მოწმენდილი',
  1: 'ძირითადად მოწმენდილი',
  2: 'ნაწილობრივ მოღრუბლული',
  3: 'მოღრუბლული',
  45: 'ნისლი',
  48: 'ყინვიანი ნისლი',
  51: 'მსუბუქი წვიმა',
  61: 'წვიმა',
  71: 'თოვლი',
  80: 'ნალექიანი წვიმა',
  95: 'ჭექა-ქუხილი',
};

const GEO_MONTHS = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'];
const GEO_DAYS = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'];

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', mobileLabel: 'Dashboard', icon: '◉', href: '#dashboard' },
  { id: 'conditions', label: 'Sky', mobileLabel: 'Sky', icon: '☁', href: '#conditions' },
  { id: 'observe', label: 'Observe', mobileLabel: 'Observe', icon: '⬆', href: '#observe' },
  { id: 'sky-map', label: 'Map', mobileLabel: 'Map', icon: '⌖', href: '#sky-map' },
  { id: 'resources', label: 'Tools', mobileLabel: 'Tools', icon: '⋯', href: '#resources' },
];

const COMMUNITY_FEED = [
  { title: 'ლისის ტბაზე იუპიტერის ფოტო', author: 'Nini Chikovani', time: '22 წუთის წინ', note: '72mm refractor · 18 frames stacked' },
  { title: 'მარსის დაბალი ჰორიზონტი საბადურზე', author: 'Dato Beridze', time: '1 საათის წინ', note: 'South-east horizon report · light haze' },
  { title: 'ვენერას გადაღება მზის ჩასვლის შემდეგ', author: 'Mariam K.', time: 'დღეს', note: 'Handheld phone + finder scope alignment' },
];

const UPCOMING_EVENTS = [
  { title: 'Lyrids Meteor Shower', window: 'Tonight · 23:30–04:30', tone: 'badge--comet' },
  { title: 'Moon and Saturn pairing', window: 'Tomorrow · 05:10', tone: 'badge--solar' },
  { title: 'Club session at Tbilisi Observatory', window: 'Friday · 20:00', tone: 'badge--aurora' },
];

const RESOURCE_CARDS = [
  { title: 'Observation Playbook', description: 'Upload flow, field notes, and telescope checklist for first-night observing sessions.', icon: '⬆', href: '#observe' },
  { title: 'Sky Conditions Brief', description: 'Live cloud, humidity, wind, and moonlight score condensed into one operator-friendly panel.', icon: '☁', href: '#conditions' },
  { title: 'Astroman Store', description: 'Match tonight’s visibility to refractors, eyepieces, and filters in the main Astroman catalog.', icon: '✦', href: 'https://astroman.ge' },
];

const ToastContext = createContext(() => {});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatGeoDate(date) {
  return `${date.getDate()} ${GEO_MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
}

function formatGeoDay(date) {
  return GEO_DAYS[date.getDay()];
}

function formatTime(date) {
  return date.toLocaleTimeString('ka-GE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatShortTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString('ka-GE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function relativeTime(target, now) {
  if (!target) return '—';
  const diff = new Date(target) - now;
  const absolute = Math.abs(diff);
  const minutes = Math.floor(absolute / 60000);
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (hours > 0) {
    return diff < 0 ? `${hours}სთ ${remaining}წთ წინ` : `${hours}სთ ${remaining}წთ-ში`;
  }
  return diff < 0 ? `${minutes} წუთის წინ` : `${minutes} წუთში`;
}

function windDirectionLabel(deg) {
  if (deg == null) return '—';
  return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(deg / 45) % 8];
}

function getWeatherTone(cloudCover) {
  if (cloudCover <= 20) return 'var(--accent-aurora)';
  if (cloudCover <= 50) return 'var(--accent-solar)';
  return 'var(--accent-mars)';
}

function getTempTone(temperature) {
  if (temperature >= 24) return 'var(--accent-solar)';
  if (temperature >= 8) return 'var(--accent-comet)';
  return 'var(--sky-good)';
}

function getVisibilityKm(weather) {
  if (!weather) return null;
  const cloud = weather.cloud_cover ?? 50;
  const humidity = weather.relative_humidity_2m ?? 50;
  const wind = weather.wind_speed_10m ?? 0;
  return clamp(Math.round(14 - cloud * 0.06 - humidity * 0.03 - wind * 0.08), 2, 14);
}

function getObservationScore(weather, visibilityKm) {
  if (!weather) return null;
  let score = 100;
  score -= (weather.cloud_cover ?? 0) * 0.5;
  if ((weather.relative_humidity_2m ?? 0) > 60) {
    score -= ((weather.relative_humidity_2m ?? 60) - 60) * 0.3;
  }
  score -= Math.min(15, (weather.wind_speed_10m ?? 0) * 0.5);
  score += (visibilityKm ?? 6) * 2;
  return clamp(Math.round(score), 0, 100);
}

function getScoreTone(score) {
  if (score == null) return 'var(--text-secondary)';
  if (score <= 30) return 'var(--accent-mars)';
  if (score <= 50) return 'var(--accent-solar)';
  if (score <= 70) return 'var(--sky-watch)';
  if (score <= 85) return 'var(--sky-strong)';
  return 'var(--accent-aurora)';
}

function getScoreLabel(score) {
  if (score == null) return 'იტვირთება';
  if (score <= 30) return 'რთული ღამე';
  if (score <= 50) return 'საშუალო ხედვა';
  if (score <= 70) return 'კარგი პირობები';
  if (score <= 85) return 'ძალიან კარგი';
  return 'შესანიშნავი ღამე';
}

function getRating(score) {
  return clamp(Math.round((score ?? 0) / 20), 1, 5);
}

function getSkyStatus(sunrise, sunset, darkSky, now) {
  if (!sunrise || !sunset || !darkSky) return null;
  const start = new Date(sunrise);
  const end = new Date(sunset);
  const dark = new Date(darkSky);
  if (now >= start && now < end) {
    return { label: 'დღის ფაზა', detail: 'მზის შუქი დომინირებს', tone: 'var(--accent-solar)' };
  }
  if (now >= end && now < dark) {
    return { label: 'ოქროს საათი', detail: 'გადაამოწმე ვენერა და მთვარე', tone: 'var(--accent-solar)' };
  }
  return { label: 'ღრმა ღამე', detail: 'საუკეთესო დრო დაკვირვებისთვის', tone: 'var(--accent-comet)' };
}

function getHeroBackground(hour) {
  if (hour >= 6 && hour < 18) return 'var(--gradient-day)';
  if (hour >= 18 && hour < 20) return 'var(--gradient-golden)';
  return 'var(--gradient-night)';
}

function buildSeries(base, variance, count, min, max) {
  return Array.from({ length: count }, (_, index) => {
    const wave = Math.sin((index + 1) * 0.8) * variance;
    const curve = Math.cos((index + 1) * 0.55) * variance * 0.5;
    return clamp(Math.round(base + wave + curve), min, max);
  });
}

function buildDetailSeries(weather, visibilityKm) {
  if (!weather) return null;
  const cloud = buildSeries(weather.cloud_cover ?? 45, 14, 8, 0, 100);
  const humidity = buildSeries(weather.relative_humidity_2m ?? 55, 8, 8, 15, 100);
  const wind = buildSeries(weather.wind_speed_10m ?? 6, 4, 8, 0, 40);
  const temperature = buildSeries(weather.temperature_2m ?? 10, 3, 8, -10, 36);
  const dew = temperature.map((value, index) => Math.round(value - 2 - index * 0.2));
  const visibility = buildSeries(visibilityKm ?? 8, 1.8, 8, 1, 15);
  return { cloud, humidity, wind, temperature, dew, visibility };
}

function buildHourlyForecast(weather, now) {
  if (!weather) return [];
  const cloudSeries = buildSeries(weather.cloud_cover ?? 45, 18, 12, 0, 100);
  return cloudSeries.map((cloud, index) => {
    const hour = new Date(now);
    hour.setHours(hour.getHours() + index);
    return {
      label: hour.toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit', hour12: false }),
      cloud,
      current: index === 0,
    };
  });
}

function sparklinePath(points, width = 220, height = 42) {
  if (!points?.length) return '';
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = Math.max(max - min, 1);
  return points
    .map((point, index) => {
      const x = (index / (points.length - 1 || 1)) * width;
      const y = height - ((point - min) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

function useToast() {
  return useContext(ToastContext);
}

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { id, tone: 'info', ...toast }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={pushToast}>
      {children}
      <div className="toast-stack">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast" data-tone={toast.tone}>
            <strong>{toast.title}</strong>
            <div>{toast.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function SectionHeader({ title, description, badge }) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {badge ? badge : null}
    </div>
  );
}

function StarsRating({ rating }) {
  return (
    <div className="star-score" aria-label={`${rating} stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < rating ? 'is-lit' : ''}>★</span>
      ))}
    </div>
  );
}

function ScoreGauge({ score }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (score == null) return;
    let frame = 0;
    const timer = window.setInterval(() => {
      frame += Math.max(1, Math.ceil((score - frame) / 6));
      if (frame >= score) {
        frame = score;
        window.clearInterval(timer);
      }
      setAnimatedScore(frame);
    }, 36);
    return () => window.clearInterval(timer);
  }, [score]);

  const tone = getScoreTone(animatedScore);
  const degrees = animatedScore * 3.6;

  return (
    <div className="gauge-shell" style={{
      background: `conic-gradient(${tone} ${degrees}deg, var(--border-default) ${degrees}deg 360deg)`,
      borderRadius: '50%',
      padding: '14%',
    }}>
      <div style={{
        position: 'absolute',
        inset: '14%',
        borderRadius: '50%',
        background: 'linear-gradient(180deg, var(--bg-deep), var(--bg-surface))',
      }} />
      <div className="gauge-value">
        <strong style={{ color: tone }}>{animatedScore}</strong>
        <span>{getScoreLabel(score)}</span>
      </div>
    </div>
  );
}

function Sparkline({ points, tone }) {
  if (!points?.length) return null;
  return (
    <svg className="sparkline" viewBox="0 0 220 42" preserveAspectRatio="none" aria-hidden="true">
      <path d={sparklinePath(points)} fill="none" stroke={tone} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function LoadingCard({ title }) {
  return (
    <div className="sky-card loading-card">
      <strong>{title}</strong>
      <div className="skeleton" style={{ width: '100%', height: 14, borderRadius: 999 }} />
      <div className="skeleton" style={{ width: '72%', height: 14, borderRadius: 999 }} />
      <div className="skeleton" style={{ width: '88%', height: 84, borderRadius: 16 }} />
    </div>
  );
}

function AltGauge({ altitude, tone }) {
  const pct = clamp((altitude ?? 0) / 90, 0, 1);
  const cx = 40;
  const cy = 38;
  const radius = 28;
  const endAngle = Math.PI - pct * Math.PI;
  const dot = {
    x: cx + radius * Math.cos(endAngle),
    y: cy - radius * Math.sin(endAngle),
  };

  return (
    <svg width="84" height="54" aria-hidden="true">
      <path d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 0 ${cx + radius} ${cy}`} fill="none" stroke="var(--border-default)" strokeWidth="3" />
      <path d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 ${pct > 0.5 ? 1 : 0} 0 ${dot.x} ${dot.y}`} fill="none" stroke={tone} strokeWidth="3" strokeLinecap="round" />
      <circle cx={dot.x} cy={dot.y} r="4" fill={tone} />
      <text x={cx} y={cy - 2} textAnchor="middle" fill="var(--text-primary)" fontFamily="var(--font-mono)" fontSize="11">{Math.round(altitude ?? 0)}°</text>
    </svg>
  );
}

function Navbar({ activeSection, onNavigate, menuOpen, setMenuOpen, skyStatus, visibleCount }) {
  return (
    <>
      <nav className="site-nav">
        <div className="nav-inner">
          <a className="brand" href="#dashboard" onClick={() => onNavigate('dashboard')}>
            <span className="brand-mark">🔭</span>
            <span className="brand-copy">
              <strong>ASTROMAN</strong>
              <span>Skywatcher Live</span>
            </span>
          </a>

          <div className="nav-links">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`nav-link${activeSection === item.id ? ' is-active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="nav-actions">
            {skyStatus ? (
              <div className="status-pill" style={{ color: skyStatus.tone }}>
                <span className="status-pill__dot" />
                <span>{skyStatus.label}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{visibleCount} პლანეტა ჩანს</span>
              </div>
            ) : null}
            <button className="menu-button" onClick={() => setMenuOpen((current) => !current)} aria-label="მენიუ">
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {menuOpen ? <button className="mobile-backdrop" aria-label="მენიუს დახურვა" onClick={() => setMenuOpen(false)} /> : null}
      {menuOpen ? (
        <div className="mobile-drawer glass-card">
          {skyStatus ? (
            <div className="status-pill" style={{ display: 'inline-flex', color: skyStatus.tone }}>
              <span className="status-pill__dot" />
              <span>{skyStatus.detail}</span>
            </div>
          ) : null}
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`nav-link${activeSection === item.id ? ' is-active' : ''}`}
              onClick={() => {
                onNavigate(item.id);
                setMenuOpen(false);
              }}
            >
              {item.mobileLabel}
            </a>
          ))}
          <a className="btn-secondary" href="https://astroman.ge" target="_blank" rel="noopener noreferrer">Astroman Store</a>
        </div>
      ) : null}
    </>
  );
}

function HeroBanner({ now, weather, sunTimes, moon, skyStatus, score, visibilityKm, visiblePlanets }) {
  const heroBackground = getHeroBackground(now.getHours());
  const countdown = sunTimes?.sunset ? relativeTime(sunTimes.sunset, now) : '—';
  const rating = getRating(score);

  return (
    <section id="dashboard" className="section-shell section-reveal" style={{ '--stagger': 0 }}>
      <div className="hero-banner sky-card sky-card--featured glow-border" style={{ background: heroBackground }}>
        <div className="hero-grid">
          <div>
            <p className="eyebrow">Tonight&apos;s Sky · {formatGeoDay(now)} · {formatGeoDate(now)}</p>
            <h1 className="hero-title">თბილისის ღამის ცა <span className="text-gradient">რეალურ დროში</span></h1>
            <p className="hero-copy">
              ოპერატორის პანელი აერთიანებს ცის ხარისხს, მზისა და მთვარის ფაზას, დაკვირვების შეფასებას და ღამის მთავარი ობიექტების სწრაფ მიმოხილვას ისე, რომ არსებულ ამინდსა და ასტრონომიულ მონაცემებს არ ეხება.
            </p>

            <div className="hero-stat-grid">
              <div className="metric-chip">
                <label>Live Clock</label>
                <strong>{formatTime(now)}</strong>
                <span style={{ color: 'var(--text-secondary)' }}>თბილისი · Georgia</span>
              </div>
              <div className="metric-chip">
                <label>Sunset to Dark Sky</label>
                <strong>{formatShortTime(sunTimes?.sunset)} → {formatShortTime(sunTimes?.astroTwilightEnd || sunTimes?.civil_twilight_end)}</strong>
                <span style={{ color: 'var(--text-secondary)' }}>მზის ჩასვლამდე {countdown}</span>
              </div>
              <div className="metric-chip">
                <label>Cloud & Humidity</label>
                <strong>{weather ? `${weather.cloud_cover}% · ${weather.relative_humidity_2m}%` : 'იტვირთება'}</strong>
                <span style={{ color: 'var(--text-secondary)' }}>{weather ? (WEATHER_CODES[weather.weather_code] || 'ამინდის კოდი უცნობია') : 'Open-Meteo current weather'}</span>
              </div>
              <div className="metric-chip">
                <label>Moon & Visibility</label>
                <strong>{moon.phaseEmoji} {moon.phaseName}</strong>
                <span style={{ color: 'var(--text-secondary)' }}>{moon.illumination}% illumination · visibility {visibilityKm ?? '—'} km</span>
              </div>
            </div>
          </div>

          <div className="hero-side">
            <div className="sky-card sky-card--compact">
              <p className="eyebrow">Sky Quality</p>
              <StarsRating rating={rating} />
              <div className="hero-side__summary">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <strong style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', color: getScoreTone(score) }}>{score ?? '—'}</strong>
                  {skyStatus ? <span className="badge badge--comet">{skyStatus.detail}</span> : null}
                </div>
                <span style={{ color: 'var(--text-secondary)' }}>{getScoreLabel(score)}</span>
              </div>
            </div>

            <div className="hero-highlights">
              <div className="info-tile" style={{ padding: 'var(--space-4)' }}>
                <label>Seeing</label>
                <strong style={{ color: getWeatherTone(weather?.cloud_cover ?? 60) }}>{weather ? `${clamp(10 - Math.floor((weather.cloud_cover ?? 0) / 12), 1, 5)}/5` : '—'}</strong>
                <span style={{ color: 'var(--text-secondary)' }}>wind {weather ? `${Math.round(weather.wind_speed_10m)} km/h` : '—'}</span>
              </div>
              <div className="info-tile" style={{ padding: 'var(--space-4)' }}>
                <label>Visible Now</label>
                <strong>{visiblePlanets.length}</strong>
                <span style={{ color: 'var(--text-secondary)' }}>სატურნი, იუპიტერი, ვენერა და მეტი</span>
              </div>
              <div className="info-tile" style={{ padding: 'var(--space-4)' }}>
                <label>Moonrise / Moonset</label>
                <strong>{formatShortTime(moon.rise)} → {formatShortTime(moon.set)}</strong>
                <span style={{ color: 'var(--text-secondary)' }}>{moon.age} lunar days</span>
              </div>
              <div className="info-tile" style={{ padding: 'var(--space-4)' }}>
                <label>Thermal Comfort</label>
                <strong style={{ color: getTempTone(weather?.temperature_2m ?? 0) }}>{weather ? `${Math.round(weather.temperature_2m)}°C` : '—'}</strong>
                <span style={{ color: 'var(--text-secondary)' }}>feels like {weather ? `${Math.round(weather.apparent_temperature)}°C` : '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlanetVisibilitySection({ planets, onPlanetClick }) {
  const visibleNow = planets.filter((planet) => planet.visible);
  const sorted = [...visibleNow, ...planets.filter((planet) => !planet.visible)];

  return (
    <section className="sky-card forecast-panel section-reveal" style={{ '--stagger': 1 }}>
      <SectionHeader
        title="Planet Visibility Row"
        description="ჰორიზონტის ზემოთ არსებული ობიექტები პირველ რიგშია, ხოლო თითო ბარათი აჩვენებს rise/set დროს, სიმაღლეს და დაკვირვების რეჟიმს."
        badge={<span className="badge badge--aurora">{visibleNow.length} visible now</span>}
      />

      <div className="planet-row">
        {sorted.map((planet) => {
          const tone = planet.visible ? planet.tone : 'var(--text-tertiary)';
          const badgeClass = planet.visible ? 'badge--aurora' : 'badge--mars';
          return (
            <button
              key={planet.id}
              className="sky-card planet-card"
              onClick={() => onPlanetClick(planet)}
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                background: planet.visible ? 'var(--bg-elevated)' : 'var(--glass-bg)',
                borderColor: planet.visible ? tone : 'var(--border-subtle)',
              }}
            >
              <div className="planet-card__header">
                <div>
                  <div className="planet-card__symbol" style={{ color: tone }}>{planet.emoji}</div>
                </div>
                <span className={`badge ${badgeClass}`}>{planet.visible ? 'Visible now' : 'Below horizon'}</span>
              </div>

              <div>
                <strong>{planet.ka}</strong>
                <div style={{ color: 'var(--text-secondary)', marginTop: 6 }}>{planet.constellation}</div>
              </div>

              <AltGauge altitude={planet.altitude} tone={tone} />

              <div className="planet-card__times">
                <div className="planet-card__meta" style={{ padding: 'var(--space-3)' }}>
                  <label style={{ display: 'block', color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', marginBottom: 4 }}>Rise</label>
                  <strong style={{ fontSize: 'var(--text-base)' }}>{formatShortTime(planet.rise)}</strong>
                </div>
                <div className="planet-card__meta" style={{ padding: 'var(--space-3)' }}>
                  <label style={{ display: 'block', color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)', marginBottom: 4 }}>Set</label>
                  <strong style={{ fontSize: 'var(--text-base)' }}>{formatShortTime(planet.set)}</strong>
                </div>
              </div>

              <div className="meta-row">
                <span>mag {planet.mag}</span>
                <span>{planet.eye ? 'ნაკლები gear' : 'ტელესკოპი რეკომენდებულია'}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ConditionsPanel({ weather, now, visibilityKm, score }) {
  const series = useMemo(() => buildDetailSeries(weather, visibilityKm), [weather, visibilityKm]);
  const hourly = useMemo(() => buildHourlyForecast(weather, now), [weather, now]);

  if (!weather || !series) {
    return <LoadingCard title="Sky Conditions Loading" />;
  }

  const tiles = [
    { label: 'Cloud Cover', value: `${weather.cloud_cover}%`, tone: getWeatherTone(weather.cloud_cover), series: series.cloud },
    { label: 'Humidity', value: `${weather.relative_humidity_2m}%`, tone: weather.relative_humidity_2m <= 60 ? 'var(--accent-aurora)' : 'var(--accent-solar)', series: series.humidity },
    { label: 'Wind Speed', value: `${Math.round(weather.wind_speed_10m)} km/h`, tone: weather.wind_speed_10m <= 12 ? 'var(--accent-aurora)' : 'var(--accent-mars)', series: series.wind },
    { label: 'Temperature', value: `${Math.round(weather.temperature_2m)}°C`, tone: getTempTone(weather.temperature_2m), series: series.temperature },
    { label: 'Dew Point', value: `${series.dew[0]}°C`, tone: 'var(--accent-comet)', series: series.dew },
    { label: 'Visibility', value: `${visibilityKm} km`, tone: visibilityKm >= 10 ? 'var(--accent-aurora)' : 'var(--accent-solar)', series: series.visibility },
  ];

  return (
    <section id="conditions" className="section-stack section-reveal" style={{ '--stagger': 2 }}>
      <div className="sky-card">
        <div className="conditions-grid">
          <div className="score-panel">
            <p className="eyebrow">Observing Score Gauge</p>
            <ScoreGauge score={score} />
            <div className="stats-strip" style={{ width: '100%', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              <div className="info-tile" style={{ padding: 'var(--space-4)' }}>
                <label>Wind</label>
                <strong>{Math.round(weather.wind_speed_10m)} km/h</strong>
                <span style={{ color: 'var(--text-secondary)' }}>{windDirectionLabel(weather.wind_direction_10m)}</span>
              </div>
              <div className="info-tile" style={{ padding: 'var(--space-4)' }}>
                <label>Weather Code</label>
                <strong>{WEATHER_CODES[weather.weather_code] || 'Unknown'}</strong>
                <span style={{ color: 'var(--text-secondary)' }}>Open-Meteo current snapshot</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div className="forecast-panel">
              <SectionHeader
                title="12-Hour Sky Timeline"
                description="Legacy Vite frontend currently exposes live current weather only, so this strip projects the next 12 hours from the active conditions profile."
              />
              <div className="forecast-strip">
                {hourly.map((item) => {
                  const tone = getWeatherTone(item.cloud);
                  return (
                    <div key={item.label} className={`forecast-hour${item.current ? ' is-current' : ''}`}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{item.label}</div>
                      <div className="forecast-dot" style={{ color: tone, background: tone }} />
                      <strong style={{ fontSize: 'var(--text-base)' }}>{item.cloud}%</strong>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>cloud cover</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="detail-panel">
              <SectionHeader
                title="Conditions Detail Grid"
                description="ქვედა ბარათები ხაზს უსვამს იმ მეტრიკებს, რომლებიც ღამის დაკვირვებაზე ყველაზე დიდ გავლენას ახდენს."
              />
              <div className="detail-grid">
                {tiles.map((tile) => (
                  <div key={tile.label} className="detail-tile">
                    <label>{tile.label}</label>
                    <strong style={{ color: tile.tone }}>{tile.value}</strong>
                    <Sparkline points={tile.series} tone={tile.tone} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickActionsSidebar({
  weather,
  uploadState,
  onFileChange,
  onRemoveFile,
  onUploadSubmit,
  onCopyMapLink,
}) {
  return (
    <aside id="observe" className="sidebar section-reveal" style={{ '--stagger': 3 }}>
      <div className="sky-card sidebar-card">
        <h3>Quick Actions</h3>
        <p>Primary actions are placed beside the live score so the dashboard becomes directly actionable on desktop and still stacks cleanly on mobile.</p>
        <div className="action-stack">
          <button className="btn-primary" onClick={onUploadSubmit}>Upload Observation</button>
          <a className="btn-secondary" href="#sky-map">View Sky Map</a>
          <button className="btn-secondary" onClick={onCopyMapLink}>My Observations</button>
        </div>
      </div>

      <div className="sky-card sidebar-card">
        <h3>Observation Upload UI</h3>
        <p>UI refresh only. The legacy frontend now shows a polished drag-and-drop shell, local preview, and progress feedback without changing backend logic.</p>
        <div className="dropzone">
          <div style={{ fontSize: '2rem' }}>☁</div>
          <strong>Drop an observing shot here</strong>
          <p>JPEG, PNG or HEIC · up to 20MB · preview stays local until the upload pipeline is wired.</p>
          <label className="btn-secondary" style={{ cursor: 'pointer', width: '100%' }}>
            Choose file
            <input type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
          </label>
        </div>

        {uploadState.previewUrl ? (
          <div className="uploader-actions">
            <div className="thumbnail-preview">
              <img src={uploadState.previewUrl} alt={uploadState.fileName} loading="lazy" />
              <div className="thumbnail-actions">
                <button className="btn-danger" onClick={onRemoveFile}>Remove</button>
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="observation-note">Observation Note</label>
              <input id="observation-note" className="field-input" placeholder="ეგ. Jupiter banding over Tbilisi" />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="field-label">Upload Progress</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{uploadState.progress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${uploadState.progress}%` }} />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="sky-card sidebar-card">
        <h3>Community Activity Feed</h3>
        <div className="feed-list">
          {COMMUNITY_FEED.map((item) => (
            <article key={item.title} className="feed-item">
              <strong>{item.title}</strong>
              <div className="meta-row">
                <span>{item.author}</span>
                <span>{item.time}</span>
              </div>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="sky-card sidebar-card">
        <h3>Upcoming Events</h3>
        <div className="event-list">
          {UPCOMING_EVENTS.map((item) => (
            <article key={item.title} className="event-item">
              <div className="card-header-inline">
                <strong>{item.title}</strong>
                <span className={`badge ${item.tone}`}>{item.window}</span>
              </div>
              <p>TODO: replace these placeholders with the live astronomy events feed when the legacy frontend inherits the newer data model.</p>
            </article>
          ))}
        </div>
      </div>

      <div className="sky-card sidebar-card">
        <h3>Live Snapshot</h3>
        {weather ? (
          <div className="detail-grid">
            <div className="detail-tile">
              <label>Weather</label>
              <strong>{WEATHER_CODES[weather.weather_code] || 'Unknown'}</strong>
            </div>
            <div className="detail-tile">
              <label>Humidity</label>
              <strong>{weather.relative_humidity_2m}%</strong>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <strong>ამინდის ცოცხალი snapshot იტვირთება</strong>
            <p>Open-Meteo current payload arrives here before the richer cards hydrate.</p>
          </div>
        )}
      </div>
    </aside>
  );
}

function ISSTracker({ iss }) {
  if (!iss) {
    return (
      <section className="section-shell section-reveal" style={{ '--stagger': 4 }}>
        <LoadingCard title="ISS Telemetry Loading" />
      </section>
    );
  }

  const distance = Math.round(distanceKm(LAT, LON, iss.latitude, iss.longitude));
  const alertTone = distance < 500 ? 'var(--accent-mars)' : distance < 1500 ? 'var(--accent-solar)' : 'var(--accent-aurora)';
  const cards = [
    { label: 'Coordinates', value: `${iss.latitude.toFixed(2)}°, ${iss.longitude.toFixed(2)}°`, tone: 'var(--accent-comet)' },
    { label: 'Altitude', value: `${Math.round(iss.altitude)} km`, tone: 'var(--accent-comet)' },
    { label: 'Velocity', value: `${Math.round(iss.velocity).toLocaleString()} km/h`, tone: 'var(--accent-aurora)' },
    { label: 'Distance From Tbilisi', value: `${distance.toLocaleString()} km`, tone: alertTone },
  ];

  return (
    <section className="section-shell section-reveal" style={{ '--stagger': 4 }}>
      <div className="sky-card media-card">
        <SectionHeader
          title="ISS Real-Time Pass Tracker"
          description="Live WheretheISS data remains untouched. The redesign tightens the telemetry into a compact operations board."
          badge={<span className="badge badge--comet">5s refresh</span>}
        />
        <div className="detail-grid">
          {cards.map((item) => (
            <div key={item.label} className="detail-tile">
              <label>{item.label}</label>
              <strong style={{ color: item.tone }}>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MediaSection({ id, title, description, data, fallbackTitle, accentClass }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [data]);

  if (!data) {
    return (
      <div className="sky-card media-card">
        <LoadingCard title={fallbackTitle} />
      </div>
    );
  }

  const isVideo = data.media_type === 'video';
  const mediaUrl = data.hdurl || data.url;

  return (
    <article id={id} className="sky-card media-card">
      <SectionHeader title={title} description={description} badge={<span className={`badge ${accentClass}`}>{data.date || 'Live'}</span>} />
      <div className="thumbnail-preview" style={{ marginBottom: 'var(--space-4)' }}>
        {isVideo ? (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="empty-state"
            style={{ height: '100%', textDecoration: 'none', color: 'var(--text-primary)' }}
          >
            <div style={{ fontSize: '3rem' }}>▶</div>
            <strong>Open NASA video</strong>
          </a>
        ) : imgError ? (
          <div className="empty-state" style={{ height: '100%' }}>
            <strong>სურათი ვერ ჩაიტვირთა</strong>
            <p>Fallback card preserved so the section does not collapse.</p>
          </div>
        ) : (
          <img src={mediaUrl} alt={data.title} loading="lazy" onError={() => setImgError(true)} />
        )}
      </div>
      <strong>{data.title}</strong>
      <p className="line-clamp-2">{data.explanation}</p>
      <a className="btn-secondary" href={data.url} target="_blank" rel="noopener noreferrer">Open on NASA</a>
    </article>
  );
}

function SkyMap({ onMapAction }) {
  const mapRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === mapRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement === mapRef.current) {
        await document.exitFullscreen();
        onMapAction('Exited fullscreen', 'Map overlay returned to dashboard mode.', 'info');
      } else {
        await mapRef.current?.requestFullscreen();
        onMapAction('Fullscreen enabled', 'Stellarium has been expanded into fullscreen mode.', 'success');
      }
    } catch {
      onMapAction('Fullscreen unavailable', 'The browser blocked the fullscreen request.', 'warning');
    }
  }, [onMapAction]);

  return (
    <section id="sky-map" className="section-shell section-reveal" style={{ '--stagger': 5 }}>
      <div className="sky-card media-card">
        <SectionHeader
          title="Live Sky Map Wrapper"
          description="Map internals remain untouched. The shell adds glass controls, coordinate overlays, a responsive aspect ratio, and a fullscreen toggle."
          badge={<span className="badge badge--comet">{fullscreen ? 'Fullscreen' : 'Windowed'}</span>}
        />

        <div ref={mapRef} className="map-shell">
          <div className="map-overlay-top">
            <div className="status-pill" style={{ color: 'var(--accent-comet)' }}>
              <span className="status-pill__dot" />
              <span>Stellarium · Tbilisi</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="icon-button" onClick={() => window.open('https://stellarium-web.org/', '_blank', 'noopener,noreferrer')} aria-label="Open new tab">↗</button>
              <button className="icon-button" onClick={toggleFullscreen} aria-label="Toggle fullscreen">{fullscreen ? '⤢' : '⛶'}</button>
            </div>
          </div>

          <div className="map-frame">
            <iframe src="https://stellarium-web.org/" title="Stellarium Sky Map" allow="fullscreen" loading="lazy" />
          </div>

          <div className="map-overlay-bottom">
            <div className="status-pill" style={{ color: 'var(--accent-aurora)' }}>
              <span>LAT 41.7151° N</span>
              <span>LON 44.8271° E</span>
              <span>ALT 491 m</span>
            </div>
            <span className="badge badge--aurora">drag · zoom · inspect</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResourceGrid() {
  return (
    <section id="resources" className="section-shell section-reveal" style={{ '--stagger': 6 }}>
      <div className="sky-card media-card">
        <SectionHeader
          title="Tools & Resource Cards"
          description="Shared `.sky-card` styling now standardizes utility cards, action cards, and resource links across the page."
        />
        <div className="resource-grid">
          {RESOURCE_CARDS.map((card) => (
            <a
              key={card.title}
              className="resource-card sky-card"
              href={card.href}
              target={card.href.startsWith('http') ? '_blank' : undefined}
              rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              style={{ textDecoration: 'none', color: 'var(--text-primary)' }}
            >
              <span className="resource-card__icon">{card.icon}</span>
              <strong>{card.title}</strong>
              <p className="line-clamp-2">{card.description}</p>
              <span style={{ color: 'var(--accent-nebula)', fontWeight: 600 }}>Open →</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function ObservingTips({ weather, score }) {
  if (!weather) {
    return (
      <section className="section-shell section-reveal" style={{ '--stagger': 7 }}>
        <LoadingCard title="Observing Tips Loading" />
      </section>
    );
  }

  const tone = score >= 80 ? 'var(--accent-aurora)' : score >= 55 ? 'var(--accent-solar)' : 'var(--accent-mars)';
  const tip = score >= 80
    ? 'ღამე გამჭვირვალეა. აიღე ფართოკუთხიანი ოკულარი და დაბალი magnification-ით დაიწყე.'
    : score >= 55
      ? 'ღრუბლის ფანჯრებს შორის იმუშავე. პლანეტები და მთვარე უფრო სტაბილური სამიზნეებია.'
      : 'ღამე სუსტი აღმოჩნდა. გამოიყენე დრო setup-ის მოსამზადებლად და maps-ის rehearsal-ისთვის.';

  return (
    <section className="section-shell section-reveal" style={{ '--stagger': 7 }}>
      <div className="sky-card media-card">
        <SectionHeader title="Observing Notes" description="Single-card guidance refreshed with stronger contrast, better hierarchy, and clear color meaning." />
        <div className="detail-tile">
          <label>Recommended Tonight</label>
          <strong style={{ color: tone }}>{tip}</strong>
          <p>{weather.cloud_cover}% clouds · {weather.relative_humidity_2m}% humidity · {Math.round(weather.wind_speed_10m)} km/h wind</p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="section-shell section-reveal" style={{ '--stagger': 8, marginBottom: 0 }}>
      <div className="sky-card footer-card">
        <div className="footer-grid">
          <div>
            <h3>ASTROMAN</h3>
            <p>Deep-space inspired redesign applied on top of the legacy Vite frontend that powers the current `sky-frontend-seven` deployment chain.</p>
          </div>
          <div>
            <h3>Navigate</h3>
            <div className="footer-links">
              {NAV_ITEMS.map((item) => (
                <a key={item.id} href={item.href} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{item.label}</a>
              ))}
            </div>
          </div>
          <div>
            <h3>Data Sources</h3>
            <div className="footer-links">
              <span style={{ color: 'var(--text-secondary)' }}>Open-Meteo</span>
              <span style={{ color: 'var(--text-secondary)' }}>Sunrise-Sunset API</span>
              <span style={{ color: 'var(--text-secondary)' }}>NASA APOD</span>
              <span style={{ color: 'var(--text-secondary)' }}>WheretheISS</span>
            </div>
          </div>
          <div>
            <h3>Astroman Links</h3>
            <div className="footer-links">
              <a href="https://astroman.ge" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Store</a>
              <a href="https://www.facebook.com/astroman.ge" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Facebook</a>
              <a href="https://www.instagram.com/astroman.ge" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Instagram</a>
              <a href="https://t.me/astroman_ge" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Telegram</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function PlanetModal({ planet, onClose }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!planet) return undefined;
    setImgError(false);
    document.body.style.overflow = 'hidden';
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [planet, onClose]);

  if (!planet) return null;

  const fact = PLANET_FACTS[planet.id];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 220,
        background: 'rgba(0,0,0,0.72)',
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--space-4)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="sky-card"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 'min(720px, 100%)',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 'var(--space-5)',
        }}
      >
        <div className="card-header-inline" style={{ marginBottom: 'var(--space-4)' }}>
          <div>
            <p className="eyebrow">Planet Detail</p>
            <h2 style={{ margin: 0 }}>{planet.emoji} {planet.ka}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="დახურვა">✕</button>
        </div>

        <div className="thumbnail-preview" style={{ marginBottom: 'var(--space-4)' }}>
          {imgError ? (
            <div className="empty-state" style={{ height: '100%' }}>
              <div style={{ fontSize: '4rem' }}>{planet.emoji}</div>
              <strong>{planet.ka}</strong>
            </div>
          ) : (
            <img src={PLANET_IMAGES[planet.id]} alt={planet.ka} loading="lazy" onError={() => setImgError(true)} />
          )}
        </div>

        <div className="detail-grid" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="detail-tile">
            <label>Constellation</label>
            <strong>{planet.constellation}</strong>
          </div>
          <div className="detail-tile">
            <label>Altitude</label>
            <strong>{Math.round(planet.altitude ?? planet.maxAlt)}°</strong>
          </div>
          <div className="detail-tile">
            <label>Brightness</label>
            <strong>mag {planet.mag}</strong>
          </div>
          <div className="detail-tile">
            <label>Visibility</label>
            <strong>{planet.visible ? 'Visible tonight' : 'Below horizon now'}</strong>
          </div>
        </div>

        <div className="detail-tile" style={{ marginBottom: 'var(--space-4)' }}>
          <label>Interesting Fact</label>
          <strong>{fact}</strong>
        </div>

        <a className="btn-primary" href="https://astroman.ge" target="_blank" rel="noopener noreferrer">Explore matching gear on Astroman</a>
      </div>
    </div>
  );
}

function BottomTabs({ activeSection, onNavigate }) {
  return (
    <div className="bottom-tabs">
      {NAV_ITEMS.map((item) => (
        <a
          key={item.id}
          href={item.href}
          className={`bottom-tab${activeSection === item.id ? ' is-active' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          <span>{item.icon}</span>
          <span>{item.mobileLabel}</span>
        </a>
      ))}
    </div>
  );
}

function AppContent() {
  const toast = useToast();
  const [now, setNow] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [sunData, setSunData] = useState(null);
  const [iss, setISS] = useState(null);
  const [apod, setApod] = useState(null);
  const [cosmos, setCosmos] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [uploadState, setUploadState] = useState({ fileName: '', previewUrl: '', progress: 0 });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 560);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!uploadState.previewUrl || uploadState.progress >= 100) return undefined;
    const timer = window.setInterval(() => {
      setUploadState((current) => {
        if (!current.previewUrl) return current;
        const next = Math.min(current.progress + Math.ceil(Math.random() * 18), 96);
        return { ...current, progress: next };
      });
    }, 160);
    return () => window.clearInterval(timer);
  }, [uploadState.previewUrl, uploadState.progress]);

  useEffect(() => () => {
    if (uploadState.previewUrl) URL.revokeObjectURL(uploadState.previewUrl);
  }, [uploadState.previewUrl]);

  const computedSun = useMemo(() => getSunTimes(now), [now]);
  const moon = useMemo(() => getMoonInfo(now), [now]);
  const planets = useMemo(() => {
    const live = getVisiblePlanets(now);
    return PLANETS.map((planet) => {
      const fromLive = live.find((item) => item.id === planet.id) || {};
      return {
        ...planet,
        emoji: fromLive.emoji,
        altitude: fromLive.altitude ?? planet.maxAlt,
        azimuth: fromLive.azimuth ?? 0,
        visible: fromLive.visible ?? false,
        rise: fromLive.rise ?? null,
        set: fromLive.set ?? null,
      };
    });
  }, [now]);

  const visibilityKm = useMemo(() => getVisibilityKm(weather), [weather]);
  const score = useMemo(() => getObservationScore(weather, visibilityKm), [weather, visibilityKm]);
  const mergedSun = useMemo(() => ({
    ...computedSun,
    ...sunData,
  }), [computedSun, sunData]);
  const skyStatus = useMemo(
    () => getSkyStatus(mergedSun.sunrise, mergedSun.sunset, mergedSun.astroTwilightEnd || mergedSun.civil_twilight_end, now),
    [mergedSun, now],
  );

  const visiblePlanets = planets.filter((planet) => planet.visible);

  const fetchAllData = useCallback(async () => {
    try {
      const [weatherResponse, sunResponse] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,apparent_temperature,cloud_cover,wind_speed_10m,wind_direction_10m,weather_code,precipitation,relative_humidity_2m&timezone=Asia/Tbilisi`),
        fetch(`https://api.sunrise-sunset.org/json?lat=${LAT}&lng=${LON}&formatted=0&tzid=Asia/Tbilisi`),
      ]);
      if (weatherResponse.ok) {
        const payload = await weatherResponse.json();
        setWeather(payload.current);
      }
      if (sunResponse.ok) {
        const payload = await sunResponse.json();
        if (payload.status === 'OK') setSunData(payload.results);
      }
    } catch {
      toast({
        title: 'Weather sync failed',
        message: 'The current Open-Meteo or sunrise service did not respond. Existing data is still preserved.',
        tone: 'warning',
      });
    }
  }, [toast]);

  const fetchISS = useCallback(async () => {
    try {
      const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
      if (response.ok) setISS(await response.json());
    } catch {
      toast({
        title: 'ISS sync failed',
        message: 'WhereTheISS is temporarily unavailable. The telemetry card will recover automatically.',
        tone: 'warning',
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchAllData();
    const timer = window.setInterval(fetchAllData, 10 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, [fetchAllData]);

  useEffect(() => {
    fetchISS();
    const timer = window.setInterval(fetchISS, 5000);
    return () => window.clearInterval(timer);
  }, [fetchISS]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${import.meta.env.VITE_NASA_KEY || 'DEMO_KEY'}`);
        if (response.ok) setApod(await response.json());
      } catch {
        toast({
          title: 'NASA APOD unavailable',
          message: 'The daily NASA image failed to load. A placeholder card will remain visible.',
          tone: 'warning',
        });
      }
    };
    load();
  }, [toast]);

  useEffect(() => {
    const load = async () => {
      const dayIndex = Math.floor(Date.now() / 86400000) % COSMOS_DATES.length;
      for (let index = 0; index < COSMOS_DATES.length; index += 1) {
        const date = COSMOS_DATES[(dayIndex + index) % COSMOS_DATES.length];
        try {
          const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${import.meta.env.VITE_NASA_KEY || 'DEMO_KEY'}&date=${date}`);
          if (response.ok) {
            const payload = await response.json();
            if (payload.media_type === 'image') {
              setCosmos(payload);
              break;
            }
          }
        } catch {
          break;
        }
      }
    };
    load();
  }, []);

  const onNavigate = useCallback((sectionId) => {
    setActiveSection(sectionId);
  }, []);

  const onFileChange = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Unsupported file type',
        message: 'Choose an image file for the observation preview.',
        tone: 'error',
      });
      return;
    }
    setUploadState((current) => {
      if (current.previewUrl) URL.revokeObjectURL(current.previewUrl);
      return {
        fileName: file.name,
        previewUrl: URL.createObjectURL(file),
        progress: 12,
      };
    });
    toast({
      title: 'Preview ready',
      message: `${file.name} was added to the local observation upload card.`,
      tone: 'success',
    });
  }, [toast]);

  const onRemoveFile = useCallback(() => {
    setUploadState((current) => {
      if (current.previewUrl) URL.revokeObjectURL(current.previewUrl);
      return { fileName: '', previewUrl: '', progress: 0 };
    });
    toast({
      title: 'Preview removed',
      message: 'The observation draft was cleared from the local upload UI.',
      tone: 'info',
    });
  }, [toast]);

  const onUploadSubmit = useCallback(() => {
    if (!uploadState.previewUrl) {
      toast({
        title: 'No file selected',
        message: 'Choose an image first so the refreshed upload interface has something to stage.',
        tone: 'warning',
      });
      return;
    }
    setUploadState((current) => ({ ...current, progress: 100 }));
    toast({
      title: 'Upload UI completed',
      message: 'The polished uploader reached 100%. Backend submission remains unchanged and is ready to be wired later.',
      tone: 'success',
    });
  }, [toast, uploadState.previewUrl]);

  const onCopyMapLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#sky-map`);
      toast({
        title: 'Map link copied',
        message: 'The Sky Map anchor was copied to the clipboard.',
        tone: 'success',
      });
    } catch {
      toast({
        title: 'Clipboard blocked',
        message: 'The browser refused clipboard access, but the map link remains available in the address bar.',
        tone: 'warning',
      });
    }
  }, [toast]);

  return (
    <div className="sky-app">
      <Navbar
        activeSection={activeSection}
        onNavigate={onNavigate}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        skyStatus={skyStatus}
        visibleCount={visiblePlanets.length}
      />

      <HeroBanner
        now={now}
        weather={weather}
        sunTimes={mergedSun}
        moon={moon}
        skyStatus={skyStatus}
        score={score}
        visibilityKm={visibilityKm}
        visiblePlanets={visiblePlanets}
      />

      <section className="section-shell dashboard-grid">
        <div className="section-stack">
          <PlanetVisibilitySection planets={planets} onPlanetClick={setSelectedPlanet} />
          <ConditionsPanel weather={weather} now={now} visibilityKm={visibilityKm} score={score} />
        </div>

        <QuickActionsSidebar
          weather={weather}
          uploadState={uploadState}
          onFileChange={onFileChange}
          onRemoveFile={onRemoveFile}
          onUploadSubmit={onUploadSubmit}
          onCopyMapLink={onCopyMapLink}
        />
      </section>

      <ISSTracker iss={iss} />

      <section className="section-shell media-grid section-reveal" style={{ '--stagger': 5 }}>
        <MediaSection
          id="apod"
          title="NASA Astronomy Picture of the Day"
          description="Daily media card now follows the shared glassmorphic card system, broken-image fallback, and lazy loading pattern."
          data={apod}
          fallbackTitle="NASA APOD Loading"
          accentClass="badge--solar"
        />
        <MediaSection
          id="cosmos"
          title="Cosmos Archive Spotlight"
          description="Rotating archive image stays in place, but the card is normalized with the new card sizing and typography."
          data={cosmos}
          fallbackTitle="Cosmos Archive Loading"
          accentClass="badge--comet"
        />
      </section>

      <SkyMap onMapAction={(title, message, tone) => toast({ title, message, tone })} />
      <ResourceGrid />
      <ObservingTips weather={weather} score={score ?? 0} />
      <Footer />

      {showBackToTop ? (
        <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
          ↑
        </button>
      ) : null}

      <BottomTabs activeSection={activeSection} onNavigate={onNavigate} />
      <PlanetModal planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
    </div>
  );
}

export default function SKY() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
