import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { XPToast } from '@/components/ui/GameUI';
import { generateBrainstormIdea } from '@/lib/ai';
import { Trophy, Star, Lightbulb, Plus, ArrowLeft, HelpCircle } from 'lucide-react';
import { ActivityHelpModal } from '@/components/ui/ActivityHelpModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeStyles } from '@/lib/useThemeStyles';

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
  const ts = useThemeStyles();
  const D = ts.duo;
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const filter = searchParams.get('filter');

  const { user } = useAuth();
  const [inventions, setInventions] = useState<Invention[]>([]);
  const [activeTab, setActiveTab] = useState<'hall' | 'mine'>('hall');
  const [loading, setLoading] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);

  // Mock gallery data
  const MOCK_INVENTIONS: Invention[] = [
    { category: 'farming', problem: 'Crops die from disease', target_audience: 'Farmers', ai_solution_name: 'CropGuard AI', ai_solution_description: 'AI analyzes crop photos to detect diseases early and recommend treatment before entire field is affected!', innovation_score: 92, username: 'FarmHero', created_at: '2024-01-15' },
    { category: 'school', problem: 'Students forget homework', target_audience: 'Students', ai_solution_name: 'Smart Reminder Bot', ai_solution_description: 'AI learns your schedule and sends personalized reminders with tips to complete homework efficiently!', innovation_score: 78, username: 'CodeKid', created_at: '2024-01-14' },
    { category: 'health', problem: 'Hospital queues too long', target_audience: 'Patients', ai_solution_name: 'Queue Predictor', ai_solution_description: 'AI predicts hospital waiting times and lets patients book optimal slots from home!', innovation_score: 88, username: 'HealthHero', created_at: '2024-01-13' },
    { category: 'environment', problem: 'Plastic waste in rivers', target_audience: 'Everyone', ai_solution_name: 'River CleanBot AI', ai_solution_description: 'AI-powered floating drones detect and collect plastic waste from rivers automatically!', innovation_score: 95, username: 'EcoWarrior', created_at: '2024-01-12' },
  ];

  useEffect(() => {
    localStorage.setItem('play_completed_inventor-hall', 'true');
    localStorage.setItem('play_progress_inventor-hall', '100');
    if (filter) {
      localStorage.setItem(`play_completed_inventor-hall_${filter}`, 'true');
      localStorage.setItem(`play_progress_inventor-hall_${filter}`, '100');
    }
  }, [filter]);

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
      {/* Header */}
      <div className={D ? "bg-white p-5 border-b border-gray-200 shadow-sm" : "bg-surface-2 p-5"}>
        <button 
          onClick={() => navigate('/play')} 
          className={D ? "flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-3 font-body text-sm font-semibold" : "flex items-center gap-2 text-white/60 hover:text-white mb-3 font-body text-sm"}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Play
        </button>
        <h1 className={D ? "text-black font-game text-xl flex items-center gap-2 font-extrabold" : "text-white font-game text-xl flex items-center gap-2"}>
          🏛️ Inventor Hall
          <button
            onClick={() => setHelpOpen(true)}
            className="p-1 hover:text-purple-400 transition-colors cursor-pointer text-gray-400"
            title="Show how it works"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>
        </h1>
        <div className="flex justify-between items-center mt-1">
          <p className={D ? "text-gray-500 font-body text-sm font-semibold" : "text-white/60 font-body text-sm"}>
            Showcase of brilliant AI inventions by young explorers!
          </p>
          <button
            onClick={() => navigate('/play')}
            className="text-white/30 hover:text-white/60 font-pixel text-[6px] tracking-wider uppercase border border-white/10 px-2 py-0.5 cursor-pointer transition-colors"
          >
            ⚡ Skip
          </button>
        </div>

        <div className={D ? "flex mt-4 p-1 bg-gray-50 border border-gray-200 rounded-xl overflow-x-auto no-scrollbar gap-1" : "flex mt-4 border-4 border-black"}>
          {(['hall', 'mine'] as const).map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={D ? `flex-1 py-2 px-3 font-game text-xs whitespace-nowrap cursor-pointer transition-all flex items-center justify-center gap-1.5 rounded-lg ${
                activeTab === tab 
                  ? 'bg-[#5FCC5F] text-black shadow-sm font-extrabold'
                  : 'text-gray-400 hover:text-gray-600 font-semibold'
              }` : `flex-1 py-2 font-game text-xs transition-colors ${
                activeTab === tab 
                  ? 'bg-primary text-white' 
                  : 'bg-surface text-white/50 hover:text-white'
              }`}
            >
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
            <p className={D ? "text-gray-400 font-body text-sm font-semibold" : "text-white/40 font-body text-sm"}>
              {activeTab === 'mine' ? 'You haven\'t created any inventions yet! Go to Brainstorm Lab to create one.' : 'No inventions yet.'}
            </p>
          </div>
        ) : displayList.map((inv, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.06 }}
            className={D ? "bg-white p-5 rounded-xl border border-gray-200" : "border-4 border-black bg-surface p-5 shadow-pixel"}
            style={D ? {
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            } : {}}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className={D ? `${CATEGORY_COLORS[inv.category] || 'bg-gray-600'} rounded-full px-3 py-0.5 font-body text-[11px] font-bold text-white capitalize` : `${CATEGORY_COLORS[inv.category] || 'bg-gray-600'} border-2 border-black px-2 py-0.5 font-body text-xs text-white capitalize`}>
                {inv.category}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-warning" fill="#F59E0B" />
                <span className={D ? "text-amber-500 font-body text-xs font-bold" : "text-warning font-pixel text-[10px]"}>{inv.innovation_score}</span>
              </div>
            </div>
            <h3 className={D ? "text-black font-game text-base mb-1 font-extrabold" : "text-white font-game text-base mb-1"}>{inv.ai_solution_name}</h3>
            <p className={D ? "text-gray-600 font-body text-sm leading-relaxed mb-3 font-medium" : "text-white/70 font-body text-sm leading-relaxed mb-3"}>{inv.ai_solution_description}</p>
            <div className={D ? "flex items-center gap-3 border-t border-gray-100 pt-3" : "flex items-center gap-3 border-t border-white/10 pt-3"}>
              <div className="flex items-center gap-1">
                <Lightbulb className="w-3 h-3" style={{ color: D ? '#5FCC5F' : undefined }} />
                <span className={D ? "text-gray-500 font-body text-xs font-semibold" : "text-white/50 font-body text-xs"}>For: {inv.target_audience}</span>
              </div>
              {inv.username && (
                <span className={D ? "text-gray-400 font-body text-xs ml-auto font-semibold" : "text-white/30 font-body text-xs ml-auto"}>by {inv.username}</span>
              )}
            </div>
            {/* Innovation bar */}
            <div className="mt-3">
              <div className={D ? "flex justify-between text-[10px] font-body text-gray-400 mb-1 font-bold" : "flex justify-between text-[9px] font-body text-white/40 mb-1"}>
                <span>Innovation Score</span>
                <span>{inv.innovation_score}/100</span>
              </div>
              <div className={D ? "h-2 bg-gray-100 rounded-full overflow-hidden" : "h-2 bg-black border border-black"}>
                <div className={D ? "h-full bg-gradient-to-r from-[#5FCC5F] to-[#1EBC6B] rounded-full" : "h-full bg-primary"} style={{ width: `${inv.innovation_score}%` }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <ActivityHelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Inventor Hall"
        type="play"
        description="The ultimate museum showcase of smart AI invention blueprints conceptualized by other explorers."
        steps={[
          "Browse through original projects in the 'Global Hall' feed.",
          "Check each project's category tags, target audience details, and custom solution name.",
          "Inspect the AI solution's mechanism and check the calculated 'Innovation Score'.",
          "Toggle to 'My Inventions' to see all your saved brainstorm laboratory creations."
        ]}
        rewards="🏛️ Showcase portfolio of original designs"
      />
    </div>
  );
}
