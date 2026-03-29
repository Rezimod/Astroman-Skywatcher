import { CardShell } from "@/components/cards/CardShell";
import type { DashboardMission } from "@/lib/dashboard";

interface ActiveMissionsCardProps {
  missions: DashboardMission[];
  loading?: boolean;
}

export function ActiveMissionsCard({ missions, loading = false }: ActiveMissionsCardProps) {
  return (
    <CardShell>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-muted">აქტიური მისიები</h3>
        <span className="text-xs text-text-muted">{missions.length} ცალი</span>
      </div>
      <div className="space-y-3">
        {(loading ? missions.slice(0, 3) : missions.slice(0, 3)).map((mission) => (
          <div key={mission.id} className="rounded-2xl border border-white/6 bg-white/3 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">{mission.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-text-muted">{mission.description}</p>
              </div>
              <div className="shrink-0 rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
                +{mission.rewardPoints}
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#6366f1,#22d3ee)]"
                style={{ width: `${Math.max(0, Math.min(100, mission.progress ?? 0))}%` }}
              />
            </div>
          </div>
        ))}
        {missions.length === 0 ? <p className="text-sm text-text-muted">მისიები ჯერ არ ჩაიტვირთა.</p> : null}
      </div>
    </CardShell>
  );
}
