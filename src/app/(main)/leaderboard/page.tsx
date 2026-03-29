import { leaderboard } from "@/lib/mock-data";

export default function LeaderboardPage() {
  return (
    <div className="card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-white">ლიდერბორდი</h1>
        <div className="flex gap-2 text-sm">
          <span className="rounded-full bg-accent px-4 py-2 text-white">ყველა დრო</span>
          <span className="rounded-full bg-white/5 px-4 py-2 text-text-secondary">ეს თვე</span>
          <span className="rounded-full bg-white/5 px-4 py-2 text-text-secondary">ეს კვირა</span>
        </div>
      </div>
      <div className="space-y-3">
        {leaderboard.map((entry, index) => (
          <div key={entry.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-space px-4 py-4">
            <div>
              <p className="text-white">{index + 1}. {entry.username}</p>
              <p className="text-sm text-text-secondary">დონე {entry.level} · დაკვირვება {entry.observationsCount}</p>
            </div>
            <p className="font-mono text-gold">{entry.points}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
