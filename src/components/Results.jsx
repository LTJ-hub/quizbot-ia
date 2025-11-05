import { useState, useMemo } from "react";

// Couleurs et polices définies
const COLOR_YELLOW = '#FFD700'; // Jaune vif
const COLOR_VIOLET = '#702B90'; // Violet de fond
const COLOR_VIOLET_LIGHT = '#8A4A9C'; // Violet clair pour les fonds
const FONT_TITLE = 'Agency FB, Impact, sans-serif'; // Police stylisée

// --- 1. COMPOSANT : Écran de jugement pour les questions Cash (Image 1) ---
function CashJudgeScreen({ question, userAnswer, correctText, reviewIndex, totalReviews, onJudge }) {
    return (
        <div style={{ 
            padding: '40px', 
            color: COLOR_YELLOW, 
            width: '100%', 
            maxWidth: '600px', 
            margin: 'auto', 
            backgroundColor: COLOR_VIOLET_LIGHT, // Utilisation d'un violet plus clair pour le conteneur
            border: `3px solid ${COLOR_YELLOW}`,
            borderRadius: '5px'
        }}>
            <h2 style={{ 
                fontSize: '30px', 
                fontWeight: 'bold', 
                fontFamily: FONT_TITLE, 
                color: COLOR_YELLOW, 
                marginBottom: '20px',
                borderBottom: `2px solid ${COLOR_YELLOW}`,
                paddingBottom: '10px'
            }}>
                Révision Cash : {reviewIndex + 1} / {totalReviews}
            </h2>
            
            <p style={{ fontSize: '18px', color: COLOR_YELLOW, marginBottom: '20px' }}>{question}</p>
            
            <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '16px', fontWeight: 'bold', color: COLOR_YELLOW }}>Réponse du joueur :</p>
                <p style={{ fontSize: '20px', color: 'white', marginTop: '5px', padding: '5px' }}>{userAnswer || "— Aucune réponse soumise —"}</p>
            </div>
            
            <div style={{ marginBottom: '30px' }}>
                <p style={{ fontSize: '16px', fontWeight: 'bold', color: COLOR_YELLOW }}>Réponse attendue (IA) :</p>
                <p style={{ fontSize: '20px', color: 'lime', marginTop: '5px', padding: '5px' }}>{correctText}</p>
            </div>

            <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: COLOR_YELLOW, marginBottom: '20px' }}>Est-ce que la réponse est valide ?</h3>

            <div style={{ display: 'flex', gap: '20px' }}>
                <button onClick={() => onJudge(true)} style={{ 
                    flexGrow: 1, 
                    backgroundColor: 'lime', // Vert clair pour Valide
                    color: COLOR_VIOLET, 
                    padding: '12px 15px', 
                    borderRadius: '5px', 
                    fontWeight: 'bold',
                    fontSize: '18px'
                }}>
                    ✅ Valide (+5 pts)
                </button>
                <button onClick={() => onJudge(false)} style={{ 
                    flexGrow: 1, 
                    backgroundColor: 'red', 
                    color: 'white', 
                    padding: '12px 15px', 
                    borderRadius: '5px', 
                    fontWeight: 'bold',
                    fontSize: '18px'
                }}>
                    ❌ Non Valide (+0 pt)
                </button>
            </div>
        </div>
    );
}


