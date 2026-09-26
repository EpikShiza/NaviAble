/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef9ff',
          100: '#d9f1ff',
          200: '#bbe7ff',
          300: '#8ad8ff',
          400: '#53c0ff',
          500: '#2ba0ff',
          600: '#1682f5',
          700: '#126ae0',
          800: '#1456b6',
          900: '#154b8f',
        },
      },
    },
  },
  plugins: [],
};
