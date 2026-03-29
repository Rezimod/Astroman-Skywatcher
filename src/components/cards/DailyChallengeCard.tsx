import { CardShell } from "@/components/cards/CardShell";
import type { DailyChallenge } from "@/lib/dashboard";

interface DailyChallengeCardProps {
  challenge: DailyChallenge;
}

const difficultyTone: Record<DailyChallenge["difficulty"], string> = {
  easy: "text-emerald-300 border-emerald-400/20 bg-emerald-400/10",
  medium: "text-indigo-200 border-indigo-400/20 bg-indigo-400/10",
  hard: "text-amber-300 border-amber-400/20 bg-amber-400/10",
  expert: "text-fuchsia-200 border-fuchsia-400/20 bg-fuchsia-400/10",
};

export function DailyChallengeCard({ challenge }: DailyChallengeCardProps) {
  return (
    <CardShell tone="aurora">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-muted">დღის გამოწვევა</h3>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${difficultyTone[challenge.difficulty]}`}>
          {challenge.difficulty === "easy" ? "მარტივი" : challenge.difficulty === "medium" ? "საშუალო" : challenge.difficulty === "hard" ? "რთული" : "ექსპერტი"}
        </span>
      </div>
      <div className="space-y-2">
        <p className="text-xl font-semibold text-text-primary">{challenge.title}</p>
        <p className="text-sm text-text-secondary">{challenge.description}</p>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/6 bg-white/3 px-4 py-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-text-muted">ობიექტი</div>
          <div className="text-sm font-medium text-text-primary">{challenge.objectName}</div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-[0.18em] text-text-muted">ჯილდო</div>
          <div className="text-lg font-semibold text-amber-300">+{challenge.rewardPoints} XP</div>
        </div>
      </div>
    </CardShell>
  );
}
