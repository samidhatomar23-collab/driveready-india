import { NavLink } from 'react-router-dom';
import { useStore } from '../lib/store';
import { tr } from '../lib/content';

const tabs = [
  { to: '/', key: 'tab.learn', icon: '🛣️', end: true },
  { to: '/practice', key: 'tab.practice', icon: '🔁' },
  { to: '/test', key: 'tab.test', icon: '📝' },
  { to: '/signs', key: 'tab.signs', icon: '🛑' },
  { to: '/profile', key: 'tab.profile', icon: '🙂' }
];

export default function TabBar() {
  const lang = useStore(s => s.settings.lang);
  return (
    <nav aria-label="Main" className="safe-b fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md border-t-2" style={{ background: 'var(--card)', borderColor: 'var(--line)' }}>
      {tabs.map(t => (
        <NavLink key={t.to} to={t.to} end={t.end}
          className={({ isActive }) => `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-extrabold ${isActive ? 'text-teal-600' : 'muted'}`}>
          {({ isActive }) => (<>
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-xl ${isActive ? 'bg-teal-100 dark:bg-teal-900' : ''}`} aria-hidden>{t.icon}</span>
            {tr(lang, t.key)}
          </>)}
        </NavLink>
      ))}
    </nav>
  );
}
