export const LEVELS = [
  { level: 1, threshold: 0, title_ka: "დამწყები", title_en: "Beginner" },
  { level: 2, threshold: 200, title_ka: "დამკვირვებელი", title_en: "Observer" },
  { level: 3, threshold: 500, title_ka: "მოყვარული", title_en: "Amateur" },
  { level: 4, threshold: 1000, title_ka: "ასტროფოტოგრაფი", title_en: "Astrophotographer" },
  { level: 5, threshold: 2000, title_ka: "ექსპერტი", title_en: "Expert" },
  { level: 6, threshold: 4000, title_ka: "ვარსკვლავთმცოდნე", title_en: "Astronomer" },
  { level: 7, threshold: 7000, title_ka: "მასტერი", title_en: "Master" },
  { level: 8, threshold: 12000, title_ka: "ლეგენდა", title_en: "Legend" },
  { level: 9, threshold: 20000, title_ka: "კოსმოსის მკვლევარი", title_en: "Cosmos Explorer" },
  { level: 10, threshold: 35000, title_ka: "ვარსკვლავთმრიცხველი", title_en: "Star Counter" },
] as const;

export const badges = [
  "პირველი დაკვირვება",
  "ხუთი დაკვირვება",
  "ათეული",
  "25 დაკვირვება",
  "მთვარის მაყურებელი",
  "პლანეტების მონადირე",
  "ღრმა ცა",
  "3 დღიანი სერია",
  "7 დღიანი სერია",
  "30 დღიანი სერია",
  "მისიების შემსრულებელი",
  "გუნდის მოთამაშე",
  "სრული პროფილი",
  "მკვლევარი",
  "ოქროს მონადირე",
  "ასტრომენტორი",
];

export type LevelEntry = (typeof LEVELS)[number];

export interface LevelInfo {
  level: number;
  threshold: number;
  next_threshold: number | null;
  title_ka: string;
  title_en: string;
  titleKa: string;
  titleEn: string;
}

function toLevelInfo(entry: LevelEntry, next: LevelEntry | null): LevelInfo {
  return {
    level: entry.level,
    threshold: entry.threshold,
    next_threshold: next?.threshold ?? null,
    title_ka: entry.title_ka,
    title_en: entry.title_en,
    titleKa: entry.title_ka,
    titleEn: entry.title_en,
  };
}

export function getLevelForPoints(points: number): LevelInfo {
  let current: LevelEntry = LEVELS[0];

  for (const entry of LEVELS) {
    if (points >= entry.threshold) {
      current = entry;
    } else {
      break;
    }
  }

  const next = LEVELS.find((entry) => entry.threshold > current.threshold) ?? null;
  return toLevelInfo(current, next);
}

export function getProgressToNextLevel(points: number) {
  const info = getLevelForPoints(points);

  if (info.next_threshold === null) {
    return { current: points - info.threshold, needed: 1, percentage: 100 };
  }

  const current = Math.max(0, points - info.threshold);
  const needed = info.next_threshold - info.threshold;

  return {
    current,
    needed,
    percentage: Math.min(100, Math.round((current / needed) * 100)),
  };
}

