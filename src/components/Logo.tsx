import { useStore } from '../lib/store';
import { tr } from '../lib/content';
import Pup from './Pup';

/** App logo lockup: Pup + name + "AD-FREE" badge. */
export default function Logo({ size = 44, showNote = false }: { size?: number; showNote?: boolean }) {
  const lang = useStore(s => s.settings.lang);
  return (
    <div className="flex items-center gap-3" role="img" aria-label={`${tr(lang, 'app')} - ${tr(lang, 'badge.adfree')}`}>
      <Pup size={size} />
      <div className="min-w-0">
        <p className="text-xl font-black leading-tight">{tr(lang, 'app')}</p>
        <span className="mt-0.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide text-white" style={{ background: '#0f9d94' }}>
          <span aria-hidden="true">✓</span>{tr(lang, 'badge.adfree')}
        </span>
        {showNote && <p className="muted mt-1 text-xs font-bold">{tr(lang, 'adfree.note')}</p>}
      </div>
    </div>
  );
}
