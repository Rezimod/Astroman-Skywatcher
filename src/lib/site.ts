export const DEFAULT_LOCATION = {
  name: "თბილისი",
  latitude: 41.7151,
  longitude: 44.8271,
  timezone: "Asia/Tbilisi",
};

export const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

export type Difficulty = "easy" | "medium" | "hard";

export type Mission = {
  id: string;
  title: string;
  description: string;
  objectName: string;
  rewardXp: number;
  difficulty: Difficulty;
};

export type LeaderboardEntry = {
  id: string;
  username: string;
  level: number;
  points: number;
  observationsCount: number;
  rank?: number;
};

export type Observation = {
  id: string;
  objectName: string;
  username: string;
  status: "approved" | "pending" | "rejected";
  pointsEarned: number;
  submittedAt: string;
  imageUrl: string;
};
