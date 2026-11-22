import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Mascot from '../components/Mascot';
import { LANG_LABELS, states, tr } from '../lib/content';
import { useStore } from '../lib/store';
import type { Lang, VehicleClass } from '../types';

const VEHICLES: VehicleClass[] = ['two-wheeler', 'motorcycle-gear', 'car', 'both'];
const GOALS = [{ xp: 10, k: 'goal.casual' }, { xp: 20, k: 'goal.regular' }, { xp: 30, k: 'goal.serious' }, { xp: 50, k: 'goal.intense' }];
const LANGS: { code: Lang; label: string }[] = (Object.keys(LANG_LABELS) as Lang[]).map(code => ({ code, label: LANG_LABELS[code].full }));

export default function Onboarding() {
  const { settings, setSettings } = useStore();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const lang = settings.lang;
  const t = (k: string) => tr(lang, k);
  const list = states.filter(s => s.code !== 'default');

  const steps = [
    { title: t('onb.language'), body: (
      <div className="flex flex-col gap-3">{LANGS.map(l => (
        <button key={l.code} className="opt" data-sel={lang === l.code} aria-pressed={lang === l.code} onClick={() => setSettings({ lang: l.code })}>{l.label}</button>))}
      </div>) },
    { title: t('onb.state'), body: (
      <div className="flex max-h-[48vh] flex-col gap-3 overflow-y-auto pr-1">{[...list, states.find(s => s.code === 'default')!].map(s => (
        <button key={s.code} className="opt" data-sel={settings.stateCode === s.code} aria-pressed={settings.stateCode === s.code} onClick={() => setSettings({ stateCode: s.code })}>{s.name}</button>))}
      </div>) },
    { title: t('onb.vehicle'), body: (
      <div className="flex flex-col gap-3">{VEHICLES.map(v => (
        <button key={v} className="opt" data-sel={settings.vehicleClass === v} aria-pressed={settings.vehicleClass === v} onClick={() => setSettings({ vehicleClass: v })}>{t('veh.' + v)}</button>))}
      </div>) },
    { title: t('onb.goal'), body: (
      <div className="flex flex-col gap-3">{GOALS.map(g => (
        <button key={g.xp} className="opt" data-sel={settings.dailyGoalXp === g.xp} aria-pressed={settings.dailyGoalXp === g.xp} onClick={() => setSettings({ dailyGoalXp: g.xp })}>{t(g.k)}</button>))}
      </div>) }
  ];
  const last = step === steps.length - 1;

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col p-5">
      <div className="flex flex-col items-center pt-4 text-center">
        <Mascot mood="cheer" size={step === 0 ? 120 : 72} />
        {step === 0 && <><h1 className="mt-2 text-2xl font-black">{t('onb.welcome')}</h1><p className="muted">{t('onb.sub')}</p><span className="mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold tracking-wide text-white" style={{ background: '#0f9d94' }}><span aria-hidden="true">✓</span>{t('badge.adfree')}</span></>}
      </div>
      <motion.section key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex-1">
        <h2 className="mb-3 text-xl font-black">{steps[step].title}</h2>
        {steps[step].body}
      </motion.section>
      <div className="safe-b mt-5 flex flex-col gap-3">
        <button className="btn" onClick={() => { if (last) { setSettings({ onboarded: true }); nav('/', { replace: true }); } else setStep(step + 1); }}>
          {last ? t('onb.start') : t('onb.next')}
        </button>
        {step > 0 && <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>←</button>}
      </div>
    </div>
  );
}
