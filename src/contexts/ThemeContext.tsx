import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { type ThemeId } from '@/lib/theme';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  theme: ThemeId;
  isDuolingo: boolean;
  isMinecraft: boolean;
  toggleTheme: () => void;
  setTheme: (t: ThemeId) => void;
  triggerCelebration: () => void;
  celebrationActive: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'appTheme';

function applyTheme(theme: ThemeId) {
  document.documentElement.setAttribute('data-theme', theme);
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved === 'duolingo' || saved === 'minecraft') ? saved : 'minecraft';
  });

  const [celebrationActive, setCelebrationActive] = useState(false);

  // Apply theme attribute immediately on mount and whenever theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((t: ThemeId) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
    applyTheme(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'minecraft' ? 'duolingo' : 'minecraft');
  }, [theme, setTheme]);

  const triggerCelebration = useCallback(() => {
    setCelebrationActive(true);
    setTimeout(() => setCelebrationActive(false), 3500);
  }, []);

  const value: ThemeContextValue = {
    theme,
    isDuolingo: theme === 'duolingo',
    isMinecraft: theme === 'minecraft',
    toggleTheme,
    setTheme,
    triggerCelebration,
    celebrationActive,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
