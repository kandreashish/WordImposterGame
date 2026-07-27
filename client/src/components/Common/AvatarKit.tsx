import React from 'react';

export interface AvatarDef {
  id: string;
  label: string;
  /** Either an image path (under /avatars/) or an SVG render */
  type: 'img' | 'svg';
  src?: string;          // for type=img
  Render?: React.FC<{ size: number }>; // for type=svg
}

/* ─────────────────────────────────────────
   SVG Avatar Components
───────────────────────────────────────── */

const Ghost: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#1e1b4b"/>
    {/* Body */}
    <path d="M25 65 Q25 30 50 28 Q75 30 75 65 L75 80 Q68 74 63 80 Q58 74 55 80 Q50 74 45 80 Q40 74 37 80 Q32 74 25 80 Z" fill="#e2e8f0"/>
    {/* Eyes - derpy cross-eyed */}
    <ellipse cx="40" cy="55" rx="8" ry="9" fill="white"/>
    <ellipse cx="60" cy="55" rx="8" ry="9" fill="white"/>
    <circle cx="43" cy="56" r="4" fill="#1e293b"/>
    <circle cx="57" cy="56" r="4" fill="#1e293b"/>
    <circle cx="44" cy="54" r="1.5" fill="white"/>
    <circle cx="58" cy="54" r="1.5" fill="white"/>
    {/* Silly grin */}
    <path d="M38 68 Q50 80 62 68" stroke="#94a3b8" strokeWidth="2.5" fill="#7c3aed" strokeLinecap="round"/>
    {/* Blush */}
    <ellipse cx="33" cy="63" rx="5" ry="3" fill="#f472b6" opacity="0.5"/>
    <ellipse cx="67" cy="63" rx="5" ry="3" fill="#f472b6" opacity="0.5"/>
    {/* Tiny sunglasses on forehead */}
    <rect x="36" y="44" width="10" height="5" rx="2" fill="#0f172a" stroke="#fbbf24" strokeWidth="1"/>
    <rect x="54" y="44" width="10" height="5" rx="2" fill="#0f172a" stroke="#fbbf24" strokeWidth="1"/>
    <line x1="46" y1="46.5" x2="54" y2="46.5" stroke="#fbbf24" strokeWidth="1"/>
  </svg>
);

const Panda: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#0f172a"/>
    {/* Ears */}
    <circle cx="28" cy="28" r="13" fill="#1e293b"/>
    <circle cx="72" cy="28" r="13" fill="#1e293b"/>
    <circle cx="28" cy="28" r="7" fill="#334155"/>
    <circle cx="72" cy="28" r="7" fill="#334155"/>
    {/* Head */}
    <circle cx="50" cy="55" r="32" fill="#f1f5f9"/>
    {/* Eye patches */}
    <ellipse cx="37" cy="48" rx="10" ry="11" fill="#1e293b" transform="rotate(-15 37 48)"/>
    <ellipse cx="63" cy="48" rx="10" ry="11" fill="#1e293b" transform="rotate(15 63 48)"/>
    {/* Eyes - derpy */}
    <ellipse cx="36" cy="47" rx="5.5" ry="6" fill="white"/>
    <ellipse cx="64" cy="47" rx="5.5" ry="6" fill="white"/>
    <circle cx="34" cy="48" r="3" fill="#1e293b"/>
    <circle cx="66" cy="46" r="3" fill="#1e293b"/>
    <circle cx="33" cy="47" r="1" fill="white"/>
    <circle cx="65" cy="45" r="1" fill="white"/>
    {/* Snout */}
    <ellipse cx="50" cy="61" rx="11" ry="8" fill="#e2e8f0"/>
    <ellipse cx="50" cy="57" rx="5" ry="3" fill="#1e293b"/>
    {/* Bamboo from mouth */}
    <rect x="54" y="62" width="4" height="20" rx="2" fill="#4ade80"/>
    <ellipse cx="56" cy="62" rx="2.5" ry="1.5" fill="#86efac"/>
    {/* Blush */}
    <ellipse cx="28" cy="62" rx="6" ry="4" fill="#f472b6" opacity="0.5"/>
    <ellipse cx="72" cy="62" rx="6" ry="4" fill="#f472b6" opacity="0.5"/>
    {/* Cowboy hat */}
    <rect x="32" y="20" width="36" height="7" rx="3" fill="#92400e"/>
    <ellipse cx="50" cy="20" rx="22" ry="4" fill="#78350f"/>
    <rect x="39" y="8" width="22" height="14" rx="4" fill="#92400e"/>
    <path d="M42 11 Q50 8 58 11" stroke="#fbbf24" strokeWidth="1.5" fill="none"/>
  </svg>
);

