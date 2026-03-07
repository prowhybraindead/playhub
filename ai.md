# AI Context File — Dolphin Playhub

## Product Identity

- Project: Dolphin Playhub
- Tagline: Your personal ocean of fun
- Style: deep ocean + neon cyan/purple + playful futuristic mood
- Scope: private dashboard for owner and a few friends
- Billing: all payment/subscription logic is fake-only

## Architecture Summary

- Next.js App Router with server-first pages
- Shared shell:
  - `app/layout.tsx` hosts desktop sidebar + page content
  - `components/layout/*` includes header/sidebar/mobile nav/neon badge
- Feature pages:
  - `/dashboard`, `/music`, `/anime`, `/books`, `/fantasy`, `/art`, `/chat`, `/upgrade`, `/profile`, `/auth`
- APIs:
  - `/api/music/search`
  - `/api/music/lyrics`
  - `/api/subscription/upgrade`

## Data + Auth

- Supabase client utilities in `lib/supabase.ts`
- Route protection in `middleware.ts`
- Auth page with email/password + Google OAuth callback
- Profile editor supports avatar/banner upload via Supabase Storage

## Pricing + Currency Logic

- Currency logic in `lib/currency.ts`
- Base plan prices in USD
- Country detection via `api.country.is`
- FX source:
  - Primary: fawazahmed currency API (`usd.json`)
  - Fallback: Frankfurter app endpoint
- Rates cached in Supabase table `currency_rates` for 24h
- Regional multiplier is applied before conversion

## Music Module

- UI components:
  - `components/music/music-search.tsx`
  - `components/music/music-card.tsx`
  - `components/music/music-detail.tsx`
  - `components/music/lyrics-expandable.tsx`
- Data sources:
  - TheAudioDB search API
  - Lyrics.ovh primary, LRCLIB fallback
- Interaction:
  - Search -> card grid -> detail panel -> expandable lyrics

## Realtime Chat Module

- Component: `components/chat/realtime-chat.tsx`
- Uses Supabase Realtime channel + Presence
- Table: `chat_messages`
- Online users displayed from presence state

## Upgrade Module

- Page: `/upgrade`
- Component: `components/subscription/upgrade-page.tsx`
- Plans:
  - free
  - dolphin_friend
  - dolphin_neon
- Fake upgrade endpoint writes:
  - `subscriptions`
  - `transactions`

## Database Contracts

- SQL source of truth: `supabase/schema.sql`
- Core tables:
  - `profiles`
  - `subscriptions`
  - `currency_rates`
  - `transactions`
  - `chat_messages`
- Includes:
  - RLS policies
  - Realtime publication entries
  - storage bucket setup (`avatars`, `banners`)
  - trigger on `auth.users` to auto-create profile/subscription

## Styling Conventions

- Tailwind with CSS variables in `app/globals.css`
- Reusable UI primitives in `components/ui/*`
- Utility function `cn` in `lib/utils.ts`
- Motion interactions via Framer Motion

## Extension Guide for AI

When adding a new feature:

1. Prefer server component page by default.
2. Keep client components only for interactive UI/state/realtime.
3. Add strict typings in `types/index.ts`.
4. Add loading state via `loading.tsx`.
5. Add error handling in API routes and toast feedback in clients.
6. Respect fake-only payment rule.
7. For new external APIs, add typed parsing + fallback behavior.

## Safety Rules

- Never introduce real payment processors.
- Never log secrets.
- Keep Supabase RLS enabled.
- Do not bypass middleware auth for private pages.
