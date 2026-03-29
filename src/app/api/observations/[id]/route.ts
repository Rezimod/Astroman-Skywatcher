import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase-server";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const status = body.status as "approved" | "rejected" | undefined;
    const points_awarded = Number(body.points_awarded ?? 0);
    const rejection_reason = body.rejection_reason ?? null;

    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    const payload: Record<string, unknown> = {
      status: status ?? "pending",
      points_awarded,
      rejection_reason,
      reviewed_at: new Date().toISOString(),
      reviewed_by: userData.user?.id ?? null,
    };

    const { data, error } = await supabase
      .from("observations")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json({
        id,
        status: status ?? "pending",
        points_awarded,
        rejection_reason,
        reviewed_at: new Date().toISOString(),
        reviewed_by: userData.user?.id ?? null,
        fallback: true,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "რედაქტირება ვერ შესრულდა";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
