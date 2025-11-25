// src/App.jsx (Intégralité)

import { useState } from "react";
import Home from "./components/Home";
import Quiz from "./components/Quiz";
import Results from "./components/Results";
import { generateQuestions } from "./openai"; 
import { getTexts } from "./lang"; // <-- AJOUTÉ pour les messages de chargement

export default function App() {
  const [screen, setScreen] = useState("home"); 
  // settings contient maintenant { theme, language, mode }
  const [settings, setSettings] = useState(null); 
  const [questions, setQuestions] = useState([]);
  const [result, setResult] = useState(null); 

  // Récupère les textes (utilise settings.language si disponible, sinon 'Français')
  const T = getTexts(settings?.language);

  async function handleStart(cfg) {
    // cfg contient maintenant { theme, language, mode }
    setSettings(cfg);
    setScreen("loading");
    
    try {
      // Le mode est maintenant dans cfg.mode, mais on utilise seulement theme et language pour la génération
      const qs = await generateQuestions(cfg.theme, cfg.mode, cfg.language); 
      
      if (!Array.isArray(qs) || qs.length === 0 || !qs[0].question) {
           throw new Error("Questions generated are empty or malformed.");
      }

      console.log("DEBUG: Questions prêtes, démarrage du quiz.");
      setQuestions(qs);
      setResult(null); 
      setScreen("quiz");
    } catch (err) {
      console.error("Erreur lors de generateQuestions:", err);
      // Utilisation du message traduit
      alert(T.error_general); 
      setScreen("home");
    }
  }

  function handleFinish(res) {
    setResult(res);
    setScreen("results");
  }

  function handleRetry() {
      setScreen("home");
      setResult(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"> 
      
      {/* 1. Écran d'Accueil */}
      {screen === "home" && <Home onStart={handleStart} />}
      
      {/* 2. Écran de Chargement */}
      {screen === "loading" && (
          <div style={{ backgroundColor: '#702B90', padding: '20px', textAlign: 'center' }}>
              <h1 style={{ color: '#FFD700', fontSize: '30px', fontFamily: 'Agency FB, Impact' }}>QuizBot</h1>
              <div style={{ color: '#FFD700' }}>{T.loading}</div>
          </div>
      )}
      
      {/* 3. Écran du Quiz (Jeu) */}
      {screen === "quiz" && questions.length > 0 && (
        <Quiz 
          settings={settings} // Transmet toutes les options (theme, language, mode)
          questions={questions} 
          onFinish={handleFinish} 
          onBack={handleRetry} 
        />
      )}
      
      {/* 4. Écran des Résultats */}
      {screen === "results" && result && (
        <Results 
          score={result.score} 
          totalQuestions={result.totalQuestions} 
          answersLog={result.answersLog} 
          onRestart={handleRetry} 
        />
      )}
      
      {/* Fallback en cas d'erreur dans le flux */}
      {screen === "quiz" && questions.length === 0 && (
          <div style={{ backgroundColor: '#702B90', padding: '20px', color: '#FFD700', textAlign: 'center' }}>
             <p>Erreur: Aucune question disponible. <button onClick={handleRetry} style={{ color: '#FFD700', textDecoration: 'underline' }}>{T.button_restart}</button></p>
          </div>
      )}
    </div>
  );
}