export type MissionDifficulty = "easy" | "medium" | "hard";

export interface SeedMission {
  id: string;
  title: string;
  description: string;
  objectName: string;
  rewardPoints: number;
  difficulty: MissionDifficulty;
  isDaily: boolean;
  active: boolean;
  emoji: string;
  bestTime: string;
  equipment: "შეუიარაღებელი თვალი" | "ბინოკლი" | "ტელესკოპი" | "კამერა";
  category: string;
  hint: string;
}

export const SEED_MISSIONS: SeedMission[] = [
  {
    id: "moon-photo",
    title: "მთვარის ფოტო",
    description: "გადაიღე მთვარე და მონიშნე მინიმუმ სამი ხილული კრატერი ან ზღვა.",
    objectName: "Moon",
    rewardPoints: 100,
    difficulty: "easy",
    isDaily: true,
    active: true,
    emoji: "🌕",
    bestTime: "20:30",
    equipment: "შეუიარაღებელი თვალი",
    category: "მთვარე",
    hint: "პირველი ან ბოლო მეოთხედი საუკეთესოა კრატერების ჩრდილებისთვის.",
  },
  {
    id: "venus-horizon",
    title: "ვენერა ჰორიზონტზე",
    description: "იპოვე ყველაზე კაშკაშა პლანეტა და გადაიღე მისი დაბალი პოზიცია ჩასვლის შემდეგ.",
    objectName: "Venus",
    rewardPoints: 150,
    difficulty: "easy",
    isDaily: false,
    active: true,
    emoji: "⭐",
    bestTime: "19:45",
    equipment: "შეუიარაღებელი თვალი",
    category: "პლანეტა",
    hint: "დაბლა ჩანს, მაგრამ უკიდურესად კაშკაშაა.",
  },
  {
    id: "orion-constellation",
    title: "ორიონის თანავარსკვლავედი",
    description: "ამოიცანი ორიონის სამი ქამარი და მარცხნივ-მარჯვნივ მდებარე მთავარი ვარსკვლავები.",
    objectName: "Orion",
    rewardPoints: 100,
    difficulty: "easy",
    isDaily: false,
    active: true,
    emoji: "✨",
    bestTime: "22:00",
    equipment: "შეუიარაღებელი თვალი",
    category: "თანავარსკვლავედი",
    hint: "სამი ერთ ხაზზე მდგომი ვარსკვლავი მთავარი ნიშანია.",
  },
  {
    id: "sunset",
    title: "მზის ჩასვლა",
    description: "დააფიქსირე მზის ჩასვლა და ცის ოქროსფერი გადასვლა ღამის ფონზე.",
    objectName: "Sunset",
    rewardPoints: 75,
    difficulty: "easy",
    isDaily: false,
    active: true,
    emoji: "🌅",
    bestTime: "18:40",
    equipment: "კამერა",
    category: "ცის მოვლენა",
    hint: "ჰორიზონტის სუფთა ხაზი საუკეთესო კომპოზიციას ქმნის.",
  },
  {
    id: "jupiter",
    title: "იუპიტერი",
    description: "იპოვე გაზის გიგანტი და, თუ შეძლებ, მისი თანამგზავრებიც მონიშნე.",
    objectName: "Jupiter",
    rewardPoints: 200,
    difficulty: "medium",
    isDaily: false,
    active: true,
    emoji: "🪐",
    bestTime: "21:10",
    equipment: "ბინოკლი",
    category: "პლანეტა",
    hint: "ვარსკვლავს ჰგავს, მაგრამ არ ციმციმებს.",
  },
  {
    id: "mars",
    title: "მარსი",
    description: "გადაამოწმე წითელი პლანეტის ხილვადობა და მისი ფერის სიმკვეთრე.",
    objectName: "Mars",
    rewardPoints: 200,
    difficulty: "medium",
    isDaily: false,
    active: true,
    emoji: "🔴",
    bestTime: "23:00",
    equipment: "შეუიარაღებელი თვალი",
    category: "პლანეტა",
    hint: "წითელი ელფერი ადვილად გამოირჩევა ცაზე.",
  },
  {
    id: "iss-pass",
    title: "ISS-ის გავლის დაჭერა",
    description: "დააფიქსირე საერთაშორისო კოსმოსური სადგურის სწრაფი, ნათელი გავლის კვალი.",
    objectName: "ISS",
    rewardPoints: 250,
    difficulty: "medium",
    isDaily: false,
    active: true,
    emoji: "🛸",
    bestTime: "21:30",
    equipment: "შეუიარაღებელი თვალი",
    category: "ორბიტული ობიექტი",
    hint: "ხშირად მოულოდნელად ჩნდება და ძალიან სწრაფად გადადის.",
  },
  {
    id: "star-trails",
    title: "ვარსკვლავთა კვალები",
    description: "გააკეთე გრძელი ექსპოზიციით ვარსკვლავთა კვალების ფოტო.",
    objectName: "Star trails",
    rewardPoints: 200,
    difficulty: "medium",
    isDaily: false,
    active: true,
    emoji: "✦",
    bestTime: "23:30",
    equipment: "კამერა",
    category: "ასტროფოტო",
    hint: "ჩრდილოეთისკენ მიმართული კადრი უკეთეს რკალებს აჩვენებს.",
  },
  {
    id: "saturn-rings",
    title: "სატურნის რგოლები",
    description: "დაგეგმე სატურნის დაკვირვება და დააფიქსირე მისი რგოლები ტელესკოპით.",
    objectName: "Saturn",
    rewardPoints: 350,
    difficulty: "hard",
    isDaily: false,
    active: true,
    emoji: "🪐",
    bestTime: "22:40",
    equipment: "ტელესკოპი",
    category: "პლანეტა",
    hint: "საკმარისია სტაბილური ატმოსფერო და ზომიერი გადიდება.",
  },
  {
    id: "orion-nebula",
    title: "ორიონის ნისლეული",
    description: "იპოვე M42 ორიონის ხმალში და დააფიქსირე მისი ნისლოვანი ბირთვი.",
    objectName: "Orion Nebula",
    rewardPoints: 300,
    difficulty: "hard",
    isDaily: false,
    active: true,
    emoji: "🌌",
    bestTime: "23:15",
    equipment: "ტელესკოპი",
    category: "ღრმა ცა",
    hint: "ქამრის ქვემოთ მდებარე ხმალი მთავარი საძიებო წერტილია.",
  },
  {
    id: "milky-way",
    title: "ირმის ნახტომი",
    description: "გადაიღე ირმის ნახტომის სტრუქტურა ბნელ ადგილას მინიმალური ცის ნათებით.",
    objectName: "Milky Way",
    rewardPoints: 400,
    difficulty: "hard",
    isDaily: false,
    active: true,
    emoji: "🌠",
    bestTime: "00:30",
    equipment: "კამერა",
    category: "გალაქტიკა",
    hint: "მოითხოვს ბნელ ცას და სწორ ექსპოზიციას.",
  },
  {
    id: "meteor",
    title: "მეტეორის კვალი",
    description: "დააფიქსირე მეტეორის სწრაფი წვერა და ჩაიწერე გადამღების დრო.",
    objectName: "Meteor",
    rewardPoints: 500,
    difficulty: "hard",
    isDaily: false,
    active: true,
    emoji: "☄️",
    bestTime: "01:00",
    equipment: "კამერა",
    category: "ცის მოვლენა",
    hint: "გრძელი დაკვირვება და ფართო ხედის კადრი საუკეთესოა.",
  },
  {
    id: "pleiades",
    title: "პლეიადები",
    description: "ამოიცანი M45 და გადაიღე ვარსკვლავთა სუსტი გროვა.",
    objectName: "Pleiades",
    rewardPoints: 180,
    difficulty: "easy",
    isDaily: false,
    active: true,
    emoji: "💫",
    bestTime: "21:20",
    equipment: "ბინოკლი",
    category: "ვარსკვლავთგროვა",
    hint: "შვიდი დების სახელითაც ცნობილია.",
  },
  {
    id: "andromeda",
    title: "ანდრომედას გალაქტიკა",
    description: "იპოვე M31 და დააფიქსირე მისი ალმუროვანი ბირთვი.",
    objectName: "Andromeda",
    rewardPoints: 420,
    difficulty: "hard",
    isDaily: false,
    active: true,
    emoji: "🌌",
    bestTime: "00:10",
    equipment: "ბინოკლი",
    category: "გალაქტიკა",
    hint: "პეგასის დიდი კვადრატიდან გადაინაცვლე ჩრდილო-აღმოსავლეთით.",
  },
];

export function getMissionByObjectName(objectName: string | null | undefined) {
  if (!objectName) return null;
  return SEED_MISSIONS.find((mission) => mission.objectName.toLowerCase() === objectName.toLowerCase()) ?? null;
}

export function getFeaturedMission(date = new Date()) {
  const active = SEED_MISSIONS.filter((mission) => mission.active);
  if (active.length === 0) {
    return null;
  }
  const index = Math.abs(Math.floor(date.getTime() / 86_400_000)) % active.length;
  return active[index];
}

export function getSeedMissionPayload(date = new Date()) {
  const featured = getFeaturedMission(date);
  return SEED_MISSIONS.map((mission) => ({
    ...mission,
    is_daily: featured ? mission.id === featured.id : mission.isDaily,
  }));
}
