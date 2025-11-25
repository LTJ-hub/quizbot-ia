import { useEffect, useState, useMemo } from "react";
import { getTexts } from "../lang"; 

// Constantes de styles
const FONT_TITLE = 'Agency FB, Impact, sans-serif';
const COLOR_YELLOW = '#FFD700'; 
const COLOR_VIOLET = '#702B90'; 
const COLOR_VIOLET_LIGHT = '#8A4A9C'; 
const COLOR_WRONG = 'red';
const COLOR_CORRECT = 'green';
const MAX_TIME = 15; 

// Composant pour l'étape de réponse libre (Cash)
function CashAnswer({ question, onSubmitAnswer, language }) {
    const [answerText, setAnswerText] = useState("");
    const T = getTexts(language);

    // Dans cette version, CashAnswer soumet la réponse au Quiz.jsx pour logguer et progresser.
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <input
                type="text"
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder={T.cash_input_placeholder}
                style={{ 
                    width: '100%', 
                    maxWidth: '400px',
                    height: '40px',
                    backgroundColor: 'white', 
                    border: 'none', 
                    textAlign: 'center',
                    fontSize: '18px',
                    color: 'black',
                    marginBottom: '20px'
                }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', maxWidth: '400px' }}>
                <button
                    onClick={() => {
                        if (answerText.trim()) {
                            onSubmitAnswer(answerText); // Soumet la réponse au Quiz.jsx
                            setAnswerText(""); // Efface le champ
                        }
                    }}
                    disabled={!answerText.trim()}
                    style={{ 
                        backgroundColor: 'white', 
                        color: 'black', 
                        fontWeight: 'bold', 
                        padding: '10px 20px', 
                        borderRadius: '5px', 
                        cursor: answerText.trim() ? 'pointer' : 'default',
                        opacity: answerText.trim() ? 1 : 0.5
                    }}
                >
                    {T.cash_submit}
                </button>
                <button
                    onClick={() => setAnswerText("")}
                    style={{ 
                        backgroundColor: COLOR_WRONG, 
                        color: 'white', 
                        fontWeight: 'bold', 
                        padding: '10px 20px', 
                        borderRadius: '5px', 
                        cursor: 'pointer',
                    }}
                >
                    {T.cash_clear}
                </button>
            </div>
        </div>
    );
}


