import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import jsPDF from 'jspdf';

const PANEL_PROMPTS = [
  { id: 1, title: 'The Hero\'s World 🌍', prompt: 'Where does our story take place?', keywords: ['City', 'Village', 'School', 'Farm', 'Forest', 'Space', 'Ocean', 'Hospital'] },
  { id: 2, title: 'Meet the Problem 😟', prompt: 'What problem does our hero discover?', keywords: ['Pollution', 'Lost pet', 'Traffic jam', 'Hungry children', 'Sick crops', 'Forest fire', 'Water shortage', 'Sick friend'] },
  { id: 3, title: 'The AI Sidekick 🤖', prompt: 'What AI power will help?', keywords: ['Smart Camera', 'Voice Assistant', 'Prediction Robot', 'Image Recognizer', 'Smart Drone', 'Data Analyzer', 'Medical AI', 'Navigation AI'] },
  { id: 4, title: 'The Challenge ⚡', prompt: 'What goes wrong at first?', keywords: ['Not enough data', 'AI makes mistake', 'Storm hits', 'People don\'t believe AI', 'Network fails', 'Wrong prediction', 'Hacker attacks', 'Battery dies'] },
  { id: 5, title: 'The Solution 💡', prompt: 'How does our hero fix it?', keywords: ['Trains more data', 'Fixes the code', 'Teamwork saves day', 'New idea works', 'Community helps', 'Better sensors', 'Smarter prompt', 'Backup power'] },
  { id: 6, title: 'The Victory! 🏆', prompt: 'What happens at the happy ending?', keywords: ['City saved', 'Pet found', 'Farm healed', 'Kids fed', 'Fire stopped', 'Water saved', 'Doctor helps', 'School thrives'] },
];

const PANEL_EMOJIS: Record<string, string> = {
  'City': '🌆', 'Village': '🏡', 'School': '🏫', 'Farm': '🌾', 'Forest': '🌳', 'Space': '🚀', 'Ocean': '🌊', 'Hospital': '🏥',
  'Pollution': '🏭', 'Lost pet': '🐕', 'Traffic jam': '🚗', 'Hungry children': '🍱', 'Sick crops': '🌿', 'Forest fire': '🔥', 'Water shortage': '💧', 'Sick friend': '🤒',
  'Smart Camera': '📷', 'Voice Assistant': '🎤', 'Prediction Robot': '🤖', 'Image Recognizer': '👁️', 'Smart Drone': '🛸', 'Data Analyzer': '📊', 'Medical AI': '❤️‍🩹', 'Navigation AI': '🗺️',
  'City saved': '🌆✨', 'Pet found': '🐕❤️', 'Farm healed': '🌾💚', 'Kids fed': '🍱😊', 'Fire stopped': '🔥✋', 'Water saved': '💧🌊', 'Doctor helps': '👨‍⚕️✅', 'School thrives': '🏫⭐',
};

