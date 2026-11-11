import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "#F4F5F7",
          border: "#EEF0F2",
          card: "#FFFFFF",
          ink: "#111111",
          muted: "#6B7280",
          headerBg: "#F3F4F6",
        },
        sidebar: {
          bg: "#111111",
          hover: "#1F1F1F",
          activePill: "#E5E5E5",
          activeText: "#111111",
          text: "#E5E5E5",
          border: "#222222",
        },
        status: {
          success: "#16A34A",
          danger: {
            bg: "#FECACA",
            text: "#B91C1C",
          },
        },
        chart: {
          primary: "#111111",
          secondary: "#4B4B4B",
          tertiary: "#8A8A8A",
          quaternary: "#D9D9DE",
        },
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.06)",
        dropdown: "0 4px 16px rgba(0, 0, 0, 0.08)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

