import type { SkyPlanet } from "@/lib/astronomy";

function altitudeWidth(altitude: number) {
  return Math.max(6, Math.min(100, Math.round(((altitude + 10) / 100) * 100)));
}

export function PlanetExplorer({ planets }: { planets: SkyPlanet[] }) {
  return (
    <section className="card p-5">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-text-muted">პლანეტები</p>
        <h2 className="mt-2 text-xl font-semibold text-white">დღევანდელი ხილვადი ობიექტები</h2>
      </div>

      <div className="space-y-3">
        {planets.map((planet) => (
          <div
            key={planet.id}
            className={`rounded-2xl border px-4 py-3 ${
              planet.isVisible ? "border-white/10 bg-white/[0.03]" : "border-white/[0.06] bg-space/70 opacity-70"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{planet.emoji}</span>
                  <h3 className="font-semibold text-white">{planet.nameKa}</h3>
                </div>
                <p className="mt-1 text-xs text-text-muted">
                  {planet.direction} · სიდ. {planet.magnitude.toFixed(1)}
                </p>
              </div>
              <div className="text-right text-xs text-text-muted">
                {planet.isVisible ? "ხილულია" : "დაბალია"}
                <div className="font-mono text-white">{planet.bestViewingTime ?? "უცნობი"}</div>
              </div>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-space">
              <div
                className={`h-full rounded-full ${planet.isVisible ? "bg-aurora" : "bg-text-muted/40"}`}
                style={{ width: `${altitudeWidth(planet.altitude)}%` }}
              />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-text-secondary">
              <div className="rounded-xl bg-space/80 px-3 py-2">
                <div className="text-text-muted">სიმაღლე</div>
                <div className="mt-1 font-mono text-white">{planet.altitude.toFixed(1)}°</div>
              </div>
              <div className="rounded-xl bg-space/80 px-3 py-2">
                <div className="text-text-muted">ამოსვლა</div>
                <div className="mt-1 font-mono text-white">{planet.rise ?? "უცნობია"}</div>
              </div>
              <div className="rounded-xl bg-space/80 px-3 py-2">
                <div className="text-text-muted">ჩასვლა</div>
                <div className="mt-1 font-mono text-white">{planet.set ?? "უცნობია"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
