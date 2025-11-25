import { useState, useMemo } from "react";
import { getTexts } from "../lang";

// Constantes de styles
const FONT_TITLE = 'Agency FB, Impact, sans-serif';
const COLOR_YELLOW = '#FFD700'; 
const COLOR_VIOLET = '#702B90'; 
const COLOR_VIOLET_LIGHT = '#8A4A9C'; 
const COLOR_WRONG = 'red';
const COLOR_CORRECT = 'lime'; // Vert/Lime pour le néon

// --- NOUVEAU COMPOSANT : Écran de jugement pour les questions Cash ---
function CashJudgeScreen({ logEntry, reviewIndex, totalReviews, onJudge, language }) {
    
    const T = getTexts(language);

    return (
        <div style={{ 
            padding: '40px', 
            color: COLOR_YELLOW, 
            width: '100%', 
            maxWidth: '600px', 
            margin: 'auto', 
            backgroundColor: COLOR_VIOLET_LIGHT, 
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
                {T.review_title}: {reviewIndex + 1} / {totalReviews}
            </h2>
            
            <p style={{ fontSize: '18px', color: COLOR_YELLOW, marginBottom: '20px' }}>{logEntry.question}</p>
            
            <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #FFD700', borderRadius: '5px', backgroundColor: COLOR_VIOLET }}>
                <p style={{ fontSize: '16px', fontWeight: 'bold', color: COLOR_YELLOW }}>{T.review_player_answer}</p>
                <p style={{ fontSize: '20px', color: 'white', marginTop: '5px' }}>{logEntry.userAnswer || "— N/A —"}</p>
            </div>
            
            <div style={{ marginBottom: '30px', padding: '10px', border: '1px solid #FFD700', borderRadius: '5px', backgroundColor: COLOR_VIOLET }}>
                <p style={{ fontSize: '16px', fontWeight: 'bold', color: COLOR_YELLOW }}>{T.review_expected_answer}</p>
                <p style={{ fontSize: '20px', color: COLOR_CORRECT, marginTop: '5px' }}>{logEntry.correctAnswer}</p>
            </div>

            <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: COLOR_YELLOW, marginBottom: '20px' }}>{T.review_judge_q}</h3>

            <div style={{ display: 'flex', gap: '20px' }}>
                <button onClick={() => onJudge(true)} style={{ 
                    flexGrow: 1, 
                    backgroundColor: COLOR_CORRECT, 
                    color: COLOR_VIOLET, 
                    padding: '12px 15px', 
                    borderRadius: '5px', 
                    fontWeight: 'bold',
                    fontSize: '18px'
                }}>
                    ✅ {T.review_valid} (+5 pts)
                </button>
                <button onClick={() => onJudge(false)} style={{ 
                    flexGrow: 1, 
                    backgroundColor: COLOR_WRONG, 
                    color: 'white', 
                    padding: '12px 15px', 
                    borderRadius: '5px', 
                    fontWeight: 'bold',
                    fontSize: '18px'
                }}>
                    ❌ {T.review_invalid} (+0 pt)
                </button>
            </div>
        </div>
    );
}


