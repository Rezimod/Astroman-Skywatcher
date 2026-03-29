export const TBILISI = {
  lat: 41.7151,
  lng: 44.8271,
  timezone: "Asia/Tbilisi",
  label: "თბილისი, საქართველო",
};

export const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000, 4000, 7000, 12000, 20000, 35000];

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export interface DashboardProfile {
  username: string;
  displayName: string;
  level: number;
  points: number;
  observationsCount: number;
  missionsCompleted: number;
  rank?: number;
}

export interface DashboardPlanet {
  id: string;
  name: string;
  nameKa: string;
  altitude: number;
  azimuth: number;
  isVisible: boolean;
  rise?: string | null;
  set?: string | null;
  bestViewingTime?: string | null;
}

export interface DashboardConditions {
  cloudCover: number;
  visibility: number;
  temperature: number;
  moonPhase: number;
  moonPhaseName: string;
  moonIllumination: number;
  sunrise: string;
  sunset: string;
  bestViewingStart: string;
  bestViewingEnd: string;
  score: number;
  statusLabel: string;
  planets: DashboardPlanet[];
}

export interface DashboardMission {
  id: string;
  title: string;
  description: string | null;
  objectName: string | null;
  rewardPoints: number;
  difficulty: Difficulty;
  isDaily: boolean;
  active: boolean;
  progress?: number;
}

export interface LeaderboardRow {
  rank: number;
  username: string;
  displayName: string;
  level: number;
  points: number;
  observationsCount: number;
  isCurrentUser?: boolean;
}

export interface DashboardApod {
  title: string;
  explanation: string;
  imageUrl: string | null;
  date: string;
  copyright?: string | null;
}

export interface TelescopeRecommendation {
  name: string;
  slug: string;
  priceLabel: string;
  why: string;
  url: string;
  badge: string;
}

export interface DailyChallenge {
  title: string;
  description: string;
  objectName: string;
  rewardPoints: number;
  difficulty: Difficulty;
}

export interface DashboardSnapshot {
  profile: DashboardProfile;
  conditions: DashboardConditions;
  missions: DashboardMission[];
  leaderboard: LeaderboardRow[];
  apod: DashboardApod | null;
  telescopeRecommendation: TelescopeRecommendation;
  dailyChallenge: DailyChallenge;
}

const FALLBACK_PLANETS: DashboardPlanet[] = [
  { id: "moon", name: "Moon", nameKa: "მთვარე", altitude: 52, azimuth: 172, isVisible: true, rise: "20:13", set: "06:17", bestViewingTime: "22:30" },
  { id: "venus", name: "Venus", nameKa: "ვენერა", altitude: 18, azimuth: 256, isVisible: true, rise: "19:40", set: "22:05", bestViewingTime: "20:30" },
  { id: "jupiter", name: "Jupiter", nameKa: "იუპიტერი", altitude: 41, azimuth: 128, isVisible: true, rise: "21:20", set: "04:48", bestViewingTime: "23:10" },
  { id: "saturn", name: "Saturn", nameKa: "სატურნი", altitude: 33, azimuth: 149, isVisible: true, rise: "20:55", set: "03:40", bestViewingTime: "22:50" },
];

const FALLBACK_MISSIONS: DashboardMission[] = [
  {
    id: "moon-photo",
    title: "მთვარის დეტალური ფოტო",
    description: "გააგზავნე მთვარის მკაფიო ფოტო და მონიშნე კრატერების დეტალები.",
    objectName: "მთვარე",
    rewardPoints: 100,
    difficulty: "easy",
    isDaily: true,
    active: true,
    progress: 42,
  },
  {
    id: "jupiter-spot",
    title: "იუპიტერის ზოლები",
    description: "დაფიქსირე იუპიტერის დისკი და გალილეის თანამგზავრებიდან მინიმუმ ორი.",
    objectName: "იუპიტერი",
    rewardPoints: 200,
    difficulty: "medium",
    isDaily: false,
    active: true,
    progress: 15,
  },
  {
    id: "saturn-rings",
    title: "სატურნის რგოლები",
    description: "გააკეთე სატურნის რგოლების მკაფიო კადრი მაღალი გადიდებით.",
    objectName: "სატურნი",
    rewardPoints: 350,
    difficulty: "hard",
    isDaily: false,
    active: true,
    progress: 5,
  },
];

