import type { HourlyForecastPoint } from "@/lib/astronomy";

function barColor(cloudCover: number) {
  if (cloudCover <= 20) return "bg-aurora";
  if (cloudCover <= 45) return "bg-sky-400";
  if (cloudCover <= 70) return "bg-gold";
  return "bg-rose-400";
}

export function HourlyForecastCard({ hourly }: { hourly: HourlyForecastPoint[] }) {
  const nightSlice = hourly.filter((point) => point.hour >= 18 || point.hour <= 5);

  return (
    <section className="card p-5">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-text-muted">საათობრივი პროგნოზი</p>
        <h2 className="mt-2 text-xl font-semibold text-white">ღამის ღრუბლიანობა</h2>
      </div>

      <div className="flex items-end gap-3 overflow-x-auto pb-2">
        {nightSlice.map((point) => (
          <div key={`${point.hour}-${point.label}`} className="flex min-w-12 flex-col items-center gap-2">
            <div className="flex h-24 w-5 items-end rounded-full bg-space p-1">
              <div
                className={`w-full rounded-full ${barColor(point.cloudCover)}`}
                style={{ height: `${Math.max(8, 100 - point.cloudCover)}%` }}
              />
            </div>
            <div className="text-center">
              <div className="font-mono text-xs text-text-secondary">{point.label}</div>
              <div className="font-mono text-[11px] text-text-muted">{point.cloudCover}%</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
