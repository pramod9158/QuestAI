// Centralized Sparky AI Service using Gemini 2.5 Flash
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface LearningContext {
  ageGroup: '6-8' | '9-12';
  module?: string;
  lesson?: string;
  currentActivity?: string;
  question?: string; // Active quiz question
  progress?: {
    xp: number;
    level: number;
    completedCount: number;
  };
  mission?: string;
}

export interface SparkyMessage {
  role: 'user' | 'model';
  content: string;
}

// Retrieve Gemini API keys from env
const GEMINI_KEYS = [
  import.meta.env.VITE_GEMINI_API_KEY || '',
  import.meta.env.VITE_GEMINI_API_KEY_2 || '',
  import.meta.env.VITE_GEMINI_API_KEY_3 || '',
].filter(key => key !== '' && key !== 'your_gemini_api_key_from_aistudio');

let geminiKeyIndex = 0;
function getGeminiKey(): string {
  if (GEMINI_KEYS.length === 0) return '';
  return GEMINI_KEYS[geminiKeyIndex % GEMINI_KEYS.length];
}
function rotateGeminiKey() {
  geminiKeyIndex++;
}

/**
 * Builds Sparky's custom educational system instruction based on the student's context
 */
function buildSystemPrompt(context: LearningContext): string {
  const isJunior = context.ageGroup === '6-8';
  
  const ageSpecificInstructions = isJunior
    ? `INSTRUCTIONS FOR CLASSES 6-8 (Age 11-13):
- Use simple, easy-to-read language.
- Explain concepts using fun examples and everyday analogies (like pets, games, cricket, food, school buses).
- Keep explanations short and friendly (max 2-3 sentences).
- Example style: "Machine Learning is like teaching a pet to recognize a ball by showing many examples."`
    : `INSTRUCTIONS FOR CLASSES 9-12 (Age 14-17):
- Provide more detailed, comprehensive explanations.
- Introduce technical terms where appropriate (e.g. neural networks, training datasets, algorithms).
- Connect explanations to real-world applications and future career relevance (e.g. software engineering, medical AI).
- Example style: "Machine Learning is a subset of AI where systems learn patterns from data and improve predictions without explicit programming."`;

  const moduleContext = context.module ? `- Current Module: ${context.module}` : '';
  const lessonContext = context.lesson ? `- Current Lesson/Activity: ${context.lesson}` : '';
  const activityContext = context.currentActivity ? `- Current Activity: ${context.currentActivity}` : '';
  const missionContext = context.mission ? `- Active Field Mission: ${context.mission}` : '';
  const questionContext = context.question ? `- Active Quiz Question: "${context.question}"` : '';
  const progressContext = context.progress 
    ? `- Student Stats: Level ${context.progress.level}, ${context.progress.xp} XP, ${context.progress.completedCount} lessons completed` 
    : '';

  return `You are Rio, a friendly, encouraging, and curious AI learning companion/tutor for students.
Your personality: Encouraging mentor, curious explorer, never judgmental, positive, fun, and conversational.
Never sound like a dry textbook, a lecturer, or a robotic support chatbot. Use casual, child-friendly English.

Student Grade Level: ${isJunior ? 'Classes 6-8' : 'Classes 9-12'}.

${ageSpecificInstructions}

Current Learning Context (Incorporate this context directly into your answer to stay relevant to what they are seeing on screen):
${moduleContext}
${lessonContext}
${activityContext}
${missionContext}
${questionContext}
${progressContext}

Safety & Boundaries:
- Never provide harmful, inappropriate, or adult content.
- Rio is an educational AI. If the student asks questions completely unrelated to learning, science, technology, AI, design thinking, or school, politely and funly redirect them back to the learning topic!
- Keep all interactions child-safe.

Be brief and highly interactive. Encourage them to ask questions or try things!`;
}

/**
 * Sends a message sequence to Gemini 2.5 Flash using rotated API keys
 */
async function callGroqChat(
  history: SparkyMessage[],
  newMessage: string,
  systemInstruction: string
): Promise<string> {
  const keys = [
    import.meta.env.VITE_GROQ_API_KEY || '',
    import.meta.env.VITE_GROQ_API_KEY_2 || '',
  ].filter(key => key !== '' && key !== 'your_groq_api_key_from_groq_console');

  if (keys.length === 0) {
    throw new Error('No Groq keys configured for fallback.');
  }

  const messages = [
    { role: 'system', content: systemInstruction },
    ...history.map(msg => ({
      role: msg.role === 'model' ? 'assistant' as const : 'user' as const,
      content: msg.content
    })),
    { role: 'user', content: newMessage }
  ];

  for (const key of keys) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          temperature: 0.7,
        })
      });

      if (res.ok) {
        const data = await res.json();
        return data.choices[0].message.content.trim();
      }
    } catch (err) {
      console.warn("Groq fallback attempt failed:", err);
    }
  }

  throw new Error("All Groq keys failed.");
}

export async function getSparkyResponse(
  history: SparkyMessage[],
  newMessage: string,
  context: LearningContext
): Promise<string> {
  const systemInstruction = buildSystemPrompt(context);

  // 1. Try Gemini first
  const hasGeminiKeys = GEMINI_KEYS.length > 0;
  if (hasGeminiKeys) {
    for (let attempt = 0; attempt < GEMINI_KEYS.length; attempt++) {
      const activeKey = GEMINI_KEYS[(geminiKeyIndex + attempt) % GEMINI_KEYS.length];
      try {
        const genAI = new GoogleGenerativeAI(activeKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          systemInstruction,
        });

        const firstUserIdx = history.findIndex(msg => msg.role === 'user');
        const validHistory = firstUserIdx !== -1 ? history.slice(firstUserIdx) : [];

        const formattedHistory = validHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({
          history: formattedHistory,
        });

        const result = await chat.sendMessage(newMessage);
        const text = result.response.text();
        
        if (text) {
          geminiKeyIndex = (geminiKeyIndex + attempt) % GEMINI_KEYS.length;
          return text.trim();
        }
      } catch (err) {
        console.warn(`Gemini call failed with key index ${(geminiKeyIndex + attempt) % GEMINI_KEYS.length}:`, err);
      }
    }
  }

  // 2. Fall back to Groq Llama 3.3 if Gemini failed or is rate-limited
  console.log("Gemini failed or rate-limited. Falling back to Groq Llama 3.3...");
  try {
    const groqText = await callGroqChat(history, newMessage, systemInstruction);
    return groqText;
  } catch (groqErr) {
    console.error("Groq fallback also failed:", groqErr);
  }

  rotateGeminiKey();
  throw new Error('All Gemini and Groq API endpoints failed. Please check your network or API keys.');
}
