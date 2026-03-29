import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "./cn";

type CardProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={cn("card overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
}

export function GlassCard({ children, className, ...props }: CardProps) {
  return (
    <div className={cn("glass-card overflow-hidden rounded-card", className)} {...props}>
      {children}
    </div>
  );
}
