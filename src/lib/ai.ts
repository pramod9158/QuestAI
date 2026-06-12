import { GoogleGenerativeAI } from '@google/generative-ai';

// Helper to detect keyboard mashing, spam, or random characters
export function isGibberish(text: string): boolean {
  const t = text.trim();
  if (t.length < 5) return false;
  const lower = t.toLowerCase();
  
  // 1. Repeating characters: 5+ consecutive identical characters (e.g. "aaaaa")
  if (/(.)\1{4,}/.test(lower)) return true;
  
  // 2. Starting with common test/spam keyboard sequences
  if (/^(xyz|abc|test|qwerty|asdf|zxcv|asd)/.test(lower)) return true;
  
  // 3. Repeating identical words/phrases (e.g., "phone phone phone")
  const words = lower.split(/\s+/).filter(Boolean);
  if (words.length >= 4) {
    const wordCounts: Record<string, number> = {};
    for (const w of words) {
      wordCounts[w] = (wordCounts[w] || 0) + 1;
    }
    const maxWordFrequency = Math.max(...Object.values(wordCounts));
    if (maxWordFrequency / words.length > 0.6) return true;
  }
  
  // 4. Vowel-to-consonant ratio check (keyboard mashing usually has low vowel density)
  let totalLetters = 0;
  let vowels = 0;
  for (const char of lower) {
    if (/[a-z]/.test(char)) {
      totalLetters++;
      if (/[aeiouy]/.test(char)) {
        vowels++;
      }
    }
  }
  if (totalLetters > 12) {
    const vowelRatio = vowels / totalLetters;
    if (vowelRatio < 0.20) return true;
  }
  
  // 5. Long words with no vowels
  for (const word of words) {
    if (word.length > 4 && !/[aeiouy]/.test(word)) {
      if (!/^\d+$/.test(word)) {
        return true;
      }
    }
  }
  
  return false;
}

// Low-level Groq HTTP Client calling the Chat Completions endpoint
async function callGroqAPI(
  apiKey: string,
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  jsonMode: boolean,
  temperature: number = 0.7,
  modelOverride?: string
): Promise<string> {
  const body: any = {
    model: modelOverride || 'llama-3.1-8b-instant',
    messages,
    temperature,
    max_tokens: 1024,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Groq API returned an empty response');
  }
  return content.trim();
}

// Low-level Gemini Fallback Client (using the existing @google/generative-ai SDK)
async function callGeminiFallback(
  systemInstruction: string,
  userPrompt: string
): Promise<string> {
  const keys = [
    import.meta.env.VITE_GEMINI_API_KEY || '',
    import.meta.env.VITE_GEMINI_API_KEY_2 || '',
    import.meta.env.VITE_GEMINI_API_KEY_3 || '',
  ].filter(key => key !== '' && key !== 'your_gemini_api_key_from_aistudio');

  if (keys.length === 0) {
    throw new Error('No valid Gemini or Groq API keys configured');
  }

  let lastError: any = null;
  for (let i = 0; i < keys.length; i++) {
    try {
      const genAI = new GoogleGenerativeAI(keys[i]);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const fullPrompt = systemInstruction 
        ? `${systemInstruction}\n\nUser Input: ${userPrompt}` 
        : userPrompt;
      const result = await model.generateContent(fullPrompt);
      return result.response.text().trim();
    } catch (err: any) {
      console.warn(`Gemini fallback call failed with API Key index ${i}. Error:`, err);
      lastError = err;
    }
  }
  throw lastError || new Error('All Gemini API keys failed');
}

// Helper to run key rotation for a specific Groq model
async function callWithGroqKeys(
  keys: string[],
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  jsonMode: boolean,
  temperature: number,
  model: string
): Promise<string> {
  let lastError: any = null;
  for (let i = 0; i < keys.length; i++) {
    try {
      return await callGroqAPI(keys[i], messages, jsonMode, temperature, model);
    } catch (err: any) {
      console.warn(`Groq API call failed with API Key index ${i} for model ${model}. Error:`, err);
      lastError = err;
    }
  }
  throw lastError || new Error(`All Groq keys failed for model ${model}`);
}

// Key rotation wrapper that uses Groq if keys are present, otherwise falls back to Gemini
async function callWithAiRotation(
  systemInstruction: string,
  userPrompt: string,
  jsonMode: boolean,
  temperature: number = 0.7,
  modelOverride?: string
): Promise<string> {
  const geminiKeys = [
    import.meta.env.VITE_GEMINI_API_KEY || '',
    import.meta.env.VITE_GEMINI_API_KEY_2 || '',
    import.meta.env.VITE_GEMINI_API_KEY_3 || '',
  ].filter(key => key !== '' && key !== 'your_gemini_api_key_from_aistudio');

  const groqKeys = [
    import.meta.env.VITE_GROQ_API_KEY || '',
    import.meta.env.VITE_GROQ_API_KEY_2 || '',
    import.meta.env.VITE_GROQ_API_KEY_3 || '',
  ].filter(key => key !== '' && key !== 'your_groq_api_key_from_groq_console');

  // 1. Try Gemini first (extremely high rate limit on free tier)
  if (geminiKeys.length > 0) {
    try {
      return await callGeminiFallback(systemInstruction, userPrompt);
    } catch (err) {
      console.warn('Primary Gemini model call failed. Attempting Groq fallback...', err);
    }
  }

  // 2. Fallback to Groq if Gemini fails or is not configured
  if (groqKeys.length > 0) {
    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: userPrompt });

    const primaryModel = modelOverride || 'llama-3.3-70b-versatile';
    try {
      return await callWithGroqKeys(groqKeys, messages, jsonMode, temperature, primaryModel);
    } catch (err) {
      console.warn(`Groq primary model ${primaryModel} failed. Attempting Groq 8B fallback...`, err);
      if (primaryModel !== 'llama-3.1-8b-instant') {
        try {
          return await callWithGroqKeys(groqKeys, messages, jsonMode, temperature, 'llama-3.1-8b-instant');
        } catch (err8b) {
          console.warn('Groq 8B fallback failed too.', err8b);
        }
      }
    }
  }

  // 3. Last resort fallback to Gemini again (in case it was a temporary glitch)
  if (geminiKeys.length > 0) {
    return await callGeminiFallback(systemInstruction, userPrompt);
  }

  throw new Error('All configured AI endpoints and fallback models failed');
}

