import { useNavigate } from 'react-router-dom';
import Mascot from '../components/Mascot';
import { useStore } from '../lib/store';
import { tr } from '../lib/content';

export default function About() {
  const lang = useStore(s => s.settings.lang); const t = (k: string) => tr(lang, k);
  const nav = useNavigate();
  return (
    <div className="mx-auto max-w-md p-4 pb-10">
      <button className="muted mb-2 text-sm font-bold" onClick={() => nav(-1)}>← {t('lesson.back')}</button>
      <div className="flex items-center gap-3"><Mascot size={64} /><div><h1 className="text-2xl font-black">{t('app')}</h1><p className="muted text-sm">{t('tagline')}</p></div></div>
      <p className="mt-4 rounded-xl border-2 p-3 text-sm font-bold" style={{ borderColor: 'var(--line)' }}>{t('disclaimer')}</p>
      <h2 className="mt-6 text-lg font-black">{t('privacy.title')}</h2>
      <p className="mt-2 text-sm">{t('privacy.body')}</p>
      <p className="muted mt-6 text-xs">v0.1.0 (Phase 1 MVP). Sample questions are original practice items marked "unverified" until checked against official sources (see SOURCES.md).</p>
    </div>
  );
}
