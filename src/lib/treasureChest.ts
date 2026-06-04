/**
 * QuestAI — Treasure Chest System
 *
 * Chests are awarded after:
 * - Completing 1 lesson (bronze chest)
 * - Completing 3 lessons (silver chest)
 * - Completing 1 module (gold chest)
 * - Completing weekly mission (epic chest)
 *
 * Possible rewards: Coins, XP Boosts, Rare AI Cards, Avatar Accessories, Special Titles
 */

import type { RewardRarity } from './loginRewards';

export type ChestTier = 'bronze' | 'silver' | 'gold' | 'epic' | 'legendary';
export type ChestTrigger = 'lesson_1' | 'lesson_3' | 'module' | 'mission' | 'quiz_perfect' | 'streak_7';

export interface ChestReward {
  type: 'coins' | 'xp_boost' | 'ai_card' | 'accessory' | 'title';
  amount?: number;
  item?: string;
  emoji: string;
  label: string;
  rarity: RewardRarity;
}

export interface Chest {
  id: string;
  tier: ChestTier;
  trigger: ChestTrigger;
  triggerLabel: string;
  reward: ChestReward;
  earnedAt: string;
  opened: boolean;
}

const CHEST_STORAGE_KEY = 'questai_treasure_chests';

// ─── Chest Tier Metadata ─────────────────────────────────────────────────────

export const CHEST_TIER_META: Record<ChestTier, {
  emoji: string; name: string; color: string; glow: string;
}> = {
  bronze:    { emoji: '📦', name: 'Bronze Chest',    color: '#CD7F32', glow: '0 0 15px rgba(205,127,50,0.6)'   },
  silver:    { emoji: '🪙', name: 'Silver Chest',    color: '#C0C0C0', glow: '0 0 20px rgba(192,192,192,0.7)'  },
  gold:      { emoji: '💛', name: 'Golden Chest',    color: '#FFD700', glow: '0 0 25px rgba(255,215,0,0.8)'    },
  epic:      { emoji: '💜', name: 'Epic Chest',      color: '#A78BFA', glow: '0 0 30px rgba(167,139,250,0.8)'  },
  legendary: { emoji: '👑', name: 'Legendary Chest', color: '#FFD60A', glow: '0 0 40px rgba(255,214,10,0.9), 0 0 80px rgba(255,214,10,0.4)' },
};

// ─── Reward Pools ─────────────────────────────────────────────────────────────

const REWARD_POOLS: Record<ChestTier, ChestReward[]> = {
  bronze: [
    { type: 'coins', amount: 15,  emoji: '🪙', label: '15 Coins',        rarity: 'common' },
    { type: 'coins', amount: 20,  emoji: '🪙', label: '20 Coins',        rarity: 'common' },
    { type: 'xp_boost', amount: 10, emoji: '⚡', label: '+10 XP Boost',  rarity: 'common' },
    { type: 'title', item: 'Rookie Explorer', emoji: '🏅', label: 'Title: Rookie Explorer', rarity: 'common' },
  ],
  silver: [
    { type: 'coins', amount: 35,  emoji: '🪙', label: '35 Coins',        rarity: 'common' },
    { type: 'xp_boost', amount: 25, emoji: '⚡', label: '+25 XP Boost',  rarity: 'rare'   },
    { type: 'ai_card', item: 'AI Farmer',  emoji: '🃏', label: 'AI Farmer Card',  rarity: 'rare' },
    { type: 'accessory', item: 'glasses',  emoji: '🥽', label: 'Nerd Glasses',    rarity: 'rare' },
    { type: 'title', item: 'Code Cadet',   emoji: '🎖️', label: 'Title: Code Cadet', rarity: 'common' },
  ],
  gold: [
    { type: 'coins', amount: 75,   emoji: '🪙', label: '75 Coins',       rarity: 'rare'   },
    { type: 'xp_boost', amount: 50, emoji: '⚡', label: '+50 XP Boost',  rarity: 'rare'   },
    { type: 'ai_card', item: 'AI Detective', emoji: '🃏', label: 'AI Detective Card', rarity: 'rare'  },
    { type: 'accessory', item: 'hat',         emoji: '🧙', label: 'Wizard Hat',       rarity: 'rare'  },
    { type: 'accessory', item: 'star',        emoji: '⭐', label: 'Gold Star Badge',  rarity: 'rare'  },
    { type: 'title', item: 'Quest Champion',  emoji: '🏆', label: 'Title: Quest Champion', rarity: 'rare' },
  ],
  epic: [
    { type: 'coins', amount: 150,  emoji: '🪙', label: '150 Coins',      rarity: 'epic'   },
    { type: 'xp_boost', amount: 100, emoji: '⚡', label: '+100 XP Boost', rarity: 'epic'  },
    { type: 'ai_card', item: 'AI Scientist',  emoji: '🃏', label: 'AI Scientist Card', rarity: 'epic'  },
    { type: 'accessory', item: 'cape',        emoji: '🦸', label: 'Hero Cape',         rarity: 'epic'  },
    { type: 'title', item: 'Mission Maestro', emoji: '🌟', label: 'Title: Mission Maestro', rarity: 'epic' },
  ],
  legendary: [
    { type: 'coins', amount: 300,  emoji: '🪙', label: '300 Coins',      rarity: 'legendary' },
    { type: 'xp_boost', amount: 200, emoji: '⚡', label: '+200 XP Boost', rarity: 'legendary' },
    { type: 'ai_card', item: 'AI Space Explorer', emoji: '🃏', label: 'AI Space Explorer Card', rarity: 'legendary' },
    { type: 'accessory', item: 'diamond',    emoji: '💎', label: 'Diamond Badge',      rarity: 'legendary' },
    { type: 'title', item: 'AI Legend',      emoji: '👑', label: 'Title: AI Legend',   rarity: 'legendary' },
  ],
};

