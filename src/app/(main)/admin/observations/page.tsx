"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { cn } from "@/components/ui/cn";
import type { Observation } from "@/lib/site";

type Action = "approve" | "reject";

export default function AdminObservationsPage() {
  const [items, setItems] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/observations?status=pending")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setItems(Array.isArray(data) ? data.filter((o: Observation) => o.status === "pending") : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleAction(id: string, action: Action) {
    setActing(id);
    try {
      await fetch(`/api/observations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action === "approve" ? "approved" : "rejected" }),
      });
      setItems((prev) => prev.filter((o) => o.id !== id));
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">ადმინ პანელი</p>
        <h1 className="mt-1 text-3xl font-semibold text-white">დაკვირვებების განხილვა</h1>
        {!loading && (
          <p className="mt-1 text-sm text-slate-400">
            {items.length === 0 ? "განხილვის მოლოდინში დაკვირვება არ არის" : `${items.length} მოლოდინში`}
          </p>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-white/6 bg-white/3" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/8 bg-[#0A0F1E] py-16 text-center">
          <CheckCircle2 size={40} className="text-emerald-700" />
          <p className="font-medium text-slate-500">ყველა დაკვირვება დამუშავებულია</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((obs) => (
            <article
              key={obs.id}
              className="flex items-center gap-4 rounded-2xl border border-white/8 bg-[#0A0F1E] p-4"
            >
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-[#111936]">
                <Image src={obs.imageUrl} alt={obs.objectName} fill className="object-cover" unoptimized />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{obs.objectName}</p>
                <p className="mt-0.5 text-sm text-slate-400">{obs.username} · {obs.submittedAt.slice(0, 10)}</p>
                <p className="mt-1 text-xs text-amber-400">+{obs.pointsEarned} ✦ სავარაუდო</p>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <button
                  onClick={() => handleAction(obs.id, "approve")}
                  disabled={acting === obs.id}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    "bg-emerald-500/12 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 disabled:opacity-50",
                  )}
                >
                  {acting === obs.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  დამტკიცება
                </button>
                <button
                  onClick={() => handleAction(obs.id, "reject")}
                  disabled={acting === obs.id}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    "bg-rose-500/10 text-rose-400 hover:bg-rose-500/18 border border-rose-500/20 disabled:opacity-50",
                  )}
                >
                  <XCircle size={13} />
                  უარყოფა
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
