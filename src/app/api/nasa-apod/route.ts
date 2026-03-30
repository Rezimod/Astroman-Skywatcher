import { NextResponse } from "next/server";

export const revalidate = 86400;

export async function GET() {
  try {
    const response = await fetch("https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY", {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      throw new Error("NASA APOD request failed");
    }

    const data = await response.json();
    return NextResponse.json({
      title: data.title,
      explanation: data.explanation,
      imageUrl: data.url,
      hdurl: data.hdurl ?? data.url,
      mediaType: data.media_type ?? "image",
      date: data.date,
    });
  } catch {
    return NextResponse.json({
      title: "NASA APOD დროებით მიუწვდომელია",
      explanation: "გარე API-ს მონაცემები მალე დაბრუნდება.",
      imageUrl: "/logo.png",
      date: new Date().toISOString().slice(0, 10),
    });
  }
}
