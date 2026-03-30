import { NextResponse } from "next/server";

import { getMoonInfo, getStargazingScore, getSunTimes, getVisiblePlanets } from "@/lib/astronomy";
import { DEFAULT_LOCATION, OPEN_METEO_URL } from "@/lib/site";

export const revalidate = 1800;

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
      next: { revalidate: 1800 },
    });

    const weather = response.ok ? await response.json() : null;
    const moon = getMoonInfo();
    const sun = getSunTimes();
    const nowHour = new Date().getHours();
    const cloudCover = weather?.hourly?.cloud_cover?.[nowHour] ?? 25;
    const score = getStargazingScore(cloudCover, moon.illumination / 100);

    return NextResponse.json({
      location: DEFAULT_LOCATION,
      stargazingScore: score,
      cloudCover,
      visibility: weather?.hourly?.visibility?.[nowHour] ?? 12000,
      temperature: weather?.hourly?.temperature_2m?.[nowHour] ?? 12,
      humidity: weather?.hourly?.relative_humidity_2m?.[nowHour] ?? 55,
      windSpeed: weather?.hourly?.wind_speed_10m?.[nowHour] ?? 3.5,
      hourlyCloudCover: weather?.hourly?.cloud_cover?.slice(nowHour, nowHour + 12) ?? [],
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
