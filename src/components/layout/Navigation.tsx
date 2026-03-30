"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleUserRound, Sparkles } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import { SaturnLogo } from "@/components/shared/SaturnLogo";

const desktopNavItems = [
  { href: "/dashboard", label: "მთავარი" },
  { href: "/missions", label: "მისიები" },
  { href: "/gallery", label: "გალერეა" },
  { href: "/leaderboard", label: "ლიდერბორდი" },
  { href: "/sky-tools/conditions", label: "ცის პირობები" },
] as const;

function isUtilityRoute(pathname: string) {
  return pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/admin");
}

export function Navigation() {
  const pathname = usePathname();

  if (isUtilityRoute(pathname)) {
    return null;
  }

  return (
    <header className="glass-nav sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <SaturnLogo width={28} height={28} />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-[0.16em] text-white uppercase">
              ასტრომანი
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
              კოსმოსური პლატფორმა
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {desktopNavItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors",
                  active
                    ? "border-accent/25 bg-accent/12 text-white"
                    : "border-transparent text-text-muted hover:border-white/10 hover:bg-white/5 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Badge tone="success" className="hidden sm:inline-flex">
            თბილისი
          </Badge>
          <ButtonLink
            href="/profile"
            variant="secondary"
            size="sm"
            className="hidden sm:inline-flex rounded-full px-3"
          >
            <CircleUserRound size={15} />
            პროფილი
          </ButtonLink>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-text-secondary sm:hidden">
            <CircleUserRound size={16} />
          </div>
        </div>
      </div>
      <div className="border-t border-white/6 bg-white/[0.015] px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-text-muted sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-2">
          <Sparkles size={12} className="text-gold" />
          <span>ცოცხალი ცა • მორგებული თბილისისთვის • მონაცემები ავტომატურად ახლდება</span>
        </div>
      </div>
    </header>
  );
}

export default Navigation;
