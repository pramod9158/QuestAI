/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#7C3AED', light: '#A78BFA', dark: '#5B21B6' },
        blue: { game: '#3B82F6', light: '#93C5FD', dark: '#1D4ED8' },
        success: { DEFAULT: '#10B981', light: '#6EE7B7', dark: '#047857' },
        warning: { DEFAULT: '#F59E0B', light: '#FCD34D', dark: '#D97706' },
        cream: { DEFAULT: '#F9FAFB', dark: '#F3F4F6' },
        pixel: {
          purple: '#7C3AED',
          blue: '#3B82F6',
          green: '#10B981',
          orange: '#F59E0B',
          pink: '#EC4899',
          red: '#EF4444',
          yellow: '#F59E0B',
          dark: '#1E1B4B',
          darker: '#0F0A2E',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        game: ['"Fredoka One"', 'cursive'],
        body: ['Nunito', 'sans-serif'],
      },
      boxShadow: {
        pixel: '4px 4px 0px 0px rgba(0,0,0,0.8)',
        'pixel-lg': '6px 6px 0px 0px rgba(0,0,0,0.8)',
        'pixel-purple': '4px 4px 0px 0px #5B21B6',
        'pixel-blue': '4px 4px 0px 0px #1D4ED8',
        'pixel-green': '4px 4px 0px 0px #047857',
        'pixel-orange': '4px 4px 0px 0px #D97706',
        'pixel-red': '4px 4px 0px 0px #991B1B',
      },
      animation: {
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        wiggle: 'wiggle 0.3s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'pixel-flash': 'pixelFlash 0.3s steps(2) infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'pop': 'pop 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'spin-slow': 'spin 3s linear infinite',
        'shake': 'shake 0.4s ease-in-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(124,58,237,0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(124,58,237,0.9), 0 0 40px rgba(124,58,237,0.5)' },
        },
        pixelFlash: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        glow: {
          '0%': { textShadow: '0 0 10px #7C3AED' },
          '100%': { textShadow: '0 0 20px #7C3AED, 0 0 40px #3B82F6' },
        },
      },
      backgroundImage: {
        'pixel-grid': "url(\"data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='16' height='16' fill='%237C3AED' fill-opacity='0.05'/%3E%3Crect x='16' y='16' width='16' height='16' fill='%237C3AED' fill-opacity='0.05'/%3E%3C/svg%3E\")",
        'star-field': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='white' fill-opacity='0.5'/%3E%3Ccircle cx='80' cy='40' r='1.5' fill='white' fill-opacity='0.7'/%3E%3Ccircle cx='50' cy='80' r='1' fill='white' fill-opacity='0.4'/%3E%3Ccircle cx='10' cy='70' r='0.5' fill='white' fill-opacity='0.6'/%3E%3Ccircle cx='90' cy='10' r='1' fill='white' fill-opacity='0.5'/%3E%3C/svg%3E\")",
      },
      borderWidth: { '3': '3px' },
      screens: { xs: '360px' },
    },
  },
  plugins: [],
};
