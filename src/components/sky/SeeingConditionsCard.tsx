export function SeeingConditionsCard({
  cloudCover,
  visibility,
  temperature,
  humidity,
  windSpeed,
  score,
}: {
  cloudCover: number;
  visibility: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  score: number;
}) {
  const scoreTone = score >= 80 ? "text-aurora" : score >= 60 ? "text-sky-300" : score >= 40 ? "text-gold" : "text-rose-300";

  return (
    <section className="card p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-text-muted">ამინდი</p>
      <div className="mt-2 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">დაკვირვების პირობები</h2>
          <p className="mt-1 text-sm text-text-secondary">ცის შეფასება და ამინდის სწრაფი რეზიუმე</p>
        </div>
        <div className={`font-mono text-3xl font-semibold ${scoreTone}`}>{score}</div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
        <div className="rounded-2xl bg-space/80 p-3">
          <div className="text-text-muted">ღრუბლები</div>
          <div className="mt-1 font-mono text-lg text-white">{cloudCover}%</div>
        </div>
        <div className="rounded-2xl bg-space/80 p-3">
          <div className="text-text-muted">ხილვადობა</div>
          <div className="mt-1 font-mono text-lg text-white">{visibility} კმ</div>
        </div>
        <div className="rounded-2xl bg-space/80 p-3">
          <div className="text-text-muted">ტემპერატურა</div>
          <div className="mt-1 font-mono text-lg text-white">{temperature}°C</div>
        </div>
        <div className="rounded-2xl bg-space/80 p-3">
          <div className="text-text-muted">ტენიანობა</div>
          <div className="mt-1 font-mono text-lg text-white">{humidity}%</div>
        </div>
        <div className="rounded-2xl bg-space/80 p-3">
          <div className="text-text-muted">ქარი</div>
          <div className="mt-1 font-mono text-lg text-white">{windSpeed} მ/წმ</div>
        </div>
      </div>
    </section>
  );
}
