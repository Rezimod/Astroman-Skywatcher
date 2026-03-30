import { NextResponse } from "next/server";

import { getVisiblePlanets } from "@/lib/astronomy";

export const revalidate = 1800;

export async function GET() {
  const planets = getVisiblePlanets();
  return NextResponse.json({
    location: "თბილისი",
    planets,
    visibleCount: planets.filter((p) => p.isVisible).length,
  });
}
