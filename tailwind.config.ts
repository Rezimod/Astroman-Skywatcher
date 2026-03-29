import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#050810",
        space: "#0A0F1E",
        cosmos: "#111936",
        nebula: "#1A2347",
        twilight: "#243059",
        accent: "#6366F1",
        gold: "#F59E0B",
        aurora: "#14F195",
        text: {
          primary: "#F1F5F9",
          secondary: "#CBD5E1",
          muted: "#94A3B8",
        },
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "var(--font-noto-georgian)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(99, 102, 241, 0.18)",
        gold: "0 0 32px rgba(245, 158, 11, 0.16)",
      },
      borderRadius: {
        card: "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
