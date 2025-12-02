module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "./design/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          500: "#0b5fff",
          600: "#084bdb",
        },
      },
    },
  },
  plugins: [],
};
