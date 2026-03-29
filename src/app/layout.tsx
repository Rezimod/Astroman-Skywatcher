import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_Georgian, Space_Grotesk } from "next/font/google";

import { MobileNav } from "@/components/layout/MobileNav";
import { Navigation } from "@/components/layout/Navigation";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ["georgian", "latin"],
  variable: "--font-noto-georgian",
});

export const metadata: Metadata = {
  title: "ასტრომანი",
  description: "ასტრონომიის, მისიების და საზოგადოების ერთიანი პლატფორმა.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ka" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${notoSansGeorgian.variable} bg-void text-text-primary antialiased`}
      >
        <AppProviders>
          <Navigation />
          <MobileNav />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
