"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import type { SeedMission } from "@/scripts/seed-missions";
import { getMissionByObjectName } from "@/scripts/seed-missions";

type Observation = {
  id: string;
  object_name: string;
  description: string | null;
  photo_url: string | null;
  telescope_used: string | null;
  observed_at: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
  points_awarded: number;
  rejection_reason: string | null;
  profiles?: {
    username?: string | null;
    display_name?: string | null;
  } | null;
};

type Props = {
  observations: Observation[];
  missions: SeedMission[];
  onReviewed?: () => void;
};

function displayName(observation: Observation) {
  return observation.profiles?.display_name ?? observation.profiles?.username ?? "ანონიმი";
}

export function AdminReviewPanel({ observations, missions, onReviewed }: Props) {
  const [items, setItems] = useState(observations);
  const [busy, setBusy] = useState<string | null>(null);
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const pending = useMemo(() => items.filter((item) => item.status === "pending"), [items]);

  async function review(id: string, status: "approved" | "rejected") {
    setBusy(id);
    try {
      const item = items.find((observation) => observation.id === id);
      const mission = item ? getMissionByObjectName(item.object_name) ?? missions.find((missionItem) => missionItem.objectName === item.object_name) ?? null : null;
      const response = await fetch(`/api/observations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          points_awarded: status === "approved" ? mission?.rewardPoints ?? item?.points_awarded ?? 100 : 0,
          rejection_reason: status === "rejected" ? reasons[id] ?? "უარყოფილია" : null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "განხილვა ვერ შესრულდა");
      }

      setItems((current) =>
        current.filter((observation) => observation.id !== id),
      );
      onReviewed?.();
    } finally {
      setBusy(null);
    }
  }

  if (pending.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-text-secondary">ამჟამად მოსათხრობი დაკვირვებები არ არის.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {pending.map((observation) => {
        const mission = getMissionByObjectName(observation.object_name) ?? missions.find((item) => item.objectName === observation.object_name) ?? null;
        return (
          <div key={observation.id} className="card overflow-hidden">
            <div className="grid gap-4 p-4 sm:grid-cols-[220px_1fr]">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-space">
                {observation.photo_url ? (
                  <Image
                    src={observation.photo_url}
                    alt={observation.object_name}
                    width={400}
                    height={208}
                    className="h-52 w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center text-4xl text-text-muted">✦</div>
                )}
              </div>

              <div className="flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-text-muted">განხილვაში</p>
                    <h3 className="mt-2 text-xl font-semibold text-text-primary">{observation.object_name}</h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      {displayName(observation)} · {new Date(observation.observed_at).toLocaleString("ka-GE")}
                    </p>
                  </div>
                  <div className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                    {mission?.rewardPoints ?? observation.points_awarded} XP
                  </div>
                </div>

                {observation.description && (
                  <p className="mt-4 rounded-xl border border-white/10 bg-space px-3 py-3 text-sm text-text-secondary">
                    {observation.description}
                  </p>
                )}

                <label className="mt-4 block">
                  <span className="mb-1 block text-xs uppercase tracking-[0.18em] text-text-muted">უარყოფის მიზეზი</span>
                  <textarea
                    value={reasons[observation.id] ?? ""}
                    onChange={(event) => setReasons((current) => ({ ...current, [observation.id]: event.target.value }))}
                    placeholder="არასაკმარისი ფოკუსი, მოჭრილი კადრი..."
                    rows={2}
                    className="w-full rounded-xl border border-white/10 bg-space px-3 py-3 text-sm text-text-primary outline-none transition focus:border-accent"
                  />
                </label>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={busy === observation.id}
                    onClick={() => review(observation.id, "approved")}
                    className="rounded-xl bg-aurora px-4 py-3 text-sm font-semibold text-void transition hover:brightness-110 disabled:opacity-60"
                  >
                    დამტკიცება
                  </button>
                  <button
                    type="button"
                    disabled={busy === observation.id}
                    onClick={() => review(observation.id, "rejected")}
                    className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/15 disabled:opacity-60"
                  >
                    უარყოფა
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
