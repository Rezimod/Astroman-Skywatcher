import * as Astronomy from "astronomy-engine";

export const TBILISI = {
  lat: 41.7151,
  lng: 44.8271,
  timezone: "Asia/Tbilisi",
};

const SYNODIC_MONTH = 29.53058867;
const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";
const NASA_APOD_URL = "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY";

export interface SkyPlanet {
  id: string;
  name: string;
  nameKa: string;
  emoji: string;
  altitude: number;
  azimuth: number;
  isVisible: boolean;
  magnitude: number;
  direction: string;
  rise: string | null;
  set: string | null;
  transit: string | null;
  bestViewingTime: string | null;
}

export interface MoonInfo {
  phase: number;
  phaseName: string;
  phaseNameKa: string;
  phaseEmoji: string;
  illumination: number;
  ageDays: number;
  rise: string | null;
  set: string | null;
  nextFullMoon: string | null;
  nextNewMoon: string | null;
}

export interface SunTimes {
  sunrise: string | null;
  sunset: string | null;
  astronomicalTwilightBegin: string | null;
  astronomicalTwilightEnd: string | null;
  astronomicalTwilight: string | null;
}

export interface HourlyForecastPoint {
  hour: number;
  label: string;
  cloudCover: number;
  visibility: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
}

export interface SkyConditions {
  location: {
    lat: number;
    lng: number;
    timezone: string;
    label: string;
  };
  generatedAt: string;
  cloudCover: number;
  visibility: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  sunrise: string | null;
  sunset: string | null;
  astronomicalTwilightBegin: string | null;
  astronomicalTwilightEnd: string | null;
  moon: MoonInfo;
  planets: SkyPlanet[];
  stargazingScore: number;
  bestViewingStart: string;
  bestViewingEnd: string;
  hourly: HourlyForecastPoint[];
  observationTips: string[];
}

export interface NasaApod {
  title: string;
  explanation: string;
  imageUrl: string;
  hdImageUrl: string | null;
  date: string;
  mediaType: string;
  copyright: string | null;
}

type OpenMeteoResponse = {
  current?: {
    cloud_cover?: number;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
  };
  hourly?: {
    time?: string[];
    cloud_cover?: number[];
    visibility?: number[];
    temperature_2m?: number[];
    relative_humidity_2m?: number[];
    wind_speed_10m?: number[];
  };
  daily?: {
    sunrise?: string[];
    sunset?: string[];
  };
};

const PLANETS = [
  { id: "mercury", name: "Mercury", nameKa: "მერკური", emoji: "☿", body: Astronomy.Body.Mercury },
  { id: "venus", name: "Venus", nameKa: "ვენერა", emoji: "♀", body: Astronomy.Body.Venus },
  { id: "mars", name: "Mars", nameKa: "მარსი", emoji: "♂", body: Astronomy.Body.Mars },
  { id: "jupiter", name: "Jupiter", nameKa: "იუპიტერი", emoji: "♃", body: Astronomy.Body.Jupiter },
  { id: "saturn", name: "Saturn", nameKa: "სატურნი", emoji: "♄", body: Astronomy.Body.Saturn },
  { id: "uranus", name: "Uranus", nameKa: "ურანი", emoji: "⛢", body: Astronomy.Body.Uranus },
  { id: "neptune", name: "Neptune", nameKa: "ნეპტუნი", emoji: "♆", body: Astronomy.Body.Neptune },
] as const;

function getObserver(lat = TBILISI.lat, lng = TBILISI.lng) {
  return new Astronomy.Observer(lat, lng, 0);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function formatTime(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("ka-GE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TBILISI.timezone,
  }).format(date);
}

function formatShortDateTime(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("ka-GE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TBILISI.timezone,
  }).format(date);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ka-GE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: TBILISI.timezone,
  }).format(date);
}

function directionFromAzimuth(azimuth: number) {
  if (azimuth < 22.5 || azimuth >= 337.5) return "ჩრდილოეთით";
  if (azimuth < 67.5) return "ჩრდილო-აღმოსავლეთით";
  if (azimuth < 112.5) return "აღმოსავლეთით";
  if (azimuth < 157.5) return "სამხრეთ-აღმოსავლეთით";
  if (azimuth < 202.5) return "სამხრეთით";
  if (azimuth < 247.5) return "სამხრეთ-დასავლეთით";
  if (azimuth < 292.5) return "დასავლეთით";
  return "ჩრდილო-დასავლეთით";
}