// Simulated fallback ideas by category (used if both Groq and Gemini APIs fail)
const FALLBACK_IDEAS: Record<string, { name: string; description: string }[]> = {
  school: [
    { name: 'Smart Homework Helper', description: 'An AI that understands your weak subjects and creates personalized exercises just for you!' },
    { name: 'Classroom Noise Monitor', description: 'AI detects when classroom noise is too high and gently reminds students, helping teachers stay focused.' },
    { name: 'Lost Item Finder', description: 'Take a photo of your school bag — AI tracks which books you packed so you never forget homework!' },
  ],
  transport: [
    { name: 'Smart Bus Tracker', description: 'AI predicts when the school bus will arrive based on traffic patterns and sends alerts to your phone.' },
    { name: 'Traffic Flow Optimizer', description: 'AI analyzes traffic near school gates and suggests the best pickup/drop-off times.' },
    { name: 'Safe Route Finder', description: 'AI maps the safest walking routes to school, avoiding dangerous crossings and heavy traffic.' },
  ],
  environment: [
    { name: 'Plant Water Reminder', description: 'AI monitors soil moisture and reminds you when your plants need watering — no more dead plants!' },
    { name: 'Forest Fire Early Warning', description: 'AI analyzes satellite images to spot forest fires before they spread, alerting firefighters in minutes.' },
    { name: 'River Pollution Detector', description: 'AI-powered sensors in rivers detect pollution levels and alert authorities immediately.' },
  ],
  health: [
    { name: 'Hospital Queue Predictor', description: 'AI predicts hospital waiting times and lets you book the least busy slots from home.' },
    { name: 'Medicine Reminder Bot', description: 'A friendly AI character reminds elderly people to take medicines at the right time every day.' },
    { name: 'Symptom Checker for Villages', description: 'AI helps people in rural areas describe symptoms in local languages and get basic health guidance.' },
  ],
  farming: [
    { name: 'Crop Disease Spotter', description: 'Farmers take photos of sick plants — AI identifies the disease and suggests the right treatment instantly!' },
    { name: 'Smart Irrigation System', description: 'AI checks weather forecasts and soil data to water crops only when needed, saving water.' },
    { name: 'Market Price Predictor', description: 'AI analyzes market trends to help farmers decide the best time to sell their crops for maximum profit.' },
  ],
  animals: [
    { name: 'Lost Pet Finder', description: 'Upload your pet\'s photo — AI scans community cameras and social media to locate missing animals.' },
    { name: 'Animal Health Monitor', description: 'AI wearable for cows and goats tracks their health and alerts farmers when an animal is sick.' },
    { name: 'Wildlife Protector', description: 'AI cameras in forests detect poachers at night and alert forest rangers immediately.' },
  ],
  sports: [
    { name: 'Cricket Coach AI', description: 'AI analyzes your batting stance using your phone camera and gives tips to improve your game!' },
    { name: 'Injury Prevention System', description: 'AI tracks how athletes move and warns coaches when a player is at risk of getting injured.' },
    { name: 'Smart Scoreboard', description: 'AI automatically tracks scores, player stats, and highlights during local cricket or football matches.' },
  ],
  home: [
    { name: 'Smart Electricity Saver', description: 'AI learns your family\'s daily routine and automatically turns off lights and fans in empty rooms.' },
    { name: 'Food Waste Reducer', description: 'AI tracks food in your fridge and suggests recipes using ingredients before they go bad.' },
    { name: 'Family Safety Guard', description: 'AI doorbell recognizes family members and alerts you on your phone when strangers approach.' },
  ],
};

// Generate AI ideas using AI or fallback to templates
export async function generateAIIdeas(problem: string, category: string): Promise<{ name: string; description: string }[]> {
  try {
    const systemPrompt = `You are a friendly AI educator for children aged 6-16 in India. 
Format your response as a JSON array with exactly 3 objects, each having:
- "name": A catchy, simple name for the AI solution (max 5 words)
- "description": A kid-friendly description of how the AI helps (max 30 words, simple language)
Only respond with the JSON array, no other text.`;

    const userPrompt = `A student has described a real-world problem: "${problem}" in the category: "${category}". Generate exactly 3 creative, simple AI-powered solutions for this problem.`;

    const text = await callWithAiRotation(systemPrompt, userPrompt, true, 0.7);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const ideas = JSON.parse(jsonMatch[0]);
      if (Array.isArray(ideas) && ideas.length === 3) return ideas;
    }
    throw new Error('Invalid JSON format returned from AI');
  } catch (err) {
    console.warn('AI generateAIIdeas failed, using fallback:', err);
    const catKey = category.toLowerCase();
    const ideas = FALLBACK_IDEAS[catKey] || FALLBACK_IDEAS['school'];
    return [...ideas].sort(() => Math.random() - 0.5).slice(0, 3);
  }
}

// Generate brainstorm project idea
export async function generateBrainstormIdea(
  category: string, problem: string, audience: string
): Promise<{ name: string; description: string; innovation_score: number }> {
  try {
    const systemPrompt = `You are a creative AI educator for children in India.
Create one exciting AI project idea. Respond ONLY with a JSON object:
{
  "name": "Project name (max 5 words)",
  "description": "How AI solves this (max 40 words, exciting and simple for kids)",
  "innovation_score": <number between 60-99>
}`;

    const userPrompt = `A student wants to solve this problem:
- Category: ${category}
- Problem: ${problem}  
- Who faces it: ${audience}`;

    const text = await callWithAiRotation(systemPrompt, userPrompt, true, 0.75);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const idea = JSON.parse(jsonMatch[0]);
      if (idea.name && idea.description) return idea;
    }
    throw new Error('Invalid JSON format returned from AI');
  } catch (err) {
    console.warn('AI generateBrainstormIdea failed, using fallback:', err);
    const probLower = problem.toLowerCase();
    let name = '';
    let description = '';
    
    if (category.toLowerCase() === 'sports') {
      if (probLower.includes('hour') || probLower.includes('short') || probLower.includes('time') || probLower.includes('duration') || probLower.includes('period')) {
        name = "Smart Scheduler AI";
        description = `AI analyzes student schedules and physical activity needs to automatically allocate and optimize sports periods for maximum active play.`;
      } else if (probLower.includes('score') || probLower.includes('stat') || probLower.includes('match') || probLower.includes('run')) {
        name = "Smart Scoreboard";
        description = `AI automatically tracks scores, player stats, and highlights during local cricket or football matches.`;
      } else {
        name = "Cricket Coach AI";
        description = `AI analyzes your batting stance using your phone camera and gives tips to improve your game!`;
      }
    } else if (category.toLowerCase() === 'school') {
      if (probLower.includes('homework') || probLower.includes('study') || probLower.includes('learn')) {
        name = "Smart Homework Helper";
        description = `An AI that understands your weak subjects and creates personalized exercises just for you!`;
      } else if (probLower.includes('noise') || probLower.includes('loud') || probLower.includes('sound')) {
        name = "Classroom Noise Monitor";
        description = `AI detects when classroom noise is too high and gently reminds students, helping teachers stay focused.`;
      } else {
        name = "Lost Item Finder";
        description = `Take a photo of your school bag — AI tracks which books you packed so you never forget homework!`;
      }
    } else if (category.toLowerCase() === 'home') {
      if (probLower.includes('electricity') || probLower.includes('power') || probLower.includes('save') || probLower.includes('light')) {
        name = "Smart Electricity Saver";
        description = `AI learns your family's daily routine and automatically turns off lights and fans in empty rooms.`;
      } else if (probLower.includes('food') || probLower.includes('waste') || probLower.includes('fridge') || probLower.includes('eat')) {
        name = "Food Waste Reducer";
        description = `AI tracks food in your fridge and suggests recipes using ingredients before they go bad.`;
      } else {
        name = "Family Safety Guard";
        description = `AI doorbell recognizes family members and alerts you on your phone when strangers approach.`;
      }
    } else if (category.toLowerCase() === 'environment') {
      if (probLower.includes('water') || probLower.includes('plant') || probLower.includes('soil')) {
        name = "Plant Water Reminder";
        description = `AI monitors soil moisture and reminds you when your plants need watering — no more dead plants!`;
      } else if (probLower.includes('fire') || probLower.includes('forest') || probLower.includes('burn')) {
        name = "Forest Fire Early Warning";
        description = `AI analyzes satellite images to spot forest fires before they spread, alerting firefighters.`;
      } else {
        name = "River Pollution Detector";
        description = `AI-powered sensors in rivers detect pollution levels and alert authorities immediately.`;
      }
    } else if (category.toLowerCase() === 'transport') {
      if (probLower.includes('bus') || probLower.includes('late') || probLower.includes('route') || probLower.includes('map')) {
        name = "Smart Bus Tracker";
        description = `AI predicts when the school bus will arrive based on traffic patterns and sends alerts to your phone.`;
      } else if (probLower.includes('traffic') || probLower.includes('jam') || probLower.includes('road')) {
        name = "Traffic Flow Optimizer";
        description = `AI analyzes traffic near school gates and suggests the best pickup/drop-off times.`;
      } else {
        name = "Safe Route Finder";
        description = `AI maps the safest walking routes to school, avoiding dangerous crossings and heavy traffic.`;
      }
    } else {
      const catIdeas = FALLBACK_IDEAS[category.toLowerCase()] || FALLBACK_IDEAS['school'];
      const pick = catIdeas[0];
      name = pick.name;
      description = pick.description;
    }

    return {
      name,
      description,
      innovation_score: Math.floor(Math.random() * 20) + 75
    };
  }
}

