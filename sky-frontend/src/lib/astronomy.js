import {
  Body, Observer,
  Equator, Horizon,
  Illumination, MoonPhase,
  SearchRiseSet, SearchAltitude,
} from 'astronomy-engine';

export const TBILISI = { lat: 41.7151, lng: 44.8271 };

const PLANET_BODIES = {
  mercury: Body.Mercury,
  venus:   Body.Venus,
  mars:    Body.Mars,
  jupiter: Body.Jupiter,
  saturn:  Body.Saturn,
  uranus:  Body.Uranus,
  neptune: Body.Neptune,
};

const PLANET_META = {
  mercury: { ka: 'მერკური',   emoji: '⚫', needsTelescope: false },
  venus:   { ka: 'ვენერა',    emoji: '🟡', needsTelescope: false },
  mars:    { ka: 'მარსი',     emoji: '🔴', needsTelescope: false },
  jupiter: { ka: 'იუპიტერი',  emoji: '🟠', needsTelescope: false },
  saturn:  { ka: 'სატურნი',   emoji: '🪐', needsTelescope: false },
  uranus:  { ka: 'ურანი',     emoji: '🔵', needsTelescope: true  },
  neptune: { ka: 'ნეპტუნი',   emoji: '🌀', needsTelescope: true  },
};

function dayStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function riseSetDate(result) {
  return result ? result.date : null;
}

export function getSunTimes(date = new Date(), lat = TBILISI.lat, lng = TBILISI.lng) {
  const obs   = new Observer(lat, lng, 0);
  const start = dayStart(date);
  let sunrise = null, sunset = null, astroTwilightEnd = null, astroTwilightBegin = null;
  try { sunrise = riseSetDate(SearchRiseSet(Body.Sun, obs, +1, start, 1)); } catch (_) {}
  try { sunset  = riseSetDate(SearchRiseSet(Body.Sun, obs, -1, start, 1)); } catch (_) {}
  try {
    if (sunset) astroTwilightEnd = riseSetDate(SearchAltitude(Body.Sun, obs, -1, sunset, 0.5, -18));
  } catch (_) {}
  try {
    astroTwilightBegin = riseSetDate(SearchAltitude(Body.Sun, obs, +1, start, 1, -18));
  } catch (_) {}
  return { sunrise, sunset, astroTwilightEnd, astroTwilightBegin };
}

export function getMoonInfo(date = new Date(), lat = TBILISI.lat, lng = TBILISI.lng) {
  const obs   = new Observer(lat, lng, 0);
  const start = dayStart(date);
  try {
    const phase = MoonPhase(date);
    const illum = Illumination(Body.Moon, date);
    const age   = phase / (360 / 29.53058867);
    let rise = null, set = null;
    try { rise = riseSetDate(SearchRiseSet(Body.Moon, obs, +1, start, 1)); } catch (_) {}
    try { set  = riseSetDate(SearchRiseSet(Body.Moon, obs, -1, start, 1)); } catch (_) {}
    const PHASES = [
      { name: 'ახალი მთვარე',      emoji: '🌑', min: 0,     max: 22.5  },
      { name: 'სიახლოვის მთვარე',  emoji: '🌒', min: 22.5,  max: 67.5  },
      { name: 'პირველი მეოთხედი',  emoji: '🌓', min: 67.5,  max: 112.5 },
      { name: 'სავსის მეოთხედი',   emoji: '🌔', min: 112.5, max: 157.5 },
      { name: 'სავსე მთვარე',      emoji: '🌕', min: 157.5, max: 202.5 },
      { name: 'კლებადი სავსე',     emoji: '🌖', min: 202.5, max: 247.5 },
      { name: 'ბოლო მეოთხედი',     emoji: '🌗', min: 247.5, max: 292.5 },
      { name: 'კლებადი სიახლოვე',  emoji: '🌘', min: 292.5, max: 360   },
    ];
    const phaseInfo = PHASES.find(p => phase >= p.min && phase < p.max) || PHASES[0];
    return {
      illumination: Math.round(illum.phase_fraction * 100),
      phase, age: age.toFixed(1),
      phaseName: phaseInfo.name, phaseEmoji: phaseInfo.emoji,
      rise, set,
    };
  } catch {
    return { illumination: 0, phase: 0, age: '0', phaseName: 'უცნობი', phaseEmoji: '🌑', rise: null, set: null };
  }
}

export function getVisiblePlanets(date = new Date(), lat = TBILISI.lat, lng = TBILISI.lng) {
  const obs   = new Observer(lat, lng, 0);
  const start = dayStart(date);
  return Object.entries(PLANET_BODIES).map(([id, body]) => {
    try {
      const eq  = Equator(body, date, obs, true, true);
      const hor = Horizon(date, obs, eq.ra, eq.dec, 'normal');
      let rise = null, set = null;
      try { rise = riseSetDate(SearchRiseSet(body, obs, +1, start, 1)); } catch (_) {}
      try { set  = riseSetDate(SearchRiseSet(body, obs, -1, start, 1)); } catch (_) {}
      return {
        id, ...PLANET_META[id],
        altitude: Math.round(hor.altitude * 10) / 10,
        azimuth:  Math.round(hor.azimuth),
        visible:  hor.altitude > 5,
        rise, set,
      };
    } catch {
      return { id, ...PLANET_META[id], altitude: -90, azimuth: 0, visible: false, rise: null, set: null };
    }
  });
}

export function getStargazingScore(cloudCover, moonIllumination, hour) {
  let score = 100;
  score -= cloudCover * 0.8;
  if (moonIllumination > 30) score -= (moonIllumination - 30) * 0.25;
  const goodHours = [21, 22, 23, 0, 1, 2, 3];
  if (!goodHours.includes(hour)) score -= 15;
  return Math.max(0, Math.min(100, Math.round(score)));
}
