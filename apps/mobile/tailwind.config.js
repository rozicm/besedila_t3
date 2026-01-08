/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#0F0F10",
        card: "#FFFFFF",
        "card-foreground": "#0F0F10",
        primary: {
          DEFAULT: "#FB8500",
          foreground: "#F9F9F8",
        },
        secondary: {
          DEFAULT: "#F6F6F5",
          foreground: "#261914",
        },
        muted: {
          DEFAULT: "#F6F6F5",
          foreground: "#6E6965",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#F9F9F8",
        },
        border: "#E8E5E3",
        blue: "#3B82F6",
        green: "#10B981",
        purple: "#8B5CF6",
        orange: "#F97316",
        red: "#EF4444",
        yellow: "#EAB308",
      },
    },
  },
  plugins: [],
};

