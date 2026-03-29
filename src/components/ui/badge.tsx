import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "./cn";

type BadgeTone = "accent" | "gold" | "success" | "warning" | "muted";

const toneClasses: Record<BadgeTone, string> = {
  accent: "bg-accent/12 text-indigo-200 border-accent/25",
  gold: "bg-gold/12 text-amber-200 border-gold/25",
  success: "bg-aurora/12 text-emerald-200 border-aurora/25",
  warning: "bg-amber-500/12 text-amber-200 border-amber-500/25",
  muted: "bg-white/6 text-text-secondary border-white/10",
};

type BadgeProps = PropsWithChildren<
  HTMLAttributes<HTMLSpanElement> & {
    tone?: BadgeTone;
  }
>;

export function Badge({ children, className, tone = "muted", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em]",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
