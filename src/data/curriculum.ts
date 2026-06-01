export interface Lesson {
  id: string;
  phase: number;
  title: string;
  subtitle: string;
  emoji: string;
  youtubeId: string;
  xpReward: number;
  coinsReward: number;
  zone: 'junior' | 'innovator' | 'both';
  sandboxType: 'quiz' | 'teachable' | 'quickdraw' | 'playground' | 'dragdrop' | 'comic' | 'detective';
  description: string;
  ttsIntro: string;
}

export const CURRICULUM: Lesson[] = [
  // Phase 1: Awareness
  {
    id: 'lesson-1', phase: 1, title: 'Is My Smartphone Alive?', subtitle: 'Phase 1: Awareness',
    emoji: '📱', youtubeId: 'mJeNghZXtMo', xpReward: 30, coinsReward: 10,
    zone: 'junior', sandboxType: 'dragdrop',
    description: 'Discover how your phone uses AI to do amazing things — from recognizing your face to predicting your next word!',
    ttsIntro: 'Welcome! Did you know your smartphone is secretly powered by Artificial Intelligence? Let\'s find out how!'
  },
  {
    id: 'lesson-2', phase: 1, title: 'The Secret Behind YouTube Recommendations', subtitle: 'Phase 1: Awareness',
    emoji: '📺', youtubeId: 'BsprNmvtS0A', xpReward: 30, coinsReward: 10,
    zone: 'junior', sandboxType: 'quiz',
    description: 'Why does YouTube always know exactly what video you want to watch next? AI knows your taste!',
    ttsIntro: 'Have you ever wondered how YouTube always shows you videos you love? Today we find out the secret!'
  },
  // Phase 2: Vision & Sound
  {
    id: 'lesson-3', phase: 2, title: 'How Computers See Faces', subtitle: 'Phase 2: Vision & Sound',
    emoji: '👁️', youtubeId: 'OcycT1Jwsns', xpReward: 40, coinsReward: 15,
    zone: 'junior', sandboxType: 'teachable',
    description: 'Learn how cameras and AI can recognize faces — just like how you recognize your friends!',
    ttsIntro: 'Your eyes see the world, and now computers can too! Let\'s explore how AI sees faces!'
  },
  {
    id: 'lesson-4', phase: 2, title: 'Training Your First Pet Robot', subtitle: 'Phase 2: Vision & Sound',
    emoji: '🤖', youtubeId: 'R9OHn5ZF4Uo', xpReward: 50, coinsReward: 20,
    zone: 'both', sandboxType: 'teachable',
    description: 'Train an AI model to recognize objects around you using your webcam. Earn the Vision Detective badge!',
    ttsIntro: 'Time to train your very own AI robot! Show it things and watch it learn — just like teaching a puppy!'
  },
  {
    id: 'lesson-5', phase: 2, title: 'How Alexa Recognizes Your Voice', subtitle: 'Phase 2: Vision & Sound',
    emoji: '🎤', youtubeId: 'pVEnhWN8FE8', xpReward: 35, coinsReward: 12,
    zone: 'junior', sandboxType: 'quiz',
    description: 'Discover how smart speakers like Alexa understand what you say — even with music playing!',
    ttsIntro: 'Alexa, how do you understand me? Let\'s find out how AI listens and learns from your voice!'
  },
  // Phase 3: Generative AI
  {
    id: 'lesson-6', phase: 3, title: 'Teaching AI to Speak Like You', subtitle: 'Phase 3: Generative AI',
    emoji: '💬', youtubeId: 'X-AWdfSFCHQ', xpReward: 45, coinsReward: 18,
    zone: 'innovator', sandboxType: 'playground',
    description: 'Explore how large language models like ChatGPT are trained on human writing to speak and write text.',
    ttsIntro: 'How does ChatGPT know so much? Let\'s explore the world of AI language and writing!'
  },
  {
    id: 'lesson-7', phase: 3, title: 'Creative Prompts: Text to Magic', subtitle: 'Phase 3: Generative AI',
    emoji: '✨', youtubeId: '5sLYAQS9sWQ', xpReward: 50, coinsReward: 20,
    zone: 'innovator', sandboxType: 'playground',
    description: 'Learn the art of prompt engineering — how to talk to AI to get the best creative results!',
    ttsIntro: 'Words are magic! Learn how to write the perfect instructions to get amazing results from AI!'
  },
  {
    id: 'lesson-8', phase: 3, title: 'AI Art: From Words to Pictures', subtitle: 'Phase 3: Generative AI',
    emoji: '🎨', youtubeId: 'SVcsDDABEkM', xpReward: 45, coinsReward: 18,
    zone: 'both', sandboxType: 'comic',
    description: 'See how AI turns text descriptions into images. Then create your own AI comic book page!',
    ttsIntro: 'Imagine a flying elephant in space! Now AI can draw it for you. Let\'s create some art together!'
  },
  // Phase 4: Ethics & Future
  {
    id: 'lesson-9', phase: 4, title: 'Deepfakes: Don\'t Believe Your Eyes!', subtitle: 'Phase 4: Ethics & Future',
    emoji: '🕵️', youtubeId: 'iyiOVUbsPcM', xpReward: 50, coinsReward: 20,
    zone: 'innovator', sandboxType: 'detective',
    description: 'Learn to spot AI-generated fake images and videos — a critical skill for the digital age!',
    ttsIntro: 'WARNING! Not everything you see online is real. AI can create fake videos and images. Can you spot them?'
  },
  {
    id: 'lesson-10', phase: 4, title: 'AI Bias: When Machines Make Mistakes', subtitle: 'Phase 4: Ethics & Future',
    emoji: '⚖️', youtubeId: 'TWWsW1w-BVo', xpReward: 60, coinsReward: 25,
    zone: 'innovator', sandboxType: 'quiz',
    description: 'Why does AI sometimes get things wrong — or be unfair? Learn about data bias and how to fix it.',
    ttsIntro: 'AI can make unfair decisions! Let\'s learn why this happens and how we can make AI fairer for everyone.'
  },
  {
    id: 'lesson-11', phase: 4, title: 'AI in India: Solving Our Problems', subtitle: 'Phase 4: Ethics & Future',
    emoji: '🇮🇳', youtubeId: 'oV74Najm6Nc', xpReward: 40, coinsReward: 15,
    zone: 'both', sandboxType: 'playground',
    description: 'How is India using AI in farming, healthcare, education and more? See AI solving real Indian problems!',
    ttsIntro: 'AI is changing India! From farms to hospitals, let\'s see how AI is making life better for millions of Indians.'
  },
  {
    id: 'lesson-12', phase: 4, title: 'The Future of AI — What\'s Next?', subtitle: 'Phase 4: Ethics & Future',
    emoji: '🌟', youtubeId: 'aircAruvnKk', xpReward: 50, coinsReward: 20,
    zone: 'both', sandboxType: 'quiz',
    description: 'What will AI look like in 10 years? Robots, self-driving cars, AI doctors — imagine the future!',
    ttsIntro: 'Close your eyes and imagine the future! AI will change everything. What kind of world will YOU build?'
  },
];

