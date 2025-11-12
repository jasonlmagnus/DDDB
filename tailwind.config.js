/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'magnus': {
          coral: 'var(--color-magnus-coral)',
          'coral-light': 'var(--color-magnus-coral-light)',
          'coral-dark': 'var(--color-magnus-coral-dark)',
          green: 'var(--color-magnus-green)',
          'green-light': 'var(--color-magnus-green-light)',
          'green-dark': 'var(--color-magnus-green-dark)',
          dark: 'var(--color-magnus-dark)',
          'dark-light': 'var(--color-magnus-dark-light)',
        },
        'fear': {
          bg: 'var(--color-fear-bg)',
          border: 'var(--color-fear-border)',
          text: 'var(--color-fear-text)',
          icon: 'var(--color-fear-icon)',
        },
        'value': {
          bg: 'var(--color-value-bg)',
          border: 'var(--color-value-border)',
          text: 'var(--color-value-text)',
          icon: 'var(--color-value-icon)',
        },
        'reality': {
          bg: 'var(--color-reality-bg)',
          border: 'var(--color-reality-border)',
          text: 'var(--color-reality-text)',
          icon: 'var(--color-reality-icon)',
        },
        'info': {
          bg: 'var(--color-info-bg)',
          border: 'var(--color-info-border)',
        },
      },
    },
  },
  plugins: [],
}

