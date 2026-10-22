import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Mascot from '../components/Mascot';
import { dayKey, levelOf, useStore } from '../lib/store';
import { getStateConfig, states, tr } from '../lib/content';
import type { VehicleClass } from '../types';

const VEHICLES: VehicleClass[] = ['two-wheeler', 'motorcycle-gear', 'car', 'both'];

export default function Profile() {
  const { settings, progress, setSettings, resetAll } = useStore();
  const lang = settings.lang; const t = (k: string) => tr(lang, k);

  const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return { k: dayKey(d), label: d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'narrow' }) }; });
  const maxXp = Math.max(settings.dailyGoalXp, ...week.map(w => progress.xpByDay[w.k] ?? 0));
  const lessonsDone = Object.values(progress.nodes).filter(n => n.completed).length;

  const Toggle = ({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) => (
    <label className="flex items-center justify-between py-2 font-bold">{label}
      <input type="checkbox" role="switch" className="h-6 w-6 accent-teal-600" checked={on} onChange={e => onChange(e.target.checked)} /></label>
  );
  const select = 'w-full rounded-xl border-2 px-3 py-3 font-bold';

  return (
    <div className="mx-auto max-w-md p-4 pb-28">
      <div className="flex items-center gap-4"><Mascot size={72} /><div><h1 className="text-2xl font-black">{t('profile.title')}</h1><p className="muted text-sm font-bold">{getStateConfig(settings.stateCode).name} · {t('veh.' + settings.vehicleClass)}</p></div></div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {[['🔥', progress.streak, t('stat.streak')], ['⚡', progress.xp, t('stat.xp')], ['⭐', levelOf(progress.xp), t('stat.level')], ['❤', progress.hearts, t('stat.hearts')]].map(([ic, v, l]) => (
          <div key={String(l)} className="card !p-3"><p className="text-2xl font-black">{ic} {v}</p><p className="muted text-xs font-bold">{l}</p></div>))}
      </div>
      <p className="muted mt-2 text-xs">{t('streak.freeze')}: {progress.streakFreezes} · ✔ {lessonsDone}</p>

      <section className="card mt-4" aria-label={t('profile.week')}>
        <h2 className="font-black">{t('profile.week')}</h2>
        <div className="mt-3 flex h-24 items-end gap-2">
          {week.map(w => { const v = progress.xpByDay[w.k] ?? 0; return (
            <div key={w.k} className="flex flex-1 flex-col items-center gap-1" title={`${v} XP`}>
              <div className="w-full rounded-t-md bg-teal-400" style={{ height: `${Math.max(4, (v / maxXp) * 80)}px`, opacity: v ? 1 : 0.3 }} />
              <span className="muted text-[10px] font-bold">{w.label}</span>
            </div>); })}
        </div>
      </section>

      <section className="card mt-4">
        <h2 className="mb-2 font-black">{t('profile.history')}</h2>
        {progress.testHistory.length === 0 ? <p className="muted text-sm">{t('profile.nohistory')}</p> : (
          <ul className="flex flex-col gap-2 text-sm">{progress.testHistory.slice(0, 5).map(r => (
            <li key={r.at} className="flex items-center justify-between"><span>{new Date(r.at).toLocaleDateString()}</span><span className="font-bold">{r.correct}/{r.total}</span>
              <span className={`rounded px-2 text-xs font-extrabold ${r.passed ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>{r.passed ? t('test.passed') : t('test.failed')}</span></li>))}
          </ul>)}
      </section>

      <section className="card mt-4">
        <h2 className="mb-2 font-black">{t('profile.settings')}</h2>
        <label className="mb-1 block text-sm font-bold">{t('onb.state')}</label>
        <select className={select} style={{ background: 'var(--card)', borderColor: 'var(--line)' }} value={settings.stateCode} onChange={e => setSettings({ stateCode: e.target.value })}>
          {states.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}</select>
        <label className="mb-1 mt-3 block text-sm font-bold">{t('onb.vehicle')}</label>
        <select className={select} style={{ background: 'var(--card)', borderColor: 'var(--line)' }} value={settings.vehicleClass} onChange={e => setSettings({ vehicleClass: e.target.value as VehicleClass })}>
          {VEHICLES.map(v => <option key={v} value={v}>{t('veh.' + v)}</option>)}</select>
        <label className="mb-1 mt-3 block text-sm font-bold">{t('onb.language')}</label>
        <select className={select} style={{ background: 'var(--card)', borderColor: 'var(--line)' }} value={settings.lang} onChange={e => setSettings({ lang: e.target.value as 'en' | 'hi' })}>
          <option value="en">English</option><option value="hi">हिन्दी</option></select>
        <label className="mb-1 mt-3 block text-sm font-bold">{t('onb.goal')}</label>
        <select className={select} style={{ background: 'var(--card)', borderColor: 'var(--line)' }} value={settings.dailyGoalXp} onChange={e => setSettings({ dailyGoalXp: +e.target.value })}>
          {[10, 20, 30, 50].map(g => <option key={g} value={g}>{g} XP</option>)}</select>
        <div className="mt-2">
          <Toggle label={t('profile.sound')} on={settings.sound} onChange={v => setSettings({ sound: v })} />
          <Toggle label={t('profile.dark')} on={settings.dark} onChange={v => setSettings({ dark: v })} />
          <Toggle label={t('profile.large')} on={settings.largeText} onChange={v => setSettings({ largeText: v })} />
        </div>
      </section>

      <Link to="/about" className="btn btn-ghost mt-4 block text-center">{t('profile.about')}</Link>
      <button className="btn btn-red mt-3" onClick={() => { if (confirm(t('profile.reset.confirm'))) void resetAll().then(() => location.assign('/')); }}>{t('profile.reset')}</button>
      <Footer />
    </div>
  );
}
