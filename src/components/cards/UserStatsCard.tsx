import { CardShell } from "@/components/cards/CardShell";
import type { DashboardProfile } from "@/lib/dashboard";

interface UserStatsCardProps {
  profile: DashboardProfile;
  progress: number;
  nextThresholdLabel: string;
  loading?: boolean;
}

export function UserStatsCard({ profile, progress, nextThresholdLabel, loading = false }: UserStatsCardProps) {
  return (
    <CardShell tone="gold">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-2xl font-semibold text-amber-300">
          {profile.displayName.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-text-primary">
                {loading ? "..." : profile.displayName}
              </h2>
              <p className="text-xs text-text-muted">@{profile.username}</p>
            </div>
            {profile.rank ? <span className="text-xs text-text-muted">#{profile.rank}</span> : null}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="დონე" value={`LVL ${profile.level}`} />
            <Stat label="ქულები" value={profile.points.toLocaleString()} accent />
            <Stat label="მისიები" value={profile.missionsCompleted.toString()} />
          </div>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-[11px] text-text-muted">
              <span>შემდეგ დონემდე</span>
              <span>{nextThresholdLabel}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#f59e0b,#facc15)] transition-all duration-700"
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/6 bg-white/3 p-3">
      <div className={accent ? "text-lg font-semibold text-amber-300" : "text-lg font-semibold text-text-primary"}>{value}</div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-text-muted">{label}</div>
    </div>
  );
}