const FALLBACK_LEADERBOARD: LeaderboardRow[] = [
  { rank: 1, username: "g.m", displayName: "გიორგი მ.", level: 9, points: 8450, observationsCount: 128 },
  { rank: 2, username: "n.d", displayName: "ნინო დ.", level: 8, points: 7200, observationsCount: 104 },
  { rank: 3, username: "l.ch", displayName: "ლევანი ჭ.", level: 8, points: 6800, observationsCount: 98 },
  { rank: 4, username: "a.g", displayName: "ანა გ.", level: 7, points: 5100, observationsCount: 74 },
  { rank: 5, username: "s.k", displayName: "საბა კ.", level: 6, points: 4950, observationsCount: 63, isCurrentUser: true },
];

export const FALLBACK_SNAPSHOT: DashboardSnapshot = {
  profile: {
    username: "stargazer",
    displayName: "Stargazer",
    level: 4,
    points: 860,
    observationsCount: 12,
    missionsCompleted: 5,
    rank: 12,
  },
  conditions: {
    cloudCover: 28,
    visibility: 12,
    temperature: 14,
    moonPhase: 0.42,
    moonPhaseName: "მზარდი სავსე",
    moonIllumination: 56,
    sunrise: "06:48",
    sunset: "19:23",
    bestViewingStart: "21:00",
    bestViewingEnd: "02:00",
    score: 74,
    statusLabel: "კარგი დაკვირვების ღამე",
    planets: FALLBACK_PLANETS,
  },
  missions: FALLBACK_MISSIONS,
  leaderboard: FALLBACK_LEADERBOARD,
  apod: {
    title: "Cosmic Cliff in the Carina Nebula",
    explanation: "Fallback APOD content while the NASA route is warming up.",
    imageUrl: null,
    date: new Date().toISOString().slice(0, 10),
  },
  telescopeRecommendation: {
    name: "Foreseen 80mm",
    slug: "telescope-foreseen-80mm",
    priceLabel: "₾1,199",
    why: "დამწყებთათვის საუკეთესო უნივერსალური არჩევანი რეალურ ღამის ცაზე.",
    url: "https://astroman.ge/products/telescope-foreseen-80mm",
    badge: "დამწყები",
  },
  dailyChallenge: {
    title: "სატურნის რგოლების დევნა",
    description: "სცადე დღეს სატურნის დისკის დაფიქსირება და რგოლების გამოკვეთა.",
    objectName: "სატურნი",
    rewardPoints: 250,
    difficulty: "hard",
  },
};

export async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toTimeLabel(value: unknown, fallback = "—"): string {
  if (!value) return fallback;
  if (typeof value === "string") {
    if (value.includes("T")) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return new Intl.DateTimeFormat("ka-GE", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: TBILISI.timezone,
        }).format(date);
      }
    }
    return value.slice(0, 5);
  }
  return fallback;
}

