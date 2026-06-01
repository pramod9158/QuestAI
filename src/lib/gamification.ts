import { supabase } from './supabase';


// --- XP & Coins ---
export async function awardXP(userId: string, amount: number, _reason?: string): Promise<void> {
  try {
    const { data: profile } = await supabase.from('profiles').select('xp').eq('id', userId).single();
    if (!profile) return;
    await supabase.from('profiles').update({ xp: profile.xp + amount }).eq('id', userId);
  } catch (err) {
    console.warn('awardXP failed (offline mode):', err);
  }
}

export async function awardCoins(userId: string, amount: number): Promise<void> {
  try {
    const { data: profile } = await supabase.from('profiles').select('coins').eq('id', userId).single();
    if (!profile) return;
    await supabase.from('profiles').update({ coins: profile.coins + amount }).eq('id', userId);
  } catch (err) {
    console.warn('awardCoins failed:', err);
  }
}

// --- Streak ---
export async function updateStreak(userId: string): Promise<number> {
  try {
    const { data: profile } = await supabase
      .from('profiles').select('current_streak, last_active_date').eq('id', userId).single();
    if (!profile) return 0;
    const today = new Date().toISOString().split('T')[0];
    const lastActive = profile.last_active_date;
    if (lastActive === today) return profile.current_streak;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newStreak = lastActive === yesterday ? profile.current_streak + 1 : 1;
    await supabase.from('profiles').update({ current_streak: newStreak, last_active_date: today }).eq('id', userId);
    return newStreak;
  } catch (err) {
    console.warn('updateStreak failed:', err);
    return 0;
  }
}

// --- Level from XP ---
export function getLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function getXPForNextLevel(xp: number): { current: number; needed: number; progress: number } {
  const currentLevelXP = (getLevel(xp) - 1) * 100;
  const nextLevelXP = getLevel(xp) * 100;
  const current = xp - currentLevelXP;
  const needed = nextLevelXP - currentLevelXP;
  return { current, needed, progress: (current / needed) * 100 };
}

// --- Badge System ---
export const BADGES = [
  { id: 'first_steps', name: 'First Steps', emoji: '👟', description: 'Completed your first lesson', condition: (xp: number) => xp >= 10 },
  { id: 'vision_detective', name: 'Vision Detective', emoji: '🔍', description: 'Trained your first image classifier', condition: (xp: number) => xp >= 50 },
  { id: 'master_trainer', name: 'Master Trainer', emoji: '🏆', description: 'AI classifier hit 90%+ accuracy', condition: (xp: number) => xp >= 200 },
  { id: 'idea_wizard', name: 'Idea Wizard', emoji: '🧙', description: 'Generated 5 AI ideas', condition: (xp: number) => xp >= 150 },
  { id: 'story_hero', name: 'Story Hero', emoji: '⚔️', description: 'Completed 3 story adventures', condition: (xp: number) => xp >= 300 },
  { id: 'quiz_champion', name: 'Quiz Champion', emoji: '🎯', description: 'Scored 100% in a quiz', condition: (xp: number) => xp >= 100 },
  { id: 'mission_expert', name: 'Mission Expert', emoji: '🚀', description: 'Completed 3 weekly missions', condition: (xp: number) => xp >= 250 },
  { id: 'ai_explorer', name: 'AI Explorer', emoji: '🌟', description: 'Reached Level 5', condition: (xp: number) => xp >= 400 },
  { id: 'inventor', name: 'Inventor', emoji: '💡', description: 'Created your first invention', condition: (xp: number) => xp >= 120 },
  { id: 'streak_master', name: 'Streak Master', emoji: '🔥', description: 'Maintained a 7-day streak', condition: (_xp: number, streak?: number) => (streak || 0) >= 7 },
];

export function getEarnedBadges(xp: number, streak = 0): typeof BADGES {
  return BADGES.filter(b => b.condition(xp, streak));
}

// --- TTS ---
export function speak(text: string, rate = 0.9, pitch = 1.1): void {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-IN';
  utterance.rate = rate;
  utterance.pitch = pitch;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

// --- Local Storage Fallback (Guest Mode) ---
export const LOCAL_PROFILE_KEY = 'ai_explorer_guest_profile';
export interface GuestProfile {
  username: string;
  zone: 'junior' | 'innovator';
  xp: number;
  coins: number;
  current_streak: number;
  last_active_date: string;
  earned_badges: string[];
  completed_lessons: string[];
}

export function getGuestProfile(): GuestProfile | null {
  try {
    const data = localStorage.getItem(LOCAL_PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

export function saveGuestProfile(profile: GuestProfile): void {
  localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
}

export function updateGuestXP(amount: number): GuestProfile | null {
  const profile = getGuestProfile();
  if (!profile) return null;
  const updated = { ...profile, xp: profile.xp + amount };
  saveGuestProfile(updated);
  return updated;
}
