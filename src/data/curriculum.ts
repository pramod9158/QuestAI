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

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  emoji: string;
  xp: number;
  zone: 'junior' | 'innovator' | 'both';
}

export interface DetectiveCase {
  id: number;
  imageEmoji: string;
  scenario: string;
  canAIHelp: 'yes' | 'no' | 'maybe';
  explanation: string;
  xp: number;
  zone: 'junior' | 'innovator' | 'both';
}

export interface StoryQuest {
  id: string;
  title: string;
  emoji: string;
  description: string;
  difficulty: number;
  xpReward: number;
  solved: boolean;
  zone: 'junior' | 'innovator' | 'both';
}

export interface WeeklyMission {
  id: number;
  title: string;
  description: string;
  xp_reward: number;
  emoji: string;
  difficulty: string;
  zone: 'junior' | 'innovator' | 'both';
}

export const PHASES = [
  { id: 1, title: 'Awareness', emoji: '🌍', color: 'bg-blue-game', description: 'AI All Around You' },
  { id: 2, title: 'Vision & Sound', emoji: '👁️', color: 'bg-primary', description: 'How AI Sees and Hears' },
  { id: 3, title: 'Generative AI', emoji: '✨', color: 'bg-success', description: 'AI That Creates' },
  { id: 4, title: 'Ethics & Future', emoji: '⚖️', color: 'bg-warning', description: 'Responsible AI' },
  { id: 5, title: 'Smart Robots', emoji: '🤖', color: 'bg-purple-600', description: 'Robots & Automation' },
  { id: 6, title: 'Chatbots & Speech', emoji: '💬', color: 'bg-pink-500', description: 'Speech & Language AI' },
  { id: 7, title: 'Everyday Apps', emoji: '📱', color: 'bg-blue-500', description: 'AI in Socials & Feeds' },
  { id: 8, title: 'Creative Prompts', emoji: '✍️', color: 'bg-yellow-500', description: 'Prompt Engineering' },
  { id: 9, title: 'AI Bias & Fairness', emoji: '⚖️', color: 'bg-orange-500', description: 'Building Fair AI' },
  { id: 10, title: 'Local Problem Solving', emoji: '🇮🇳', color: 'bg-indigo-500', description: 'AI Solutions in India' },
  { id: 11, title: 'Game AI', emoji: '🎮', color: 'bg-red-500', description: 'NPCs & AI in Games' },
  { id: 12, title: 'Space & Astronomy', emoji: '🚀', color: 'bg-slate-700', description: 'Searching the Cosmos' },
  { id: 13, title: 'Eco & Climate AI', emoji: '🌱', color: 'bg-emerald-600', description: 'Saving Our Planet' },
  { id: 14, title: 'Healthcare AI', emoji: '🏥', color: 'bg-teal-500', description: 'AI in Medicine & Diagnostics' },
  { id: 15, title: 'Smart Cities & Homes', emoji: '🏠', color: 'bg-amber-600', description: 'IoT & Smart Grid AI' },
  { id: 16, title: 'Agriculture & Farming', emoji: '🌾', color: 'bg-green-700', description: 'Precision Agriculture' },
  { id: 17, title: 'AI & Wildlife', emoji: '🐯', color: 'bg-orange-600', description: 'Protecting Wild Animals' },
  { id: 18, title: 'Data & Privacy', emoji: '🔒', color: 'bg-cyan-600', description: 'Keeping Info Secure' },
  { id: 19, title: 'Generative Music', emoji: '🎵', color: 'bg-fuchsia-600', description: 'AI Sound Composers' },
  { id: 20, title: 'Human-AI Collaboration', emoji: '🤝', color: 'bg-rose-600', description: 'Future of Work Together' },
];

