export type TelescopeInterest = "moon-planets" | "deep-sky" | "astrophotography" | "all";
export type TelescopeBudget = "<200" | "200-500" | "500-1000" | ">1000";
export type TelescopeExperience = "beginner" | "intermediate" | "experienced";

export interface TelescopeFinderInput {
  interest: TelescopeInterest;
  budget: TelescopeBudget;
  experience: TelescopeExperience;
}

export interface TelescopeProduct {
  name: string;
  slug: string;
  priceLabel: string;
  description: string;
  whyItFits: string;
  imageLabel: string;
  category: string;
  url: string;
}

export interface TelescopeLegacyRecommendation {
  name: string;
  slug: string;
  category: string;
  reasonKa: string;
  productUrl: string;
}

const PRODUCT_BASE_URL = "https://astroman.ge/products";

const CATALOG: TelescopeProduct[] = [
  {
    name: "Foreseen 80mm",
    slug: "telescope-foreseen-80mm",
    priceLabel: "₾1,199",
    description: "უნივერსალური 80mm რეფრაქტორი დაკვირვებისა და სწავლისთვის.",
    whyItFits: "დამწყებებისთვის საუკეთესო ბალანსია სიმარტივესა და სურათის სისუფთავეს შორის.",
    imageLabel: "80mm",
    category: "beginner",
    url: `${PRODUCT_BASE_URL}/telescope-foreseen-80mm`,
  },
  {
    name: "Foreseen 102mm",
    slug: "telescope-foreseen-102mm",
    priceLabel: "₾1,699",
    description: "უფრო დიდი აპერტურა ღრმა ცისა და პლანეტებისთვის.",
    whyItFits: "იუპიტერისა და სატურნის დეტალებს უკეთ გამოყოფს მაშინ, როცა გამოცდილება უკვე გაქვს.",
    imageLabel: "102mm",
    category: "intermediate",
    url: `${PRODUCT_BASE_URL}/telescope-foreseen-102mm`,
  },
  {
    name: "Astro Mount EQ",
    slug: "astro-mount-eq",
    priceLabel: "₾799",
    description: "სტაბილური სამაგრი ასტროფოტოსა და ზუსტი კადრებისთვის.",
    whyItFits: "სასარგებლოა, თუ კამერით მუშაობ და ხანგრძლივ ექსპოზიციებს გეგმავ.",
    imageLabel: "EQ",
    category: "astrophotography",
    url: `${PRODUCT_BASE_URL}/astro-mount-eq`,
  },
  {
    name: "Wide Field Binoculars 10x50",
    slug: "wide-field-binoculars-10x50",
    priceLabel: "₾449",
    description: "სწრაფი, მსუბუქი და ფართო ხედის ბინოკლი.",
    whyItFits: "გალაქტიკებისა და ღია გროვების საწყისი კვლევისთვის ძალიან მოქნილი არჩევანია.",
    imageLabel: "10x50",
    category: "deep-sky",
    url: `${PRODUCT_BASE_URL}/wide-field-binoculars-10x50`,
  },
];

function scoreProduct(product: TelescopeProduct, input: TelescopeFinderInput): number {
  let score = 0;

  if (input.interest === "moon-planets" && product.slug.includes("80mm")) score += 20;
  if (input.interest === "deep-sky" && product.slug.includes("binoculars")) score += 20;
  if (input.interest === "astrophotography" && product.slug.includes("mount")) score += 25;
  if (input.interest === "all" && product.slug.includes("80mm")) score += 15;

  if (input.budget === "<200" && product.priceLabel.includes("₾4")) score += 20;
  if (input.budget === "200-500" && product.priceLabel.includes("₾4")) score += 18;
  if (input.budget === "500-1000" && product.priceLabel.includes("₾7")) score += 18;
  if (input.budget === ">1000" && product.priceLabel.includes("₾1")) score += 20;

  if (input.experience === "beginner" && product.category === "beginner") score += 20;
  if (input.experience === "intermediate" && product.category === "intermediate") score += 20;
  if (input.experience === "experienced" && product.category !== "beginner") score += 14;

  return score;
}

export function getTelescopeRecommendations(input: TelescopeFinderInput): TelescopeProduct[] {
  const ranked = [...CATALOG].sort((a, b) => scoreProduct(b, input) - scoreProduct(a, input));
  const filtered = ranked.filter((product) => scoreProduct(product, input) > 0);
  const source = filtered.length > 0 ? filtered : ranked;

  return source.slice(0, 3).map((product) => {
    const why =
      input.interest === "astrophotography"
        ? `${product.whyItFits} შენს პასუხებზე დაყრდნობით ეს უფრო ტექნიკური არჩევანია.`
        : input.interest === "deep-sky"
          ? `${product.whyItFits} ბნელი ცის ობიექტებისთვის კარგი ოპტიკური სიგანე აქვს.`
          : input.interest === "moon-planets"
            ? `${product.whyItFits} პლანეტებისა და მთვარის ზედაპირისთვის სტაბილური ხედვა გვაძლევს.`
            : product.whyItFits;

    return { ...product, whyItFits: why };
  });
}

export function recommendTelescopeForConditions(input: {
  bestPlanet?: string | null;
  cloudCover: number;
  moonIllumination: number;
}): TelescopeLegacyRecommendation {
  const url = `${PRODUCT_BASE_URL}/telescope-foreseen-80mm`;

  if (input.cloudCover > 75) {
    return {
      name: "Foreseen 80mm",
      slug: "telescope-foreseen-80mm",
      category: "beginner",
      reasonKa: "ღამე ღრუბლიანია, მაგრამ Foreseen 80mm შემდეგი სუფთა ღამისთვის საუკეთესო საწყისი არჩევანია.",
      productUrl: url,
    };
  }

  if (input.bestPlanet === "Saturn") {
    return {
      name: "Foreseen 80mm",
      slug: "telescope-foreseen-80mm",
      category: "beginner",
      reasonKa: "სატურნის რგოლები Foreseen 80mm-ით მკაფიოდ ჩანს და დამწყებთათვის იდეალურია.",
      productUrl: url,
    };
  }

  if (input.bestPlanet === "Jupiter") {
    return {
      name: "Foreseen 80mm",
      slug: "telescope-foreseen-80mm",
      category: "beginner",
      reasonKa: "იუპიტერის ზოლები და თანამგზავრები Foreseen 80mm-ით კარგად იკვეთება.",
      productUrl: url,
    };
  }

  if (input.moonIllumination > 20) {
    return {
      name: "Foreseen 80mm",
      slug: "telescope-foreseen-80mm",
      category: "beginner",
      reasonKa: "მთვარის კრატერები Foreseen 80mm-ით განსაკუთრებით შთამბეჭდავად ჩანს.",
      productUrl: url,
    };
  }

  return {
    name: "Foreseen 80mm",
    slug: "telescope-foreseen-80mm",
    category: "beginner",
    reasonKa: "Foreseen 80mm არის უნივერსალური არჩევანი ნებისმიერი ღამის დასაწყებად.",
    productUrl: url,
  };
}
