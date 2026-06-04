/**
 * QuestAI — AI Pet Companion System
 *
 * Every student gets a personal AI Robot Friend that:
 * - Greets them daily
 * - Celebrates achievements
 * - Levels up with XP
 * - Evolves visually through 5 stages
 * - Unlocks accessories
 */

export type PetType = 'explorer' | 'vision' | 'inventor' | 'space';
export type PetStage = 1 | 2 | 3 | 4 | 5;

export interface PetAccessory {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  unlockXP: number;
}

export interface PetDefinition {
  type: PetType;
  name: string;
  description: string;
  stages: {
    stage: PetStage;
    emoji: string;
    label: string;
    minXP: number;
  }[];
  color: string;
  greeting: string[];
}

export interface PetState {
  type: PetType;
  name: string;
  stage: PetStage;
  stageLabel: string;
  emoji: string;
  color: string;
  accessory: string | null;
  greeting: string;
  nextStageXP: number | null;
  xpProgress: number; // 0–100 towards next stage
}

export interface PetSaveData {
  type: PetType;
  selectedAccessory: string | null;
  unlockedAccessories: string[];
  lastGreetedDate: string;
}

const PET_SAVE_KEY = 'questai_pet_data';

// ─── Pet Definitions ────────────────────────────────────────────────────────

export const PET_ACCESSORIES: PetAccessory[] = [
  { id: 'crown',    name: 'Royal Crown',    emoji: '👑', cost: 50,  unlockXP: 100  },
  { id: 'glasses',  name: 'Nerd Glasses',   emoji: '🥽', cost: 30,  unlockXP: 50   },
  { id: 'cape',     name: 'Hero Cape',      emoji: '🦸', cost: 80,  unlockXP: 200  },
  { id: 'hat',      name: 'Wizard Hat',     emoji: '🧙', cost: 60,  unlockXP: 150  },
  { id: 'star',     name: 'Gold Star',      emoji: '⭐', cost: 40,  unlockXP: 80   },
  { id: 'rocket',   name: 'Rocket Pack',    emoji: '🚀', cost: 120, unlockXP: 400  },
  { id: 'diamond',  name: 'Diamond Badge',  emoji: '💎', cost: 200, unlockXP: 800  },
];

export const PETS: Record<PetType, PetDefinition> = {
  explorer: {
    type: 'explorer',
    name: 'Explorer Bot',
    description: 'A curious robot who loves discovering AI all around the world!',
    color: '#3B82F6',
    greeting: [
      "Beep boop! Ready to explore AI today? 🌍",
      "Hello, Explorer! New adventures await! 🗺️",
      "Good to see you! Let's discover something amazing! ⚡",
      "Welcome back, AI Pioneer! Let's learn! 🤖",
    ],
    stages: [
      { stage: 1, emoji: '🤖', label: 'Baby Bot',       minXP: 0    },
      { stage: 2, emoji: '🦾', label: 'Scout Bot',      minXP: 100  },
      { stage: 3, emoji: '🛸', label: 'Explorer Bot',   minXP: 300  },
      { stage: 4, emoji: '🚀', label: 'Rocket Bot',     minXP: 600  },
      { stage: 5, emoji: '🌟', label: 'Legend Bot',     minXP: 1000 },
    ],
  },
  vision: {
    type: 'vision',
    name: 'Vision Bot',
    description: 'A smart robot with incredible vision powers!',
    color: '#10B981',
    greeting: [
      "I can see everything! Let's train your AI eyes! 👁️",
      "Scanning for knowledge... ready! 🔍",
      "Vision active! Let's learn about AI today! 🤖",
      "My cameras are charged! Time to learn! ⚡",
    ],
    stages: [
      { stage: 1, emoji: '🤖', label: 'Pixel Bot',    minXP: 0    },
      { stage: 2, emoji: '🔭', label: 'Scout Vision', minXP: 100  },
      { stage: 3, emoji: '🧿', label: 'Vision Bot',   minXP: 300  },
      { stage: 4, emoji: '👁️', label: 'Cyber Eye',    minXP: 600  },
      { stage: 5, emoji: '💫', label: 'Oracle Bot',   minXP: 1000 },
    ],
  },
  inventor: {
    type: 'inventor',
    name: 'Inventor Bot',
    description: 'A creative bot who loves building new AI inventions!',
    color: '#F59E0B',
    greeting: [
      "Let's invent something incredible today! 💡",
      "My idea generator is spinning! Ready? ⚙️",
      "Greetings, fellow inventor! Create something! 🔧",
      "New blueprints loaded! Let's build! 🏗️",
    ],
    stages: [
      { stage: 1, emoji: '🤖', label: 'Tinker Bot',   minXP: 0    },
      { stage: 2, emoji: '⚙️', label: 'Build Bot',    minXP: 100  },
      { stage: 3, emoji: '💡', label: 'Idea Bot',     minXP: 300  },
      { stage: 4, emoji: '🔬', label: 'Lab Bot',      minXP: 600  },
      { stage: 5, emoji: '🏆', label: 'Master Inventor', minXP: 1000 },
    ],
  },
  space: {
    type: 'space',
    name: 'Space Bot',
    description: 'A cosmic robot who explores the universe with AI!',
    color: '#7C3AED',
    greeting: [
      "Greetings from the cosmos! Ready to learn? 🌌",
      "Stars aligned! Today is perfect for AI learning! ✨",
      "Mission briefing: LEARN EVERYTHING! 🛸",
      "Space signals received! Let's explore! 🚀",
    ],
    stages: [
      { stage: 1, emoji: '🤖', label: 'Star Bot',     minXP: 0    },
      { stage: 2, emoji: '🛸', label: 'Orbit Bot',    minXP: 100  },
      { stage: 3, emoji: '🌙', label: 'Moon Bot',     minXP: 300  },
      { stage: 4, emoji: '🪐', label: 'Planet Bot',   minXP: 600  },
      { stage: 5, emoji: '🌟', label: 'Galaxy Bot',   minXP: 1000 },
    ],
  },
};

