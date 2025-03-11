/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {keyframes: {
      'fade-bounce': { // Keyframe animation name 'fade-bounce'
        '0%, 100%': { opacity: '0', transform: 'translateY(-5px)' }, // Start and end: faded out, slightly moved up
        '50%': { opacity: '0.9', transform: 'translateY(5px)' },      // Middle: almost fully opaque, slightly moved down (bounce effect)
      },
    },
    animation: {
      'fade-bounce': 'fade-bounce 1.5s ease-in-out infinite', // Animation utility class name 'animate-fade-bounce'
    },
  },
},
  plugins: [],
}