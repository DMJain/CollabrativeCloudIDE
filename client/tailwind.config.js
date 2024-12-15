/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [daisyui,],
  theme: {
    daisyui: ['light'],
    extend: {},
  },  
  daisyui: {
    themes: ['lofi']
  },
  
}