const Unicorn: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#2e1065"/>
    {/* Mane */}
    <ellipse cx="72" cy="48" rx="10" ry="28" fill="#f0abfc" transform="rotate(10 72 48)"/>
    <ellipse cx="68" cy="50" rx="7" ry="22" fill="#e879f9" transform="rotate(10 68 50)"/>
    {/* Head */}
    <ellipse cx="46" cy="54" rx="28" ry="26" fill="#fce7f3"/>
    {/* Horn */}
    <path d="M50 24 L44 42 L56 42 Z" fill="url(#hornGrad)"/>
    <defs>
      <linearGradient id="hornGrad" x1="50" y1="24" x2="50" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fbbf24"/>
        <stop offset="100%" stopColor="#f59e0b"/>
      </linearGradient>
    </defs>
    <line x1="50" y1="26" x2="47" y2="40" stroke="#fde68a" strokeWidth="1" opacity="0.6"/>
    {/* Eyes - big sparkly */}
    <ellipse cx="38" cy="52" rx="8" ry="9" fill="white"/>
    <ellipse cx="57" cy="50" rx="7" ry="8" fill="white"/>
    <circle cx="38" cy="53" r="5" fill="#7c3aed"/>
    <circle cx="57" cy="51" r="4" fill="#7c3aed"/>
    <circle cx="36" cy="51" r="2" fill="white"/>
    <circle cx="55" cy="49" r="1.5" fill="white"/>
    {/* Stars in eyes */}
    <text x="37" y="55" fontSize="4" fill="#fbbf24" textAnchor="middle">✦</text>
    {/* Nose */}
    <ellipse cx="46" cy="64" rx="7" ry="4" fill="#fbcfe8"/>
    <circle cx="44" cy="64" r="2" fill="#f472b6" opacity="0.7"/>
    <circle cx="48" cy="64" r="2" fill="#f472b6" opacity="0.7"/>
    {/* Silly grin */}
    <path d="M36 70 Q46 78 58 68" stroke="#ec4899" strokeWidth="2" fill="none" strokeLinecap="round"/>
    {/* Blush */}
    <ellipse cx="28" cy="60" rx="6" ry="4" fill="#f472b6" opacity="0.5"/>
    <ellipse cx="66" cy="56" rx="5" ry="3" fill="#f472b6" opacity="0.5"/>
  </svg>
);

