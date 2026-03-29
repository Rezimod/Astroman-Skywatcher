import { checkNewBadges, getLevelForPoints, getProgressToNextLevel } from "@/lib/gamification";
import { observations } from "@/lib/mock-data";

export default function ProfilePage() {
  const points = 1420;
  const level = getLevelForPoints(points);
  const progress = getProgressToNextLevel(points);
  const earnedBadges = checkNewBadges(points, 12, 5);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,1.2fr]">
      <section className="card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/20 text-2xl text-white">ნ</div>
          <div>
            <h1 className="text-3xl font-semibold text-white">ნიკა</h1>
            <p className="text-text-secondary">{level.titleKa}</p>
          </div>
        </div>
        <div className="mt-6 h-2 rounded-full bg-white/5">
          <div className="h-2 rounded-full bg-accent" style={{ width: `${progress.percentage}%` }} />
        </div>
        <p className="mt-2 text-sm text-text-muted">{progress.current} / {progress.needed} XP</p>
      </section>
      <section className="card p-6">
        <h2 className="text-xl font-medium text-white">ბოლო დაკვირვებები</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {observations.slice(0, 2).map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-space p-4">
              <p className="text-white">{item.objectName}</p>
              <p className="mt-1 text-sm text-text-secondary">{item.submittedAt.slice(0, 10)}</p>
            </div>
          ))}
        </div>
        <h3 className="mt-6 text-lg font-medium text-white">ბეჯები</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {earnedBadges.slice(0, 6).map((badge) => (
            <span key={badge} className="rounded-full bg-gold/15 px-3 py-2 text-sm text-gold">{badge}</span>
          ))}
        </div>
      </section>
    </div>
  );
}