export default function Results({ score, totalQuestions, answersLog, onRestart }) { 
    
    // 1. Logique de jugement (inchangée)
    const [finalScore, setFinalScore] = useState(score);
    const [finalAnswersLog, setFinalAnswersLog] = useState(answersLog);
    const [reviewIndex, setReviewIndex] = useState(0);

    const pendingCashQuestions = useMemo(() => {
        return answersLog.filter(entry => entry.mode === 'cash' && entry.isCorrect === null);
    }, [answersLog]);

    const hasPendingReviews = pendingCashQuestions.length > 0;
    const currentReview = pendingCashQuestions[reviewIndex];

    const handleJudge = (isCorrect) => {
        if (!currentReview) return;
        
        const points = isCorrect ? 5 : 0;
        
        setFinalScore(s => s + points);

        const newFinalLog = finalAnswersLog.map(entry => {
            if (entry === currentReview) { 
                return {
                    ...entry,
                    isCorrect: isCorrect,
                    points: points,
                };
            }
            return entry;
        });
        
        setFinalAnswersLog(newFinalLog);
        setReviewIndex(i => i + 1);
    };

    // --- AFFICHAGE DE L'ÉCRAN DE JUGEMENT (S'affiche si besoin) ---
    if (hasPendingReviews && currentReview) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
                <CashJudgeScreen
                    question={currentReview.question}
                    userAnswer={currentReview.chosen}
                    correctText={currentReview.correct}
                    reviewIndex={reviewIndex}
                    totalReviews={pendingCashQuestions.length}
                    onJudge={handleJudge}
                />
            </div>
        );
    }
    
    // --- 2. AFFICHAGE DES RÉSULTATS FINAUX (Image 2) ---
    const resultScore = reviewIndex >= pendingCashQuestions.length ? finalScore : score;
    const resultLog = reviewIndex >= pendingCashQuestions.length ? finalAnswersLog : answersLog;
    
    const correctCount = resultLog.filter(a => a.isCorrect === true).length;
    
    return (
        <div style={{ 
            padding: '30px', 
            color: COLOR_YELLOW, 
            width: '100%', 
            maxWidth: '700px', 
            margin: 'auto', 
            backgroundColor: COLOR_VIOLET_LIGHT, // Conteneur principal
            border: `3px solid ${COLOR_YELLOW}`,
            borderRadius: '5px'
        }}>
            {/* Titre Principal */}
            <h1 style={{ fontSize: '30px', fontWeight: 'bold', fontFamily: FONT_TITLE, color: COLOR_YELLOW, textAlign: 'center', marginBottom: '20px' }}>
                Résultats du QuizBot
            </h1>
            
            {/* Carte du Score Final */}
            <div style={{ 
                textAlign: 'center', 
                marginBottom: '30px', 
                padding: '20px', 
                backgroundColor: COLOR_VIOLET, // Fond plus foncé pour le score
                borderRadius: '5px'
            }}>
                <p style={{ fontSize: '20px', fontWeight: 'semibold', color: COLOR_YELLOW }}>Score Final</p>
                <p style={{ fontSize: '50px', fontWeight: 'bold', color: COLOR_YELLOW, marginTop: '10px' }}>{resultScore} pts</p>
                <p style={{ fontSize: '18px', color: COLOR_YELLOW, marginTop: '5px' }}>
                    {correctCount} / {totalQuestions} questions correctes
                </p>
            </div>

            {/* Détail des Réponses */}
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: FONT_TITLE, color: COLOR_YELLOW, marginBottom: '20px', borderBottom: `1px solid ${COLOR_YELLOW}` }}>
                Détail des Réponses
            </h2>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                {resultLog.map((answer, index) => (
                    <div key={index} style={{ 
                        padding: '15px', 
                        borderRadius: '5px', 
                        marginBottom: '15px', 
                        border: `1px solid ${COLOR_YELLOW}`,
                        backgroundColor: COLOR_VIOLET // Fond d'entrée
                    }}>
                        <p style={{ fontSize: '18px', fontWeight: 'bold', color: COLOR_YELLOW }}>Q{index + 1}: {answer.question}</p>
                        
                        <div style={{ fontSize: '14px', marginTop: '10px' }}>
                            <p style={{ color: COLOR_YELLOW }}>
                                Mode : <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{answer.mode}</span> | Points : <span style={{ fontWeight: 'bold' }}>{answer.points}</span>
                            </p>
                            
                            <p style={{ color: COLOR_YELLOW, marginTop: '5px' }}>
                                Votre Réponse : <span style={{ fontWeight: 'bold', color: 'white' }}>{answer.chosen || 'Non répondu'}</span>
                            </p>
                            
                            {/* Correction - s'affiche si la réponse est fausse ou jugée */}
                            {answer.isCorrect !== true && (
                                <p style={{ color: 'lime', marginTop: '5px' }}>
                                    Correction : <span style={{ fontWeight: 'bold', color: 'white' }}>{answer.correct}</span>
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bouton Rejouer */}
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <button 
                    onClick={onRestart}
                    style={{ 
                        backgroundColor: COLOR_YELLOW, 
                        color: COLOR_VIOLET, 
                        padding: '12px 25px', 
                        borderRadius: '5px', 
                        fontWeight: 'bold', 
                        fontSize: '20px'
                    }}
                >
                    Rejouer
                </button>
            </div>
        </div>
    );
}