export const CURRICULUM: Lesson[] = [
  // Phase 1: Awareness
  { id: 'lesson-1', phase: 1, title: 'Is My Smartphone Alive?', subtitle: 'Phase 1: Awareness', emoji: '📱', youtubeId: 'mJeNghZXtMo', xpReward: 30, coinsReward: 10, zone: 'junior', sandboxType: 'dragdrop', description: 'Discover how your phone uses AI to do amazing things — from recognizing faces to predicting words!', ttsIntro: 'Welcome! Did you know your smartphone is secretly powered by Artificial Intelligence? Let\'s find out how!' },
  { id: 'lesson-1-in', phase: 1, title: 'Understanding AI & Algorithms', subtitle: 'Phase 1: Awareness', emoji: '🧠', youtubeId: 'BsprNmvtS0A', xpReward: 40, coinsReward: 15, zone: 'innovator', sandboxType: 'quiz', description: 'Dive deep into how computer programs make decisions and what makes an algorithm "intelligent".', ttsIntro: 'What exactly is an algorithm? Let\'s break down how machines solve complex problems!' },

  // Phase 2: Vision & Sound
  { id: 'lesson-3', phase: 2, title: 'How Computers See Faces', subtitle: 'Phase 2: Vision & Sound', emoji: '👁️', youtubeId: 'OcycT1Jwsns', xpReward: 40, coinsReward: 15, zone: 'junior', sandboxType: 'teachable', description: 'Learn how cameras and AI can recognize faces — just like how you recognize your friends!', ttsIntro: 'Your eyes see the world, and now computers can too! Let\'s explore how AI sees faces!' },
  { id: 'lesson-3-in', phase: 2, title: 'Computer Vision & Deep Learning', subtitle: 'Phase 2: Vision & Sound', emoji: '🔍', youtubeId: 'R9OHn5ZF4Uo', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'teachable', description: 'Explore neural networks trained on millions of images, facial landmarks, and automated segmentation.', ttsIntro: 'Deep Learning enables computers to analyze complex visual scenes. Let\'s explore convolutional networks!' },

  // Phase 3: Generative AI
  { id: 'lesson-8', phase: 3, title: 'AI Art: From Words to Pictures', subtitle: 'Phase 3: Generative AI', emoji: '🎨', youtubeId: 'SVcsDDABEkM', xpReward: 45, coinsReward: 18, zone: 'junior', sandboxType: 'comic', description: 'See how AI turns text descriptions into images. Then create your own AI comic book page!', ttsIntro: 'Imagine a flying elephant in space! Now AI can draw it for you. Let\'s create some art together!' },
  { id: 'lesson-6', phase: 3, title: 'Teaching AI to Speak Like You', subtitle: 'Phase 3: Generative AI', emoji: '💬', youtubeId: 'X-AWdfSFCHQ', xpReward: 45, coinsReward: 18, zone: 'innovator', sandboxType: 'playground', description: 'Explore how large language models like ChatGPT are trained on human writing to speak and write text.', ttsIntro: 'How does ChatGPT know so much? Let\'s explore the world of AI language and writing!' },

  // Phase 4: Ethics & Future
  { id: 'lesson-12', phase: 4, title: 'The Future of AI — What\'s Next?', subtitle: 'Phase 4: Ethics & Future', emoji: '🌟', youtubeId: 'aircAruvnKk', xpReward: 50, coinsReward: 20, zone: 'junior', sandboxType: 'quiz', description: 'What will AI look like in 10 years? Robots, self-driving cars, AI doctors — imagine the future!', ttsIntro: 'Close your eyes and imagine the future! AI will change everything. What kind of world will you build?' },
  { id: 'lesson-9', phase: 4, title: 'Deepfakes: Don\'t Believe Your Eyes!', subtitle: 'Phase 4: Ethics & Future', emoji: '🕵️', youtubeId: 'iyiOVUbsPcM', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'detective', description: 'Learn to spot AI-generated fake images and videos — a critical skill for the digital age!', ttsIntro: 'WARNING! Not everything you see online is real. AI can create fake videos and images. Can you spot them?' },

  // Phase 5: Smart Robots
  { id: 'lesson-4', phase: 5, title: 'Training Your First Pet Robot', subtitle: 'Phase 5: Smart Robots', emoji: '🤖', youtubeId: 'R9OHn5ZF4Uo', xpReward: 50, coinsReward: 20, zone: 'junior', sandboxType: 'teachable', description: 'Train an AI model to recognize objects around you using your webcam. Earn the Vision Detective badge!', ttsIntro: 'Time to train your very own AI robot! Show it things and watch it learn — just like teaching a puppy!' },
  { id: 'lesson-4-in', phase: 5, title: 'Robotics: How AI Moves Things', subtitle: 'Phase 5: Smart Robots', emoji: '🦾', youtubeId: 'R9OHn5ZF4Uo', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'teachable', description: 'Learn how robotic sensors, actuators, and pathfinding algorithms let AI navigate physical space.', ttsIntro: 'Let\'s discover how AI controls hardware, arms, and self-driving gears to perform physical tasks!' },

  // Phase 6: Chatbots & Speech
  { id: 'lesson-5', phase: 6, title: 'How Alexa Recognizes Your Voice', subtitle: 'Phase 6: Chatbots & Speech', emoji: '🎤', youtubeId: 'pVEnhWN8FE8', xpReward: 35, coinsReward: 12, zone: 'junior', sandboxType: 'quiz', description: 'Discover how smart speakers like Alexa understand what you say — even with music playing!', ttsIntro: 'Alexa, how do you understand me? Let\'s find out how AI listens and learns from your voice!' },
  { id: 'lesson-5-in', phase: 6, title: 'Natural Language Processing Basics', subtitle: 'Phase 6: Chatbots & Speech', emoji: '🗣️', youtubeId: 'pVEnhWN8FE8', xpReward: 45, coinsReward: 15, zone: 'innovator', sandboxType: 'playground', description: 'Understand tokenization, syntax parsing, and sentiment analysis that enable computers to process text.', ttsIntro: 'Language is full of idioms and rules. Discover how NLP algorithms convert speech into logic!' },

  // Phase 7: Everyday Apps
  { id: 'lesson-2', phase: 7, title: 'The Secret Behind YouTube Recommendations', subtitle: 'Phase 7: Everyday Apps', emoji: '📺', youtubeId: 'BsprNmvtS0A', xpReward: 30, coinsReward: 10, zone: 'junior', sandboxType: 'quiz', description: 'Why does YouTube always know exactly what video you want to watch next? AI knows your taste!', ttsIntro: 'Have you ever wondered how YouTube always shows you videos you love? Today we find out the secret!' },
  { id: 'lesson-2-in', phase: 7, title: 'Recommendation Systems: How Netflix Thinks', subtitle: 'Phase 7: Everyday Apps', emoji: '🍿', youtubeId: 'BsprNmvtS0A', xpReward: 45, coinsReward: 18, zone: 'innovator', sandboxType: 'quiz', description: 'Explore collaborative filtering and content-based recommendation systems that drive feeds.', ttsIntro: 'Netflix and Instagram keep you hooked using recommender algorithms. Let\'s explore the math behind feeds!' },

  // Phase 8: Creative Prompts
  { id: 'lesson-7-jr', phase: 8, title: 'Word Magic: Creative Writing with AI', subtitle: 'Phase 8: Creative Prompts', emoji: '✨', youtubeId: '5sLYAQS9sWQ', xpReward: 35, coinsReward: 12, zone: 'junior', sandboxType: 'playground', description: 'Learn how to give fun instructions to AI to write songs, fairy tales, and magical scripts!', ttsIntro: 'Words are magic! Learn how to command the writing bot to make up stories.' },
  { id: 'lesson-7', phase: 8, title: 'Creative Prompts: Text to Magic', subtitle: 'Phase 8: Creative Prompts', emoji: '✍️', youtubeId: '5sLYAQS9sWQ', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'playground', description: 'Learn the art of prompt engineering — how to talk to AI to get the best creative results!', ttsIntro: 'Learn to engineer advanced instructions, context tokens, and constraints to get amazing results from AI!' },

  // Phase 9: AI Bias & Fairness
  { id: 'lesson-10-jr', phase: 9, title: 'AI Fairness: Games for Everyone', subtitle: 'Phase 9: AI Bias & Fairness', emoji: '🤝', youtubeId: 'TWWsW1w-BVo', xpReward: 40, coinsReward: 15, zone: 'junior', sandboxType: 'quiz', description: 'Why should smart cameras recognize everyone\'s face equally? Learn about making AI friendly for all!', ttsIntro: 'AI should be a helper for everyone, no matter who they are. Let\'s explore AI fairness!' },
  { id: 'lesson-10', phase: 9, title: 'AI Bias: When Machines Make Mistakes', subtitle: 'Phase 9: AI Bias & Fairness', emoji: '⚖️', youtubeId: 'TWWsW1w-BVo', xpReward: 60, coinsReward: 25, zone: 'innovator', sandboxType: 'quiz', description: 'Why does AI sometimes get things wrong — or be unfair? Learn about data bias and how to fix it.', ttsIntro: 'AI can make biased decisions! Let\'s learn why this happens and how we can make AI fairer for everyone.' },

  // Phase 10: Local Problem Solving
  { id: 'lesson-11', phase: 10, title: 'AI in India: Solving Our Problems', subtitle: 'Phase 10: Local Problem Solving', emoji: '🇮🇳', youtubeId: 'oV74Najm6Nc', xpReward: 40, coinsReward: 15, zone: 'junior', sandboxType: 'playground', description: 'How is India using AI in farming, healthcare, education and more? See AI solving real Indian problems!', ttsIntro: 'AI is changing India! From farms to hospitals, let\'s see how AI is making life better for millions of Indians.' },
  { id: 'lesson-11-in', phase: 10, title: 'AI & Community: Building Solutions', subtitle: 'Phase 10: Local Problem Solving', emoji: '🏢', youtubeId: 'oV74Najm6Nc', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'playground', description: 'Examine how local startups and agencies use AI to map water leaks, traffic blockages, and waste.', ttsIntro: 'How can you build solutions for your neighborhood using AI? Let\'s discover community innovation!' },

  // Phase 11: Game AI
  { id: 'lesson-13-jr', phase: 11, title: 'How Video Games Use AI', subtitle: 'Phase 11: Game AI', emoji: '🎮', youtubeId: 'iyiOVUbsPcM', xpReward: 35, coinsReward: 12, zone: 'junior', sandboxType: 'quiz', description: 'Learn how Minecraft mobs find paths, and how chess computers think 5 moves ahead!', ttsIntro: 'Let\'s peek inside your favorite video games to see how smart enemies and buddies are coded!' },
  { id: 'lesson-13-in', phase: 11, title: 'Game AI: Designing Smart Enemies', subtitle: 'Phase 11: Game AI', emoji: '👾', youtubeId: 'iyiOVUbsPcM', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'quiz', description: 'Explore State Machines, Behavior Trees, and NavMesh systems that control non-player characters (NPCs).', ttsIntro: 'Want to design video games? Let\'s learn how programmers design smart enemies using AI architectures!' },

  // Phase 12: Space & Astronomy
  { id: 'lesson-14-jr', phase: 12, title: 'AI in Space: Searching for Aliens', subtitle: 'Phase 12: Space & Astronomy', emoji: '🚀', youtubeId: 'aircAruvnKk', xpReward: 40, coinsReward: 15, zone: 'junior', sandboxType: 'playground', description: 'How NASA rovers explore Mars on their own and find giant craters using cameras.', ttsIntro: 'To infinity and beyond! Let\'s see how smart rovers drive across Mars all by themselves.' },
  { id: 'lesson-14-in', phase: 12, title: 'Astronomy AI: Finding Exoplanets', subtitle: 'Phase 12: Space & Astronomy', emoji: '🪐', youtubeId: 'aircAruvnKk', xpReward: 55, coinsReward: 22, zone: 'innovator', sandboxType: 'playground', description: 'Examine light curve data and how neural networks discover planets orbiting far away stars.', ttsIntro: 'With billions of stars, finding planets is hard. Learn how space telescopes use AI to detect new worlds!' },

  // Phase 13: Eco & Climate AI
  { id: 'lesson-15-jr', phase: 13, title: 'Eco AI: Protecting Our Forests', subtitle: 'Phase 13: Eco & Climate AI', emoji: '🌱', youtubeId: 'iyiOVUbsPcM', xpReward: 35, coinsReward: 12, zone: 'junior', sandboxType: 'detective', description: 'Can smart microphones hear chainsaws and warn forest rangers? Let\'s protect trees!', ttsIntro: 'Trees are our best friends. Let\'s learn how AI listens to forest sounds to catch tree thieves!' },
  { id: 'lesson-15-in', phase: 13, title: 'Climate AI: Predicting Extreme Weather', subtitle: 'Phase 13: Eco & Climate AI', emoji: '🌪️', youtubeId: 'iyiOVUbsPcM', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'detective', description: 'Understand how climate simulation models use weather history and satellite radar to predict cyclones.', ttsIntro: 'Extreme weather causes immense damage. Discover how AI models predict cyclones to save lives.' },

  // Phase 14: Healthcare AI
  { id: 'lesson-16-jr', phase: 14, title: 'AI Doctors: How Tech Saves Lives', subtitle: 'Phase 14: Healthcare AI', emoji: '🏥', youtubeId: 'OcycT1Jwsns', xpReward: 40, coinsReward: 15, zone: 'junior', sandboxType: 'quiz', description: 'See how doctors use computers to check heartbeats and diagnose diseases faster.', ttsIntro: 'Can a computer help cure a cold? Let\'s find out how doctors and AI work together!' },
  { id: 'lesson-16-in', phase: 14, title: 'Medical Imaging & Diagnostic AI', subtitle: 'Phase 14: Healthcare AI', emoji: '🩺', youtubeId: 'OcycT1Jwsns', xpReward: 55, coinsReward: 22, zone: 'innovator', sandboxType: 'quiz', description: 'Analyze how convolutional neural networks (CNNs) detect micro-fractures and tumors from scans.', ttsIntro: 'Medical scans hold hidden patterns. Let\'s explore how computer vision diagnoses illness automatically!' },

  // Phase 15: Smart Cities & Homes
  { id: 'lesson-17-jr', phase: 15, title: 'Smart Homes: Lights, AC, & Action', subtitle: 'Phase 15: Smart Cities & Homes', emoji: '🏠', youtubeId: 'mJeNghZXtMo', xpReward: 35, coinsReward: 12, zone: 'junior', sandboxType: 'dragdrop', description: 'Discover how smart lightbulbs and gadgets change settings to match your mood and save energy!', ttsIntro: 'Welcome home! Let\'s see how smart homes control everything to make life easy.' },
  { id: 'lesson-17-in', phase: 15, title: 'Smart Cities: Traffic & Energy AI', subtitle: 'Phase 15: Smart Cities & Homes', emoji: '🏙️', youtubeId: 'mJeNghZXtMo', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'dragdrop', description: 'Examine smart traffic light scheduling and energy grids that direct power where needed.', ttsIntro: 'A smart city never sleeps. Learn how traffic grids and energy grids optimize flows in real time!' },

  // Phase 16: Agriculture & Farming
  { id: 'lesson-18-jr', phase: 16, title: 'Smart Farms: Helping Indian Farmers', subtitle: 'Phase 16: Agriculture & Farming', emoji: '🌾', youtubeId: 'oV74Najm6Nc', xpReward: 40, coinsReward: 15, zone: 'junior', sandboxType: 'playground', description: 'See how farmers take photos of crop leaves and use AI to immediately spot plant bugs.', ttsIntro: 'Let\'s visit the fields and see how farmers use mobile apps to check leaf health!' },
  { id: 'lesson-18-in', phase: 16, title: 'Precision Agriculture & Soil AI', subtitle: 'Phase 16: Agriculture & Farming', emoji: '🚜', youtubeId: 'oV74Najm6Nc', xpReward: 55, coinsReward: 22, zone: 'innovator', sandboxType: 'playground', description: 'Analyze soil moisture sensors, weather analytics, and drone imaging used to maximize crop yield.', ttsIntro: 'Food security is key. Learn how precision farming uses sensors and drones to grow more crop!' },

  // Phase 17: AI & Wildlife
  { id: 'lesson-19-jr', phase: 17, title: 'Animal Tracker AI: Saving Tigers', subtitle: 'Phase 17: AI & Wildlife', emoji: '🐯', youtubeId: 'iyiOVUbsPcM', xpReward: 40, coinsReward: 15, zone: 'junior', sandboxType: 'detective', description: 'Learn how smart wildlife cameras identify individual tigers from their stripe patterns!', ttsIntro: 'Let\'s go on a jungle safari and see how AI counts tigers by looking at their unique stripes!' },
  { id: 'lesson-19-in', phase: 17, title: 'Acoustic Monitoring: Listening to Forests', subtitle: 'Phase 17: AI & Wildlife', emoji: '🐾', youtubeId: 'iyiOVUbsPcM', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'detective', description: 'Explore bioacoustic AI that analyzes jungle audio feeds to detect poaching and locate animals.', ttsIntro: 'Nature speaks in sounds. Learn how bioacoustic AI detects illegal poaching by hearing gunshots!' },

  // Phase 18: Data & Privacy
  { id: 'lesson-20-jr', phase: 18, title: 'My Personal Data & Safe Surfing', subtitle: 'Phase 18: Data & Privacy', emoji: '🔒', youtubeId: 'mJeNghZXtMo', xpReward: 35, coinsReward: 12, zone: 'junior', sandboxType: 'quiz', description: 'What is "personal data" and why should we never share passwords or names online?', ttsIntro: 'Safety first! Let\'s learn why we must keep our personal details private when browsing.' },
  { id: 'lesson-20-in', phase: 18, title: 'Data Privacy: Keeping Your Info Safe', subtitle: 'Phase 18: Data & Privacy', emoji: '🔑', youtubeId: 'mJeNghZXtMo', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'quiz', description: 'Analyze data encryption, local vs cloud storage, and guidelines to secure web credentials.', ttsIntro: 'How do websites secure your information? Let\'s dive into hashing, cookies, and privacy protocols!' },

  // Phase 19: Generative Music
  { id: 'lesson-21-jr', phase: 19, title: 'AI Beatmaker: Creating Music', subtitle: 'Phase 19: Generative Music', emoji: '🎵', youtubeId: 'SVcsDDABEkM', xpReward: 35, coinsReward: 12, zone: 'junior', sandboxType: 'playground', description: 'Help an AI beatmaker mix drums and synthesizers to compose a futuristic video game track!', ttsIntro: 'Let\'s drop some beats! Mix sounds with the AI composer and make a game soundtrack!' },
  { id: 'lesson-21-in', phase: 19, title: 'Symphony AI: How Computers Compose', subtitle: 'Phase 19: Generative Music', emoji: '🎶', youtubeId: 'SVcsDDABEkM', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'playground', description: 'Analyze recurrent neural networks (RNNs) and MIDI generation algorithms that compose melodies.', ttsIntro: 'Can AI write classical music? Discover how neural networks analyze chord patterns to write songs!' },

  // Phase 20: Human-AI Collaboration
  { id: 'lesson-22-jr', phase: 20, title: 'AI & Me: Our Future Together', subtitle: 'Phase 20: Human-AI Collaboration', emoji: '🤝', youtubeId: 'aircAruvnKk', xpReward: 40, coinsReward: 15, zone: 'junior', sandboxType: 'quiz', description: 'How humans and smart assistants work as a super team to write stories, design toys, and study.', ttsIntro: 'Teamwork is best! Let\'s see how you and your AI helper can achieve great things together.' },
  { id: 'lesson-22-in', phase: 20, title: 'Human-AI Collaboration: The Future of Work', subtitle: 'Phase 20: Human-AI Collaboration', emoji: '💼', youtubeId: 'aircAruvnKk', xpReward: 55, coinsReward: 22, zone: 'innovator', sandboxType: 'quiz', description: 'Analyze co-piloting models, augmented intelligence, and the shift toward cognitive assistance in careers.', ttsIntro: 'The future job market will value human creativity combined with AI. Let\'s explore co-piloting!' },
];