export const PHASES = [
  { id: 1, title: 'Awareness', emoji: '🌍', color: 'bg-blue-game', description: 'AI All Around You' },
  { id: 2, title: 'Vision & Sound', emoji: '👁️', color: 'bg-primary', description: 'How AI Sees and Hears' },
  { id: 3, title: 'Generative AI', emoji: '✨', color: 'bg-success', description: 'AI That Creates' },
  { id: 4, title: 'Ethics & Future', emoji: '⚖️', color: 'bg-warning', description: 'Responsible AI' },
];

export const AI_CARDS_DATA = [
  { id: 1, title: 'AI Doctor', emoji: '👨‍⚕️', rarity: 'rare', problem_solved: 'Diagnosing diseases from X-rays and scans faster than human doctors', ai_power: 'Computer Vision + Deep Learning', fun_fact: 'AI can detect certain cancers with 94% accuracy — better than most doctors!', color: 'bg-red-500' },
  { id: 2, title: 'AI Farmer', emoji: '👨‍🌾', rarity: 'common', problem_solved: 'Detecting crop diseases from photos and predicting the best harvest time', ai_power: 'Image Recognition + Weather Prediction', fun_fact: 'AI farming can reduce water usage by 50% by only watering crops when needed!', color: 'bg-success' },
  { id: 3, title: 'AI Teacher', emoji: '👩‍🏫', rarity: 'common', problem_solved: 'Creating personalized learning paths for every student\'s needs', ai_power: 'Natural Language Processing + Adaptive Learning', fun_fact: 'AI tutors can explain the same concept 1000 different ways until you understand!', color: 'bg-blue-game' },
  { id: 4, title: 'AI Scientist', emoji: '🧬', rarity: 'epic', problem_solved: 'Discovering new medicines and solving scientific mysteries in days instead of years', ai_power: 'Protein Folding + Drug Discovery', fun_fact: 'AlphaFold AI solved a 50-year-old mystery about how proteins fold in just 2 years!', color: 'bg-primary' },
  { id: 5, title: 'AI Space Explorer', emoji: '🚀', rarity: 'legendary', problem_solved: 'Analyzing millions of stars and planets to find signs of life in outer space', ai_power: 'Signal Processing + Pattern Recognition', fun_fact: 'NASA\'s AI discovered 2 new exoplanets that human astronomers missed!', color: 'bg-purple-600' },
  { id: 6, title: 'AI Detective', emoji: '🕵️', rarity: 'rare', problem_solved: 'Finding missing people, solving crimes, and identifying fake news', ai_power: 'Facial Recognition + NLP + Fact-Checking', fun_fact: 'AI can analyze 10,000 documents in the time it takes to read one page!', color: 'bg-gray-600' },
  { id: 7, title: 'AI Storyteller', emoji: '📚', rarity: 'common', problem_solved: 'Creating stories, poems, and creative content for children and adults', ai_power: 'Large Language Models + Creative Generation', fun_fact: 'AI has written entire novels and composed music that fooled professional musicians!', color: 'bg-pink-500' },
];

