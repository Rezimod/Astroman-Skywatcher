import { CardShell } from "@/components/cards/CardShell";
import type { DashboardApod } from "@/lib/dashboard";

interface NasaApodCardProps {
  apod: DashboardApod | null;
}

export function NasaApodCard({ apod }: NasaApodCardProps) {
  return (
    <CardShell>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-text-muted">NASA APOD</h3>
        <span className="text-xs text-text-muted">{apod?.date ?? "—"}</span>
      </div>

      {apod?.imageUrl ? (
        <div className="mb-4 overflow-hidden rounded-2xl border border-white/6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={apod.imageUrl} alt={apod.title} className="aspect-[16/10] w-full object-cover" />
        </div>
      ) : (
        <div className="mb-4 flex aspect-[16/10] items-center justify-center rounded-2xl border border-white/6 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.22),transparent_55%),linear-gradient(180deg,rgba(17,25,54,0.9),rgba(10,15,30,0.96))]">
          <div className="text-center">
            <div className="text-4xl">✦</div>
            <div className="mt-2 text-xs uppercase tracking-[0.22em] text-text-muted">სურათი ხელმისაწვდომი არაა</div>
          </div>
        </div>
      )}

      <p className="text-base font-semibold text-text-primary">{apod?.title ?? "NASA APOD"}</p>
      <p className="mt-2 line-clamp-4 text-sm text-text-secondary">
        {apod?.explanation ?? "APOD ინფორმაცია ჩაიტვირთება, როგორც კი NASA route მზად იქნება."}
      </p>
    </CardShell>
  );
}
