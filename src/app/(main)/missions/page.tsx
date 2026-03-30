"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Eye, Telescope } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import type { Mission } from "@/lib/site";

const DIFF_COLOR: Record<string, string> = {
  easy: "#14F195",
  medium: "#818CF8",
  hard: "#FBBF24",
};

const DIFF_LABEL: Record<string, string> = {
  easy: "მარტივი",
  medium: "საშუალო",
  hard: "რთული",
};


const OBJECT_EMOJI: Record<string, string> = {
  მთვარე: "🌕",
  ვენერა: "⭐",
  ორიონი: "✨",
  "მზის ჩასვლა": "🌅",
  იუპიტერი: "🪐",
  მარსი: "🔴",
  ISS: "🛸",
  "ვარსკვლავური ბილიკები": "💫",
  სატურნი: "🪐",
  "ორიონის ნისლეული": "🌌",
  "ირმის ნახტომი": "🌌",
  მეტეორი: "☄️",
};

const PLANET_SPHERES: Record<string, { bg: string; glow: string }> = {
  moon: { bg: "radial-gradient(circle at 38% 32%, #e2e8f0, #94a3b8 55%, #475569)", glow: "rgba(148,163,184,0.25)" },
  jupiter: { bg: "radial-gradient(circle at 38% 32%, #fed7aa, #f97316 55%, #92400e)", glow: "rgba(249,115,22,0.30)" },
  mars: { bg: "radial-gradient(circle at 38% 32%, #fca5a5, #ef4444 55%, #7f1d1d)", glow: "rgba(239,68,68,0.28)" },
  venus: { bg: "radial-gradient(circle at 38% 32%, #fef9c3, #fbbf24 55%, #d97706)", glow: "rgba(251,191,36,0.28)" },
  saturn: { bg: "radial-gradient(circle at 38% 32%, #e2e8f0, #b0bec5 55%, #607d8b)", glow: "rgba(176,190,197,0.20)" },
};

const OBJECT_TO_SPHERE: Record<string, string> = {
  მთვარე: "moon",
  იუპიტერი: "jupiter",
  მარსი: "mars",
  ვენერა: "venus",
  სატურნი: "saturn",
};

function PlanetVisual({ objectName }: { objectName: string }) {
  const sphereId = OBJECT_TO_SPHERE[objectName];
  const sphere = sphereId ? PLANET_SPHERES[sphereId] : null;
  const emoji = OBJECT_EMOJI[objectName] ?? "⭐";

  if (sphereId === "saturn") {
    return (
      <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
        <div
          className="absolute"
          style={{
            width: 88,
            height: 22,
            borderRadius: "50%",
            border: "2px solid rgba(176,190,197,0.35)",
            transform: "rotateX(72deg)",
            top: "50%",
            marginTop: -11,
          }}
        />
        <div
          className="relative z-10 rounded-full"
          style={{ width: 52, height: 52, background: PLANET_SPHERES.saturn.bg, boxShadow: `0 0 20px ${PLANET_SPHERES.saturn.glow}` }}
        />
      </div>
    );
  }

  if (sphere) {
    return (
      <div
        className="rounded-full"
        style={{ width: 64, height: 64, background: sphere.bg, boxShadow: `0 0 24px ${sphere.glow}, inset -6px -6px 16px rgba(0,0,0,0.4)` }}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full text-3xl"
      style={{ width: 64, height: 64, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 0 24px rgba(99,102,241,0.25)" }}
    >
      {emoji}
    </div>
  );
}

function DifficultyDots({ difficulty }: { difficulty: string }) {
  const dots = { easy: 2, medium: 3, hard: 5 }[difficulty] ?? 2;
  const color = DIFF_COLOR[difficulty] ?? "#14F195";
  return (
    <div className="my-1.5 flex items-center justify-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="rounded-full"
          style={{ width: 5, height: 5, background: i <= dots ? color : "rgba(255,255,255,0.12)" }}
        />
      ))}
    </div>
  );
}

type MissionCardProps = {
  mission: Mission;
  done?: boolean;
  pending?: boolean;
};

