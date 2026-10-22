import type { Question, Settings } from '../types';
import { matchesState, matchesVehicle, shuffle } from './content';

/** Filter by user's state / vehicle class. */
export const eligible = (qs: Question[], s: Settings) => qs.filter(q => matchesVehicle(q, s.vehicleClass) && matchesState(q, s.stateCode));

/** Shuffle a pool and take n, with at most one match-the-pairs question per session. */
export function buildSession(pool: Question[], n: number): Question[] {
  const sh = shuffle(pool);
  const out: Question[] = []; let matches = 0;
  for (const q of sh) {
    if (q.type === 'match') { if (matches >= 1) continue; matches++; }
    out.push(q);
    if (out.length >= n) break;
  }
  return shuffle(out);
}
