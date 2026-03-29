import { CardShell } from "@/components/cards/CardShell";
import type { DashboardConditions } from "@/lib/dashboard";

interface SkyMapCardProps {
  conditions: DashboardConditions;
}

export function SkyMapCard({ conditions }: SkyMapCardProps) {
  const planets = conditions.planets;
  const radius = 124;
  const center = 160;

  return (
    <CardShell>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-muted">ცა რუკა</h3>
        <span className="text-xs text-text-muted">თბილისი · სამხრეთის ხედვა</span>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/6 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_55%),linear-gradient(180deg,rgba(7,10,20,0.9),rgba(10,15,30,0.98))] p-3">
        <svg viewBox="0 0 320 320" className="h-[260px] w-full">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
          <circle cx={center} cy={center} r={radius * 0.7} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <circle cx={center} cy={center} r={radius * 0.35} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

          {planets.map((planet) => {
            const az = (planet.azimuth - 90) * (Math.PI / 180);
            const dist = radius * (1 - Math.max(0, Math.min(90, planet.altitude)) / 90);
            const x = center + Math.cos(az) * dist;
            const y = center + Math.sin(az) * dist;
            const visible = planet.isVisible;
            return (
              <g key={planet.id}>
                <circle cx={x} cy={y} r={visible ? 6 : 4} fill={visible ? "#f59e0b" : "#64748b"} opacity={visible ? 0.95 : 0.6} />
                <text x={x + 10} y={y + 4} fill="white" fontSize="11" opacity={visible ? 0.95 : 0.65}>
                  {planet.nameKa}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </CardShell>
  );
}
