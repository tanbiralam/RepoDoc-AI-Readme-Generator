/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0070f3',
          dark: '#0060df',
          light: '#3291ff',
        },
        secondary: {
          DEFAULT: '#7928ca',
          dark: '#6622aa',
          light: '#8a3fd1',
        },
        github: {
          DEFAULT: '#24292e',
          hover: '#1b1f23',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