export interface AICard {
  id: number;
  title: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  problem_solved: string;
  ai_power: string;
  fun_fact: string;
  color: string;
}

export const AI_CARDS_DATA: AICard[] = [
  { id: 1, title: 'AI Doctor', emoji: '👨‍⚕️', rarity: 'rare', problem_solved: 'Diagnosing diseases from X-rays and scans faster than human doctors', ai_power: 'Computer Vision + Deep Learning', fun_fact: 'AI can detect certain cancers with 94% accuracy — better than most doctors!', color: 'bg-red-500' },
  { id: 2, title: 'AI Farmer', emoji: '👨‍🌾', rarity: 'common', problem_solved: 'Detecting crop diseases from photos and predicting the best harvest time', ai_power: 'Image Recognition + Weather Prediction', fun_fact: 'AI farming can reduce water usage by 50% by only watering crops when needed!', color: 'bg-success' },
  { id: 3, title: 'AI Teacher', emoji: '👩‍🏫', rarity: 'common', problem_solved: 'Creating personalized learning paths for every student\'s needs', ai_power: 'Natural Language Processing + Adaptive Learning', fun_fact: 'AI tutors can explain the same concept 1000 different ways until you understand!', color: 'bg-blue-game' },
  { id: 4, title: 'AI Scientist', emoji: '🧬', rarity: 'epic', problem_solved: 'Discovering new medicines and solving scientific mysteries in days instead of years', ai_power: 'Protein Folding + Drug Discovery', fun_fact: 'AlphaFold AI solved a 50-year-old mystery about how proteins fold in just 2 years!', color: 'bg-primary' },
  { id: 5, title: 'AI Space Explorer', emoji: '🚀', rarity: 'legendary', problem_solved: 'Analyzing millions of stars and planets to find signs of life in outer space', ai_power: 'Signal Processing + Pattern Recognition', fun_fact: 'NASA\'s AI discovered 2 new exoplanets that human astronomers missed!', color: 'bg-purple-600' },
  { id: 6, title: 'AI Detective', emoji: '🕵️', rarity: 'rare', problem_solved: 'Finding missing people, solving crimes, and identifying fake news', ai_power: 'Facial Recognition + NLP + Fact-Checking', fun_fact: 'AI can analyze 10,000 documents in the time it takes to read one page!', color: 'bg-gray-600' },
  { id: 7, title: 'AI Storyteller', emoji: '📚', rarity: 'common', problem_solved: 'Creating stories, poems, and creative content for children and adults', ai_power: 'Large Language Models + Creative Generation', fun_fact: 'AI has written entire novels and composed music that fooled professional musicians!', color: 'bg-pink-500' },
];

