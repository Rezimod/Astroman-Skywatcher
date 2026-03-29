import { NextResponse } from "next/server";

import { leaderboard } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(leaderboard);
}
