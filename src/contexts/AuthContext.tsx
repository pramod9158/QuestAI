import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { updateStreak, getGuestProfile, saveGuestProfile, type GuestProfile } from '@/lib/gamification';

interface Profile {
  id: string;
  username: string;
  zone: 'junior' | 'innovator';
  avatar_assets: { hat: string; suit: string };
  xp: number;
  coins: number;
  current_streak: number;
  last_active_date: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  guestProfile: GuestProfile | null;
  isGuest: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, username: string, zone?: 'junior' | 'innovator') => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  continueAsGuest: (username: string, zone: 'junior' | 'innovator') => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [guestProfile, setGuestProfileState] = useState<GuestProfile | null>(getGuestProfile);
  const [isLoading, setIsLoading] = useState(true);

  const isGuest = !user && !!guestProfile;

  const fetchProfile = useCallback(async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setProfile(data as Profile);
        await updateStreak(userId);
      } else {
        // Fallback profile creation if none exists in the DB
        const defaultUsername = email ? email.split('@')[0] : `Explorer_${Math.floor(Math.random() * 10000)}`;
        const newProfile = {
          id: userId,
          username: defaultUsername,
          zone: 'junior' as const,
          avatar_assets: { hat: 'none', suit: 'explorer_default' },
          xp: 0,
          coins: 0,
          current_streak: 1,
          last_active_date: new Date().toISOString().split('T')[0],
        };
        const { data: insertedData } = await supabase.from('profiles').insert(newProfile).select().single();
        if (insertedData) {
          setProfile(insertedData as Profile);
        } else {
          setProfile(newProfile as unknown as Profile);
        }
      }
    } catch (err) {
      console.warn("Could not retrieve or create profile:", err);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id, session.user.email).finally(() => setIsLoading(false));
      else setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id, session.user.email);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, username: string, zone: 'junior' | 'innovator' = 'junior') => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          username,
          zone
        }
      }
    });
    if (error) return { error: error.message };
    // If email confirmation is required, session will be null until confirmed
    // We'll insert the profile only if we have a valid session
    if (data.user && data.session) {
      try {
        await supabase.from('profiles').insert({
          id: data.user.id,
          username,
          zone,
          avatar_assets: { hat: 'none', suit: 'explorer_default' },
          xp: 0,
          coins: 0,
          current_streak: 1,
          last_active_date: new Date().toISOString().split('T')[0],
        });
        await fetchProfile(data.user.id, email);
      } catch (err) {
        console.warn("Profile pre-creation failed (will be created on login):", err);
      }
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setGuestProfileState(null);
    localStorage.removeItem('ai_explorer_guest_profile');
  };

  const continueAsGuest = (username: string, zone: 'junior' | 'innovator') => {
    const gp: GuestProfile = {
      username,
      zone,
      xp: 0,
      coins: 0,
      current_streak: 1,
      last_active_date: new Date().toISOString().split('T')[0],
      earned_badges: [],
      completed_lessons: [],
    };
    saveGuestProfile(gp);
    setGuestProfileState(gp);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
    else {
      const gp = getGuestProfile();
      if (gp) setGuestProfileState(gp);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    await supabase.from('profiles').update(updates).eq('id', user.id);
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, guestProfile, isGuest, isLoading,
      signUp, signIn, signOut, continueAsGuest, refreshProfile, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Convenience hook to get current profile (works for both auth and guest)
export function useCurrentProfile() {
  const { profile, guestProfile, isGuest } = useAuth();
  if (isGuest && guestProfile) {
    return {
      username: guestProfile.username,
      zone: guestProfile.zone,
      xp: guestProfile.xp,
      coins: guestProfile.coins,
      current_streak: guestProfile.current_streak,
    };
  }
  return profile ? {
    username: profile.username,
    zone: profile.zone,
    xp: profile.xp,
    coins: profile.coins,
    current_streak: profile.current_streak,
  } : null;
}
