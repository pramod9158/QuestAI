import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { XPToast } from '@/components/ui/GameUI';
import { generateBrainstormIdea } from '@/lib/gemini';
import { Trophy, Star, Lightbulb, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Invention {
  id?: string;
  category: string;
  problem: string;
  target_audience: string;
  ai_solution_name: string;
  ai_solution_description: string;
  innovation_score: number;
  username?: string;
  created_at?: string;
}

export default function InventorHall() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inventions, setInventions] = useState<Invention[]>([]);
  const [activeTab, setActiveTab] = useState<'hall' | 'mine'>('hall');
  const [loading, setLoading] = useState(true);

  // Mock gallery data
  const MOCK_INVENTIONS: Invention[] = [
    { category: 'farming', problem: 'Crops die from disease', target_audience: 'Farmers', ai_solution_name: 'CropGuard AI', ai_solution_description: 'AI analyzes crop photos to detect diseases early and recommend treatment before entire field is affected!', innovation_score: 92, username: 'FarmHero', created_at: '2024-01-15' },
    { category: 'school', problem: 'Students forget homework', target_audience: 'Students', ai_solution_name: 'Smart Reminder Bot', ai_solution_description: 'AI learns your schedule and sends personalized reminders with tips to complete homework efficiently!', innovation_score: 78, username: 'CodeKid', created_at: '2024-01-14' },
    { category: 'health', problem: 'Hospital queues too long', target_audience: 'Patients', ai_solution_name: 'Queue Predictor', ai_solution_description: 'AI predicts hospital waiting times and lets patients book optimal slots from home!', innovation_score: 88, username: 'HealthHero', created_at: '2024-01-13' },
    { category: 'environment', problem: 'Plastic waste in rivers', target_audience: 'Everyone', ai_solution_name: 'River CleanBot AI', ai_solution_description: 'AI-powered floating drones detect and collect plastic waste from rivers automatically!', innovation_score: 95, username: 'EcoWarrior', created_at: '2024-01-12' },
  ];

  useEffect(() => {
    const fetchInventions = async () => {
      try {
        if (user) {
          const { data } = await supabase.from('user_inventions').select('*, profiles(username)').order('innovation_score', { ascending: false });
          if (data && data.length > 0) { setInventions(data as Invention[]); setLoading(false); return; }
        }
      } catch {}
      setInventions(MOCK_INVENTIONS);
      setLoading(false);
    };
    fetchInventions();
  }, [user]);

  const myInventions: Invention[] = JSON.parse(localStorage.getItem('guest_inventions') || '[]');

  const displayList = activeTab === 'hall' ? inventions : myInventions;

  const CATEGORY_COLORS: Record<string, string> = {
    farming: 'bg-green-600', school: 'bg-blue-game', health: 'bg-red-600', environment: 'bg-success',
    transport: 'bg-orange-600', home: 'bg-purple-600', animals: 'bg-warning', sports: 'bg-pink-600',
  };

  return (
    <div className="min-h-full bg-game pb-6">
      <div className="bg-surface-2 p-5">
        <button onClick={() => navigate('/play')} className="flex items-center gap-2 text-white/60 hover:text-white mb-3 font-body text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Play
        </button>
        <h1 className="text-white font-game text-xl flex items-center gap-2">🏛️ Inventor Hall</h1>
        <p className="text-white/60 font-body text-sm mt-1">Showcase of brilliant AI inventions by young explorers!</p>

        <div className="flex mt-4 border-4 border-black">
          {(['hall', 'mine'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 font-game text-xs transition-colors ${activeTab === tab ? 'bg-primary text-white' : 'bg-surface text-white/50 hover:text-white'}`}>
              {tab === 'hall' ? '🌍 Global Hall' : '💡 My Inventions'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <Button variant="warning" fullWidth onClick={() => navigate('/play/brainstorm')} icon={<Plus className="w-4 h-4" />}>
          + Create New Invention
        </Button>

        {displayList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="text-6xl opacity-40">💡</div>
            <p className="text-white/40 font-body text-sm">
              {activeTab === 'mine' ? 'You haven\'t created any inventions yet! Go to Brainstorm Lab to create one.' : 'No inventions yet.'}
            </p>
          </div>
        ) : displayList.map((inv, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="border-4 border-black bg-surface p-5 shadow-pixel"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className={`${CATEGORY_COLORS[inv.category] || 'bg-gray-600'} border-2 border-black px-2 py-0.5 font-body text-xs text-white capitalize`}>
                {inv.category}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-warning" fill="#F59E0B" />
                <span className="text-warning font-pixel text-[10px]">{inv.innovation_score}</span>
              </div>
            </div>
            <h3 className="text-white font-game text-base mb-1">{inv.ai_solution_name}</h3>
            <p className="text-white/70 font-body text-sm leading-relaxed mb-3">{inv.ai_solution_description}</p>
            <div className="flex items-center gap-3 border-t border-white/10 pt-3">
              <div className="flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-primary" />
                <span className="text-white/50 font-body text-xs">For: {inv.target_audience}</span>
              </div>
              {inv.username && (
                <span className="text-white/30 font-body text-xs ml-auto">by {inv.username}</span>
              )}
            </div>
            {/* Innovation bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[9px] font-body text-white/40 mb-1">
                <span>Innovation Score</span>
                <span>{inv.innovation_score}/100</span>
              </div>
              <div className="h-2 bg-black border border-black">
                <div className="h-full bg-primary" style={{ width: `${inv.innovation_score}%` }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
