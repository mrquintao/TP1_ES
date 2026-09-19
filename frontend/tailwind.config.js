/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores personalizadas do StudySync
        primary: '#6366f1',   // indigo
        secondary: '#8b5cf6', // violet
        accent: '#06b6d4',    // cyan
      },
    },
  },
  plugins: [],
};
