# Dolphin Playhub

Your personal ocean of fun. A premium, aesthetic dashboard built with Next.js 14 App Router, featuring AI-powered translations, real-time communication, Formula 1 historical tracking, and global music discovery.

![Dolphin Logo](./public/favicon.ico)

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI & Styling**: Tailwind CSS, shadcn/ui, Framer Motion, local glassmorphism styles
- **Database & Auth**: Supabase (PostgreSQL, Auth, Realtime presence, Storage)
- **State & Query**: React Hooks, server-side data fetching
- **Media & Icons**: Lucide React, `react-player` (YouTube IFrame API)

## ✨ Core Features

### 🌐 Global AI Translation (i18n)

- Powered by **OpenRouter (Nemotron 3 Nano)** with intelligent fallback logic.
- Translates the entire UI dynamically via a custom `TranslationContext` and `TranslationQueue`.
- Aggressive Database Caching: Translations are saved to Supabase (`i18n_translations`) to eliminate redundant LLM calls and eliminate latency.

### 🏎️ Formula 1 Hub

- **Historical Tracker**: Browse race results and standings from the 1950s to present via the **Jolpi Ergast API**.
- **F1 AI Assistant**:
  - _Mechanism 1 (Auto-Pilot)_: Periodically broadcasts summarized race commentary.
  - _Mechanism 2 (Interactive)_: Users can chat directly with the AI specifically tuned for F1 domain knowledge.

### 💬 Realtime Chat & Gemini Agent

- **Supabase Realtime**: Live messaging with typing indicators for all online users.
- **@gemini Integration**: Mention the bot in chat to trigger the Google Gemini AI for instant responsive answers directly within the public channel.

### 🎵 Music & Radio

- **Music Browser**: Search TheAudioDB.
- **Lyrics Engine**: Multi-tiered lyrics fetching (Lyrics.ovh primary, LRCLIB fallback).
- **Official Videos**: Automatically searches the **YouTube Data API v3** to find official music videos, rendering them in a floating, minimizable `<YouTubePlayer>` using `react-player`.
- **Global Radio**: Stream international radio stations.

### 💳 Dynamic Currency & Upgrades (Mocked)

- Base pricing in USD.
- Auto-detects user country via `api.country.is`.
- Converts currency in real-time via Fawazahmed API (or Frankfurter), caching exchange rates in Supabase for 24 hours.

## 🛠️ Quick Start

**1. Install dependencies:**

```bash
npm install
```

**2. Setup Configuration:**

Create a `.env.local` file by copying `.env.example`:

```bash
cp .env.example .env.local
```

You must fill in the following API keys for the app to function fully:

- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Required for server-side cache inserts)
- `OPENROUTER_API_KEY_1` & `OPENROUTER_API_KEY_2` (For i18n Translation, F1 Commentary, Fantasy Co-writer, and Realtime Chatbot)
- `GEMINI_API_KEY` (Optional, previously used for chat)
- `NEXT_PUBLIC_THEAUDIODB_API_KEY` (Defaults to "2" for dev test endpoints)

**3. Database Schema:**

Execute the provided SQL script in your Supabase SQL Editor to generate the necessary tables, Realtime configurations, and RLS policies:

```sql
-- Paste contents of supabase/schema.sql
```

**4. Start the Application:**

```bash
npm run dev
```

## ☁️ Vercel Deployment

1. Push your repository to GitHub.
2. Import the project into Vercel.
3. Add all environment variables from `.env.local`.
4. In Supabase Auth, remember to add your production domain to the callback URLs (`https://YOUR_DOMAIN/auth/callback`).
5. Deploy.

---

_Note: All payment and subscription upgrades inside the app are entirely simulated. No real payment processors are connected._