export const STORY_QUESTS: StoryQuest[] = [
  // Junior quests
  { id: 'canteen', title: 'The Hungry Canteen Mystery', emoji: '🍱', description: 'The school canteen throws away 50 meals every day. Can AI predict exactly how many meals to cook?', difficulty: 1, xpReward: 80, solved: false, zone: 'junior' },
  { id: 'pet', title: 'Finding Fluffy', emoji: '🐕', description: "Raja's dog Fluffy is lost! Can AI scan camera footage across the city to find her?", difficulty: 1, xpReward: 80, solved: false, zone: 'junior' },
  { id: 'library', title: 'The Lost Library', emoji: '📚', description: '500 library books are missing! Can AI track which books go where and alert the librarian?', difficulty: 2, xpReward: 100, solved: false, zone: 'junior' },
  { id: 'rain', title: 'The Rainy Day Planner', emoji: '🌧️', description: 'Sports day keeps getting cancelled because of surprise rain. Can AI look at clouds and plan the perfect day?', difficulty: 2, xpReward: 100, solved: false, zone: 'junior' },
  // Innovator quests
  { id: 'traffic', title: 'The Traffic Jam Trap', emoji: '🚗', description: 'Every morning, terrible traffic jams block the road to school. Can AI predict and prevent them using sensor data?', difficulty: 2, xpReward: 100, solved: false, zone: 'innovator' },
  { id: 'water', title: 'The Leaky Lake', emoji: '💧', description: 'The village lake is running dry because people waste water. Can AI-powered sensors monitor and save it?', difficulty: 2, xpReward: 100, solved: false, zone: 'innovator' },
  { id: 'fire', title: 'Forest Fire Alert!', emoji: '🌳', description: 'Fires are destroying our forests. Can AI satellites detect fires from space before they spread?', difficulty: 3, xpReward: 120, solved: false, zone: 'innovator' },
  { id: 'crops', title: "Save Farmer Ramu's Crops", emoji: '🌾', description: "A strange disease is killing Farmer Ramu's wheat. Can AI identify it from a photo using image recognition?", difficulty: 3, xpReward: 120, solved: false, zone: 'innovator' },
  { id: 'hospital', title: 'The Hospital Queue', emoji: '🏥', description: 'Patients wait 4 hours to see a doctor. Can AI analyse appointment patterns to schedule smarter?', difficulty: 3, xpReward: 120, solved: false, zone: 'innovator' },
];

