import { useEffect, useState, useMemo } from "react"; // <-- CORRECTION: useMemo ajouté ici

const CHRONO_MAX_TIME = 15;
// Couleurs et polices définies
const COLOR_YELLOW = '#FFD700'; // Jaune vif de l'écran titre
const COLOR_VIOLET = '#702B90'; // Violet de fond
const COLOR_VIOLET_LIGHT = '#8A4A9C'; // Violet clair pour les fonds de boutons/inputs
const FONT_TITLE = 'Agency FB, Impact, sans-serif'; // Police stylisée

export default function Quiz({ settings, questions, onFinish, onBack }) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answersLog, setAnswersLog] = useState([]);
  const [currentMode, setCurrentMode] = useState(null); 
  const [timeLeft, setTimeLeft] = useState(CHRONO_MAX_TIME);
  const [cashState, setCashState] = useState({ state: 'input', userAnswer: '' }); 

  useEffect(() => {
    setIndex(0);
    setScore(0);
    setAnswersLog([]);
    setCurrentMode(null); 
    setCashState({ state: 'input', userAnswer: '' });
    setTimeLeft(CHRONO_MAX_TIME);
  }, [questions]);
  
  // LOGIQUE DU CHRONO (inchangée)
  useEffect(() => {
    let timerId;
    if (currentMode && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } 
    if (currentMode && timeLeft === 0) {
        // Logique de pénalité ou de passage à la question suivante en cas de temps écoulé
        const current = questions?.[index];
        if (current) {
            const qText = current.question ?? current.text ?? current.q ?? `Question ${index + 1}`;
            // On considère que l'utilisateur n'a pas répondu et on passe à la question suivante
            proceed(false, "Temps écoulé", currentMode); 
        }
    }
    return () => clearInterval(timerId);
  }, [currentMode, timeLeft, index, questions]); 

  useEffect(() => {
      // Réinitialiser le chrono à chaque nouvelle question
      setTimeLeft(CHRONO_MAX_TIME);
  }, [index]); 

  const current = questions?.[index];
  
  if (!current) {
    if (index >= questions.length && questions.length > 0) {
        // Le quiz est terminé, on attend la redirection vers les résultats
        return <div style={{ color: COLOR_YELLOW, padding: '20px' }}><p>Fin du quiz. Redirection vers les résultats...</p></div>;
    }
    return (
      <div style={{ color: COLOR_YELLOW, padding: '20px' }}>
        <p>Aucune question disponible. Retour à l'accueil.</p>
        <div style={{ marginTop: '10px' }}>
          <button onClick={onBack} style={{ color: COLOR_YELLOW, border: `1px solid ${COLOR_YELLOW}`, padding: '5px 10px' }}>Retour</button>
        </div>
      </div>
    );
  }

  // Valeurs défensives
  const qText = current.question ?? current.text ?? current.q ?? `Question ${index + 1}`;
  const answers = Array.isArray(current.answers) ? current.answers : (Array.isArray(current.options) ? current.options : ["Réponse 1", "Réponse 2", "Réponse 3", "Réponse 4"]);
  const correctIndex = Number.isInteger(current.correct) ? current.correct : 0;
  const correctText = answers[correctIndex];

  // Fonction proceed (inchangée)
  function proceed(isCorrect, chosen = null, modeUsed) {
    setTimeLeft(null); 
    
    const pointsForMode = modeUsed === "cash" ? 5 : modeUsed === "carre" ? 3 : 1; 

    let finalIsCorrect = isCorrect;
    let awardedPoints = isCorrect ? pointsForMode : 0;
    
    if (modeUsed === 'cash') {
        // En mode Cash, on log la réponse mais on n'attribue pas le score ici
        finalIsCorrect = null; 
        awardedPoints = 0;
    }

    const newScore = score + awardedPoints;
    setScore(newScore);

    const entry = {
      question: qText,
      chosen: chosen, 
      correct: correctText,
      isCorrect: finalIsCorrect, 
      points: awardedPoints, 
      difficulty: current.difficulty ?? index + 1,
      mode: modeUsed
    };

    const newAnswersLog = [...answersLog, entry];
    setAnswersLog(newAnswersLog); 
    
    if (modeUsed === 'cash') setCashState({ state: 'input', userAnswer: '' });

    if (index + 1 >= questions.length) {
      onFinish({ score: newScore, totalQuestions: questions.length, answersLog: newAnswersLog });
    } else {
      setIndex((i) => i + 1);
      setCurrentMode(null); 
    }
  }
  
  function handleCashSubmit(userAnswer) {
      proceed(false, userAnswer, 'cash'); 
  }

  // --- Phase 1: Choix du Mode ---
  if (!currentMode) {
    return (
      <div style={{ padding: '20px', color: COLOR_YELLOW, width: '100%', maxWidth: '600px', margin: 'auto' }}>
        <div style={{ marginBottom: '20px' }}>
            <div style={{ 
                fontSize: '18px', 
                color: COLOR_YELLOW, 
                marginBottom: '5px' 
            }}>
                Thème: <strong style={{ color: COLOR_YELLOW }}>{settings.theme}</strong>
            </div>
            
            {/* Titre Question X / Y avec la police stylisée */}
            <h2 style={{ 
                fontSize: '30px', 
                fontWeight: 'bold', 
                fontFamily: FONT_TITLE, 
                color: COLOR_YELLOW, 
                marginTop: '5px' 
            }}>
                Question {index + 1} / {questions.length}
            </h2>
            
        </div>
        
        <p style={{ 
            fontSize: '20px', 
            color: COLOR_YELLOW, 
            marginBottom: '30px', 
            maxWidth: '80%', 
            fontWeight: 'normal' 
        }}>
            {qText}
        </p>
        
        {/* Grille des modes de jeu */}
        <div style={{ display: 'grid', gap: '15px' }}>
            <button onClick={() => setCurrentMode('cash')} style={{ 
                backgroundColor: COLOR_YELLOW, 
                color: COLOR_VIOLET, 
                padding: '10px 15px', 
                borderRadius: '5px', 
                fontWeight: 'bold',
                fontFamily: 'sans-serif' // Garder une police lisible pour les boutons d'action
            }}>
                Cash (Réponse libre — 5 pts)
            </button>
            <button onClick={() => setCurrentMode('carre')} style={{ 
                backgroundColor: COLOR_YELLOW, 
                color: COLOR_VIOLET, 
                padding: '10px 15px', 
                borderRadius: '5px', 
                fontWeight: 'bold',
                fontFamily: 'sans-serif'
            }}>
                Carré (4 propositions — 3 pts)
            </button>
            <button onClick={() => setCurrentMode('duo')} style={{ 
                backgroundColor: COLOR_YELLOW, 
                color: COLOR_VIOLET, 
                padding: '10px 15px', 
                borderRadius: '5px', 
                fontWeight: 'bold',
                fontFamily: 'sans-serif'
            }}>
                Duo (2 propositions — 1 pt)
            </button>
        </div>

        {/* Le texte "Score actuel (masqué jusqu'à la fin)" est SUPPRIMÉ */}
      </div>
    );
  }
  
  // --- Phase 2: Affichage de la Réponse ---
  const chronoColor = timeLeft <= 5 ? 'red' : COLOR_YELLOW;
  
  return (
    <div style={{ padding: '20px', color: COLOR_YELLOW, width: '100%', maxWidth: '600px', margin: 'auto' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${COLOR_YELLOW}`, paddingBottom: '10px' }}>
        <div>
            <div style={{ fontSize: '18px', color: COLOR_YELLOW, marginBottom: '5px' }}>Thème: <strong style={{ color: COLOR_YELLOW }}>{settings.theme}</strong> — Mode: <strong style={{ color: COLOR_YELLOW, textTransform: 'uppercase' }}>{currentMode}</strong></div>
            
            {/* Titre Question X / Y avec la police stylisée */}
            <h2 style={{ fontSize: '30px', fontWeight: 'bold', fontFamily: FONT_TITLE, color: COLOR_YELLOW, marginTop: '5px' }}>
                Question {index + 1} / {questions.length}
            </h2>
            
            <div style={{ fontSize: '14px', color: COLOR_YELLOW }}>Difficulté: {current.difficulty ?? (index + 1)}</div>
        </div>
        
        {/* AFFICHAGE DU CHRONO */}
        <div style={{ fontSize: '40px', color: chronoColor, fontWeight: 'bold', fontFamily: FONT_TITLE }}>
            {timeLeft}s
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <p style={{ fontSize: '20px', color: COLOR_YELLOW, marginBottom: '20px' }}>{qText}</p>

        {currentMode === "cash" && (
          <CashAnswer onInputSubmit={handleCashSubmit} /> 
        )}

        {(currentMode === "carre" || currentMode === "duo") && (
            <MultipleChoiceWrapper 
                mode={currentMode} 
                options={answers} 
                correctIndex={correctIndex} 
                onPick={(isCorrect, chosen) => proceed(isCorrect, chosen, currentMode)}
            />
        )}
      </div>

      {/* Boutons d'annulation et score affiché en bas de page pour debug (masqué dans la version finale si besoin) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: `1px solid ${COLOR_YELLOW}` }}>
        <div style={{ color: COLOR_YELLOW, fontSize: '16px', opacity: 0.7 }}>Score actuel : {score}</div>
        <button onClick={onBack} style={{ 
            color: COLOR_VIOLET, 
            backgroundColor: COLOR_YELLOW,
            border: 'none', 
            padding: '8px 15px', 
            borderRadius: '5px',
            fontWeight: 'bold'
        }}>
            Annuler Quiz
        </button>
      </div>
    </div>
  );
}

/* --- Helpers Modules (mis à jour pour les styles) --- */

function CashAnswer({ onInputSubmit }) {
  const [value, setValue] = useState("");
  
  return (
    <>
      <input 
        value={value} 
        onChange={(e) => setValue(e.target.value)} 
        style={{ 
            width: '100%', 
            padding: '10px', 
            border: `1px solid ${COLOR_YELLOW}`, 
            borderRadius: '5px', 
            backgroundColor: COLOR_VIOLET_LIGHT, 
            color: COLOR_YELLOW, 
            marginBottom: '10px' 
        }} 
        placeholder="Écris ta réponse..." 
      />
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => {
            if (value.trim()) {
                onInputSubmit(value);
                setValue("");
            }
          }}
          style={{ 
            flexGrow: 1, 
            backgroundColor: COLOR_YELLOW, 
            color: COLOR_VIOLET, 
            padding: '10px', 
            borderRadius: '5px', 
            fontWeight: 'bold' 
          }}
        >
          Soumettre
        </button>
        <button 
          onClick={() => { setValue(""); }} 
          style={{ 
            flexGrow: 1, 
            color: COLOR_YELLOW, 
            border: `1px solid ${COLOR_YELLOW}`, 
            padding: '10px', 
            borderRadius: '5px' 
          }}
        >
          Effacer
        </button>
      </div>
    </>
  );
}

function DuoChoice({ answers = [], correctIndex, onPick }) {
  // --- CORRECTION: UTILISATION DE useMemo POUR STABILISER LES OPTIONS ---
  const duo = useMemo(() => {
    const falseAnswers = answers.filter((_, i) => i !== correctIndex);
    const correctOption = answers[correctIndex];
    
    // Sélectionne une fausse réponse aléatoire (si disponible)
    const randomFalseOption = falseAnswers[Math.floor(Math.random() * falseAnswers.length)];
    
    // Construit le tableau Duo, filtre les doublons, et s'assure qu'il y a 2 options
    let list = [correctOption, randomFalseOption || answers[0]].filter((v, i, a) => a.indexOf(v) === i);
    
    // S'assurer qu'il y a 2 éléments si possible 
    if (list.length < 2 && answers.length > 1) {
        list.push(answers.find(a => a !== correctOption) || answers[0]);
        list = list.filter((v, i, a) => a.indexOf(v) === i);
    }

    // Mélange l'ordre pour ne pas toujours avoir la bonne réponse en premier
    list.sort(() => Math.random() - 0.5);
    return list;
  }, [answers, correctIndex]); // Ne se re-calcule que si la question change

  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      {duo.map((opt, i) => (
        <button 
          key={i} 
          // Ajout de la fonction fléchée pour passer opt en argument à onPick
          onClick={() => onPick(opt === answers[correctIndex], opt)} 
          style={{ 
            padding: '12px', 
            border: `1px solid ${COLOR_YELLOW}`, 
            borderRadius: '5px', 
            textAlign: 'left', 
            backgroundColor: COLOR_VIOLET_LIGHT, 
            color: COLOR_YELLOW,
            cursor: 'pointer'
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function MultipleChoiceWrapper({ mode, options, correctIndex, onPick }) {
    if (mode === 'duo') {
        return <DuoChoice answers={options} correctIndex={correctIndex} onPick={onPick} />;
    }
    // Mode 'carre'
    return (
        <div style={{ display: 'grid', gap: '10px' }}>
            {options.map((opt, i) => (
                <button 
                  key={i} 
                  onClick={() => onPick(i === correctIndex, options[i])} 
                  style={{ 
                    padding: '12px', 
                    border: `1px solid ${COLOR_YELLOW}`, 
                    borderRadius: '5px', 
                    textAlign: 'left', 
                    backgroundColor: COLOR_VIOLET_LIGHT, 
                    color: COLOR_YELLOW,
                    cursor: 'pointer'
                  }}
                >
                    {opt}
                </button>
            ))}
        </div>
    );
}