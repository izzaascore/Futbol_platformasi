/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          900: '#0B0F19',
          800: '#111827',
          700: '#1F2937',
        },
        neon: {
          blue: '#00f3ff',
          purple: '#bc13fe',
          green: '#00ff66'
        }
      },
      backgroundImage: {
        'space-gradient': 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)',
      }
    },
  },
  plugins: [],
}
