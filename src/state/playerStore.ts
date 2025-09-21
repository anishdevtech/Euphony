// src/state/playerStore.ts
import { create } from 'zustand';

type RepeatMode = 'off' | 'one' | 'all';

type PlayerState = {
  shuffle: boolean;
  repeat: RepeatMode;
  setShuffle: (v: boolean) => void;
  setRepeat: (v: RepeatMode) => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  shuffle: false,
  repeat: 'off',
  setShuffle: (v) => set({ shuffle: v }),
  setRepeat: (v) => set({ repeat: v }),
}));