export default function Results({ score, totalQuestions, answersLog, onRestart }) { 
    
    // Récupérer la langue de la session
    const language = answersLog[0]?.language || 'Français'; 
    const T = getTexts(language);

    // 1. Initialisation des états pour la révision
    const [finalScore, setFinalScore] = useState(score);
    const [finalAnswersLog, setFinalAnswersLog] = useState(answersLog);
    const [reviewIndex, setReviewIndex] = useState(0);

    // 2. Détermination des questions Cash en attente de jugement
    const pendingCashQuestions = useMemo(() => {
        // Filtre toutes les entrées qui sont en mode 'cash' et non jugées (isCorrect: null)
        return answersLog.filter(entry => entry.mode === 'cash' && entry.isCorrect === null);
    }, [answersLog]);

    const hasPendingReviews = pendingCashQuestions.length > 0;
    const currentReview = pendingCashQuestions[reviewIndex];

    // 3. Logique de jugement et de progression
    const handleJudge = (isCorrect) => {
        if (!currentReview) return;
        
        const points = isCorrect ? 5 : 0;
        
        // Mise à jour du score
        setFinalScore(s => s + points);

        // Mise à jour du log (on marque l'entrée jugée)
        const newFinalLog = finalAnswersLog.map(entry => {
            // Trouver l'entrée à juger et mettre à jour ses points et son statut
            if (entry.mode === 'cash' && entry.isCorrect === null && entry.question === currentReview.question) { 
                return {
                    ...entry,
                    isCorrect: isCorrect,
                    points: points,
                };
            }
            return entry;
        });
        
        setFinalAnswersLog(newFinalLog);

        // Passer à la révision suivante ou terminer le jugement
        setReviewIndex(i => i + 1);
    };

    // --- AFFICHAGE DE L'ÉCRAN DE JUGEMENT (S'affiche si besoin) ---
    if (hasPendingReviews && currentReview) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
                <CashJudgeScreen
                    logEntry={currentReview}
                    reviewIndex={reviewIndex}
                    totalReviews={pendingCashQuestions.length}
                    onJudge={handleJudge}
                    language={language}
                />
            </div>
        );
    }
    
    // --- AFFICHAGE DES RÉSULTATS FINAUX (Après jugement) ---
    
    const resultScore = reviewIndex >= pendingCashQuestions.length ? finalScore : score;
    const resultLog = reviewIndex >= pendingCashQuestions.length ? finalAnswersLog : answersLog;
    
    const correctCount = resultLog.filter(a => a.isCorrect === true).length;
    
    return (
        <div style={{ 
            backgroundColor: COLOR_VIOLET_LIGHT, 
            color: 'white', 
            padding: '40px', 
            borderRadius: '10px', 
            textAlign: 'center', 
            maxWidth: '700px',
            maxHeight: '80vh', 
            overflowY: 'auto',
            border: `3px solid ${COLOR_YELLOW}`,
        }}>
            
            <h1 style={{ 
                fontSize: '40px', 
                fontWeight: 'bold', 
                color: COLOR_YELLOW, 
                fontFamily: FONT_TITLE, 
                marginBottom: '30px'
            }}>
                {T.results_title}
            </h1>

            {/* Résumé du Score */}
            <div style={{ 
                marginBottom: '40px', 
                padding: '20px', 
                backgroundColor: COLOR_VIOLET, 
                borderRadius: '8px'
            }}>
                <p style={{ fontSize: '20px', marginBottom: '10px' }}>{T.results_score}:</p>
                <p style={{ fontSize: '50px', fontWeight: 'bold', color: COLOR_YELLOW, fontFamily: FONT_TITLE }}>
                    {resultScore} {T.results_points}
                </p>
                <p style={{ fontSize: '18px' }}>
                    ({correctCount} {T.results_correct_q})
                </p>
            </div>

            {/* Détail des Réponses */}
            <h2 style={{ fontSize: '24px', color: COLOR_YELLOW, borderBottom: `1px solid ${COLOR_YELLOW}`, paddingBottom: '10px', marginBottom: '20px', fontFamily: FONT_TITLE }}>
                {T.results_detail}
            </h2>

            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                {resultLog.map((logEntry, index) => (
                    <div 
                        key={index} 
                        style={{ 
                            border: `1px solid ${COLOR_YELLOW}`, 
                            padding: '15px', 
                            borderRadius: '5px', 
                            marginBottom: '15px',
                            textAlign: 'left',
                            backgroundColor: logEntry.isCorrect === true ? 'rgba(0, 255, 0, 0.1)' : logEntry.isCorrect === false ? 'rgba(255, 0, 0, 0.1)' : COLOR_VIOLET // Gris-violet pour en attente
                        }}
                    >
                        <p style={{ fontWeight: 'bold', color: COLOR_YELLOW, marginBottom: '5px' }}>
                            {index + 1}. {logEntry.question} 
                            <span style={{ float: 'right', color: logEntry.isCorrect === true ? COLOR_CORRECT : logEntry.isCorrect === false ? COLOR_WRONG : COLOR_YELLOW }}>
                                {logEntry.points} {T.results_points}
                            </span>
                        </p>
                        
                        <p style={{ fontSize: '14px', color: COLOR_YELLOW }}>
                            {T.mode_label}: <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{logEntry.mode}</span> 
                        </p>
                        
                        <div style={{ marginTop: '10px', padding: '5px 0', borderLeft: `3px solid ${logEntry.isCorrect === true ? COLOR_CORRECT : logEntry.isCorrect === false ? COLOR_WRONG : COLOR_YELLOW}` }}>
                            <p style={{ marginBottom: '5px' }}>
                                <span style={{ fontWeight: 'bold' }}>{T.results_your_answer}:</span> 
                                <span style={{ color: 'white', marginLeft: '5px' }}>
                                    {logEntry.userAnswer || T.timeout_answer || 'N/A'}
                                </span>
                            </p>
                            
                            <p>
                                <span style={{ fontWeight: 'bold' }}>{T.results_correction}:</span> 
                                <span style={{ color: COLOR_CORRECT, marginLeft: '5px' }}>
                                    {logEntry.correctAnswer}
                                </span>
                            </p>
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
                    {T.button_restart}
                </button>
            </div>
        </div>
    );
}