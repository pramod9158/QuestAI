// ─────────────────────────────────────────────────────────────────────────────
// Theme Configuration — Dual Theme System
// Minecraft (dark pixel) and Duolingo (light playful) themes
// ─────────────────────────────────────────────────────────────────────────────

export type ThemeId = 'minecraft' | 'duolingo';

// ── Navigation emoji mapping ──────────────────────────────────────────────────
export const NAV_EMOJIS: Record<ThemeId, Record<string, string>> = {
  minecraft: {
    '/':         '🏠',
    '/learn':    '📖',
    '/play':     '🎮',
    '/prompts':  '✨',
    '/missions': '🎯',
    '/profile':  '👤',
  },
  duolingo: {
    '/':         '🏠',
    '/learn':    '📚',
    '/play':     '🎮',
    '/prompts':  '✨',
    '/missions': '🎯',
    '/profile':  '👤',
  },
};

// ── Global emoji/icon map ─────────────────────────────────────────────────────
export const THEME_EMOJIS: Record<ThemeId, Record<string, string>> = {
  minecraft: {
    success:      '✅',
    error:        '❌',
    warning:      '⚠️',
    info:         'ℹ️',
    celebration:  '🎉',
    streak:       '🔥',
    trophy:       '🏆',
    star:         '⭐',
    heart:        '❤️',
    diamond:      '💎',
    start:        '▶',
    next:         '▶',
    retry:        '↩',
    done:         '✓',
    locked:       '🔒',
    loading:      '🤖',
    mascot:       '🤖',
  },
  duolingo: {
    success:      '✅',
    error:        '❌',
    warning:      '⚠️',
    info:         'ℹ️',
    celebration:  '🎉',
    streak:       '🔥',
    trophy:       '🏆',
    star:         '⭐',
    heart:        '❤️',
    diamond:      '💎',
    start:        '🎯',
    next:         '⏭️',
    retry:        '🔄',
    done:         '✨',
    locked:       '🔒',
    loading:      '🤖',
    mascot:       '🤖',
  },
};

// ── Button emoji prefixes (Duolingo only) ─────────────────────────────────────
export const BUTTON_EMOJIS: Record<string, string> = {
  primary:  '🎯',
  success:  '✅',
  warning:  '⚡',
  danger:   '❌',
  blue:     '💙',
  ghost:    '✨',
};

// ── Duolingo color palette (for inline styles fallback) ───────────────────────
export const DUO_COLORS = {
  green:          '#5FCC5F',
  greenDark:      '#4CAF50',
  greenAccent:    '#1EBC6B',
  purple:         '#B366FF',
  bgPage:         '#F5F5F5',
  bgCard:         '#FFFFFF',
  textPrimary:    '#000000',
  textSecondary:  '#666666',
  textTertiary:   '#999999',
  border:         '#E0E0E0',
  borderLight:    '#EEEEEE',
  shadow:         '0 2px 8px rgba(0,0,0,0.08)',
  shadowSubtle:   '0 1px 3px rgba(0,0,0,0.05)',
  warning:        '#FFB84D',
  danger:         '#FF6B6B',
  link:           '#5FCC5F',
} as const;

// ── Theme metadata ─────────────────────────────────────────────────────────────
export const THEME_META: Record<ThemeId, { label: string; icon: string; desc: string }> = {
  minecraft: {
    label: 'Dark Mode',
    icon:  '🌙',
    desc:  'Pixel-art dark theme',
  },
  duolingo: {
    label: 'Duolingo',
    icon:  '🤖',
    desc:  'Light, fun & friendly',
  },
};
