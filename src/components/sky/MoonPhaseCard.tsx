import type { MoonInfo } from "@/lib/astronomy";

export function MoonPhaseCard({ moon }: { moon: MoonInfo }) {
  return (
    <section className="card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-text-muted">მთვარე</p>
          <h2 className="mt-2 text-xl font-semibold text-white">{moon.phaseNameKa}</h2>
        </div>
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-space text-3xl shadow-glow">
          {moon.phaseEmoji}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-space/80 p-3">
          <div className="text-text-muted">განათება</div>
          <div className="mt-1 font-mono text-lg text-gold">{moon.illumination}%</div>
        </div>
        <div className="rounded-2xl bg-space/80 p-3">
          <div className="text-text-muted">ასაკი</div>
          <div className="mt-1 font-mono text-lg text-white">{moon.ageDays} დღე</div>
        </div>
        <div className="rounded-2xl bg-space/80 p-3">
          <div className="text-text-muted">ამოსვლა</div>
          <div className="mt-1 font-mono text-lg text-white">{moon.rise ?? "უცნობია"}</div>
        </div>
        <div className="rounded-2xl bg-space/80 p-3">
          <div className="text-text-muted">ჩასვლა</div>
          <div className="mt-1 font-mono text-lg text-white">{moon.set ?? "უცნობია"}</div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-3 text-sm text-text-secondary">
        შემდეგი სავსე მთვარე: <span className="text-white">{moon.nextFullMoon ?? "უცნობია"}</span>
        <br />
        შემდეგი ახალი მთვარე: <span className="text-white">{moon.nextNewMoon ?? "უცნობია"}</span>
      </div>
    </section>
  );
}