// Generate real-time hints and suggestions for weekly missions based on the current draft
export async function generateMissionSuggestions(
  missionTitle: string,
  missionGoal: string,
  currentDraft: string
): Promise<string[]> {
  try {
    const systemPrompt = `You are a helpful and friendly AI assistant for an educational platform teaching AI to children (aged 6-16).
Generate exactly 3 short, kid-friendly hints, ideas, or suggestions to help the child write a detailed and correct observation.
Each hint should be brief (max 15 words) and encourage critical thinking.
Respond ONLY with a JSON array of 3 strings. Example format:
["Think about how the face recognition on your parents' phone checks their eyes and face.", "Look around the kitchen: is there a smart refrigerator or microwave?", "Check your smart TV recommendations on YouTube or Netflix."]
Do not include any formatting, explanation, markdown, or other text outside the JSON array.`;

    const userPrompt = `The child is working on a weekly mission: "${missionTitle}".
The mission goal is: "${missionGoal}".
The child has written this draft observation so far: "${currentDraft || '(Empty draft - child is looking for where to start)'}".`;

    const text = await callWithAiRotation(systemPrompt, userPrompt, true, 0.7);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]);
      if (Array.isArray(suggestions) && suggestions.length > 0) {
        return suggestions;
      }
    }
    throw new Error('Invalid JSON format returned from AI');
  } catch (err) {
    console.warn('AI generateMissionSuggestions failed, using fallback:', err);
    if (missionTitle.includes('Home')) {
      return [
        "Check if your phone uses Face ID or fingerprint to unlock.",
        "Think about YouTube or Netflix showing videos they think you will like.",
        "Look for smart speakers like Alexa, Siri, or Google Assistant."
      ];
    } else if (missionTitle.includes('Time')) {
      return [
        "Observe the queue/line at the school canteen or library.",
        "Think about waiting for the school bus or sitting in traffic.",
        "Consider how a booking app or predictive timetable could tell you when to go."
      ];
    } else if (missionTitle.includes('Problem')) {
      return [
        "Look for local issues like overflowing trash bins or water leaks.",
        "Notice dark streetlights or potholes on your way home.",
        "Think about how smart cameras or sensors could alert the local authorities."
      ];
    } else {
      return [
        "Think about what computers, apps, or websites the adult uses every day.",
        "Ask them if they use spreadsheets, email, or digital records for tracking.",
        "Ask them if any smart technology helps speed up their daily tasks."
      ];
    }
  }
}