function MissionCard({ mission, done, pending }: MissionCardProps) {
  const diffColor = DIFF_COLOR[mission.difficulty] ?? "#14F195";

  return (
    <article
      className="relative flex flex-col items-center overflow-hidden rounded-2xl p-4 transition-all"
      style={{
        background: done ? "rgba(255,255,255,0.02)" : "rgba(10,14,26,0.95)",
        border: `1px solid ${pending ? "rgba(245,158,11,0.25)" : done ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.08)"}`,
        opacity: done ? 0.65 : 1,
      }}
    >
      <div className="absolute right-3 top-3">
        {done && <CheckCircle2 size={13} className="text-[#14F195]" />}
        {pending && <Clock size={13} className="text-[#F59E0B]" />}
      </div>

      <div className="mb-3 mt-2 flex h-[72px] items-center justify-center">
        <PlanetVisual objectName={mission.objectName} />
      </div>

      <h3 className="mb-1 line-clamp-2 text-center text-sm font-bold leading-snug text-white">
        {mission.title}
      </h3>

      <DifficultyDots difficulty={mission.difficulty} />

      <span className="mb-2 text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: diffColor }}>
        {DIFF_LABEL[mission.difficulty]}
      </span>

      {mission.description && (
        <p className="mb-3 line-clamp-2 px-1 text-center text-[10px] leading-relaxed text-slate-500">
          {mission.description}
        </p>
      )}

      <div className="mb-4 text-base font-bold text-amber-400">
        +{mission.rewardXp} <span className="text-sm">✦</span>
      </div>

      {done ? (
        <span className="pb-1 text-xs font-bold text-slate-500">შესრულდა</span>
      ) : pending ? (
        <span className="pb-1 text-xs font-bold text-amber-400">განხილვაში</span>
      ) : (
        <Link
          href={`/observations/new?object=${encodeURIComponent(mission.objectName)}&points=${mission.rewardXp}`}
          className="w-full rounded-xl py-2.5 text-center text-sm font-bold tracking-wide transition-all hover:brightness-110 active:scale-95"
          style={{ background: "linear-gradient(135deg, #F59E0B, #FFD166)", color: "#0A0A0A" }}
        >
          დაწყება →
        </Link>
      )}
    </article>
  );
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  const isNight = new Date().getHours() >= 20 || new Date().getHours() < 7;

  useEffect(() => {
    fetch("/api/missions")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMissions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const nakedEye = missions.filter((m) => !["სატურნი", "ორიონის ნისლეული", "ირმის ნახტომი"].includes(m.objectName)).length;
  const telescopeNeeded = missions.filter((m) => ["სატურნი", "ორიონის ნისლეული", "ირმის ნახტომი"].includes(m.objectName)).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">ასტრომანი</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">მისიები</h1>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn("h-2 w-2 rounded-full", isNight ? "animate-pulse bg-[#14F195]" : "bg-amber-400")}
          />
          <span className="text-xs text-slate-500">
            {isNight ? "ღამის ცა ხელმისაწვდომია" : "დღეა — მისიები ღამეს"}
          </span>
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="flex items-center justify-between rounded-2xl p-4"
        style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.20)" }}
      >
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{missions.length}</div>
            <div className="text-[9px] uppercase tracking-widest text-slate-500">სულ</div>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">|</div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Eye size={14} /> {nakedEye} თვალით
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Telescope size={14} /> {telescopeNeeded} ტელესკოპი
          </div>
        </div>
        <Badge tone="gold">ობზერვატორი</Badge>
      </div>

      {/* Daily challenge */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.08))", border: "1px solid rgba(99,102,241,0.25)" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400">ყოველდღიური გამოწვევა</p>
            <h2 className="mt-1 text-lg font-semibold text-white">ამაღამ სცადე ვენერა და მთვარე ერთ კადრში</h2>
            <p className="mt-2 text-sm text-slate-400">ორი ობიექტი ერთ ფოტოში. ბონუს ქულა: +50 ✦</p>
          </div>
          <Badge tone="accent">+50 ✦</Badge>
        </div>
        <ButtonLink href="/observations/new" size="sm" className="mt-4">
          დაიწყე ახლა →
        </ButtonLink>
      </div>

      {/* Mission grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {missions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </div>
      )}

      {/* How it works */}
      <div className="rounded-2xl border border-white/8 bg-[#0A0F1E] p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">როგორ მუშაობს</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { step: "1", title: "აირჩიე მისია", desc: "კატალოგიდან შეარჩიე შენთვის სასურველი ობიექტი." },
            { step: "2", title: "ატვირთე ფოტო", desc: "დაფიქსირე ობიექტი და ატვირთე მტკიცებულება." },
            { step: "3", title: "მიიღე ჯილდო", desc: "დადასტურების შემდეგ XP-ი, ბეჯები და ადგილი ლიდერბორდში." },
          ].map((item) => (
            <div key={item.step} className="rounded-xl border border-white/6 bg-white/3 p-4">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/15 text-sm font-bold text-indigo-300">
                {item.step}
              </div>
              <p className="font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
