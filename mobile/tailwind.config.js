/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#f7f7f8",
        card: "#ffffff",
        border: "#e5e5e7",
        ink: "#1a1a1a",
        // #6b6b70 on white ~= 5.9:1 contrast, passes WCAG AA (4.5:1 min) for body text.
        // Locked in /plan-design-review Pass 6 — the original #8a8a8e token failed contrast.
        muted: "#6b6b70",
        accent: "#2563eb",
        "accent-soft": "#eef3ff",
        success: "#16a34a",
        "success-soft": "#eafaf0",
        warn: "#b45309",
        "warn-soft": "#fef3e2",
      },
      borderRadius: {
        card: "18px",
        control: "14px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};
