"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Crown, Telescope, User } from "lucide-react";

import { cn } from "@/components/ui/cn";
import type { LeaderboardEntry } from "@/lib/site";

type Period = "all" | "month" | "week";

const PERIOD_TABS: { key: Period; label: string }[] = [
  { key: "week", label: "ეს კვირა" },
  { key: "month", label: "ეს თვე" },
  { key: "all", label: "ყველა დრო" },
];

function getRankTitle(level: number): string {
  if (level >= 9) return "ვარსკვლავთმრიცხველი";
  if (level >= 7) return "ასტროფოტოგრაფი";
  if (level >= 5) return "მთვარის მაძიებელი";
  if (level >= 3) return "ობზერვატორი";
  return "დამწყები";
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("week");
  const [users, setUsers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setUsers([]);
        setLoading(false);
      });
  }, [period]);

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  // Podium: 2nd left, 1st center, 3rd right
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumRanks = top3.length >= 3 ? [2, 1, 3] : [1, 2];
  const podiumHeights = ["h-20", "h-28", "h-16"];
  const podiumBorderColors = ["border-slate-400/30", "border-amber-400/50", "border-orange-400/40"];
  const podiumTextColors = ["text-slate-400", "text-amber-400", "text-orange-400"];

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">ასტრომანი</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">ლიდერბორდი</h1>
        </div>
      </div>

      {/* Period tabs */}
      <div className="flex items-center gap-1 rounded-xl border border-white/6 bg-white/3 p-1">
        {PERIOD_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setPeriod(tab.key)}
            className={cn(
              "flex-1 rounded-lg py-2 text-[11px] font-bold uppercase tracking-wider transition-all",
              period === tab.key ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-white",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Podium */}
      {!loading && top3.length > 0 && (
        <div className="rounded-2xl border border-white/8 bg-[#0A0F1E] p-5 sm:p-6">
          <div className="flex items-end justify-center gap-4 sm:gap-8">
            {podiumOrder.map((user, i) => {
              const rank = podiumRanks[i];
              const isFirst = rank === 1;
              return (
                <div key={user.id} className="flex flex-1 max-w-[130px] flex-col items-center gap-2">
                  {isFirst && <Crown size={18} className="text-amber-400" />}
                  <div
                    className={cn(
                      "relative flex h-12 w-12 items-center justify-center rounded-full border-2",
                      podiumBorderColors[i],
                      isFirst ? "bg-gradient-to-br from-indigo-500 to-purple-500" : "bg-[#1E2235]",
                    )}
                  >
                    {isFirst ? <Telescope size={18} className="text-white" /> : <User size={15} className="text-slate-500" />}
                    <div
                      className={cn(
                        "absolute -bottom-2 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full text-[9px] font-black",
                        isFirst ? "bg-amber-400 text-black" : "border border-white/10 bg-[#1E2235] text-white",
                      )}
                    >
                      {rank}
                    </div>
                  </div>
                  <div
                    className={cn(
                      podiumHeights[i],
                      "flex w-full flex-col items-center justify-start rounded-t-lg px-2 pt-4 text-center",
                    )}
                    style={{
                      background: isFirst ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isFirst ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)"}`,
                      borderBottom: "none",
                    }}
                  >
                    <p className="w-full truncate text-xs font-bold text-white">{user.username}</p>
                    <p className={cn("mt-1 text-[11px] font-bold", podiumTextColors[i])}>
                      {user.points.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="rounded-2xl border border-white/8 bg-[#0A0F1E] p-5">
          <div className="flex items-end justify-center gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-1 max-w-[120px] flex-col items-center gap-2">
                <div className="h-12 w-12 animate-pulse rounded-full bg-white/6" />
                <div className={cn(podiumHeights[i], "w-full animate-pulse rounded-t-lg bg-white/4")} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ranks 4+ */}
      {!loading && rest.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#0A0F1E]">
          <div className="hidden grid-cols-12 border-b border-white/6 px-5 py-3 sm:grid">
            <span className="col-span-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">#</span>
            <span className="col-span-5 text-[10px] font-bold uppercase tracking-wider text-slate-500">მომხმარებელი</span>
            <span className="col-span-3 hidden text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:block">წოდება</span>
            <span className="col-span-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">ქულა</span>
          </div>
          {rest.map((user, idx) => (
            <div
              key={user.id}
              className="flex items-center gap-3 border-b border-white/4 px-4 py-3 last:border-0 hover:bg-white/2 sm:grid sm:grid-cols-12 sm:gap-0 sm:px-5"
            >
              <span className="font-mono text-[11px] font-bold text-slate-500 sm:col-span-1">
                {String(idx + 4).padStart(2, "0")}
              </span>
              <div className="flex flex-1 min-w-0 items-center gap-2.5 sm:col-span-5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/8 bg-[#1E2235]">
                  <User size={12} className="text-slate-500" />
                </div>
                <span className="truncate text-sm font-bold text-white">{user.username}</span>
              </div>
              <span className="hidden text-xs text-slate-500 sm:col-span-3 sm:block">
                <span className="rounded border border-white/6 bg-white/4 px-2 py-0.5 text-[10px]">
                  {getRankTitle(user.level)}
                </span>
              </span>
              <span className="flex-shrink-0 text-sm font-bold text-white sm:col-span-3 sm:text-right">
                {user.points.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && users.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/8 bg-[#0A0F1E] p-16 text-center">
          <Crown size={40} className="text-slate-700" />
          <p className="font-bold text-slate-500">ჯერ მომხმარებლები არ არის — იყავი პირველი!</p>
          <Link
            href="/missions"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-bold text-white"
          >
            მისიების დაწყება <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
