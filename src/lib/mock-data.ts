import type { LeaderboardEntry, Mission, Observation } from "@/lib/site";

export const missions: Mission[] = [
  { id: "moon-photo", title: "მთვარის ფოტო", description: "დააფიქსირე მთვარე მკვეთრი დეტალებით.", objectName: "მთვარე", rewardXp: 100, difficulty: "easy" },
  { id: "venus", title: "ვენერას აღმოჩენა", description: "იპოვე ვენერა მზის ჩასვლის შემდეგ.", objectName: "ვენერა", rewardXp: 150, difficulty: "easy" },
  { id: "orion", title: "ორიონის კონტური", description: "გადაიღე ან მონიშნე ორიონის თანავარსკვლავედი.", objectName: "ორიონი", rewardXp: 100, difficulty: "easy" },
  { id: "sunset", title: "კოსმოსური მზის ჩასვლა", description: "ატვირთე მზის ჩასვლის საუკეთესო კადრი.", objectName: "მზის ჩასვლა", rewardXp: 75, difficulty: "easy" },
  { id: "jupiter", title: "იუპიტერის ღამე", description: "იპოვე იუპიტერი და მიუთითე მისი მდებარეობა.", objectName: "იუპიტერი", rewardXp: 200, difficulty: "medium" },
  { id: "mars", title: "წითელი პლანეტა", description: "დააკვირდი მარსს საუკეთესო ფანჯარაში.", objectName: "მარსი", rewardXp: 200, difficulty: "medium" },
  { id: "iss", title: "ISS გადაფრენა", description: "გადაამოწმე ISS-ის ხილული გადაფრენა და დააფიქსირე.", objectName: "ISS", rewardXp: 250, difficulty: "medium" },
  { id: "star-trails", title: "ვარსკვლავური ბილიკები", description: "გადაიღე ხანგრძლივი ექსპოზიციის კადრი.", objectName: "ვარსკვლავური ბილიკები", rewardXp: 200, difficulty: "medium" },
  { id: "saturn", title: "სატურნის რგოლები", description: "ტელესკოპით სცადე სატურნის რგოლების დაჭერა.", objectName: "სატურნი", rewardXp: 350, difficulty: "hard" },
  { id: "orion-nebula", title: "ორიონის ნისლეული", description: "იპოვე და დააფიქსირე M42.", objectName: "ორიონის ნისლეული", rewardXp: 300, difficulty: "hard" },
  { id: "milky-way", title: "ირმის ნახტომი", description: "ბნელ ცაზე გადაიღე ირმის ნახტომი.", objectName: "ირმის ნახტომი", rewardXp: 400, difficulty: "hard" },
  { id: "meteor", title: "მეტეორი", description: "დააფიქსირე მეტეორის კვალი ან სვეტა.", objectName: "მეტეორი", rewardXp: 500, difficulty: "hard" },
];

export const leaderboard: LeaderboardEntry[] = [
  { id: "1", username: "გიორგი", level: 10, points: 8450, observationsCount: 48, rank: 1 },
  { id: "2", username: "ნინო", level: 9, points: 7200, observationsCount: 39, rank: 2 },
  { id: "3", username: "ლევანი", level: 8, points: 6810, observationsCount: 34, rank: 3 },
  { id: "4", username: "ანა", level: 7, points: 5100, observationsCount: 26, rank: 4 },
  { id: "5", username: "მარიამი", level: 6, points: 4750, observationsCount: 23, rank: 5 },
];

export const observations: Observation[] = [
  {
    id: "obs-1",
    objectName: "მთვარე",
    username: "გიორგი",
    status: "approved",
    pointsEarned: 120,
    submittedAt: "2026-03-28T20:30:00+04:00",
    imageUrl: "/logo.png",
  },
  {
    id: "obs-2",
    objectName: "ვენერა",
    username: "ნინო",
    status: "pending",
    pointsEarned: 150,
    submittedAt: "2026-03-29T19:15:00+04:00",
    imageUrl: "/logo-icon.png",
  },
  {
    id: "obs-3",
    objectName: "ორიონი",
    username: "ანა",
    status: "approved",
    pointsEarned: 100,
    submittedAt: "2026-03-27T22:05:00+04:00",
    imageUrl: "/logo.png",
  },
];