export default function Quiz({ settings, questions, onFinish, onBack }) {
    const [questionIndex, setQuestionIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(MAX_TIME);
    const [answersLog, setAnswersLog] = useState([]);
    const [isAnswered, setIsAnswered] = useState(false);
    const [currentMode, setCurrentMode] = useState(null); // Rétabli pour le choix par question

    const T = getTexts(settings.language);

    const currentQuestion = questions[questionIndex];
    
    if (!currentQuestion) {
        if (questionIndex >= questions.length && questions.length > 0) {
            const finalScore = answersLog.reduce((sum, log) => sum + log.points, 0);
            onFinish({ score: finalScore, totalQuestions: questions.length, answersLog: answersLog });
            return <div style={{ color: COLOR_YELLOW, padding: '20px' }}><p>Fin du quiz. Redirection vers les résultats...</p></div>;
        }
        return (
            <div style={{ color: COLOR_YELLOW, padding: '20px' }}>
                <p>Aucune question disponible.</p>
                <div style={{ marginTop: '10px' }}>
                    <button onClick={onBack} style={{ color: COLOR_YELLOW, border: `1px solid ${COLOR_YELLOW}`, padding: '5px 10px' }}>{T.button_cancel}</button>
                </div>
            </div>
        );
    }
    
    const { answers, correct, difficulty } = currentQuestion;

    // Calcul des réponses affichées en fonction du mode (pour 'duo')
    const displayAnswers = useMemo(() => {
        if (currentMode === 'duo') {
            const incorrectAnswers = answers.filter((_, i) => i !== correct);
            const duoOptions = [answers[correct], incorrectAnswers[Math.floor(Math.random() * incorrectAnswers.length)]];
            return duoOptions.sort(() => Math.random() - 0.5);
        }
        return answers; 
    }, [currentMode, answers, correct]);

    // Chronomètre et gestion du temps écoulé
    useEffect(() => {
        if (!currentMode || isAnswered || questionIndex >= questions.length) {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime === 1) {
                    clearInterval(timer);
                    handleAnswer(null, true); // temps écoulé (timeout)
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentMode, isAnswered, questionIndex, questions.length]); 

    // Réinitialiser le chrono au changement de question
    useEffect(() => {
        if (questionIndex < questions.length) {
            setTimeLeft(MAX_TIME);
            setIsAnswered(false);
        }
    }, [questionIndex, questions.length]); 


    // Logique de réponse pour Carré, Duo, et Timeout
    function handleAnswer(selectedIndex, isTimeout = false) {
        if (isAnswered) return;

        // Détermination des points pour Carré et Duo
        let isCorrect = false;
        let points = 0;
        let userAnswer = null;
        let selectedAnswer = null;

        if (!isTimeout) {
            // Logique Carré/Duo
            selectedAnswer = displayAnswers[selectedIndex];
            isCorrect = selectedAnswer === answers[correct];
            points = isCorrect ? (currentMode === 'carre' ? 3 : 1) : 0;
            userAnswer = selectedAnswer;
        } else {
            // Cas du Timeout
            points = 0;
            userAnswer = T.timeout_answer || 'Time Out'; 
        }

        setIsAnswered(true);

        const newLog = {
            question: currentQuestion.question,
            mode: currentMode,
            language: settings.language, 
            userAnswer: userAnswer,
            correctAnswer: answers[correct],
            isCorrect: isCorrect, // True/False
            points: points,
            difficulty: difficulty
        };

        const updatedAnswersLog = [...answersLog, newLog];
        setAnswersLog(updatedAnswersLog);

        // Progression vers la question suivante ou la fin
        setTimeout(() => {
            if (questionIndex < questions.length - 1) {
                setQuestionIndex(prevIndex => prevIndex + 1);
                setCurrentMode(null); // Réinitialiser pour le choix du mode
                setIsAnswered(false);
            } else {
                // Fin du quiz
                const finalScore = updatedAnswersLog.reduce((sum, log) => sum + log.points, 0);
                onFinish({
                    score: finalScore,
                    totalQuestions: questions.length,
                    answersLog: updatedAnswersLog,
                });
            }
        }, 2000); // Pause de 2 secondes
    }
    
    // NOUVEAU: Logique de soumission pour le mode Cash (Marquage "En attente")
    function handleCashSubmit(userAnswer) {
        if (isAnswered) return;
        
        setIsAnswered(true); // Bloque le chrono et les autres boutons

        const newLog = {
            question: currentQuestion.question,
            mode: 'cash',
            language: settings.language,
            userAnswer: userAnswer,
            correctAnswer: answers[correct],
            // MARQUAGE CRUCIAL: isCorrect=null et points=0 pour la révision finale
            isCorrect: null, 
            points: 0, 
            difficulty: difficulty
        };

        const updatedAnswersLog = [...answersLog, newLog];
        setAnswersLog(updatedAnswersLog);

        // Progression vers la question suivante ou la fin après 2 secondes
        setTimeout(() => {
            if (questionIndex < questions.length - 1) {
                setQuestionIndex(prevIndex => prevIndex + 1);
                setCurrentMode(null); 
                setIsAnswered(false);
            } else {
                // Fin du quiz
                const finalScore = updatedAnswersLog.reduce((sum, log) => sum + log.points, 0);
                onFinish({
                    score: finalScore,
                    totalQuestions: questions.length,
                    answersLog: updatedAnswersLog,
                });
            }
        }, 2000); 
    }

    // Styles dynamiques
    const chronoColor = timeLeft <= 5 && !isAnswered ? COLOR_WRONG : COLOR_YELLOW;
    
    // -------------------------------------------------------------------------
    // RENDER (Affichage)
    // -------------------------------------------------------------------------
    
    // PHASE 1: CHOIX DU MODE (Affiché si currentMode est null)
    if (!currentMode) {
        return (
            <div style={{ padding: '20px', color: COLOR_YELLOW, width: '100%', maxWidth: '600px', margin: 'auto' }}>
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '18px', color: COLOR_YELLOW, marginBottom: '5px' }}>{T.theme_label}: <strong style={{ color: COLOR_YELLOW }}>{settings.theme}</strong></div>
                    <h2 style={{ fontSize: '30px', fontWeight: 'bold', fontFamily: FONT_TITLE, color: COLOR_YELLOW, marginTop: '5px' }}>
                        Question {questionIndex + 1} / {questions.length}
                    </h2>
                </div>
                
                <p style={{ fontSize: '20px', color: COLOR_YELLOW, marginBottom: '30px', maxWidth: '80%', fontWeight: 'normal' }}>
                    {currentQuestion.question}
                </p>
                
                {/* Grille des modes de jeu */}
                <div style={{ display: 'grid', gap: '15px' }}>
                    <button onClick={() => setCurrentMode('cash')} style={{ backgroundColor: COLOR_YELLOW, color: COLOR_VIOLET, padding: '10px 15px', borderRadius: '5px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
                        {T.mode_cash}
                    </button>
                    <button onClick={() => setCurrentMode('carre')} style={{ backgroundColor: COLOR_YELLOW, color: COLOR_VIOLET, padding: '10px 15px', borderRadius: '5px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
                        {T.mode_carre}
                    </button>
                    <button onClick={() => setCurrentMode('duo')} style={{ backgroundColor: COLOR_YELLOW, color: COLOR_VIOLET, padding: '10px 15px', borderRadius: '5px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
                        {T.mode_duo}
                    </button>
                </div>
            </div>
        );
    }
    
    // PHASE 2: AFFICHAGE DE LA RÉPONSE (Si currentMode est défini)
    return (
        <div style={{ padding: '20px', color: COLOR_YELLOW, width: '100%', maxWidth: '600px', margin: 'auto' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${COLOR_YELLOW}`, paddingBottom: '10px' }}>
                <div>
                    <div style={{ fontSize: '18px', color: COLOR_YELLOW, marginBottom: '5px' }}>{T.theme_label}: <strong style={{ color: COLOR_YELLOW }}>{settings.theme}</strong> — {T.mode_label}: <strong style={{ color: COLOR_YELLOW, textTransform: 'uppercase' }}>{currentMode}</strong></div>
                    <h2 style={{ fontSize: '30px', fontWeight: 'bold', fontFamily: FONT_TITLE, color: COLOR_YELLOW, marginTop: '5px' }}>
                        Question {questionIndex + 1} / {questions.length}
                    </h2>
                    <div style={{ fontSize: '14px', color: COLOR_YELLOW }}>{T.difficulty}: {currentQuestion.difficulty ?? (questionIndex + 1)}</div>
                </div>
                
                {/* AFFICHAGE DU CHRONO */}
                <div style={{ fontSize: '40px', color: chronoColor, fontWeight: 'bold', fontFamily: FONT_TITLE }}>
                    {timeLeft}{T.timer} 
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <p style={{ fontSize: '20px', color: COLOR_YELLOW, marginBottom: '20px' }}>{currentQuestion.question}</p>

                {currentMode === "cash" ? (
                    <CashAnswer question={currentQuestion} onSubmitAnswer={handleCashSubmit} language={settings.language} />
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {displayAnswers.map((answer, index) => {
                            // Style par défaut
                            let backgroundColor = 'white';
                            let color = 'black';
                            let cursor = 'pointer';

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAnswer(index)}
                                    disabled={isAnswered}
                                    style={{
                                        backgroundColor,
                                        color,
                                        padding: '10px',
                                        borderRadius: '5px',
                                        fontWeight: 'bold',
                                        cursor: isAnswered ? 'default' : 'pointer',
                                        opacity: isAnswered ? 0.5 : 1
                                    }}
                                >
                                    {answer}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Boutons d'annulation */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingTop: '10px', borderTop: `1px solid ${COLOR_YELLOW}` }}>
                <button onClick={onBack} style={{ 
                    color: COLOR_VIOLET, 
                    backgroundColor: COLOR_YELLOW,
                    border: 'none', 
                    padding: '8px 15px', 
                    borderRadius: '5px',
                    fontWeight: 'bold'
                }}>
                    {T.button_cancel}
                </button>
            </div>
        </div>
    );
}

// Composants Helpers (inchangés)

function DuoChoice({ answers = [], correctIndex, onPick }) {
  const duo = useMemo(() => {
    const falseAnswers = answers.filter((_, i) => i !== correctIndex);
    const correctOption = answers[correctIndex];
    
    const randomFalseOption = falseAnswers[Math.floor(Math.random() * falseAnswers.length)];
    
    let list = [correctOption, randomFalseOption || answers[0]].filter((v, i, a) => a.indexOf(v) === i);
    
    if (list.length < 2 && answers.length > 1) {
        list.push(answers.find(a => a !== correctOption) || answers[0]);
        list = list.filter((v, i, a) => a.indexOf(v) === i);
    }

    list.sort(() => Math.random() - 0.5);
    return list;
  }, [answers, correctIndex]); 

  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      {duo.map((opt, i) => (
        <button 
          key={i} 
          onClick={() => onPick(opt === answers[correctIndex], opt)} 
          style={{ padding: '12px', border: `1px solid ${COLOR_YELLOW}`, borderRadius: '5px', textAlign: 'left', backgroundColor: COLOR_VIOLET_LIGHT, color: COLOR_YELLOW, cursor: 'pointer' }}
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