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

  // Simulated fallback: smart keyword matching
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
    // Pick the category fallback
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

// Generate real-time hints and suggestions for weekly missions based on the current draft
export async function generateMissionSuggestions(
  missionTitle: string,
  missionGoal: string,
  currentDraft: string
): Promise<string[]> {
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_from_aistudio') {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a helpful and friendly AI assistant for an educational platform teaching AI to children (aged 6-16).
The child is working on a weekly mission: "${missionTitle}".
The mission goal is: "${missionGoal}".
The child has written this draft observation so far: "${currentDraft || '(Empty draft - child is looking for where to start)'}".

Generate exactly 3 short, kid-friendly hints, ideas, or suggestions to help the child write a detailed and correct observation.
Each hint should be brief (max 15 words) and encourage critical thinking.
Respond ONLY with a JSON array of 3 strings. Example format:
["Think about how the face recognition on your parents' phone checks their eyes and face.", "Look around the kitchen: is there a smart refrigerator or microwave?", "Check your smart TV recommendations on YouTube or Netflix."]
Do not include any formatting, explanation, markdown, or other text outside the JSON array.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        if (Array.isArray(suggestions) && suggestions.length > 0) {
          return suggestions;
        }
      }
    } catch (err) {
      console.warn('Gemini API failed to generate suggestions:', err);
    }
  }

  // Fallback suggestions based on mission title
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