function moonPhaseName(phase: number) {
  if (phase < 0.03 || phase > 0.97) return { name: "New Moon", ka: "ახალი მთვარე", emoji: "🌑" };
  if (phase < 0.22) return { name: "Waxing Crescent", ka: "მზარდი ნამგალი", emoji: "🌒" };
  if (phase < 0.28) return { name: "First Quarter", ka: "პირველი მეოთხედი", emoji: "🌓" };
  if (phase < 0.47) return { name: "Waxing Gibbous", ka: "მზარდი ოვალური", emoji: "🌔" };
  if (phase < 0.53) return { name: "Full Moon", ka: "სავსე მთვარე", emoji: "🌕" };
  if (phase < 0.72) return { name: "Waning Gibbous", ka: "კლებადი ოვალური", emoji: "🌖" };
  if (phase < 0.78) return { name: "Last Quarter", ka: "ბოლო მეოთხედი", emoji: "🌗" };
  return { name: "Waning Crescent", ka: "კლებადი ნამგალი", emoji: "🌘" };
}

function toEventTime(event: Astronomy.AstroTime | null) {
  return event?.date ? formatTime(event.date) : null;
}

export function getVisiblePlanets(date = new Date(), lat = TBILISI.lat, lng = TBILISI.lng): SkyPlanet[] {
  const observer = getObserver(lat, lng);

  return PLANETS.map((planet) => {
    try {
      const equator = Astronomy.Equator(planet.body, date, observer, true, true);
      const horizon = Astronomy.Horizon(date, observer, equator.ra, equator.dec, "normal");
      const rise = Astronomy.SearchRiseSet(planet.body, observer, +1, date, 2);
      const set = Astronomy.SearchRiseSet(planet.body, observer, -1, date, 2);
      const transit = Astronomy.SearchHourAngle(planet.body, observer, 0, date, +1);
      const mag = Astronomy.Illumination(planet.body, date).mag;
      const altitude = round(horizon.altitude, 1);
      const azimuth = round(horizon.azimuth, 0);

      return {
        id: planet.id,
        name: planet.name,
        nameKa: planet.nameKa,
        emoji: planet.emoji,
        altitude,
        azimuth,
        isVisible: altitude > 5,
        magnitude: round(mag, 1),
        direction: directionFromAzimuth(azimuth),
        rise: toEventTime(rise),
        set: toEventTime(set),
        transit: transit?.time?.date ? formatTime(transit.time.date) : null,
        bestViewingTime: transit?.time?.date ? formatTime(transit.time.date) : null,
      };
    } catch {
      return {
        id: planet.id,
        name: planet.name,
        nameKa: planet.nameKa,
        emoji: planet.emoji,
        altitude: -90,
        azimuth: 0,
        isVisible: false,
        magnitude: 99,
        direction: "უცნობი",
        rise: null,
        set: null,
        transit: null,
        bestViewingTime: null,
      };
    }
  });
}

export function getMoonInfo(date = new Date(), lat = TBILISI.lat, lng = TBILISI.lng): MoonInfo {
  const observer = getObserver(lat, lng);
  const phaseAngle = Astronomy.MoonPhase(date);
  const phase = ((phaseAngle % 360) + 360) % 360 / 360;
  const illumination = round(Astronomy.Illumination(Astronomy.Body.Moon, date).phase_fraction * 100, 0);
  const moon = moonPhaseName(phase);
  const rise = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, +1, date, 2);
  const set = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, -1, date, 2);
  const nextNew = Astronomy.SearchMoonPhase(0, date, 40);
  const nextFull = Astronomy.SearchMoonPhase(180, date, 40);

  return {
    phase: round(phase, 3),
    phaseName: moon.name,
    phaseNameKa: moon.ka,
    phaseEmoji: moon.emoji,
    illumination,
    ageDays: round(phase * SYNODIC_MONTH, 1),
    rise: toEventTime(rise),
    set: toEventTime(set),
    nextFullMoon: formatShortDateTime(nextFull?.date ?? null),
    nextNewMoon: formatShortDateTime(nextNew?.date ?? null),
  };
}