export const DETECTIVE_CASES: DetectiveCase[] = [
  // Junior cases
  { id: 1, imageEmoji: '📱🔒😊', scenario: "Your phone unlocks itself when it sees your face — even in the dark!", canAIHelp: 'yes', explanation: 'YES! AI uses Face Recognition to look at the shape of your eyes, nose, and face to identify you.', xp: 20, zone: 'junior' },
  { id: 2, imageEmoji: '📺🎬🍿', scenario: 'YouTube keeps showing you videos about cats, even though you never searched for cats!', canAIHelp: 'yes', explanation: 'YES! AI watches what videos you like and finds similar videos you will enjoy — this is recommendations!', xp: 20, zone: 'junior' },
  { id: 3, imageEmoji: '📚🔍😕', scenario: 'A student is struggling to understand maths but the teacher has 40 other students to help.', canAIHelp: 'yes', explanation: 'YES! AI tutors can explain the same idea in 100 different ways and give you as many practice questions as you need.', xp: 20, zone: 'junior' },
  { id: 4, imageEmoji: '🌈🌤️👗', scenario: 'Deciding what clothes to wear to school tomorrow morning.', canAIHelp: 'maybe', explanation: 'MAYBE! AI can check tomorrow\'s weather, but it cannot know your personal fashion preferences!', xp: 15, zone: 'junior' },
  { id: 5, imageEmoji: '🐕🏃🌳', scenario: "Raja's dog Fluffy ran away. The street has many CCTV cameras.", canAIHelp: 'yes', explanation: 'YES! AI can scan hundreds of camera recordings at once to find a dog matching Fluffy\'s stripes and size.', xp: 20, zone: 'junior' },
  { id: 6, imageEmoji: '🎨🖌️✨', scenario: 'Creating a painting that expresses how happy you felt on your birthday.', canAIHelp: 'no', explanation: 'NOT QUITE! AI can generate images, but it cannot feel human happiness or memories.', xp: 10, zone: 'junior' },
  { id: 7, imageEmoji: '🌧️☂️🏫', scenario: 'The school wants to know if it will rain during Sports Day next Saturday.', canAIHelp: 'yes', explanation: 'YES! AI weather systems analyse satellite images, temperature data, and patterns to predict rain.', xp: 20, zone: 'junior' },
  { id: 8, imageEmoji: '🍱🗑️😢', scenario: 'The school canteen cooks 200 meals but only 140 students eat — food goes to waste!', canAIHelp: 'yes', explanation: 'YES! AI can look at attendance history, calendar events, and predict exactly how many meals to cook.', xp: 20, zone: 'junior' },

  // Innovator cases
  { id: 101, imageEmoji: '🚗🚗🚗🚦', scenario: 'A 3km traffic jam forms near the school gates every morning at exactly 8 AM.', canAIHelp: 'yes', explanation: 'YES! AI analyses camera streams and adjusts traffic light timings dynamically to prevent blockages.', xp: 20, zone: 'innovator' },
  { id: 102, imageEmoji: '🌊🐟💧🏭', scenario: "A river is turning dark and smelly — fish are dying near a factory outlet.", canAIHelp: 'yes', explanation: 'YES! AI-powered sensors measure chemical levels and instantly alert pollution authorities if toxic spills occur.', xp: 20, zone: 'innovator' },
  { id: 103, imageEmoji: '🏥👩‍⚕️🩺', scenario: 'A hospital needs to check 500 X-ray scans for signs of lung disease, but only has 2 radiologists.', canAIHelp: 'yes', explanation: 'YES! AI can pre-analyse scans and flag suspicious files for priority medical review.', xp: 20, zone: 'innovator' },
  { id: 104, imageEmoji: '🎭📹🗣️', scenario: 'A video of a famous leader saying something shocking spreads on WhatsApp.', canAIHelp: 'maybe', explanation: 'MAYBE! AI deepfake detectors can find unnatural frames, but deepfakes are constantly evolving.', xp: 15, zone: 'innovator' },
  { id: 105, imageEmoji: '👴❤️🤖', scenario: 'An elderly person living alone is lonely and wants someone to talk to every day.', canAIHelp: 'maybe', explanation: 'MAYBE! AI chatbots talk dynamically, but they cannot replace genuine human friendship or physical touch.', xp: 15, zone: 'innovator' },
  { id: 106, imageEmoji: '🌾🌡️💧🌿', scenario: "Farmer Ramu's wheat crop is developing yellow patches but he cannot identify the disease.", canAIHelp: 'yes', explanation: 'YES! AI image recognition matches leaf patterns against thousands of crop disease samples.', xp: 20, zone: 'innovator' },
  { id: 107, imageEmoji: '🏛️⚖️🤔', scenario: 'A bank uses AI to automatically approve or reject loan applications for small businesses.', canAIHelp: 'maybe', explanation: 'MAYBE! AI processes data fast, but if training data contains historical biases, the AI will repeat them.', xp: 15, zone: 'innovator' },
  { id: 108, imageEmoji: '🌲🔥🛰️', scenario: 'A forest covering 1000 km² is at high risk of fire but rangers cannot patrol everywhere.', canAIHelp: 'yes', explanation: 'YES! AI satellites detect thermal hotspots in real time, alerting fire units before flames spread.', xp: 20, zone: 'innovator' },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Junior questions
  { id: 1, question: 'What does "AI" stand for?', options: ['Amazing Intelligence', 'Artificial Intelligence', 'Automatic Internet', 'Android Interface'], correct: 1, emoji: '🤖', xp: 10, zone: 'junior' },
  { id: 2, question: 'Which of these uses AI to help you?', options: ['A regular light switch', 'YouTube recommending videos you like', 'A pencil writing on paper', 'A clock showing the time'], correct: 1, emoji: '📺', xp: 10, zone: 'junior' },
  { id: 3, question: 'How does AI learn to recognise pictures of dogs?', options: ['By reading books about dogs', 'By looking at thousands of dog photos', 'By asking pet owners', 'AI cannot recognise dogs'], correct: 1, emoji: '🐶', xp: 15, zone: 'junior' },
  { id: 4, question: 'Which of these is an AI helper you might use at home?', options: ['A ceiling fan', 'A bookshelf', 'Alexa or Google Assistant', 'A dining table'], correct: 2, emoji: '🔊', xp: 10, zone: 'junior' },
  { id: 5, question: 'What does a smart speaker like Alexa use to understand you?', options: ['Lip reading', 'Voice recognition AI', 'A person listening inside', 'Sign language'], correct: 1, emoji: '🎤', xp: 15, zone: 'junior' },
  { id: 6, question: 'Which AI tool could help find your lost pet?', options: ['A calculator', 'Camera recognition AI that scans footage', 'A dictionary', 'A ruler'], correct: 1, emoji: '🐕', xp: 15, zone: 'junior' },
  { id: 7, question: 'What can AI do when it makes a mistake?', options: ['It is always right', 'It can learn from the mistake with more data', 'It breaks permanently', 'It calls a human for help always'], correct: 1, emoji: '⚠️', xp: 15, zone: 'junior' },
  { id: 8, question: 'Which of these is something AI CANNOT do yet?', options: ['Play chess', 'Drive a car', 'Truly feel happy or sad', 'Recognize a face'], correct: 2, emoji: '❤️', xp: 20, zone: 'junior' },
  { id: 9, question: 'How does AI help the school canteen waste less food?', options: ['By cooking the food', 'By predicting how many students will come', 'By serving students faster', 'By changing the menu daily'], correct: 1, emoji: '🍱', xp: 15, zone: 'junior' },
  { id: 10, question: 'What does "Face ID" on a phone use?', options: ['A mirror', 'AI facial recognition technology', 'A fingerprint scanner', 'A password'], correct: 1, emoji: '📱', xp: 10, zone: 'junior' },

  // Innovator questions
  { id: 101, question: 'What is "Machine Learning"?', options: ['Robots learning to walk', 'AI learning patterns from large amounts of data', 'Computers repairing themselves', 'Machines teaching humans'], correct: 1, emoji: '🧠', xp: 15, zone: 'innovator' },
  { id: 102, question: 'Why might an AI image generator always show "pilots" as male?', options: ['Because most pilots are male', 'Because the training data had mostly male pilots', 'Because AI prefers male characters', 'This never happens with good AI'], correct: 1, emoji: '✈️', xp: 20, zone: 'innovator' },
  { id: 103, question: 'What is a "deepfake"?', options: ['A very deep ocean photograph', 'AI-generated fake videos or images of real people', 'A hidden camera recording', 'A type of virtual reality game'], correct: 1, emoji: '🎭', xp: 20, zone: 'innovator' },
  { id: 104, question: 'What do you call the instructions you give to an AI chatbot?', options: ['A command line', 'A piece of code', 'A prompt', 'A query string'], correct: 2, emoji: '💬', xp: 15, zone: 'innovator' },
  { id: 105, question: 'What is "training data" in machine learning?', options: ['Data created by the AI itself', 'Examples the AI learns from to make future decisions', 'Data only used for testing', 'Secret data hidden from users'], correct: 1, emoji: '📊', xp: 15, zone: 'innovator' },
  { id: 106, question: 'Which company created ChatGPT?', options: ['Google', 'Apple', 'OpenAI', 'Microsoft'], correct: 2, emoji: '🤖', xp: 10, zone: 'innovator' },
  { id: 107, question: 'What is "AI bias" most commonly caused by?', options: ['Viruses in the AI software', 'Unrepresentative or unfair training data', 'The AI having personal opinions', 'Too little computing power'], correct: 1, emoji: '⚖️', xp: 20, zone: 'innovator' },
  { id: 108, question: 'What is "prompt engineering"?', options: ['Building physical robots', 'Crafting effective instructions to get better results from AI', 'Writing code for AI algorithms', 'Designing computer hardware'], correct: 1, emoji: '✨', xp: 20, zone: 'innovator' },
  { id: 109, question: 'What does "generative AI" mean?', options: ['AI that generates electricity', 'AI that can create new content like text, images, or music', 'AI that generates error reports', 'AI built for one specific generation of people'], correct: 1, emoji: '🎨', xp: 15, zone: 'innovator' },
  { id: 110, question: 'What is the main ethical concern when AI is used to make hiring decisions?', options: ['It is too slow', 'It may perpetuate historical biases present in training data', 'Companies cannot afford it', 'AI prefers certain age groups'], correct: 1, emoji: '🏢', xp: 20, zone: 'innovator' },
];

