import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import QuestionRunner, { type RunResult } from '../components/QuestionRunner';
import Mascot from '../components/Mascot';
import { loadUnitQuestions, tr, units } from '../lib/content';
import { buildSession, eligible } from '../lib/session';
import { useStore } from '../lib/store';
import { play } from '../lib/sound';
import type { Question } from '../types';

export default function Lesson() {
  const { lessonId = '' } = useParams();
  const nav = useNavigate();
  const { settings, completeLesson } = useStore();
  const lang = settings.lang; const t = (k: string) => tr(lang, k);
  const unit = units.find(u => u.lessons.some(l => l.id === lessonId));
  const lesson = unit?.lessons.find(l => l.id === lessonId);
  const [qs, setQs] = useState<Question[] | null>(null);
  const [blocked, setBlocked] = useState<boolean | null>(null);
  const [result, setResult] = useState<(RunResult & { xp: number; stars: number }) | null>(null);

  useEffect(() => {
    setBlocked(false);
    if (!unit || !lesson) return;
    loadUnitQuestions(unit.id).then(all => {
      const pool = eligible(lesson.checkpoint ? all : all.filter(q => q.lessonId === lesson.id), settings);
      setQs(buildSession(pool, lesson.perSession));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  if (!unit || !lesson) return <div className="p-6">{t('lesson.nf')}</div>;

  if (!qs || blocked === null) return <div className="flex h-full items-center justify-center"><Mascot size={80} /></div>;

  if (result) {
    return (
      <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.4, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 12 }}><Mascot mood="cheer" size={140} /></motion.div>
        <Confetti />
        <h1 className="mt-4 text-3xl font-black">{t('lesson.complete')}</h1>
        <p className="mt-2 text-3xl text-amber-500" aria-label={`${result.stars} stars`}>{'★'.repeat(result.stars)}{'☆'.repeat(3 - result.stars)}</p>
        <div className="mt-5 flex w-full gap-3">
          <div className="card flex-1"><p className="text-xs font-extrabold uppercase text-amber-500">{t('stat.xp')}</p><p className="text-2xl font-black">+{result.xp}</p></div>
          <div className="card flex-1"><p className="text-xs font-extrabold uppercase text-teal-600">{t('stat.accuracy')}</p><p className="text-2xl font-black">{Math.round((result.firstTryCorrect / Math.max(1, result.total)) * 100)}%</p></div>
        </div>
        <button className="btn mt-8" onClick={() => nav('/')}>{t('lesson.back')}</button>
      </div>
    );
  }

  return (
    <div className="h-full">
      <QuestionRunner questions={qs} useHearts={false} onQuit={() => nav('/')} onFinish={r => {
        const xp = 5 + r.firstTryCorrect * 2 + (r.wrongIds.length === 0 ? 5 : 0) + (lesson.checkpoint ? 10 : 0);
        const { stars } = completeLesson(lesson.id, r.firstTryCorrect, r.total, xp);
        play('win', settings.sound);
        setResult({ ...r, xp, stars });
      }} />
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 24 }, (_, i) => i);
  const colors = ['#0f9d94', '#f5a000', '#e0566b', '#8a5cf6'];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {pieces.map(i => (
        <motion.span key={i} className="absolute top-0 h-3 w-2 rounded-sm" style={{ left: `${(i * 37) % 100}%`, background: colors[i % 4] }}
          initial={{ y: -20, rotate: 0, opacity: 1 }} animate={{ y: '100vh', rotate: 360 + i * 20, opacity: 0.8 }} transition={{ duration: 2 + (i % 5) * 0.3, delay: (i % 6) * 0.08, ease: 'easeIn' }} />
      ))}
    </div>
  );
}
