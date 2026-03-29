import { missions } from "@/lib/mock-data";
import { SectionCard } from "@/components/ui/SectionCard";

export default function MissionsPage() {
  return (
    <div className="space-y-4">
      <SectionCard title="დღის გამოწვევა" eyebrow="მისიები">
        <p className="text-lg text-white">ამაღამ სცადე ვენერა და მთვარე ერთ კადრში.</p>
      </SectionCard>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {missions.map((mission) => (
          <article key={mission.id} className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-white">{mission.title}</h2>
              <span className="rounded-full bg-accent/15 px-3 py-1 text-xs text-white">{mission.difficulty}</span>
            </div>
            <p className="mt-3 text-sm text-text-secondary">{mission.description}</p>
            <p className="mt-4 text-sm text-gold">{mission.rewardXp} XP</p>
            <button className="mt-5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white">დაწყება →</button>
          </article>
        ))}
      </div>
    </div>
  );
}
