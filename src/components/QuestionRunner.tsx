import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Question } from '../types';
import { localise, shuffle, signById, tr } from '../lib/content';
import { useStore } from '../lib/store';
import { play } from '../lib/sound';
import { Sheet } from './Sheet';
import SignGraphic from './SignGraphic';
import Mascot from './Mascot';

export interface RunResult { total: number; firstTryCorrect: number; wrongIds: string[]; outOfHearts: boolean }

const LINK_COLORS = ['#0f9d94', '#f5a000', '#8a5cf6', '#e0566b'];

export default function QuestionRunner({ questions, useHearts, onFinish, onQuit }: {
  questions: Question[]; useHearts: boolean; onFinish: (r: RunResult) => void; onQuit: () => void;
}) {
  const { settings, progress, setSettings, loseHeart, recordAnswer, reportError } = useStore();
  const lang = settings.lang;
  const [queue, setQueue] = useState<Question[]>(questions);
  const [idx, setIdx] = useState(0);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [reported, setReported] = useState<Set<string>>(new Set());
  const stats = useRef({ firstTryCorrect: 0, wrong: new Set<string>(), seen: new Set<string>(), requeued: new Set<string>() });
  const q = queue[idx];

  const finish = (outOfHearts: boolean) => onFinish({
    total: questions.length, firstTryCorrect: stats.current.firstTryCorrect, wrongIds: [...stats.current.wrong], outOfHearts
  });

  const onChecked = (correct: boolean) => {
    const st = stats.current;
    const first = !st.seen.has(q.id);
    st.seen.add(q.id);
    if (correct) { if (first) st.firstTryCorrect++; }
    else {
      st.wrong.add(q.id);
      if (!st.requeued.has(q.id)) { st.requeued.add(q.id); setQueue(prev => [...prev, q]); }
      if (useHearts) loseHeart();
    }
    if (first) recordAnswer(q.id, correct);
    play(correct ? 'right' : 'wrong', settings.sound);
    setChecked(correct);
  };

  const next = () => {
    if (useHearts && checked === false && useStore.getState().progress.hearts <= 0) return finish(true);
    setChecked(null);
    if (idx + 1 >= queue.length) return finish(false);
    setIdx(idx + 1);
  };

  const L = localise(q, lang);
  const pct = Math.round((idx / queue.length) * 100);

  return (
    <div className="mx-auto flex h-full max-w-md flex-col">
      <header className="flex items-center gap-3 p-4">
        <button aria-label="Close" onClick={() => setConfirmQuit(true)} className="text-2xl muted">✕</button>
        <div className="h-4 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--line)' }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <motion.div className="h-full rounded-full bg-teal-500" animate={{ width: `${Math.max(pct, 4)}%` }} />
        </div>
        <button onClick={() => setSettings({ lang: lang === 'en' ? 'hi' : 'en' })} className="rounded-lg border-2 px-2 py-1 text-xs font-extrabold" style={{ borderColor: 'var(--line)' }} aria-label="Toggle English / Hindi">
          {lang === 'en' ? 'हिं' : 'EN'}
        </button>
        {useHearts && <span className="font-extrabold text-rose-500" aria-label={`${progress.hearts} hearts`}>❤ {progress.hearts}</span>}
      </header>

      <AnimatePresence mode="wait">
        <motion.main key={q.id + '-' + idx} className="flex-1 overflow-y-auto px-4 pb-4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.18 }}>
          <QuestionBody q={q} L={L} lang={lang} locked={checked !== null} onCheck={onChecked} sheetOpen={checked !== null} />
        </motion.main>
      </AnimatePresence>

      <Sheet open={checked !== null} label={checked ? 'Correct' : 'Incorrect'}>
        <div className={checked ? 'text-green-600' : 'text-rose-500'}>
          <p className="text-xl font-black">{checked ? `✓ ${tr(lang, 'lesson.correct')}` : `✕ ${tr(lang, 'lesson.incorrect')}`}</p>
        </div>
        <p className="mt-2 text-sm font-semibold">{L.explanation}</p>
        {q.ruleRef && <p className="muted mt-1 text-xs">{q.ruleRef}</p>}
        <p className="muted mt-2 text-xs">
          {q.verified ? `✔ ${tr(lang, 'q.verified')}` : `⚠ ${tr(lang, 'q.unverified')}`}{q.verified && <> · {tr(lang, 'q.source')}: <a className="underline" href={q.sourceUrl} target="_blank" rel="noreferrer">{q.sourceDoc}</a>{q.retrievedOn ? ` (${q.retrievedOn})` : ''}</>}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <button className="muted text-xs underline" disabled={reported.has(q.id)} onClick={() => { reportError(q.id); setReported(new Set(reported).add(q.id)); }}>
            {reported.has(q.id) ? tr(lang, 'q.reported') : `⚑ ${tr(lang, 'q.report')}`}
          </button>
        </div>
        <button className={`btn mt-4 ${checked ? '' : 'btn-red'}`} onClick={next} autoFocus>{tr(lang, 'lesson.continue')}</button>
      </Sheet>

      <Sheet open={confirmQuit} onClose={() => setConfirmQuit(false)} label="Quit lesson">
        <div className="flex flex-col items-center text-center">
          <Mascot mood="sad" size={80} />
          <p className="mt-2 text-xl font-black">{tr(lang, 'lesson.quit')}</p>
          <p className="muted text-sm">{tr(lang, 'lesson.quit.sub')}</p>
          <button className="btn mt-4" onClick={() => setConfirmQuit(false)}>{tr(lang, 'lesson.keep')}</button>
          <button className="btn btn-ghost mt-3" onClick={onQuit}>{tr(lang, 'lesson.exit')}</button>
        </div>
      </Sheet>
    </div>
  );
}

