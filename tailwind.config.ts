import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        river: {
          light: "#a6d4f2", // Light blue shade for river theme
          DEFAULT: "#5ba4cf", // Default river color
          dark: "#2c6699", // Darker blue for depth
        },
        forest: {
          light: "#a3d9a5", // Light green shade for forest theme
          DEFAULT: "#4caf50", // Default forest green
          dark: "#2d6a35", // Darker green for contrast
        },
      },
      fontFamily: {
        sans: ["Geist", "sans-serif"],
        mono: ["Geist_Mono", "monospace"],
      },
      spacing: {
        18: "4.5rem", // Custom spacing for paddings/margins
        22: "5.5rem", // Additional custom spacing
      },
      boxShadow: {
        "river-glow": "0 4px 6px rgba(91, 164, 207, 0.5)",
        "forest-depth": "0 4px 6px rgba(44, 102, 153, 0.5)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"), // Adds better default styling for forms
    require("@tailwindcss/typography"), // Enables rich text utilities
  ],
} satisfies Config;