export const WEEKLY_MISSIONS_DATA: WeeklyMission[] = [
  // Junior missions (10 items)
  { id: 1, title: '🏠 Home AI Hunter', description: 'Find 3 things in your home that use AI or smart technology. Describe what they do and how they are smart!', xp_reward: 80, emoji: '🏠', difficulty: 'Easy', zone: 'junior' },
  { id: 2, title: '🐾 Animal Friend AI', description: 'Find 2 apps, devices, or examples of how technology helps animals — like a pet collar tracker, veterinary app, or wildlife camera. Describe them!', xp_reward: 80, emoji: '🐾', difficulty: 'Easy', zone: 'junior' },
  { id: 3, title: '📺 Smart Screen Spotter', description: 'Watch a screen (TV, phone, or tablet) for 10 minutes and count how many times AI made a recommendation or suggestion. Write down 3 examples!', xp_reward: 100, emoji: '📺', difficulty: 'Medium', zone: 'junior' },
  { id: 4, title: '🎮 Helpful Robot Helper', description: 'Ask a parent or older sibling: "Can you show me one way technology makes your day easier?" Write down what they showed you and how it works!', xp_reward: 80, emoji: '🎮', difficulty: 'Easy', zone: 'junior' },
  { id: 5, title: '🌿 Nature Camera Spy', description: 'Find a camera nearby (e.g. phone or security) and research how AI counts birds or butterflies. Write down 2 sentences on how camera filters help.', xp_reward: 90, emoji: '🌿', difficulty: 'Medium', zone: 'junior' },
  { id: 6, title: '🗑️ Trash Classifier Hunt', description: 'Sort 5 waste items at home and explain how an AI smart recycling bin could use a camera to classify paper vs plastic.', xp_reward: 80, emoji: '🗑', difficulty: 'Easy', zone: 'junior' },
  { id: 7, title: '🎙️ Smart Voice Simulator', description: 'Give 3 voice commands to a device (e.g. Alexa or phone search) and write down if it understood you perfectly or made a mistake.', xp_reward: 90, emoji: '🎙️', difficulty: 'Medium', zone: 'junior' },
  { id: 8, title: '🚗 Auto Route Spotter', description: 'Observe Google Maps navigation on a trip. List how it shows traffic, orange/red lines, and estimated time using history.', xp_reward: 90, emoji: '🚗', difficulty: 'Medium', zone: 'junior' },
  { id: 9, title: '🎨 AI Storybook Checker', description: 'Look at some digital illustrations online. Spot if any look like they were generated by AI (look at hands, text, or details). Describe what you found.', xp_reward: 100, emoji: '🎨', difficulty: 'Hard', zone: 'junior' },
  { id: 10, title: '👽 Space Explorer Rover', description: 'Read about the Mars Rover cameras. Propose one way AI helps the rover decide where to drive when signals take 20 minutes to reach Earth!', xp_reward: 100, emoji: '👽', difficulty: 'Hard', zone: 'junior' },

  // Innovator missions (10 items)
  { id: 101, title: '⏰ Time Waster Finder', description: 'Find 3 places in your school or neighbourhood where people waste time waiting. For each one, describe how AI could predict or reduce that wait time.', xp_reward: 100, emoji: '⏰', difficulty: 'Medium', zone: 'innovator' },
  { id: 102, title: '🌍 Problem Spotter', description: 'Find a real local problem in your school, neighbourhood, or city. Describe the problem clearly and propose how AI sensors, cameras, or smart systems could solve it.', xp_reward: 120, emoji: '🌍', difficulty: 'Hard', zone: 'innovator' },
  { id: 103, title: '🤖 AI Interview', description: 'Interview a parent, teacher, or neighbour: "How does technology help in your work?" Ask follow-up questions and write a detailed summary of what you learned.', xp_reward: 80, emoji: '🤖', difficulty: 'Easy', zone: 'innovator' },
  { id: 104, title: '🔍 Bias Detector', description: 'Search for one example where AI gave an unfair or surprising result (e.g. voice assistant misunderstandings or search bias). Explain why it might happen.', xp_reward: 120, emoji: '🔍', difficulty: 'Hard', zone: 'innovator' },
  { id: 105, title: '🛡️ Account Security Audit', description: 'Check your family security passwords and verify how multi-factor authentication (MFA) and AI threat detectors protect signups.', xp_reward: 100, emoji: '🛡️', difficulty: 'Medium', zone: 'innovator' },
  { id: 106, title: '🌾 Smart Farming Report', description: 'Analyze leaf disease image dataset concepts. Write down how a neural network trains on plant leaf photos to tell if wheat is healthy.', xp_reward: 100, emoji: '🌾', difficulty: 'Medium', zone: 'innovator' },
  { id: 107, title: '🚦 Traffic Scheduling Model', description: 'Examine a busy intersection near your home. Design a 3-step AI algorithm that uses camera feeds to dynamic-shift green light timers.', xp_reward: 110, emoji: '🚦', difficulty: 'Medium', zone: 'innovator' },
  { id: 108, title: '🌳 Satellite Forest Fire Map', description: 'Propose how thermal sensors and computer vision algorithms on small satellites detect early canopy fires. Explain details.', xp_reward: 120, emoji: '🌳', difficulty: 'Hard', zone: 'innovator' },
  { id: 109, title: '⚖️ AI Recruiting Analysis', description: 'Explain why an automated resume-screening AI might accidentally filter out female applicants if historical data is biased.', xp_reward: 120, emoji: '⚖️', difficulty: 'Hard', zone: 'innovator' },
  { id: 110, title: '💼 Work Augmented Future', description: 'Identify a job (e.g. doctor, teacher, clerk) and describe how they will collaborate with AI tools in 2035 instead of being replaced.', xp_reward: 100, emoji: '💼', difficulty: 'Medium', zone: 'innovator' },
];

