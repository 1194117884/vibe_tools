/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode using class strategy
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        surface: 'hsl(var(--surface))',
        surfaceHover: 'hsl(var(--surfaceHover))',
        border: 'hsl(var(--border))',
        borderLight: 'hsl(var(--borderLight))',
        text: 'hsl(var(--text))',
        textMuted: 'hsl(var(--textMuted))',
        textDim: 'hsl(var(--textDim))',
        primary: 'hsl(var(--primary))',
        primaryText: 'hsl(var(--primaryText))',
        secondary: 'hsl(var(--secondary))',
        secondaryText: 'hsl(var(--secondaryText))',
        input: 'hsl(var(--input))',
      }
    },
  },
  plugins: [],
}
