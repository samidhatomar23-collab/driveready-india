import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignGraphic from '../components/SignGraphic';
import { getStateConfig, loadAllQuestions, localise, shuffle, signById, tr } from '../lib/content';
import { eligible } from '../lib/session';
import { useStore } from '../lib/store';
import type { Question, TestResult } from '../types';

// Real Test Mode: deliberately plain and serious (no mascot, no animation, no sounds).

export function TestIntro() {
  const { settings } = useStore();
  const lang = settings.lang; const t = (k: string) => tr(lang, k);
  const cfg = getStateConfig(settings.stateCode);
  const [agree, setAgree] = useState(false);
  const nav = useNavigate();
  const { questionCount, passMark, secondsPerQuestion } = cfg.llTest;
  return (
    <div className="mx-auto max-w-md p-4 pb-28">
      <h1 className="text-xl font-extrabold">{t('test.title')} - Learner's Licence</h1>
      <section className="mt-4 rounded-lg border p-4" style={{ borderColor: 'var(--line)' }}>
        <h2 className="font-bold">{t('test.rules')} {cfg.name}</h2>
        <dl className="mt-2 grid grid-cols-2 gap-y-1 text-sm">
          <dt>{t('test.questions')}</dt><dd className="font-bold">{questionCount}</dd>
          <dt>{t('test.pass')}</dt><dd className="font-bold">{passMark}</dd>
          <dt>{t('test.time')}</dt><dd className="font-bold">{secondsPerQuestion}s</dd>
        </dl>
        <p className="mt-3 rounded bg-amber-50 p-2 text-sm font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">{t('test.note')}</p>
        <p className="mt-2 text-xs text-rose-600">⚠ {t('test.unverified')}</p>
      </section>
      <section className="mt-4 rounded-lg border p-4 text-sm" style={{ borderColor: 'var(--line)' }}>
        <h2 className="font-bold">{t('test.instructions')}</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5">{['i1', 'i2', 'i3', 'i4'].map(k => <li key={k}>{t('test.' + k)}</li>)}</ol>
        <label className="mt-4 flex items-center gap-3 font-semibold">
          <input type="checkbox" className="h-5 w-5" checked={agree} onChange={e => setAgree(e.target.checked)} /> {t('test.agree')}
        </label>
      </section>
      <button className="mt-4 w-full rounded-lg bg-slate-800 py-3 font-bold text-white disabled:opacity-40" disabled={!agree} onClick={() => nav('/test/run')}>{t('test.begin')}</button>
    </div>
  );
}

interface Item { q: Question; perm: number[] }

