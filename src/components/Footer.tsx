import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';
import { tr } from '../lib/content';

export default function Footer() {
  const lang = useStore(s => s.settings.lang);
  return (
    <footer className="muted mt-6 px-2 pb-4 text-center text-xs">
      <p>{tr(lang, 'disclaimer')}</p>
      <Link to="/about" className="mt-1 inline-block underline">{tr(lang, 'profile.about')}</Link>
    </footer>
  );
}
