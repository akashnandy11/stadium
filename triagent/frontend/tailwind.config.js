/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { dark: '#0D1B2A', card: '#16243A', elevated: '#1E2F47' },
        cyan:   { DEFAULT: '#00C8FF', dim: '#0099CC', glow: 'rgba(0,200,255,0.15)' },
        orange: { DEFAULT: '#E8541A', dim: '#B8430F', glow: 'rgba(232,84,26,0.15)' },
        green:  { DEFAULT: '#1DB870', dim: '#178A53', glow: 'rgba(29,184,112,0.15)' },
        body:   '#C5D5E8',
        muted:  '#6B8BAE',
        border: 'rgba(255,255,255,0.07)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(0,200,255,0.2)',
        'orange-glow': '0 0 20px rgba(232,84,26,0.2)',
        'green-glow': '0 0 20px rgba(29,184,112,0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
