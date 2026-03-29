import { CardShell } from "@/components/cards/CardShell";
import type { DashboardConditions } from "@/lib/dashboard";

interface TonightsSkyCardProps {
  conditions: DashboardConditions;
  loading?: boolean;
}

export function TonightsSkyCard({ conditions, loading = false }: TonightsSkyCardProps) {
  const visibleCount = conditions.planets.filter((planet) => planet.isVisible).length;

  return (
    <CardShell tone="indigo">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-muted">დღევანდელი ცა</h3>
          <p className="mt-1 text-xl font-semibold text-text-primary">{conditions.statusLabel}</p>
        </div>
        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          {visibleCount} ხილული ობიექტი
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="ღრუბლიანობა" value={`${conditions.cloudCover}%`} />
        <Metric label="ხილვადობა" value={`${conditions.visibility} km`} />
        <Metric label="ტემპერატურა" value={`${conditions.temperature}°C`} />
        <Metric label="ქულის სკალა" value={String(conditions.score)} accent />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-white/6 bg-white/3 p-3">
        <Metric label="მზის ჩასვლა" value={conditions.sunset} compact />
        <Metric label="მზის ამოსვლა" value={conditions.sunrise} compact />
        <Metric label="მთვარის ფაზა" value={conditions.moonPhaseName} compact />
        <Metric label="საუკეთესო ფანჯარა" value={`${conditions.bestViewingStart} - ${conditions.bestViewingEnd}`} compact />
      </div>
      {loading ? <div className="mt-3 h-2 rounded-full bg-white/5" /> : null}
    </CardShell>
  );
}

function Metric({
  label,
  value,
  accent = false,
  compact = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  compact?: boolean;
}) {
  return (
    <div>
      <div className={compact ? "text-sm font-medium text-text-primary" : accent ? "text-2xl font-semibold text-amber-300" : "text-2xl font-semibold text-text-primary"}>
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-[0.16em] text-text-muted">{label}</div>
    </div>
  );
}
