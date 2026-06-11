import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Star, Sparkles, RefreshCw, Send, CheckCircle2, ShieldAlert, Award } from 'lucide-react';
import { AICompanion } from '../ui/AICompanion';
import { useThemeStyles } from '@/lib/useThemeStyles';
import TeachableMachineTrainer from '../teachable/TeachableMachineTrainer';

interface TrainLabProps {
  onComplete: () => void;
}

export default function TrainLab({ onComplete }: TrainLabProps) {
  const ts = useThemeStyles();
  const D = ts.duo;
  const [activeStep, setActiveStep] = useState<'label' | 'train' | 'test' | 'complete'>('label');
  const [tipsIndex, setTipsIndex] = useState(0);

  const tips = [
    "Sparky says: Make sure your face or object is centered in the camera frame!",
    "Sparky says: Try moving the object closer and further away so the AI learns sizes!",
    "Sparky says: Change the lighting or backgrounds to make your AI model extra robust!",
    "Sparky says: Avoid capturing empty backgrounds in your object classes!",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTipsIndex(prev => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Visual Instruction Header with Sparky */}
      <div 
        className="p-4 flex flex-col gap-3 relative overflow-hidden"
        style={D ? {
          background: '#FFFFFF',
          border: '1.5px solid #E0E0E0',
          borderRadius: 14,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        } : {
          background: 'linear-gradient(135deg, #1E1B4B 0%, #150E36 100%)',
          border: '3px solid #10B981',
          boxShadow: '4px 4px 0px #000',
        }}
      >
        <div className="flex justify-between items-center">
          <span className="font-pixel text-[6px] text-[#10B981] tracking-wider uppercase">MACHINE LEARNING LAB</span>
          <span className="font-pixel text-[5px] text-yellow-400 bg-yellow-950/20 border border-yellow-800/40 px-1 py-0.5">
            TF.JS POWERED
          </span>
        </div>

        {/* Companion guidance bubble */}
        <AICompanion
          state="teaching"
          message={tips[tipsIndex]}
          name="SPARKY"
          size="sm"
        />

        {/* Guided Steps tracker */}
        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-white/5 text-center text-[7px] font-pixel text-white/50" style={D ? { borderTopColor: '#EEEEEE', fontFamily: '"Nunito", sans-serif', fontSize: 10, fontWeight: 700 } : {}}>
          <div className={D ? `py-1 border rounded-lg ${activeStep === 'label' ? 'bg-[#ECFDF5] text-[#10B981] border-[#10B981]/40' : 'bg-gray-50 border-gray-100 text-gray-400'}` : `py-1 border border-black ${activeStep === 'label' ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40' : 'bg-black/20'}`}>
            1. LABEL
          </div>
          <div className={D ? `py-1 border rounded-lg ${activeStep === 'train' ? 'bg-[#ECFDF5] text-[#10B981] border-[#10B981]/40' : 'bg-gray-50 border-gray-100 text-gray-400'}` : `py-1 border border-black ${activeStep === 'train' ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40' : 'bg-black/20'}`}>
            2. TRAIN
          </div>
          <div className={D ? `py-1 border rounded-lg ${activeStep === 'test' ? 'bg-[#ECFDF5] text-[#10B981] border-[#10B981]/40' : 'bg-gray-50 border-gray-100 text-gray-400'}` : `py-1 border border-black ${activeStep === 'test' ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40' : 'bg-black/20'}`}>
            3. TEST
          </div>
          <div className={D ? `py-1 border rounded-lg ${activeStep === 'complete' ? 'bg-[#ECFDF5] text-[#10B981] border-[#10B981]/40' : 'bg-gray-50 border-gray-100 text-gray-400'}` : `py-1 border border-black ${activeStep === 'complete' ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40' : 'bg-black/20'}`}>
            4. ACCURACY ✓
          </div>
        </div>
      </div>

      {/* Embedded TeachableMachineTrainer wrapper */}
      <div 
        className={D ? "border border-gray-200 rounded-xl relative overflow-hidden" : "border-3 border-black relative overflow-hidden"}
        style={D ? {
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        } : {
          boxShadow: '4px 4px 0px #000',
        }}
      >
        <TeachableMachineTrainer />
      </div>

      {/* Developer bypass to trigger completion if needed */}
      <div className="flex justify-end pr-1.5">
        <button
          onClick={onComplete}
          className="text-white/20 hover:text-white/40 font-pixel text-[5px] tracking-wider uppercase border border-white/5 px-2 py-0.5 cursor-pointer"
        >
          ⚡ Dev Bypass ML training
        </button>
      </div>
    </div>
  );
}
