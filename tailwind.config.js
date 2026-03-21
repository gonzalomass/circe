/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{html,tsx,ts}'],
  theme: {
    extend: {
      colors: {
        accent: '#06b6d4',
        'accent-light': '#22d3ee',
        'accent-glow': 'rgba(6, 182, 212, 0.3)',
        'accent-subtle': 'rgba(6, 182, 212, 0.12)',
        'glass-bg': 'rgba(255,255,255,0.05)',
        'glass-bg-hover': 'rgba(255,255,255,0.08)',
        'glass-border': 'rgba(255,255,255,0.08)',
        surface: 'rgba(255,255,255,0.04)',
        'surface-hover': 'rgba(255,255,255,0.07)',
        bg: '#070b14',
        'bg-dark': '#050810',
        'bg-mesh-1': '#0d1a35',
        'bg-mesh-2': '#140b2b',
        'text-primary': 'rgba(255,255,255,0.92)',
        'text-secondary': 'rgba(255,255,255,0.55)',
        'text-tertiary': 'rgba(255,255,255,0.28)',
        'status-online': '#30d158',
        'status-busy': '#ffd60a',
        'status-offline': '#636366',
        'status-error': '#ff453a',
      },
      fontFamily: {
        sans: ['"SF Pro Display"', '"SF Pro Text"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"SF Mono"', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '18px',
        'xl': '24px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-lg': '0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        'accent-glow': '0 0 20px rgba(6,182,212,0.4)',
      },
      backdropBlur: {
        'glass': '20px',
      }
    }
  },
  plugins: []
};
