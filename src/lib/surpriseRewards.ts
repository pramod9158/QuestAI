/**
 * QuestAI — Surprise & Delight System
 * Manages mystery chests, easter eggs, secret missions, and bonus multiplier events.
 */

export interface MysteryDrop {
  type: 'coins' | 'xp' | 'gem' | 'badge' | 'title';
  value: string | number;
  emoji: string;
  label: string;
}

const MYSTERY_REWARDS: MysteryDrop[] = [
  { type: 'coins', value: 15, emoji: '🪙', label: '15 Golden Coins' },
  { type: 'coins', value: 30, emoji: '🪙', label: '30 Golden Coins' },
  { type: 'xp', value: 20, emoji: '⚡', label: '20 Sparky Energy XP' },
  { type: 'xp', value: 50, emoji: '⚡', label: '50 Sparky Energy XP' },
  { type: 'gem', value: 5, emoji: '💎', label: '5 Premium Gems' },
  { type: 'gem', value: 10, emoji: '💎', label: '10 Premium Gems' },
  { type: 'title', value: 'AI Prodigy', emoji: '🎓', label: 'Title: AI Prodigy' },
  { type: 'title', value: 'Code Breaker', emoji: '🔐', label: 'Title: Code Breaker' },
];

/**
 * Checks if a mystery box drops after completing an AI Lab.
 * Returns a random reward with a 20% probability.
 */
export function rollMysteryReward(): MysteryDrop | null {
  const roll = Math.random();
  if (roll > 0.20) return null; // 20% drop rate

  const index = Math.floor(Math.random() * MYSTERY_REWARDS.length);
  return MYSTERY_REWARDS[index];
}

export interface SecretMission {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xpReward: number;
}

/**
 * Determines if any secret hidden missions have been unlocked based on user metrics.
 */
export function getSecretMissions(xp: number, streak: number): SecretMission[] {
  const secrets: SecretMission[] = [];

  if (streak >= 5) {
    secrets.push({
      id: 'secret-streak-lord',
      title: 'Secret: Streak Overlord',
      description: 'Log in 5 days straight. Your fire burns brightly!',
      emoji: '🔥',
      xpReward: 100,
    });
  }

  if (xp >= 1500) {
    secrets.push({
      id: 'secret-sage',
      title: 'Secret: AI Sage Wisdom',
      description: 'Cross the 1500 XP threshold to become a legendary researcher.',
      emoji: '📜',
      xpReward: 200,
    });
  }

  return secrets;
}

/**
 * Determines if today is a random double-XP bonus day.
 * Triggered on weekends (Saturday, Sunday) or Wednesdays (Midweek madness!).
 */
export function isBonusXpDay(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6 || day === 3; // Sat, Sun, Wed
}

export interface EasterEgg {
  triggerId: string;
  clue: string;
  rewardText: string;
  xpReward: number;
}

export const EASTER_EGGS: EasterEgg[] = [
  {
    triggerId: 'sparky-click-5',
    clue: 'Tickle Sparky 5 times on the homepage!',
    rewardText: 'Sparky giggled and dropped some secrets!',
    xpReward: 15,
  },
  {
    triggerId: 'secret-pfp-double-tap',
    clue: 'Double tap your profile picture in the dashboard!',
    rewardText: 'Hidden scanner detected! Profile upgraded.',
    xpReward: 25,
  },
];