export interface BadgeDefinition {
  id: string;
  title_ka: string;
  title_en: string;
  description_ka: string;
  description_en: string;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: "first_observation",
    title_ka: "პირველი დაკვირვება",
    title_en: "First Observation",
    description_ka: "პირველი დამტკიცებული დაკვირვება",
    description_en: "Your first approved observation",
  },
  {
    id: "five_observations",
    title_ka: "ხუთი დაკვირვება",
    title_en: "Five Observations",
    description_ka: "5 დამტკიცებული დაკვირვება",
    description_en: "Five approved observations",
  },
  {
    id: "ten_observations",
    title_ka: "ათეული",
    title_en: "Tenfold",
    description_ka: "10 დამტკიცებული დაკვირვება",
    description_en: "Ten approved observations",
  },
  {
    id: "twenty_five_observations",
    title_ka: "25 დაკვირვება",
    title_en: "Quarter Century",
    description_ka: "25 დამტკიცებული დაკვირვება",
    description_en: "Twenty-five approved observations",
  },
  {
    id: "moon_gazer",
    title_ka: "მთვარის მაყურებელი",
    title_en: "Moon Gazer",
    description_ka: "მთვარის დაკვირვების დამტკიცება",
    description_en: "Complete a moon observation",
  },
  {
    id: "planet_hunter",
    title_ka: "პლანეტების მონადირე",
    title_en: "Planet Hunter",
    description_ka: "3 განსხვავებული პლანეტის დაფიქსირება",
    description_en: "Observe 3 different planets",
  },
  {
    id: "deep_sky",
    title_ka: "ღრმა ცა",
    title_en: "Deep Sky",
    description_ka: "ღრმა ცის ობიექტის დაფიქსირება",
    description_en: "Capture a deep-sky object",
  },
  {
    id: "streak_3",
    title_ka: "3 დღიანი სერია",
    title_en: "3-Day Streak",
    description_ka: "3 დღე ზედიზედ დაკვირვება",
    description_en: "Observe for 3 consecutive days",
  },
  {
    id: "streak_7",
    title_ka: "7 დღიანი სერია",
    title_en: "7-Day Streak",
    description_ka: "7 დღე ზედიზედ დაკვირვება",
    description_en: "Observe for 7 consecutive days",
  },
  {
    id: "streak_30",
    title_ka: "30 დღიანი სერია",
    title_en: "30-Day Streak",
    description_ka: "30 დღე ზედიზედ დაკვირვება",
    description_en: "Observe for 30 consecutive days",
  },
  {
    id: "mission_runner",
    title_ka: "მისიების შემსრულებელი",
    title_en: "Mission Runner",
    description_ka: "10 მისიის დასრულება",
    description_en: "Complete 10 missions",
  },
  {
    id: "team_player",
    title_ka: "გუნდის მოთამაშე",
    title_en: "Team Player",
    description_ka: "გუნდის შექმნა ან გაწევრება",
    description_en: "Create or join a team",
  },
  {
    id: "profile_complete",
    title_ka: "სრული პროფილი",
    title_en: "Complete Profile",
    description_ka: "პროფილის ყველა ველის შევსება",
    description_en: "Fill out your profile",
  },
  {
    id: "explorer",
    title_ka: "მკვლევარი",
    title_en: "Explorer",
    description_ka: "5 სხვადასხვა ობიექტის დაფიქსირება",
    description_en: "Observe 5 different objects",
  },
  {
    id: "gold_hunter",
    title_ka: "ოქროს მონადირე",
    title_en: "Gold Hunter",
    description_ka: "1000 ქულის დაგროვება",
    description_en: "Reach 1000 points",
  },
  {
    id: "astro_mentor",
    title_ka: "ასტრომენტორი",
    title_en: "Astro Mentor",
    description_ka: "ახალბედების დახმარება",
    description_en: "Help new observers",
  },
];

export interface BadgeProgressContext {
  observationsCount: number;
  missionsCompleted: number;
  streakCurrent: number;
  streakBest: number;
  points: number;
  distinctObjects?: number;
  hasTeam?: boolean;
  profileComplete?: boolean;
  isMentor?: boolean;
}

export interface BadgeUnlockResult {
  badgeId: string;
  title_ka: string;
  title_en: string;
}

