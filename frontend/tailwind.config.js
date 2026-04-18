/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { mono: ['"Courier New"', 'monospace'] },
      colors: {
        bg:      '#0d0f0e',
        bg2:     '#151816',
        bg3:     '#1c1f1d',
        bg4:     '#242724',
        border:  '#2a2e2b',
        border2: '#353a36',
      },
    },
  },
  plugins: [],
}
