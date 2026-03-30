import type { ReactNode } from "react";

import { MobileNav } from "@/components/layout/MobileNav";
import Navigation from "@/components/layout/Navigation";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navigation />
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 pb-24 sm:px-6 sm:pb-10">{children}</main>
      <MobileNav />
    </>
  );
}
