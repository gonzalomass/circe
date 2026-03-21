/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{html,tsx,ts}'],
  theme: {
    extend: {
      colors: {
        accent: '#7c3aed',
        'accent-light': '#8b5cf6',
        surface: '#252525',
        'surface-hover': '#2d2d2d',
        border: '#333333',
        bg: '#1a1a1a',
        'bg-dark': '#1e1e1e'
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
      }
    }
  },
  plugins: []
};
