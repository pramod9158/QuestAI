/**
 * useThemeStyles — returns theme-specific style objects to use inline
 * in components that can't be overridden by CSS class selectors alone.
 * 
 * Minecraft values are identical to what the components used before —
 * so Minecraft appearance is 100% unchanged.
 */
import { useTheme } from '@/contexts/ThemeContext';

export interface ThemeStyles {
  // Surfaces
  card:           React.CSSProperties;
  cardAccent:     React.CSSProperties;
  cardGold:       React.CSSProperties;
  cardPurple:     React.CSSProperties;
  cardGreen:      React.CSSProperties;
  cardDark:       React.CSSProperties;
  // Page root
  page:           React.CSSProperties;
  // Text
  textPrimary:    string;
  textSecondary:  string;
  textAccent:     string;
  textMuted:      string;
  textGold:       string;
  // Icon boxes
  iconBox:        (color: string) => React.CSSProperties;
  iconBoxPrimary: React.CSSProperties;
  // Buttons
  btnPrimary:     React.CSSProperties;
  // Progress bars
  progressTrack:  React.CSSProperties;
  progressFill:   (pct: number) => React.CSSProperties;
  // Badges
  badge:          (color?: string) => React.CSSProperties;
  // Dividers
  divider:        string;
  // Pill (XP level)
  pill:           React.CSSProperties;
  // Small inline highlight
  highlight:      (color: string) => React.CSSProperties;
  // Stat box (3-column)
  statBox:        (borderColor: string) => React.CSSProperties;
  statValue:      (color: string) => React.CSSProperties;
  statLabel:      React.CSSProperties;
  // Section header
  sectionHeader:  React.CSSProperties;
  sectionLink:    React.CSSProperties;
  // List row
  listRow:        React.CSSProperties;
  listRowBorder:  string;
  // Coin / streak pill
  coinPill:       React.CSSProperties;
  streakPill:     React.CSSProperties;
  // Avatar
  avatar:         (from: string, to: string, size: number) => React.CSSProperties;
  // Modal
  modal:          React.CSSProperties;
  modalOverlay:   string;
  // ProgressRing box
  progressRingBox:(size: number) => React.CSSProperties;
  // Whether this is duolingo
  duo: boolean;
}

