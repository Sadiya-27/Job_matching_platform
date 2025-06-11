// tailwind.config.js
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}", // or wherever your files are
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pacific-blue-500': '#06a6c6', // 🟦 custom color name
      },
    },
  },
  plugins: [],
};
