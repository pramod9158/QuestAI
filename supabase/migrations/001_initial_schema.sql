-- ============================================================
-- AI Explorer — Full Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE (linked to Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT NOT NULL,
    zone TEXT DEFAULT 'junior' CHECK (zone IN ('junior', 'innovator')),
    avatar_assets JSONB DEFAULT '{"hat": "none", "suit": "explorer_default"}'::jsonb,
    xp INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    last_active_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- AI CARDS CATALOG
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ai_cards (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    emoji TEXT DEFAULT '🤖',
    rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    image_url TEXT,
    problem_solved TEXT,
    ai_power TEXT,
    fun_fact TEXT,
    color TEXT DEFAULT 'bg-primary'
);

ALTER TABLE public.ai_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view cards" ON public.ai_cards FOR SELECT USING (true);

-- ============================================================
-- USER UNLOCKED CARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_cards (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    card_id INTEGER REFERENCES public.ai_cards(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, card_id)
);

ALTER TABLE public.user_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cards" ON public.user_cards USING (auth.uid() = user_id);

-- ============================================================
-- USER INVENTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_inventions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    problem TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    ai_solution_name TEXT NOT NULL,
    ai_solution_description TEXT NOT NULL,
    innovation_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_inventions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view inventions" ON public.user_inventions FOR SELECT USING (true);
CREATE POLICY "Users manage own inventions" ON public.user_inventions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- WEEKLY MISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.weekly_missions (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    emoji TEXT DEFAULT '🎯',
    difficulty TEXT DEFAULT 'Medium',
    xp_reward INTEGER DEFAULT 50,
    active_week_start DATE DEFAULT CURRENT_DATE
);

ALTER TABLE public.weekly_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view missions" ON public.weekly_missions FOR SELECT USING (true);

-- ============================================================
-- MISSION SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mission_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    mission_id INTEGER REFERENCES public.weekly_missions(id),
    text_observation TEXT,
    image_storage_path TEXT,
    status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    earned_xp INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.mission_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own submissions" ON public.mission_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own submissions" ON public.mission_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- LEADERBOARD VIEW
-- ============================================================
CREATE OR REPLACE VIEW public.leaderboard AS
    SELECT id, username, xp, current_streak,
           RANK() OVER (ORDER BY xp DESC) as rank
    FROM public.profiles
    ORDER BY xp DESC
    LIMIT 100;

-- ============================================================
-- REALTIME PUBLICATION
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- ============================================================
-- SEED DATA
-- ============================================================

-- AI Cards
INSERT INTO public.ai_cards (title, emoji, rarity, problem_solved, ai_power, fun_fact, color) VALUES
('AI Doctor', '👨‍⚕️', 'rare', 'Diagnosing diseases from X-rays and scans faster than human doctors', 'Computer Vision + Deep Learning', 'AI can detect certain cancers with 94% accuracy — better than most doctors!', 'bg-red-500'),
('AI Farmer', '👨‍🌾', 'common', 'Detecting crop diseases from photos and predicting the best harvest time', 'Image Recognition + Weather Prediction', 'AI farming can reduce water usage by 50% by only watering crops when needed!', 'bg-green-600'),
('AI Teacher', '👩‍🏫', 'common', 'Creating personalized learning paths for every student''s needs', 'Natural Language Processing + Adaptive Learning', 'AI tutors can explain the same concept 1000 different ways until you understand!', 'bg-blue-500'),
('AI Scientist', '🧬', 'epic', 'Discovering new medicines and solving scientific mysteries in days instead of years', 'Protein Folding + Drug Discovery', 'AlphaFold AI solved a 50-year-old mystery about how proteins fold in just 2 years!', 'bg-purple-600'),
('AI Space Explorer', '🚀', 'legendary', 'Analyzing millions of stars and planets to find signs of life in outer space', 'Signal Processing + Pattern Recognition', 'NASA''s AI discovered 2 new exoplanets that human astronomers missed!', 'bg-indigo-600'),
('AI Detective', '🕵️', 'rare', 'Finding missing people, solving crimes, and identifying fake news', 'Facial Recognition + NLP + Fact-Checking', 'AI can analyze 10,000 documents in the time it takes to read one page!', 'bg-gray-600'),
('AI Storyteller', '📚', 'common', 'Creating stories, poems, and creative content for children and adults', 'Large Language Models + Creative Generation', 'AI has written entire novels and composed music that fooled professional musicians!', 'bg-pink-500');

-- Weekly Missions
INSERT INTO public.weekly_missions (title, description, emoji, difficulty, xp_reward) VALUES
('🏠 Home AI Hunter', 'Find 3 things in your home that use AI or smart technology. Take a photo or describe them!', '🏠', 'Easy', 80),
('⏰ Time Waster Finder', 'Find 3 places in your school or home where people waste time waiting. How could AI help?', '⏰', 'Medium', 100),
('🌍 Problem Spotter', 'Find a real problem in your school, neighbourhood, or city. Describe it with a photo or text!', '🌍', 'Hard', 120),
('🤖 AI Interview', 'Ask a parent, teacher or neighbour: "How does technology help you in your work?" Share what you learned!', '🤖', 'Easy', 80);

-- Storage bucket for mission uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('mission-uploads', 'mission-uploads', false) ON CONFLICT DO NOTHING;

CREATE POLICY "Users can upload mission files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'mission-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
