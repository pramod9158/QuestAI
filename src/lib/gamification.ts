import { supabase } from './supabase';
import { CURRICULUM, WEEKLY_MISSIONS_DATA, PLAY_MODULES_DATA } from '../data/curriculum';


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
  // Original 10 badges
  { id: 'first_steps',      name: 'First Steps',      emoji: '👟', description: 'Completed your first lesson',         condition: (xp: number) => xp >= 10 },
  { id: 'vision_detective', name: 'Vision Detective', emoji: '🔍', description: 'Trained your first image classifier', condition: (xp: number) => xp >= 50 },
  { id: 'master_trainer',   name: 'Master Trainer',   emoji: '🏆', description: 'AI classifier hit 90%+ accuracy',    condition: (xp: number) => xp >= 200 },
  { id: 'idea_wizard',      name: 'Idea Wizard',      emoji: '🧙', description: 'Generated 5 AI ideas',               condition: (xp: number) => xp >= 150 },
  { id: 'story_hero',       name: 'Story Hero',       emoji: '⚔️', description: 'Completed 3 story adventures',       condition: (xp: number) => xp >= 300 },
  { id: 'quiz_champion',    name: 'Quiz Champion',    emoji: '🎯', description: 'Scored 100% in a quiz',              condition: (xp: number) => xp >= 100 },
  { id: 'mission_expert',   name: 'Mission Expert',   emoji: '🚀', description: 'Completed 3 weekly missions',        condition: (xp: number) => xp >= 250 },
  { id: 'ai_explorer',      name: 'AI Explorer',      emoji: '🌟', description: 'Reached Level 5',                    condition: (xp: number) => xp >= 400 },
  { id: 'inventor',         name: 'Inventor',         emoji: '💡', description: 'Created your first invention',       condition: (xp: number) => xp >= 120 },
  { id: 'streak_master',    name: 'Streak Master',    emoji: '🔥', description: 'Maintained a 7-day streak',          condition: (_xp: number, streak?: number) => (streak || 0) >= 7 },

  // Extended badge set (+15 new badges)
  { id: 'first_quest',      name: 'Quest Starter',    emoji: '🗺️', description: 'Completed your first story quest',   condition: (xp: number) => xp >= 80 },
  { id: 'streak_3',         name: '3-Day Hero',       emoji: '🔥', description: 'Logged in 3 days in a row',          condition: (_xp: number, streak?: number) => (streak || 0) >= 3 },
  { id: 'streak_5',         name: 'High Five Streak', emoji: '✋', description: 'Logged in 5 days in a row',          condition: (_xp: number, streak?: number) => (streak || 0) >= 5 },
  { id: 'streak_14',        name: '2-Week Champion',  emoji: '📅', description: 'Maintained a 14-day streak',         condition: (_xp: number, streak?: number) => (streak || 0) >= 14 },
  { id: 'streak_30',        name: 'Monthly Legend',   emoji: '🌙', description: 'Maintained a 30-day streak',         condition: (_xp: number, streak?: number) => (streak || 0) >= 30 },
  { id: 'level_3',          name: 'Rising Star',      emoji: '⭐', description: 'Reached Level 3',                    condition: (xp: number) => xp >= 200 },
  { id: 'level_10',         name: 'AI Pioneer',       emoji: '🚀', description: 'Reached Level 10',                   condition: (xp: number) => xp >= 900 },
  { id: 'level_20',         name: 'AI Master',        emoji: '🧠', description: 'Reached Level 20',                   condition: (xp: number) => xp >= 1900 },
  { id: 'xp_500',           name: 'XP Collector',     emoji: '⚡', description: 'Earned 500 XP total',                condition: (xp: number) => xp >= 500 },
  { id: 'xp_1000',          name: 'XP Legend',        emoji: '💫', description: 'Earned 1000 XP total',               condition: (xp: number) => xp >= 1000 },
  { id: 'world_1',          name: 'World Explorer',   emoji: '🌍', description: 'Completed World 1: AI Around Me',    condition: (xp: number) => xp >= 180 },
  { id: 'world_2',          name: 'Vision Master',    emoji: '👁️', description: 'Completed World 2: Robot Vision',    condition: (xp: number) => xp >= 350 },
  { id: 'card_collector',   name: 'Card Collector',   emoji: '🃏', description: 'Collected 3 AI Hero Cards',          condition: (xp: number) => xp >= 130 },
  { id: 'prompt_master',    name: 'Prompt Master',    emoji: '✨', description: 'Mastered AI prompt engineering',      condition: (xp: number) => xp >= 220 },
  { id: 'ai_legend',        name: 'AI Legend',        emoji: '👑', description: 'Reached the pinnacle of AI mastery', condition: (xp: number) => xp >= 2000 },
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

