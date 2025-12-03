module.exports = {
  darkMode: "class", // important
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "./design/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f6ff",
          100: "#e6f0ff",
          300: "#a9d1ff",
          500: "#0b5fff",
          600: "#084bdb",
          700: "#063a9a",
        },
        glass: {
          light: "rgba(255,255,255,0.06)",
          dark: "rgba(14,16,20,0.6)",
        },
      },
      backdropBlur: {
        xs: "4px",
      },
      boxShadow: {
        glass: "0 6px 18px rgba(4,6,15,0.45)",
      },
    },
  },
  plugins: [],
};
