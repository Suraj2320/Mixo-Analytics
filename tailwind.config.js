export default {
  content: ["./index.html", "./src/**/*.jsx"],
  theme: {
    extend: {
      colors: {
        midnight: "#0f172a",
        slate: {
          900: "#0f172a",
          800: "#1e293b",
          700: "#334155",
          600: "#475569",
        },
        neon: {
          purple: "#a855f7",
          green: "#10b981",
          blue: "#3b82f6",
          orange: "#f97316",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
