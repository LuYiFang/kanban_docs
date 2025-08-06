/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        "collapse-sequence": "collapseSequence 100ms ease forwards",
      },
      keyframes: {
        collapseSequence: {
          "0%": {
            maxHeight: "100%",
            maxWidth: "100%",
            opacity: 1,
          },
          "100%": {
            maxHeight: "0px",
            maxWidth: "0px",
            opacity: 0,
          },
        },
      },
    },
  },
  plugins: [],
};