function computeBadges(context: BadgeProgressContext, earnedBadgeIds: string[] = []): BadgeUnlockResult[] {
  const earned = new Set(earnedBadgeIds);
  const unlocked: BadgeUnlockResult[] = [];

  const checks: Array<{ id: string; condition: boolean }> = [
    { id: "first_observation", condition: context.observationsCount >= 1 },
    { id: "five_observations", condition: context.observationsCount >= 5 },
    { id: "ten_observations", condition: context.observationsCount >= 10 },
    { id: "twenty_five_observations", condition: context.observationsCount >= 25 },
    { id: "moon_gazer", condition: context.observationsCount >= 1 },
    { id: "planet_hunter", condition: (context.distinctObjects ?? 0) >= 3 },
    { id: "deep_sky", condition: (context.distinctObjects ?? 0) >= 5 },
    { id: "streak_3", condition: context.streakCurrent >= 3 || context.streakBest >= 3 },
    { id: "streak_7", condition: context.streakCurrent >= 7 || context.streakBest >= 7 },
    { id: "streak_30", condition: context.streakCurrent >= 30 || context.streakBest >= 30 },
    { id: "mission_runner", condition: context.missionsCompleted >= 10 },
    { id: "team_player", condition: Boolean(context.hasTeam) },
    { id: "profile_complete", condition: Boolean(context.profileComplete) },
    { id: "explorer", condition: (context.distinctObjects ?? 0) >= 5 },
    { id: "gold_hunter", condition: context.points >= 1000 },
    { id: "astro_mentor", condition: Boolean(context.isMentor) },
  ];

  for (const check of checks) {
    if (earned.has(check.id) || !check.condition) {
      continue;
    }

    const badge = BADGES.find((entry) => entry.id === check.id);
    if (badge) {
      unlocked.push({
        badgeId: badge.id,
        title_ka: badge.title_ka,
        title_en: badge.title_en,
      });
    }
  }

  return unlocked;
}

export function checkNewBadges(points: number, observationsCount: number, streak: number): string[];
export function checkNewBadges(context: BadgeProgressContext, earnedBadgeIds?: string[]): BadgeUnlockResult[];
export function checkNewBadges(
  arg1: number | BadgeProgressContext,
  arg2: number | string[] = 0,
  arg3?: number,
) {
  if (typeof arg1 === "number") {
    const points = arg1;
    const observationsCount = typeof arg2 === "number" ? arg2 : 0;
    const streak = typeof arg3 === "number" ? arg3 : 0;

    return badges.filter((badge) => {
      if (badge === "პირველი დაკვირვება") return observationsCount >= 1;
      if (badge === "7 დღიანი სერია") return streak >= 7;
      if (badge === "30 დღიანი სერია") return streak >= 30;
      if (badge === "ოქროს მონადირე") return points >= 1000;
      return observationsCount >= 5;
    });
  }

  return computeBadges(arg1, Array.isArray(arg2) ? arg2 : []);
}

export function computeStreakFromDates(dates: string[]): { current: number; max: number } {
  if (dates.length === 0) {
    return { current: 0, max: 0 };
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  const isPreviousDay = (currentDate: string, previousDate: string) =>
    new Date(currentDate).getTime() - new Date(previousDate).getTime() === 86_400_000;

  let current = 0;
  if (dates[0] === todayStr || dates[0] === yesterdayStr) {
    current = 1;
    for (let index = 1; index < dates.length; index += 1) {
      if (isPreviousDay(dates[index - 1], dates[index])) {
        current += 1;
      } else {
        break;
      }
    }
  }

  let max = 1;
  let run = 1;
  for (let index = 1; index < dates.length; index += 1) {
    if (isPreviousDay(dates[index - 1], dates[index])) {
      run += 1;
      if (run > max) {
        max = run;
      }
    } else {
      run = 1;
    }
  }

  return { current, max };
}

export function calculateObservationXP(args: {
  difficulty?: "easy" | "medium" | "hard";
  isFirstOfDay?: boolean;
  weatherBonus?: number;
}) {
  const base = args.difficulty === "hard" ? 180 : args.difficulty === "medium" ? 120 : 80;
  const firstOfDayBonus = args.isFirstOfDay ? 20 : 0;
  const weatherBonus = Math.max(0, args.weatherBonus ?? 0);

  return base + firstOfDayBonus + weatherBonus;
}

export function getBadgeById(badgeId: string) {
  return BADGES.find((badge) => badge.id === badgeId) ?? null;
}

export function getLevelLabel(points: number, lang: "ka" | "en" = "ka") {
  const info = getLevelForPoints(points);
  return lang === "ka" ? info.title_ka : info.title_en;
}
