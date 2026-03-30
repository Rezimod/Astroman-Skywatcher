"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { SaturnLogo } from "@/components/shared/SaturnLogo";
import { hasSupabaseConfig } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("პაროლები არ ემთხვევა.");
      return;
    }
    if (password.length < 8) {
      setError("პაროლი მინიმუმ 8 სიმბოლოს უნდა შეიცავდეს.");
      return;
    }

    setLoading(true);

    try {
      if (hasSupabaseConfig()) {
        const { createClient } = await import("@/lib/supabase");
        const supabase = createClient();
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } },
        });
        if (authError) throw authError;
        router.push("/dashboard");
      } else {
        // Demo mode
        await new Promise((r) => setTimeout(r, 700));
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "რეგისტრაცია ვერ მოხერხდა. სცადე ახლიდან.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050810] px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(20,241,149,0.06),transparent_35%)]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <SaturnLogo width={40} height={40} />
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">ასტრომანი</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">ახალი ანგარიში</h1>
            <p className="mt-1 text-sm text-slate-400">შემოგვიერთდი ასტრომანის სამყაროში</p>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ background: "rgba(10,15,30,0.95)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 0 40px rgba(20,241,149,0.06)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">მომხმარებლის სახელი</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="astroman2026"
                required
                minLength={3}
                className="w-full rounded-xl border border-white/10 bg-[#111936] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">ელფოსტა</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full rounded-xl border border-white/10 bg-[#111936] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">პაროლი</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="მინ. 8 სიმბოლო"
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-white/10 bg-[#111936] px-4 py-3 pr-11 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">გაიმეორე პაროლი</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-white/10 bg-[#111936] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              რეგისტრაცია
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            უკვე გაქვს ანგარიში?{" "}
            <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
              შესვლა
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
