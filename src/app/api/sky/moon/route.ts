import { NextResponse } from "next/server";

import { getMoonInfo } from "@/lib/astronomy";

export const revalidate = 3600;

export async function GET() {
  return NextResponse.json(getMoonInfo());
}
