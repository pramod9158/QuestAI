export interface VideoCheckpoint {
  timestampSeconds: number;
  type: 'predict' | 'guess' | 'vote' | 'quick-quiz';
  question: string;
  options?: string[];
  correctIndex?: number;
  xpReward: number;
}

export interface AILabChallenge {
  id: string;
  instruction: string;
  type: 'prompt' | 'classify' | 'create' | 'experiment' | 'compare';
  xpReward: number;
}

export interface AILabConfig {
  type: 'prompt-lab' | 'train-lab' | 'create-lab' | 'explore-lab' | 'detective-lab';
  title: string;
  description: string;
  challenges: AILabChallenge[];
  badgeId?: string;
}

export interface MicroProject {
  title: string;
  description: string;
  type: 'create' | 'experiment' | 'design' | 'build' | 'solve';
  xpReward: number;
  deliverable: string;
}

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
  // NEW: Mission-based engagement fields
  missionTitle: string;
  missionEmoji: string;
  curiosityHook: string;
  storyContext: string;
  videoDuration: string;
  labDuration: string;
  projectDuration: string;
  videoCheckpoints: VideoCheckpoint[];
  aiLab: AILabConfig;
  microProject: MicroProject;
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
  { id: 'lesson-1', phase: 1, title: 'Is My Smartphone Alive?', subtitle: 'Phase 1: Awareness', emoji: '📱', youtubeId: 'mJeNghZXtMo', xpReward: 30, coinsReward: 10, zone: 'junior', sandboxType: 'dragdrop', description: 'Discover how your phone uses AI to do amazing things — from recognizing faces to predicting words!', ttsIntro: 'Welcome! Did you know your smartphone is secretly powered by Artificial Intelligence? Let\'s find out how!',
    missionTitle: 'Operation: Smart Spy', missionEmoji: '🕵️', curiosityHook: 'Is your phone secretly spying on you... or secretly helping you?', storyContext: 'Agent, we\'ve detected strange intelligence inside everyday gadgets. Your mission: figure out which household items have hidden AI brains!', videoDuration: '5 min', labDuration: '8 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 60, type: 'guess', question: 'Which of these is powered by AI?', options: ['A pencil', 'Face unlock on your phone', 'A chair', 'A clock'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 180, type: 'predict', question: 'Can AI predict what word you\'ll type next?', options: ['Yes, using patterns!', 'No, it\'s random'], correctIndex: 0, xpReward: 5 },
    ],
    aiLab: { type: 'explore-lab', title: 'Smart or Not? Sorting Lab', description: 'Sort everyday items into AI-powered vs not AI-powered categories', challenges: [
      { id: 'sort-1', instruction: 'Sort all 8 items correctly into Smart AI vs Not Smart', type: 'experiment', xpReward: 10 },
      { id: 'sort-2', instruction: 'Find 2 more AI-powered things in your house and add them', type: 'create', xpReward: 10 },
    ], badgeId: 'ai_spotter' },
    microProject: { title: 'My AI Map', description: 'Draw a map of your home and mark every AI-powered device you can find', type: 'create', xpReward: 15, deliverable: 'A list of AI devices in your home' },
  },
  { id: 'lesson-1-in', phase: 1, title: 'Understanding AI & Algorithms', subtitle: 'Phase 1: Awareness', emoji: '🧠', youtubeId: '6hfOvs8pY1k', xpReward: 40, coinsReward: 15, zone: 'innovator', sandboxType: 'quiz', description: 'Dive deep into how computer programs make decisions and what makes an algorithm "intelligent".', ttsIntro: 'What exactly is an algorithm? Let\'s break down how machines solve complex problems!',
    missionTitle: 'Code Breaker Academy', missionEmoji: '🔐', curiosityHook: 'What makes a machine "intelligent" vs just following orders?', storyContext: 'You\'ve been accepted into the Code Breaker Academy. Your first challenge: crack the difference between a simple recipe and a true AI algorithm!', videoDuration: '6 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 90, type: 'quick-quiz', question: 'What is the main difference between a regular program and AI?', options: ['Speed', 'AI learns from data', 'AI is bigger', 'AI uses the internet'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 240, type: 'predict', question: 'Can a sorting algorithm be called AI?', options: ['Yes — it solves problems', 'No — it doesn\'t learn or adapt'], correctIndex: 1, xpReward: 5 },
    ],
    aiLab: { type: 'explore-lab', title: 'Algorithm Playground', description: 'Compare rule-based programs vs learning-based AI', challenges: [
      { id: 'algo-1', instruction: 'Match 5 tasks to whether they need rules or learning', type: 'experiment', xpReward: 10 },
      { id: 'algo-2', instruction: 'Design a simple 3-step algorithm for sorting your bookshelf', type: 'create', xpReward: 10 },
    ], badgeId: 'algorithm_master' },
    microProject: { title: 'Algorithm vs AI', description: 'Write down 3 examples of rule-based programs and 3 examples of learning AI', type: 'create', xpReward: 15, deliverable: 'A comparison list of algorithms vs AI' },
  },

  // Phase 2: Vision & Sound
  { id: 'lesson-3', phase: 2, title: 'How Computers See Faces', subtitle: 'Phase 2: Vision & Sound', emoji: '👁️', youtubeId: 'OcycT1Jwsns', xpReward: 40, coinsReward: 15, zone: 'junior', sandboxType: 'teachable', description: 'Learn how cameras and AI can recognize faces — just like how you recognize your friends!', ttsIntro: 'Your eyes see the world, and now computers can too! Let\'s explore how AI sees faces!',
    missionTitle: 'Operation: Robot Eyes', missionEmoji: '👁️', curiosityHook: 'Can a robot recognize your face in a crowd of 1000 people?', storyContext: 'Your robot companion has lost its vision chip! Train it to see faces again before the AI tournament begins!', videoDuration: '5 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 60, type: 'guess', question: 'How does Face ID know it\'s you and not your friend?', options: ['It reads your name tag', 'It maps your unique facial features', 'It checks your password'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 180, type: 'vote', question: 'Would you trust a robot to recognize you?', options: ['Absolutely!', 'Only sometimes', 'Not yet!'], xpReward: 3 },
    ],
    aiLab: { type: 'train-lab', title: 'Face Recognition Lab', description: 'Train your own AI to recognize objects using your webcam!', challenges: [
      { id: 'face-1', instruction: 'Train the AI with 10 samples of Class A (e.g. your hand)', type: 'classify', xpReward: 10 },
      { id: 'face-2', instruction: 'Train Class B and test the predictions — aim for 80% accuracy!', type: 'classify', xpReward: 15 },
    ], badgeId: 'vision_detective' },
    microProject: { title: 'My Vision AI', description: 'Train a 2-class image classifier and show a friend how it works', type: 'experiment', xpReward: 15, deliverable: 'A trained image classifier' },
  },
  { id: 'lesson-3-in', phase: 2, title: 'Computer Vision & Deep Learning', subtitle: 'Phase 2: Vision & Sound', emoji: '🔍', youtubeId: 'R9OHn5ZF4Uo', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'teachable', description: 'Explore neural networks trained on millions of images, facial landmarks, and automated segmentation.', ttsIntro: 'Deep Learning enables computers to analyze complex visual scenes. Let\'s explore convolutional networks!',
    missionTitle: 'Neural Network Architect', missionEmoji: '🏗️', curiosityHook: 'How can a machine learn to see better than a human eye?', storyContext: 'The city\'s security system is down. You must rebuild the vision neural network layer by layer to restore automated surveillance!', videoDuration: '6 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 120, type: 'quick-quiz', question: 'What is a convolutional layer in a neural network?', options: ['A layer that detects patterns in images', 'A layer that stores passwords', 'A layer that sends emails'], correctIndex: 0, xpReward: 5 },
      { timestampSeconds: 240, type: 'predict', question: 'Can a CNN trained on dogs also recognize cats?', options: ['Yes, automatically', 'No, it needs new training data'], correctIndex: 1, xpReward: 5 },
    ],
    aiLab: { type: 'train-lab', title: 'Deep Vision Lab', description: 'Build and test your own image classifier with multiple classes', challenges: [
      { id: 'deep-1', instruction: 'Create a 3-class classifier with at least 15 samples each', type: 'classify', xpReward: 15 },
      { id: 'deep-2', instruction: 'Test accuracy and improve by adding more varied samples', type: 'experiment', xpReward: 10 },
    ], badgeId: 'deep_vision' },
    microProject: { title: 'Vision Report', description: 'Document how adding more training data changed your classifier accuracy', type: 'experiment', xpReward: 15, deliverable: 'An accuracy improvement report' },
  },

  // Phase 3: Generative AI
  { id: 'lesson-8', phase: 3, title: 'AI Art: From Words to Pictures', subtitle: 'Phase 3: Generative AI', emoji: '🎨', youtubeId: 'SVcsDDABEkM', xpReward: 45, coinsReward: 18, zone: 'junior', sandboxType: 'comic', description: 'See how AI turns text descriptions into images. Then create your own AI comic book page!', ttsIntro: 'Imagine a flying elephant in space! Now AI can draw it for you. Let\'s create some art together!',
    missionTitle: 'Comic Universe Creator', missionEmoji: '🎨', curiosityHook: 'Can AI draw a superhero that nobody has ever imagined before?', storyContext: 'The AI Art Museum needs new exhibits! Design a 3-panel comic strip featuring an AI superhero to win the top exhibit spot!', videoDuration: '5 min', labDuration: '10 min', projectDuration: '8 min',
    videoCheckpoints: [
      { timestampSeconds: 90, type: 'guess', question: 'How does AI create images from text?', options: ['It copies images from Google', 'It learns patterns from millions of images', 'It uses a camera'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 200, type: 'vote', question: 'Should AI art be displayed in real museums?', options: ['Yes — art is art!', 'Only with human artists too', 'No — only human art counts'], xpReward: 3 },
    ],
    aiLab: { type: 'create-lab', title: 'Comic Creator Studio', description: 'Design your own AI-themed comic strip with heroes, settings, and story!', challenges: [
      { id: 'comic-1', instruction: 'Design all 3 comic panels with different heroes and settings', type: 'create', xpReward: 10 },
      { id: 'comic-2', instruction: 'Write creative speech bubbles that tell an AI adventure story', type: 'create', xpReward: 10 },
    ], badgeId: 'comic_creator' },
    microProject: { title: 'My AI Comic', description: 'Create a 3-panel comic strip about an AI adventure and save it', type: 'create', xpReward: 15, deliverable: 'A saved AI comic strip' },
  },
  { id: 'lesson-6', phase: 3, title: 'Teaching AI to Speak Like You', subtitle: 'Phase 3: Generative AI', emoji: '💬', youtubeId: 'X-AWdfSFCHQ', xpReward: 45, coinsReward: 18, zone: 'innovator', sandboxType: 'playground', description: 'Explore how large language models like ChatGPT are trained on human writing to speak and write text.', ttsIntro: 'How does ChatGPT know so much? Let\'s explore the world of AI language and writing!',
    missionTitle: 'Prompt Wizard Academy', missionEmoji: '🧙', curiosityHook: 'Can you trick an AI into thinking it\'s a pirate captain?', storyContext: 'The AI language lab needs a new Prompt Wizard! Master the art of AI communication by crafting creative prompts and seeing what the AI creates!', videoDuration: '5 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 90, type: 'quick-quiz', question: 'What is a "prompt" in AI?', options: ['A timer', 'Instructions you give to AI', 'A type of robot'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 210, type: 'predict', question: 'If you give AI a vague prompt, will the output be good?', options: ['Yes — AI figures it out', 'No — better prompts give better results'], correctIndex: 1, xpReward: 5 },
    ],
    aiLab: { type: 'prompt-lab', title: 'Prompt Engineering Lab', description: 'Craft prompts, test different AI personas, and compare outputs!', challenges: [
      { id: 'prompt-1', instruction: 'Test all 3 AI personas with the same question and compare results', type: 'compare', xpReward: 10 },
      { id: 'prompt-2', instruction: 'Write a creative prompt that makes the AI tell a funny story', type: 'prompt', xpReward: 10 },
    ], badgeId: 'prompt_apprentice' },
    microProject: { title: 'Prompt Portfolio', description: 'Create 3 different creative prompts and document the best AI responses', type: 'create', xpReward: 15, deliverable: '3 prompt-response pairs' },
  },

  // Phase 4: Ethics & Future
  { id: 'lesson-12', phase: 4, title: 'The Future of AI — What\'s Next?', subtitle: 'Phase 4: Ethics & Future', emoji: '🌟', youtubeId: 'aircAruvnKk', xpReward: 50, coinsReward: 20, zone: 'junior', sandboxType: 'quiz', description: 'What will AI look like in 10 years? Robots, self-driving cars, AI doctors — imagine the future!', ttsIntro: 'Close your eyes and imagine the future! AI will change everything. What kind of world will you build?',
    missionTitle: 'Future Explorer Mission', missionEmoji: '🔮', curiosityHook: 'Will robots be your best friend by 2035?', storyContext: 'You\'ve been transported to the year 2035! Explore what AI has become and report back to present-day scientists!', videoDuration: '5 min', labDuration: '8 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 60, type: 'vote', question: 'Which AI future excites you most?', options: ['AI doctors', 'Self-driving cars', 'AI teachers', 'Robot friends'], xpReward: 3 },
      { timestampSeconds: 180, type: 'predict', question: 'Will AI replace all human jobs?', options: ['Yes, all of them', 'No, AI will help humans do better work'], correctIndex: 1, xpReward: 5 },
    ],
    aiLab: { type: 'explore-lab', title: 'Future Prediction Lab', description: 'Test your knowledge about AI\'s future and make predictions!', challenges: [
      { id: 'future-1', instruction: 'Answer 5 quiz questions about AI\'s future correctly', type: 'experiment', xpReward: 10 },
      { id: 'future-2', instruction: 'Write your own prediction about AI in 2035', type: 'create', xpReward: 10 },
    ] },
    microProject: { title: 'Future Diary', description: 'Write a diary entry from 2035 describing how AI changed your daily life', type: 'create', xpReward: 15, deliverable: 'A future diary entry' },
  },
  { id: 'lesson-9', phase: 4, title: 'Deepfakes: Don\'t Believe Your Eyes!', subtitle: 'Phase 4: Ethics & Future', emoji: '🕵️', youtubeId: 'iyiOVUbsPcM', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'detective', description: 'Learn to spot AI-generated fake images and videos — a critical skill for the digital age!', ttsIntro: 'WARNING! Not everything you see online is real. AI can create fake videos and images. Can you spot them?',
    missionTitle: 'Deepfake Detective Agency', missionEmoji: '🕵️', curiosityHook: 'Can you tell the difference between a real video and an AI fake?', storyContext: 'Fake media is flooding the internet! You\'ve been recruited to the Deepfake Detective Agency. Investigate 3 suspicious cases and determine the truth!', videoDuration: '5 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 90, type: 'guess', question: 'What is a common sign of a deepfake video?', options: ['Perfect quality', 'Mismatched lip sync', 'High resolution', 'Good lighting'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 210, type: 'quick-quiz', question: 'Why are deepfakes dangerous?', options: ['They look scary', 'They can spread misinformation', 'They use too much electricity'], correctIndex: 1, xpReward: 5 },
    ],
    aiLab: { type: 'detective-lab', title: 'Deepfake Investigation Lab', description: 'Analyze media scenarios and determine if they are real or AI-generated!', challenges: [
      { id: 'deep-detect-1', instruction: 'Investigate all 3 case files and correctly identify deepfakes', type: 'experiment', xpReward: 15 },
      { id: 'deep-detect-2', instruction: 'List 3 signs you look for to spot a deepfake', type: 'create', xpReward: 10 },
    ], badgeId: 'detective_pro' },
    microProject: { title: 'Deepfake Guide', description: 'Create a mini-guide teaching your friend how to spot deepfakes online', type: 'create', xpReward: 15, deliverable: 'A deepfake detection guide' },
  },

  // Phase 5: Smart Robots
  { id: 'lesson-4', phase: 5, title: 'Training Your First Pet Robot', subtitle: 'Phase 5: Smart Robots', emoji: '🤖', youtubeId: 'R9OHn5ZF4Uo', xpReward: 50, coinsReward: 20, zone: 'junior', sandboxType: 'teachable', description: 'Train an AI model to recognize objects around you using your webcam. Earn the Vision Detective badge!', ttsIntro: 'Time to train your very own AI robot! Show it things and watch it learn — just like teaching a puppy!',
    missionTitle: 'Robot Pet Trainer', missionEmoji: '🐾', curiosityHook: 'Can you teach a robot to recognize your favorite toy?', storyContext: 'Your robot pet has lost its memory! It can\'t recognize anything anymore. Train it to see and identify objects before the AI Pet Tournament begins!', videoDuration: '5 min', labDuration: '12 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 90, type: 'predict', question: 'What happens if you train AI with only 3 samples?', options: ['It works perfectly', 'It makes more mistakes — needs more data!'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 200, type: 'guess', question: 'Which makes AI better at recognizing objects?', options: ['More data', 'A faster computer', 'A bigger screen'], correctIndex: 0, xpReward: 5 },
    ],
    aiLab: { type: 'train-lab', title: 'Robot Training Lab', description: 'Use your webcam to train an AI model to classify objects!', challenges: [
      { id: 'robot-1', instruction: 'Train 2 classes with at least 10 samples each', type: 'classify', xpReward: 15 },
      { id: 'robot-2', instruction: 'Test with new objects and record your accuracy', type: 'experiment', xpReward: 10 },
    ], badgeId: 'master_trainer' },
    microProject: { title: 'My Smart Robot', description: 'Train a classifier to recognize 2 objects and show someone the predictions', type: 'experiment', xpReward: 15, deliverable: 'A 2-class image classifier' },
  },
  { id: 'lesson-4-in', phase: 5, title: 'Robotics: How AI Moves Things', subtitle: 'Phase 5: Smart Robots', emoji: '🦾', youtubeId: 'R9OHn5ZF4Uo', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'teachable', description: 'Learn how robotic sensors, actuators, and pathfinding algorithms let AI navigate physical space.', ttsIntro: 'Let\'s discover how AI controls hardware, arms, and self-driving gears to perform physical tasks!',
    missionTitle: 'Mech Engineer Challenge', missionEmoji: '🦾', curiosityHook: 'How does a self-driving car avoid hitting a dog?', storyContext: 'The robotics factory has a malfunction! Program the sensor-motor system to navigate an obstacle course and deliver packages safely!', videoDuration: '5 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 120, type: 'quick-quiz', question: 'What sensor helps robots "see" obstacles?', options: ['Thermometer', 'LIDAR / Camera', 'Microphone', 'Keyboard'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 240, type: 'predict', question: 'Can a robot learn to pick up new objects it has never seen?', options: ['Yes, through transfer learning', 'No, it only knows pre-programmed objects'], correctIndex: 0, xpReward: 5 },
    ],
    aiLab: { type: 'train-lab', title: 'Sensor & Vision Lab', description: 'Train a classifier that could help a robot identify objects', challenges: [
      { id: 'mech-1', instruction: 'Build a 3-class object classifier', type: 'classify', xpReward: 15 },
      { id: 'mech-2', instruction: 'Test edge cases — what happens with unusual angles?', type: 'experiment', xpReward: 10 },
    ] },
    microProject: { title: 'Robot Blueprint', description: 'Design a simple robot on paper with 3 AI-powered sensors', type: 'design', xpReward: 15, deliverable: 'A robot design with sensor descriptions' },
  },

  // Phase 6: Chatbots & Speech
  { id: 'lesson-5', phase: 6, title: 'How Alexa Recognizes Your Voice', subtitle: 'Phase 6: Chatbots & Speech', emoji: '🎤', youtubeId: 'LJVgBy9MEQM', xpReward: 35, coinsReward: 12, zone: 'junior', sandboxType: 'quiz', description: 'Discover how smart speakers like Alexa understand what you say — even with music playing!', ttsIntro: 'Alexa, how do you understand me? Let\'s find out how AI listens and learns from your voice!',
    missionTitle: 'Voice Command Hero', missionEmoji: '🎤', curiosityHook: 'How does Alexa hear you whisper across the room?', storyContext: 'The Smart Home has gone haywire! All voice commands are mixed up. Fix the voice recognition system by understanding how AI processes speech!', videoDuration: '4 min', labDuration: '8 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 60, type: 'guess', question: 'What does Alexa do first when you speak?', options: ['Records a video', 'Converts your voice to text', 'Takes a photo', 'Sends an email'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 150, type: 'vote', question: 'Would you want AI to always listen to you?', options: ['Yes, very helpful!', 'Only when I say a wake word', 'No, privacy matters!'], xpReward: 3 },
    ],
    aiLab: { type: 'explore-lab', title: 'Voice Recognition Lab', description: 'Test your knowledge of how smart speakers process voice commands', challenges: [
      { id: 'voice-1', instruction: 'Answer quiz questions about speech recognition correctly', type: 'experiment', xpReward: 10 },
      { id: 'voice-2', instruction: 'List 5 voice commands and what AI does with each', type: 'create', xpReward: 10 },
    ] },
    microProject: { title: 'Voice Command Diary', description: 'Test 5 voice commands on a device and document the accuracy', type: 'experiment', xpReward: 10, deliverable: 'Voice command test results' },
  },
  { id: 'lesson-5-in', phase: 6, title: 'Natural Language Processing Basics', subtitle: 'Phase 6: Chatbots & Speech', emoji: '🗣️', youtubeId: 'fOvTtapxa9c', xpReward: 45, coinsReward: 15, zone: 'innovator', sandboxType: 'playground', description: 'Understand tokenization, syntax parsing, and sentiment analysis that enable computers to process text.', ttsIntro: 'Language is full of idioms and rules. Discover how NLP algorithms convert speech into logic!',
    missionTitle: 'NLP Code Breaker', missionEmoji: '🗣️', curiosityHook: 'Can AI understand sarcasm?', storyContext: 'An AI chatbot has gone rogue — it\'s misunderstanding everything! Debug the NLP system by testing prompts and fixing the language model!', videoDuration: '5 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 90, type: 'quick-quiz', question: 'What is tokenization in NLP?', options: ['Splitting text into words or subwords', 'Encrypting passwords', 'Counting characters'], correctIndex: 0, xpReward: 5 },
      { timestampSeconds: 200, type: 'predict', question: 'Can AI detect if a review is positive or negative?', options: ['Yes, using sentiment analysis', 'No, it can\'t understand emotions'], correctIndex: 0, xpReward: 5 },
    ],
    aiLab: { type: 'prompt-lab', title: 'NLP Playground', description: 'Experiment with AI personas and observe how different prompts change outputs', challenges: [
      { id: 'nlp-1', instruction: 'Test the same question with 3 different AI personas', type: 'compare', xpReward: 10 },
      { id: 'nlp-2', instruction: 'Write a prompt that makes the AI explain a complex topic simply', type: 'prompt', xpReward: 10 },
    ], badgeId: 'prompt_apprentice' },
    microProject: { title: 'Chatbot Personality', description: 'Design 2 different chatbot personalities with unique system prompts', type: 'design', xpReward: 15, deliverable: 'Two chatbot persona descriptions' },
  },

  // Phase 7: Everyday Apps
  { id: 'lesson-2', phase: 7, title: 'The Secret Behind YouTube Recommendations', subtitle: 'Phase 7: Everyday Apps', emoji: '📺', youtubeId: 'sJrhXs48QgQ', xpReward: 30, coinsReward: 10, zone: 'junior', sandboxType: 'quiz', description: 'Why does YouTube always know exactly what video you want to watch next? AI knows your taste!', ttsIntro: 'Have you ever wondered how YouTube always shows you videos you love? Today we find out the secret!',
    missionTitle: 'Algorithm Decoder', missionEmoji: '📺', curiosityHook: 'Why does YouTube know your favorite videos better than your best friend?', storyContext: 'YouTube\'s recommendation engine has a secret code! Crack it by understanding how AI predicts what you want to watch next!', videoDuration: '4 min', labDuration: '8 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 60, type: 'guess', question: 'How does YouTube decide what to recommend?', options: ['Random picks', 'Tracks what you watch and like', 'Asks your parents', 'Shows newest videos only'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 150, type: 'predict', question: 'If you watch 5 cooking videos, what will YouTube suggest next?', options: ['Math videos', 'More cooking videos!', 'Random cartoons'], correctIndex: 1, xpReward: 5 },
    ],
    aiLab: { type: 'explore-lab', title: 'Recommendation Lab', description: 'Test your understanding of how recommendation algorithms work', challenges: [
      { id: 'rec-1', instruction: 'Complete the quiz about recommendation systems', type: 'experiment', xpReward: 10 },
      { id: 'rec-2', instruction: 'List 3 apps that use AI recommendations in your daily life', type: 'create', xpReward: 10 },
    ] },
    microProject: { title: 'My Feed Tracker', description: 'Check your YouTube recommendations and explain why each was suggested', type: 'experiment', xpReward: 10, deliverable: 'An analysis of your YouTube feed' },
  },
  { id: 'lesson-2-in', phase: 7, title: 'Recommendation Systems: How Netflix Thinks', subtitle: 'Phase 7: Everyday Apps', emoji: '🍿', youtubeId: 'sJrhXs48QgQ', xpReward: 45, coinsReward: 18, zone: 'innovator', sandboxType: 'quiz', description: 'Explore collaborative filtering and content-based recommendation systems that drive feeds.', ttsIntro: 'Netflix and Instagram keep you hooked using recommender algorithms. Let\'s explore the math behind feeds!',
    missionTitle: 'Feed Algorithm Architect', missionEmoji: '🍿', curiosityHook: 'How does Netflix predict you\'ll love a movie you\'ve never heard of?', storyContext: 'Netflix has hired you to improve their recommendation engine! Study how collaborative filtering works and design a better algorithm!', videoDuration: '5 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 90, type: 'quick-quiz', question: 'What is collaborative filtering?', options: ['Filtering spam emails', 'Recommending based on similar users\' preferences', 'Sorting files by date'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 200, type: 'predict', question: 'If two users watch the same 10 movies, will they get similar suggestions?', options: ['Yes — collaborative filtering!', 'No — recommendations are random'], correctIndex: 0, xpReward: 5 },
    ],
    aiLab: { type: 'explore-lab', title: 'Recommendation Engine Lab', description: 'Understand and test how recommendation algorithms work', challenges: [
      { id: 'rec-adv-1', instruction: 'Complete the advanced quiz on filtering techniques', type: 'experiment', xpReward: 10 },
      { id: 'rec-adv-2', instruction: 'Design a simple recommendation system for a school library', type: 'create', xpReward: 15 },
    ] },
    microProject: { title: 'Recommendation Blueprint', description: 'Design a recommendation system for your school library on paper', type: 'design', xpReward: 15, deliverable: 'A library recommendation system design' },
  },

  // Phase 8: Creative Prompts
  { id: 'lesson-7-jr', phase: 8, title: 'Word Magic: Creative Writing with AI', subtitle: 'Phase 8: Creative Prompts', emoji: '✨', youtubeId: '5sLYAQS9sWQ', xpReward: 35, coinsReward: 12, zone: 'junior', sandboxType: 'playground', description: 'Learn how to give fun instructions to AI to write songs, fairy tales, and magical scripts!', ttsIntro: 'Words are magic! Learn how to command the writing bot to make up stories.',
    missionTitle: 'Word Wizard Quest', missionEmoji: '✨', curiosityHook: 'Can AI write a bedtime story starring YOU as the hero?', storyContext: 'The Enchanted Library needs new stories! Use your word magic to command the AI storyteller and create amazing tales!', videoDuration: '4 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 60, type: 'guess', question: 'What makes a good prompt for AI?', options: ['One word', 'Detailed, clear instructions', 'Random letters', 'Just emojis'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 150, type: 'predict', question: 'Will AI create a better story if you describe the characters?', options: ['Yes! More detail = better stories', 'No, details don\'t matter'], correctIndex: 0, xpReward: 5 },
    ],
    aiLab: { type: 'prompt-lab', title: 'Story Writing Lab', description: 'Command the AI to create stories using different prompts!', challenges: [
      { id: 'word-1', instruction: 'Write a prompt that makes AI create a funny story', type: 'prompt', xpReward: 10 },
      { id: 'word-2', instruction: 'Compare outputs from two different prompt styles', type: 'compare', xpReward: 10 },
    ] },
    microProject: { title: 'My AI Story', description: 'Use AI to co-write a short adventure story and save your favorite version', type: 'create', xpReward: 10, deliverable: 'An AI co-written story' },
  },
  { id: 'lesson-7', phase: 8, title: 'Creative Prompts: Text to Magic', subtitle: 'Phase 8: Creative Prompts', emoji: '✍️', youtubeId: '5sLYAQS9sWQ', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'playground', description: 'Learn the art of prompt engineering — how to talk to AI to get the best creative results!', ttsIntro: 'Learn to engineer advanced instructions, context tokens, and constraints to get amazing results from AI!',
    missionTitle: 'Prompt Master Challenge', missionEmoji: '✍️', curiosityHook: 'Can you make AI write like Shakespeare in just one sentence?', storyContext: 'The Prompt Engineering Championship is here! Master temperature control, system prompts, and creative constraints to become the ultimate Prompt Master!', videoDuration: '5 min', labDuration: '12 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 90, type: 'quick-quiz', question: 'What does "temperature" control in AI generation?', options: ['The room temperature', 'Creativity/randomness of output', 'Processing speed'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 210, type: 'predict', question: 'Low temperature (0.1) will produce which kind of output?', options: ['Very creative and wild', 'Focused and predictable'], correctIndex: 1, xpReward: 5 },
    ],
    aiLab: { type: 'prompt-lab', title: 'Advanced Prompt Lab', description: 'Master temperature, personas, and creative constraints', challenges: [
      { id: 'prompt-adv-1', instruction: 'Compare outputs at temperature 0.2 vs 0.9 with the same prompt', type: 'compare', xpReward: 10 },
      { id: 'prompt-adv-2', instruction: 'Create a system prompt that makes AI respond only in rhymes', type: 'prompt', xpReward: 15 },
    ], badgeId: 'prompt_master' },
    microProject: { title: 'Prompt Engineering Guide', description: 'Write a mini-guide explaining 3 tips for better AI prompts', type: 'create', xpReward: 15, deliverable: 'A prompt engineering tips guide' },
  },

  // Phase 9: AI Bias & Fairness
  { id: 'lesson-10-jr', phase: 9, title: 'AI Fairness: Games for Everyone', subtitle: 'Phase 9: AI Bias & Fairness', emoji: '🤝', youtubeId: 'TWWsW1w-BVo', xpReward: 40, coinsReward: 15, zone: 'junior', sandboxType: 'quiz', description: 'Why should smart cameras recognize everyone\'s face equally? Learn about making AI friendly for all!', ttsIntro: 'AI should be a helper for everyone, no matter who they are. Let\'s explore AI fairness!',
    missionTitle: 'Fairness Guardian', missionEmoji: '🤝', curiosityHook: 'What if AI only recognized some people but not others?', storyContext: 'The AI Fairness Council has discovered bias in the city\'s smart camera system! Investigate the bias and propose a fix!', videoDuration: '4 min', labDuration: '8 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 60, type: 'vote', question: 'Should AI treat everyone the same?', options: ['Absolutely yes!', 'It depends', 'AI can\'t be fair'], xpReward: 3 },
      { timestampSeconds: 150, type: 'guess', question: 'Why might face recognition work better for some people?', options: ['Some faces are harder', 'Training data had more of some faces', 'Some cameras are better'], correctIndex: 1, xpReward: 5 },
    ],
    aiLab: { type: 'explore-lab', title: 'Fairness Testing Lab', description: 'Test your understanding of why AI can be unfair and how to fix it', challenges: [
      { id: 'fair-1', instruction: 'Complete the fairness quiz with 80% accuracy', type: 'experiment', xpReward: 10 },
      { id: 'fair-2', instruction: 'List 3 ways to make AI training data more fair', type: 'create', xpReward: 10 },
    ] },
    microProject: { title: 'Fairness Report', description: 'Find one example of AI bias in the real world and explain how to fix it', type: 'solve', xpReward: 15, deliverable: 'An AI bias analysis' },
  },
  { id: 'lesson-10', phase: 9, title: 'AI Bias: When Machines Make Mistakes', subtitle: 'Phase 9: AI Bias & Fairness', emoji: '⚖️', youtubeId: 'TWWsW1w-BVo', xpReward: 60, coinsReward: 25, zone: 'innovator', sandboxType: 'quiz', description: 'Why does AI sometimes get things wrong — or be unfair? Learn about data bias and how to fix it.', ttsIntro: 'AI can make biased decisions! Let\'s learn why this happens and how we can make AI fairer for everyone.',
    missionTitle: 'Bias Detective', missionEmoji: '⚖️', curiosityHook: 'Can a hiring AI accidentally discriminate against women?', storyContext: 'A major company\'s hiring AI is rejecting qualified candidates! Investigate the training data, find the bias, and propose a fair solution!', videoDuration: '6 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 120, type: 'quick-quiz', question: 'What is the most common cause of AI bias?', options: ['Bad algorithms', 'Unrepresentative training data', 'Slow computers', 'Bad internet'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 240, type: 'predict', question: 'If a hiring AI is trained on 90% male resumes, what will it learn?', options: ['To prefer male candidates', 'To be perfectly fair'], correctIndex: 0, xpReward: 5 },
    ],
    aiLab: { type: 'detective-lab', title: 'Bias Investigation Lab', description: 'Analyze real-world scenarios to identify and fix AI bias', challenges: [
      { id: 'bias-1', instruction: 'Investigate 3 bias case studies and identify the source', type: 'experiment', xpReward: 15 },
      { id: 'bias-2', instruction: 'Propose a data collection plan that avoids bias', type: 'create', xpReward: 10 },
    ], badgeId: 'detective_pro' },
    microProject: { title: 'Bias Audit', description: 'Audit an AI system for bias and write a 1-paragraph recommendation', type: 'solve', xpReward: 20, deliverable: 'A bias audit report' },
  },

  // Phase 10: Local Problem Solving
  { id: 'lesson-11', phase: 10, title: 'AI in India: Solving Our Problems', subtitle: 'Phase 10: Local Problem Solving', emoji: '🇮🇳', youtubeId: 'oV74Najm6Nc', xpReward: 40, coinsReward: 15, zone: 'junior', sandboxType: 'playground', description: 'How is India using AI in farming, healthcare, education and more? See AI solving real Indian problems!', ttsIntro: 'AI is changing India! From farms to hospitals, let\'s see how AI is making life better for millions of Indians.',
    missionTitle: 'India Innovation Quest', missionEmoji: '🇮🇳', curiosityHook: 'Can AI help an Indian farmer save their dying crops?', storyContext: 'Farmer Ramu\'s wheat fields are turning yellow! Use AI technology to diagnose the crop disease and save the harvest before it\'s too late!', videoDuration: '5 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 90, type: 'guess', question: 'How can AI help Indian farmers?', options: ['By doing the farming', 'By diagnosing crop diseases from photos', 'By selling crops online', 'By watering plants'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 180, type: 'vote', question: 'Which Indian problem should AI solve first?', options: ['Traffic jams', 'Healthcare access', 'Clean water', 'Education'], xpReward: 3 },
    ],
    aiLab: { type: 'prompt-lab', title: 'India Problem Solver', description: 'Use AI to brainstorm solutions for real Indian problems', challenges: [
      { id: 'india-1', instruction: 'Use AI to generate solutions for a local problem', type: 'prompt', xpReward: 10 },
      { id: 'india-2', instruction: 'Compare AI solutions for farming vs healthcare', type: 'compare', xpReward: 10 },
    ] },
    microProject: { title: 'Local AI Solution', description: 'Identify a problem in your neighborhood and propose an AI solution', type: 'solve', xpReward: 15, deliverable: 'A local AI solution proposal' },
  },
  { id: 'lesson-11-in', phase: 10, title: 'AI & Community: Building Solutions', subtitle: 'Phase 10: Local Problem Solving', emoji: '🏢', youtubeId: 'oV74Najm6Nc', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'playground', description: 'Examine how local startups and agencies use AI to map water leaks, traffic blockages, and waste.', ttsIntro: 'How can you build solutions for your neighborhood using AI? Let\'s discover community innovation!',
    missionTitle: 'Community AI Builder', missionEmoji: '🏢', curiosityHook: 'Can AI detect a water leak underground before it floods your street?', storyContext: 'Your neighborhood has 3 major infrastructure problems. Design AI-powered sensor networks to detect and fix them before they get worse!', videoDuration: '5 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 90, type: 'quick-quiz', question: 'What kind of AI sensors can detect water leaks?', options: ['Pressure sensors + ML algorithms', 'Cameras only', 'Human inspectors'], correctIndex: 0, xpReward: 5 },
      { timestampSeconds: 200, type: 'predict', question: 'Can AI predict traffic jams before they happen?', options: ['Yes, using historical data patterns', 'No, traffic is completely random'], correctIndex: 0, xpReward: 5 },
    ],
    aiLab: { type: 'prompt-lab', title: 'Community Solutions Lab', description: 'Brainstorm and design AI solutions for community problems', challenges: [
      { id: 'community-1', instruction: 'Generate AI solutions for 3 different community problems', type: 'prompt', xpReward: 10 },
      { id: 'community-2', instruction: 'Design a sensor network for your neighborhood on paper', type: 'create', xpReward: 15 },
    ] },
    microProject: { title: 'Smart Neighborhood Plan', description: 'Design an AI-powered improvement plan for your local area', type: 'design', xpReward: 15, deliverable: 'A smart neighborhood blueprint' },
  },

  // Phase 11: Game AI
  { id: 'lesson-13-jr', phase: 11, title: 'How Video Games Use AI', subtitle: 'Phase 11: Game AI', emoji: '🎮', youtubeId: 'iyiOVUbsPcM', xpReward: 35, coinsReward: 12, zone: 'junior', sandboxType: 'quiz', description: 'Learn how Minecraft mobs find paths, and how chess computers think 5 moves ahead!', ttsIntro: 'Let\'s peek inside your favorite video games to see how smart enemies and buddies are coded!',
    missionTitle: 'Game Master Training', missionEmoji: '🎮', curiosityHook: 'Can AI beat you in your own favorite game?', storyContext: 'The Game AI Championship needs new contestants! Learn how video game characters think and move to design the ultimate smart enemy!', videoDuration: '4 min', labDuration: '8 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 60, type: 'guess', question: 'How do Minecraft zombies find you?', options: ['They see you', 'They use pathfinding algorithms', 'They follow sound', 'Random walking'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 150, type: 'vote', question: 'Should game AI be unbeatable?', options: ['Yes — ultimate challenge!', 'No — games should be fun!', 'Only on hard mode'], xpReward: 3 },
    ],
    aiLab: { type: 'explore-lab', title: 'Game AI Lab', description: 'Explore how AI makes video game characters smart', challenges: [
      { id: 'game-1', instruction: 'Complete the game AI quiz about NPC behavior', type: 'experiment', xpReward: 10 },
      { id: 'game-2', instruction: 'Design a simple NPC behavior (what should it do when it sees you?)', type: 'create', xpReward: 10 },
    ] },
    microProject: { title: 'NPC Designer', description: 'Design a video game character with 3 AI behaviors on paper', type: 'design', xpReward: 10, deliverable: 'An NPC behavior chart' },
  },
  { id: 'lesson-13-in', phase: 11, title: 'Game AI: Designing Smart Enemies', subtitle: 'Phase 11: Game AI', emoji: '👾', youtubeId: 'iyiOVUbsPcM', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'quiz', description: 'Explore State Machines, Behavior Trees, and NavMesh systems that control non-player characters (NPCs).', ttsIntro: 'Want to design video games? Let\'s learn how programmers design smart enemies using AI architectures!',
    missionTitle: 'Enemy AI Architect', missionEmoji: '👾', curiosityHook: 'How does a game boss know exactly when to attack you?', storyContext: 'A new RPG game needs smarter enemy AI! Design a behavior tree that makes the boss adapt to different player strategies!', videoDuration: '5 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 90, type: 'quick-quiz', question: 'What is a "state machine" in game AI?', options: ['A broken computer', 'AI that switches between behaviors (idle, chase, attack)', 'A vending machine'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 210, type: 'predict', question: 'Can game AI learn from how you play and adapt?', options: ['Yes — adaptive AI!', 'No — it\'s all pre-programmed'], correctIndex: 0, xpReward: 5 },
    ],
    aiLab: { type: 'explore-lab', title: 'Behavior Tree Lab', description: 'Design and test NPC behavior patterns', challenges: [
      { id: 'enemy-1', instruction: 'Complete the advanced game AI quiz', type: 'experiment', xpReward: 10 },
      { id: 'enemy-2', instruction: 'Design a 4-state behavior tree for a game boss', type: 'create', xpReward: 15 },
    ] },
    microProject: { title: 'Boss AI Blueprint', description: 'Design a game boss with a state machine showing at least 4 behaviors', type: 'design', xpReward: 15, deliverable: 'A boss AI state machine design' },
  },

  // Phase 12: Space & Astronomy
  { id: 'lesson-14-jr', phase: 12, title: 'AI in Space: Searching for Aliens', subtitle: 'Phase 12: Space & Astronomy', emoji: '🚀', youtubeId: 'aircAruvnKk', xpReward: 40, coinsReward: 15, zone: 'junior', sandboxType: 'playground', description: 'How NASA rovers explore Mars on their own and find giant craters using cameras.', ttsIntro: 'To infinity and beyond! Let\'s see how smart rovers drive across Mars all by themselves.',
    missionTitle: 'Mars Rover Commander', missionEmoji: '🚀', curiosityHook: 'How does a rover drive on Mars when Earth is 20 minutes away?', storyContext: 'Houston, we have a problem! The Mars Rover is stuck in a crater. Use AI to help it navigate out and continue its exploration mission!', videoDuration: '5 min', labDuration: '8 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 60, type: 'guess', question: 'Why can\'t we control the Mars rover in real-time?', options: ['It\'s too far away — signals take 20 minutes!', 'The battery is weak', 'Mars has no internet'], correctIndex: 0, xpReward: 5 },
      { timestampSeconds: 150, type: 'vote', question: 'Would you go to Mars if AI was your guide?', options: ['Yes, let\'s go!', 'Maybe, if AI is smart enough', 'No, too risky!'], xpReward: 3 },
    ],
    aiLab: { type: 'prompt-lab', title: 'Space Explorer Lab', description: 'Use AI to brainstorm space exploration ideas', challenges: [
      { id: 'space-1', instruction: 'Ask AI about how rovers navigate Mars', type: 'prompt', xpReward: 10 },
      { id: 'space-2', instruction: 'Design a mission plan for a new Mars rover', type: 'create', xpReward: 10 },
    ] },
    microProject: { title: 'Mars Mission Plan', description: 'Design a simple mission plan for an AI-powered Mars rover', type: 'design', xpReward: 15, deliverable: 'A Mars rover mission plan' },
  },
  { id: 'lesson-14-in', phase: 12, title: 'Astronomy AI: Finding Exoplanets', subtitle: 'Phase 12: Space & Astronomy', emoji: '🪐', youtubeId: 'aircAruvnKk', xpReward: 55, coinsReward: 22, zone: 'innovator', sandboxType: 'playground', description: 'Examine light curve data and how neural networks discover planets orbiting far away stars.', ttsIntro: 'With billions of stars, finding planets is hard. Learn how space telescopes use AI to detect new worlds!',
    missionTitle: 'Exoplanet Hunter', missionEmoji: '🪐', curiosityHook: 'Can AI discover a planet that no human has ever seen?', storyContext: 'A distant star is showing strange light patterns! Analyze the data and use AI to determine if there\'s a hidden exoplanet orbiting it!', videoDuration: '6 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 120, type: 'quick-quiz', question: 'How do AI systems detect exoplanets?', options: ['By taking photos of planets', 'By analyzing dips in star brightness', 'By listening for signals'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 240, type: 'predict', question: 'Has AI found planets that human astronomers missed?', options: ['Yes — AI found 2 new exoplanets!', 'No — humans found them all'], correctIndex: 0, xpReward: 5 },
    ],
    aiLab: { type: 'prompt-lab', title: 'Exoplanet Analysis Lab', description: 'Use AI to explore exoplanet discovery techniques', challenges: [
      { id: 'exo-1', instruction: 'Research how light curve analysis works using AI', type: 'prompt', xpReward: 10 },
      { id: 'exo-2', instruction: 'Design an AI system that could detect exoplanets', type: 'create', xpReward: 15 },
    ] },
    microProject: { title: 'Planet Finder Report', description: 'Write a mini-report about how AI discovered a real exoplanet', type: 'create', xpReward: 15, deliverable: 'An exoplanet discovery report' },
  },

  // Phase 13: Eco & Climate AI
  { id: 'lesson-15-jr', phase: 13, title: 'Eco AI: Protecting Our Forests', subtitle: 'Phase 13: Eco & Climate AI', emoji: '🌱', youtubeId: 'iyiOVUbsPcM', xpReward: 35, coinsReward: 12, zone: 'junior', sandboxType: 'detective', description: 'Can smart microphones hear chainsaws and warn forest rangers? Let\'s protect trees!', ttsIntro: 'Trees are our best friends. Let\'s learn how AI listens to forest sounds to catch tree thieves!',
    missionTitle: 'Forest Guardian', missionEmoji: '🌱', curiosityHook: 'Can AI hear a chainsaw cutting a tree from 2 kilometers away?', storyContext: 'Illegal loggers are destroying the Enchanted Forest! Deploy AI sound sensors to catch them before they cut down the ancient trees!', videoDuration: '4 min', labDuration: '8 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 60, type: 'guess', question: 'How can AI protect forests?', options: ['By planting trees', 'By listening for chainsaws and alerting rangers', 'By building fences', 'By calling police'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 150, type: 'predict', question: 'Can AI tell the difference between thunder and a chainsaw?', options: ['Yes, by analyzing sound patterns', 'No, sounds are too similar'], correctIndex: 0, xpReward: 5 },
    ],
    aiLab: { type: 'detective-lab', title: 'Forest Protection Lab', description: 'Investigate cases where AI can and cannot help protect nature', challenges: [
      { id: 'eco-1', instruction: 'Solve the forest protection detective cases correctly', type: 'experiment', xpReward: 10 },
      { id: 'eco-2', instruction: 'Design an AI sensor system to protect a local park', type: 'create', xpReward: 10 },
    ] },
    microProject: { title: 'Eco AI Plan', description: 'Design an AI-powered system to protect a forest or park near you', type: 'design', xpReward: 10, deliverable: 'An eco-protection AI design' },
  },
  { id: 'lesson-15-in', phase: 13, title: 'Climate AI: Predicting Extreme Weather', subtitle: 'Phase 13: Eco & Climate AI', emoji: '🌪️', youtubeId: 'iyiOVUbsPcM', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'detective', description: 'Understand how climate simulation models use weather history and satellite radar to predict cyclones.', ttsIntro: 'Extreme weather causes immense damage. Discover how AI models predict cyclones to save lives.',
    missionTitle: 'Storm Predictor', missionEmoji: '🌪️', curiosityHook: 'Can AI predict a cyclone 5 days before it hits?', storyContext: 'A major cyclone is forming in the Bay of Bengal! Use satellite data and AI prediction models to warn coastal cities before it\'s too late!', videoDuration: '5 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 90, type: 'quick-quiz', question: 'What data does AI use to predict weather?', options: ['Social media posts', 'Satellite images + temperature + pressure data', 'News reports'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 200, type: 'predict', question: 'Is AI better than traditional weather forecasting?', options: ['Yes, it processes more data faster', 'No, traditional methods are better'], correctIndex: 0, xpReward: 5 },
    ],
    aiLab: { type: 'detective-lab', title: 'Climate Analysis Lab', description: 'Analyze scenarios where AI predicts and responds to climate events', challenges: [
      { id: 'climate-1', instruction: 'Investigate climate prediction cases and evaluate AI accuracy', type: 'experiment', xpReward: 15 },
      { id: 'climate-2', instruction: 'Propose an early warning system using AI and sensors', type: 'create', xpReward: 10 },
    ] },
    microProject: { title: 'Early Warning System', description: 'Design an AI early warning system for extreme weather events', type: 'design', xpReward: 15, deliverable: 'A weather warning system design' },
  },

  // Phase 14: Healthcare AI
  { id: 'lesson-16-jr', phase: 14, title: 'AI Doctors: How Tech Saves Lives', subtitle: 'Phase 14: Healthcare AI', emoji: '🏥', youtubeId: 'OcycT1Jwsns', xpReward: 40, coinsReward: 15, zone: 'junior', sandboxType: 'quiz', description: 'See how doctors use computers to check heartbeats and diagnose diseases faster.', ttsIntro: 'Can a computer help cure a cold? Let\'s find out how doctors and AI work together!',
    missionTitle: 'AI Doctor Academy', missionEmoji: '🏥', curiosityHook: 'Can AI spot a disease that doctors missed?', storyContext: 'A young patient has a mysterious illness! Help the AI medical system analyze symptoms and find the diagnosis before time runs out!', videoDuration: '5 min', labDuration: '8 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 60, type: 'guess', question: 'How does AI help doctors?', options: ['By replacing doctors', 'By analyzing X-rays and scans faster', 'By giving medicine', 'By talking to patients'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 150, type: 'predict', question: 'Can AI detect cancer from a scan with 94% accuracy?', options: ['Yes — sometimes better than doctors!', 'No, only doctors can do that'], correctIndex: 0, xpReward: 5 },
    ],
    aiLab: { type: 'explore-lab', title: 'Medical AI Lab', description: 'Test your knowledge about how AI helps in healthcare', challenges: [
      { id: 'health-1', instruction: 'Complete the medical AI quiz', type: 'experiment', xpReward: 10 },
      { id: 'health-2', instruction: 'Design an AI app idea that could help patients', type: 'create', xpReward: 10 },
    ] },
    microProject: { title: 'Health AI App Idea', description: 'Design a simple AI health app concept on paper', type: 'design', xpReward: 15, deliverable: 'A health app concept' },
  },
  { id: 'lesson-16-in', phase: 14, title: 'Medical Imaging & Diagnostic AI', subtitle: 'Phase 14: Healthcare AI', emoji: '🩺', youtubeId: 'OcycT1Jwsns', xpReward: 55, coinsReward: 22, zone: 'innovator', sandboxType: 'quiz', description: 'Analyze how convolutional neural networks (CNNs) detect micro-fractures and tumors from scans.', ttsIntro: 'Medical scans hold hidden patterns. Let\'s explore how computer vision diagnoses illness automatically!',
    missionTitle: 'Diagnostic AI Engineer', missionEmoji: '🩺', curiosityHook: 'Can a neural network find a tiny fracture that a human eye missed?', storyContext: 'The hospital\'s AI diagnostic system needs upgrading! Analyze how CNNs process medical images and design improvements to catch more diseases!', videoDuration: '6 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 120, type: 'quick-quiz', question: 'What type of neural network is best for medical imaging?', options: ['RNN', 'CNN (Convolutional Neural Network)', 'Simple calculator'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 240, type: 'predict', question: 'Should AI make the final medical diagnosis?', options: ['Yes, it\'s more accurate', 'No, AI should assist but doctors decide'], correctIndex: 1, xpReward: 5 },
    ],
    aiLab: { type: 'explore-lab', title: 'Diagnostic Engineering Lab', description: 'Explore how medical AI systems analyze scans and make predictions', challenges: [
      { id: 'diag-1', instruction: 'Complete the advanced medical imaging quiz', type: 'experiment', xpReward: 10 },
      { id: 'diag-2', instruction: 'Explain how a CNN could detect a tumor vs healthy tissue', type: 'create', xpReward: 15 },
    ] },
    microProject: { title: 'Medical AI Paper', description: 'Write a mini-report on how AI improves medical diagnosis accuracy', type: 'create', xpReward: 15, deliverable: 'A medical AI report' },
  },

  // Phase 15: Smart Cities & Homes
  { id: 'lesson-17-jr', phase: 15, title: 'Smart Homes: Lights, AC, & Action', subtitle: 'Phase 15: Smart Cities & Homes', emoji: '🏠', youtubeId: 'mJeNghZXtMo', xpReward: 35, coinsReward: 12, zone: 'junior', sandboxType: 'dragdrop', description: 'Discover how smart lightbulbs and gadgets change settings to match your mood and save energy!', ttsIntro: 'Welcome home! Let\'s see how smart homes control everything to make life easy.',
    missionTitle: 'Smart Home Designer', missionEmoji: '🏠', curiosityHook: 'Can your house learn your daily routine and prepare everything for you?', storyContext: 'You\'ve won a contest to design the smartest home ever! Choose which devices get AI brains and show how they work together!', videoDuration: '4 min', labDuration: '8 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 60, type: 'guess', question: 'Which device saves the most energy with AI?', options: ['A fan', 'A smart thermostat', 'A TV remote', 'A toaster'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 150, type: 'vote', question: 'Would you want your house to control everything automatically?', options: ['Yes, love it!', 'Only some things', 'No, I want control!'], xpReward: 3 },
    ],
    aiLab: { type: 'explore-lab', title: 'Smart Home Lab', description: 'Sort devices into AI-smart and not-smart categories', challenges: [
      { id: 'home-1', instruction: 'Sort all 8 items correctly into Smart AI vs Not Smart', type: 'experiment', xpReward: 10 },
      { id: 'home-2', instruction: 'Design a daily routine for a smart home with 5 AI automations', type: 'create', xpReward: 10 },
    ] },
    microProject: { title: 'Dream Smart Home', description: 'Design your dream smart home with at least 5 AI-powered features', type: 'design', xpReward: 10, deliverable: 'A smart home feature list' },
  },
  { id: 'lesson-17-in', phase: 15, title: 'Smart Cities: Traffic & Energy AI', subtitle: 'Phase 15: Smart Cities & Homes', emoji: '🏙️', youtubeId: 'mJeNghZXtMo', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'dragdrop', description: 'Examine smart traffic light scheduling and energy grids that direct power where needed.', ttsIntro: 'A smart city never sleeps. Learn how traffic grids and energy grids optimize flows in real time!',
    missionTitle: 'City Grid Architect', missionEmoji: '🏙️', curiosityHook: 'Can AI end traffic jams forever?', storyContext: 'The city council needs your help! Design an AI-powered traffic management system that reduces congestion by 40% using smart traffic lights!', videoDuration: '5 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 90, type: 'quick-quiz', question: 'How do smart traffic lights work?', options: ['Fixed timers', 'AI adjusts timing based on real-time traffic data', 'Police control them'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 200, type: 'predict', question: 'Can an AI energy grid reduce electricity waste by 30%?', options: ['Yes, by predicting demand patterns', 'No, energy use is unpredictable'], correctIndex: 0, xpReward: 5 },
    ],
    aiLab: { type: 'explore-lab', title: 'City Planning Lab', description: 'Design smart city infrastructure using AI principles', challenges: [
      { id: 'city-1', instruction: 'Sort city infrastructure into AI-optimizable vs traditional', type: 'experiment', xpReward: 10 },
      { id: 'city-2', instruction: 'Design a smart traffic system for your school area', type: 'create', xpReward: 15 },
    ] },
    microProject: { title: 'Smart City Plan', description: 'Design a smart traffic + energy system for a small area', type: 'design', xpReward: 15, deliverable: 'A smart city infrastructure plan' },
  },

  // Phase 16: Agriculture & Farming
  { id: 'lesson-18-jr', phase: 16, title: 'Smart Farms: Helping Indian Farmers', subtitle: 'Phase 16: Agriculture & Farming', emoji: '🌾', youtubeId: 'oV74Najm6Nc', xpReward: 40, coinsReward: 15, zone: 'junior', sandboxType: 'playground', description: 'See how farmers take photos of crop leaves and use AI to immediately spot plant bugs.', ttsIntro: 'Let\'s visit the fields and see how farmers use mobile apps to check leaf health!',
    missionTitle: 'Farm Rescue Mission', missionEmoji: '🌾', curiosityHook: 'Can your phone camera save an entire wheat field?', storyContext: 'Farmer Ramu\'s wheat is dying! Help him use an AI crop disease app to photograph leaves, identify the disease, and apply the right treatment!', videoDuration: '5 min', labDuration: '8 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 60, type: 'guess', question: 'How does AI diagnose crop diseases?', options: ['By tasting the crop', 'By analyzing leaf photos', 'By checking the soil color', 'By asking the farmer'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 150, type: 'predict', question: 'Can AI reduce water usage in farming?', options: ['Yes, by watering only when needed!', 'No, all crops need the same water'], correctIndex: 0, xpReward: 5 },
    ],
    aiLab: { type: 'prompt-lab', title: 'Farm AI Lab', description: 'Explore AI solutions for farming challenges', challenges: [
      { id: 'farm-1', instruction: 'Use AI to brainstorm solutions for crop diseases', type: 'prompt', xpReward: 10 },
      { id: 'farm-2', instruction: 'Design a smart irrigation system concept', type: 'create', xpReward: 10 },
    ] },
    microProject: { title: 'Farm Tech Plan', description: 'Design an AI app concept that helps farmers in your region', type: 'design', xpReward: 15, deliverable: 'A farming AI app concept' },
  },
  { id: 'lesson-18-in', phase: 16, title: 'Precision Agriculture & Soil AI', subtitle: 'Phase 16: Agriculture & Farming', emoji: '🚜', youtubeId: 'oV74Najm6Nc', xpReward: 55, coinsReward: 22, zone: 'innovator', sandboxType: 'playground', description: 'Analyze soil moisture sensors, weather analytics, and drone imaging used to maximize crop yield.', ttsIntro: 'Food security is key. Learn how precision farming uses sensors and drones to grow more crop!',
    missionTitle: 'Precision Farm Engineer', missionEmoji: '🚜', curiosityHook: 'Can a drone and AI sensor save 50% of a farm\'s water?', storyContext: 'A drought is threatening the region\'s food supply! Design a precision farming system using drones, soil sensors, and AI to maximize crop yield!', videoDuration: '6 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 120, type: 'quick-quiz', question: 'What is precision agriculture?', options: ['Using exact measurements to farm efficiently', 'Farming in a lab', 'Growing crops in space'], correctIndex: 0, xpReward: 5 },
      { timestampSeconds: 240, type: 'predict', question: 'Can drone + AI imaging detect crop stress before it\'s visible to the human eye?', options: ['Yes, using infrared imaging', 'No, you need to inspect crops manually'], correctIndex: 0, xpReward: 5 },
    ],
    aiLab: { type: 'prompt-lab', title: 'Precision Farming Lab', description: 'Design AI-powered precision agriculture systems', challenges: [
      { id: 'prec-1', instruction: 'Generate AI farming solutions using prompts', type: 'prompt', xpReward: 10 },
      { id: 'prec-2', instruction: 'Design a complete precision farming sensor network', type: 'create', xpReward: 15 },
    ] },
    microProject: { title: 'Precision Farm Blueprint', description: 'Design a sensor + drone farming system for a 10-acre plot', type: 'design', xpReward: 15, deliverable: 'A precision farming system design' },
  },

  // Phase 17: AI & Wildlife
  { id: 'lesson-19-jr', phase: 17, title: 'Animal Tracker AI: Saving Tigers', subtitle: 'Phase 17: AI & Wildlife', emoji: '🐯', youtubeId: 'iyiOVUbsPcM', xpReward: 40, coinsReward: 15, zone: 'junior', sandboxType: 'detective', description: 'Learn how smart wildlife cameras identify individual tigers from their stripe patterns!', ttsIntro: 'Let\'s go on a jungle safari and see how AI counts tigers by looking at their unique stripes!',
    missionTitle: 'Tiger Tracker Mission', missionEmoji: '🐯', curiosityHook: 'Can AI tell two tigers apart just by their stripes?', storyContext: 'A poaching gang is targeting tigers in the national park! Deploy AI camera traps to identify and protect each tiger by their unique stripe patterns!', videoDuration: '5 min', labDuration: '8 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 60, type: 'guess', question: 'How does AI identify individual tigers?', options: ['By their size', 'By their unique stripe patterns', 'By their roar', 'By tagging them'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 150, type: 'predict', question: 'Can AI camera traps work at night?', options: ['Yes, with infrared cameras', 'No, cameras need daylight'], correctIndex: 0, xpReward: 5 },
    ],
    aiLab: { type: 'detective-lab', title: 'Wildlife Protection Lab', description: 'Investigate wildlife cases where AI can help protect animals', challenges: [
      { id: 'tiger-1', instruction: 'Solve wildlife detection cases', type: 'experiment', xpReward: 10 },
      { id: 'tiger-2', instruction: 'Design an AI camera trap system for a forest', type: 'create', xpReward: 10 },
    ] },
    microProject: { title: 'Wildlife AI Plan', description: 'Design an AI system to protect an endangered animal of your choice', type: 'design', xpReward: 15, deliverable: 'A wildlife protection AI plan' },
  },
  { id: 'lesson-19-in', phase: 17, title: 'Acoustic Monitoring: Listening to Forests', subtitle: 'Phase 17: AI & Wildlife', emoji: '🐾', youtubeId: 'iyiOVUbsPcM', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'detective', description: 'Explore bioacoustic AI that analyzes jungle audio feeds to detect poaching and locate animals.', ttsIntro: 'Nature speaks in sounds. Learn how bioacoustic AI detects illegal poaching by hearing gunshots!',
    missionTitle: 'Bioacoustic Analyst', missionEmoji: '🐾', curiosityHook: 'Can AI hear a gunshot in a forest and call the police automatically?', storyContext: 'The forest acoustic monitoring system has detected suspicious sounds! Analyze the audio patterns to determine if poachers are operating in the area!', videoDuration: '5 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 90, type: 'quick-quiz', question: 'What is bioacoustic monitoring?', options: ['Recording bird songs for fun', 'Using AI to analyze jungle sounds for threats', 'Playing music in forests'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 200, type: 'predict', question: 'Can AI differentiate between a falling tree and a gunshot?', options: ['Yes, through spectrogram analysis', 'No, they sound the same'], correctIndex: 0, xpReward: 5 },
    ],
    aiLab: { type: 'detective-lab', title: 'Acoustic Analysis Lab', description: 'Investigate sound-based detection scenarios', challenges: [
      { id: 'acoustic-1', instruction: 'Analyze acoustic detection cases', type: 'experiment', xpReward: 15 },
      { id: 'acoustic-2', instruction: 'Design a bioacoustic AI monitoring network', type: 'create', xpReward: 10 },
    ] },
    microProject: { title: 'Sound AI Network', description: 'Design an acoustic monitoring system for a national park', type: 'design', xpReward: 15, deliverable: 'A bioacoustic monitoring system design' },
  },

  // Phase 18: Data & Privacy
  { id: 'lesson-20-jr', phase: 18, title: 'My Personal Data & Safe Surfing', subtitle: 'Phase 18: Data & Privacy', emoji: '🔒', youtubeId: 'mJeNghZXtMo', xpReward: 35, coinsReward: 12, zone: 'junior', sandboxType: 'quiz', description: 'What is "personal data" and why should we never share passwords or names online?', ttsIntro: 'Safety first! Let\'s learn why we must keep our personal details private when browsing.',
    missionTitle: 'Cyber Guardian', missionEmoji: '🔒', curiosityHook: 'Can hackers steal your identity with just your birthday and name?', storyContext: 'A cyber villain is trying to steal students\' data! Become a Cyber Guardian by learning what personal data to protect and how to stay safe online!', videoDuration: '4 min', labDuration: '8 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 60, type: 'guess', question: 'Which is personal data you should never share?', options: ['Your favorite color', 'Your password and home address', 'Your favorite movie', 'Your school subject'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 150, type: 'vote', question: 'Should apps ask permission before using your data?', options: ['Always!', 'Only for important data', 'No, it\'s fine'], xpReward: 3 },
    ],
    aiLab: { type: 'explore-lab', title: 'Cyber Safety Lab', description: 'Test your knowledge about keeping personal data safe online', challenges: [
      { id: 'privacy-1', instruction: 'Complete the data privacy quiz with 80% accuracy', type: 'experiment', xpReward: 10 },
      { id: 'privacy-2', instruction: 'List 5 things you should never share online', type: 'create', xpReward: 10 },
    ] },
    microProject: { title: 'Safety Poster', description: 'Create a digital safety poster with 5 tips for staying safe online', type: 'create', xpReward: 10, deliverable: 'An online safety poster' },
  },
  { id: 'lesson-20-in', phase: 18, title: 'Data Privacy: Keeping Your Info Safe', subtitle: 'Phase 18: Data & Privacy', emoji: '🔑', youtubeId: 'mJeNghZXtMo', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'quiz', description: 'Analyze data encryption, local vs cloud storage, and guidelines to secure web credentials.', ttsIntro: 'How do websites secure your information? Let\'s dive into hashing, cookies, and privacy protocols!',
    missionTitle: 'Encryption Specialist', missionEmoji: '🔑', curiosityHook: 'How does a website know your password without actually seeing it?', storyContext: 'A major data breach has hit a social media company! Investigate how the breach happened and design better security protocols to prevent future attacks!', videoDuration: '5 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 90, type: 'quick-quiz', question: 'What is password hashing?', options: ['Deleting passwords', 'Converting passwords into unreadable codes', 'Sharing passwords safely'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 200, type: 'predict', question: 'Is data stored on the cloud always safe?', options: ['Yes, cloud is perfectly secure', 'No, it depends on encryption and access controls'], correctIndex: 1, xpReward: 5 },
    ],
    aiLab: { type: 'explore-lab', title: 'Security Analysis Lab', description: 'Analyze data security scenarios and design protection systems', challenges: [
      { id: 'encrypt-1', instruction: 'Complete the advanced data security quiz', type: 'experiment', xpReward: 10 },
      { id: 'encrypt-2', instruction: 'Design a secure login system with 3 protection layers', type: 'create', xpReward: 15 },
    ] },
    microProject: { title: 'Security Audit', description: 'Audit your family\'s online accounts for security best practices', type: 'solve', xpReward: 15, deliverable: 'A security audit checklist' },
  },

  // Phase 19: Generative Music
  { id: 'lesson-21-jr', phase: 19, title: 'AI Beatmaker: Creating Music', subtitle: 'Phase 19: Generative Music', emoji: '🎵', youtubeId: 'SVcsDDABEkM', xpReward: 35, coinsReward: 12, zone: 'junior', sandboxType: 'playground', description: 'Help an AI beatmaker mix drums and synthesizers to compose a futuristic video game track!', ttsIntro: 'Let\'s drop some beats! Mix sounds with the AI composer and make a game soundtrack!',
    missionTitle: 'Beat Master DJ', missionEmoji: '🎵', curiosityHook: 'Can AI compose a hit song that goes viral on TikTok?', storyContext: 'The Virtual Music Festival needs a new headliner! Use AI to compose an original video game soundtrack that will wow the crowd!', videoDuration: '4 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 60, type: 'guess', question: 'How does AI create music?', options: ['By recording instruments', 'By learning patterns from thousands of songs', 'By copying existing songs', 'By random noise'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 150, type: 'vote', question: 'Can AI music be as good as human-composed music?', options: ['Yes, equally good!', 'Not yet, but getting close', 'Never — music needs soul'], xpReward: 3 },
    ],
    aiLab: { type: 'prompt-lab', title: 'Music Creation Lab', description: 'Use AI prompts to explore music creation concepts', challenges: [
      { id: 'music-1', instruction: 'Ask AI about how music generation algorithms work', type: 'prompt', xpReward: 10 },
      { id: 'music-2', instruction: 'Describe a song you\'d want AI to compose and see what AI suggests', type: 'create', xpReward: 10 },
    ] },
    microProject: { title: 'Song Concept', description: 'Design a concept for an AI-generated song with mood, instruments, and style', type: 'create', xpReward: 10, deliverable: 'A song concept description' },
  },
  { id: 'lesson-21-in', phase: 19, title: 'Symphony AI: How Computers Compose', subtitle: 'Phase 19: Generative Music', emoji: '🎶', youtubeId: 'SVcsDDABEkM', xpReward: 50, coinsReward: 20, zone: 'innovator', sandboxType: 'playground', description: 'Analyze recurrent neural networks (RNNs) and MIDI generation algorithms that compose melodies.', ttsIntro: 'Can AI write classical music? Discover how neural networks analyze chord patterns to write songs!',
    missionTitle: 'Symphony Architect', missionEmoji: '🎶', curiosityHook: 'Can a neural network compose a symphony that makes you cry?', storyContext: 'A famous orchestra wants to premiere the first AI-composed symphony! Study how RNNs learn musical patterns and design the composition algorithm!', videoDuration: '5 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 90, type: 'quick-quiz', question: 'What type of neural network is best for music generation?', options: ['CNN', 'RNN (Recurrent Neural Network)', 'Simple calculator'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 210, type: 'predict', question: 'Can AI learn to compose in a specific composer\'s style?', options: ['Yes, by training on their compositions', 'No, style is too complex for AI'], correctIndex: 0, xpReward: 5 },
    ],
    aiLab: { type: 'prompt-lab', title: 'Composition Algorithm Lab', description: 'Explore how AI analyzes and generates music patterns', challenges: [
      { id: 'symphony-1', instruction: 'Research how MIDI generation works using AI prompts', type: 'prompt', xpReward: 10 },
      { id: 'symphony-2', instruction: 'Design a music generation algorithm on paper', type: 'create', xpReward: 15 },
    ] },
    microProject: { title: 'Music AI Paper', description: 'Write a mini-report comparing AI vs human music composition', type: 'create', xpReward: 15, deliverable: 'A music AI comparison report' },
  },

  // Phase 20: Human-AI Collaboration
  { id: 'lesson-22-jr', phase: 20, title: 'AI & Me: Our Future Together', subtitle: 'Phase 20: Human-AI Collaboration', emoji: '🤝', youtubeId: 'aircAruvnKk', xpReward: 40, coinsReward: 15, zone: 'junior', sandboxType: 'quiz', description: 'How humans and smart assistants work as a super team to write stories, design toys, and study.', ttsIntro: 'Teamwork is best! Let\'s see how you and your AI helper can achieve great things together.',
    missionTitle: 'AI Teamwork Challenge', missionEmoji: '🤝', curiosityHook: 'Can you and AI become the ultimate superhero team?', storyContext: 'The AI Partnership Games are here! Prove that humans and AI work better together by completing team challenges that neither could do alone!', videoDuration: '5 min', labDuration: '8 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 60, type: 'vote', question: 'What can humans do better than AI?', options: ['Creativity and emotion', 'Processing big data', 'Repeating tasks fast', 'Working 24/7'], xpReward: 3 },
      { timestampSeconds: 150, type: 'predict', question: 'In the future, will AI replace teachers?', options: ['Yes, completely', 'No — AI will help teachers be even better!'], correctIndex: 1, xpReward: 5 },
    ],
    aiLab: { type: 'explore-lab', title: 'Teamwork Lab', description: 'Explore how humans and AI complement each other', challenges: [
      { id: 'team-1', instruction: 'Complete the human-AI teamwork quiz', type: 'experiment', xpReward: 10 },
      { id: 'team-2', instruction: 'List 5 tasks where AI helps humans do better work', type: 'create', xpReward: 10 },
    ] },
    microProject: { title: 'Dream Team Plan', description: 'Design a project where you and AI collaborate to solve a real problem', type: 'design', xpReward: 15, deliverable: 'A human-AI collaboration plan' },
  },
  { id: 'lesson-22-in', phase: 20, title: 'Human-AI Collaboration: The Future of Work', subtitle: 'Phase 20: Human-AI Collaboration', emoji: '💼', youtubeId: 'aircAruvnKk', xpReward: 55, coinsReward: 22, zone: 'innovator', sandboxType: 'quiz', description: 'Analyze co-piloting models, augmented intelligence, and the shift toward cognitive assistance in careers.', ttsIntro: 'The future job market will value human creativity combined with AI. Let\'s explore co-piloting!',
    missionTitle: 'Future of Work Strategist', missionEmoji: '💼', curiosityHook: 'What job will you have in 2035 that doesn\'t exist today?', storyContext: 'A Fortune 500 company wants to redesign their workforce with AI co-pilots! Analyze which roles benefit from AI augmentation and design the future workplace!', videoDuration: '6 min', labDuration: '10 min', projectDuration: '5 min',
    videoCheckpoints: [
      { timestampSeconds: 120, type: 'quick-quiz', question: 'What is "augmented intelligence"?', options: ['Replacing humans with AI', 'AI that enhances human decision-making', 'AI that works alone'], correctIndex: 1, xpReward: 5 },
      { timestampSeconds: 240, type: 'predict', question: 'Will AI create more jobs than it eliminates?', options: ['Yes — new types of jobs will emerge!', 'No — AI will cause massive unemployment'], correctIndex: 0, xpReward: 5 },
    ],
    aiLab: { type: 'explore-lab', title: 'Future Workplace Lab', description: 'Design the AI-augmented workplace of the future', challenges: [
      { id: 'work-1', instruction: 'Complete the future of work quiz', type: 'experiment', xpReward: 10 },
      { id: 'work-2', instruction: 'Design a co-pilot AI system for a profession of your choice', type: 'create', xpReward: 15 },
    ] },
    microProject: { title: 'Future Job Profile', description: 'Design a job description for a role that doesn\'t exist yet', type: 'design', xpReward: 15, deliverable: 'A future job profile' },
  },
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
  { path: '/play/quiz', emoji: '🎯', title: 'Quiz Arena', desc: 'Test your general AI knowledge', gradFrom: '#EC4899', gradTo: '#7C3AED', border: '#EC4899', shadow: '#BE185D', zones: ['junior', 'innovator'], completionKey: 'play_completed_quiz' },
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
  { path: '/play/detective?category=satellites', emoji: '🛰️', title: 'Canopy Fire Radar', desc: 'Examine thermal imagery detection scenarios', gradFrom: '#3B82F6', gradTo: '#1D4ED8', border: '#3B82F6', shadow: '#1E3A8A', zones: ['innovator'], completionKey: 'play_completed_detective_satellites' },
  { path: '/play/detective?category=traffic', emoji: '🚦', title: 'Smart Grid Planner', desc: 'Solve green light scheduling algorithm case files', gradFrom: '#EF4444', gradTo: '#DC2626', border: '#EF4444', shadow: '#7F1D1D', zones: ['innovator'], completionKey: 'play_completed_detective_traffic' },
  { path: '/play/quiz?topic=futurework', emoji: '🤝', title: 'Future of Work Quiz', desc: 'Map jobs boosted by co-pilots and smart bots', gradFrom: '#10B981', gradTo: '#059669', border: '#10B981', shadow: '#064E3B', zones: ['innovator'], completionKey: 'play_completed_quiz_futurework' },
];