export default function ComicCreator() {
  const navigate = useNavigate();
  const [panelChoices, setPanelChoices] = useState<string[]>(Array(6).fill(''));
  const [currentPanel, setCurrentPanel] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [comicDone, setComicDone] = useState(false);

  const handleKeyword = (keyword: string) => {
    const updated = [...panelChoices];
    updated[currentPanel] = keyword;
    setPanelChoices(updated);
  };

  const handleNext = () => {
    if (currentPanel < 5) setCurrentPanel(p => p + 1);
    else setComicDone(true);
  };

  const downloadComic = () => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    pdf.setFillColor(15, 10, 46);
    pdf.rect(0, 0, 210, 297, 'F');
    pdf.setTextColor(255, 215, 0);
    pdf.setFontSize(20);
    pdf.text('MY AI ADVENTURE COMIC', 105, 20, { align: 'center' });

    const panelW = 88, panelH = 70;
    PANEL_PROMPTS.forEach((panel, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 10 + col * (panelW + 12);
      const y = 35 + row * (panelH + 8);
      pdf.setFillColor(30, 27, 75);
      pdf.rect(x, y, panelW, panelH, 'F');
      pdf.setDrawColor(124, 58, 237);
      pdf.setLineWidth(1.5);
      pdf.rect(x, y, panelW, panelH);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7);
      pdf.text(panel.title, x + panelW / 2, y + 8, { align: 'center' });
      pdf.setFontSize(22);
      const emoji = PANEL_EMOJIS[panelChoices[i]] || '⭐';
      pdf.text(emoji.charAt(0), x + panelW / 2, y + 35, { align: 'center' });
      pdf.setFontSize(9);
      pdf.setTextColor(200, 200, 255);
      pdf.text(panelChoices[i] || 'Empty', x + panelW / 2, y + panelH - 8, { align: 'center', maxWidth: panelW - 8 });
    });

    pdf.save('My_AI_Comic_Book.pdf');
  };

  return (
    <div className="min-h-full pb-6">
      <div className="p-5" style={{ background: '#16103A' }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/55 hover:text-white mb-3 font-body text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="font-pixel text-[10px] text-white flex items-center gap-2 tracking-wide">📚 COMIC CREATOR</h1>
        <p className="text-white/55 font-body text-sm mt-1">Build your own 6-panel AI adventure comic!</p>
      </div>

      <div className="px-4 pt-4">
        {!comicDone ? (
          <>
            {/* Panel Progress */}
            <div className="flex gap-2 mb-5">
              {PANEL_PROMPTS.map((_, i) => (
                <motion.div
                  key={i}
                  onClick={() => setCurrentPanel(i)}
                  className="flex-1 h-8 cursor-pointer flex items-center justify-center font-pixel text-[7px] transition-all"
                  style={
                    i < currentPanel ? {
                      background: '#10B981',
                      color: 'white',
                      border: '2px solid #000000',
                      boxShadow: '2px 2px 0px #000000',
                    } : i === currentPanel ? {
                      background: '#7C3AED',
                      color: 'white',
                      border: '2px solid #000000',
                      boxShadow: '2px 2px 0px #000000',
                      animation: 'pixelFlash 0.3s steps(2) infinite',
                    } : {
                      background: '#16103A',
                      color: 'rgba(255,255,255,0.35)',
                      border: '2px solid #000000',
                    }
                  }
                >
                  {panelChoices[i] ? '✓' : i + 1}
                </motion.div>
              ))}
            </div>

            {/* Current Panel */}
            <AnimatePresence mode="wait">
              <motion.div key={currentPanel} initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }}>
                <div
                  className="p-5 mb-4"
                  style={{
                    background: '#1E1B4B',
                    border: '4px solid #000000',
                    boxShadow: '6px 6px 0px 0px #000000',
                  }}
                >
                  <div className="text-3xl text-center mb-3">{['🌍', '😟', '🤖', '⚡', '💡', '🏆'][currentPanel]}</div>
                  <h2 className="text-white font-game text-base text-center">{PANEL_PROMPTS[currentPanel].title}</h2>
                  <p className="text-white/55 font-body text-sm text-center mt-1">{PANEL_PROMPTS[currentPanel].prompt}</p>
                  {panelChoices[currentPanel] && (
                    <div
                      className="mt-3 p-2 text-center"
                      style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000' }}
                    >
                      <span className="text-white font-game text-sm">{PANEL_EMOJIS[panelChoices[currentPanel]]} {panelChoices[currentPanel]}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  {PANEL_PROMPTS[currentPanel].keywords.map(kw => (
                    <motion.button
                      key={kw}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleKeyword(kw)}
                      className="p-3 text-center font-body text-sm transition-all"
                      style={panelChoices[currentPanel] === kw ? {
                        background: '#7C3AED',
                        color: 'white',
                        border: '3px solid #000000',
                        boxShadow: '4px 4px 0px #000000',
                      } : {
                        background: '#1E1B4B',
                        color: 'rgba(255,255,255,0.75)',
                        border: '3px solid #000000',
                        boxShadow: '3px 3px 0px #000000',
                      }}
                    >
                      <span className="text-xl block mb-1">{PANEL_EMOJIS[kw] || '⭐'}</span>
                      {kw}
                    </motion.button>
                  ))}
                </div>

                <Button
                  variant="primary" fullWidth
                  disabled={!panelChoices[currentPanel]}
                  onClick={handleNext}
                >
                  {currentPanel < 5 ? `Next Panel (${currentPanel + 2}/6) →` : '✨ Finish My Comic!'}
                </Button>
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          // Comic Preview
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div
              className="text-center p-5"
              style={{
                background: '#1E1B4B',
                border: '4px solid #000000',
                boxShadow: '6px 6px 0px 0px #000000',
              }}
            >
              <div className="text-5xl mb-2">🎉</div>
              <h2 className="text-white font-game text-lg">Your Comic is Ready!</h2>
            </div>

            {/* Comic Grid Preview */}
            <div className="grid grid-cols-2 gap-3">
              {PANEL_PROMPTS.map((panel, i) => (
                <div
                  key={i}
                  className="p-3 aspect-square flex flex-col items-center justify-center gap-2"
                  style={{
                    background: '#1E1B4B',
                    border: '3px solid #000000',
                    boxShadow: '3px 3px 0px #000000',
                  }}
                >
                  <div className="text-4xl">{PANEL_EMOJIS[panelChoices[i]] || '⭐'}</div>
                  <div className="text-white font-pixel text-[6px] text-center leading-relaxed tracking-wide">{panel.title}</div>
                  <div className="text-white/55 font-body text-[9px] text-center">{panelChoices[i]}</div>
                </div>
              ))}
            </div>

            <Button variant="success" fullWidth onClick={downloadComic} icon={<Download className="w-4 h-4" />}>
              📥 Download Comic PDF!
            </Button>
            <Button variant="ghost" fullWidth onClick={() => { setPanelChoices(Array(6).fill('')); setCurrentPanel(0); setComicDone(false); }}>
              🔄 Create Another Comic
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
