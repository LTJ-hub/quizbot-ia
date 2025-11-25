import { useState } from "react";
import { getTexts } from "../lang"; 

export default function Home({ onStart }) {
  const [theme, setTheme] = useState("");
  const [language, setLanguage] = useState("Français"); 
  // Rétablit le flow : Le mode est choisi plus tard
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);

  const T = getTexts(language); 

  function handleStart() {
    if (!theme.trim()) {
      setError(T.error_no_theme);
      return;
    }
    setError(null);
    setLoading(true); 
    
    // TRANSMETTRE LE THÈME ET LA LANGUE SEULEMENT
    onStart({ 
        theme: theme.trim(),
        language: language
    });
  }

  return (
    <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '100%', 
            maxWidth: '600px',
            padding: '20px'
         }}>

      <h1 style={{ 
            fontSize: '70px', 
            fontWeight: 'bold', 
            color: '#FFD700', 
            fontFamily: 'Agency FB, Impact, sans-serif', 
            marginBottom: '10px',
            textAlign: 'center'
         }}>
        {T.title}
      </h1>

      {/* CHOIX DE LA LANGUE */}
      <label style={{ 
            fontSize: '25px', 
            color: '#FFD700', 
            fontFamily: 'Agency FB, Impact, sans-serif', 
            marginBottom: '10px',
            marginTop: '20px',
            textAlign: 'center'
         }}>
        {T.select_language}
      </label>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{
            width: '200px',
            height: '40px',
            backgroundColor: 'white', 
            border: 'none', 
            textAlign: 'center',
            fontSize: '18px',
            color: 'black',
            marginBottom: '40px' 
        }}
        aria-label={T.select_language}
      >
        <option value="Français">Français</option>
        <option value="English">English</option>
      </select>

      {/* CHAMP DE SÉLECTION DU MODE SUPPRIMÉ ICI */}

      {/* CHOIX DU THÈME */}
      <label style={{ 
            fontSize: '25px', 
            color: '#FFD700', 
            fontFamily: 'Agency FB, Impact, sans-serif', 
            marginBottom: '10px',
            textAlign: 'center'
         }}>
        {T.select_theme}
      </label>
      <input
        type="text"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        style={{
            width: '200px', 
            height: '40px',
            backgroundColor: 'white', 
            border: 'none', 
            textAlign: 'center',
            fontSize: '18px',
            color: 'black'
        }}
        placeholder={T.placeholder_theme}
        aria-label={T.select_theme}
      />
      
      {error && (
        <div style={{ color: 'red', marginTop: '20px', padding: '10px' }}>
          {error}
        </div>
      )}

      {/* Bouton "Générer et Commencer le Quiz" */}
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
          {loading ? T.loading : T.button_start}
        </button>
      )}

      <p style={{ marginTop: '30px', fontSize: '14px', color: '#FFD700', opacity: 0.75, textAlign: 'center' }}>
        Un nouveau thème est généré à chaque partie.
      </p>
    </div>
  );
}