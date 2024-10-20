/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Make sure this path includes your source files
  ],
  theme: {
    extend: {
      keyframes: {
        rotate: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(6deg)" },
        },
      },
      animation: {
        rotate: "rotate 0.3s ease-in-out",
      },
    },
  },
  plugins: [],
};
