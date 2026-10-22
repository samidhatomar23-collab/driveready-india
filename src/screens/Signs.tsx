import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignGraphic from '../components/SignGraphic';
import QuestionRunner from '../components/QuestionRunner';
import Mascot from '../components/Mascot';
import { Sheet } from '../components/Sheet';
import { makeSignQuiz, signs, tr } from '../lib/content';
import { useStore } from '../lib/store';
import type { Sign } from '../types';

type Mode = 'browse' | 'flash' | 'guess';
type Cat = 'all' | Sign['category'];

export default function Signs() {
  const lang = useStore(s => s.settings.lang); const t = (k: string) => tr(lang, k);
  const [mode, setMode] = useState<Mode>('browse');
  const [cat, setCat] = useState<Cat>('all');
  const [query, setQuery] = useState('');
  const [detail, setDetail] = useState<Sign | null>(null);
  const [quizKey, setQuizKey] = useState(0);
  const [score, setScore] = useState<null | { right: number; total: number }>(null);
  const nm = (s: Sign) => (lang === 'hi' ? s.name_hi ?? s.name : s.name);
  const mn = (s: Sign) => (lang === 'hi' ? s.meaning_hi ?? s.meaning : s.meaning);

  const list = useMemo(() => signs.filter(s => (cat === 'all' || s.category === cat) &&
    (!query.trim() || (s.name + ' ' + (s.name_hi ?? '') + ' ' + s.meaning).toLowerCase().includes(query.trim().toLowerCase()))), [cat, query]);

  const quiz = useMemo(() => makeSignQuiz(10), [quizKey]);

  if (mode === 'guess' && !score) {
    return <div className="fixed inset-0 z-30" style={{ background: 'var(--bg)' }}>
      <QuestionRunner key={quizKey} questions={quiz} useHearts={false} onQuit={() => setMode('browse')} onFinish={r => setScore({ right: r.firstTryCorrect, total: r.total })} />
    </div>;
  }
  if (mode === 'guess' && score) {
    return (
      <div className="fixed inset-0 z-30 flex flex-col items-center justify-center p-6 text-center" style={{ background: 'var(--bg)' }}>
        <Mascot mood="cheer" size={120} />
        <h1 className="mt-4 text-3xl font-black">{score.right}/{score.total}</h1>
        <button className="btn mt-6 max-w-xs" onClick={() => { setScore(null); setQuizKey(k => k + 1); }}>{t('signs.guess')}</button>
        <button className="btn btn-ghost mt-3 max-w-xs" onClick={() => { setScore(null); setMode('browse'); }}>{t('signs.browse')}</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md p-4 pb-28">
      <h1 className="text-2xl font-black">{t('signs.title')}</h1>
      <div className="mt-3 flex gap-2" role="tablist">
        {(['browse', 'flash'] as const).map(m => (
          <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={`flex-1 rounded-xl border-2 py-2 text-sm font-extrabold ${mode === m ? 'border-teal-400 bg-teal-50 text-teal-700' : ''}`} style={mode === m ? undefined : { borderColor: 'var(--line)' }}>
            {t('signs.' + m)}
          </button>
        ))}
        <button className="flex-1 rounded-xl border-2 border-amber-400 bg-amber-50 py-2 text-sm font-extrabold text-amber-700" onClick={() => { setScore(null); setQuizKey(k => k + 1); setMode('guess'); }}>{t('signs.guess')}</button>
      </div>

      <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={t('signs.search')} aria-label={t('signs.search')}
        className="mt-3 w-full rounded-xl border-2 px-4 py-3 font-semibold" style={{ background: 'var(--card)', borderColor: 'var(--line)' }} />
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {(['all', 'mandatory', 'cautionary', 'informatory'] as const).map(c => (
          <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={`whitespace-nowrap rounded-full border-2 px-3 py-1 text-xs font-extrabold ${cat === c ? 'border-teal-500 bg-teal-500 text-white' : ''}`} style={cat === c ? undefined : { borderColor: 'var(--line)' }}>{t('signs.' + c)}</button>
        ))}
      </div>

      {mode === 'browse' && (
        <ul className="mt-4 grid grid-cols-3 gap-3">
          {list.map(s => (
            <li key={s.id}>
              <button onClick={() => setDetail(s)} className="card flex w-full flex-col items-center gap-1 !p-2">
                <SignGraphic sign={s} size={72} />
                <span className="text-center text-[11px] font-extrabold leading-tight">{nm(s)}</span>
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="muted col-span-3 text-center text-sm">No signs found.</li>}
        </ul>
      )}
      {mode === 'flash' && <Flashcards list={list} nm={nm} mn={mn} t={t} />}

      <Sheet open={!!detail} onClose={() => setDetail(null)} label="Sign detail">
        {detail && (
          <div className="flex flex-col items-center text-center">
            <SignGraphic sign={detail} size={140} />
            <h2 className="mt-2 text-xl font-black">{nm(detail)}</h2>
            <p className="text-xs font-extrabold uppercase text-teal-600">{t('signs.' + detail.category)}</p>
            <p className="mt-2 text-sm font-semibold">{mn(detail)}</p>
            <p className="muted mt-2 text-xs">{detail.verified ? `✔ ${t('signs.verified')} (${detail.sourceDoc.split(' - ')[1] ?? ''})` : `⚠ ${t('signs.unverified')}`}</p>
            {detail.imagePlaceholder && <p className="muted mt-1 text-xs">{t('signs.placeholder')}</p>}
            <button className="btn mt-4" onClick={() => setDetail(null)}>OK</button>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function Flashcards({ list, nm, mn, t }: { list: Sign[]; nm: (s: Sign) => string; mn: (s: Sign) => string; t: (k: string) => string }) {
  const [i, setI] = useState(0); const [flip, setFlip] = useState(false);
  if (list.length === 0) return null;
  const s = list[Math.min(i, list.length - 1)];
  const go = (d: number) => { setFlip(false); setI((i + d + list.length) % list.length); };
  return (
    <div className="mt-5 flex flex-col items-center">
      <button onClick={() => setFlip(f => !f)} aria-label={t('signs.tapflip')} className="card flex min-h-[260px] w-full flex-col items-center justify-center gap-3 text-center">
        {!flip ? <SignGraphic sign={s} size={150} /> : (<><h2 className="text-2xl font-black">{nm(s)}</h2><p className="text-sm font-semibold">{mn(s)}</p></>)}
      </button>
      <p className="muted mt-2 text-xs">{t('signs.tapflip')} · {Math.min(i, list.length - 1) + 1}/{list.length}</p>
      <div className="mt-3 flex w-full gap-3"><button className="btn btn-ghost" onClick={() => go(-1)}>{t('signs.prev')}</button><button className="btn" onClick={() => go(1)}>{t('signs.next')}</button></div>
    </div>
  );
}