// Evaluate a child's mission submission and return score + feedback
export async function evaluateMissionSubmission(
  missionTitle: string,
  missionGoal: string,
  submissionText: string
): Promise<{ score: number; feedback: string; passed: boolean }> {
  let apiFailed = false;
  try {
    const systemPrompt = `You are a supportive, encouraging, and friendly AI educator. 
Evaluate the student's submission. Be understanding and generous, but ensure they actually attempted the challenge (not just typed random letters/spam or empty text).
CRITICAL: If the student's submission contains keyboard mashing, random characters, repetitive words, gibberish, or spam (e.g. "sf dfv dvx dfdub...", "abcabcabc", "test test test"), you MUST assign a score of 30 and output feedback explaining that they need to write a realistic observation instead of random characters.
1. Assign a score between 30 and 100:
   - 90-100: Excellent, detailed observation covering key aspects correctly.
   - 70-89: Good job, but could have added a bit more details or examples.
   - 50-69: Fair attempt, but lacks depth or misses key points of the goal.
   - 30-49: Incomplete, highly repetitive, spam, or random keyboard keys.
2. Write a warm, kid-friendly feedback note (2-3 sentences max) in simple, positive English:
   - Praise their specific effort.
   - Explain what they did well.
   - If they scored less than 95, gently suggest one thing they can add or look for next time to make it even better.

Respond ONLY with a JSON object. Format:
{
  "score": <number>,
  "feedback": "<feedback string>",
  "passed": <true/false depending on if score is >= 50>
}
Do not include any formatting, markdown, or other text outside the JSON object.`;

    const userPrompt = `- Mission Title: "${missionTitle}"
- Mission Goal: "${missionGoal}"
- Student's Submission: "${submissionText}"`;

    const text = await callWithAiRotation(systemPrompt, userPrompt, true, 0.5);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const evalResult = JSON.parse(jsonMatch[0]);
      if (typeof evalResult.score === 'number' && evalResult.feedback) {
        return {
          score: evalResult.score,
          feedback: evalResult.feedback,
          passed: evalResult.score >= 50
        };
      }
    }
    throw new Error('Invalid JSON format returned from AI');
  } catch (err) {
    console.warn('AI evaluateMissionSubmission failed, using fallback:', err);
    apiFailed = true;
  }

  // Fallback Evaluator Heuristics
  const textVal = submissionText.trim();
  const lowerText = textVal.toLowerCase();
  
  if (isGibberish(textVal)) {
    return {
      score: 30,
      feedback: apiFailed
        ? "⚠️ [API Quota Exceeded]: It looks like you typed random letters or spam. Please write a realistic observation using real words to complete the challenge!"
        : "It looks like you typed random letters or spam. Please write a realistic observation using real words to complete the challenge!",
      passed: false
    };
  }
  
  const urlRegex = /https?:\/\/[^\s]+/gi;
  const textWithoutUrls = textVal.replace(urlRegex, '').trim();
  const cleanWordCount = textWithoutUrls.split(/\s+/).filter(Boolean).length;
  const isSpam = /(.)\1{4,}/.test(lowerText) || /^(xyz|abc|test|qwerty|asdf)/.test(lowerText);

  if (textWithoutUrls.length < 15 || cleanWordCount < 3 || isSpam) {
    return {
      score: 35,
      feedback: apiFailed
        ? "⚠️ [API Quota Exceeded]: Keep trying! Please write a bit more about what you observed. Avoid using random letters, spam, or only links."
        : "Keep trying! Please write a bit more about what you observed. Avoid using random letters, spam, or only links.",
      passed: false
    };
  }

  let score = 75;
  let feedback = "Nice try! You've started listing some observations. Try adding more details and explaining how technology helps.";
  const titleLower = missionTitle.toLowerCase();
  
  if (titleLower.includes("home")) {
    const keywords = ['phone', 'mobile', 'camera', 'face id', 'fingerprint', 'alexa', 'siri', 'assistant', 'speaker', 'tv', 'television', 'refrigerator', 'fridge', 'vacuum', 'robot', 'youtube', 'netflix', 'spotify', 'light', 'bulb', 'ac', 'conditioner', 'smart', 'ai', 'algorithm', 'app', 'feed', 'recommend'];
    const matchedCount = keywords.filter(kw => lowerText.includes(kw)).length;
    if (matchedCount >= 2 && textWithoutUrls.length >= 35) {
      score = 95;
      feedback = "Fantastic work! Your observation is detailed, relevant, and demonstrates a great understanding of your home's AI features.";
    } else if (matchedCount < 2) {
      score = 45;
      feedback = "Almost there! Make sure you mention at least 2 smart/AI features or devices around your home and why they are smart.";
    }
  } else if (titleLower.includes("time") || titleLower.includes("wait")) {
    const scenarios = ['queue', 'line', 'wait', 'bus', 'traffic', 'canteen', 'lunch', 'library', 'counter', 'gate', 'office', 'register', 'store', 'shop'];
    const aiSolutions = ['predict', 'optimize', 'schedule', 'app', 'alert', 'route', 'camera', 'sensor', 'automated', 'time', 'manage'];
    const hasScenario = scenarios.some(kw => lowerText.includes(kw));
    const hasSolution = aiSolutions.some(kw => lowerText.includes(kw));
    if (hasScenario && hasSolution && textWithoutUrls.length >= 35) {
      score = 95;
      feedback = "Fantastic work! You identified waiting areas and proposed an intelligent AI solution to optimize the time.";
    } else {
      score = 45;
      feedback = "Try to explain where people wait (like canteen or bus stop) and how AI or smart apps can help predict or reduce that wait time.";
    }
  } else if (titleLower.includes("problem") || titleLower.includes("spotter")) {
    const problems = ['trash', 'waste', 'garbage', 'leak', 'water', 'light', 'streetlight', 'hole', 'road', 'traffic', 'pollution', 'broken', 'dirty', 'litter'];
    const techSolutions = ['sensor', 'camera', 'ai', 'app', 'system', 'detect', 'notify', 'alert', 'analyze', 'satellite', 'monitor'];
    const hasProblem = problems.some(kw => lowerText.includes(kw));
    const hasSolution = techSolutions.some(kw => lowerText.includes(kw));
    if (hasProblem && hasSolution && textWithoutUrls.length >= 40) {
      score = 95;
      feedback = "Excellent observation! You spotted a real local problem and thought of an automated/smart sensor way to monitor it.";
    } else {
      score = 45;
      feedback = "Please describe a local issue (like garbage or water leaks) and explain how smart technology or sensors can help solve it.";
    }
  } else if (titleLower.includes("interview") || titleLower.includes("adult")) {
    const people = ['father', 'mother', 'parent', 'teacher', 'neighbour', 'uncle', 'aunt', 'doctor', 'shopkeeper', 'adult', 'friend', 'colleague', 'he', 'she', 'they', 'mr', 'mrs', 'ms'];
    const technology = ['computer', 'laptop', 'excel', 'software', 'app', 'email', 'search', 'write', 'track', 'teach', 'sell', 'record', 'system', 'smart', 'tool', 'internet', 'ai'];
    const hasPerson = people.some(kw => lowerText.includes(kw));
    const hasTech = technology.some(kw => lowerText.includes(kw));
    if (hasPerson && hasTech && textWithoutUrls.length >= 40) {
      score = 95;
      feedback = "Great interview summary! You've successfully documented who you spoke with and the technology tools they use.";
    } else {
      score = 45;
      feedback = "Make sure you specify who you interviewed (e.g. parent, teacher) and what software, computers, or smart apps they use daily.";
    }
  } else {
    if (textWithoutUrls.length >= 25) {
      score = 90;
      feedback = "Well done! Your custom mission observation details have been logged successfully.";
    } else {
      score = 45;
      feedback = "Write down a few more details about your custom challenge observation (at least 25 characters).";
    }
  }

  if (apiFailed) {
    feedback = `⚠️ [API Quota Exceeded - Fallback Evaluator]: ${feedback}`;
  }

  return {
    score,
    feedback,
    passed: score >= 50
  };
}

// Generate parent dashboard assistant response
export async function generateParentAssistantResponse(
  studentData: {
    username: string;
    level: number;
    xp: number;
    completedLessons: number;
    completedQuests: number;
    completedMissions: number;
    inventions: { name: string; description: string; innovation_score: number }[];
    observations: { text: string; score: number; feedback: string }[];
    streak: number;
  },
  parentMessage: string
): Promise<string> {
  let apiFailed = false;
  try {
    const systemPrompt = `You are a friendly, encouraging, and knowledgeable AI educational counselor at QuestAI, a platform that teaches AI and design thinking to children.
Give a warm, personalized, and insightful response (max 4-5 sentences or a short bulleted list) in simple, supportive English.
Acknowledge their child's accomplishments (especially highlight any cool inventions or observations they submitted!).
Suggest 1 specific activity or next step they can do on the platform to continue learning.`;

    const userPrompt = `A parent wants to know about their child's progress. Here is the child's data:
- Name: ${studentData.username}
- Current Level: ${studentData.level}
- Total XP: ${studentData.xp}
- Lessons completed: ${studentData.completedLessons}/12
- Story Adventures completed: ${studentData.completedQuests}/8
- Weekly Field Missions completed: ${studentData.completedMissions}/4
- Daily streak: ${studentData.streak} days
- Brainstormed Inventions: ${JSON.stringify(studentData.inventions || [])}
- Submitted Real-world Observations: ${JSON.stringify(studentData.observations || [])}

The parent asks: "${parentMessage}"`;

    return await callWithAiRotation(systemPrompt, userPrompt, false, 0.7);
  } catch (err) {
    console.warn('AI generateParentAssistantResponse failed, using fallback:', err);
    apiFailed = true;
  }

  // Fallback summaries
  const msg = parentMessage.toLowerCase();
  const child = studentData.username || "your child";
  const inventionsCount = studentData.inventions?.length || 0;
  const observationsCount = studentData.observations?.length || 0;
  
  let fallbackAns = "";
  if (msg.includes("summarize") || msg.includes("progress") || msg.includes("report") || msg.includes("how is")) {
    fallbackAns = `Hello! ${child} is doing fantastic on QuestAI. They have reached Level ${studentData.level} with ${studentData.xp} XP! They completed ${studentData.completedLessons} lessons and ${studentData.completedQuests} Story Adventures. They've also submitted ${observationsCount} field observations and dreamed up ${inventionsCount} cool AI inventions! I suggest they try more Weekly Field Missions next to put their knowledge into practice!`;
  } else if (msg.includes("invention") || msg.includes("creative") || msg.includes("strengths") || msg.includes("invent")) {
    if (inventionsCount > 0) {
      const topInvention = studentData.inventions[0];
      fallbackAns = `QuestAI encourages creativity, and ${child} shows great innovation! They brainstormed "${topInvention.name}": ${topInvention.description}. This project has an innovation score of ${topInvention.innovation_score}%! They are great at connecting AI solutions to real-world problems.`;
    } else {
      fallbackAns = `${child} is building strong analytical skills by completing lessons. To boost their creativity, encourage them to visit the 'Brainstorm Playground' module, where they can build their own AI inventions!`;
    }
  } else {
    fallbackAns = `Hello! ${child} has earned ${studentData.xp} XP and is currently at Level ${studentData.level}. They have completed ${studentData.completedLessons} lessons, ${studentData.completedQuests} story adventures, and ${observationsCount} missions. Encourage them to keep logging in daily to maintain their ${studentData.streak}-day streak! Let me know if you want to know about their specific inventions or observations.`;
  }
  return apiFailed ? `⚠️ [API Quota Exceeded - Fallback Counselor]: ${fallbackAns}` : fallbackAns;
}