const Lion: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#1c1917"/>
    {/* Mane */}
    {[0,30,60,90,120,150,180,210,240,270,300,330].map((angle, i) => (
      <ellipse key={i} cx={50 + 26 * Math.cos(angle * Math.PI/180)} cy={50 + 26 * Math.sin(angle * Math.PI/180)}
        rx="9" ry="12" fill={i % 2 === 0 ? '#b45309' : '#92400e'}
        transform={`rotate(${angle} ${50 + 26 * Math.cos(angle * Math.PI/180)} ${50 + 26 * Math.sin(angle * Math.PI/180)})`}/>
    ))}
    {/* Face */}
    <circle cx="50" cy="50" r="22" fill="#fbbf24"/>
    {/* Eyes */}
    <ellipse cx="42" cy="45" rx="6" ry="7" fill="white"/>
    <ellipse cx="58" cy="45" rx="6" ry="7" fill="white"/>
    <circle cx="43" cy="46" r="3.5" fill="#1c1917"/>
    <circle cx="59" cy="44" r="3.5" fill="#1c1917"/>
    <circle cx="42" cy="44" r="1.5" fill="white"/>
    <circle cx="58" cy="43" r="1.5" fill="white"/>
    {/* Snout */}
    <ellipse cx="50" cy="56" rx="9" ry="6" fill="#f97316"/>
    <ellipse cx="50" cy="53" rx="4" ry="2.5" fill="#1c1917"/>
    {/* Tongue out */}
    <path d="M44 60 Q50 72 56 60" fill="#ec4899" stroke="#be185d" strokeWidth="1"/>
    <line x1="50" y1="60" x2="50" y2="70" stroke="#be185d" strokeWidth="1"/>
    {/* Blush */}
    <ellipse cx="37" cy="56" rx="5" ry="3" fill="#f472b6" opacity="0.5"/>
    <ellipse cx="63" cy="56" rx="5" ry="3" fill="#f472b6" opacity="0.5"/>
    {/* Ears */}
    <path d="M32 30 L26 20 L38 26 Z" fill="#fbbf24"/>
    <path d="M68 30 L74 20 L62 26 Z" fill="#fbbf24"/>
  </svg>
);

const Frog: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#14532d"/>
    {/* Eye bulges */}
    <circle cx="33" cy="32" r="14" fill="#16a34a"/>
    <circle cx="67" cy="32" r="14" fill="#16a34a"/>
    <circle cx="33" cy="30" r="9" fill="white"/>
    <circle cx="67" cy="30" r="9" fill="white"/>
    <circle cx="35" cy="31" r="5" fill="#1c1917"/>
    <circle cx="65" cy="29" r="5" fill="#1c1917"/>
    <circle cx="33" cy="29" r="2" fill="white"/>
    <circle cx="63" cy="28" r="2" fill="white"/>
    {/* Head */}
    <ellipse cx="50" cy="58" rx="30" ry="25" fill="#22c55e"/>
    {/* Mouth - huge grin */}
    <path d="M25 62 Q50 85 75 62" fill="#15803d" stroke="#166534" strokeWidth="1.5"/>
    <path d="M28 62 Q50 78 72 62" fill="#f0fdf4"/>
    {/* Fly on tongue */}
    <ellipse cx="50" cy="72" rx="5" ry="2" fill="#fde047"/>
    <path d="M48 70 L44 66 M52 70 L56 66" stroke="#1c1917" strokeWidth="1.2"/>
    <circle cx="50" cy="70" r="2" fill="#1c1917"/>
    {/* Spots */}
    <circle cx="38" cy="65" r="4" fill="#16a34a" opacity="0.6"/>
    <circle cx="62" cy="65" r="4" fill="#16a34a" opacity="0.6"/>
    {/* Crown */}
    <path d="M35 45 L35 35 L42 40 L50 32 L58 40 L65 35 L65 45 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1"/>
    <circle cx="50" cy="33" r="2" fill="#ef4444"/>
    <circle cx="35" cy="36" r="2" fill="#3b82f6"/>
    <circle cx="65" cy="36" r="2" fill="#22c55e"/>
  </svg>
);

