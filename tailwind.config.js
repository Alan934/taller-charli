import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{js,ts,jsx,tsx}',
    './layouts/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1392ec',
        'primary-dark': '#0e7ccb',
        'background-light': '#f6f7f8',
        'background-dark': '#101a22',
        'surface-light': '#ffffff',
        'surface-dark': '#16232d',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        body: ['Noto Sans', 'sans-serif'],
      },
    },
  },
  plugins: [forms, containerQueries],
};
