import { create } from "zustand";

export interface GlobalPlayerState {
  currentTrackId: string | null;
  currentTrackTitle: string | null;
  currentTrackAuthor: string | null;
  currentTrackThumbnail: string | null;
  isPlaying: boolean;
  volume: number;
  duration: number;
  currentTime: number;
  isMiniPlayerVisible: boolean;
  setTrack: (track: { id: string; title: string; author: string; thumbnail?: string | null }) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setTime: (time: number) => void;
  setDuration: (duration: number) => void;
  toggleMiniPlayer: () => void;
}

export const useGlobalPlayer = create<GlobalPlayerState>((set) => ({
  currentTrackId: null,
  currentTrackTitle: null,
  currentTrackAuthor: null,
  currentTrackThumbnail: null,
  isPlaying: false,
  volume: 0.8,
  duration: 0,
  currentTime: 0,
  isMiniPlayerVisible: true,
  
  setTrack: (track) => set({
    currentTrackId: track.id,
    currentTrackTitle: track.title,
    currentTrackAuthor: track.author,
    currentTrackThumbnail: track.thumbnail || null,
    isPlaying: true,
    isMiniPlayerVisible: true,
  }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setVolume: (volume) => set({ volume }),
  setTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  toggleMiniPlayer: () => set((state) => ({ isMiniPlayerVisible: !state.isMiniPlayerVisible })),
}));
