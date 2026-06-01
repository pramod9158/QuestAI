import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
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
  const { profile, guestProfile, isLoading } = useAuth();
  const hasProfile = !!profile || !!guestProfile;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-pixel-darker flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl animate-bounce">🤖</div>
          <div className="text-white font-pixel text-[10px] animate-pulse">LOADING AI EXPLORER...</div>
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
      <Route path="/" element={hasProfile ? <AppShell><Home /></AppShell> : <Navigate to="/onboarding" replace />} />
      <Route path="/learn" element={hasProfile ? <AppShell><Learn /></AppShell> : <Navigate to="/onboarding" replace />} />
      <Route path="/learn/:id" element={hasProfile ? <AppShell><LessonPlayer /></AppShell> : <Navigate to="/onboarding" replace />} />
      <Route path="/play" element={hasProfile ? <AppShell><Play /></AppShell> : <Navigate to="/onboarding" replace />} />
      <Route path="/play/around-me" element={hasProfile ? <AppShell><AIAroundMe /></AppShell> : <Navigate to="/onboarding" replace />} />
      <Route path="/play/story" element={hasProfile ? <AppShell><StoryAdventures /></AppShell> : <Navigate to="/onboarding" replace />} />
      <Route path="/play/detective" element={hasProfile ? <AppShell><AIDetective /></AppShell> : <Navigate to="/onboarding" replace />} />
      <Route path="/play/brainstorm" element={hasProfile ? <AppShell><BrainstormPlayground /></AppShell> : <Navigate to="/onboarding" replace />} />
      <Route path="/missions" element={hasProfile ? <AppShell><WeeklyMissions /></AppShell> : <Navigate to="/onboarding" replace />} />
      <Route path="/play/idea-generator" element={hasProfile ? <AppShell><AIIdeaGenerator /></AppShell> : <Navigate to="/onboarding" replace />} />
      <Route path="/play/cards" element={hasProfile ? <AppShell><AICards /></AppShell> : <Navigate to="/onboarding" replace />} />
      <Route path="/play/quiz" element={hasProfile ? <AppShell><QuizArena /></AppShell> : <Navigate to="/onboarding" replace />} />
      <Route path="/play/inventor-hall" element={hasProfile ? <AppShell><InventorHall /></AppShell> : <Navigate to="/onboarding" replace />} />
      <Route path="/profile" element={hasProfile ? <AppShell><Profile /></AppShell> : <Navigate to="/onboarding" replace />} />
      <Route path="/leaderboard" element={hasProfile ? <AppShell><Leaderboard /></AppShell> : <Navigate to="/onboarding" replace />} />
      <Route path="/comic" element={hasProfile ? <AppShell><ComicCreator /></AppShell> : <Navigate to="/onboarding" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={hasProfile ? '/' : '/onboarding'} replace />} />
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
            style: { background: '#1E1B4B', color: 'white', border: '2px solid #7C3AED', borderRadius: 0, fontFamily: 'Nunito, sans-serif' },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
