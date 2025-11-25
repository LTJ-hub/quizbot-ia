// src/lang.js

export const texts = {
    // Clés de l'interface
    fr: {
        title: "QuizBot",
        select_language: "Langue du Quiz",
        select_theme: "Choisir un thème",
        select_mode: "Choisir le mode",
        placeholder_theme: "Ex: Cinéma, Histoire, Théories économiques...",
        button_start: "Générer et Commencer le Quiz",
        
        // Modes de jeu
        mode_cash: "Cash (Réponse libre — 5 pts)",
        mode_carre: "Carré (4 propositions — 3 pts)",
        mode_duo: "Duo (2 propositions — 1 pt)",
        
        // Écran de Quiz
        difficulty: "Difficulté",
        timer: "s", // Unité du chrono
        cash_input_placeholder: "Écris ta réponse...",
        cash_submit: "Soumettre",
        cash_clear: "Effacer",
        button_cancel: "Annuler Quiz",
        timeout_answer: "Temps écoulé",
        
        // Écran de Jugement Cash
        review_title: "Révision Cash",
        review_player_answer: "Réponse du joueur :",
        review_expected_answer: "Réponse attendue (IA) :",
        review_judge_q: "Est-ce que la réponse est valide ?",
        review_valid: "Valide",
        review_invalid: "Non Valide",
        
        // Écran de Résultats
        results_title: "Résultats du QuizBot",
        results_score: "Score Final",
        results_detail: "Détail des Réponses",
        results_correct_q: "questions correctes",
        results_mode: "Mode",
        results_points: "Points",
        results_your_answer: "Votre Réponse",
        results_correction: "Correction",
        button_restart: "Rejouer",
        
        // Général
        theme_label: "Thème",
        mode_label: "Mode",
        loading: "🧠 Génération des questions en cours...",
        error_no_theme: "Veuillez entrer un thème pour commencer le quiz.",
        error_general: "Erreur lors de la génération des questions. Vérifiez le quota OpenAI ou la console."
    },
    en: {
        title: "QuizBot",
        select_language: "Quiz Language",
        select_theme: "Choose a Theme",
        select_mode: "Choose Mode",
        placeholder_theme: "Ex: Cinema, History, Economic Theories...",
        button_start: "Generate and Start Quiz",

        // Game Modes
        mode_cash: "Cash (Free response — 5 pts)",
        mode_carre: "Multiple Choice (4 options — 3 pts)",
        mode_duo: "Duo (2 options — 1 pt)",
        
        // Quiz Screen
        difficulty: "Difficulty",
        timer: "s",
        cash_input_placeholder: "Write your answer...",
        cash_submit: "Submit",
        cash_clear: "Clear",
        button_cancel: "Cancel Quiz",
        timeout_answer: "Time Out",

        // Cash Review Screen
        review_title: "Cash Review",
        review_player_answer: "Player's Answer:",
        review_expected_answer: "Expected Answer (AI):",
        review_judge_q: "Is the answer valid?",
        review_valid: "Valid",
        review_invalid: "Invalid",

        // Results Screen
        results_title: "QuizBot Results",
        results_score: "Final Score",
        results_detail: "Answer Breakdown",
        results_correct_q: "correct questions",
        results_mode: "Mode",
        results_points: "Points",
        results_your_answer: "Your Answer",
        results_correction: "Correction",
        button_restart: "Restart",
        
        // Général
        theme_label: "Theme",
        mode_label: "Mode",
        loading: "🧠 Generating questions...",
        error_no_theme: "Please enter a theme to start the quiz.",
        error_general: "Error during question generation. Check OpenAI quota or console."
    }
};

// Fonction utilitaire pour obtenir les textes, par défaut en Français
export const getTexts = (langCode) => {
    // Utilise 'fr' si le code n'est pas trouvé ou si le code est 'Français'
    const key = (langCode || 'Français').toLowerCase().startsWith('f') ? 'fr' : 
                (langCode || 'English').toLowerCase().startsWith('e') ? 'en' : 
                'fr'; // Fallback: Français
    return texts[key] || texts.fr;
};

// Fonction pour obtenir le nom de la langue en anglais pour le prompt IA (plus fiable)
export const getLangCodeForPrompt = (langCode) => {
     return (langCode || 'Français').toLowerCase().startsWith('f') ? 'French' : 'English';
}