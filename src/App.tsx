import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth, useCurrentProfile } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AppShell } from '@/layouts/AppShell';
import { PLAY_MODULES_DATA } from '@/data/curriculum';

// Pages
import Onboarding from '@/pages/Onboarding';
import Auth from '@/pages/Auth';
import Home from '@/pages/Home';
import Learn from '@/pages/Learn';
import Play from '@/pages/Play';
import Profile from '@/pages/Profile';
import Dashboard from '@/pages/Dashboard';
import Leaderboard from '@/pages/Leaderboard';
import ComicCreator from '@/pages/ComicCreator';
import PromptEngineering from '@/pages/PromptEngineering';

// Lesson Player
import LessonPlayer from '@/pages/modules/LessonPlayer';

// Modules
import AIAroundMe from '@/pages/modules/AIAroundMe';
import StoryAdventures from '@/pages/modules/StoryAdventures';
import AIDetective from '@/pages/modules/AIDetective';
import BrainstormPlayground from '@/pages/modules/BrainstormPlayground';
import WeeklyMissions from '@/pages/modules/WeeklyMissions';
import AIIdeaGenerator from '@/pages/modules/AIIdeaGenerator';
import AICards from '@/pages/modules/AICards';
import QuizArena from '@/pages/modules/QuizArena';
import InventorHall from '@/pages/modules/InventorHall';
import WorldMap from '@/pages/WorldMap';
import AvatarCustomization from '@/pages/AvatarCustomization';

function PlayZoneGuard({ children }: { children: React.ReactNode }) {
  const profile = useCurrentProfile();
  const location = useLocation();

  if (!profile) return <>{children}</>;

  const userZone = profile.zone || 'junior';
  const filtered = PLAY_MODULES_DATA.filter(mod => mod.zones.includes(userZone));

  const rawInventions = JSON.parse(localStorage.getItem('guest_inventions') || '[]');
  const savedIdeas = JSON.parse(localStorage.getItem('saved_ideas') || '[]');

  const isModDone = (path: string) => {
    const mod = PLAY_MODULES_DATA.find(m => m.path === path);
    if (!mod) return false;
    const key = mod.completionKey;
    if (key === 'quests') {
      return !!(profile?.completed_quests && profile.completed_quests.length > 0);
    } else if (key.startsWith('quests_')) {
      const qId = key.replace('quests_', '');
      return localStorage.getItem(`quests_${qId}`) === 'true' || !!(profile?.completed_quests && profile.completed_quests.includes(qId));
    } else if (key === 'inventions') {
      return rawInventions.length > 0;
    } else if (key === 'ideas') {
      return savedIdeas.length > 0;
    } else {
      return localStorage.getItem(key) === 'true';
    }
  };

  const activePlayIndex = filtered.findIndex(mod => !isModDone(mod.path));

  if (activePlayIndex === -1) {
    return <>{children}</>;
  }

  const activeMod = filtered[activePlayIndex];
  const currentPath = location.pathname + location.search;

  if (location.pathname === '/play') {
    return <>{children}</>;
  }

  const matchedIndex = filtered.findIndex(mod => {
    return currentPath === mod.path || currentPath.split('?')[0] === mod.path.split('?')[0];
  });

  if (matchedIndex !== -1 && matchedIndex > activePlayIndex) {
    return <Navigate to={`/play?locked=true&target=${encodeURIComponent(filtered[matchedIndex].path)}&active=${encodeURIComponent(activeMod.path)}`} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isLoading } = useAuth();
  const profile = useCurrentProfile();
  const hasProfile = !!profile;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F0A2E' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl animate-bounce">🤖</div>
          <div className="text-white font-pixel text-[8px] animate-pulse tracking-wider">LOADING AI EXPLORER...</div>
          <div className="w-32 h-3" style={{ background: '#16103A', border: '2px solid #000000' }}>
            <div className="h-full animate-pulse" style={{ background: 'linear-gradient(90deg, #7C3AED, #3B82F6)', width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/auth" element={<Auth />} />

      {/* Protected routes inside AppShell layout to prevent remounting and blank screen transitions */}
      <Route element={hasProfile ? <AppShell /> : <Navigate to="/auth" replace />}>
        <Route path="/" element={<Home />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/:id" element={<LessonPlayer />} />
        <Route path="/play" element={<PlayZoneGuard><Play /></PlayZoneGuard>} />
        <Route path="/play/around-me" element={<PlayZoneGuard><AIAroundMe /></PlayZoneGuard>} />
        <Route path="/play/story" element={<PlayZoneGuard><StoryAdventures /></PlayZoneGuard>} />
        <Route path="/play/detective" element={<PlayZoneGuard><AIDetective /></PlayZoneGuard>} />
        <Route path="/play/brainstorm" element={<PlayZoneGuard><BrainstormPlayground /></PlayZoneGuard>} />
        <Route path="/missions" element={<WeeklyMissions />} />
        <Route path="/play/idea-generator" element={<PlayZoneGuard><AIIdeaGenerator /></PlayZoneGuard>} />
        <Route path="/play/cards" element={<PlayZoneGuard><AICards /></PlayZoneGuard>} />
        <Route path="/play/quiz" element={<PlayZoneGuard><QuizArena /></PlayZoneGuard>} />
        <Route path="/play/inventor-hall" element={<PlayZoneGuard><InventorHall /></PlayZoneGuard>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/prompts" element={<PromptEngineering />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/comic" element={<PlayZoneGuard><ComicCreator /></PlayZoneGuard>} />
        <Route path="/worlds" element={<WorldMap />} />
        <Route path="/avatar" element={<AvatarCustomization />} />
      </Route>
      
      <Route path="/dashboard" element={hasProfile ? <Dashboard /> : <Navigate to="/auth" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={hasProfile ? '/' : '/auth'} replace />} />
    </Routes>
  );
}

import { FeedbackEngineProvider } from '@/contexts/FeedbackEngineContext';
import { LearningCompanionProvider } from '@/contexts/LearningCompanionContext';

// ── Theme-aware Toaster ─────────────────────────────────────────────────────
function ThemedToaster() {
  const { isDuolingo } = useTheme();
  return (
    <Toaster
      position="top-center"
      toastOptions={isDuolingo ? {
        style: {
          background: '#FFFFFF',
          color: '#000000',
          border: '1.5px solid #E0E0E0',
          borderRadius: 12,
          fontFamily: '"Nunito", sans-serif',
          fontWeight: 700,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          padding: '10px 16px',
        },
        success: {
          iconTheme: { primary: '#5FCC5F', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#FF6B6B', secondary: '#fff' },
        },
      } : {
        style: {
          background: '#1E1B4B',
          color: 'white',
          border: '3px solid #000000',
          borderRadius: 0,
          fontFamily: '"Fredoka One", cursive',
          boxShadow: '4px 4px 0px #000000',
        },
      }}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <FeedbackEngineProvider>
        <BrowserRouter>
          <AuthProvider>
            <LearningCompanionProvider>
              <ThemedToaster />
              <AppRoutes />
            </LearningCompanionProvider>
          </AuthProvider>
        </BrowserRouter>
      </FeedbackEngineProvider>
    </ThemeProvider>
  );
}