export interface ProgressStats {
  completedLessons: number;
  totalLessons: number;
  lessonPercent: number;
  completedPlay: number;
  totalPlay: number;
  playPercent: number;
  completedMissions: number;
  totalMissions: number;
  missionPercent: number;
  overallPercent: number;
}

export function getPlatformProgress(profile: any): ProgressStats {
  const userZone = profile?.zone || 'junior';
  
  // 1. Lessons Progress
  const completedLessonsList = profile?.completed_lessons || [];
  const filteredLessons = CURRICULUM.filter(l => l.zone === userZone || l.zone === 'both');
  const totalLessons = filteredLessons.length;
  
  let lessonSum = 0;
  let completedLessons = 0;
  
  filteredLessons.forEach(l => {
    const isDone = completedLessonsList.includes(l.id);
    if (isDone) {
      lessonSum += 100;
      completedLessons++;
    } else if (typeof window !== 'undefined') {
      const p = parseInt(localStorage.getItem(`lesson_progress_${l.id}`) || '0', 10);
      lessonSum += p;
    }
  });
  
  const lessonPercent = totalLessons > 0 ? Math.round(lessonSum / totalLessons) : 0;
  
  // 2. Play Progress
  let completedPlay = 0;
  let playSum = 0;
  const userModules = PLAY_MODULES_DATA.filter(mod => mod.zones.includes(userZone));
  const totalPlay = userModules.length || 1;

  if (typeof window !== 'undefined') {
    userModules.forEach(mod => {
      let percent = 0;
      const key = mod.completionKey;
      if (key === 'quests') {
        const done = !!(profile?.completed_quests && profile.completed_quests.length > 0);
        percent = done ? 100 : 0;
      } else if (key.startsWith('quests_')) {
        const qId = key.replace('quests_', '');
        const done = localStorage.getItem(`quests_${qId}`) === 'true' || !!(profile?.completed_quests && profile.completed_quests.includes(qId));
        if (done) {
          percent = 100;
        } else {
          percent = parseInt(localStorage.getItem(`play_progress_story_${qId}`) || '0', 10);
        }
      } else if (key === 'inventions') {
        const rawInventions = JSON.parse(localStorage.getItem('guest_inventions') || '[]');
        percent = rawInventions.length > 0 ? 100 : localStorage.getItem('play_progress_brainstorm') ? 50 : 0;
      } else if (key === 'ideas') {
        const savedIdeas = JSON.parse(localStorage.getItem('saved_ideas') || '[]');
        percent = savedIdeas.length > 0 ? 100 : localStorage.getItem('play_progress_idea-generator') ? 50 : 0;
      } else {
        const done = localStorage.getItem(key) === 'true';
        if (done) {
          percent = 100;
        } else {
          const progKey = key.replace('play_completed_', 'play_progress_');
          percent = parseInt(localStorage.getItem(progKey) || '0', 10);
        }
      }
      playSum += percent;
      if (percent === 100) completedPlay++;
    });
  }
  const playPercent = Math.round(playSum / totalPlay);
  
  // 3. Missions Progress
  let customMissions: any[] = [];
  let rawSubs: any[] = [];
  if (typeof window !== 'undefined') {
    customMissions = JSON.parse(localStorage.getItem('parent_custom_missions') || '[]');
    rawSubs = JSON.parse(localStorage.getItem('mission_submissions') || '[]');
  }
  const zoneMissions = WEEKLY_MISSIONS_DATA.filter(m => m.zone === userZone || m.zone === 'both');
  const allMissions = [...zoneMissions, ...customMissions];
  const totalMissions = allMissions.length || 1;
  
  let missionSum = 0;
  let completedMissions = 0;
  
  allMissions.forEach(m => {
    const done = rawSubs.some(s => s.missionId === m.id && s.status === 'approved');
    if (done) {
      missionSum += 100;
      completedMissions++;
    } else if (typeof window !== 'undefined') {
      const p = parseInt(localStorage.getItem(`mission_progress_${m.id}`) || '0', 10);
      missionSum += p;
    }
  });
  
  const missionPercent = Math.round(missionSum / totalMissions);
  
  // 4. Overall Progress
  const overallPercent = Math.round((lessonPercent + playPercent + missionPercent) / 3);
  
  return {
    completedLessons,
    totalLessons,
    lessonPercent,
    completedPlay,
    totalPlay,
    playPercent,
    completedMissions,
    totalMissions,
    missionPercent,
    overallPercent
  };
}

