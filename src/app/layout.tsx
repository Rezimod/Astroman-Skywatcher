import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_Georgian, Space_Grotesk } from "next/font/google";

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
  title: "Astroman Skywatcher",
  description: "Unified Astroman astronomy, missions, and community platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ka">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${notoSansGeorgian.variable} bg-void text-text-primary antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
