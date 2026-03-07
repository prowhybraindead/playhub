export type SubscriptionPlan = "free" | "dolphin_friend" | "dolphin_neon";

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  status: string | null;
  is_online: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  user_id: string;
  plan: SubscriptionPlan;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CurrencyRate {
  currency_code: string;
  rate_to_usd: number;
  last_updated: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  amount_usd: number;
  currency_code: string;
  converted_amount: number;
  status: "success" | "failed";
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  room_id: string;
  message: string;
  created_at: string;
  profile?: Pick<Profile, "username" | "avatar_url" | "status">;
}

export interface MusicTrack {
  idTrack: string;
  strTrack: string;
  strArtist: string;
  strAlbum: string;
  strTrackThumb: string | null;
  strMusicVid: string | null;
  intDuration: string | null;
  strGenre: string | null;
}

export interface SectionCardItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  description?: string;
  extra?: string;
}