// Evaluate a child's reflection on story adventures
export async function evaluateStoryReflection(
  questTitle: string,
  questionText: string,
  reflectionText: string
): Promise<{ feedback: string; bonusXp: number }> {
  let apiFailed = false;
  try {
    const systemPrompt = `You are a supportive, high-energy robot tutor companion for children learning AI.
The child is doing a story adventure quest titled "${questTitle}".
They just read a scenario and were asked: "${questionText}".
Evaluate their reflection. Be extremely encouraging and positive.
CRITICAL: If the child's reflection consists of random character typing, gibberish, keyboard mashing, or repetitive spam, you MUST assign a bonusXp of 0 and feedback asking them to try again with real words.
1. Provide a kid-friendly validation message (max 15-20 words). Acknowledge something they said.
2. Decide a bonus XP (between 5 and 15, or 0 if gibberish/spam) depending on the effort and quality of the response.

Respond ONLY with a JSON object. Format:
{
  "feedback": "<friendly validation message>",
  "bonusXp": <number between 5 and 15, or 0 if gibberish>
}
Do not include any formatting, markdown, or other text outside the JSON object.`;

    const userPrompt = `The child typed this reflection: "${reflectionText}"`;

    const text = await callWithAiRotation(systemPrompt, userPrompt, true, 0.7);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const evalResult = JSON.parse(jsonMatch[0]);
      if (evalResult.feedback && typeof evalResult.bonusXp === 'number') {
        return {
          feedback: evalResult.feedback,
          bonusXp: evalResult.bonusXp
        };
      }
    }
    throw new Error('Invalid JSON format returned from AI');
  } catch (err) {
    console.warn('AI evaluateStoryReflection failed, using fallback:', err);
    apiFailed = true;
  }

  // Fallback
  const cleanText = reflectionText.trim();
  if (isGibberish(cleanText)) {
    return {
      feedback: apiFailed
        ? "⚠️ [API Quota Exceeded]: Please type a real answer with real words instead of random letters so we can award you bonus XP!"
        : "Please type a real answer with real words instead of random letters so we can award you bonus XP!",
      bonusXp: 0
    };
  }
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  let feedback = "Spot on! That is a very creative way to think about this problem and use smart tech!";
  let bonusXp = 10;
  
  if (wordCount < 3) {
    feedback = "Nice try! Try writing a bit more about how you would solve this next time!";
    bonusXp = 5;
  }
  
  if (apiFailed) {
    feedback = `⚠️ [API Quota Exceeded - Fallback]: ${feedback}`;
  }
  
  return {
    feedback,
    bonusXp
  };
}

// Ask QuestBot about a specific lesson
export async function askLessonTutor(
  lessonTitle: string,
  lessonSubtitle: string,
  question: string
): Promise<string> {
  let apiFailed = false;
  try {
    const systemPrompt = `You are a supportive, high-energy robot tutor companion for kids learning AI.
Provide a kid-friendly, simple, and exciting answer (max 3 sentences) in plain English. Use emojis!`;
    const userPrompt = `The child is studying the lesson: "${lessonTitle}" (${lessonSubtitle}). They asked this question: "${question}".`;

    return await callWithAiRotation(systemPrompt, userPrompt, false, 0.7);
  } catch (err) {
    console.warn('AI askLessonTutor failed, using fallback:', err);
    apiFailed = true;
  }
  const fallbackAns = "Beep boop! That's a great question about " + lessonTitle + "! AI is like a smart helper that learns from patterns to solve it. Keep exploring! 🤖✨";
  return apiFailed ? `⚠️ [API Quota Exceeded - Fallback Answer]: ${fallbackAns}` : fallbackAns;
}

// Ask general QuestBot questions on the Home screen
export async function askHomeQuestBot(question: string): Promise<string> {
  let apiFailed = false;
  try {
    const systemPrompt = `You are QuestBot, a friendly and funny robot assistant for kids learning AI.
Provide an exciting, simple, and encouraging response (max 3 sentences). Explain any complex terms in super simple terms that a 7-year-old would understand. Use fun emojis!`;
    const userPrompt = `The child asks: "${question}".`;

    return await callWithAiRotation(systemPrompt, userPrompt, false, 0.7);
  } catch (err) {
    console.warn('AI askHomeQuestBot failed, using fallback:', err);
    apiFailed = true;
  }
  const fallbackAns = "Beep boop! I am QuestBot. I love learning about AI! Try asking me things like 'What is a sensor?' or 'How does AI recognize faces?'. 🤖";
  return apiFailed ? `⚠️ [API Quota Exceeded - Fallback Answer]: ${fallbackAns}` : fallbackAns;
}

// Generate custom parent challenge
export async function generateParentCustomMission(
  topic: string
): Promise<{ title: string; description: string; tasks: string[]; xp_reward: number }> {
  try {
    const systemPrompt = `You are an educational designer at QuestAI. A parent wants to generate a custom, real-world AI exploration mission for their child.
Generate a creative, safe, and exciting 3-step mission for the child. 
Respond ONLY with a JSON object format:
{
  "title": "A short catchy title (max 4 words)",
  "description": "A short mission goal for the child (max 25 words)",
  "tasks": [
    "Step 1 task description (max 15 words)",
    "Step 2 task description (max 15 words)",
    "Step 3 task description (max 15 words)"
  ],
  "xp_reward": 80
}
Do not include any formatting, markdown, or other text outside the JSON object.`;

    const userPrompt = `The parent's suggested topic is: "${topic}".`;

    const text = await callWithAiRotation(systemPrompt, userPrompt, true, 0.75);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid JSON format returned from AI');
  } catch (err) {
    console.warn('AI generateParentCustomMission failed, using fallback:', err);
    return {
      title: `Explore ${topic || 'Technology'}`,
      description: `Observe and study how ${topic || 'technology'} is used in your daily life.`,
      tasks: [
        `Find one example of ${topic || 'technology'} at home.`,
        `Explain to your parent how it works.`,
        `Write down one way AI could make it even smarter.`
      ],
      xp_reward: 75
    };
  }
}

