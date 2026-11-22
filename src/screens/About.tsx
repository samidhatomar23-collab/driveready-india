import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { contactHref, CONTACT_EMAIL } from '../lib/contact';
import { useStore } from '../lib/store';
import { tr } from '../lib/content';

export default function About() {
  const lang = useStore(s => s.settings.lang); const t = (k: string) => tr(lang, k);
  const nav = useNavigate();
  return (
    <div className="mx-auto max-w-md p-4 pb-10">
      <button className="muted mb-2 text-sm font-bold" onClick={() => nav(-1)}>← {t('lesson.back')}</button>
      <Logo size={64} showNote /><p className="muted mt-2 text-sm">{t('tagline')}</p>
      <p className="mt-4 rounded-xl border-2 p-3 text-sm font-bold" style={{ borderColor: 'var(--line)' }}>{t('disclaimer')}</p>
      <section className="card mt-4" aria-label={t('contact.title')}>
        <h2 className="text-lg font-black">{t('contact.title')}</h2>
        <p className="mt-1 text-sm">{t('contact.body')}</p>
        <a className="btn mt-3 block text-center" href={contactHref()}>{t('contact.button')}</a>
        <p className="muted mt-2 break-all text-center text-xs font-bold">{CONTACT_EMAIL}</p>
      </section>
      <h2 className="mt-6 text-lg font-black">{t('privacy.title')}</h2>
      <p className="mt-2 text-sm">{t('privacy.body')}</p>
      <p className="muted mt-6 text-xs">v0.1.0 (Phase 1 MVP). Sample questions are original practice items marked "unverified" until checked against official sources (see SOURCES.md).</p>
    </div>
  );
}
