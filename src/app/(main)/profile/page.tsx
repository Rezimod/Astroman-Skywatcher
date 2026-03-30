import { checkNewBadges, getLevelForPoints, getProgressToNextLevel } from "@/lib/gamification";
import { observations } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

// Demo profile — replace with Supabase auth user in production
const DEMO = {
  username: "ნიკა",
  points: 1420,
  observationsCount: 12,
  missionsCompleted: 5,
  streakDays: 3,
  joinedAt: "2026-01-15",
};

export default function ProfilePage() {
  const level = getLevelForPoints(DEMO.points);
  const progress = getProgressToNextLevel(DEMO.points);
  const earnedBadges = checkNewBadges(DEMO.points, DEMO.observationsCount, DEMO.missionsCompleted);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Header card */}
      <div className="rounded-2xl border border-white/8 bg-[#0A0F1E] p-6">
        <div className="flex items-start gap-5">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-3xl font-bold text-indigo-200">
            {DEMO.username.slice(0, 1)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-white">{DEMO.username}</h1>
              <Badge tone="accent">{level.titleKa}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-400">თბილისი, საქართველო</p>
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-500">LVL {level.level} → {level.level + 1}</span>
                <span className="font-mono text-amber-400">{progress.current} / {progress.needed} XP</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/6">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-400 transition-all"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "XP ქულა", value: DEMO.points.toLocaleString(), color: "text-amber-400" },
          { label: "დაკვირვება", value: DEMO.observationsCount, color: "text-indigo-300" },
          { label: "მისია", value: DEMO.missionsCompleted, color: "text-emerald-400" },
          { label: "სერია", value: `${DEMO.streakDays}🔥`, color: "text-orange-400" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/8 bg-[#0A0F1E] p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      {earnedBadges.length > 0 && (
        <div className="rounded-2xl border border-white/8 bg-[#0A0F1E] p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">ბეჯები</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {earnedBadges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-300"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent observations */}
      <div className="rounded-2xl border border-white/8 bg-[#0A0F1E] p-5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">ბოლო დაკვირვებები</p>
          <ButtonLink href="/gallery" variant="secondary" size="sm">ყველა</ButtonLink>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {observations.slice(0, 4).map((obs) => (
            <div key={obs.id} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 p-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/12 text-lg">
                🌌
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{obs.objectName}</p>
                <p className="text-xs text-slate-400">{obs.submittedAt.slice(0, 10)} · <span className="text-amber-400">+{obs.pointsEarned} ✦</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/missions" size="lg">
          ახალი მისია
        </ButtonLink>
        <ButtonLink href="/leaderboard" variant="secondary" size="lg">
          ლიდერბორდი
        </ButtonLink>
        <button className="rounded-full border border-rose-500/25 bg-rose-500/10 px-5 py-2.5 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/15">
          გამოსვლა
        </button>
      </div>
    </div>
  );
}
