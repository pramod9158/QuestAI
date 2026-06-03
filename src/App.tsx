import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth, useCurrentProfile } from '@/contexts/AuthContext';
import { AppShell } from '@/layouts/AppShell';

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
          <div className="w-32 h-3" style={{ background: '#16103A', border: '2px solid #7C3AED' }}>
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

      {/* Protected routes with AppShell */}
      <Route path="/" element={hasProfile ? <AppShell><Home /></AppShell> : <Navigate to="/auth" replace />} />
      <Route path="/learn" element={hasProfile ? <AppShell><Learn /></AppShell> : <Navigate to="/auth" replace />} />
      <Route path="/learn/:id" element={hasProfile ? <AppShell><LessonPlayer /></AppShell> : <Navigate to="/auth" replace />} />
      <Route path="/play" element={hasProfile ? <AppShell><Play /></AppShell> : <Navigate to="/auth" replace />} />
      <Route path="/play/around-me" element={hasProfile ? <AppShell><AIAroundMe /></AppShell> : <Navigate to="/auth" replace />} />
      <Route path="/play/story" element={hasProfile ? <AppShell><StoryAdventures /></AppShell> : <Navigate to="/auth" replace />} />
      <Route path="/play/detective" element={hasProfile ? <AppShell><AIDetective /></AppShell> : <Navigate to="/auth" replace />} />
      <Route path="/play/brainstorm" element={hasProfile ? <AppShell><BrainstormPlayground /></AppShell> : <Navigate to="/auth" replace />} />
      <Route path="/missions" element={hasProfile ? <AppShell><WeeklyMissions /></AppShell> : <Navigate to="/auth" replace />} />
      <Route path="/play/idea-generator" element={hasProfile ? <AppShell><AIIdeaGenerator /></AppShell> : <Navigate to="/auth" replace />} />
      <Route path="/play/cards" element={hasProfile ? <AppShell><AICards /></AppShell> : <Navigate to="/auth" replace />} />
      <Route path="/play/quiz" element={hasProfile ? <AppShell><QuizArena /></AppShell> : <Navigate to="/auth" replace />} />
      <Route path="/play/inventor-hall" element={hasProfile ? <AppShell><InventorHall /></AppShell> : <Navigate to="/auth" replace />} />
      <Route path="/profile" element={hasProfile ? <AppShell><Profile /></AppShell> : <Navigate to="/auth" replace />} />
      <Route path="/leaderboard" element={hasProfile ? <AppShell><Leaderboard /></AppShell> : <Navigate to="/auth" replace />} />
      <Route path="/comic" element={hasProfile ? <AppShell><ComicCreator /></AppShell> : <Navigate to="/auth" replace />} />
      <Route path="/dashboard" element={hasProfile ? <Dashboard /> : <Navigate to="/auth" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={hasProfile ? '/' : '/auth'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: '#1E1B4B', color: 'white', border: '3px solid #7C3AED', borderRadius: 0, fontFamily: '"Fredoka One", cursive', boxShadow: '4px 4px 0px #5B21B6' },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