export function calculateStargazingScore(cloudCover: number, moonIllumination: number, visibility = 10): number {
  const score = 100 - cloudCover * 0.65 - moonIllumination * 0.18 + visibility * 1.1;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getProgressToNextLevel(points: number): { current: number; needed: number; progress: number; nextLevel: number } {
  let level = 1;
  for (let index = LEVEL_THRESHOLDS.length - 1; index >= 0; index -= 1) {
    if (points >= LEVEL_THRESHOLDS[index]) {
      level = index + 1;
      break;
    }
  }
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const needed = Math.max(1, nextThreshold - currentThreshold);
  const current = points - currentThreshold;
  return {
    current,
    needed,
    progress: Math.max(0, Math.min(100, (current / needed) * 100)),
    nextLevel: Math.min(level + 1, 10),
  };
}

function moonPhaseName(phase: number): string {
  if (phase < 0.05 || phase > 0.95) return "ახალი მთვარე";
  if (phase < 0.22) return "მზარდი ნამგალი";
  if (phase < 0.30) return "პირველი მეოთხედი";
  if (phase < 0.45) return "მზარდი სავსე";
  if (phase < 0.55) return "სავსე მთვარე";
  if (phase < 0.70) return "კლებადი სავსე";
  if (phase < 0.78) return "ბოლო მეოთხედი";
  return "კლებადი ნამგალი";
}

function normalizePlanets(raw: unknown): DashboardPlanet[] {
  if (!Array.isArray(raw)) return FALLBACK_PLANETS;
  const planets = raw
    .map((item): DashboardPlanet | null => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const name = String(record.name ?? record.id ?? "უცნობი");
      const nameKa = String(record.nameKa ?? record.name_ka ?? record.name_ge ?? name);
      return {
        id: String(record.id ?? record.name ?? name.toLowerCase()),
        name,
        nameKa,
        altitude: toNumber(record.altitude ?? record.alt, -90),
        azimuth: toNumber(record.azimuth ?? record.az, 0),
        isVisible: Boolean(record.isVisible ?? record.visible ?? (toNumber(record.altitude ?? record.alt, -90) > 5)),
        rise: record.rise ? toTimeLabel(record.rise) : null,
        set: record.set ? toTimeLabel(record.set) : null,
        bestViewingTime: record.bestViewingTime ? toTimeLabel(record.bestViewingTime) : null,
      };
    })
    .filter(Boolean) as DashboardPlanet[];

  return planets.length > 0 ? planets.sort((a, b) => b.altitude - a.altitude) : FALLBACK_PLANETS;
}

function normalizeConditions(raw: unknown): DashboardConditions {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const cloudCover = toNumber(record.cloudCover ?? record.cloud_cover, FALLBACK_SNAPSHOT.conditions.cloudCover);
  const visibility = toNumber(record.visibility, FALLBACK_SNAPSHOT.conditions.visibility);
  const temperature = toNumber(record.temperature ?? record.temperature_2m, FALLBACK_SNAPSHOT.conditions.temperature);
  const moonPhase = toNumber(record.moonPhase ?? record.moon_phase, FALLBACK_SNAPSHOT.conditions.moonPhase);
  const moonIllumination = toNumber(
    record.moonIllumination ?? record.moon_illumination,
    FALLBACK_SNAPSHOT.conditions.moonIllumination,
  );
  const sunrise = toTimeLabel(record.sunrise, FALLBACK_SNAPSHOT.conditions.sunrise);
  const sunset = toTimeLabel(record.sunset, FALLBACK_SNAPSHOT.conditions.sunset);
  const bestViewingStart = toTimeLabel(
    record.bestViewingStart ?? record.best_viewing_start ?? record.bestViewingWindowStart,
    FALLBACK_SNAPSHOT.conditions.bestViewingStart,
  );
  const bestViewingEnd = toTimeLabel(
    record.bestViewingEnd ?? record.best_viewing_end ?? record.bestViewingWindowEnd,
    FALLBACK_SNAPSHOT.conditions.bestViewingEnd,
  );
  const planets = normalizePlanets(record.planets);
  const score = calculateStargazingScore(cloudCover, moonIllumination, visibility);

  return {
    cloudCover,
    visibility,
    temperature,
    moonPhase,
    moonPhaseName: String(record.moonPhaseName ?? record.moon_phase_name ?? moonPhaseName(moonPhase)),
    moonIllumination,
    sunrise,
    sunset,
    bestViewingStart,
    bestViewingEnd,
    score,
    statusLabel:
      score >= 80 ? "შესანიშნავი ცა" : score >= 60 ? "კარგი დაკვირვების ღამე" : score >= 35 ? "საშუალო პირობები" : "ღრუბლიანი ღამე",
    planets,
  };
}

