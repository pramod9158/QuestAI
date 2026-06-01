import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Simulated fallback ideas by category
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

// Generate AI ideas using Gemini or fallback to templates
export async function generateAIIdeas(problem: string, category: string): Promise<{ name: string; description: string }[]> {
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_from_aistudio') {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a friendly AI educator for children aged 6-16 in India. 
A student has described a real-world problem: "${problem}" in the category: "${category}".
Generate exactly 3 creative, simple AI-powered solutions for this problem.
Format your response as a JSON array with exactly 3 objects, each having:
- "name": A catchy, simple name for the AI solution (max 5 words)
- "description": A kid-friendly description of how the AI helps (max 30 words, simple language)
Only respond with the JSON array, no other text.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const ideas = JSON.parse(jsonMatch[0]);
        if (Array.isArray(ideas) && ideas.length === 3) return ideas;
      }
    } catch (err) {
      console.warn('Gemini API failed, using fallback:', err);
    }
  }

  // Fallback: return category-specific ideas
  const catKey = category.toLowerCase();
  const ideas = FALLBACK_IDEAS[catKey] || FALLBACK_IDEAS['school'];
  // Shuffle and return 3
  return [...ideas].sort(() => Math.random() - 0.5).slice(0, 3);
}

// Generate brainstorm project idea
export async function generateBrainstormIdea(
  category: string, problem: string, audience: string
): Promise<{ name: string; description: string; innovation_score: number }> {
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_from_aistudio') {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a creative AI educator for children in India.
A student wants to solve this problem:
- Category: ${category}
- Problem: ${problem}  
- Who faces it: ${audience}

Create one exciting AI project idea. Respond ONLY with a JSON object:
{
  "name": "Project name (max 5 words)",
  "description": "How AI solves this (max 40 words, exciting and simple for kids)",
  "innovation_score": <number between 60-99>
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const idea = JSON.parse(jsonMatch[0]);
        if (idea.name && idea.description) return idea;
      }
    } catch (err) {
      console.warn('Gemini API failed, using fallback:', err);
    }
  }

  // Simulated fallback
  const catIdeas = FALLBACK_IDEAS[category.toLowerCase()] || FALLBACK_IDEAS['school'];
  const pick = catIdeas[Math.floor(Math.random() * catIdeas.length)];
  return { ...pick, innovation_score: Math.floor(Math.random() * 30) + 65 };
}
