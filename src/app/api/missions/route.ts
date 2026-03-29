import { NextResponse } from "next/server";

import { missions } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(missions);
}
