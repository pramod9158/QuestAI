/**
 * QuestAI — Daily Login Reward System
 *
 * Streak-based daily rewards:
 * Day 1  = 10 Coins
 * Day 2  = 20 Coins
 * Day 3  = Mystery Box (50 Coins + rare title)
 * Day 7  = Rare Avatar Item unlock
 * Day 30 = Legendary Reward
 *
 * Regular days (not milestones) = 10 + (streak * 2) coins
 */

const DAILY_REWARD_KEY = 'questai_daily_reward';

export type RewardRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface DailyReward {
  day: number;
  coins: number;
  xp: number;
  title: string;
  description: string;
  emoji: string;
  rarity: RewardRarity;
  bonus?: string; // special unlock
  isMilestone: boolean;
}

export interface RewardSaveData {
  lastClaimDate: string;
  claimedToday: boolean;
}

// ─── Milestone Reward Table ───────────────────────────────────────────────────

export const MILESTONE_REWARDS: Record<number, DailyReward> = {
  1: {
    day: 1,
    coins: 10,
    xp: 5,
    title: 'First Day!',
    description: 'Welcome to QuestAI! Your adventure begins!',
    emoji: '🎉',
    rarity: 'common',
    isMilestone: false,
  },
  2: {
    day: 2,
    coins: 20,
    xp: 10,
    title: 'Coming Back!',
    description: 'Two days in a row — you\'re on a roll!',
    emoji: '🔥',
    rarity: 'common',
    isMilestone: false,
  },
  3: {
    day: 3,
    coins: 50,
    xp: 20,
    title: 'Mystery Box!',
    description: 'A mystery box filled with rare treasures!',
    emoji: '📦',
    rarity: 'rare',
    bonus: 'mystery_box',
    isMilestone: true,
  },
  7: {
    day: 7,
    coins: 100,
    xp: 50,
    title: 'Week Warrior!',
    description: '7 days straight — you\'re an AI Explorer Legend!',
    emoji: '🏆',
    rarity: 'epic',
    bonus: 'rare_avatar_item',
    isMilestone: true,
  },
  14: {
    day: 14,
    coins: 150,
    xp: 75,
    title: 'Fortnight Hero!',
    description: 'Two weeks of dedication — incredible!',
    emoji: '⚡',
    rarity: 'epic',
    bonus: 'epic_badge',
    isMilestone: true,
  },
  30: {
    day: 30,
    coins: 500,
    xp: 200,
    title: 'LEGENDARY EXPLORER!',
    description: 'One full month! You are an absolute legend!',
    emoji: '👑',
    rarity: 'legendary',
    bonus: 'legendary_title',
    isMilestone: true,
  },
};

// ─── Reward Generator ─────────────────────────────────────────────────────────

export function getDailyReward(streak: number): DailyReward {
  // Check if it's a milestone day
  const milestone = MILESTONE_REWARDS[streak];
  if (milestone) return milestone;

  // Regular day — escalating reward
  const coins = Math.min(10 + streak * 2, 80);
  const xp = Math.min(5 + streak, 40);

  return {
    day: streak,
    coins,
    xp,
    title: `Day ${streak} Streak!`,
    description: `Keep it up! You're building amazing habits!`,
    emoji: streak >= 20 ? '🌟' : streak >= 10 ? '⭐' : '🔥',
    rarity: streak >= 20 ? 'rare' : 'common',
    isMilestone: false,
  };
}

// ─── Persistence ─────────────────────────────────────────────────────────────

function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function loadRewardData(username: string): RewardSaveData {
  try {
    const raw = localStorage.getItem(`${DAILY_REWARD_KEY}_${username}`);
    return raw ? JSON.parse(raw) : { lastClaimDate: '', claimedToday: false };
  } catch {
    return { lastClaimDate: '', claimedToday: false };
  }
}

function saveRewardData(username: string, data: RewardSaveData): void {
  localStorage.setItem(`${DAILY_REWARD_KEY}_${username}`, JSON.stringify(data));
}

export function hasUnclaimedDailyReward(username: string): boolean {
  const data = loadRewardData(username);
  const today = getLocalDateString();
  return data.lastClaimDate !== today;
}

export function claimDailyReward(username: string): void {
  const today = getLocalDateString();
  saveRewardData(username, { lastClaimDate: today, claimedToday: true });
}

export function getRewardRarityColor(rarity: RewardRarity): string {
  switch (rarity) {
    case 'legendary': return '#FFD60A';
    case 'epic':      return '#A78BFA';
    case 'rare':      return '#3B82F6';
    default:          return '#10B981';
  }
}

export function getRewardRarityGlow(rarity: RewardRarity): string {
  switch (rarity) {
    case 'legendary': return '0 0 30px rgba(255,214,10,0.8), 0 0 60px rgba(255,214,10,0.4)';
    case 'epic':      return '0 0 20px rgba(167,139,250,0.7), 0 0 40px rgba(167,139,250,0.3)';
    case 'rare':      return '0 0 15px rgba(59,130,246,0.6)';
    default:          return 'none';
  }
}
