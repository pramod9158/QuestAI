# AI Explorer 🤖✨

**AI Explorer** is an engaging, gamified, mobile-first Progressive Web Application (PWA) designed for children in India aged 6–16 to learn Artificial Intelligence concepts through play, problem-solving, and creation instead of traditional coding syntax.

---

## 🎨 Gamification & Design Style
- **Minecraft/Duolingo Hybrid Aesthetic**: Features chunky border styling, tactile quest nodes, pixel-art avatars, active progress bars, and custom micro-animations.
- **Engaging Mechanics**:
  - **XP & Level-Ups**: Earn XP by completing lessons, quizes, and missions.
  - **Daily Streaks**: Maintain active streaks with visual flame indicators.
  - **Collectible AI Cards**: Earn virtual trading cards representing AI careers (e.g. AI Farmer, AI Scientist, AI Detective).
  - **Coin Shop**: Shop items like avatar accessories (hats, suits) using earned coins.
  - **Mystery Box**: Interactive reward opener.

---

## 🚀 Key Modules
1. **AI Around Me**: Swipe card classification game.
2. **Story Adventures**: Interactive branching story node map.
3. **AI Detective**: Case files determining if AI can assist.
4. **Brainstorm Lab**: 3-step wizard linked to **Gemini API** to invent new AI ideas.
5. **Weekly Missions**: Real-world field challenge checklists with observation submissions.
6. **AI Idea Generator**: Quick input box generating 3 solution cards.
7. **Quiz Arena**: Speed time-attack or casual quiz challenges.
8. **Comic Creator**: 6-panel adventure creator exported directly to a PDF download.
9. **Dashboard**: Protected parent/teacher view showing insights, progress summaries, and generating a customized PDF Achievement Certificate.

---

## 🛠️ Technology Stack
- **Frontend Core**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 (configured via CSS `@theme` variables for optimal load speed)
- **Database & Realtime**: Supabase (Auth, Profiles table with RLS, realtime publication subscriptions, and Storage bucket for uploads)
- **AI Integrations**: Google Gemini API (`gemini-1.5-flash`) with dynamic stubs
- **PDF Generation**: `jspdf` & `html2canvas`

---

## 🚀 Local Development Setup

### 1. Clone the project and install dependencies:
```bash
npm install
```

### 2. Configure Environment Variables:
Copy `.env.example` to `.env` and fill in your keys:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```
*Note: If no env keys are provided, the app will run cleanly in **Guest Mode** with simulated offline fallbacks.*

### 3. Run Dev Server:
```bash
npm run dev
```

---

## 🗄️ Supabase Database Migration
To set up the Supabase database schema, RLS policies, leaderboard views, and curriculum seed data:
1. Go to your **Supabase Dashboard**.
2. Open the **SQL Editor** tab.
3. Create a new query, paste the contents of `supabase/migrations/001_initial_schema.sql` and click **Run**.

---

## 🌐 Deploy to Vercel
1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Configure the following environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`
3. Click **Deploy**. Vercel will automatically configure the SPA client router using the provided `vercel.json` file.


