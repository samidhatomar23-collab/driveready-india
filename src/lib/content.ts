import type { Fine, Lang, Question, Sign, StateConfig, Unit, VehicleClass } from '../types';
import signsData from '../data/signs.json';
import statesData from '../data/states.json';
import unitsData from '../data/units.json';
import finesData from '../data/fines.json';
import en from '../data/i18n/en.json';
import hi from '../data/i18n/hi.json';

export const signs = signsData as unknown as Sign[];
export const states = statesData as unknown as StateConfig[];
export const units = unitsData as unknown as Unit[];
export const fines = finesData as unknown as { lastUpdated: string | null; note: string; items: Fine[] };

const dicts: Record<Lang, Record<string, string>> = { en, hi };
export const tr = (lang: Lang, key: string) => dicts[lang][key] ?? dicts.en[key] ?? key;

// Questions are lazy-loaded per unit (code-split JSON chunks) and cached.
const loaders: Record<string, () => Promise<{ default: unknown }>> = {
  signs: () => import('../data/questions/signs.json'),
  row: () => import('../data/questions/row.json'),
  signals: () => import('../data/questions/signals.json')
};
const cache = new Map<string, Question[]>();

export async function loadUnitQuestions(unitId: string): Promise<Question[]> {
  if (cache.has(unitId)) return cache.get(unitId)!;
  const loader = loaders[unitId];
  if (!loader) return [];
  const mod = await loader();
  const list = mod.default as unknown as Question[];
  cache.set(unitId, list);
  return list;
}
export async function loadAllQuestions(): Promise<Question[]> {
  const parts = await Promise.all(Object.keys(loaders).map(loadUnitQuestions));
  return parts.flat();
}

export function matchesVehicle(q: Question, v: VehicleClass) {
  const a = q.applicableVehicleClasses as string[];
  return a.includes('all') || a.includes(v) || (v === 'both');
}
export function matchesState(q: Question, code: string) {
  const a = q.statesApplicable as string[];
  return a.includes('all') || a.includes(code);
}

export const getStateConfig = (code: string) => states.find(s => s.code === code) ?? states.find(s => s.code === 'default')!;
export const signById = (id: string) => signs.find(s => s.id === id);

/** Localised view of a question (falls back to English). */
export function localise(q: Question, lang: Lang) {
  const t = q.languages[lang];
  const base = q.languages.en ?? { question: q.question, options: q.options, explanation: q.explanation };
  return {
    question: t?.question ?? base.question,
    options: t?.options ?? base.options ?? q.options,
    explanation: t?.explanation ?? base.explanation
  };
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** Builds "Guess the sign" questions on the fly from the signs library. */
export function makeSignQuiz(n: number): Question[] {
  return shuffle(signs).slice(0, n).map((sg, i) => {
    const others = shuffle(signs.filter(s => s.id !== sg.id && s.category === sg.category)).slice(0, 3);
    const opts = shuffle([sg, ...others]);
    return {
      id: `guess-${sg.id}-${i}`, topic: 'Guess the sign', unit: 'signs', lessonId: 'guess', type: 'sign-id', difficulty: 1,
      question: 'What does this sign mean?', options: opts.map(o => o.name), correctAnswer: opts.findIndex(o => o.id === sg.id),
      explanation: sg.meaning, imageRef: sg.id,
      languages: {
        en: { question: 'What does this sign mean?', options: opts.map(o => o.name), explanation: sg.meaning },
        hi: { question: 'यह चिह्न क्या दर्शाता है?', options: opts.map(o => o.name_hi ?? o.name), explanation: sg.meaning_hi ?? sg.meaning }
      },
      applicableVehicleClasses: ['all'], statesApplicable: ['all'], sourceUrl: sg.sourceUrl, sourceDoc: sg.sourceDoc, retrievedOn: null, verified: false
    } as Question;
  });
}
