import React from 'react';
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

  const hideNav = ['/auth', '/onboarding'].some(p => location.pathname.startsWith(p));

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{ background: 'linear-gradient(135deg, #0D0D1A 0%, #1A1040 50%, #0D1A2E 100%)', backgroundAttachment: 'fixed' }}
    >
      {/* Ambient orbs in background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="gradient-orb gradient-orb-primary"
          style={{ width: 320, height: 320, top: '-80px', left: '-80px', animationDelay: '0s' }}
        />
        <div
          className="gradient-orb gradient-orb-mission"
          style={{ width: 240, height: 240, top: '40%', right: '-60px', animationDelay: '-4s' }}
        />
        <div
          className="gradient-orb gradient-orb-accent"
          style={{ width: 200, height: 200, bottom: '10%', left: '10%', animationDelay: '-8s' }}
        />
      </div>

      {/* Phone container */}
      <div
        className="w-full max-w-md min-h-screen flex flex-col relative z-10"
        style={{ boxShadow: '0 0 80px rgba(0,0,0,0.6)' }}
      >
        {/* Top Status Bar */}
        {!hideNav && profile && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="sticky top-0 z-40 px-4 py-3 flex flex-col gap-2"
            style={{
              background: 'rgba(13, 13, 26, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(127, 90, 240, 0.2)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Logo gradient text */}
                <span className="text-xl">🤖</span>
                <span
                  className="font-heading font-bold text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #7F5AF0, #2CB67D)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  QUEST AI
                </span>
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
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        {!hideNav && (
          <nav
            className="sticky bottom-0 z-40 pb-safe"
            style={{
              background: 'rgba(13, 13, 26, 0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderTop: '1px solid rgba(127, 90, 240, 0.2)',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
            }}
          >
            <div className="flex items-center justify-around px-2">
              {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
                return (
                  <NavLink key={path} to={path} className={`nav-tab ${isActive ? 'active' : ''}`}>
                    <motion.div
                      animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="relative"
                    >
                      <div
                        className="p-2 rounded-xl transition-all duration-200"
                        style={isActive ? {
                          background: 'linear-gradient(135deg, #7F5AF0 0%, #2CB67D 100%)',
                          boxShadow: '0 4px 16px rgba(127,90,240,0.5)',
                        } : {}}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {isActive && (
                        <motion.div
                          layoutId="nav-glow"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                          style={{ background: 'linear-gradient(135deg, #FFD60A, #FF9F1C)', boxShadow: '0 0 6px rgba(255,214,10,0.8)' }}
                        />
                      )}
                    </motion.div>
                    <span
                      className="font-heading font-semibold text-[10px]"
                      style={isActive ? {
                        background: 'linear-gradient(135deg, #7F5AF0, #2CB67D)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      } : {}}
                    >
                      {label}
                    </span>
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