export interface PlayModule {
  path: string;
  emoji: string;
  title: string;
  desc: string;
  gradFrom: string;
  gradTo: string;
  border: string;
  shadow: string;
  zones: ('junior' | 'innovator')[];
  completionKey: string;
}

export const PLAY_MODULES_DATA: PlayModule[] = [
  // Both zones (3 items)
  { path: '/play/quiz', emoji: '🎯', title: 'Quiz Arena', desc: 'Test your general AI knowledge', gradFrom: '#EC4899', gradTo: '#7C3AED', border: '#EC4899', shadow: '#BE185D', zones: ['junior', 'innovator'], completionKey: 'play_completed_quiz' },
  { path: '/play/cards', emoji: '🃏', title: 'AI Cards', desc: 'Collect all 7 AI hero cards!', gradFrom: '#F59E0B', gradTo: '#10B981', border: '#F59E0B', shadow: '#D97706', zones: ['junior', 'innovator'], completionKey: 'play_completed_cards' },
  { path: '/play/inventor-hall', emoji: '🏛️', title: 'Inventor Hall', desc: 'Check the global showcase of inventions', gradFrom: '#8B5CF6', gradTo: '#EF4444', border: '#8B5CF6', shadow: '#6D28D9', zones: ['junior', 'innovator'], completionKey: 'play_completed_inventor-hall' },

  // Junior only zones (17 items)
  { path: '/play/around-me', emoji: '🌍', title: 'AI Around Me', desc: 'Discover AI items in your daily world', gradFrom: '#3B82F6', gradTo: '#8B5CF6', border: '#3B82F6', shadow: '#1D4ED8', zones: ['junior'], completionKey: 'play_completed_around-me' },
  { path: '/play/story', emoji: '⚔️', title: 'Story Adventures', desc: '8 epic quests to solve', gradFrom: '#7C3AED', gradTo: '#3B82F6', border: '#7C3AED', shadow: '#5B21B6', zones: ['junior'], completionKey: 'quests' },
  { path: '/play/detective', emoji: '🕵️', title: 'AI Detective', desc: 'Can AI help here? Solve the case files', gradFrom: '#10B981', gradTo: '#3B82F6', border: '#10B981', shadow: '#047857', zones: ['junior'], completionKey: 'play_completed_detective' },
  { path: '/play/quiz?topic=space', emoji: '🌌', title: 'Space AI Quiz', desc: 'Test your knowledge on space rovers & stars', gradFrom: '#3B82F6', gradTo: '#1D4ED8', border: '#3B82F6', shadow: '#1E3A8A', zones: ['junior'], completionKey: 'play_completed_quiz_space' },
  { path: '/play/quiz?topic=robotics', emoji: '🦾', title: 'Robotics Trivia', desc: 'Find out how smart robotic pets think', gradFrom: '#8B5CF6', gradTo: '#7C3AED', border: '#8B5CF6', shadow: '#4C1D95', zones: ['junior'], completionKey: 'play_completed_quiz_robotics' },
  { path: '/play/quiz?topic=everyday', emoji: '📱', title: 'Everyday AI Quiz', desc: 'Identify AI in smartphones & YouTube feeds', gradFrom: '#EC4899', gradTo: '#DB2777', border: '#EC4899', shadow: '#831843', zones: ['junior'], completionKey: 'play_completed_quiz_everyday' },
  { path: '/play/quiz?topic=smarthome', emoji: '🏠', title: 'Smart Home Trivia', desc: 'Verify how smart lights and AC save power', gradFrom: '#EF4444', gradTo: '#DC2626', border: '#EF4444', shadow: '#7F1D1D', zones: ['junior'], completionKey: 'play_completed_quiz_smarthome' },
  { path: '/play/detective?category=wildlife', emoji: '🐯', title: 'Wildlife Case Files', desc: 'Check cases on camera traps & tiger stripes', gradFrom: '#10B981', gradTo: '#059669', border: '#10B981', shadow: '#064E3B', zones: ['junior'], completionKey: 'play_completed_detective_wildlife' },
  { path: '/play/detective?category=india', emoji: '🇮🇳', title: 'Indian AI Cases', desc: 'Analyse crop Leaf Spotters & smart cities', gradFrom: '#F59E0B', gradTo: '#D97706', border: '#F59E0B', shadow: '#78350F', zones: ['junior'], completionKey: 'play_completed_detective_india' },
  { path: '/play/around-me?type=sound', emoji: '🔊', title: 'Sound Recognizer', desc: 'Listen & tell if sound filters use AI classifiers', gradFrom: '#3B82F6', gradTo: '#2563EB', border: '#3B82F6', shadow: '#1E3A8A', zones: ['junior'], completionKey: 'play_completed_around-me_sound' },
  { path: '/play/around-me?type=eco', emoji: '🌱', title: 'Eco Sorting Game', desc: 'Categorize recyclable goods using smart camera rules', gradFrom: '#10B981', gradTo: '#059669', border: '#10B981', shadow: '#064E3B', zones: ['junior'], completionKey: 'play_completed_around-me_eco' },
  { path: '/play/around-me?type=pet', emoji: '🐶', title: 'Pet Robot Trainer', desc: 'Train an virtual puppy to sit and roll with gestures', gradFrom: '#F59E0B', gradTo: '#D97706', border: '#F59E0B', shadow: '#78350F', zones: ['junior'], completionKey: 'play_completed_around-me_pet' },
  { path: '/play/around-me?type=speaker', emoji: '🎙️', title: 'Smart Speaker Sim', desc: 'Try speaking with voice command accuracy checkers', gradFrom: '#EC4899', gradTo: '#DB2777', border: '#EC4899', shadow: '#831843', zones: ['junior'], completionKey: 'play_completed_around-me_speaker' },
  { path: '/play/around-me?type=drawing', emoji: '🎨', title: 'AI Drawing Canvas', desc: 'Draw a sketch and let AI match your canvas speed', gradFrom: '#8B5CF6', gradTo: '#7C3AED', border: '#8B5CF6', shadow: '#4C1D95', zones: ['junior'], completionKey: 'play_completed_around-me_drawing' },
  { path: '/play/quiz?topic=future', emoji: '🪐', title: 'Future Explorer Quiz', desc: 'Predict space navigation & self-driving car grids', gradFrom: '#3B82F6', gradTo: '#1D4ED8', border: '#3B82F6', shadow: '#1E3A8A', zones: ['junior'], completionKey: 'play_completed_quiz_future' },
  { path: '/play/story?quest=canteen', emoji: '🍱', title: 'Canteen Waste Mystery', desc: 'Try solving the Canteen Food waste prediction story', gradFrom: '#EF4444', gradTo: '#DC2626', border: '#EF4444', shadow: '#7F1D1D', zones: ['junior'], completionKey: 'quests_canteen' },
  { path: '/play/story?quest=pet', emoji: '🐕', title: 'Lost Dog Quest', desc: 'Solve camera scans for Raja\'s lost dog Fluffy', gradFrom: '#10B981', gradTo: '#059669', border: '#10B981', shadow: '#064E3B', zones: ['junior'], completionKey: 'quests_pet' },

  // Innovator only zones (17 items)
  { path: '/play/brainstorm', emoji: '💡', title: 'Brainstorm Lab', desc: 'Create your AI prototype wizard', gradFrom: '#F59E0B', gradTo: '#FCD34D', border: '#F59E0B', shadow: '#D97706', zones: ['innovator'], completionKey: 'inventions' },
  { path: '/play/idea-generator', emoji: '⚡', title: 'Idea Generator', desc: 'Input local issues and get 3 AI solution templates', gradFrom: '#EF4444', gradTo: '#F59E0B', border: '#EF4444', shadow: '#991B1B', zones: ['innovator'], completionKey: 'ideas' },
  { path: '/comic', emoji: '📚', title: 'Comic Creator', desc: 'Build your AI adventure graphic page!', gradFrom: '#7C3AED', gradTo: '#EC4899', border: '#7C3AED', shadow: '#5B21B6', zones: ['innovator'], completionKey: 'play_completed_comic' },
  { path: '/play/detective?category=deepfakes', emoji: '🎭', title: 'Deepfakes Case Files', desc: 'Spot synthetic audio/video manipulation clues', gradFrom: '#3B82F6', gradTo: '#2563EB', border: '#3B82F6', shadow: '#1E3A8A', zones: ['innovator'], completionKey: 'play_completed_detective_deepfakes' },
  { path: '/play/detective?category=bias', emoji: '⚖️', title: 'Data Bias Case Files', desc: 'Debug automated hiring grids & training bias', gradFrom: '#EF4444', gradTo: '#DC2626', border: '#EF4444', shadow: '#7F1D1D', zones: ['innovator'], completionKey: 'play_completed_detective_bias' },
  { path: '/play/quiz?topic=ml', emoji: '🧠', title: 'Advanced ML Quiz', desc: 'Answer questions on training datasets & cost functions', gradFrom: '#8B5CF6', gradTo: '#7C3AED', border: '#8B5CF6', shadow: '#4C1D95', zones: ['innovator'], completionKey: 'play_completed_quiz_ml' },
  { path: '/play/quiz?topic=nlp', emoji: '🗣️', title: 'NLP & Chatbot Trivia', desc: 'Test keywords on tokenizers and LLM speech parameters', gradFrom: '#10B981', gradTo: '#059669', border: '#10B981', shadow: '#064E3B', zones: ['innovator'], completionKey: 'play_completed_quiz_nlp' },
  { path: '/play/quiz?topic=climate', emoji: '🌪', title: 'Climate Predictor Quiz', desc: 'Understand meteorology simulations & satellite sensors', gradFrom: '#F59E0B', gradTo: '#D97706', border: '#F59E0B', shadow: '#78350F', zones: ['innovator'], completionKey: 'play_completed_quiz_climate' },
  { path: '/play/quiz?topic=medical', emoji: '🩺', title: 'Medical Imaging Trivia', desc: 'Check how CNN computer vision identifies anomalies', gradFrom: '#EC4899', gradTo: '#DB2777', border: '#EC4899', shadow: '#831843', zones: ['innovator'], completionKey: 'play_completed_quiz_medical' },
  { path: '/play/brainstorm?mode=prompts', emoji: '✍️', title: 'Prompt Engineer Lab', desc: 'Draft instruction scopes and context roles', gradFrom: '#3B82F6', gradTo: '#2563EB', border: '#3B82F6', shadow: '#1E3A8A', zones: ['innovator'], completionKey: 'play_completed_brainstorm_prompts' },
  { path: '/play/idea-generator?mode=startup', emoji: '💼', title: 'AI Startup Builder', desc: 'Design revenue plans for community diagnostic grids', gradFrom: '#10B981', gradTo: '#059669', border: '#10B981', shadow: '#064E3B', zones: ['innovator'], completionKey: 'play_completed_idea-generator_startup' },
  { path: '/play/brainstorm?mode=ethics', emoji: '⚖️', title: 'Ethical AI Debate', desc: 'Map frameworks for privacy laws & accountability codes', gradFrom: '#F59E0B', gradTo: '#D97706', border: '#F59E0B', shadow: '#78350F', zones: ['innovator'], completionKey: 'play_completed_brainstorm_ethics' },
  { path: '/play/inventor-hall?filter=india', emoji: '🇮🇳', title: 'India Innovator Show', desc: 'Browse agricultural & medical projects built locally', gradFrom: '#EC4899', gradTo: '#DB2777', border: '#EC4899', shadow: '#831843', zones: ['innovator'], completionKey: 'play_completed_inventor-hall_india' },
  { path: '/play/cards?category=supercomputers', emoji: '🖥️', title: 'Supercomputer Arena', desc: 'Learn specs of giant Indian & global AI clusters', gradFrom: '#8B5CF6', gradTo: '#7C3AED', border: '#8B5CF6', shadow: '#4C1D95', zones: ['innovator'], completionKey: 'play_completed_cards_supercomputers' },
  { path: '/play/detective?category=satellites', emoji: '🛰️', title: 'Canopy Fire Radar', desc: 'Examine thermal imagery detection scenarios', gradFrom: '#3B82F6', gradTo: '#1D4ED8', border: '#3B82F6', shadow: '#1E3A8A', zones: ['innovator'], completionKey: 'play_completed_detective_satellites' },
  { path: '/play/detective?category=traffic', emoji: '🚦', title: 'Smart Grid Planner', desc: 'Solve green light scheduling algorithm case files', gradFrom: '#EF4444', gradTo: '#DC2626', border: '#EF4444', shadow: '#7F1D1D', zones: ['innovator'], completionKey: 'play_completed_detective_traffic' },
  { path: '/play/quiz?topic=futurework', emoji: '🤝', title: 'Future of Work Quiz', desc: 'Map jobs boosted by co-pilots and smart bots', gradFrom: '#10B981', gradTo: '#059669', border: '#10B981', shadow: '#064E3B', zones: ['innovator'], completionKey: 'play_completed_quiz_futurework' },
];

