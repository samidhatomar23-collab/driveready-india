// "Coney" - original traffic-cone mascot.
export default function Mascot({ mood = 'happy', size = 96 }: { mood?: 'happy' | 'sad' | 'cheer'; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Coney the traffic cone mascot">
      <ellipse cx="60" cy="108" rx="44" ry="8" fill="#000" opacity=".12" />
      <rect x="18" y="92" width="84" height="14" rx="7" fill="#09645f" />
      <path d="M60 10 28 94h64L60 10Z" fill="#ffb81f" />
      <path d="M49 36h22l5 14H44l5-14Z" fill="#fff" />
      <path d="M38 66h44l5 14H33l5-14Z" fill="#fff" />
      <circle cx="51" cy="56" r="5" fill="#14232b" /><circle cx="69" cy="56" r="5" fill="#14232b" />
      <circle cx="52.5" cy="54.5" r="1.6" fill="#fff" /><circle cx="70.5" cy="54.5" r="1.6" fill="#fff" />
      {mood === 'sad'
        ? <path d="M52 71q8-6 16 0" stroke="#14232b" strokeWidth="3" fill="none" strokeLinecap="round" />
        : <path d="M51 66q9 9 18 0" stroke="#14232b" strokeWidth="3" fill="none" strokeLinecap="round" />}
      {mood === 'cheer' && <><path d="M22 40l-8-8M98 40l8-8M60 2V-6" stroke="#f5a000" strokeWidth="4" strokeLinecap="round" /></>}
    </svg>
  );
}