// Evaluate a child's mission submission and return score + feedback
export async function evaluateMissionSubmission(
  missionTitle: string,
  missionGoal: string,
  submissionText: string
): Promise<{ score: number; feedback: string; passed: boolean }> {
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_from_aistudio') {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a supportive, encouraging, and friendly AI educator. 
A student has submitted an observation for a weekly challenge.
- Mission Title: "${missionTitle}"
- Mission Goal: "${missionGoal}"
- Student's Submission: "${submissionText}"

Evaluate the student's submission. Be understanding and generous, but ensure they actually attempted the challenge (not just typed random letters/spam or empty text).
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

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
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
    } catch (err) {
      console.warn('Gemini API failed to evaluate submission:', err);
    }
  }

  // Fallback: evaluate using basic length & keyword presence (simple heuristic)
  const text = submissionText.trim();
  const lowerText = text.toLowerCase();
  
  // URL check: strip URLs and check if there's sufficient non-URL text
  const urlRegex = /https?:\/\/[^\s]+/gi;
  const textWithoutUrls = text.replace(urlRegex, '').trim();
  const cleanWordCount = textWithoutUrls.split(/\s+/).filter(Boolean).length;
  
  const isSpam = /(.)\1{4,}/.test(lowerText) || /^(xyz|abc|test|qwerty|asdf)/.test(lowerText);

  // If the clean content is too short, or only a URL was submitted
  if (textWithoutUrls.length < 15 || cleanWordCount < 3 || isSpam) {
    return {
      score: 35,
      feedback: "Keep trying! Please write a bit more about what you observed. Avoid using random letters, spam, or only links.",
      passed: false
    };
  }

  let score = 75;
  let feedback = "Nice try! You've started listing some observations. Try adding more details and explaining how technology helps.";
  
  if (missionTitle.includes("Home") || missionGoal.includes("home")) {
    const keywords = ['phone', 'mobile', 'camera', 'face id', 'fingerprint', 'alexa', 'siri', 'assistant', 'speaker', 'tv', 'television', 'refrigerator', 'fridge', 'vacuum', 'robot', 'youtube', 'netflix', 'spotify', 'light', 'bulb', 'ac', 'conditioner', 'smart', 'ai', 'algorithm', 'app', 'feed', 'recommend'];
    const matchedCount = keywords.filter(kw => lowerText.includes(kw)).length;
    if (matchedCount >= 2 && textWithoutUrls.length >= 35) {
      score = 95;
      feedback = "Fantastic work! Your observation is detailed, relevant, and demonstrates a great understanding of your home's AI features.";
    } else if (matchedCount < 2) {
      score = 45;
      feedback = "Almost there! Make sure you mention at least 2 smart/AI features or devices around your home and why they are smart.";
    }
  } else if (missionTitle.includes("Time") || missionGoal.includes("waiting")) {
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
  } else if (missionTitle.includes("Problem") || missionGoal.includes("neighbourhood")) {
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
  } else {
    // Interview
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
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_from_aistudio') {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a friendly, encouraging, and knowledgeable AI educational counselor at QuestAI, a platform that teaches AI and design thinking to children.
A parent wants to know about their child's progress. Here is the child's data:
- Name: ${studentData.username}
- Current Level: ${studentData.level}
- Total XP: ${studentData.xp}
- Lessons completed: ${studentData.completedLessons}/12
- Story Adventures completed: ${studentData.completedQuests}/8
- Weekly Field Missions completed: ${studentData.completedMissions}/4
- Daily streak: ${studentData.streak} days
- Brainstormed Inventions: ${JSON.stringify(studentData.inventions || [])}
- Submitted Real-world Observations: ${JSON.stringify(studentData.observations || [])}

The parent asks: "${parentMessage}"

Give a warm, personalized, and insightful response (max 4-5 sentences or a short bulleted list) in simple, supportive English.
Acknowledge their child's accomplishments (especially highlight any cool inventions or observations they submitted!).
Suggest 1 specific activity or next step they can do on the platform to continue learning.`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (err) {
      console.warn('Gemini API failed to generate parent dashboard response:', err);
    }
  }

  // Local fallback summaries
  const msg = parentMessage.toLowerCase();
  const child = studentData.username || "your child";
  const inventionsCount = studentData.inventions?.length || 0;
  const observationsCount = studentData.observations?.length || 0;
  
  if (msg.includes("summarize") || msg.includes("progress") || msg.includes("report") || msg.includes("how is")) {
    return `Hello! ${child} is doing fantastic on QuestAI. They have reached Level ${studentData.level} with ${studentData.xp} XP! They completed ${studentData.completedLessons} lessons and ${studentData.completedQuests} Story Adventures. They've also submitted ${observationsCount} field observations and dreamed up ${inventionsCount} cool AI inventions! I suggest they try more Weekly Field Missions next to put their knowledge into practice!`;
  }
  if (msg.includes("invention") || msg.includes("creative") || msg.includes("strengths") || msg.includes("invent")) {
    if (inventionsCount > 0) {
      const topInvention = studentData.inventions[0];
      return `QuestAI encourages creativity, and ${child} shows great innovation! They brainstormed "${topInvention.name}": ${topInvention.description}. This project has an innovation score of ${topInvention.innovation_score}%! They are great at connecting AI solutions to real-world problems.`;
    }
    return `${child} is building strong analytical skills by completing lessons. To boost their creativity, encourage them to visit the 'Brainstorm Playground' module, where they can build their own AI inventions!`;
  }
  // Generic response
  return `Hello! ${child} has earned ${studentData.xp} XP and is currently at Level ${studentData.level}. They have completed ${studentData.completedLessons} lessons, ${studentData.completedQuests} story adventures, and ${observationsCount} missions. Encourage them to keep logging in daily to maintain their ${studentData.streak}-day streak! Let me know if you want to know about their specific inventions or observations.`;
}

// Evaluate a child's reflection on story adventures
export async function evaluateStoryReflection(
  questTitle: string,
  questionText: string,
  reflectionText: string
): Promise<{ feedback: string; bonusXp: number }> {
  if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_from_aistudio') {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a supportive, high-energy robot tutor companion for children learning AI.
The child is doing a story adventure quest titled "${questTitle}".
They just read a scenario and were asked: "${questionText}".
The child typed this reflection: "${reflectionText}"

Evaluate their reflection. Be extremely encouraging and positive.
1. Provide a kid-friendly validation message (max 15-20 words). Acknowledge something they said.
2. Decide a bonus XP (between 5 and 15) depending on the effort and quality of the response.

Respond ONLY with a JSON object. Format:
{
  "feedback": "<friendly validation message>",
  "bonusXp": <number between 5 and 15>
}
Do not include any formatting, markdown, or other text outside the JSON object.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
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
    } catch (err) {
      console.warn('Gemini API failed to evaluate story reflection:', err);
    }
  }

  // Fallback
  const cleanText = reflectionText.trim();
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  if (wordCount < 3) {
    return {
      feedback: "Nice try! Try writing a bit more about how you would solve this next time!",
      bonusXp: 5
    };
  }
  return {
    feedback: "Spot on! That is a very creative way to think about this problem and use smart tech!",
    bonusXp: 10
  };
}

