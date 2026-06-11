/**
 * QuestAI — Avatar Customization Page
 *
 * Students customize their avatar using earned coins:
 * - Hair styles (5 options)
 * - Glasses (4 options)
 * - Robot suit (5 options)
 * - Background theme (6 themes)
 *
 * Accessories saved to localStorage, preview updates live.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCurrentProfile, useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Coins, Check, Lock } from 'lucide-react';
import { useThemeStyles } from '@/lib/useThemeStyles';

const AVATAR_STORAGE_KEY = 'questai_avatar';

interface AvatarData {
  hair: string;
  glasses: string;
  suit: string;
  background: string;
  ownedItems: string[];
}

function loadAvatarData(): AvatarData {
  try {
    const raw = localStorage.getItem(AVATAR_STORAGE_KEY);
    return raw ? {
      hair: 'none', glasses: 'none', suit: 'default', background: 'space',
      ownedItems: ['hair_none', 'glasses_none', 'suit_default', 'bg_space'],
      ...JSON.parse(raw),
    } : {
      hair: 'none', glasses: 'none', suit: 'default', background: 'space',
      ownedItems: ['hair_none', 'glasses_none', 'suit_default', 'bg_space'],
    };
  } catch {
    return {
      hair: 'none', glasses: 'none', suit: 'default', background: 'space',
      ownedItems: ['hair_none', 'glasses_none', 'suit_default', 'bg_space'],
    };
  }
}

function saveAvatarData(data: AvatarData): void {
  localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(data));
}

interface ShopItem {
  id: string;
  label: string;
  emoji: string;
  cost: number; // 0 = free
  preview: string; // emoji used in avatar preview
}

const HAIR_OPTIONS: ShopItem[] = [
  { id: 'hair_none',     label: 'No Hair',     emoji: '💆', cost: 0,  preview: '' },
  { id: 'hair_spiky',   label: 'Spiky',       emoji: '⚡', cost: 20, preview: '⚡' },
  { id: 'hair_curly',   label: 'Curly',       emoji: '🌀', cost: 20, preview: '🌀' },
  { id: 'hair_crown',   label: 'Royal Crown', emoji: '👑', cost: 50, preview: '👑' },
  { id: 'hair_rainbow', label: 'Rainbow',     emoji: '🌈', cost: 80, preview: '🌈' },
];

const GLASSES_OPTIONS: ShopItem[] = [
  { id: 'glasses_none',   label: 'No Glasses',  emoji: '😶', cost: 0,  preview: '' },
  { id: 'glasses_nerd',   label: 'Nerd',        emoji: '🤓', cost: 15, preview: '🥽' },
  { id: 'glasses_cool',   label: 'Shades',      emoji: '😎', cost: 25, preview: '🕶️' },
  { id: 'glasses_star',   label: 'Star Eyes',   emoji: '🤩', cost: 40, preview: '✨' },
];

const SUIT_OPTIONS: ShopItem[] = [
  { id: 'suit_default',    label: 'Explorer',    emoji: '🤖', cost: 0,   preview: '🤖' },
  { id: 'suit_astronaut',  label: 'Astronaut',   emoji: '👨‍🚀', cost: 30,  preview: '👨‍🚀' },
  { id: 'suit_scientist',  label: 'Scientist',   emoji: '🧑‍🔬', cost: 40,  preview: '🧑‍🔬' },
  { id: 'suit_ninja',      label: 'Ninja',       emoji: '🥷', cost: 60,  preview: '🥷' },
  { id: 'suit_superhero',  label: 'Superhero',   emoji: '🦸', cost: 100, preview: '🦸' },
];

const BG_OPTIONS: ShopItem[] = [
  { id: 'bg_space',   label: 'Deep Space',  emoji: '🌌', cost: 0,  preview: '#0F0A2E' },
  { id: 'bg_forest',  label: 'Pixel Forest', emoji: '🌲', cost: 25, preview: '#064E3B' },
  { id: 'bg_ocean',   label: 'Ocean',       emoji: '🌊', cost: 25, preview: '#1D4ED8' },
  { id: 'bg_sunset',  label: 'Sunset',      emoji: '🌅', cost: 35, preview: '#9A3412' },
  { id: 'bg_galaxy',  label: 'Galaxy',      emoji: '🪐', cost: 50, preview: '#4C1D95' },
  { id: 'bg_neon',    label: 'Neon City',   emoji: '🏙️', cost: 60, preview: '#0F172A' },
];

const BG_COLORS: Record<string, string> = {
  bg_space: '#0F0A2E', bg_forest: '#064E3B', bg_ocean: '#1D4ED8',
  bg_sunset: '#9A3412', bg_galaxy: '#4C1D95', bg_neon: '#0F172A',
};

type Category = 'hair' | 'glasses' | 'suit' | 'background';
const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: 'hair',       label: 'Hair',       emoji: '💇' },
  { id: 'glasses',    label: 'Glasses',    emoji: '🕶️' },
  { id: 'suit',       label: 'Suit',       emoji: '👔' },
  { id: 'background', label: 'Background', emoji: '🖼️' },
];

function getItems(cat: Category): ShopItem[] {
  switch (cat) {
    case 'hair':       return HAIR_OPTIONS;
    case 'glasses':    return GLASSES_OPTIONS;
    case 'suit':       return SUIT_OPTIONS;
    case 'background': return BG_OPTIONS;
  }
}

function getSelected(cat: Category, avatar: AvatarData): string {
  switch (cat) {
    case 'hair':       return avatar.hair;
    case 'glasses':    return avatar.glasses;
    case 'suit':       return avatar.suit;
    case 'background': return avatar.background;
  }
}

export default function AvatarCustomization() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  const { updateProfile } = useAuth();
  const ts = useThemeStyles();
  const D = ts.duo;
  const [avatar, setAvatar] = useState<AvatarData>(loadAvatarData);
  const [activeCategory, setActiveCategory] = useState<Category>(`suit`);
  const [coins, setCoins] = useState(profile?.coins ?? 0);
  const [buying, setBuying] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setCoins(profile?.coins ?? 0);
  }, [profile?.coins]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  async function handleSelectOrBuy(item: ShopItem, cat: Category) {
    const isOwned = avatar.ownedItems.includes(item.id);

    // Already owned → just equip
    if (isOwned || item.cost === 0) {
      const newAvatar = { ...avatar };
      if (cat === 'hair')       newAvatar.hair = item.id.replace('hair_', '');
      if (cat === 'glasses')    newAvatar.glasses = item.id.replace('glasses_', '');
      if (cat === 'suit')       newAvatar.suit = item.id.replace('suit_', '');
      if (cat === 'background') newAvatar.background = item.id.replace('bg_', '');
      setAvatar(newAvatar);
      saveAvatarData(newAvatar);
      return;
    }

    // Not owned — try to buy
    if (coins < item.cost) {
      showToast(`Need ${item.cost - coins} more coins!`);
      return;
    }

    setBuying(item.id);
    try {
      const newCoins = coins - item.cost;
      await updateProfile({ coins: newCoins });
      setCoins(newCoins);

      const newAvatar = {
        ...avatar,
        ownedItems: [...avatar.ownedItems, item.id],
      };
      // Equip immediately after buying
      if (cat === 'hair')       newAvatar.hair = item.id.replace('hair_', '');
      if (cat === 'glasses')    newAvatar.glasses = item.id.replace('glasses_', '');
      if (cat === 'suit')       newAvatar.suit = item.id.replace('suit_', '');
      if (cat === 'background') newAvatar.background = item.id.replace('bg_', '');

      setAvatar(newAvatar);
      saveAvatarData(newAvatar);
      showToast(`🎉 ${item.label} equipped!`);
    } catch {
      showToast('Purchase failed. Try again.');
    } finally {
      setBuying(null);
    }
  }

  // Build avatar preview
  const suitItem = SUIT_OPTIONS.find(s => s.id === `suit_${avatar.suit}`) ?? SUIT_OPTIONS[0];
  const hairItem = HAIR_OPTIONS.find(h => h.id === `hair_${avatar.hair}`);
  const glassesItem = GLASSES_OPTIONS.find(g => g.id === `glasses_${avatar.glasses}`);
  const bgColor = BG_COLORS[`bg_${avatar.background}`] ?? '#0F0A2E';

  return (
    <div
      className={D ? '' : 'min-h-full'}
      style={D ? ts.page : { background: '#0F0A2E' }}
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className={D ? 'fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 text-xs font-bold text-gray-700' : 'fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 font-game text-xs text-white'}
            style={D ? {
              background: '#FFFFFF',
              border: '1.5px solid #FFB84D',
              borderRadius: 12,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              fontFamily: '"Nunito", sans-serif',
            } : { background: '#1E1B4B', border: '2px solid #7C3AED', boxShadow: '3px 3px 0px #000' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <button
          onClick={() => navigate('/profile')}
          className={D ? 'flex items-center gap-2 mb-4 font-body text-sm font-bold transition-colors cursor-pointer' : 'flex items-center gap-2 text-white/40 hover:text-white mb-4 font-body text-sm transition-colors'}
          style={D ? { color: '#8B5CF6' } : {}}
        >
          <ArrowLeft className="w-4 h-4" /> {D ? 'Back to Profile' : 'Back to Profile'}
        </button>

        <div className="flex items-center justify-between">
          <h1 style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 900 : undefined, fontSize: D ? 20 : undefined }} className={D ? '' : 'font-game text-xl text-white'}>
            👾 Avatar Studio
          </h1>
          <div
            className={D ? '' : 'flex items-center gap-1.5 px-3 py-1.5'}
            style={D ? {
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#FFF8E1',
              border: '1.5px solid #FFB84D',
              borderRadius: 999,
              padding: '4px 12px',
              boxShadow: '0 2px 8px rgba(255,184,77,0.1)',
            } : { background: '#1E1B4B', border: '2px solid #F59E0B', boxShadow: '2px 2px 0px #000' }}
          >
            <span className="text-sm">🪙</span>
            <span style={{ fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 900 : undefined, fontSize: D ? 13 : undefined, color: D ? '#C8960C' : undefined }} className={D ? '' : 'font-pixel text-[8px] text-yellow-300'}>{coins}</span>
          </div>
        </div>
      </div>

      {/* Avatar Preview */}
      <motion.div
        className={D ? 'mx-5 mb-5 p-6 flex flex-col items-center gap-3 relative' : 'mx-5 mb-5 p-6 flex flex-col items-center gap-3'}
        style={D ? {
          background: bgColor,
          borderRadius: 20,
          border: '1.5px solid rgba(255,255,255,0.4)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          minHeight: 160,
        } : {
          background: bgColor,
          border: '4px solid #000',
          boxShadow: '4px 4px 0px #000',
          minHeight: 160,
        }}
      >
        <motion.div
          key={`${avatar.suit}-${avatar.hair}-${avatar.glasses}-${avatar.background}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          className={D ? '' : 'relative flex items-center justify-center'}
          style={D ? {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 88,
            height: 88,
            background: '#FFFFFF',
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.5)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          } : {
            width: 88,
            height: 88,
            background: '#1E1B4B',
            border: '4px solid #7C3AED',
            boxShadow: '4px 4px 0px #000, 0 0 20px rgba(124,58,237,0.5)',
          }}
        >
          {/* Hair overlay */}
          {hairItem?.preview && (
            <span className="absolute -top-4 text-xl">{hairItem.preview}</span>
          )}
          {/* Main suit */}
          <span className="text-5xl">{suitItem.preview}</span>
          {/* Glasses overlay */}
          {glassesItem?.preview && (
            <span className="absolute top-5 text-sm">{glassesItem.preview}</span>
          )}
          {/* Username initial */}
          <div
            className={D ? '' : 'absolute -bottom-3 -right-3 w-8 h-8 flex items-center justify-center font-pixel text-xs text-white'}
            style={D ? {
              position: 'absolute',
              bottom: -4,
              right: -4,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#8B5CF6',
              borderRadius: '50%',
              border: '2.5px solid #FFFFFF',
              color: '#FFFFFF',
              fontFamily: '"Nunito", sans-serif',
              fontWeight: 900,
              fontSize: 14,
              boxShadow: '0 2px 8px rgba(139,92,246,0.35)',
            } : { background: '#7C3AED', border: '2px solid #000' }}
          >
            {profile?.username?.charAt(0).toUpperCase()}
          </div>
        </motion.div>
        <div className="text-center">
          <div style={{ color: '#FFFFFF', fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 900 : undefined, fontSize: D ? 15 : undefined }} className={D ? '' : 'font-game text-sm text-white'}>{profile?.username}</div>
          <div style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,0.7)' } : {}} className={D ? '' : 'font-pixel text-[5px] text-white/40 mt-0.5'}>
            {suitItem.label} • {hairItem?.label} Hair • {glassesItem?.label}
          </div>
        </div>
      </motion.div>

      {/* Category tabs */}
      <div className="px-5 mb-4">
        <div
          className={D ? '' : 'flex border-4 border-black bg-surface overflow-hidden'}
          style={D ? {
            display: 'flex',
            background: '#FFFFFF',
            border: '1.5px solid #E0E0E0',
            borderRadius: 14,
            padding: 4,
            gap: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          } : {}}
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={D ? 'flex-1 py-2 text-center cursor-pointer transition-all duration-150 rounded-xl' : 'flex-1 py-2.5 text-center cursor-pointer transition-colors'}
              style={D ? {
                background: activeCategory === cat.id ? '#F5F3FF' : 'transparent',
                color: activeCategory === cat.id ? '#8B5CF6' : '#999999',
              } : {
                background: activeCategory === cat.id ? '#7C3AED' : '#16103A',
                borderRight: '2px solid #000',
              }}
            >
              <div className="text-base">{cat.emoji}</div>
              <div style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 10 } : {}} className={D ? '' : 'font-pixel text-[5px] text-white mt-0.5'}>{cat.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="px-5 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {getItems(activeCategory).map(item => {
            const isOwned = avatar.ownedItems.includes(item.id) || item.cost === 0;
            const selectedId = getSelected(activeCategory, avatar);
            const isEquipped = (
              (activeCategory === 'hair' && `hair_${selectedId}` === item.id) ||
              (activeCategory === 'glasses' && `glasses_${selectedId}` === item.id) ||
              (activeCategory === 'suit' && `suit_${selectedId}` === item.id) ||
              (activeCategory === 'background' && `bg_${selectedId}` === item.id)
            );
            const canAfford = coins >= item.cost;
            const isBuyingThis = buying === item.id;

            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelectOrBuy(item, activeCategory)}
                disabled={!isOwned && !canAfford}
                className="p-4 flex flex-col items-center gap-2 cursor-pointer transition-all"
                style={D ? {
                  background: isEquipped ? '#F0FAF0' : '#FFFFFF',
                  border: isEquipped ? '2px solid #5FCC5F' : '1.5px solid #E0E0E0',
                  borderRadius: 16,
                  boxShadow: isEquipped ? '0 4px 12px rgba(95,204,95,0.1)' : '0 2px 6px rgba(0,0,0,0.03)',
                  opacity: !isOwned && !canAfford ? 0.5 : 1,
                  cursor: !isOwned && !canAfford ? 'not-allowed' : 'pointer',
                } : {
                  background: isEquipped ? 'rgba(124,58,237,0.2)' : '#1E1B4B',
                  border: `3px solid ${isEquipped ? '#7C3AED' : '#000'}`,
                  boxShadow: isEquipped ? '3px 3px 0px #000, 0 0 12px rgba(124,58,237,0.4)' : '3px 3px 0px #000',
                  opacity: !isOwned && !canAfford ? 0.5 : 1,
                  cursor: !isOwned && !canAfford ? 'not-allowed' : 'pointer',
                }}
              >
                <span className="text-4xl">{item.emoji}</span>
                <span style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 12 : undefined }} className={D ? 'text-center' : 'font-game text-xs text-white text-center'}>{item.label}</span>

                {isEquipped ? (
                  <div
                    className={D ? '' : 'flex items-center gap-1 px-2 py-0.5 font-pixel text-[5px] text-white'}
                    style={D ? {
                      background: '#5FCC5F',
                      borderRadius: 6,
                      color: '#FFFFFF',
                      fontFamily: '"Nunito", sans-serif',
                      fontWeight: 800,
                      fontSize: 10,
                      padding: '2px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    } : { background: '#7C3AED', border: '1.5px solid #000' }}
                  >
                    <Check className="w-2.5 h-2.5" /> {D ? 'Equipped' : 'EQUIPPED'}
                  </div>
                ) : isOwned || item.cost === 0 ? (
                  <div style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: 10, color: '#999999' } : {}} className={D ? '' : 'font-pixel text-[6px] text-white/40'}>
                    {D ? 'Tap to Equip' : 'OWNED — TAP TO EQUIP'}
                  </div>
                ) : (
                  <div
                    className={D ? '' : 'flex items-center gap-1 px-2 py-0.5 font-pixel text-[5px]'}
                    style={D ? {
                      background: canAfford ? '#FFF8E1' : '#F5F5F5',
                      border: canAfford ? '1.5px solid #FFB84D' : '1.5px solid #E0E0E0',
                      borderRadius: 8,
                      color: canAfford ? '#C8960C' : '#999999',
                      fontFamily: '"Nunito", sans-serif',
                      fontWeight: 850,
                      fontSize: 11,
                      padding: '3px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    } : {
                      background: canAfford ? '#F59E0B' : '#374151',
                      border: '1.5px solid #000',
                      color: canAfford ? '#000' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {canAfford ? (
                      <>{isBuyingThis ? '...' : `🪙 ${item.cost}`}</>
                    ) : (
                      <><Lock className="w-2.5 h-2.5" /> {item.cost}</>
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