const TRIGGER_TO_TIER: Record<ChestTrigger, ChestTier> = {
  lesson_1:    'bronze',
  lesson_3:    'silver',
  module:      'gold',
  mission:     'epic',
  quiz_perfect: 'gold',
  streak_7:    'legendary',
};

const TRIGGER_LABELS: Record<ChestTrigger, string> = {
  lesson_1:    'First Lesson Complete!',
  lesson_3:    '3 Lessons Done!',
  module:      'Module Complete!',
  mission:     'Mission Complete!',
  quiz_perfect: 'Perfect Quiz Score!',
  streak_7:    '7-Day Streak!',
};

// ─── Chest Generation ─────────────────────────────────────────────────────────

export function generateChest(trigger: ChestTrigger): Chest {
  const tier = TRIGGER_TO_TIER[trigger];
  const pool = REWARD_POOLS[tier];
  const reward = pool[Math.floor(Math.random() * pool.length)];

  return {
    id: `chest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    tier,
    trigger,
    triggerLabel: TRIGGER_LABELS[trigger],
    reward,
    earnedAt: new Date().toISOString(),
    opened: false,
  };
}

// ─── Persistence ─────────────────────────────────────────────────────────────

export function loadChests(): Chest[] {
  try {
    return JSON.parse(localStorage.getItem(CHEST_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveChests(chests: Chest[]): void {
  localStorage.setItem(CHEST_STORAGE_KEY, JSON.stringify(chests));
}

export function addChest(trigger: ChestTrigger): Chest {
  const chest = generateChest(trigger);
  const existing = loadChests();
  saveChests([...existing, chest]);
  return chest;
}

export function openChest(chestId: string): Chest | null {
  const chests = loadChests();
  const idx = chests.findIndex(c => c.id === chestId);
  if (idx === -1) return null;
  chests[idx] = { ...chests[idx], opened: true };
  saveChests(chests);
  return chests[idx];
}

export function getUnopenedChests(): Chest[] {
  return loadChests().filter(c => !c.opened);
}

export function getUnopenedCount(): number {
  return getUnopenedChests().length;
}

// Check if a chest should be awarded (deduplicated within 24h)
const TRIGGER_COOLDOWNS: Record<string, number> = {
  lesson_1: 0, lesson_3: 0, module: 0, mission: 0,
  quiz_perfect: 24 * 60 * 60 * 1000,
  streak_7: 7 * 24 * 60 * 60 * 1000,
};

export function shouldAwardChest(trigger: ChestTrigger): boolean {
  const cooldown = TRIGGER_COOLDOWNS[trigger] ?? 0;
  if (cooldown === 0) return true;

  const chests = loadChests();
  const lastSame = chests
    .filter(c => c.trigger === trigger)
    .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())[0];

  if (!lastSame) return true;
  return Date.now() - new Date(lastSame.earnedAt).getTime() > cooldown;
}
