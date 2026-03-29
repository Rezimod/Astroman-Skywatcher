"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CloudMoon,
  Compass,
  Crown,
  Loader2,
  MoonStar,
  Sparkles,
  Target,
  Telescope,
  Trophy,
  Users,
} from "lucide-react";

import { SaturnLogo } from "@/components/shared/SaturnLogo";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, GlassCard } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/components/ui/cn";

type SkyPreview = {
  cloudCover?: number;
  temperature?: number;
  moonPhaseName?: string;
  moonIllumination?: number;
  bestWindow?: string;
  score?: number;
  visiblePlanets?: Array<{ name: string; altitude: number }>;
};

type LeaderboardRow = {
  username: string;
  points: number;
  level: number;
};

type MissionPreview = {
  title: string;
  points: number;
  difficulty: "easy" | "medium" | "hard";
};

const defaultSky: SkyPreview = {
  cloudCover: 32,
  temperature: 11,
  moonPhaseName: "მზარდი ნახევარმთვარე",
  moonIllumination: 48,
  bestWindow: "21:30–23:40",
  score: 78,
  visiblePlanets: [
    { name: "ვენერა", altitude: 18 },
    { name: "იუპიტერი", altitude: 42 },
    { name: "მარსი", altitude: 27 },
  ],
};

const defaultLeaderboard: LeaderboardRow[] = [
  { username: "გიორგი", points: 8450, level: 8 },
  { username: "ნინო", points: 7320, level: 7 },
  { username: "ლევანი", points: 6800, level: 7 },
  { username: "ანა", points: 5210, level: 6 },
  { username: "თამარ", points: 4980, level: 5 },
];

const defaultMissions: MissionPreview[] = [
  { title: "მთვარის დეტალური ფოტო", points: 100, difficulty: "easy" },
  { title: "იუპიტერის თანამგზავრები", points: 200, difficulty: "medium" },
  { title: "მილქი ვეის კადრი", points: 400, difficulty: "hard" },
];

function scoreTone(score?: number) {
  if (!score) return "text-text-secondary";
  if (score >= 70) return "text-aurora";
  if (score >= 40) return "text-gold";
  return "text-rose-300";
}