// ─── Pet State Logic ─────────────────────────────────────────────────────────

function getStageForXP(stages: PetDefinition['stages'], xp: number) {
  let current = stages[0];
  for (const s of stages) {
    if (xp >= s.minXP) current = s;
  }
  return current;
}

function getNextStage(stages: PetDefinition['stages'], currentStage: PetStage) {
  return stages.find(s => s.stage === (currentStage + 1) as PetStage) ?? null;
}

export function getPetState(xp: number): PetState {
  const saveData = loadPetData();
  const petDef = PETS[saveData.type];
  const currentStageData = getStageForXP(petDef.stages, xp);
  const nextStageData = getNextStage(petDef.stages, currentStageData.stage as PetStage);

  const xpProgress = nextStageData
    ? Math.round(((xp - currentStageData.minXP) / (nextStageData.minXP - currentStageData.minXP)) * 100)
    : 100;

  // Pick greeting based on day of week for variety
  const greetingIdx = new Date().getDay() % petDef.greeting.length;

  return {
    type: saveData.type,
    name: petDef.name,
    stage: currentStageData.stage as PetStage,
    stageLabel: currentStageData.label,
    emoji: currentStageData.emoji,
    color: petDef.color,
    accessory: saveData.selectedAccessory,
    greeting: petDef.greeting[greetingIdx],
    nextStageXP: nextStageData?.minXP ?? null,
    xpProgress,
  };
}

// ─── Persistence ─────────────────────────────────────────────────────────────

function getDefaultPetData(): PetSaveData {
  return {
    type: 'explorer',
    selectedAccessory: null,
    unlockedAccessories: [],
    lastGreetedDate: '',
  };
}

export function loadPetData(): PetSaveData {
  try {
    const raw = localStorage.getItem(PET_SAVE_KEY);
    return raw ? { ...getDefaultPetData(), ...JSON.parse(raw) } : getDefaultPetData();
  } catch {
    return getDefaultPetData();
  }
}

export function savePetData(data: Partial<PetSaveData>): void {
  const current = loadPetData();
  localStorage.setItem(PET_SAVE_KEY, JSON.stringify({ ...current, ...data }));
}

export function selectPet(type: PetType): void {
  savePetData({ type });
}

export function equipAccessory(id: string | null): void {
  savePetData({ selectedAccessory: id });
}

export function unlockAccessory(id: string, coins: number): { success: boolean; remainingCoins: number } {
  const acc = PET_ACCESSORIES.find(a => a.id === id);
  if (!acc || coins < acc.cost) return { success: false, remainingCoins: coins };
  const data = loadPetData();
  if (!data.unlockedAccessories.includes(id)) {
    savePetData({ unlockedAccessories: [...data.unlockedAccessories, id] });
  }
  return { success: true, remainingCoins: coins - acc.cost };
}

export function hasNewGreeting(): boolean {
  const data = loadPetData();
  const today = new Date().toISOString().split('T')[0];
  return data.lastGreetedDate !== today;
}

export function markGreeted(): void {
  const today = new Date().toISOString().split('T')[0];
  savePetData({ lastGreetedDate: today });
}
