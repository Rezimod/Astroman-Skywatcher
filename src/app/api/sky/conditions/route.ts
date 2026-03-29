import { NextResponse } from "next/server";

import { getMoonInfo, getStargazingScore, getSunTimes, getVisiblePlanets } from "@/lib/astronomy";
import { DEFAULT_LOCATION, OPEN_METEO_URL } from "@/lib/site";

export const revalidate = 600;

export async function GET() {
  try {
    const params = new URLSearchParams({
      latitude: String(DEFAULT_LOCATION.latitude),
      longitude: String(DEFAULT_LOCATION.longitude),
      hourly: "cloud_cover,visibility,temperature_2m,relative_humidity_2m,wind_speed_10m",
      daily: "sunrise,sunset",
      timezone: DEFAULT_LOCATION.timezone,
      forecast_days: "2",
    });

    const response = await fetch(`${OPEN_METEO_URL}?${params.toString()}`, {
      next: { revalidate: 600 },
    });

    const weather = response.ok ? await response.json() : null;
    const moon = getMoonInfo();
    const sun = getSunTimes();
    const cloudCover = weather?.hourly?.cloud_cover?.[12] ?? 25;
    const score = getStargazingScore(cloudCover, moon.illumination);

    return NextResponse.json({
      location: DEFAULT_LOCATION,
      stargazingScore: score,
      cloudCover,
      visibility: weather?.hourly?.visibility?.[12] ?? 12000,
      temperature: weather?.hourly?.temperature_2m?.[12] ?? 12,
      humidity: weather?.hourly?.relative_humidity_2m?.[12] ?? 55,
      windSpeed: weather?.hourly?.wind_speed_10m?.[12] ?? 3.5,
      moon,
      sun,
      planets: getVisiblePlanets(),
      bestViewingWindow: "21:00 - 01:00",
      observationTips: [
        "აირჩიე ქალაქის განათებიდან მოშორებული ადგილი.",
        "მთვარის მაღალი განათებისას პლანეტებზე გაამახვილე ყურადღება.",
        "ტელესკოპის გაგრილებას 10-15 წუთი მიეცი.",
      ],
    });
  } catch {
    return NextResponse.json({ error: "ცის პირობების მიღება ვერ მოხერხდა." }, { status: 500 });
  }
}
