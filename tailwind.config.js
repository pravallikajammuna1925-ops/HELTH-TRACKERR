/** @type {import('tailwindcss').Config} */
module.exports = {

  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Custom theme colors/settings can be added here if needed
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'indigo-600': '#4f46e5',
        'indigo-500': '#6366f1',
        'gray-900': '#111827',
        'gray-100': '#f3f4f6',
      }
    },
  },
  plugins: [],
}