// Generate a professional AI cognitive learning diagnostic summary for parents
export async function generateParentSkillAnalysis(
  studentData: {
    username: string;
    level: number;
    xp: number;
    completedLessons: number;
    completedQuests: number;
    completedMissions: number;
    skills: { computational: number; observation: number; creative: number; ethics: number; solving: number };
  }
): Promise<string> {
  try {
    const systemPrompt = `You are a professional educational psychologist and child learning consultant at QuestAI.
Analyze the child's learning metrics and provide a warm, detailed, and highly constructive diagnostic report for their parents.
Write a 3-4 sentence professional assessment summarizing:
1. The child's strengths based on their highest skills.
2. A specific area of digital literacy or cognitive skill they can develop further.
3. An encouraging next step or topic for parent-child interaction (e.g. brainstorming together or discussing tech bias).
Maintain a supportive, premium, and professional tone that proves the educational value of the platform.`;

    const userPrompt = `Child's details:
- Name: ${studentData.username}
- Current Level: ${studentData.level} (Total XP: ${studentData.xp})
- Completed Lessons: ${studentData.completedLessons}/12, Quests: ${studentData.completedQuests}/8, Missions: ${studentData.completedMissions}/4
- Evaluated Skill Ratings (out of 100):
  * Computational Thinking & Logic: ${studentData.skills.computational}/100
  * Real-world Tech Observation: ${studentData.skills.observation}/100
  * Creative AI Innovation: ${studentData.skills.creative}/100
  * AI Ethics & Digital Citizenship: ${studentData.skills.ethics}/100
  * Critical Problem Solving: ${studentData.skills.solving}/100`;

    return await callWithAiRotation(systemPrompt, userPrompt, false, 0.7);
  } catch (err) {
    console.warn('AI generateParentSkillAnalysis failed, using fallback:', err);
    const { username, skills } = studentData;
    const highestSkill = Object.entries(skills).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    let strengthDesc = "analytical computational thinking";
    if (highestSkill === 'observation') strengthDesc = "keen observation of real-world smart technology";
    else if (highestSkill === 'creative') strengthDesc = "imaginative AI design thinking and creative problem formulation";
    else if (highestSkill === 'ethics') strengthDesc = "ethical mindfulness and digital safety awareness";
    else if (highestSkill === 'solving') strengthDesc = "determined critical thinking and systematic problem-solving";

    return `Based on our system evaluations, ${username} is demonstrating exceptional capability in ${strengthDesc}, showing a natural ability to connect learning to practical concepts. To expand their cognitive horizon, we recommend reinforcing their computational logic by starting advanced lesson modules. Try asking ${username} about a simple sensor in your home today to spark a fun, shared technology discussion!`;
  }
}

// Prompt engineering playground helper
export async function testPromptPlayground(
  systemPrompt: string,
  userPrompt: string,
  temperature: number
): Promise<string> {
  let apiFailed = false;
  try {
    return await callWithAiRotation(systemPrompt, userPrompt, false, temperature);
  } catch (err) {
    console.warn('AI testPromptPlayground failed, using fallback:', err);
    apiFailed = true;
  }
  const cleanUser = userPrompt.toLowerCase();
  let fallbackAns = `I am acting according to your system rule: "${systemPrompt}". You asked me: "${userPrompt}". Since the API is offline, here is a helpful simulation!`;
  
  const isSvgRequest = systemPrompt.toLowerCase().includes("svg") || systemPrompt.toLowerCase().includes("vector") || systemPrompt.toLowerCase().includes("artist");

  if (isSvgRequest) {
    let shapeColor = "#EC4899";
    let faceEmoji = "🐱";
    if (cleanUser.includes("frog") || cleanUser.includes("toad") || cleanUser.includes("green")) {
      shapeColor = "#10B981";
      faceEmoji = "🐸";
    } else if (cleanUser.includes("robot") || cleanUser.includes("machine") || cleanUser.includes("bot")) {
      shapeColor = "#8B5CF6";
      faceEmoji = "🤖";
    } else if (cleanUser.includes("fish") || cleanUser.includes("water") || cleanUser.includes("sea") || cleanUser.includes("blue")) {
      shapeColor = "#3B82F6";
      faceEmoji = "🐟";
    } else if (cleanUser.includes("star") || cleanUser.includes("sky") || cleanUser.includes("space") || cleanUser.includes("yellow")) {
      shapeColor = "#FFD60A";
      faceEmoji = "⭐";
    } else if (cleanUser.includes("flower") || cleanUser.includes("garden") || cleanUser.includes("red")) {
      shapeColor = "#EF4444";
      faceEmoji = "🌸";
    }

    fallbackAns = `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="15" width="70" height="70" rx="12" fill="${shapeColor}" stroke="black" stroke-width="2"/>
      <circle cx="50" cy="50" r="24" fill="white" stroke="black" stroke-width="1.5"/>
      <text x="50" y="57" font-size="20" text-anchor="middle">${faceEmoji}</text>
      <text x="50" y="93" font-size="5" font-family="monospace" fill="white" text-anchor="middle">OFFLINE CANVAS ENGINE</text>
    </svg>`;
  } else if (systemPrompt.toLowerCase().includes("emoji")) {
    fallbackAns = "🪐🤖✨🚀🎨";
  } else if (systemPrompt.toLowerCase().includes("pirate")) {
    fallbackAns = `Ahoy matey! Ye ask about "${userPrompt}". By the powers, code be our gold! Arrr!`;
  } else if (systemPrompt.toLowerCase().includes("robot")) {
    fallbackAns = `BEEP BOOP. Processing: "${userPrompt}". Completed. BEEP.`;
  }

  if (apiFailed) {
    if (isSvgRequest) {
      return fallbackAns;
    }
    return `⚠️ [API Quota Exceeded - Fallback Simulator]: ${fallbackAns}`;
  }
  return fallbackAns;
}

// Evaluate a child's prompt inside the Prompt Lab
export async function evaluatePromptLab(
  challengeInstruction: string,
  studentPrompt: string
): Promise<{ score: number; feedback: string; tip: string }> {
  let apiFailed = false;
  try {
    const systemPrompt = `You are a friendly, encouraging AI companion evaluating a student's prompt engineering challenge.
Respond ONLY with a JSON object. Format:
{
  "score": <number>,
  "feedback": "<friendly feedback>",
  "tip": "<kid-friendly tip to make prompt better>"
}`;
    const userPrompt = `Challenge description/instruction: "${challengeInstruction}"
Student's prompt input: "${studentPrompt}"`;

    const text = await callWithAiRotation(systemPrompt, userPrompt, true, 0.6);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (typeof parsed.score === 'number' && parsed.feedback && parsed.tip) {
        return parsed;
      }
    }
    throw new Error('Invalid JSON format returned from AI');
  } catch (err) {
    console.warn('AI evaluatePromptLab failed, using fallback:', err);
    apiFailed = true;
  }

  // Fallback
  const length = studentPrompt.trim().length;
  let score = 50;
  let feedback = 'Nice try! Sparky thinks you are starting to write a great prompt.';
  let tip = 'Try to describe the role, style, or output constraints you want the AI to follow!';

  if (isGibberish(studentPrompt)) {
    score = 40;
    feedback = 'It looks like you typed some random characters. Try typing a real instruction for the AI companion!';
    tip = 'Think of the prompt as talking to a helpful friend and tell it exactly what to do.';
  } else if (length > 30) {
    score = 90;
    feedback = 'Excellent job! Your prompt is descriptive, clear, and gives the AI a solid instruction.';
    tip = 'To make it even better, try asking the AI to explain its reasoning step-by-step!';
  } else if (length > 10) {
    score = 75;
    feedback = 'Great job writing a prompt! The AI will understand this instruction.';
    tip = 'Try adding details like "short response" or "explain in 2 sentences" to control how the AI answers.';
  }

  if (apiFailed) {
    feedback = `⚠️ [API Quota Exceeded]: ${feedback}`;
  }

  return { score, feedback, tip };
}

