import { create } from "zustand";

export type Mode = "home" | "polls" | "quickpoll" | "spin" | "poll" | "wyr";

interface ModeStore {
  activeMode: Mode;
  setMode: (mode: Mode) => void;
  resetMode: () => void;
}

export const useModeStore = create<ModeStore>((set) => ({
  activeMode: "home",
  setMode: (mode) => set({ activeMode: mode }),
  resetMode: () => set({ activeMode: "home" }),
}));
