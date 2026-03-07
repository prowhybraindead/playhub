# Dolphin Playhub

Your personal ocean of fun.

## Stack

- Next.js 16 (App Router) + TypeScript strict mode
- Tailwind CSS + shadcn/ui style components + Framer Motion
- Supabase Auth + Postgres + Realtime + Presence + Storage
- Lucide icons + Sonner toasts

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy env:

```bash
cp .env.example .env.local
```

3. Fill `.env.local` with your Supabase keys.

4. Run SQL in Supabase SQL Editor:

```sql
-- Paste contents of supabase/schema.sql
```

5. Start app:

```bash
npm run dev
```

## Supabase Setup Checklist

- Enable Email + Password and Google OAuth in Auth providers.
- Add redirect URL: `http://localhost:3000/auth/callback` for local.
- Run [schema.sql](./supabase/schema.sql).
- Ensure Realtime is enabled for `profiles`, `subscriptions`, `chat_messages`.

## Dynamic Currency & Geo Pricing

- Base price remains USD.
- Geo API: `api.country.is`.
- FX API: fawaz currency API (primary), Frankfurter (fallback).
- Rates cached in `currency_rates` for 24 hours.

## Vercel Deployment

1. Push code to GitHub.
2. Import project into Vercel.
3. Add env vars from `.env.example`.
4. In Supabase Auth, add production callback:
   - `https://YOUR_DOMAIN/auth/callback`
5. Deploy and test login + realtime chat + upgrade flow.

## Add More Sections Later

1. Add `app/<section>/page.tsx`.
2. Fetch typed data in `lib/section-data.ts` (or new dedicated file).
3. Render via `SectionShell` for search/grid/detail/expand pattern.
4. Add sidebar nav entry in `components/layout/sidebar.tsx`.

## Notes

- Payments are fake-only by design.
- Upgrade action writes to `subscriptions` + `transactions`.
- Lyrics endpoint auto-falls back to LRCLIB.
