import { NextResponse } from "next/server";

import { observations } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(observations);
}

export async function POST() {
  return NextResponse.json({ ok: true, status: "pending", estimatedXp: 120 });
}
