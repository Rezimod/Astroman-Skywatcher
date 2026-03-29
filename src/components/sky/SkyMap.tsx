import { getMoonInfo, getVisiblePlanets, type MoonInfo, type SkyPlanet } from "@/lib/astronomy";

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function mapPosition(altitude: number, azimuth: number, size = 280) {
  const radius = size / 2 - 22;
  const distance = ((90 - Math.max(-10, altitude)) / 90) * radius;
  const angle = toRadians(azimuth);
  const cx = size / 2;
  const cy = size / 2;

  return {
    x: cx + distance * Math.sin(angle),
    y: cy - distance * Math.cos(angle),
  };
}

export function SkyMap({ planets = getVisiblePlanets(), moon = getMoonInfo() }: { planets?: SkyPlanet[]; moon?: MoonInfo }) {
  const size = 280;
  const center = size / 2;
  const visible = planets.filter((planet) => planet.isVisible);

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-text-muted">ცა</p>
          <h2 className="mt-2 text-xl font-semibold text-white">სამხრეთის ცის რუკა</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-space px-3 py-1 text-xs text-text-secondary">
          თბილისი · დღეს
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_28%),linear-gradient(180deg,#111936,#050810)] p-4">
        <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto block w-full max-w-[320px]">
          <defs>
            <radialGradient id="skyGlow" cx="50%" cy="50%" r="65%">
              <stop offset="0%" stopColor="rgba(99,102,241,0.26)" />
              <stop offset="100%" stopColor="rgba(5,8,16,0)" />
            </radialGradient>
          </defs>

          <circle cx={center} cy={center} r={center - 10} fill="url(#skyGlow)" stroke="rgba(255,255,255,0.08)" />
          <circle cx={center} cy={center} r={100} fill="none" stroke="rgba(255,255,255,0.12)" strokeDasharray="2 8" />
          <circle cx={center} cy={center} r={60} fill="none" stroke="rgba(255,255,255,0.12)" strokeDasharray="2 8" />
          <circle cx={center} cy={center} r={16} fill="rgba(255,255,255,0.06)" />

          <line x1={center} y1={10} x2={center} y2={size - 10} stroke="rgba(255,255,255,0.08)" />
          <line x1={10} y1={center} x2={size - 10} y2={center} stroke="rgba(255,255,255,0.08)" />

          <text x={center} y={18} textAnchor="middle" className="fill-text-secondary text-[10px]">ჩრდილო</text>
          <text x={size - 18} y={center + 3} textAnchor="middle" className="fill-text-secondary text-[10px]">აღმ</text>
          <text x={center} y={size - 10} textAnchor="middle" className="fill-text-secondary text-[10px]">სამხრეთი</text>
          <text x={18} y={center + 3} textAnchor="middle" className="fill-text-secondary text-[10px]">დას</text>

          {visible.map((planet) => {
            const pos = mapPosition(planet.altitude, planet.azimuth, size);
            return (
              <g key={planet.id}>
                <circle cx={pos.x} cy={pos.y} r="10" fill="rgba(99,102,241,0.24)" />
                <circle cx={pos.x} cy={pos.y} r="5.5" fill="#14F195" />
                <text x={pos.x} y={pos.y - 12} textAnchor="middle" className="fill-white text-[9px]">
                  {planet.nameKa}
                </text>
              </g>
            );
          })}

          <g>
            <circle cx={center} cy={center} r="7" fill="#F59E0B" />
            <text x={center} y={center + 22} textAnchor="middle" className="fill-gold text-[9px]">
              მთვარე {moon.phaseEmoji}
            </text>
          </g>
        </svg>
      </div>
    </section>
  );
}