const Shark: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#0c4a6e"/>
    {/* Dorsal fin */}
    <path d="M50 18 L58 38 L42 38 Z" fill="#94a3b8"/>
    {/* Body */}
    <ellipse cx="50" cy="58" rx="32" ry="26" fill="#94a3b8"/>
    {/* Belly */}
    <ellipse cx="50" cy="62" rx="22" ry="16" fill="#f1f5f9"/>
    {/* Eyes */}
    <circle cx="38" cy="50" r="7" fill="white"/>
    <circle cx="62" cy="50" r="7" fill="white"/>
    <circle cx="39" cy="50" r="4" fill="#0f172a"/>
    <circle cx="63" cy="49" r="4" fill="#0f172a"/>
    <circle cx="38" cy="49" r="1.5" fill="white"/>
    <circle cx="62" cy="48" r="1.5" fill="white"/>
    {/* Eyebrow - menacing but goofy */}
    <path d="M32 44 Q38 41 44 44" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M56 43 Q62 40 68 43" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    {/* Big silly mouth */}
    <path d="M28 66 Q50 82 72 66" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1"/>
    {/* Teeth */}
    {[32,38,44,50,56,62,68].map((x, i) => (
      <path key={i} d={`M${x} 66 L${x+2} 73 L${x+4} 66`} fill="white" stroke="#cbd5e1" strokeWidth="0.5"/>
    ))}
    {/* Monocle */}
    <circle cx="62" cy="50" r="9" fill="none" stroke="#fbbf24" strokeWidth="2"/>
    <line x1="69" y1="55" x2="74" y2="60" stroke="#fbbf24" strokeWidth="2"/>
  </svg>
);

const Dino: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#134e4a"/>
    {/* Spikes */}
    {[35,42,50,58,65].map((x, i) => (
      <path key={i} d={`M${x} 32 L${x-4} 20 L${x+4} 20 Z`} fill={i % 2 === 0 ? '#f97316' : '#fbbf24'}/>
    ))}
    {/* Head */}
    <ellipse cx="50" cy="55" rx="28" ry="24" fill="#14b8a6"/>
    {/* Eye sockets */}
    <ellipse cx="39" cy="47" rx="9" ry="10" fill="#0d9488"/>
    <ellipse cx="61" cy="47" rx="9" ry="10" fill="#0d9488"/>
    {/* Eyes - massive and derpy */}
    <ellipse cx="39" cy="46" rx="7" ry="8" fill="white"/>
    <ellipse cx="61" cy="46" rx="7" ry="8" fill="white"/>
    <circle cx="41" cy="47" r="4.5" fill="#fbbf24"/>
    <circle cx="59" cy="45" r="4.5" fill="#fbbf24"/>
    <circle cx="41" cy="47" r="2" fill="#1c1917"/>
    <circle cx="59" cy="45" r="2" fill="#1c1917"/>
    <circle cx="40" cy="46" r="1" fill="white"/>
    <circle cx="58" cy="44" r="1" fill="white"/>
    {/* Nostrils */}
    <circle cx="47" cy="58" r="2" fill="#0d9488"/>
    <circle cx="53" cy="58" r="2" fill="#0d9488"/>
    {/* Goofy grin showing teeth */}
    <path d="M30 65 Q50 80 70 65" fill="#0d9488" stroke="#115e59" strokeWidth="1.5"/>
    <path d="M32 65 Q50 76 68 65" fill="white"/>
    <line x1="38" y1="65" x2="38" y2="74" stroke="#14b8a6" strokeWidth="2"/>
    <line x1="46" y1="65" x2="46" y2="76" stroke="#14b8a6" strokeWidth="2"/>
    <line x1="54" y1="65" x2="54" y2="76" stroke="#14b8a6" strokeWidth="2"/>
    <line x1="62" y1="65" x2="62" y2="74" stroke="#14b8a6" strokeWidth="2"/>
  </svg>
);

