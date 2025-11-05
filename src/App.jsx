import { useState } from "react";
import Home from "./components/Home";
import Quiz from "./components/Quiz";
import Results from "./components/Results";
import { generateQuestions } from "./openai"; 

export default function App() {
  const [screen, setScreen] = useState("home"); 
  const [settings, setSettings] = useState(null); 
  const [questions, setQuestions] = useState([]);
  const [result, setResult] = useState(null); 

  async function handleStart(cfg) {
    setSettings(cfg);
    setScreen("loading");
    
    try {
      const qs = await generateQuestions(cfg.theme, 'carre'); 
      
      if (!Array.isArray(qs) || qs.length === 0 || !qs[0].question) {
           throw new Error("Questions generated are empty or malformed.");
      }

      console.log("DEBUG: Questions prêtes, démarrage du quiz.");
      setQuestions(qs);
      setResult(null); 
      setScreen("quiz");
    } catch (err) {
      console.error("Erreur lors de generateQuestions:", err);
      alert("Erreur lors de la génération des questions. Vérifiez le quota OpenAI ou la console.");
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
    // Centrage de l'application (min-h-screen et flex items-center restent car ils sont dans le code précédent)
    <div className="min-h-screen flex items-center justify-center p-6"> 
      
      {screen === "home" && <Home onStart={handleStart} />}
      
      {screen === "loading" && (
          <div style={{ backgroundColor: '#702B90', padding: '20px', textAlign: 'center' }}>
              <h1 style={{ color: '#FFD700', fontSize: '30px', fontFamily: 'Agency FB, Impact' }}>QuizBot</h1>
              <div style={{ color: '#FFD700' }}>🧠 Génération des questions en cours...</div>
          </div>
      )}
      
      {screen === "quiz" && questions.length > 0 && (
        <Quiz 
          settings={settings} 
          questions={questions} 
          onFinish={handleFinish} 
          onBack={handleRetry} 
        />
      )}
      
      {screen === "results" && result && (
        <Results 
          score={result.score} 
          totalQuestions={result.totalQuestions} 
          answersLog={result.answersLog} 
          onRestart={handleRetry} 
        />
      )}
      
      {screen === "quiz" && questions.length === 0 && (
          <div style={{ backgroundColor: '#702B90', padding: '20px', color: '#FFD700', textAlign: 'center' }}>
             <p>Erreur: Aucune question disponible. <button onClick={handleRetry} style={{ color: '#FFD700', textDecoration: 'underline' }}>Retour</button></p>
          </div>
      )}
    </div>
  );
}