function normalizeMissionList(raw: unknown): DashboardMission[] {
  if (!Array.isArray(raw)) return FALLBACK_MISSIONS;
  const missions = raw
    .map((item): DashboardMission | null => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      return {
        id: String(record.id ?? record.slug ?? crypto.randomUUID()),
        title: String(record.title ?? record.name ?? "მისია"),
        description: record.description ? String(record.description) : null,
        objectName: record.objectName ? String(record.objectName) : record.object_name ? String(record.object_name) : null,
        rewardPoints: toNumber(record.rewardPoints ?? record.reward_points ?? record.points, 100),
        difficulty: String(record.difficulty ?? "easy") as Difficulty,
        isDaily: Boolean(record.isDaily ?? record.is_daily),
        active: record.active !== false,
        progress: record.progress != null ? toNumber(record.progress, 0) : undefined,
      };
    })
    .filter(Boolean) as DashboardMission[];

  return missions.length > 0 ? missions : FALLBACK_MISSIONS;
}

function normalizeLeaderboard(raw: unknown): LeaderboardRow[] {
  if (!Array.isArray(raw)) return FALLBACK_LEADERBOARD;
  const rows = raw
    .map((item, index): LeaderboardRow | null => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      return {
        rank: toNumber(record.rank ?? index + 1, index + 1),
        username: String(record.username ?? record.handle ?? "user"),
        displayName: String(record.displayName ?? record.display_name ?? record.username ?? "მომხმარებელი"),
        level: toNumber(record.level, 1),
        points: toNumber(record.points, 0),
        observationsCount: toNumber(record.observationsCount ?? record.observations_count, 0),
        isCurrentUser: Boolean(record.isCurrentUser ?? record.is_me),
      };
    })
    .filter(Boolean) as LeaderboardRow[];

  return rows.length > 0 ? rows.slice(0, 5) : FALLBACK_LEADERBOARD;
}

function normalizeApod(raw: unknown): DashboardApod | null {
  if (!raw || typeof raw !== "object") return FALLBACK_SNAPSHOT.apod;
  const record = raw as Record<string, unknown>;
  if (record.error) return FALLBACK_SNAPSHOT.apod;
  return {
    title: String(record.title ?? "NASA APOD"),
    explanation: String(record.explanation ?? ""),
    imageUrl: record.url ? String(record.url) : record.imageUrl ? String(record.imageUrl) : null,
    date: String(record.date ?? new Date().toISOString().slice(0, 10)),
    copyright: record.copyright ? String(record.copyright) : null,
  };
}

export function chooseDailyChallenge(conditions: DashboardConditions, missions: DashboardMission[]): DailyChallenge {
  const visiblePlanet = conditions.planets.find((planet) => planet.isVisible) ?? conditions.planets[0];
  if (visiblePlanet) {
    return {
      title: `${visiblePlanet.nameKa} ღამით`,
      description: `იპოვე ${visiblePlanet.nameKa} და გადაიღე ის ჰორიზონტის ზემოთ მკაფიოდ.`,
      objectName: visiblePlanet.nameKa,
      rewardPoints: visiblePlanet.name === "Saturn" ? 350 : visiblePlanet.name === "Jupiter" ? 250 : 150,
      difficulty: visiblePlanet.name === "Saturn" || visiblePlanet.name === "Neptune" ? "hard" : "medium",
    };
  }

  const dailyMission = missions.find((mission) => mission.isDaily) ?? missions[0];
  if (dailyMission) {
    return {
      title: dailyMission.title,
      description: dailyMission.description ?? "შეასრულე დღევანდელი დაკვირვება და მიიღე ქულები.",
      objectName: dailyMission.objectName ?? dailyMission.title,
      rewardPoints: dailyMission.rewardPoints,
      difficulty: dailyMission.difficulty,
    };
  }

  return FALLBACK_SNAPSHOT.dailyChallenge;
}