export default function Home() {
  const [sky, setSky] = useState<SkyPreview | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>(defaultLeaderboard);
  const [missions, setMissions] = useState<MissionPreview[]>(defaultMissions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [skyRes, leaderboardRes, missionsRes] = await Promise.allSettled([
          fetch("/api/sky/conditions", { cache: "no-store" }).then((res) => res.json()),
          fetch("/api/leaderboard", { cache: "no-store" }).then((res) => res.json()),
          fetch("/api/missions", { cache: "no-store" }).then((res) => res.json()),
        ]);

        if (!active) {
          return;
        }

        if (skyRes.status === "fulfilled" && !skyRes.value?.error) {
          setSky({
            cloudCover: skyRes.value.cloudCover ?? defaultSky.cloudCover,
            temperature: skyRes.value.temperature ?? defaultSky.temperature,
            moonPhaseName: skyRes.value.moon?.phaseName ?? skyRes.value.moonPhaseName ?? defaultSky.moonPhaseName,
            moonIllumination:
              skyRes.value.moon?.illumination ?? skyRes.value.moonIllumination ?? defaultSky.moonIllumination,
            bestWindow: skyRes.value.bestViewingWindow ?? defaultSky.bestWindow,
            score: skyRes.value.stargazingScore ?? defaultSky.score,
            visiblePlanets: (skyRes.value.planets ?? defaultSky.visiblePlanets).map((planet: { name: string; altitude: number }) => ({
              name: planet.name,
              altitude: planet.altitude,
            })),
          });
        } else {
          setSky(defaultSky);
        }

        if (leaderboardRes.status === "fulfilled" && Array.isArray(leaderboardRes.value)) {
          setLeaderboard(
            leaderboardRes.value.slice(0, 5).map((entry: { username: string; points: number; level?: number }) => ({
              username: entry.username,
              points: entry.points,
              level: entry.level ?? 1,
            })),
          );
        }

        if (missionsRes.status === "fulfilled" && Array.isArray(missionsRes.value)) {
          setMissions(
            missionsRes.value.slice(0, 3).map((mission: { title: string; points: number; difficulty?: "easy" | "medium" | "hard" }) => ({
              title: mission.title,
              points: mission.points,
              difficulty: mission.difficulty ?? "easy",
            })),
          );
        }
      } catch {
        if (active) {
          setSky(defaultSky);
          setLeaderboard(defaultLeaderboard);
          setMissions(defaultMissions);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="relative overflow-hidden bg-void">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.10),transparent_26%)]" />
      <div className="absolute left-[-10%] top-[-8%] h-72 w-72 rounded-full bg-indigo-500/12 blur-3xl" />
      <div className="absolute bottom-[-8%] right-[-10%] h-80 w-80 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-24 pt-6 sm:px-6 sm:pb-16">
        <section className="grid items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <Badge tone="accent" className="inline-flex">
              <Sparkles size={11} />
              თბილისი, საქართველო
            </Badge>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <SaturnLogo width={42} height={42} />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-text-muted">
                    ასტრომანი
                  </p>
                  <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
                    ვარსკვლავები შენ ხელთ
                  </h1>
                </div>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-text-secondary sm:text-base">
                ცის მდგომარეობა, მისიები, გალერეა და გეიმიფიკაცია ერთ სივრცეში. ეს
                აპი აერთიანებს დაკვირვების რეალურ მონაცემებს და ამ ვიზუალურ სისტემას.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ButtonLink href="/dashboard" size="lg">
                მთავარ დაფაზე
                <ArrowRight size={16} />
              </ButtonLink>
              <ButtonLink href="/missions" variant="secondary" size="lg">
                <Target size={16} />
                მისიები
              </ButtonLink>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <Card className="p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">მონაცემები</p>
                <p className="mt-2 text-2xl font-semibold text-white">რეალური</p>
                <p className="mt-1 text-xs text-text-secondary">სერვერიდან და ცის მოდელიდან</p>
              </Card>
              <Card className="p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">ლოკაცია</p>
                <p className="mt-2 text-2xl font-semibold text-white">თბილისი</p>
                <p className="mt-1 text-xs text-text-secondary">41.7151, 44.8271</p>
              </Card>
              <Card className="p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted">ფოკუსი</p>
                <p className="mt-2 text-2xl font-semibold text-white">ღამე</p>
                <p className="mt-1 text-xs text-text-secondary">ცა, მისია, ჯილდო</p>
              </Card>
            </div>
          </div>

          <GlassCard className="relative p-5 shadow-glow">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-text-muted">
                  ცოცხალი პრევიუ
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">დღევანდელი ცა</h2>
              </div>
              {loading ? (
                <Loader2 size={16} className="animate-spin text-indigo-300" />
              ) : (
                <Badge tone="success">ახლა</Badge>
              )}
            </div>

            {!sky ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <div className="grid grid-cols-3 gap-3">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-[auto,1fr] gap-4">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.18),rgba(10,15,30,0.88))]">
                    <div className="text-center">
                      <div className={cn("text-4xl font-semibold", scoreTone(sky.score))}>
                        {sky.score ?? "—"}
                      </div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-text-muted">
                        ქულა
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <CloudMoon size={15} />
                        ღრუბლიანობა
                      </div>
                      <span className="font-semibold text-white">{sky.cloudCover ?? "—"}%</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <MoonStar size={15} />
                        მთვარე
                      </div>
                      <span className="font-semibold text-white">{sky.moonPhaseName ?? "—"}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Telescope size={15} />
                        ფანჯარა
                      </div>
                      <span className="font-semibold text-white">{sky.bestWindow ?? "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {(sky.visiblePlanets ?? []).slice(0, 3).map((planet) => (
                    <div key={planet.name} className="rounded-2xl border border-white/8 bg-white/4 p-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">{planet.name}</p>
                      <div className="mt-2 h-2 rounded-full bg-white/8">
                        <div
                          className="h-2 rounded-full bg-[linear-gradient(90deg,#6366F1,#F59E0B)]"
                          style={{ width: `${Math.max(18, Math.min(planet.altitude * 2, 100))}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-text-secondary">{planet.altitude}°</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-4">
          {[
            { icon: BadgeCheck, label: "რეალური მონაცემები", value: "Sky + Open-Meteo" },
            { icon: Compass, label: "საიდუმლო გზა", value: "მისიები და ჯილდოები" },
            { icon: Trophy, label: "რეგულარული პროგრესი", value: "ქულა, დონე, ბეჯები" },
            { icon: Users, label: "საზოგადოება", value: "ლიდერბორდი და გალერეა" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/12 text-indigo-200">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="mt-1 text-sm text-text-secondary">{item.value}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-text-muted">როგორ მუშაობს</p>
                <h2 className="mt-1 text-xl font-semibold text-white">ოთხი ნაბიჯი</h2>
              </div>
              <Badge tone="gold">მიიღე ქულა</Badge>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: Target,
                  title: "1. აირჩიე მისია",
                  text: "იპოვე ობიექტი, შეარჩიე სირთულე და შეაგროვე საჭირო ქულები.",
                },
                {
                  icon: Telescope,
                  title: "2. ატვირთე ფოტო",
                  text: "გააგზავნე დაკვირვება ტელეფონით ან კამერით და მიუთითე დეტალები.",
                },
                {
                  icon: BadgeCheck,
                  title: "3. გადამოწმება",
                  text: "ადმინისტრატორი ან ავტორიზებული პროცესები ადასტურებს შედეგს.",
                },
                {
                  icon: Crown,
                  title: "4. მოიგე ჯილდო",
                  text: "მიიღე ქულა, ბეჯები, დონე და ადგილი ლიდერბორდზე.",
                },
              ].map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/12 text-indigo-200">
                        <Icon size={18} />
                      </div>
                      <p className="font-semibold text-white">{step.title}</p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-text-secondary">{step.text}</p>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-text-muted">ლიდერბორდი</p>
                <h2 className="mt-1 text-xl font-semibold text-white">ტოპ 5</h2>
              </div>
              <ButtonLink href="/leaderboard" variant="secondary" size="sm">
                სრული სია
                <ArrowRight size={14} />
              </ButtonLink>
            </div>
            <div className="mt-5 space-y-3">
              {leaderboard.map((user, index) => (
                <div
                  key={user.username}
                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold",
                      index === 0
                        ? "border-gold/30 bg-gold/12 text-amber-100"
                        : index === 1
                          ? "border-white/15 bg-white/8 text-slate-200"
                          : index === 2
                            ? "border-orange-400/25 bg-orange-500/12 text-orange-100"
                            : "border-white/10 bg-white/6 text-text-secondary",
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{user.username}</p>
                      <p className="text-xs text-text-muted">დონე {user.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm text-gold">{user.points} ქულა</p>
                    <p className="text-xs text-text-muted">დაკვირვება</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-text-muted">მისიები</p>
                <h2 className="mt-1 text-xl font-semibold text-white">დღევანდელი არჩევანი</h2>
              </div>
              <Badge tone="accent">3 აქტიური</Badge>
            </div>
            <div className="mt-5 space-y-3">
              {missions.map((mission) => (
                <div key={mission.title} className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{mission.title}</p>
                      <p className="mt-1 text-sm text-text-secondary">{mission.points} ქულა</p>
                    </div>
                    <Badge tone={mission.difficulty === "easy" ? "success" : mission.difficulty === "medium" ? "accent" : "gold"}>
                      {mission.difficulty === "easy" ? "მარტივი" : mission.difficulty === "medium" ? "საშუალო" : "რთული"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-text-muted">შემდეგი ნაბიჯი</p>
                <h2 className="mt-1 text-xl font-semibold text-white">გადადი დაკვირვებაზე</h2>
              </div>
              <Sparkles size={18} className="text-gold" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <ButtonLink href="/observations/new" size="lg">
                ატვირთე ფოტო
                <ArrowRight size={16} />
              </ButtonLink>
              <ButtonLink href="/sky-tools/conditions" variant="secondary" size="lg">
                <Telescope size={16} />
                ცის პირობები
              </ButtonLink>
            </div>
            <div className="mt-5 rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(99,102,241,0.10),rgba(10,15,30,0.90))] p-4">
              <p className="text-sm leading-7 text-text-secondary">
                რეალური sky score, მთვარის ფაზა, პლანეტების ხილვადობა და ამინდის
                ინტეგრაცია დაგეხმარება იპოვო საუკეთესო ღამე.
              </p>
            </div>
          </GlassCard>
        </section>

        <section className="mt-10">
          <Card className="border-indigo-400/20 bg-[linear-gradient(135deg,rgba(10,15,30,0.94),rgba(26,35,71,0.88))] p-6 sm:p-8">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-text-muted">შემოქმედება</p>
                <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                  ღამის ცის თამაშად ქცევა იწყება აქ
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
                  პლატფორმა მზად არის შემდეგი ეტაპისთვის: მომხმარებლის პროფილები,
                  მისიის ატვირთვა, გალერეა და sky intelligence სრულად შეერთდება ამ
                  ვიზუალურ სისტემასთან.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/register" size="lg">
                  დაწყება
                  <ArrowRight size={16} />
                </ButtonLink>
                <ButtonLink href="/dashboard" variant="secondary" size="lg">
                  <Telescope size={16} />
                  მთავარი დაფა
                </ButtonLink>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
