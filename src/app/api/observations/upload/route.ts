import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase-server";

function placeholderUrl(filename: string) {
  const label = filename.replace(/\.[^.]+$/, "").slice(0, 18) || "Astroman";
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
      <rect width="1200" height="900" fill="#050810" />
      <circle cx="820" cy="220" r="130" fill="#6366F1" fill-opacity="0.22" />
      <circle cx="280" cy="620" r="220" fill="#F59E0B" fill-opacity="0.12" />
      <text x="72" y="120" fill="#F1F5F9" font-family="Arial" font-size="52" font-weight="700">${label}</text>
      <text x="72" y="188" fill="#CBD5E1" font-family="Arial" font-size="26">ატვირთვის დროებითი კადრი</text>
    </svg>
  `)}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "ფაილი არ მოიძებნა" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "მხოლოდ სურათებია დასაშვები" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "ფაილი არ უნდა აღემატებოდეს 10MB-ს" }, { status: 400 });
    }

    const supabase = await createClient();
    const extension = file.name.split(".").pop() ?? "jpg";
    const path = `observations/${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage.from("observations").upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      return NextResponse.json({
        url: placeholderUrl(file.name),
        path,
        fallback: true,
      });
    }

    const { data } = supabase.storage.from("observations").getPublicUrl(path);

    return NextResponse.json({
      url: data.publicUrl,
      path,
      fallback: false,
    });
  } catch {
    return NextResponse.json({
      url: placeholderUrl("Astroman"),
      path: "fallback",
      fallback: true,
    });
  }
}
