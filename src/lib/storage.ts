import { get, set, del } from 'idb-keyval';
import type { Progress, Settings } from '../types';

const K_SETTINGS = 'dri:settings:v1';
const K_PROGRESS = 'dri:progress:v1';

export const defaultSettings: Settings = {
  stateCode: 'default', vehicleClass: 'car', lang: 'en', dailyGoalXp: 20,
  sound: true, largeText: false, dark: false, onboarded: false
};

export const defaultProgress = (): Progress => ({
  xp: 0, hearts: 5, heartsUpdatedAt: Date.now(), streak: 0, lastActiveDay: null, streakFreezes: 1,
  xpByDay: {}, nodes: {}, srs: {}, testHistory: [], reports: []
});

export async function loadAll(): Promise<{ settings: Settings; progress: Progress }> {
  try {
    const [s, p] = await Promise.all([get<Settings>(K_SETTINGS), get<Progress>(K_PROGRESS)]);
    return { settings: { ...defaultSettings, ...(s ?? {}) }, progress: { ...defaultProgress(), ...(p ?? {}) } };
  } catch {
    return { settings: defaultSettings, progress: defaultProgress() };
  }
}
export const saveSettings = (s: Settings) => set(K_SETTINGS, s).catch(() => {});
export const saveProgress = (p: Progress) => set(K_PROGRESS, p).catch(() => {});
export const clearAll = () => Promise.all([del(K_SETTINGS), del(K_PROGRESS)]).catch(() => {});
