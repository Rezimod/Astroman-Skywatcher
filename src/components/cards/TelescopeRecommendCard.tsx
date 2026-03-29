import Link from "next/link";
import Image from "next/image";
import { CardShell } from "@/components/cards/CardShell";
import type { TelescopeRecommendation } from "@/lib/dashboard";

interface TelescopeRecommendCardProps {
  recommendation: TelescopeRecommendation;
}

export function TelescopeRecommendCard({ recommendation }: TelescopeRecommendCardProps) {
  return (
    <CardShell tone="indigo">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-muted">ტელესკოპის რეკომენდაცია</h3>
        <span className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-xs font-semibold text-indigo-200">
          {recommendation.badge}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/6 bg-white/3">
          <Image src="/logo-icon.png" alt="Astroman logo" width={56} height={56} className="opacity-90" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-text-primary">{recommendation.name}</p>
          <p className="text-sm text-amber-300">{recommendation.priceLabel}</p>
        </div>
      </div>

      <p className="mt-3 text-sm text-text-secondary">{recommendation.why}</p>
      <div className="mt-4">
        <Link
          href={recommendation.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          პროდუქტის ნახვა
        </Link>
      </div>
    </CardShell>
  );
}
