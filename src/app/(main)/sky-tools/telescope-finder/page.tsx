"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Telescope } from "lucide-react";

import { getTelescopeRecommendations, type TelescopeBudget, type TelescopeExperience, type TelescopeInterest } from "@/lib/telescope";

const INTERESTS: { label: string; value: TelescopeInterest }[] = [
  { label: "მთვარე/პლანეტები", value: "moon-planets" },
  { label: "ღრმა ცა", value: "deep-sky" },
  { label: "ასტროფოტო", value: "astrophotography" },
  { label: "ყველაფერი", value: "all" },
];

const BUDGETS: { label: string; value: TelescopeBudget }[] = [
  { label: "<200₾", value: "<200" },
  { label: "200-500₾", value: "200-500" },
  { label: "500-1000₾", value: "500-1000" },
  { label: ">1000₾", value: ">1000" },
];

const EXPERIENCES: { label: string; value: TelescopeExperience }[] = [
  { label: "დამწყები", value: "beginner" },
  { label: "საშუალო", value: "intermediate" },
  { label: "გამოცდილი", value: "experienced" },
];

export default function TelescopeFinderPage() {
  const [interest, setInterest] = useState<TelescopeInterest>("moon-planets");
  const [budget, setBudget] = useState<TelescopeBudget>("500-1000");
  const [experience, setExperience] = useState<TelescopeExperience>("beginner");

  const recommendations = useMemo(
    () => getTelescopeRecommendations({ interest, budget, experience }),
    [interest, budget, experience],
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 pb-28 sm:px-6 lg:grid lg:grid-cols-[0.85fr_1.15fr]">
      <section className="card p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-text-muted">ინსტრუმენტები</p>
        <h1 className="mt-2 text-3xl font-semibold text-gradient">ტელესკოპის ფინდერი</h1>
        <p className="mt-3 text-sm text-text-secondary">
          უპასუხე სამ მოკლე კითხვას და მიიღე შესაბამისი პროდუქტის რეკომენდაციები.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-text-muted">რა გაინტერესებს?</span>
            <select
              value={interest}
              onChange={(event) => setInterest(event.target.value as TelescopeInterest)}
              className="w-full rounded-xl border border-white/10 bg-space px-4 py-3 text-sm text-text-primary outline-none"
            >
              {INTERESTS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-text-muted">ბიუჯეტი?</span>
            <select
              value={budget}
              onChange={(event) => setBudget(event.target.value as TelescopeBudget)}
              className="w-full rounded-xl border border-white/10 bg-space px-4 py-3 text-sm text-text-primary outline-none"
            >
              {BUDGETS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-text-muted">გამოცდილება?</span>
            <select
              value={experience}
              onChange={(event) => setExperience(event.target.value as TelescopeExperience)}
              className="w-full rounded-xl border border-white/10 bg-space px-4 py-3 text-sm text-text-primary outline-none"
            >
              {EXPERIENCES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-4">
        {recommendations.map((item) => (
          <article key={item.slug} className="card flex flex-col gap-4 p-5 sm:flex-row">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.24),rgba(10,15,30,0.96))] text-xl font-semibold text-text-primary">
              {item.imageLabel}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold text-text-primary">{item.name}</h2>
                <span className="rounded-full border border-white/10 bg-space px-3 py-1 text-xs font-semibold text-gold">{item.priceLabel}</span>
              </div>
              <p className="mt-2 text-sm text-text-secondary">{item.description}</p>
              <p className="mt-3 text-sm text-text-secondary">{item.whyItFits}</p>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
              >
                ნახვა
                <ArrowRight size={16} />
              </a>
            </div>
          </article>
        ))}

        <div className="card p-5 text-sm text-text-secondary">
          <div className="flex items-center gap-2 text-text-primary">
            <Telescope size={16} className="text-accent" />
            პრაქტიკული რჩევა
          </div>
          <p className="mt-2">
            თუ ვერ არჩევ, Foreseen 80mm უნივერსალური საწყისი ვარიანტია და ღამით დაკვირვების უმეტეს სცენარებს ფარავს.
          </p>
          <Link href="/missions#submit" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-aurora">
            მისიის გვერდზე დაბრუნება
          </Link>
        </div>
      </section>
    </div>
  );
}