export const STORY_QUESTS = [
  { id: 'canteen', title: 'The Hungry Canteen Mystery', emoji: '🍱', description: 'The school canteen throws away 50 meals every day. Can AI predict exactly how many meals to cook?', difficulty: 1, xpReward: 80, solved: false },
  { id: 'pet', title: 'Finding Fluffy', emoji: '🐕', description: 'Raja\'s dog Fluffy is lost! Can AI scan camera footage across the city to find her?', difficulty: 1, xpReward: 80, solved: false },
  { id: 'traffic', title: 'The Traffic Jam Trap', emoji: '🚗', description: 'Every morning, terrible traffic jams block the road to school. Can AI predict and prevent them?', difficulty: 2, xpReward: 100, solved: false },
  { id: 'water', title: 'The Leaky Lake', emoji: '💧', description: 'The village lake is running dry because people waste water. Can AI monitor and save it?', difficulty: 2, xpReward: 100, solved: false },
  { id: 'fire', title: 'Forest Fire Alert!', emoji: '🌳', description: 'Fires are destroying our forests. Can AI satellites detect fires before they spread?', difficulty: 3, xpReward: 120, solved: false },
  { id: 'library', title: 'The Lost Library', emoji: '📚', description: '500 library books are missing! Can AI track which books go where and alert the librarian?', difficulty: 2, xpReward: 100, solved: false },
  { id: 'crops', title: 'Save Farmer Ramu\'s Crops', emoji: '🌾', description: 'A strange disease is killing Farmer Ramu\'s wheat. Can AI identify it from a photo?', difficulty: 3, xpReward: 120, solved: false },
  { id: 'hospital', title: 'The Hospital Queue', emoji: '🏥', description: 'Patients wait 4 hours to see a doctor. Can AI schedule appointments smarter?', difficulty: 3, xpReward: 120, solved: false },
];

export const DETECTIVE_CASES = [
  { id: 1, imageEmoji: '🚗🚗🚗🚦', scenario: 'A 3km traffic jam forming near the school gates every morning at 8 AM.', canAIHelp: 'yes', explanation: 'YES! AI can analyze traffic patterns from cameras and sensors, predict jams before they happen, and automatically change traffic signal timing to keep cars moving!', xp: 20 },
  { id: 2, imageEmoji: '🌊🐟💧', scenario: 'A river turning dark and smelly — fish are dying near a factory.', canAIHelp: 'yes', explanation: 'YES! AI-powered water quality sensors can detect pollution instantly, identify the exact chemical, and automatically alert authorities to stop the factory!', xp: 20 },
  { id: 3, imageEmoji: '📚🔍😕', scenario: 'A student is struggling to understand math but the teacher has 40 other students to help.', canAIHelp: 'yes', explanation: 'YES! AI tutors can give each student personalized lessons, explain concepts in different ways, and give infinite patience — available 24 hours a day!', xp: 20 },
  { id: 4, imageEmoji: '🌈🌤️', scenario: 'Deciding what to wear to school tomorrow morning.', canAIHelp: 'maybe', explanation: 'MAYBE! AI can check weather forecasts and suggest outfits. But it cannot feel the actual temperature or know your personal style preferences perfectly yet!', xp: 15 },
  { id: 5, imageEmoji: '👴❤️🤔', scenario: 'An elderly grandparent feels lonely and wants someone to talk to.', canAIHelp: 'maybe', explanation: 'MAYBE! AI chatbots can have conversations and provide company. But real human love, warmth and understanding is something AI cannot truly replace!', xp: 15 },
  { id: 6, imageEmoji: '🎨🖌️✨', scenario: 'Creating a painting that expresses deep personal emotions.', canAIHelp: 'no', explanation: 'NOT QUITE! AI can generate art, but it cannot truly feel emotions. The meaning, story, and soul behind YOUR artwork makes it uniquely human and irreplaceable!', xp: 10 },
  { id: 7, imageEmoji: '🌾🌡️💧', scenario: 'Crops on a farm are showing yellow patches and the farmer doesn\'t know why.', canAIHelp: 'yes', explanation: 'YES! AI can analyze photos of sick plants, identify the exact disease or nutrient deficiency, and recommend the perfect treatment — saving the entire harvest!', xp: 20 },
  { id: 8, imageEmoji: '🏥👩‍⚕️🩺', scenario: 'A doctor needs to check 200 X-ray scans for signs of a serious disease.', canAIHelp: 'yes', explanation: 'YES! AI can scan all 200 X-rays in minutes, flagging any suspicious areas for doctors to review. This means faster diagnosis and earlier treatment!', xp: 20 },
];