// Evaluate a child's micro project submission
export async function evaluateMicroProjectSubmission(
  projectTitle: string,
  projectDescription: string,
  deliverableText: string
): Promise<{ score: number; feedback: string; passed: boolean }> {
  let apiFailed = false;
  try {
    const systemPrompt = `You are a supportive, high-energy robot tutor companion for kids learning AI.
Evaluate the student's creative micro project. Be understanding, generous, and positive!
CRITICAL: If the student's submission consists of random character typing or gibberish (e.g. "asdfasdf", "test test"), you MUST assign a score of 30, passed: false, and feedback explaining that they need to write a realistic response.

Respond ONLY with a JSON object. Format:
{
  "score": <number between 30 and 100>,
  "feedback": "<warm, kid-friendly praise + gentle improvement tip (max 2 sentences)>",
  "passed": <true/false depending on if score is >= 50>
}`;
    const userPrompt = `- Project Title: "${projectTitle}"
- Project Goal: "${projectDescription}"
- Student's Deliverable: "${deliverableText}"`;

    const text = await callWithAiRotation(systemPrompt, userPrompt, true, 0.7);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (typeof parsed.score === 'number' && parsed.feedback && typeof parsed.passed === 'boolean') {
        return parsed;
      }
    }
    throw new Error('Invalid JSON format returned from AI');
  } catch (err) {
    console.warn('AI evaluateMicroProjectSubmission failed, using fallback:', err);
    apiFailed = true;
  }

  // Fallback
  const cleanText = deliverableText.trim();
  if (isGibberish(cleanText)) {
    return {
      score: 30,
      feedback: 'It looks like you typed random letters. Please describe your project using real words to complete the mission!',
      passed: false
    };
  }

  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  let score = 80;
  let feedback = 'Awesome micro project! You applied what you learned and designed a brilliant AI solution.';
  let passed = true;

  if (wordCount < 4) {
    score = 45;
    feedback = 'Nice start! Try writing a bit more about your project idea so Sparky can evaluate it better.';
    passed = false;
  } else if (wordCount > 15) {
    score = 95;
    feedback = 'Outstanding detail! You clearly thought about how AI fits into your solution. Keep inventing!';
  }

  if (apiFailed) {
    feedback = `⚠️ [API Quota Exceeded - Fallback]: ${feedback}`;
  }

  return { score, feedback, passed };
}

