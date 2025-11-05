import { useState } from "react";

export default function Home({ onStart }) {
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);

  function handleStart() {
    if (!theme.trim()) {
      setError("Veuillez entrer un thème pour commencer le quiz.");
      return;
    }
    setError(null);
    setLoading(true); 
    onStart({ theme: theme.trim() });
  }

  return (
    // Conteneur centré et sans fond (le body gère le fond violet)
    <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '100%', 
            maxWidth: '600px',
            padding: '20px'
         }}>

      {/* TITRE "QuizBot" */}
      <h1 style={{ 
            fontSize: '70px', 
            fontWeight: 'bold', 
            color: '#FFD700', 
            fontFamily: 'Agency FB, Impact, sans-serif', 
            marginBottom: '10px',
            textAlign: 'center'
         }}>
        QuizBot
      </h1>

      {/* "Choisir un thème" */}
      <label style={{ 
            fontSize: '25px', 
            color: '#FFD700', 
            fontFamily: 'Agency FB, Impact, sans-serif', 
            marginBottom: '30px',
            textAlign: 'center'
         }}>
        Choisir un thème
      </label>
      
      {/* Barre blanche et vierge pour rentrer le thème */}
      <input
        type="text"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        style={{
            width: '200px', // Taille ajustée pour coller à l'image
            height: '40px',
            backgroundColor: 'white', 
            border: 'none', 
            textAlign: 'center',
            fontSize: '18px',
            color: 'black'
        }}
        placeholder="" /* Vierge */
        aria-label="Thème du quiz"
      />
      
      {error && (
        <div style={{ color: 'red', marginTop: '20px', padding: '10px' }}>
          {error}
        </div>
      )}

      {/* Bouton "Générer et Commencer le Quiz" - Affiché uniquement si thème saisi */}
      {theme.trim() && (
        <button
          onClick={handleStart}
          style={{ 
            backgroundColor: 'white', 
            color: 'black', 
            fontWeight: 'bold', 
            padding: '10px 20px', 
            borderRadius: '5px', 
            marginTop: '30px', 
            cursor: 'pointer'
          }}
          disabled={loading}
        >
          {loading ? "Préparation du Quiz..." : "Générer et Commencer le Quiz"}
        </button>
      )}

      <p style={{ marginTop: '30px', fontSize: '14px', color: '#FFD700', opacity: 0.75, textAlign: 'center' }}>
        Un nouveau thème est généré à chaque partie.
      </p>
    </div>
  );
}