export const QUIZ_QUESTIONS = [
  { id: 1, question: 'What does "AI" stand for?', options: ['Amazing Intelligence', 'Artificial Intelligence', 'Automatic Internet', 'Android Interface'], correct: 1, emoji: '🤖', xp: 10 },
  { id: 2, question: 'Which of these is an example of AI in everyday life?', options: ['A light bulb turning on', 'Your phone recognizing your face', 'A bicycle moving forward', 'A book falling off a shelf'], correct: 1, emoji: '📱', xp: 10 },
  { id: 3, question: 'How does AI learn to recognize pictures of cats?', options: ['By reading books about cats', 'By looking at thousands of cat photos', 'By asking humans to describe cats', 'AI cannot recognize cats'], correct: 1, emoji: '🐱', xp: 15 },
  { id: 4, question: 'What is "Machine Learning"?', options: ['Robots learning to walk', 'AI learning from data and experience', 'Computers fixing themselves', 'Machines teaching humans'], correct: 1, emoji: '🧠', xp: 15 },
  { id: 5, question: 'Why might an AI image generator always show "pilots" as male?', options: ['Because most pilots are male', 'Because the training data had mostly male pilots', 'Because AI prefers male characters', 'This never happens'], correct: 1, emoji: '✈️', xp: 20 },
  { id: 6, question: 'What is a "deepfake"?', options: ['A very deep ocean photograph', 'AI-generated fake videos or images of real people', 'A hidden camera recording', 'A type of virtual reality game'], correct: 1, emoji: '🎭', xp: 20 },
  { id: 7, question: 'Which AI tool can help a farmer know if their crops are sick?', options: ['A weather app', 'An AI image recognition system', 'A calculator', 'A social media app'], correct: 1, emoji: '🌾', xp: 15 },
  { id: 8, question: 'What do you call the instructions you give to an AI chatbot?', options: ['A command', 'A code', 'A prompt', 'A request'], correct: 2, emoji: '💬', xp: 15 },
  { id: 9, question: 'Which company created ChatGPT?', options: ['Google', 'Apple', 'OpenAI', 'Microsoft'], correct: 2, emoji: '🤖', xp: 10 },
  { id: 10, question: 'What is the main danger of relying on AI for all decisions?', options: ['AI makes everything too fast', 'AI can have biases and make mistakes', 'AI uses too much electricity', 'AI is too expensive'], correct: 1, emoji: '⚠️', xp: 20 },
];

export const WEEKLY_MISSIONS_DATA = [
  { id: 1, title: '🏠 Home AI Hunter', description: 'Find 3 things in your home that use AI or smart technology. Take a photo or describe them!', xp_reward: 80, emoji: '🏠', difficulty: 'Easy' },
  { id: 2, title: '⏰ Time Waster Finder', description: 'Find 3 places in your school or home where people waste time waiting. How could AI help?', xp_reward: 100, emoji: '⏰', difficulty: 'Medium' },
  { id: 3, title: '🌍 Problem Spotter', description: 'Find a real problem in your school, neighbourhood, or city. Describe it with a photo or text!', xp_reward: 120, emoji: '🌍', difficulty: 'Hard' },
  { id: 4, title: '🤖 AI Interview', description: 'Ask a parent, teacher or neighbour: "How does technology help you in your work?" Share what you learned!', xp_reward: 80, emoji: '🤖', difficulty: 'Easy' },
];
