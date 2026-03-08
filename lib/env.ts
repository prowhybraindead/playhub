import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_THEAUDIODB_API_KEY: z.string().default("2"),
  GEMINI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  YOUTUBE_API_KEY: z.string().optional()
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "demo-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  NEXT_PUBLIC_THEAUDIODB_API_KEY: process.env.NEXT_PUBLIC_THEAUDIODB_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY
});
