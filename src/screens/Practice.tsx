import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Mascot from '../components/Mascot';
import QuestionRunner from '../components/QuestionRunner';
import { loadAllQuestions, tr } from '../lib/content';
import { buildSession, eligible } from '../lib/session';
import { useStore } from '../lib/store';
import { play } from '../lib/sound';
import type { Question } from '../types';

export default function Practice() {
  const { settings, progress } = useStore();
  const lang = settings.lang; const t = (k: string) => tr(lang, k);
  const nav = useNavigate();
  const [all, setAll] = useState<Question[]>([]);
  useEffect(() => { loadAllQuestions().then(setAll); }, []);

  const now = Date.now();
  const due = useMemo(() => all.filter(q => progress.srs[q.id] && progress.srs[q.id].due <= now), [all, progress.srs, now]);
  const weak = useMemo(() => {
    const m = new Map<string, number>();
    all.forEach(q => { const w = progress.srs[q.id]?.wrong ?? 0; if (w > 0) m.set(q.topic, (m.get(q.topic) ?? 0) + w); });
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [all, progress.srs]);

  return (
    <div className="mx-auto max-w-md p-4 pb-28">
      <h1 className="text-2xl font-black">{t('practice.title')}</h1>
      <div className="card mt-4 flex items-center gap-4">
        <Mascot size={64} />
        <div className="flex-1">
          <p className="text-3xl font-black text-teal-600">{due.length}</p>
          <p className="muted text-sm font-bold">{t('practice.due')}</p>
        </div>
      </div>
      {due.length === 0 && <p className="muted mt-3 text-sm">{t('practice.none')}</p>}
      <button className="btn mt-4" disabled={due.length === 0} onClick={() => nav('/practice/session')}>{t('practice.start')}</button>

      <h2 className="mt-8 text-lg font-black">{t('practice.weak')}</h2>
      {weak.length === 0 ? <p className="muted mt-2 text-sm">{t('practice.noweak')}</p> : (
        <ul className="mt-2 flex flex-col gap-2">{weak.map(([topic, n]) => (
          <li key={topic} className="card flex items-center justify-between !py-3"><span className="font-bold">{topic}</span><span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-extrabold text-rose-600">{n}×</span></li>))}
        </ul>
      )}
    </div>
  );
}

export function PracticeSession() {
  const { settings, progress, gainHeart, addXp } = useStore();
  const nav = useNavigate();
  const [qs, setQs] = useState<Question[] | null>(null);
  const [done, setDone] = useState(false);
  useEffect(() => {
    loadAllQuestions().then(all => {
      const now = Date.now();
      const pool = eligible(all, settings).filter(q => progress.srs[q.id] && progress.srs[q.id].due <= now);
      setQs(buildSession(pool, 10));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const t = (k: string) => tr(settings.lang, k);
  if (!qs) return <div className="flex h-full items-center justify-center"><Mascot size={80} /></div>;
  if (done) return (
    <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center p-6 text-center">
      <Mascot mood="cheer" size={120} />
      <h1 className="mt-4 text-2xl font-black">{t('lesson.complete')}</h1>
      <p className="muted mt-1">+5 XP · +1 ❤</p>
      <button className="btn mt-6" onClick={() => nav('/practice', { replace: true })}>{t('lesson.back')}</button>
    </div>
  );
  return <QuestionRunner questions={qs} useHearts={false} onQuit={() => nav('/practice')} onFinish={() => { gainHeart(); addXp(5); play('win', settings.sound); setDone(true); }} />;
}
