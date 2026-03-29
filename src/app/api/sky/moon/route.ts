import { NextResponse } from "next/server";

import { getMoonInfo } from "@/lib/astronomy";

export async function GET() {
  return NextResponse.json(getMoonInfo());
}
