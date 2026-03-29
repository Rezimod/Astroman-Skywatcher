"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, CloudMoon, LayoutDashboard, Satellite, User } from "lucide-react";

import { cn } from "@/components/ui/cn";

type MobileTab = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  accent?: boolean;
};

const tabs: MobileTab[] = [
  { href: "/dashboard", label: "მთავარი", icon: LayoutDashboard },
  { href: "/missions", label: "მისიები", icon: Satellite },
  { href: "/observations/new", label: "ატვირთვა", icon: Camera, accent: true },
  { href: "/sky-tools/conditions", label: "ცა", icon: CloudMoon },
  { href: "/profile", label: "პროფილი", icon: User },
];

function isUtilityRoute(pathname: string) {
  return pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/admin");
}

export function MobileNav() {
  const pathname = usePathname();

  if (isUtilityRoute(pathname)) {
    return null;
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/8 bg-[rgba(5,8,16,0.96)] backdrop-blur-xl sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-end">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          if (tab.accent) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-1 flex-col items-center justify-end pb-2.5"
              >
                <div className="mb-1 flex h-12 w-12 -translate-y-4 items-center justify-center rounded-full border border-indigo-400/25 bg-[linear-gradient(135deg,#6366F1,#818CF8)] text-white shadow-[0_10px_28px_rgba(99,102,241,0.38)]">
                  <Icon size={20} />
                </div>
                <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-indigo-200">
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-colors",
                active ? "text-indigo-300" : "text-text-muted",
              )}
            >
              <Icon size={17} />
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em]">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