function QuestionBody({ q, L, lang, locked, onCheck, sheetOpen }: {
  q: Question; L: ReturnType<typeof localise>; lang: 'en' | 'hi'; locked: boolean; onCheck: (ok: boolean) => void; sheetOpen: boolean;
}) {
  const sign = q.imageRef ? signById(q.imageRef) : undefined;
  const [selected, setSelected] = useState<number | null>(null);

  // option order is shuffled per question (True/False stays fixed)
  const perm = useMemo(() => q.type === 'true-false' ? q.options.map((_, i) => i) : shuffle(q.options.map((_, i) => i)), [q.id]);

  // match state
  const pairs = q.pairs ?? [];
  const rightOrder = useMemo(() => shuffle(pairs.map((_, i) => i)), [q.id]);
  const [active, setActive] = useState<number | null>(null);
  const [links, setLinks] = useState<Record<number, number>>({}); // leftIdx -> rightIdx(original pair index)

  const rightLabel = (i: number) => {
    const [left, right] = pairs[i];
    if (lang === 'hi' && left.startsWith('sign:')) return signById(left.slice(5))?.name_hi ?? right;
    return right;
  };
  const clickLeft = (i: number) => { if (locked) return; play('tap', useStore.getState().settings.sound); setActive(i); };
  const clickRight = (r: number) => {
    if (locked || active === null) return;
    play('tap', useStore.getState().settings.sound);
    setLinks(prev => { const n = { ...prev }; Object.keys(n).forEach(k => { if (n[+k] === r) delete n[+k]; }); n[active] = r; return n; });
    setActive(null);
  };

  const isMatch = q.type === 'match';
  const ready = isMatch ? Object.keys(links).length === pairs.length : selected !== null;

  const check = () => {
    if (isMatch) onCheck(pairs.every((_, i) => links[i] === i));
    else onCheck(perm[selected!] === q.correctAnswer);
  };

  return (
    <div className="flex h-full flex-col">
      <h1 className="text-xl font-black leading-snug">{L.question}</h1>
      {isMatch && <p className="muted mb-3 text-sm font-semibold">{tr(lang, 'q.match')}</p>}
      {sign && !isMatch && <div className="my-4 flex justify-center"><SignGraphic sign={sign} size={150} /></div>}

      {!isMatch && (
        <div className="mt-4 flex flex-col gap-3" role="group" aria-label="Answer options">
          {perm.map((orig, i) => {
            const state = locked ? (orig === q.correctAnswer ? 'right' : selected === i ? 'wrong' : undefined) : undefined;
            return (
              <button key={orig} className="opt" data-sel={selected === i && !locked} data-state={state} aria-pressed={selected === i}
                disabled={locked} onClick={() => { play('tap', useStore.getState().settings.sound); setSelected(i); }}>
                {L.options[orig]}
              </button>
            );
          })}
        </div>
      )}

      {isMatch && (
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-3">
            {pairs.map(([left], i) => {
              const sg = left.startsWith('sign:') ? signById(left.slice(5)) : undefined;
              const linked = links[i] !== undefined;
              const done = locked ? (links[i] === i ? 'right' : 'wrong') : undefined;
              return (
                <button key={i} className="opt flex items-center justify-center !px-2 !py-2" data-sel={active === i} data-state={done}
                  style={linked && !locked ? { borderColor: LINK_COLORS[i % 4] } : undefined} aria-label={sg?.name ?? left} onClick={() => clickLeft(i)}>
                  {sg ? <SignGraphic sign={sg} size={64} /> : left}
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-3">
            {rightOrder.map(r => {
              const owner = Object.keys(links).find(k => links[+k] === r);
              const done = locked && owner !== undefined ? (+owner === r ? 'right' : 'wrong') : undefined;
              return (
                <button key={r} className="opt flex min-h-[80px] items-center justify-center !px-2 text-center !text-sm" data-state={done}
                  style={owner !== undefined && !locked ? { borderColor: LINK_COLORS[+owner % 4], background: LINK_COLORS[+owner % 4] + '22' } : undefined} onClick={() => clickRight(r)}>
                  {rightLabel(r)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex-1" />
      {!sheetOpen && (
        <div className="safe-b pt-4">
          <button className="btn" disabled={!ready} onClick={check}>{tr(lang, 'lesson.check')}</button>
        </div>
      )}
    </div>
  );
}
