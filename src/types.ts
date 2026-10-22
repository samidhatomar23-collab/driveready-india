export type Lang = 'en' | 'hi';
export type VehicleClass = 'two-wheeler' | 'motorcycle-gear' | 'car' | 'both';
export type QuestionType = 'mcq' | 'sign-id' | 'true-false' | 'fill-in' | 'match' | 'order';

export interface LocalizedText {
  question: string;
  options?: string[];
  explanation: string;
}

export interface Question {
  id: string;
  topic: string;
  unit: string;
  lessonId: string;
  type: QuestionType;
  difficulty: 1 | 2 | 3;
  question: string;
  options: string[];
  /** index into options (mcq/sign-id/true-false), string (fill-in), or index array (order: correct sequence of option indices) */
  correctAnswer: number | string | number[];
  /** match type: pairs [left, right]; shown shuffled */
  pairs?: [string, string][];
  explanation: string;
  imageRef?: string; // signId from signs.json or path
  languages: { en?: LocalizedText; hi?: LocalizedText };
  applicableVehicleClasses: VehicleClass[] | ['all'];
  statesApplicable: string[] | ['all'];
  ruleRef?: string;
  sourceUrl: string;
  sourceDoc: string;
  retrievedOn: string | null;
  verified: boolean;
}

export interface Lesson { id: string; title: string; title_hi?: string; checkpoint?: boolean; perSession: number }
export interface Unit {
  id: string;
  title: string;
  title_hi?: string;
  icon: string;
  color: string;
  lessons: Lesson[];
  available: boolean;
}

export interface Sign {
  id: string;
  category: 'mandatory' | 'cautionary' | 'informatory';
  style: 'stop' | 'giveway' | 'prohibit' | 'compulsory' | 'warn' | 'info';
  shape: 'circle' | 'triangle' | 'rect' | 'octagon' | 'inv-triangle';
  glyph: string;
  overlay?: 'cross' | 'bar';
  name: string;
  name_hi?: string;
  meaning: string;
  meaning_hi?: string;
  sourceDoc: string;
  sourceUrl: string;
  imagePlaceholder: boolean;
}

export interface StateConfig {
  code: string;
  name: string;
  llTest: { questionCount: number; passMark: number; secondsPerQuestion: number; optionsPerQuestion: number };
  notes: string;
  sourceUrl: string;
  verified: boolean;
}

export interface Fine {
  id: string;
  offence: string;
  section: string;
  penalty: string;
  vehicle: string;
  sourceUrl: string;
  verified: boolean;
}

export interface Settings {
  stateCode: string;
  vehicleClass: VehicleClass;
  lang: Lang;
  dailyGoalXp: number;
  sound: boolean;
  largeText: boolean;
  dark: boolean;
  onboarded: boolean;
}

export interface NodeProgress { stars: 0 | 1 | 2 | 3; completed: boolean; bestScore: number }

export interface Progress {
  xp: number;
  hearts: number;
  heartsUpdatedAt: number;
  streak: number;
  lastActiveDay: string | null;
  streakFreezes: number;
  xpByDay: Record<string, number>;
  nodes: Record<string, NodeProgress>;
  /** spaced repetition: questionId -> box (0..4) and next due epoch ms */
  srs: Record<string, { box: number; due: number; wrong: number }>;
  testHistory: TestResult[];
  reports: { questionId: string; at: number; note: string }[];
}

export interface TestResult {
  at: number;
  stateCode: string;
  total: number;
  correct: number;
  passMark: number;
  passed: boolean;
  seconds: number;
  wrong: { questionId: string; chosen: number | null }[];
}
