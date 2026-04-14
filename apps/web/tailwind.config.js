/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Anthropic-inspired dark theme
        background: '#0f0f0f',
        surface: '#1a1a1a',
        surfaceHover: '#252525',
        border: '#333333',
        borderLight: '#444444',
        primary: '#d97706', // Amber/gold accent
        primaryHover: '#b45309',
        text: '#f5f5f5',
        textMuted: '#a0a0a0',
        textDim: '#666666',
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}