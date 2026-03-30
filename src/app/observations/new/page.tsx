"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { UploadForm } from "@/components/observations/UploadForm";

function UploadPageContent() {
  const params = useSearchParams();
  const defaultObject = params.get("object") ?? "";
  const defaultPoints = Number(params.get("points") ?? 0);

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-8">
      <div className="flex items-center gap-3">
        <Link
          href="/missions"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/4 text-slate-400 transition-colors hover:bg-white/8 hover:text-white"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">მისიები</p>
          <h1 className="text-2xl font-semibold text-white">დაკვირვების ატვირთვა</h1>
        </div>
      </div>

      {defaultPoints > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.20)" }}
        >
          <p className="text-sm text-slate-300">
            ამ მისიის შესრულებისთვის მიიღებ{" "}
            <span className="font-bold text-amber-400">+{defaultPoints} ✦</span>
          </p>
        </div>
      )}

      <UploadForm defaultObject={defaultObject} />
    </div>
  );
}

export default function ObservationNewPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-lg space-y-5 px-4 py-8">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-white/6" />
        <div className="h-96 animate-pulse rounded-2xl bg-white/4" />
      </div>
    }>
      <UploadPageContent />
    </Suspense>
  );
}