export function TestRun() {
  const { settings, recordTest, setSettings } = useStore();
  const lang = settings.lang; const t = (k: string) => tr(lang, k);
  const cfg = getStateConfig(settings.stateCode);
  const nav = useNavigate();
  const [items, setItems] = useState<Item[] | null>(null);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [picked, setPicked] = useState<number | null>(null); // index in displayed order
  const [left, setLeft] = useState(cfg.llTest.secondsPerQuestion);
  const [confirm, setConfirm] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    loadAllQuestions().then(all => {
      const pool = eligible(all, settings).filter(q => q.verified && (q.type === 'mcq' || q.type === 'sign-id' || q.type === 'true-false'));
      const chosen = shuffle(pool).slice(0, cfg.llTest.questionCount);
      setItems(chosen.map(q => ({ q, perm: q.type === 'true-false' ? q.options.map((_, k) => k) : shuffle(q.options.map((_, k) => k)) })));
      startedAt.current = Date.now();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = items?.length ?? 0;
  const last = total > 0 && i === total - 1;

  const finish = (finalAnswers: (number | null)[]) => {
    const wrong: TestResult['wrong'] = []; let correct = 0;
    items!.forEach((it, k) => { const a = finalAnswers[k] ?? null; if (a === it.q.correctAnswer) correct++; else wrong.push({ questionId: it.q.id, chosen: a }); });
    const passMark = Math.min(cfg.llTest.passMark, total);
    const r: TestResult = { at: Date.now(), stateCode: cfg.code, total, correct, passMark, passed: correct >= passMark, seconds: Math.round((Date.now() - startedAt.current) / 1000), wrong };
    recordTest(r); setResult(r); setConfirm(false);
  };

  const advance = (ans: number | null) => {
    const next = [...answers]; next[i] = ans; setAnswers(next);
    if (last) { if (ans === null) finish(next); else setConfirm(true); return; }
    setI(i + 1); setPicked(null); setLeft(cfg.llTest.secondsPerQuestion);
  };

  // per-question countdown; on timeout auto-advance (auto-submit on final question)
  const advRef = useRef(advance); advRef.current = advance;
  useEffect(() => {
    if (!items || result || confirm) return;
    const id = setInterval(() => setLeft(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [items, i, result, confirm]);
  useEffect(() => {
    if (left <= 0 && items && !result && !confirm) {
      const it = items[i];
      advRef.current(picked === null ? null : it.perm[picked]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  if (!items) return <div className="p-6">Loading…</div>;
  if (total === 0) return <div className="p-6">{t('test.empty')}</div>;

  if (result) return <TestResultView r={result} items={items} onAgain={() => nav('/test', { replace: true })} />;

  const it = items[i]; const L = localise(it.q, lang); const sign = it.q.imageRef ? signById(it.q.imageRef) : undefined;
  return (
    <div className="mx-auto flex h-full max-w-md flex-col p-4">
      <header className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--line)' }}>
        <span className="font-bold">{t('test.questions')} {i + 1}/{total}</span>
        <button onClick={() => setSettings({ lang: lang === 'en' ? 'hi' : 'en' })} className="rounded border px-2 py-0.5 text-xs font-bold" style={{ borderColor: 'var(--line)' }}>{lang === 'en' ? 'हिं' : 'EN'}</button>
        <span className={`rounded px-2 py-1 font-mono font-bold ${left <= 5 ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-800'}`} role="timer" aria-label={`${Math.max(0, left)} seconds left`}>{String(Math.max(0, left)).padStart(2, '0')}s</span>
      </header>
      <main className="flex-1 overflow-y-auto py-4">
        <h1 className="text-lg font-bold">{L.question}</h1>
        {sign && <div className="my-4 flex justify-center"><SignGraphic sign={sign} size={130} /></div>}
        <div className="mt-4 flex flex-col gap-2" role="radiogroup">
          {it.perm.map((orig, k) => (
            <button key={orig} role="radio" aria-checked={picked === k} onClick={() => setPicked(k)}
              className={`w-full rounded-md border-2 px-3 py-3 text-left font-semibold ${picked === k ? 'border-slate-800 bg-slate-100 text-slate-900' : ''}`} style={picked === k ? undefined : { borderColor: 'var(--line)' }}>
              {L.options[orig]}
            </button>
          ))}
        </div>
      </main>
      <button className="w-full rounded-lg bg-slate-800 py-3 font-bold text-white disabled:opacity-40" disabled={picked === null} onClick={() => advance(it.perm[picked!])}>
        {last ? t('test.submit') : t('test.next')}
      </button>
      {confirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-6" role="alertdialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-lg p-5" style={{ background: 'var(--card)' }}>
            <h2 className="font-bold">{t('test.confirm')}</h2>
            <p className="muted mt-1 text-sm">{t('test.confirm.sub')}</p>
            <div className="mt-4 flex gap-3">
              <button className="flex-1 rounded-lg border py-2 font-bold" style={{ borderColor: 'var(--line)' }} onClick={() => setConfirm(false)}>{t('test.cancel')}</button>
              <button className="flex-1 rounded-lg bg-slate-800 py-2 font-bold text-white" onClick={() => finish(answers)}>{t('test.submit')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TestResultView({ r, items, onAgain }: { r: TestResult; items: Item[]; onAgain: () => void }) {
  const lang = useStore(s => s.settings.lang); const t = (k: string) => tr(lang, k);
  const byId = useMemo(() => new Map(items.map(it => [it.q.id, it.q])), [items]);
  const mm = Math.floor(r.seconds / 60), ss = r.seconds % 60;
  return (
    <div className="mx-auto h-full max-w-md overflow-y-auto p-4 pb-10">
      <h1 className="text-xl font-extrabold">{t('test.result')}</h1>
      <div className={`mt-3 rounded-lg p-4 text-center text-white ${r.passed ? 'bg-green-700' : 'bg-rose-700'}`}>
        <p className="text-2xl font-black">{r.passed ? t('test.passed') : t('test.failed')}</p>
        <p className="mt-1">{t('test.score')}: {r.correct}/{r.total} ({t('test.pass')}: {r.passMark})</p>
        <p className="text-sm opacity-90">{t('test.timetaken')}: {mm}m {String(ss).padStart(2, '0')}s</p>
      </div>
      <h2 className="mt-5 font-bold">{t('test.review')}</h2>
      {r.wrong.length === 0 && <p className="muted mt-2 text-sm">{t('test.allright')}</p>}
      <ul className="mt-2 flex flex-col gap-3">
        {r.wrong.map(w => {
          const q = byId.get(w.questionId)!; const L = localise(q, lang);
          return (
            <li key={w.questionId} className="rounded-lg border p-3 text-sm" style={{ borderColor: 'var(--line)' }}>
              <p className="font-bold">{L.question}</p>
              <p className="mt-1 text-rose-600">{t('test.yours')}: {w.chosen === null ? t('test.unanswered') : L.options[w.chosen]}</p>
              <p className="text-green-700 dark:text-green-400">{t('test.correct')}: {L.options[q.correctAnswer as number]}</p>
              <p className="mt-1">{L.explanation}</p>
              {q.ruleRef && <p className="muted mt-1 text-xs">{q.ruleRef}</p>}
              <p className="muted mt-1 text-xs">✔ {t('q.verified')} · <a className="underline" href={q.sourceUrl} target="_blank" rel="noreferrer">{q.sourceDoc}</a></p>
            </li>
          );
        })}
      </ul>
      <button className="mt-5 w-full rounded-lg bg-slate-800 py-3 font-bold text-white" onClick={onAgain}>{t('test.again')}</button>
    </div>
  );
}
