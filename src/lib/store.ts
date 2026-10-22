import { create } from 'zustand';
import type { Progress, Settings, TestResult } from '../types';
import { clearAll, defaultProgress, defaultSettings, loadAll, saveProgress, saveSettings } from './storage';
import { nextSrs } from './srs';

export const MAX_HEARTS = 5;
const HEART_REGEN_MS = 30 * 60_000;

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const daysBetween = (a: string, b: string) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);

interface State {
  ready: boolean;
  settings: Settings;
  progress: Progress;
  init: () => Promise<void>;
  setSettings: (patch: Partial<Settings>) => void;
  refreshHearts: () => void;
  loseHeart: () => void;
  gainHeart: () => void;
  recordAnswer: (questionId: string, correct: boolean) => void;
  completeLesson: (nodeId: string, correct: number, total: number, xpEarned: number) => { stars: 1 | 2 | 3 };
  addXp: (xp: number) => void;
  recordTest: (r: TestResult) => void;
  reportError: (questionId: string, note?: string) => void;
  resetAll: () => Promise<void>;
}

function applyProgress(set: (p: Partial<State>) => void, p: Progress) { set({ progress: p }); void saveProgress(p); }

export const useStore = create<State>((set, get) => ({
  ready: false,
  settings: defaultSettings,
  progress: defaultProgress(),

  init: async () => {
    const { settings, progress } = await loadAll();
    set({ settings, progress, ready: true });
    get().refreshHearts();
  },

  setSettings: patch => { const s = { ...get().settings, ...patch }; set({ settings: s }); void saveSettings(s); },

  refreshHearts: () => {
    const p = get().progress;
    if (p.hearts >= MAX_HEARTS) { if (p.heartsUpdatedAt !== Date.now()) applyProgress(set, { ...p, heartsUpdatedAt: Date.now() }); return; }
    const gained = Math.floor((Date.now() - p.heartsUpdatedAt) / HEART_REGEN_MS);
    if (gained > 0) {
      const hearts = Math.min(MAX_HEARTS, p.hearts + gained);
      applyProgress(set, { ...p, hearts, heartsUpdatedAt: hearts >= MAX_HEARTS ? Date.now() : p.heartsUpdatedAt + gained * HEART_REGEN_MS });
    }
  },

  loseHeart: () => { const p = get().progress; applyProgress(set, { ...p, hearts: Math.max(0, p.hearts - 1), heartsUpdatedAt: p.hearts >= MAX_HEARTS ? Date.now() : p.heartsUpdatedAt }); },
  gainHeart: () => { const p = get().progress; applyProgress(set, { ...p, hearts: Math.min(MAX_HEARTS, p.hearts + 1) }); },

  recordAnswer: (questionId, correct) => {
    const p = get().progress;
    applyProgress(set, { ...p, srs: { ...p.srs, [questionId]: nextSrs(p.srs[questionId], correct) } });
  },

  addXp: xp => {
    const p = get().progress; const today = dayKey();
    let { streak, streakFreezes } = p;
    if (p.lastActiveDay !== today) {
      if (!p.lastActiveDay) streak = 1;
      else {
        const gap = daysBetween(p.lastActiveDay, today);
        if (gap === 1) streak += 1;
        else if (gap === 2 && streakFreezes > 0) { streak += 1; streakFreezes -= 1; }
        else streak = 1;
      }
      if (streak > 0 && streak % 7 === 0) streakFreezes = Math.min(2, streakFreezes + 1);
    }
    applyProgress(set, { ...p, xp: p.xp + xp, streak, streakFreezes, lastActiveDay: today, xpByDay: { ...p.xpByDay, [today]: (p.xpByDay[today] ?? 0) + xp } });
  },

  completeLesson: (nodeId, correct, total, xpEarned) => {
    const accuracy = total ? correct / total : 0;
    const stars = (accuracy >= 0.95 ? 3 : accuracy >= 0.75 ? 2 : 1) as 1 | 2 | 3;
    get().addXp(xpEarned);
    const p = get().progress; const prev = p.nodes[nodeId];
    applyProgress(set, { ...p, nodes: { ...p.nodes, [nodeId]: {
      completed: true, stars: Math.max(prev?.stars ?? 0, stars) as 1 | 2 | 3, bestScore: Math.max(prev?.bestScore ?? 0, Math.round(accuracy * 100)) } } });
    return { stars };
  },

  recordTest: r => { const p = get().progress; applyProgress(set, { ...p, testHistory: [r, ...p.testHistory].slice(0, 30) }); },
  reportError: (questionId, note = '') => { const p = get().progress; applyProgress(set, { ...p, reports: [...p.reports, { questionId, at: Date.now(), note }] }); },
  resetAll: async () => { await clearAll(); set({ settings: defaultSettings, progress: defaultProgress() }); }
}));

export const levelOf = (xp: number) => Math.floor(xp / 100) + 1;
