/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        syncra: {
          dark: "#050505",    // Deeper black for higher contrast
          node: "#0B0E14",    // Standard surface
          surface: "#1A1D23",
          pink: "#FF2D55",
          silver: "#A0AEC0",
          glow: "rgba(255, 45, 85, 0.3)",
        },
      },
      // ✅ 3D Depth Utilities
      boxShadow: {
        'glass-sm': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.05), 0 2px 5px 0 rgba(0, 0, 0, 0.3)',
        'glass-surface': 'inset 0 1px 2px 0 rgba(255, 255, 255, 0.05), 0 15px 35px 0 rgba(0, 0, 0, 0.5)',
        'neon-pink': '0 0 20px rgba(255, 45, 85, 0.3), 0 0 40px rgba(255, 45, 85, 0.1)',
        '3d-lift': '0 20px 50px rgba(0, 0, 0, 0.5), 0 5px 15px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        // ✅ Mesh gradient for 3D space atmosphere
        'mesh-gradient': "radial-gradient(at 0% 0%, rgba(255, 45, 85, 0.08) 0, transparent 40%), radial-gradient(at 100% 100%, rgba(0, 123, 255, 0.05) 0, transparent 40%)",
        'glass-gradient': "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%)",
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      // ✅ Smooth 3D Hover Animations
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}