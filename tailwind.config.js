/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}", 
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // GhostMode brand colors
        'ghost-bg': '#121214',        // Dark background
        'ghost-bg-deep': '#0A0A0C',   // Deep gray background
        'ghost-card': 'rgba(32, 32, 36, 0.75)', // Glassmorphic UI cards
        
        // Vibe-aware color accents
        'ghost-coral': '#FF6B6B',     // Friendly vibe
        'ghost-teal': '#4ECDC4',      // Helpful vibe
        'ghost-violet': '#9D50BB',    // Chaotic vibe
        'ghost-gold': '#FFD166',      // Serious vibe
        
        // UI colors
        'ghost-text': '#FFFFFF',      // Primary text
        'ghost-text-secondary': 'rgba(255, 255, 255, 0.7)', // Secondary text
        'ghost-border': 'rgba(255, 255, 255, 0.1)', // Border
        'ghost-glow': 'rgba(255, 255, 255, 0.05)', // Glow effect
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'display': ['SF Pro Display', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
    },
  },
  plugins: [],
}
