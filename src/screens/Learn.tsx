import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { dayKey, levelOf, useStore } from '../lib/store';
import { tr, units } from '../lib/content';
import { Sheet } from '../components/Sheet';
import Footer from '../components/Footer';
import type { Lesson, Unit } from '../types';

export default function Learn() {
  const { settings, progress } = useStore();
  const lang = settings.lang; const t = (k: string) => tr(lang, k);
  const nav = useNavigate();
  const [open, setOpen] = useState<{ lesson: Lesson; unit: Unit; unlocked: boolean } | null>(null);

  // global ordered list of lesson nodes in available units
  const order = useMemo(() => units.filter(u => u.available).flatMap(u => u.lessons.map(l => ({ unit: u, lesson: l }))), []);
  const isUnlocked = (lessonId: string) => {
    const i = order.findIndex(o => o.lesson.id === lessonId);
    return i <= 0 || !!progress.nodes[order[i - 1].lesson.id]?.completed;
  };

  const today = progress.xpByDay[dayKey()] ?? 0;
  const goalPct = Math.min(100, Math.round((today / settings.dailyGoalXp) * 100));

  return (
    <div className="mx-auto max-w-md pb-28">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b-2 px-4 py-3" style={{ background: 'var(--bg)', borderColor: 'var(--line)' }}>
        <span className="font-black text-amber-500" aria-label={`${progress.streak} day streak`}>🔥 {progress.streak}</span>
        <span className="font-black text-teal-600" aria-label={`Level ${levelOf(progress.xp)}`}>⭐ {t('stat.level')} {levelOf(progress.xp)}</span>
        <span className="font-black text-rose-500" aria-label={`${progress.hearts} hearts`}>❤ {progress.hearts}</span>
      </header>

      <div className="card mx-4 mt-4">
        <div className="flex items-center justify-between text-sm font-extrabold"><span>{t('profile.goaltoday')}</span><span>{today}/{settings.dailyGoalXp} XP</span></div>
        <div className="mt-2 h-3 overflow-hidden rounded-full" style={{ background: 'var(--line)' }}><div className="h-full rounded-full bg-amber-400" style={{ width: `${goalPct}%` }} /></div>
      </div>

      {units.map(u => (
        <section key={u.id} className="mt-6 px-4" aria-label={u.title}>
          <div className="rounded-2xl px-4 py-3 text-white" style={{ background: u.color, opacity: u.available ? 1 : 0.55 }}>
            <p className="text-lg font-black">{u.icon} {lang === 'hi' ? u.title_hi ?? u.title : u.title}</p>
            {!u.available && <p className="text-xs font-bold opacity-90">{t('learn.soon')}</p>}
          </div>
          {u.available && (
            <ol className="mt-4 flex flex-col items-center gap-5">
              {u.lessons.map((l, i) => {
                const np = progress.nodes[l.id]; const unlocked = isUnlocked(l.id); const done = !!np?.completed;
                const offset = [0, 38, 0, -38][i % 4];
                return (
                  <li key={l.id} style={{ transform: `translateX(${offset}px)` }}>
                    <motion.button whileTap={{ scale: 0.94 }} aria-label={`${lang === 'hi' ? l.title_hi ?? l.title : l.title}${unlocked ? '' : ' - ' + t('learn.locked')}`}
                      onClick={() => setOpen({ lesson: l, unit: u, unlocked })}
                      className="flex h-[76px] w-[76px] items-center justify-center rounded-full text-3xl text-white"
                      style={{ background: !unlocked ? '#a9b8bf' : done ? '#f5a000' : u.color, boxShadow: `0 6px 0 0 ${!unlocked ? '#7d8d95' : done ? '#9a6200' : '#0006'}` }}>
                      {!unlocked ? '🔒' : l.checkpoint ? '🏆' : done ? '★' : '▶'}
                    </motion.button>
                    {done && <p className="mt-1 text-center text-sm text-amber-500" aria-label={`${np.stars} stars`}>{'★'.repeat(np.stars)}{'☆'.repeat(3 - np.stars)}</p>}
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      ))}
      <Footer />

      <Sheet open={!!open} onClose={() => setOpen(null)} label="Lesson">
        {open && (<div>
          <p className="text-xs font-extrabold uppercase text-teal-600">{open.lesson.checkpoint ? t('learn.checkpoint') : (lang === 'hi' ? open.unit.title_hi : open.unit.title)}</p>
          <h2 className="text-xl font-black">{lang === 'hi' ? open.lesson.title_hi ?? open.lesson.title : open.lesson.title}</h2>
          <p className="muted text-sm">{open.lesson.perSession} {t('test.questions').toLowerCase()}</p>
          {open.unlocked
            ? <button className="btn mt-4" onClick={() => nav(`/lesson/${open.lesson.id}`)}>{t('learn.start')}</button>
            : <p className="mt-4 rounded-xl p-3 text-sm font-bold" style={{ background: 'var(--soft)' }}>🔒 {t('learn.locked')}</p>}
        </div>)}
      </Sheet>
    </div>
  );
}
