import type { PropsWithChildren } from "react";
import clsx from "clsx";

type CardTone = "default" | "gold" | "indigo" | "aurora";

interface CardShellProps extends PropsWithChildren {
  className?: string;
  tone?: CardTone;
}

const toneClasses: Record<CardTone, string> = {
  default: "border-white/8",
  gold: "border-amber-400/20 shadow-[0_0_0_1px_rgba(245,158,11,0.06)]",
  indigo: "border-indigo-400/20 shadow-[0_0_0_1px_rgba(99,102,241,0.08)]",
  aurora: "border-emerald-400/20 shadow-[0_0_0_1px_rgba(20,241,149,0.08)]",
};

export function CardShell({ children, className, tone = "default" }: CardShellProps) {
  return (
    <div
      className={clsx(
        "rounded-card border bg-[linear-gradient(180deg,rgba(17,25,54,0.92),rgba(10,15,30,0.98))] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-5",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}
