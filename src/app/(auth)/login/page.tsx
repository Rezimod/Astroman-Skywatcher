import Link from "next/link";

export default function LoginPage() {
  return (
    <section className="card p-8 shadow-glow">
      <p className="text-sm uppercase tracking-[0.24em] text-text-muted">ავტორიზაცია</p>
      <h1 className="mt-3 text-3xl font-semibold text-white">კეთილი მობრძანება</h1>
      <form className="mt-6 space-y-4">
        <input className="w-full rounded-2xl border border-white/10 bg-space px-4 py-3 text-white" placeholder="ელფოსტა" type="email" />
        <input className="w-full rounded-2xl border border-white/10 bg-space px-4 py-3 text-white" placeholder="პაროლი" type="password" />
        <button className="w-full rounded-2xl bg-accent px-4 py-3 font-medium text-white">შესვლა</button>
      </form>
      <p className="mt-4 text-sm text-text-secondary">
        ანგარიში არ გაქვს? <Link href="/register" className="text-accent">რეგისტრაცია</Link>
      </p>
    </section>
  );
}
