# AI Context File — Dolphin Playhub

## Product Identity

- Project: Dolphin Playhub
- Tagline: Your personal ocean of fun
- Style: deep ocean + neon cyan/purple + playful futuristic mood
- Scope: private dashboard for owner and a few friends
- Billing: all payment/subscription logic is fake-only

## Architecture Summary

- Next.js 14 App Router with server-first pages + hybrid client components
- Shared shell:
  - `app/layout.tsx` hosts desktop sidebar + page content
  - `components/layout/*` includes header/sidebar/mobile nav/neon badge
- Feature pages:
  - `/dashboard`, `/music`, `/anime`, `/books`, `/fantasy`, `/art`, `/chat`, `/upgrade`, `/profile`, `/auth`, `/f1`

## Internal AI Integrations

Dolphin Playhub heavily relies on LLMs for core functionality:

1. **Global i18n Translation (`/api/translate`)**:
   - Uses **OpenRouter (Nemotron 3 Nano)**.
   - Converts UI elements on-the-fly dynamically into strings selected by users (`en`, `vi`, `zh`, etc.).
   - Driven by `TranslationQueue` which batches texts and queries the backend.
   - Cache results aggressively saved to PostgreSQL (`i18n_translations`) to zero-out latency for repeated queries.

2. **F1 AI Assistant (`/api/f1-ai`)**:
   - Also driven by OpenRouter.
   - Possesses a background auto-pilot mode for commentary and an interactive chat mode grounded strictly in Formula 1 context.

3. **Gemini Realtime Chat (`/api/chat`)**:
   - Integrated with `@google/genai` using the `gemini-2.5-flash` model.
   - Activated in the Global Chat when users type `@gemini`.
   - Supports Realtime Broadcasting (Typing Indicators) via Supabase Channels.

## Data & External APIs

- **Music & Video**:
  - TheAudioDB for track metadata.
  - Lyrics.ovh / LRCLIB for lyrics.
  - **YouTube Data API v3 (`/api/music/youtube`)**: Used to autonomously search for "Official Music Video" IDs linked to tracks.
  - Media played via `react-player` mounted dynamically (`next/dynamic` strictly client-side via Portal).
- **Formula 1**:
  - Jolpi Ergast API (`api.jolpi.ca/ergast/f1/`) used to fetch historical races and standings spanning 1950 - today.
- **Currency**:
  - Geo API `api.country.is`.
  - FX via Fawazahmed/Frankfurter. Prices fake-converted and cached in `currency_rates`.
- **Database (Supabase)**:
  - Tables: `profiles`, `subscriptions`, `currency_rates`, `transactions`, `chat_messages`, `i18n_translations`

## Realtime Chat Module

- Component: `components/chat/realtime-chat.tsx`
- Uses Supabase Realtime channel + Presence
- Table: `chat_messages`
- Broadcasts `typing` events across connected clients (including AI bots).

## Extension Guide for Future AI Agents

When adding a new feature or modifying existing ones:

1. **Translations**: ALWAYS wrap hardcore UI strings with the `useTranslation()` context. Do NOT hardcode regional text.
2. **Third-Party Integrations**: Next.js 14 is strict about server/client boundaries. Use `use client` directives explicitly when injecting things like `react-player` or `window` objects.
3. **Database Caching**: If you introduce a slow API (like an LLM route), you MUST implement a Redis or Postgres caching layer (like `i18n_translations`).
4. **Environment Variables**: Use `lib/env.ts` (Zod schema) for validating configuration before runtime execution to prevent silent 500 errors.

## Safety Rules

- Never log secrets.
- Always implement `try-catch` blocks and **gracefully degrade** in Next.js API routes (especially for unreliable LLM endpoints) rather than throwing 500 errors.
- Do NOT introduce stripe/paypal. Keep financial logic isolated and fake.
- Keep Supabase RLS policies enabled. Do not write raw queries that bypass `auth.uid()`.
