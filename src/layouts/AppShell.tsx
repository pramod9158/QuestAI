import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BookOpen, Gamepad2, Target, User } from 'lucide-react';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { CoinCounter, StreakFlame, XPBar } from '@/components/ui/GameUI';
import { getLevel, getXPForNextLevel } from '@/lib/gamification';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/learn', label: 'Learn', icon: BookOpen },
  { path: '/play', label: 'Play', icon: Gamepad2 },
  { path: '/missions', label: 'Missions', icon: Target },
  { path: '/profile', label: 'Profile', icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const profile = useCurrentProfile();
  const location = useLocation();

  const xp = profile?.xp ?? 0;
  const level = getLevel(xp);
  const xpInfo = getXPForNextLevel(xp);

  // Pages with no bottom nav (auth, onboarding)
  const hideNav = ['/auth', '/onboarding'].some(p => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-pixel-darker bg-pixel-grid flex flex-col items-center">
      {/* Max-width container simulating native phone */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative bg-pixel-darker shadow-2xl shadow-black">

        {/* Status Bar */}
        {!hideNav && profile && (
          <motion.div
            initial={{ y: -40 }}
            animate={{ y: 0 }}
            className="sticky top-0 z-40 bg-pixel-darker/95 backdrop-blur border-b-4 border-black px-4 py-2 flex flex-col gap-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-lg">🤖</span>
                <span className="text-white font-pixel text-[10px]">AI EXPLORER</span>
              </div>
              <div className="flex items-center gap-2">
                <StreakFlame streak={profile.current_streak ?? 0} />
                <CoinCounter coins={profile.coins ?? 0} />
              </div>
            </div>
            <XPBar current={xpInfo.current} needed={xpInfo.needed} level={level} />
          </motion.div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        {!hideNav && (
          <nav className="sticky bottom-0 z-40 bg-pixel-darker border-t-4 border-black pb-safe">
            <div className="flex items-center justify-around px-2">
              {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
                return (
                  <NavLink key={path} to={path} className={`nav-tab ${isActive ? 'active' : ''}`}>
                    <motion.div
                      animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.2 }}
                    >
                      <div className={`relative p-2 ${isActive ? 'bg-primary border-2 border-black' : ''}`}>
                        <Icon className="w-5 h-5" />
                        {isActive && (
                          <motion.div
                            layoutId="nav-active"
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-warning border border-black"
                          />
                        )}
                      </div>
                    </motion.div>
                    <span className="font-body text-[9px] font-bold">{label}</span>
                  </NavLink>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
