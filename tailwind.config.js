// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Définition de votre palette de couleurs
        primary: '#702B90', // Violet Principal
        'yellow-quizbot': '#FFD700', // Jaune vif pour le texte principal
        // Ajoutez d'autres couleurs si nécessaire
      },
      fontFamily: {
        // 'Agency FB' comme police par défaut pour certains éléments
        sans: ['"Agency FB"', 'Impact', 'Arial Black', 'sans-serif'], // Remplace la police sans-serif par défaut
      },
    },
  },
  plugins: [],
}