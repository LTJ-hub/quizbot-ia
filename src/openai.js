// src/openai.js

import { getLangCodeForPrompt } from "./lang"; // <-- NOUVEL IMPORT
const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";

async function callOpenAIApi(prompt) {
  // L'import dynamique est important pour les environnements de navigateur
  const OpenAI = (await import("openai")).default;
  
  const client = new OpenAI({ 
    apiKey: OPENAI_KEY,
    dangerouslyAllowBrowser: true // Permet les appels depuis le navigateur (Attention sécurité)
  });
  
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
        { 
            role: "system", 
            content: "Tu es un vérificateur de faits expert. Avant de générer la question, tu DOIS vérifier que le fait (nom, citation, date) est TRÈS précis et ne souffre d'aucune ambiguïté. Tu retournes UNIQUEMENT le tableau JSON." 
        },
        { role: "user", content: prompt }
    ],
    temperature: 0.0, // Température basse pour la précision
    response_format: { type: "json_object" }
  });
  
  const text = res.choices?.[0]?.message?.content ?? "";
  return text;
}

function mockQuestions(theme) {
  // Les mocks ont déjà une difficulté définie pour le test
  return [
    { question: `Question facile et factuelle sur ${theme} (Mock)`, answers: ["Réponse A","Réponse B","Réponse C","Réponse D"], correct: 0, difficulty: 1 },
    { question: `Question 2 non ambiguë sur ${theme} (Mock)`, answers: ["Réponse A","Réponse B","Réponse C","Réponse D"], correct: 1, difficulty: 2 },
    { question: `Question 3 sur ${theme} (Mock)`, answers: ["Réponse A","Réponse B","Réponse C","Réponse D"], correct: 2, difficulty: 3 },
    { question: `Question 4 sur ${theme} (Mock)`, answers: ["Réponse A","Réponse B","Réponse C","Réponse D"], correct: 3, difficulty: 4 },
    { question: `Question difficile, mais factuelle sur ${theme} (Mock)`, answers: ["Réponse A","Réponse B","Réponse C","Réponse D"], correct: 0, difficulty: 5 }
  ];
}

export async function generateQuestions(theme, mode = "carre", language = "Français") {
  if (!OPENAI_KEY) {
    console.warn("VITE_OPENAI_API_KEY not set — returning mock questions.");
    return mockQuestions(theme);
  }

  // Obtenir le nom de la langue à utiliser dans le prompt (ex: "French" ou "English")
  const promptLanguage = getLangCodeForPrompt(language);

  // Seed aléatoire pour la variété
  const uniqueSeed = new Date().getTime(); 

  const prompt = `
Generate exactly 5 quiz questions about "${theme}" in a single JSON array format.
All questions, answers, and content MUST be written entirely in the language: ${promptLanguage}.

Règles pour la variété (Seed: ${uniqueSeed}):
1. TU DOIS générer des questions différentes pour chaque appel unique.
2. Tu DOIS être 100% certain de l'exactitude du couple [Question / Réponse Correcte].
3. Les questions DOIVENT être factuelles et NON AMBIGUËS.
4. ÉVITE ABSOLUMENT les questions subjectives ou débattables.
5. N'utilise JAMAIS la réplique "Oh my God, they killed Kenny!" ni des questions sur l'identité de celui qui l'a prononcée. Ce fait est sujet à confusion.
6. Les questions doivent être classées par difficulté croissante (1 à 5).
7. L'array 'answers' doit contenir 4 strings uniques.

Chaque élément doit strictement suivre le schéma:
{ "question": "...", "answers": ["...","...","...","..."], "correct": 0, "difficulty": 1 }
Return ONLY the JSON array.
`;

  try {
    const text = await callOpenAIApi(prompt);
    
    // Extraction sécurisée du JSON
    const jsonTextMatch = text.match(/(\{.*\}|\[.*\])/s);
    const jsonText = jsonTextMatch ? jsonTextMatch[1] : text;
    
    let parsed;
    try {
        parsed = JSON.parse(jsonText);
    } catch(e) {
        throw new Error("Invalid JSON response from API: Could not parse.");
    }

    let qs = Array.isArray(parsed) ? parsed : [];

    // Tente de trouver un tableau dans l'objet racine si la racine est un objet
    if (qs.length === 0 && typeof parsed === 'object' && parsed !== null) {
        qs = parsed.questions || parsed.quiz || [];
    }
    
    if (!Array.isArray(qs) || qs.length === 0) {
        throw new Error("JSON parsed but did not contain a question array (qs is empty).");
    }
    
    // Normalisation et attribution de la difficulté si manquante
    const finalQuestions = qs.slice(0,5).map((q,i) => ({
      question: String(q.question || q.q || `Question ${i+1} sur ${theme}`).trim(),
      answers: (q.answers && Array.isArray(q.answers) ? q.answers.slice(0,4) : ["Réponse 1","Réponse 2","Réponse 3","Réponse 4"]),
      correct: Number.isInteger(q.correct) ? q.correct : 0,
      difficulty: Number.isInteger(q.difficulty) ? q.difficulty : (i+1) 
    }));

    // Tri par difficulté
    finalQuestions.sort((a, b) => a.difficulty - b.difficulty);

    return finalQuestions;

  } catch (err) {
    console.error("OpenAI call failed — returning mock questions", err);
    return mockQuestions(theme);
  }
}