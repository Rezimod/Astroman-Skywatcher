import Image from "next/image";
import Link from "next/link";

import { BestViewingWindowCard } from "@/components/sky/BestViewingWindowCard";
import { HourlyForecastCard } from "@/components/sky/HourlyForecastCard";
import { MoonPhaseCard } from "@/components/sky/MoonPhaseCard";
import { PlanetExplorer } from "@/components/sky/PlanetExplorer";
import { SeeingConditionsCard } from "@/components/sky/SeeingConditionsCard";
import { SkyMap } from "@/components/sky/SkyMap";
import { formatSkyDate, formatSkyShortDateTime, getNasaApod, getSkyConditions } from "@/lib/astronomy";

export default async function ConditionsPage() {
  const [conditions, apod] = await Promise.all([getSkyConditions(), getNasaApod()]);
  const visiblePlanets = conditions.planets.filter((planet) => planet.isVisible);
  const hiddenPlanets = conditions.planets.filter((planet) => !planet.isVisible);

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-4 py-5 pb-24 sm:px-6 lg:px-8">
      <section className="card border-white/10 p-5 shadow-glow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-text-muted">ცის მდგომარეობა</p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">თბილისის ღამის ცა</h1>
            <p className="max-w-2xl text-sm text-text-secondary sm:text-base">
              მიმდინარე ამინდი, მთვარის ფაზა, ხილვადი პლანეტები და დაკვირვებისთვის საუკეთესო ფანჯარა ერთ ხედში.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-space px-4 py-3">
              <div className="text-xs uppercase tracking-[0.18em] text-text-muted">ქულა</div>
              <div className="mt-1 font-mono text-3xl font-semibold text-gold">{conditions.stargazingScore}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-space px-4 py-3">
              <div className="text-xs uppercase tracking-[0.18em] text-text-muted">ფანჯარა</div>
              <div className="mt-1 font-mono text-xl text-white">
                {conditions.bestViewingStart} - {conditions.bestViewingEnd}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-space px-4 py-3">
              <div className="text-xs uppercase tracking-[0.18em] text-text-muted">განახლება</div>
              <div className="mt-1 font-mono text-lg text-white">
                {formatSkyShortDateTime(new Date(conditions.generatedAt))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <SeeingConditionsCard
            cloudCover={conditions.cloudCover}
            visibility={conditions.visibility}
            temperature={conditions.temperature}
            humidity={conditions.humidity}
            windSpeed={conditions.windSpeed}
            score={conditions.stargazingScore}
          />

          <div className="grid gap-5 lg:grid-cols-2">
            <MoonPhaseCard moon={conditions.moon} />
            <BestViewingWindowCard
              start={conditions.bestViewingStart}
              end={conditions.bestViewingEnd}
              sunset={conditions.sunset}
              sunrise={conditions.sunrise}
            />
          </div>

          <HourlyForecastCard hourly={conditions.hourly} />
          <SkyMap planets={conditions.planets} moon={conditions.moon} />
        </div>

        <div className="space-y-5">
          <section className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-text-muted">დაკვირვება</p>
                <h2 className="mt-2 text-xl font-semibold text-white">რჩევები ამ ღამისთვის</h2>
              </div>
              <div className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 font-mono text-xs text-gold">
                {visiblePlanets.length} ხილული
              </div>
            </div>

            <ul className="space-y-3 text-sm text-text-secondary">
              {conditions.observationTips.map((tip) => (
                <li key={tip} className="rounded-2xl bg-space/80 px-4 py-3">
                  {tip}
                </li>
              ))}
              <li className="rounded-2xl bg-space/80 px-4 py-3">
                მზის ჩასვლა: <span className="text-white">{conditions.sunset ?? "უცნობია"}</span>
              </li>
              <li className="rounded-2xl bg-space/80 px-4 py-3">
                ასტრონომიული ბინდი: <span className="text-white">{conditions.astronomicalTwilightEnd ?? "უცნობია"}</span>
              </li>
            </ul>
          </section>

          <PlanetExplorer planets={conditions.planets} />

          <section className="card overflow-hidden p-0">
            <div className="border-b border-white/10 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-text-muted">დღის ასტრონომიული ფოტო</p>
              <h2 className="mt-2 text-xl font-semibold text-white">{apod.title}</h2>
              <p className="mt-1 font-mono text-xs text-text-muted">{apod.date}</p>
            </div>
            <Image
              src={apod.imageUrl}
              alt={apod.title}
              width={1200}
              height={640}
              className="h-64 w-full object-cover"
              unoptimized
            />
            <div className="space-y-3 px-5 py-4">
              <p className="max-h-36 overflow-hidden text-sm leading-6 text-text-secondary">{apod.explanation}</p>
              {apod.hdImageUrl ? (
                <a
                  href={apod.hdImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-glow"
                >
                  სრული ვერსია
                </a>
              ) : null}
            </div>
          </section>

          <section className="card p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-text-muted">დამატებითი მონაცემები</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-space/80 p-4">
                <div className="text-sm text-text-muted">მზის ამოსვლა</div>
                <div className="mt-1 font-mono text-xl text-white">{conditions.sunrise ?? "უცნობია"}</div>
              </div>
              <div className="rounded-2xl bg-space/80 p-4">
                <div className="text-sm text-text-muted">ასტრონომიული ბინდის დასაწყისი</div>
                <div className="mt-1 font-mono text-xl text-white">{conditions.astronomicalTwilightBegin ?? "უცნობია"}</div>
              </div>
              <div className="rounded-2xl bg-space/80 p-4">
                <div className="text-sm text-text-muted">ხილული პლანეტები</div>
                <div className="mt-1 font-mono text-xl text-white">{visiblePlanets.length}</div>
              </div>
              <div className="rounded-2xl bg-space/80 p-4">
                <div className="text-sm text-text-muted">დაბალი პლანეტები</div>
                <div className="mt-1 font-mono text-xl text-white">{hiddenPlanets.length}</div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-text-muted">თარიღი</p>
            <h2 className="mt-2 text-xl font-semibold text-white">{formatSkyDate(new Date(conditions.generatedAt))}</h2>
          </div>
          <Link href="/dashboard" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">
            დაფაზე დაბრუნება
          </Link>
        </div>
      </section>
    </main>
  );
}
