import { getMoonInfo, getStargazingScore, getSunTimes, getVisiblePlanets } from "@/lib/astronomy";
import { getProgressToNextLevel, getLevelForPoints } from "@/lib/gamification";
import { leaderboard, missions } from "@/lib/mock-data";
import { SectionCard } from "@/components/ui/SectionCard";
import { SkyMap } from "@/components/sky/SkyMap";

export default async function DashboardPage() {
  const moon = getMoonInfo();
  const sun = getSunTimes();
  const planets = getVisiblePlanets().filter((planet) => planet.isVisible);
  const score = getStargazingScore(28, moon.illumination);
  const points = 1420;
  const level = getLevelForPoints(points);
  const progress = getProgressToNextLevel(points);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr,1.4fr,1fr]">
      <SectionCard title="პროფილი" eyebrow="დღევანდელი პროგრესი">
        <p className="text-4xl font-semibold text-gold">LVL {level.level}</p>
        <p className="mt-2 text-text-secondary">{level.titleKa}</p>
        <div className="mt-4 h-2 rounded-full bg-white/5">
          <div className="h-2 rounded-full bg-accent" style={{ width: `${progress.percentage}%` }} />
        </div>
        <p className="mt-2 text-sm text-text-muted">{progress.current} / {progress.needed} XP</p>
      </SectionCard>

      <SectionCard title="ამაღამ ცა" eyebrow="Tbilisi live">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-space p-4">
            <p className="text-sm text-text-secondary">სტარგეიზინგ ქულა</p>
            <p className="mt-2 text-5xl font-semibold text-gold">{score}</p>
            <p className="mt-3 text-sm text-text-muted">
              მზის ჩასვლა {sun.sunset} · ასტრონ. ბინდი {sun.astronomicalTwilightEnd ?? sun.astronomicalTwilightBegin}
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-space p-4">
            <p className="text-sm text-text-secondary">მთვარე</p>
            <p className="mt-2 text-2xl font-medium text-white">{moon.phaseName}</p>
            <p className="mt-3 text-sm text-text-muted">განათება {moon.illumination}% · ამოსვლა {moon.rise}</p>
          </div>
        </div>
        <div className="mt-4">
          <SkyMap />
        </div>
      </SectionCard>

      <SectionCard title="აქტიური მისიები" eyebrow="დღის არჩევანი">
        <div className="space-y-3">
          {missions.slice(0, 3).map((mission) => (
            <div key={mission.id} className="rounded-2xl border border-white/10 bg-space p-4">
              <p className="font-medium text-white">{mission.title}</p>
              <p className="mt-1 text-sm text-text-secondary">{mission.description}</p>
              <p className="mt-3 text-sm text-gold">{mission.rewardXp} XP</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-space p-4">
          <p className="text-sm text-text-secondary">ტოპ 3</p>
          <ol className="mt-3 space-y-2 text-sm text-white">
            {leaderboard.slice(0, 3).map((entry) => (
              <li key={entry.id} className="flex justify-between">
                <span>{entry.username}</span>
                <span>{entry.points}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-4 rounded-2xl border border-white/10 bg-space p-4">
          <p className="text-sm text-text-secondary">ამაღამ ხილული პლანეტები</p>
          <p className="mt-2 text-white">{planets.map((planet) => planet.nameKa).join(", ") || "მონაცემები განახლდება"}</p>
        </div>
      </SectionCard>
    </div>
  );
}