export function useThemeStyles(): ThemeStyles {
  const { isDuolingo } = useTheme();
  const D = isDuolingo;

  // ── Duolingo base values ──────────────────────────────────────────────
  const DUO_SURFACE   = '#FFFFFF';
  const DUO_BG        = '#F5F5F5';
  const DUO_BORDER    = '1.5px solid #E0E0E0';
  const DUO_SHADOW    = '0 2px 8px rgba(0,0,0,0.08)';
  const DUO_SHADOW_MD = '0 4px 16px rgba(0,0,0,0.12)';
  const DUO_RADIUS    = 16;
  const DUO_RADIUS_SM = 10;
  const DUO_GREEN     = '#5FCC5F';

  // ── Minecraft base values ─────────────────────────────────────────────
  const MC_SURFACE  = '#1E1B4B';
  const MC_BORDER   = '3px solid #000000';
  const MC_SHADOW   = '4px 4px 0px 0px #000000';
  const MC_SHADOW_SM= '2px 2px 0px 0px #000000';

  const card: React.CSSProperties = D ? {
    background: DUO_SURFACE,
    border: DUO_BORDER,
    borderRadius: DUO_RADIUS,
    boxShadow: DUO_SHADOW,
  } : {
    background: MC_SURFACE,
    border: MC_BORDER,
    boxShadow: MC_SHADOW,
  };

  const cardAccent: React.CSSProperties = D ? {
    background: DUO_SURFACE,
    border: '1.5px solid #5FCC5F',
    borderRadius: DUO_RADIUS,
    boxShadow: '0 2px 12px rgba(95,204,95,0.15)',
  } : {
    background: MC_SURFACE,
    border: '3px solid #10B981',
    boxShadow: MC_SHADOW,
  };

  const cardGold: React.CSSProperties = D ? {
    background: DUO_SURFACE,
    border: '1.5px solid #FFB84D',
    borderRadius: DUO_RADIUS,
    boxShadow: '0 2px 12px rgba(255,184,77,0.15)',
  } : {
    background: MC_SURFACE,
    border: '3px solid #FFD60A',
    boxShadow: MC_SHADOW,
  };

  const cardPurple: React.CSSProperties = D ? {
    background: DUO_SURFACE,
    border: '1.5px solid #B366FF',
    borderRadius: DUO_RADIUS,
    boxShadow: '0 2px 12px rgba(179,102,255,0.15)',
  } : {
    background: MC_SURFACE,
    border: '3px solid #7C3AED',
    boxShadow: MC_SHADOW,
  };

  const cardGreen: React.CSSProperties = D ? {
    background: DUO_SURFACE,
    border: '1.5px solid #5FCC5F',
    borderRadius: DUO_RADIUS,
    boxShadow: DUO_SHADOW,
  } : {
    background: MC_SURFACE,
    border: '3px solid #10B981',
    boxShadow: MC_SHADOW,
  };

  const cardDark: React.CSSProperties = D ? {
    background: '#F8FFF8',
    border: DUO_BORDER,
    borderRadius: DUO_RADIUS_SM,
    boxShadow: 'none',
  } : {
    background: '#16103A',
    border: '1px solid #000000',
    boxShadow: MC_SHADOW_SM,
  };

  const page: React.CSSProperties = D ? {
    background: DUO_BG,
    minHeight: '100%',
  } : {
    backgroundAttachment: 'fixed',
  };

  return {
    card, cardAccent, cardGold, cardPurple, cardGreen, cardDark, page,

    textPrimary:   D ? '#000000' : '#FFFFFF',
    textSecondary: D ? '#555555' : 'rgba(255,255,255,0.5)',
    textAccent:    D ? DUO_GREEN  : '#93C5FD',
    textMuted:     D ? '#999999'  : 'rgba(255,255,255,0.35)',
    textGold:      D ? '#C8960C'  : '#FFD60A',

    iconBox: (color: string): React.CSSProperties => D ? {
      background: color + '18',
      border: `1.5px solid ${color}40`,
      borderRadius: DUO_RADIUS_SM,
      boxShadow: 'none',
    } : {
      background: color,
      border: '2px solid #000000',
      boxShadow: MC_SHADOW_SM,
    },

    iconBoxPrimary: D ? {
      background: '#F0FAF0',
      border: '1.5px solid #5FCC5F',
      borderRadius: DUO_RADIUS_SM,
    } : {
      background: '#7C3AED',
      border: '2px solid #000000',
      boxShadow: MC_SHADOW_SM,
    },

    btnPrimary: D ? {
      background: DUO_GREEN,
      color: '#000000',
      border: 'none',
      borderRadius: 12,
      boxShadow: '0 4px 0px rgba(0,0,0,0.15)',
      fontFamily: '"Nunito", sans-serif',
      fontWeight: 800,
    } : {
      background: '#FFD60A',
      color: '#000000',
      border: '4px solid #000000',
      boxShadow: '4px 4px 0px #000000',
    },

    progressTrack: D ? {
      height: 12,
      background: '#E0E0E0',
      borderRadius: 999,
      overflow: 'hidden',
      padding: 2,
    } : {
      height: 20,
      background: '#0F0A2E',
      border: '2px solid #000000',
      padding: '2px',
      display: 'flex',
      alignItems: 'center',
      boxShadow: 'inset 2px 2px 0px rgba(0,0,0,0.5)',
    },

    progressFill: (pct: number): React.CSSProperties => D ? {
      width: `${pct}%`,
      height: '100%',
      background: 'linear-gradient(90deg, #5FCC5F, #1EBC6B)',
      borderRadius: 999,
      transition: 'width 0.8s ease',
    } : {
      width: `${pct}%`,
      height: '100%',
      background: '#FFD60A',
      boxShadow: 'inset -2px 0px 0px rgba(0,0,0,0.2)',
      transition: 'width 0.8s ease',
    },

    badge: (color = '#5FCC5F'): React.CSSProperties => D ? {
      background: `${color}18`,
      border: `1.5px solid ${color}40`,
      borderRadius: 999,
      color: color,
      fontFamily: '"Nunito", sans-serif',
      fontWeight: 800,
      fontSize: 10,
      padding: '2px 10px',
    } : {
      background: `${color}22`,
      border: `2px solid #000000`,
      color: color,
    },

    divider: D ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',

    pill: D ? {
      background: 'linear-gradient(135deg, #5FCC5F, #1EBC6B)',
      borderRadius: 999,
      color: '#000',
      fontFamily: '"Nunito", sans-serif',
      fontWeight: 800,
      fontSize: 9,
      padding: '3px 10px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
    } : {
      background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
      border: '2px solid #000000',
      boxShadow: MC_SHADOW_SM,
      color: 'white',
    },

    highlight: (color: string): React.CSSProperties => D ? {
      background: `${color}15`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 8,
    } : {
      background: `${color}22`,
      borderLeft: `4px solid ${color}`,
    },

    statBox: (borderColor: string): React.CSSProperties => D ? {
      background: DUO_SURFACE,
      border: `1.5px solid ${borderColor}40`,
      borderRadius: DUO_RADIUS_SM,
      boxShadow: DUO_SHADOW,
    } : {
      background: MC_SURFACE,
      border: `3px solid ${borderColor}`,
      boxShadow: MC_SHADOW,
    },

    statValue: (color: string): React.CSSProperties => D ? {
      color: '#000000',
      fontFamily: '"Nunito", sans-serif',
      fontWeight: 900,
      fontSize: 15,
    } : { color },

    statLabel: D ? {
      color: '#999999',
      fontFamily: '"Nunito", sans-serif',
      fontWeight: 700,
      fontSize: 9,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
    } : {
      color: 'rgba(255,255,255,0.4)',
    },

    sectionHeader: D ? {
      color: '#000000',
      fontFamily: '"Nunito", sans-serif',
      fontWeight: 800,
      fontSize: 14,
    } : {
      color: '#FFFFFF',
    },

    sectionLink: D ? {
      color: '#5FCC5F',
      fontFamily: '"Nunito", sans-serif',
      fontWeight: 700,
    } : { color: '#93C5FD' },

    listRow: D ? {
      background: DUO_SURFACE,
      border: DUO_BORDER,
      borderRadius: DUO_RADIUS_SM,
      boxShadow: DUO_SHADOW,
      padding: '12px 16px',
      marginBottom: 8,
    } : {
      background: MC_SURFACE,
      border: MC_BORDER,
      boxShadow: MC_SHADOW,
      padding: '12px 16px',
    },

    listRowBorder: D ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',

    coinPill: D ? {
      background: '#FFF8E1',
      border: '1.5px solid #FFB84D',
      borderRadius: 999,
      boxShadow: 'none',
      padding: '3px 10px',
    } : {
      background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(252,211,77,0.1))',
      border: '2px solid #F59E0B',
      boxShadow: MC_SHADOW_SM,
    },

    streakPill: D ? {
      background: '#FFF3F0',
      border: '1.5px solid #FF6B35',
      borderRadius: 999,
      boxShadow: 'none',
      padding: '3px 10px',
    } : {
      background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(245,158,11,0.15))',
      border: '2px solid #EF4444',
      boxShadow: MC_SHADOW_SM,
    },

    avatar: (from: string, to: string, size: number): React.CSSProperties => D ? {
      width: size, height: size,
      background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
      border: '2px solid rgba(255,255,255,0.5)',
      borderRadius: '50%',
      boxShadow: DUO_SHADOW,
      fontSize: size * 0.35,
    } : {
      width: size, height: size,
      background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
      border: '3px solid #000000',
      boxShadow: MC_SHADOW,
      fontSize: size * 0.3,
    },

    modal: D ? {
      background: DUO_SURFACE,
      border: DUO_BORDER,
      borderRadius: 20,
      boxShadow: DUO_SHADOW_MD,
      padding: 24,
    } : {
      background: MC_SURFACE,
      border: '4px solid #000000',
      boxShadow: '8px 8px 0px 0px #000000',
      padding: 24,
    },

    modalOverlay: 'rgba(0,0,0,0.65)',

    progressRingBox: (size: number): React.CSSProperties => D ? {
      width: size, height: size,
      background: DUO_SURFACE,
      border: `2px solid #E0E0E0`,
      borderRadius: '50%',
      boxShadow: DUO_SHADOW,
    } : {
      width: size, height: size,
      background: '#16103A',
      border: '3px solid #000000',
      boxShadow: '3px 3px 0px 0px #000000',
    },

    duo: D,
  };
}