const Wizard: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#1e1b4b"/>
    {/* Wizard hat */}
    <path d="M30 45 L50 8 L70 45 Z" fill="#4c1d95"/>
    <rect x="22" y="43" width="56" height="8" rx="4" fill="#6d28d9"/>
    <circle cx="50" cy="8" r="4" fill="#fbbf24"/>
    <text x="42" y="40" fontSize="8" fill="#fbbf24">✦</text>
    <text x="52" y="35" fontSize="6" fill="#a78bfa">★</text>
    {/* Face */}
    <circle cx="50" cy="62" r="22" fill="#fde68a"/>
    {/* Big bushy eyebrows */}
    <path d="M35 53 Q42 49 47 53" stroke="#92400e" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <path d="M53 52 Q58 49 65 53" stroke="#92400e" strokeWidth="4" fill="none" strokeLinecap="round"/>
    {/* Eyes */}
    <circle cx="41" cy="57" r="5" fill="white"/>
    <circle cx="59" cy="57" r="5" fill="white"/>
    <circle cx="42" cy="57" r="3" fill="#7c3aed"/>
    <circle cx="58" cy="57" r="3" fill="#7c3aed"/>
    <circle cx="41" cy="56" r="1.2" fill="white"/>
    <circle cx="57" cy="56" r="1.2" fill="white"/>
    {/* Huge nose */}
    <ellipse cx="50" cy="65" rx="5" ry="4" fill="#f59e0b"/>
    {/* Long wavy beard */}
    <path d="M35 72 Q40 85 50 88 Q60 85 65 72" fill="#e2e8f0"/>
    <path d="M38 74 Q42 83 50 86 Q58 83 62 74" fill="white"/>
    {/* Blush */}
    <ellipse cx="34" cy="66" rx="5" ry="3" fill="#f472b6" opacity="0.4"/>
    <ellipse cx="66" cy="66" rx="5" ry="3" fill="#f472b6" opacity="0.4"/>
    {/* Wand spark */}
    <text x="65" y="75" fontSize="14">✨</text>
  </svg>
);

const Ninja: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#0f172a"/>
    {/* Headband */}
    <rect x="20" y="40" width="60" height="14" rx="3" fill="#1e293b"/>
    {/* Head wrap */}
    <path d="M20 45 Q50 35 80 45 L80 54 Q50 44 20 54 Z" fill="#334155"/>
    {/* Headband knot + flowing tails */}
    <rect x="72" y="40" width="6" height="14" rx="2" fill="#1e293b"/>
    <path d="M74 54 L80 70 Q82 75 78 73 L72 58" fill="#1e293b"/>
    <path d="M76 54 L82 65 Q85 70 80 70 L74 56" fill="#334155"/>
    {/* Face */}
    <circle cx="50" cy="60" r="22" fill="#fcd9b6"/>
    {/* Mask over lower face */}
    <path d="M28 62 Q50 72 72 62 L72 74 Q50 84 28 74 Z" fill="#1e293b"/>
    {/* Eyes - only visible, intense but with one winking */}
    <ellipse cx="41" cy="56" rx="7" ry="6" fill="white"/>
    {/* Winking eye */}
    <path d="M54 54 Q59 51 64 54" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M54 54 Q59 58 64 54" stroke="#fcd9b6" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    {/* Open eye */}
    <circle cx="41" cy="56" r="4" fill="#1e293b"/>
    <circle cx="40" cy="55" r="1.5" fill="white"/>
    {/* Scar */}
    <path d="M38 50 L44 54" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Stars floating */}
    <text x="15" y="35" fontSize="10" fill="#fbbf24">✦</text>
    <text x="75" y="32" fontSize="8" fill="#fbbf24">✦</text>
    <text x="20" y="70" fontSize="7" fill="#64748b">✦</text>
  </svg>
);