export function buildTelescopeRecommendation(conditions: DashboardConditions): TelescopeRecommendation {
  const bestPlanet = conditions.planets.find((planet) => planet.isVisible) ?? conditions.planets[0];
  if (conditions.cloudCover > 75) {
    return {
      name: "Foreseen 80mm",
      slug: "telescope-foreseen-80mm",
      priceLabel: "₾1,199",
      why: "ღრუბლიანი ღამეა, მაგრამ უნივერსალური 80mm რეფრაქტორი მაინც მზადაა შემდეგი გასუფთავებისთვის.",
      url: "https://astroman.ge/products/telescope-foreseen-80mm",
      badge: "ყოველღამე",
    };
  }

  if (bestPlanet?.name === "Saturn") {
    return {
      name: "Foreseen 80mm",
      slug: "telescope-foreseen-80mm",
      priceLabel: "₾1,199",
      why: "სატურნის რგოლებისთვის ეს არის ყველაზე დაბალრისკიანი და ძლიერი დამწყები არჩევანი.",
      url: "https://astroman.ge/products/telescope-foreseen-80mm",
      badge: "რგოლები",
    };
  }

  if (bestPlanet?.name === "Jupiter") {
    return {
      name: "Foreseen 80mm",
      slug: "telescope-foreseen-80mm",
      priceLabel: "₾1,199",
      why: "იუპიტერის ზოლები და თანამგზავრები ამ ინსტრუმენტით ყველაზე სტაბილურად ჩანს.",
      url: "https://astroman.ge/products/telescope-foreseen-80mm",
      badge: "პლანეტები",
    };
  }

  if (conditions.moonIllumination > 20) {
    return {
      name: "Foreseen 80mm",
      slug: "telescope-foreseen-80mm",
      priceLabel: "₾1,199",
      why: "მთვარის ზედაპირისთვის 80mm ოპტიკა საკმარისია, რომ კრატერები მკაფიოდ ამოიკითხო.",
      url: "https://astroman.ge/products/telescope-foreseen-80mm",
      badge: "მთვარე",
    };
  }

  return FALLBACK_SNAPSHOT.telescopeRecommendation;
}

export async function buildDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [conditionsResponse, missionsResponse, leaderboardResponse, apodResponse] = await Promise.all([
    fetchJson<unknown>("/api/sky/conditions"),
    fetchJson<unknown>("/api/missions"),
    fetchJson<unknown>("/api/leaderboard"),
    fetchJson<unknown>("/api/nasa-apod"),
  ]);

  const conditions = normalizeConditions(conditionsResponse ?? FALLBACK_SNAPSHOT.conditions);
  const missions = normalizeMissionList(
    Array.isArray(missionsResponse)
      ? missionsResponse
      : (missionsResponse && typeof missionsResponse === "object" && Array.isArray((missionsResponse as Record<string, unknown>).missions))
        ? (missionsResponse as Record<string, unknown>).missions
        : FALLBACK_MISSIONS,
  );
  const leaderboard = normalizeLeaderboard(
    Array.isArray(leaderboardResponse)
      ? leaderboardResponse
      : (leaderboardResponse && typeof leaderboardResponse === "object" && Array.isArray((leaderboardResponse as Record<string, unknown>).leaderboard))
        ? (leaderboardResponse as Record<string, unknown>).leaderboard
        : FALLBACK_LEADERBOARD,
  );

  const apod = normalizeApod(apodResponse);
  const profile = {
    ...FALLBACK_SNAPSHOT.profile,
    rank: leaderboard.find((entry) => entry.isCurrentUser)?.rank ?? FALLBACK_SNAPSHOT.profile.rank,
  };

  return {
    profile,
    conditions,
    missions,
    leaderboard,
    apod,
    telescopeRecommendation: buildTelescopeRecommendation(conditions),
    dailyChallenge: chooseDailyChallenge(conditions, missions),
  };
}
