export function BestViewingWindowCard({
  start,
  end,
  sunset,
  sunrise,
}: {
  start: string;
  end: string;
  sunset: string | null;
  sunrise: string | null;
}) {
  return (
    <section className="card p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-text-muted">საუკეთესო ფანჯარა</p>
      <h2 className="mt-2 text-xl font-semibold text-white">დაკვირვების დრო</h2>
      <div className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between rounded-2xl bg-space/80 px-4 py-3">
          <span className="text-text-secondary">საუკეთესო დრო</span>
          <span className="font-mono text-gold">{start} - {end}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-space/80 px-4 py-3">
          <span className="text-text-secondary">მზის ჩასვლა</span>
          <span className="font-mono text-white">{sunset ?? "უცნობია"}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-space/80 px-4 py-3">
          <span className="text-text-secondary">მზის ამოსვლა</span>
          <span className="font-mono text-white">{sunrise ?? "უცნობია"}</span>
        </div>
      </div>
    </section>
  );
}
