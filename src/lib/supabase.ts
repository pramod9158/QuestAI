import { createClient } from '@supabase/supabase-js';

const urlEnv = import.meta.env.VITE_SUPABASE_URL || '';
const keyEnv = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabaseUrl = urlEnv.startsWith('http') ? urlEnv : 'https://placeholder.supabase.co';
const supabaseAnonKey = (keyEnv && keyEnv !== 'your_supabase_anon_key') ? keyEnv : 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_assets: { hat: string; suit: string };
          xp: number;
          coins: number;
          current_streak: number;
          last_active_date: string;
          created_at: string;
          zone?: 'junior' | 'innovator';
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      ai_cards: {
        Row: { id: number; title: string; image_url: string | null; problem_solved: string; ai_power: string; fun_fact: string };
      };
      user_cards: {
        Row: { id: number; user_id: string; card_id: number; unlocked_at: string };
      };
      user_inventions: {
        Row: { id: string; user_id: string; category: string; problem: string; target_audience: string; ai_solution_name: string; ai_solution_description: string; innovation_score: number; created_at: string };
        Insert: Omit<Database['public']['Tables']['user_inventions']['Row'], 'id' | 'created_at'>;
      };
      weekly_missions: {
        Row: { id: number; title: string; description: string; xp_reward: number; active_week_start: string };
      };
      mission_submissions: {
        Row: { id: string; user_id: string; mission_id: number; text_observation: string | null; image_storage_path: string | null; status: string; earned_xp: number; submitted_at: string };
        Insert: Omit<Database['public']['Tables']['mission_submissions']['Row'], 'id' | 'submitted_at'>;
      };
    };
  };
};