export function getSunTimes(date = new Date(), lat = TBILISI.lat, lng = TBILISI.lng): SunTimes {
  const observer = getObserver(lat, lng);
  const sunrise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, date, 2);
  const sunset = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, date, 2);
  const astronomicalTwilightBegin = Astronomy.SearchAltitude(Astronomy.Body.Sun, observer, -1, date, 2, -18);
  const astronomicalTwilightEnd = Astronomy.SearchAltitude(Astronomy.Body.Sun, observer, +1, date, 2, -18);

  return {
    sunrise: toEventTime(sunrise),
    sunset: toEventTime(sunset),
    astronomicalTwilightBegin: toEventTime(astronomicalTwilightBegin),
    astronomicalTwilightEnd: toEventTime(astronomicalTwilightEnd),
    astronomicalTwilight: toEventTime(astronomicalTwilightEnd),
  };
}

export function getStargazingScore(cloudCover: number, moonIllumination: number) {
  return clamp(Math.round(100 - clamp(cloudCover, 0, 100) * 0.65 - clamp(moonIllumination, 0, 1) * 22), 0, 100);
}

export function getISSPasses() {
  return [];
}

async function fetchOpenMeteo(lat = TBILISI.lat, lng = TBILISI.lng): Promise<OpenMeteoResponse> {
  const url =
    `${OPEN_METEO_URL}?latitude=${lat}&longitude=${lng}` +
    "&hourly=cloud_cover,visibility,temperature_2m,relative_humidity_2m,wind_speed_10m" +
    "&daily=sunrise,sunset" +
    `&timezone=${encodeURIComponent(TBILISI.timezone)}&forecast_days=2`;

  const response = await fetch(url, { next: { revalidate: 600 } } as RequestInit);
  if (!response.ok) {
    throw new Error(`Open-Meteo fetch failed: ${response.status}`);
  }
  return response.json();
}

function buildHourlyForecast(data: OpenMeteoResponse): HourlyForecastPoint[] {
  const times = data.hourly?.time ?? [];
  const clouds = data.hourly?.cloud_cover ?? [];
  const visibility = data.hourly?.visibility ?? [];
  const temperatures = data.hourly?.temperature_2m ?? [];
  const humidity = data.hourly?.relative_humidity_2m ?? [];
  const wind = data.hourly?.wind_speed_10m ?? [];

  return times
    .map((time, index) => {
      const hour = Number(time.slice(11, 13));
      return {
        hour,
        label: `${String(hour).padStart(2, "0")}:00`,
        cloudCover: Math.round(clouds[index] ?? 50),
        visibility: Math.round((visibility[index] ?? 10000) / 1000),
        temperature: Math.round(temperatures[index] ?? 15),
        humidity: Math.round(humidity[index] ?? 60),
        windSpeed: Math.round(wind[index] ?? 0),
      };
    })
    .filter((point) => point.hour >= 18 || point.hour <= 5)
    .slice(0, 12);
}

function pickBestViewingWindow(hourly: HourlyForecastPoint[]) {
  if (hourly.length < 2) {
    return { start: "21:00", end: "23:00" };
  }

  let best = { start: hourly[0].label, end: hourly[1].label, score: Number.POSITIVE_INFINITY };
  for (let i = 0; i < hourly.length - 1; i += 1) {
    const avg = (hourly[i].cloudCover + hourly[i + 1].cloudCover) / 2;
    if (avg < best.score) {
      best = { start: hourly[i].label, end: hourly[i + 1].label, score: avg };
    }
  }

  return { start: best.start, end: best.end };
}

function buildTips(score: number, moonIllumination: number, cloudCover: number) {
  const tips: string[] = [];
  if (score >= 80) tips.push("შესანიშნავი ღამეა ფართო ხედვისთვის და ტელესკოპის სქემებისთვის.");
  else if (score >= 60) tips.push("კარგი ღამეა - აირჩიე მუქი ადგილი და თავიდან აიცილე ქუჩის განათება.");
  else tips.push("ვიზუალური დაკვირვება რთული იქნება, მაგრამ კაშკაშა ობიექტები მაინც სცადე.");

  if (cloudCover <= 20) tips.push("ღრუბლები თითქმის არ არის, შეგიძლია გრძელ ექსპოზიციაზე იფიქრო.");
  if (moonIllumination > 65) tips.push("მთვარე კაშკაშაა, ამიტომ ღრმა ცის ობიექტებისთვის ჩაბნელებული ლოკაცია სჯობს.");
  if (moonIllumination < 20) tips.push("ბნელი ცა ხელსაყრელია ნისლეულებისა და გალაქტიკებისთვის.");

  return tips.slice(0, 3);
}