const Penguin: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#1e3a5f"/>
    {/* Body */}
    <ellipse cx="50" cy="62" rx="24" ry="26" fill="#1e293b"/>
    {/* Belly */}
    <ellipse cx="50" cy="65" rx="14" ry="18" fill="#f1f5f9"/>
    {/* Head */}
    <circle cx="50" cy="42" r="22" fill="#1e293b"/>
    {/* Face white patch */}
    <ellipse cx="50" cy="46" rx="13" ry="14" fill="#f1f5f9"/>
    {/* Eyes - massive derpy */}
    <circle cx="43" cy="40" r="7" fill="white"/>
    <circle cx="57" cy="40" r="7" fill="white"/>
    <circle cx="45" cy="41" r="4" fill="#1e293b"/>
    <circle cx="55" cy="39" r="4" fill="#1e293b"/>
    <circle cx="44" cy="40" r="1.5" fill="white"/>
    <circle cx="54" cy="38" r="1.5" fill="white"/>
    {/* Beak */}
    <path d="M45 50 L50 57 L55 50 Z" fill="#f59e0b"/>
    {/* Blush */}
    <ellipse cx="35" cy="47" rx="5" ry="3" fill="#f472b6" opacity="0.5"/>
    <ellipse cx="65" cy="47" rx="5" ry="3" fill="#f472b6" opacity="0.5"/>
    {/* Bowtie */}
    <path d="M43 57 L38 53 L38 61 Z" fill="#ef4444"/>
    <path d="M57 57 L62 53 L62 61 Z" fill="#ef4444"/>
    <circle cx="50" cy="57" r="3" fill="#dc2626"/>
    {/* Top hat */}
    <rect x="35" y="18" width="30" height="6" rx="2" fill="#1e293b" stroke="#f1f5f9" strokeWidth="1"/>
    <rect x="40" y="6" width="20" height="14" rx="2" fill="#1e293b" stroke="#f1f5f9" strokeWidth="1"/>
  </svg>
);

const Vampire: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#1a0a2e"/>
    {/* Cape collar */}
    <path d="M20 75 L30 50 L50 58 L70 50 L80 75 Q50 95 20 75 Z" fill="#1e293b"/>
    <path d="M30 50 L50 60 L70 50 L65 72 Q50 80 35 72 Z" fill="#7c3aed"/>
    {/* Head */}
    <ellipse cx="50" cy="50" r="22" fill="#e2d9f0"/>
    {/* Hair */}
    <path d="M28 44 Q30 28 50 25 Q70 28 72 44 L68 46 Q60 32 50 32 Q40 32 32 46 Z" fill="#1e293b"/>
    {/* Widow's peak */}
    <path d="M46 32 L50 24 L54 32 Q50 28 46 32 Z" fill="#1e293b"/>
    {/* Eyes - red glowing */}
    <ellipse cx="40" cy="48" rx="7" ry="6" fill="white"/>
    <ellipse cx="60" cy="48" rx="7" ry="6" fill="white"/>
    <circle cx="41" cy="48" r="4" fill="#dc2626"/>
    <circle cx="59" cy="48" r="4" fill="#dc2626"/>
    <circle cx="40" cy="47" r="1.5" fill="#fca5a5"/>
    <circle cx="58" cy="47" r="1.5" fill="#fca5a5"/>
    {/* Fangs grin */}
    <path d="M35 60 Q50 72 65 60" fill="#e2d9f0" stroke="#c4b5d4" strokeWidth="1"/>
    <path d="M44 61 L42 70 L46 61" fill="white" stroke="#c4b5d4" strokeWidth="0.5"/>
    <path d="M56 61 L54 70 L58 61" fill="white" stroke="#c4b5d4" strokeWidth="0.5"/>
    {/* Blood drip */}
    <path d="M46 70 Q46 75 48 76" stroke="#dc2626" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <circle cx="48" cy="76" r="2" fill="#dc2626"/>
    {/* Blush */}
    <ellipse cx="32" cy="56" rx="5" ry="3" fill="#f9a8d4" opacity="0.4"/>
    <ellipse cx="68" cy="56" rx="5" ry="3" fill="#f9a8d4" opacity="0.4"/>
  </svg>
);

