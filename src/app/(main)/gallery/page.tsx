"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, CheckCircle2, Clock, X, XCircle } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import type { Observation } from "@/lib/site";

type Filter = "all" | "approved" | "pending";

const STATUS_CONFIG = {
  approved: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/12", border: "border-emerald-500/25", label: "დამტკიცდა" },
  pending: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/12", border: "border-amber-500/25", label: "განხილვაში" },
  rejected: { icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/12", border: "border-rose-500/25", label: "უარყოფილია" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ka-GE", { day: "numeric", month: "short", year: "numeric" });
}

function ObsCard({ obs, onClick }: { obs: Observation; onClick: () => void }) {
  const cfg = STATUS_CONFIG[obs.status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  return (
    <article
      className="cursor-pointer overflow-hidden rounded-2xl border border-white/8 bg-[#0A0F1E] transition-all hover:border-white/15 hover:brightness-110"
      onClick={onClick}
    >
      <div className="relative h-44 w-full bg-[#111936]">
        <Image
          src={obs.imageUrl}
          alt={obs.objectName}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute right-2.5 top-2.5">
          <span
            className={cn(
              "flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold",
              cfg.bg,
              cfg.border,
              cfg.color,
            )}
          >
            <Icon size={10} />
            {cfg.label}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h2 className="font-semibold text-white">{obs.objectName}</h2>
        <p className="mt-1 text-xs text-slate-400">{obs.username} · {formatDate(obs.submittedAt)}</p>
        <p className="mt-2 text-sm font-bold text-amber-400">+{obs.pointsEarned} ✦</p>
      </div>
    </article>
  );
}

function DetailModal({ obs, onClose }: { obs: Observation; onClose: () => void }) {
  const cfg = STATUS_CONFIG[obs.status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0A0F1E]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64 w-full bg-[#111936]">
          <Image src={obs.imageUrl} alt={obs.objectName} fill className="object-cover" unoptimized />
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">{obs.objectName}</h2>
              <p className="mt-1 text-sm text-slate-400">{obs.username}</p>
            </div>
            <span className={cn("flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold", cfg.bg, cfg.border, cfg.color)}>
              <Icon size={11} /> {cfg.label}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/6 bg-white/3 p-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">ჯილდო</p>
              <p className="mt-1 text-lg font-bold text-amber-400">+{obs.pointsEarned} ✦</p>
            </div>
            <div className="rounded-xl border border-white/6 bg-white/3 p-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">თარიღი</p>
              <p className="mt-1 text-sm font-medium text-white">{formatDate(obs.submittedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Observation | null>(null);

  useEffect(() => {
    fetch(`/api/observations${filter !== "all" ? `?status=${filter}` : ""}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setObservations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  const FILTER_TABS: { key: Filter; label: string }[] = [
    { key: "all", label: "ყველა" },
    { key: "approved", label: "დამტკიცებული" },
    { key: "pending", label: "განხილვაში" },
  ];

  return (
    <>
      {selected && <DetailModal obs={selected} onClose={() => setSelected(null)} />}

      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">საზოგადოება</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">გალერეა</h1>
          </div>
          <ButtonLink href="/observations/new" size="sm">
            <Camera size={14} /> ატვირთე
          </ButtonLink>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-white/6 bg-white/3 p-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "flex-1 rounded-lg py-2 text-xs font-semibold transition-all",
                filter === tab.key ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-white",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl border border-white/6 bg-white/3" />
            ))}
          </div>
        ) : observations.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/8 bg-[#0A0F1E] py-16 text-center">
            <Camera size={40} className="text-slate-700" />
            <p className="font-bold text-slate-500">ჯერ არ არის დაკვირვება</p>
            <p className="text-sm text-slate-600">დაიწყე მისია და ატვირთე პირველი ფოტო!</p>
            <Link href="/missions" className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-bold text-white">
              მისიების ნახვა
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {observations.map((obs) => (
              <ObsCard key={obs.id} obs={obs} onClick={() => setSelected(obs)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
