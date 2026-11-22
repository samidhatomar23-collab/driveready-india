import Pup from './Pup';
import type { MascotState } from '../lib/mascot';

/** Static decorative mascot used on non-quiz screens (same dog as the quiz companion). */
const MAP: Record<string, MascotState> = { happy: 'IDLE', sad: 'ENCOURAGING', cheer: 'EXCITED' };
export default function Mascot({ mood = 'happy', size = 96 }: { mood?: 'happy' | 'sad' | 'cheer'; size?: number }) {
  return <div role="img" aria-label="Pup, your study buddy" style={{ width: size, height: size }}><Pup state={MAP[mood]} size={size} className="pup-static" /></div>;
}