// Interactive SVG Shape Generator
export async function modifySvgWithInstruction(
  currentSvg: string,
  targetObject: string,
  instruction: string
): Promise<string> {
  let apiFailed = false;
  try {
    const systemPrompt = `You are a strict SVG drawing compiler for teaching kids Prompt Engineering.
You have the following existing SVG drawing representing "${targetObject}" so far:
"""
${currentSvg || '(Empty Canvas)'}
"""

The student has given this step instruction: "${instruction}".

Your task is to modify the SVG code (adding, editing, positioning shapes) according to their instruction, following these rules strictly to reinforce prompt engineering:
1. PROMPT PRECISION (No numerical coordinates expected):
   - Students will use natural, relative English descriptions (e.g., "draw a tall red rectangle in the center", "add a yellow triangle on top of the rectangle", "shift the triangle down so it touches the top of the square").
   - VAGUE PROMPTS: If the student is vague (e.g. "draw a cylinder", "draw a square", "add shape") lacking color, relative size, or relative placement, you MUST draw a small, uncolored (gray) shape at the top-left corner (e.g. x=5, y=5) as a penalty.
   - PRECISE PROMPTS: If they specify color, relative size (big, small, tall, wide), and relative position (in the center, on top, to the left/right, below, inside), calculate the math coordinates and update the SVG code to place it perfectly.
   - MOVEMENT/ALIGNMENT PROMPTS: If they request movement (e.g. "slide triangle down to touch the square's top edge"), analyze the existing elements, find the target shape's boundaries, and adjust its coordinates so they align perfectly. If the movement description is vague, ignore it or place it incorrectly.
   - EDITING VS ADDING: If the user instruction is to "move", "shift", "slide", "reposition", or "adjust" an existing shape, you MUST modify the attributes (such as cx, cy, x, y, or points) of the existing SVG shape tag in the code. Do NOT write a new shape tag, as that will duplicate the shape instead of moving it.
   - PHYSICAL UNITS: The SVG canvas uses unitless coordinate points (from 0 to 100 on a viewBox), not physical screen units like centimeters (cm) or inches. If the student specifies a physical unit (like "2 cm"), translate it to a proportional coordinate offset (e.g., 2 cm = ~15 to 20 coordinate units on a 100x100 canvas).
2. SVG Output:
   - Start directly with <svg ...> and end with </svg>.
   - Maintain the same viewBox, width, and height.
   - Do NOT wrap your output in markdown code blocks like \`\`\`xml or \`\`\`svg. Only return the raw SVG code.`;

    const userPrompt = `Modify the SVG with instruction: "${instruction}"`;
    const response = await callWithAiRotation(systemPrompt, userPrompt, false, 0.6, 'llama-3.3-70b-versatile');
    
    // Clean up markdown wrappers if returned
    let cleaned = response.replace(/```xml/gi, '').replace(/```svg/gi, '').replace(/```/g, '').trim();
    const lowerCleaned = cleaned.toLowerCase();
    const startIdx = lowerCleaned.indexOf('<svg');
    const endIdx = lowerCleaned.lastIndexOf('</svg>');
    if (startIdx !== -1 && endIdx !== -1) {
      cleaned = cleaned.substring(startIdx, endIdx + 6);
    }
    if (cleaned.startsWith('<svg') && cleaned.endsWith('</svg>')) {
      return cleaned;
    }
    throw new Error('AI response is not a valid SVG block');
  } catch (err) {
    console.warn('AI modifySvgWithInstruction failed, using fallback:', err);
    apiFailed = true;
  }

  // Robust offline fallback simulation enforcing relative prompt engineering
  const instr = instruction.toLowerCase();
  let baseSvg = currentSvg.trim();
  
  if (!baseSvg.includes('<svg') || !baseSvg.includes('</svg>')) {
    baseSvg = `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="100%" height="100%" fill="#1A153B" rx="8" />
    </svg>`;
  }

  // Parse color keywords
  let color = '#B8C2CC'; // default vague gray
  const colorMap: Record<string, string> = {
    red: '#EF4444',
    green: '#10B981',
    blue: '#3B82F6',
    yellow: '#FFD60A',
    pink: '#EC4899',
    purple: '#8B5CF6',
    orange: '#F59E0B',
    white: '#FFFFFF',
    black: '#000000',
    brown: '#78350F',
    grey: '#6B7280',
    gray: '#6B7280'
  };
  
  let hasColor = false;
  for (const [name, hex] of Object.entries(colorMap)) {
    if (instr.includes(name)) {
      color = hex;
      hasColor = true;
      break;
    }
  }

  // Parse relative position keywords
  let x = 5, y = 5; // default vague position (top-left)
  let cx = 10, cy = 10;
  let hasPosition = false;

  if (instr.includes('center') || instr.includes('middle')) {
    x = 38; y = 38;
    cx = 50; cy = 50;
    hasPosition = true;
  } else if (instr.includes('top') || instr.includes('above') || instr.includes('up')) {
    x = 38; y = 10;
    cx = 50; cy = 20;
    hasPosition = true;
  } else if (instr.includes('bottom') || instr.includes('below') || instr.includes('under') || instr.includes('down')) {
    x = 38; y = 65;
    cx = 50; cy = 75;
    hasPosition = true;
  } else if (instr.includes('left')) {
    x = 12; y = 38;
    cx = 25; cy = 50;
    hasPosition = true;
  } else if (instr.includes('right')) {
    x = 63; y = 38;
    cx = 75; cy = 50;
    hasPosition = true;
  }

  // Parse relative size keywords
  let w = 25, h = 25, r = 12;
  let hasSize = false;
  if (instr.includes('big') || instr.includes('large') || instr.includes('tall') || instr.includes('wide')) {
    w = 40;
    h = instr.includes('tall') ? 55 : 40;
    r = 20;
    hasSize = true;
  } else if (instr.includes('small') || instr.includes('tiny') || instr.includes('little')) {
    w = 12;
    h = 12;
    r = 6;
    hasSize = true;
  }

  // A prompt is precise if it specifies color AND relative size or position
  const isPrecise = hasColor && (hasPosition || hasSize);

  // If vague, override styling and coords to be small/gray in the top-left corner
  if (!isPrecise) {
    color = '#6B7280'; // vague gray
    x = 5; y = 5;
    cx = 10; cy = 10;
    w = 15; h = 15; r = 8;
  }

  let elementToAdd = '';

  if (instr.includes('shift') || instr.includes('move') || instr.includes('slide') || instr.includes('touch')) {
    const hasDirection = instr.includes('touch') || instr.includes('center') || instr.includes('top') || instr.includes('middle') || instr.includes('down') || instr.includes('up');
    
    if (hasDirection) {
      // Find default vague rectangle at 5,5 and shift it to the center (38,38)
      if (baseSvg.includes('x="5" y="5" width="15" height="15"')) {
        baseSvg = baseSvg.replace('x="5" y="5" width="15" height="15"', 'x="38" y="38" width="25" height="25"');
      }
      // Find default vague circle at cx=10, cy=10 and shift it
      if (baseSvg.includes('cx="10" cy="10" r="8"')) {
        baseSvg = baseSvg.replace('cx="10" cy="10" r="8"', 'cx="50" cy="50" r="12"');
      }
      // Find default vague triangle (5,25 20,5 35,25) and shift it to sit on top of the center square (y=38)
      if (baseSvg.includes('points="5,25 20,5 35,25"')) {
        baseSvg = baseSvg.replace('points="5,25 20,5 35,25"', 'points="38,38 50,18 62,38"');
      }
      elementToAdd = `<!-- Shifted shapes to alignment positions -->`;
    } else {
      elementToAdd = `<!-- Vague move command ignored. Describe relative positioning clearly! -->`;
    }
  } else if (instr.includes('square') || instr.includes('rect') || instr.includes('box') || instr.includes('body') || instr.includes('cylinder') || instr.includes('cylindrical')) {
    elementToAdd = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${color}" stroke="black" stroke-width="1.5"/>`;
  } else if (instr.includes('circle') || instr.includes('head') || instr.includes('eye') || instr.includes('nose') || instr.includes('ball') || instr.includes('ellipse')) {
    elementToAdd = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="black" stroke-width="1.5"/>`;
  } else if (instr.includes('triangle') || instr.includes('roof') || instr.includes('ear') || instr.includes('hat') || instr.includes('polygon')) {
    let points = `${x},${y + h} ${x + w / 2},${y} ${x + w},${y + h}`;
    if (!isPrecise) {
      points = '5,25 20,5 35,25'; // vague default corner triangle
    }
    elementToAdd = `<polygon points="${points}" fill="${color}" stroke="black" stroke-width="1.5"/>`;
  } else if (instr.includes('line') || instr.includes('tail') || instr.includes('antenna') || instr.includes('leg')) {
    let x1 = x, y1 = y, x2 = x + w, y2 = y + h;
    elementToAdd = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`;
  } else {
    elementToAdd = `<circle cx="10" cy="10" r="5" fill="#6B7280" stroke="black" stroke-width="1"/>`;
  }

  const insertIndex = baseSvg.lastIndexOf('</svg>');
  if (insertIndex !== -1) {
    const finalSvg = baseSvg.substring(0, insertIndex) + '\n  ' + elementToAdd + '\n' + baseSvg.substring(insertIndex);
    return finalSvg;
  }
  return baseSvg + '\n' + elementToAdd;
}

// Evaluate Student SVG Art
export async function evaluateSvgDrawing(
  targetObject: string,
  promptHistory: string[],
  finalSvg: string,
  referenceSvg?: string
): Promise<{ score: number; feedback: string }> {
  let apiFailed = false;
  try {
    const systemPrompt = `You are an encouraging AI Art Teacher.
A student was tasked with drawing a "${targetObject}" using simple mathematical shapes step-by-step.
Here is the step-by-step shape building history they wrote:
${promptHistory.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Here is the ideal reference SVG structure they were aiming to draw:
"""
${referenceSvg || '(No reference provided)'}
"""

Here is the final SVG code the student created:
"""
${finalSvg}
"""

Compare the student's final SVG structure with the ideal reference SVG structure:
1. Did they include the right types of shapes (rectangles, circles, polygons, etc.)?
2. Are the shapes positioned relatively correctly (e.g. nose on head, tail on body) to match the target "${targetObject}"?
3. How close is the overall composition to the target reference SVG?

Award an integer score between 30 and 100 based on similarity to the reference structure, and write a warm, positive, encouraging review (2 sentences max).
Respond ONLY with a JSON object. Format:
{
  "score": <number>,
  "feedback": "<warm feedback message>"
}
Do not output markdown code blocks or any other explanation outside this JSON.`;

    const userPrompt = `Compare the student drawing against the target: "${targetObject}"`;
    const response = await callWithAiRotation(systemPrompt, userPrompt, true, 0.7, 'llama-3.3-70b-versatile');
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (typeof parsed.score === 'number' && parsed.feedback) {
        return {
          score: parsed.score,
          feedback: parsed.feedback
        };
      }
    }
    throw new Error('Invalid JSON format returned from AI evaluation');
  } catch (err) {
    console.warn('AI evaluateSvgDrawing failed, using fallback:', err);
    apiFailed = true;
  }

  // Heuristics-based fallback structural evaluation
  let score = 70;
  if (referenceSvg) {
    const studentCircles = (finalSvg.match(/<circle/g) || []).length;
    const refCircles = (referenceSvg.match(/<circle/g) || []).length;
    const studentRects = (finalSvg.match(/<rect/g) || []).length;
    const refRects = (referenceSvg.match(/<rect/g) || []).length;
    const studentPolygons = (finalSvg.match(/<polygon/g) || []).length;
    const refPolygons = (referenceSvg.match(/<polygon/g) || []).length;

    const circleDiff = Math.abs(studentCircles - refCircles);
    const rectDiff = Math.abs(studentRects - refRects);
    const polyDiff = Math.abs(studentPolygons - refPolygons);

    const totalDiff = circleDiff + rectDiff + polyDiff;
    // Apply structural penalties for mismatched counts
    const similarityPenalty = Math.min(totalDiff * 6, 30);
    score = 92 - similarityPenalty + Math.min(promptHistory.length * 1.5, 8);
  } else {
    const numShapes = (finalSvg.match(/<(rect|circle|polygon|path|ellipse|line|text)/g) || []).length;
    score = 65 + Math.min(numShapes * 7, 25) + Math.min(promptHistory.length * 3, 10);
  }
  
  if (score > 100) score = 100;
  if (score < 30) score = 30;
  score = Math.floor(score);
  
  let feedback = `Excellent effort matching the target "${targetObject}"! Your drawing matches the geometric structure and alignment of the reference drawing very well. Outstanding prompt engineering!`;
  
  if (apiFailed) {
    feedback = `⚠️ [API Quota Exceeded - Fallback Evaluator]: ${feedback}`;
  }

  return { score, feedback };
}