export async function getSkyConditions(lat = TBILISI.lat, lng = TBILISI.lng): Promise<SkyConditions> {
  try {
    const weather = await fetchOpenMeteo(lat, lng);
    const now = new Date();
    const moon = getMoonInfo(now, lat, lng);
    const sun = getSunTimes(now, lat, lng);
    const planets = getVisiblePlanets(now, lat, lng);
    const hourly = buildHourlyForecast(weather);
    const window = pickBestViewingWindow(hourly);
    const cloudCover = Math.round(weather.current?.cloud_cover ?? hourly[0]?.cloudCover ?? 50);
    const visibility = Math.round(hourly[0]?.visibility ?? 10);
    const temperature = Math.round(weather.current?.temperature_2m ?? hourly[0]?.temperature ?? 15);
    const humidity = Math.round(weather.current?.relative_humidity_2m ?? hourly[0]?.humidity ?? 60);
    const windSpeed = Math.round(weather.current?.wind_speed_10m ?? hourly[0]?.windSpeed ?? 0);
    const stargazingScore = getStargazingScore(cloudCover, moon.illumination / 100);

    return {
      location: { lat, lng, timezone: TBILISI.timezone, label: "თბილისი" },
      generatedAt: now.toISOString(),
      cloudCover,
      visibility,
      temperature,
      humidity,
      windSpeed,
      sunrise: sun.sunrise ?? weather.daily?.sunrise?.[0]?.slice(11, 16) ?? null,
      sunset: sun.sunset ?? weather.daily?.sunset?.[0]?.slice(11, 16) ?? null,
      astronomicalTwilightBegin: sun.astronomicalTwilightBegin,
      astronomicalTwilightEnd: sun.astronomicalTwilightEnd,
      moon,
      planets,
      stargazingScore,
      bestViewingStart: window.start,
      bestViewingEnd: window.end,
      hourly,
      observationTips: buildTips(stargazingScore, moon.illumination, cloudCover),
    };
  } catch {
    const now = new Date();
    const moon = getMoonInfo(now, lat, lng);
    const planets = getVisiblePlanets(now, lat, lng);
    const stargazingScore = getStargazingScore(50, moon.illumination / 100);

    return {
      location: { lat, lng, timezone: TBILISI.timezone, label: "თბილისი" },
      generatedAt: now.toISOString(),
      cloudCover: 50,
      visibility: 10,
      temperature: 15,
      humidity: 60,
      windSpeed: 5,
      sunrise: null,
      sunset: null,
      astronomicalTwilightBegin: null,
      astronomicalTwilightEnd: null,
      moon,
      planets,
      stargazingScore,
      bestViewingStart: "21:00",
      bestViewingEnd: "23:00",
      hourly: [],
      observationTips: ["ცის მონაცემები დროებით მიუწვდომელია.", "სცადე მოგვიანებით ან სხვა დროით განაახლე."],
    };
  }
}

export async function getNasaApod(): Promise<NasaApod> {
  try {
    const response = await fetch(NASA_APOD_URL, { next: { revalidate: 86400 } } as RequestInit);
    if (!response.ok) {
      throw new Error(`NASA APOD fetch failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      title: data.title ?? "Astronomy Picture of the Day",
      explanation: data.explanation ?? "",
      imageUrl: data.media_type === "image" ? data.url : data.thumbnail_url ?? data.url,
      hdImageUrl: data.hdurl ?? null,
      date: data.date ?? formatDate(new Date()),
      mediaType: data.media_type ?? "image",
      copyright: data.copyright ?? null,
    };
  } catch {
    return {
      title: "NASA APOD დროებით მიუწვდომელია",
      explanation: "NASA-ს სერვისი ამ მომენტში არ პასუხობს, ამიტომ ნაჩვენებია დროებითი ჩანაცვლება.",
      imageUrl: "/logo.png",
      hdImageUrl: null,
      date: formatDate(new Date()),
      mediaType: "image",
      copyright: null,
    };
  }
}

export function formatSkyDate(date: Date) {
  return formatDate(date);
}

export function formatSkyTime(date: Date | null) {
  return formatTime(date);
}

export function formatSkyShortDateTime(date: Date | null) {
  return formatShortDateTime(date);
}
