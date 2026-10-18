/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          950: 'rgb(var(--color-studio-950) / <alpha-value>)',
          900: 'rgb(var(--color-studio-900) / <alpha-value>)',
          850: 'rgb(var(--color-studio-850) / <alpha-value>)',
          800: 'rgb(var(--color-studio-800) / <alpha-value>)',
          700: 'rgb(var(--color-studio-700) / <alpha-value>)',
          600: 'rgb(var(--color-studio-600) / <alpha-value>)',
          500: 'rgb(var(--color-studio-500) / <alpha-value>)',
        },
        wave: {
          cyan: '#00f2fe',
          teal: '#4facfe',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}

