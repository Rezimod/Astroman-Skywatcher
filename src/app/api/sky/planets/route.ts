import { NextResponse } from "next/server";

import { getVisiblePlanets } from "@/lib/astronomy";

export async function GET() {
  return NextResponse.json({
    location: "თბილისი",
    planets: getVisiblePlanets(),
  });
}
