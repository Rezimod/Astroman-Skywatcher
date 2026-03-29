import { CardShell } from "@/components/cards/CardShell";
import type { LeaderboardRow } from "@/lib/dashboard";

interface LeaderboardSnapshotCardProps {
  leaderboard: LeaderboardRow[];
}

export function LeaderboardSnapshotCard({ leaderboard }: LeaderboardSnapshotCardProps) {
  return (
    <CardShell>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-muted">ლიდერბორდი</h3>
        <span className="text-xs text-text-muted">ტოპ 5</span>
      </div>
      <div className="space-y-2">
        {leaderboard.slice(0, 5).map((row) => (
          <div
            key={`${row.rank}-${row.username}`}
            className={`flex items-center gap-3 rounded-2xl border px-3 py-2 ${
              row.isCurrentUser ? "border-indigo-400/30 bg-indigo-400/10" : "border-white/6 bg-white/3"
            }`}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xs font-semibold text-text-primary">
              #{row.rank}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">{row.displayName}</p>
              <p className="text-xs text-text-muted">LVL {row.level} · {row.observationsCount} დაკვირვება</p>
            </div>
            <div className="text-sm font-semibold text-amber-300">{row.points.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </CardShell>
  );
}
