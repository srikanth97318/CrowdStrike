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
        command: {
          bg: '#080b11',
          surface: '#0d121d',
          card: '#121826',
          cardHover: '#182133',
          border: '#1f2a3f',
          borderSubtle: '#162032',
          muted: '#8b9bb4',
          dim: '#4d5d75',
          highlight: '#1e293b',
        },
        accent: {
          cyan: '#00e5ff',
          blue: '#0284c7',
          sky: '#38bdf8',
          glow: 'rgba(0, 229, 255, 0.15)',
        },
        safety: {
          safe: '#10b981',
          safeBg: 'rgba(16, 185, 129, 0.1)',
          warning: '#f59e0b',
          warningBg: 'rgba(245, 158, 11, 0.1)',
          danger: '#ef4444',
          dangerBg: 'rgba(239, 68, 68, 0.12)',
          info: '#38bdf8',
          infoBg: 'rgba(56, 189, 248, 0.1)',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'command': '0 4px 20px -2px rgba(0, 0, 0, 0.65), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        'cyan-glow': '0 0 25px -5px rgba(0, 229, 255, 0.25)',
        'danger-glow': '0 0 25px -5px rgba(239, 68, 68, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'sweep 4s linear infinite',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
};