const Clown: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#0f172a"/>
    {/* Crazy hair */}
    <circle cx="22" cy="36" r="14" fill="#ef4444"/>
    <circle cx="78" cy="36" r="14" fill="#3b82f6"/>
    <circle cx="50" cy="20" r="12" fill="#22c55e"/>
    {/* Head */}
    <circle cx="50" cy="58" r="26" fill="#fef3c7"/>
    {/* Face paint - white around eyes */}
    <ellipse cx="38" cy="53" rx="10" ry="8" fill="white"/>
    <ellipse cx="62" cy="53" rx="10" ry="8" fill="white"/>
    {/* Eyes */}
    <circle cx="38" cy="52" r="5" fill="#1e293b"/>
    <circle cx="62" cy="52" r="5" fill="#1e293b"/>
    <circle cx="37" cy="51" r="2" fill="white"/>
    <circle cx="61" cy="51" r="2" fill="white"/>
    {/* Stars on eyes */}
    <text x="35" y="55" fontSize="5" fill="#fbbf24">★</text>
    <text x="59" y="55" fontSize="5" fill="#fbbf24">★</text>
    {/* Red nose */}
    <circle cx="50" cy="62" r="7" fill="#ef4444"/>
    <circle cx="48" cy="60" r="2" fill="#fca5a5" opacity="0.7"/>
    {/* Giant grin */}
    <path d="M28 70 Q50 88 72 70" fill="#fef3c7" stroke="#fef3c7" strokeWidth="1"/>
    <path d="M30 70 Q50 85 70 70" fill="#ef4444"/>
    {/* Teeth */}
    <rect x="37" y="70" width="6" height="8" rx="2" fill="white"/>
    <rect x="45" y="70" width="6" height="9" rx="2" fill="white"/>
    <rect x="53" y="70" width="6" height="8" rx="2" fill="white"/>
    {/* Blush diamonds */}
    <path d="M24 64 L29 68 L24 72 L19 68 Z" fill="#f472b6"/>
    <path d="M76 64 L81 68 L76 72 L71 68 Z" fill="#f472b6"/>
  </svg>
);

/* ─────────────────────────────────────────
   Master Avatar List
───────────────────────────────────────── */

export const AVATARS: AvatarDef[] = [
  { id: 'fox',       label: 'Fox',      type: 'img', src: '/avatars/fox.jpg' },
  { id: 'alien',     label: 'Alien',    type: 'img', src: '/avatars/alien.jpg' },
  { id: 'robot',     label: 'Robot',    type: 'img', src: '/avatars/robot.jpg' },
  { id: 'ghost',     label: 'Ghost',    type: 'svg', Render: Ghost },
  { id: 'panda',     label: 'Panda',    type: 'svg', Render: Panda },
  { id: 'unicorn',   label: 'Unicorn',  type: 'svg', Render: Unicorn },
  { id: 'lion',      label: 'Lion',     type: 'svg', Render: Lion },
  { id: 'frog',      label: 'Frog',     type: 'svg', Render: Frog },
  { id: 'shark',     label: 'Shark',    type: 'svg', Render: Shark },
  { id: 'dino',      label: 'Dino',     type: 'svg', Render: Dino },
  { id: 'wizard',    label: 'Wizard',   type: 'svg', Render: Wizard },
  { id: 'ninja',     label: 'Ninja',    type: 'svg', Render: Ninja },
  { id: 'penguin',   label: 'Penguin',  type: 'svg', Render: Penguin },
  { id: 'vampire',   label: 'Vampire',  type: 'svg', Render: Vampire },
  { id: 'clown',     label: 'Clown',    type: 'svg', Render: Clown },
];

/* ─────────────────────────────────────────
   AvatarDisplay — renders any avatar by id
───────────────────────────────────────── */
interface AvatarDisplayProps {
  avatarId: string;
  size?: number;
  className?: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ avatarId, size = 36, className = '' }) => {
  const def = AVATARS.find(a => a.id === avatarId) ?? AVATARS[0];

  if (def.type === 'img' && def.src) {
    return (
      <img
        src={def.src}
        alt={def.label}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
        onError={(e) => {
          // Fallback to first SVG avatar if image fails
          const fallback = AVATARS.find(a => a.type === 'svg');
          if (fallback?.Render) {
            const el = e.currentTarget;
            el.style.display = 'none';
          }
        }}
      />
    );
  }

  if (def.Render) {
    return <def.Render size={size} />;
  }

  return null;
};
