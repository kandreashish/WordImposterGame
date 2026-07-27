import React, { useEffect, useState } from 'react';
import { X, Check, Sparkles } from 'lucide-react';

export interface CategoryMeta {
  label: string;
  emoji: string;
  image?: string;       // path under /categories/
  gradient: string;     // tailwind gradient classes used as fallback or overlay
  accentColor: string;  // hex for the glow ring when selected (light on dark)
  darkAccent: string;   // darker shade — readable as text on white (light mode chips)
}

export const ALL_CATEGORIES: CategoryMeta[] = [
  {
    label: 'Animals',
    emoji: '🐾',
    image: '/categories/animals.jpg',
    gradient: 'from-blue-900 via-violet-900 to-indigo-950',
    accentColor: '#818cf8',
    darkAccent: '#4338ca',
  },
  {
    label: 'Food',
    emoji: '🍕',
    image: '/categories/food.jpg',
    gradient: 'from-amber-900 via-red-900 to-rose-950',
    accentColor: '#f97316',
    darkAccent: '#c2410c',
  },
  {
    label: 'Nature',
    emoji: '🌿',
    image: '/categories/nature.jpg',
    gradient: 'from-teal-900 via-emerald-900 to-green-950',
    accentColor: '#34d399',
    darkAccent: '#065f46',
  },
  {
    label: 'Objects',
    emoji: '🔧',
    image: '/categories/objects.jpg',
    gradient: 'from-indigo-900 via-purple-900 to-violet-950',
    accentColor: '#a78bfa',
    darkAccent: '#5b21b6',
  },
  {
    label: 'Sports',
    emoji: '⚽',
    image: '/categories/sports.jpg',
    gradient: 'from-orange-900 via-red-900 to-rose-950',
    accentColor: '#fb923c',
    darkAccent: '#9a3412',
  },
  {
    label: 'Movies & TV',
    emoji: '🎬',
    image: '/categories/movies.jpg',
    gradient: 'from-yellow-900 via-amber-900 to-orange-950',
    accentColor: '#fbbf24',
    darkAccent: '#92400e',
  },
  {
    label: 'Music',
    emoji: '🎵',
    image: '/categories/music.jpg',
    gradient: 'from-violet-900 via-purple-900 to-fuchsia-950',
    accentColor: '#c084fc',
    darkAccent: '#6b21a8',
  },
  {
    label: 'Science',
    emoji: '🔬',
    image: '/categories/science.jpg',
    gradient: 'from-cyan-900 via-blue-900 to-indigo-950',
    accentColor: '#22d3ee',
    darkAccent: '#0e7490',
  },
  {
    label: 'Places',
    emoji: '🗺️',
    image: '/categories/places.jpg',
    gradient: 'from-sky-900 via-blue-900 to-cyan-950',
    accentColor: '#38bdf8',
    darkAccent: '#0369a1',
  },
  {
    label: 'Professions',
    emoji: '💼',
    image: '/categories/professions.jpg',
    gradient: 'from-slate-700 via-slate-800 to-slate-900',
    accentColor: '#94a3b8',
    darkAccent: '#334155',
  },
];

// Map gradient class names to actual hex stops for inline SVG fallbacks
const GRADIENT_SVG_MAP: Record<string, [string, string]> = {
  'from-blue-900 via-violet-900 to-indigo-950':    ['#1e3a5f', '#312e81'],
  'from-amber-900 via-red-900 to-rose-950':         ['#78350f', '#4c0519'],
  'from-teal-900 via-emerald-900 to-green-950':     ['#134e4a', '#052e16'],
  'from-indigo-900 via-purple-900 to-violet-950':   ['#312e81', '#2e1065'],
  'from-orange-900 via-red-900 to-rose-950':        ['#7c2d12', '#4c0519'],
  'from-yellow-900 via-amber-900 to-orange-950':    ['#713f12', '#431407'],
  'from-violet-900 via-purple-900 to-fuchsia-950':  ['#4c1d95', '#3b0764'],
  'from-cyan-900 via-blue-900 to-indigo-950':       ['#164e63', '#1e1b4b'],
  'from-sky-900 via-blue-900 to-cyan-950':          ['#0c4a6e', '#083344'],
  'from-slate-700 via-slate-800 to-slate-900':      ['#334155', '#0f172a'],
};

interface CategoryCardBgProps {
  cat: CategoryMeta;
  active: boolean;
}

const CategoryCardBg: React.FC<CategoryCardBgProps> = ({ cat, active }) => {
  const [imgError, setImgError] = useState(false);
  const [stops] = useState<[string, string]>(
    () => GRADIENT_SVG_MAP[cat.gradient] ?? ['#1e1b4b', '#0f172a']
  );

  if (!cat.image || imgError) {
    // SVG fallback — gradient + large emoji
    return (
      <>
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`cg-${cat.label}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={stops[0]} />
              <stop offset="100%" stopColor={stops[1]} />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill={`url(#cg-${cat.label})`} />
          {/* subtle noise texture rings */}
          <circle cx="50%" cy="40%" r="55" fill="white" fillOpacity="0.03" />
          <circle cx="50%" cy="40%" r="38" fill="white" fillOpacity="0.03" />
        </svg>
        {/* Large emoji centred in upper portion */}
        <span
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: 20, fontSize: 46, lineHeight: 1, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}
        >
          {cat.emoji}
        </span>
      </>
    );
  }

  return (
    <>
      <img
        src={cat.image}
        alt={cat.label}
        className="absolute inset-0 w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
      {/* Dark overlay — lighter when selected */}
      <div
        className={`absolute inset-0 transition-opacity duration-200 bg-gradient-to-t from-black/80 via-black/40 to-black/10 ${active ? 'opacity-70' : 'opacity-100'}`}
      />
    </>
  );
};

interface CategoryDialogProps {
  selected: string[];
  onToggle: (label: string) => void;
  onClose: () => void;
}

export const CategoryDialog: React.FC<CategoryDialogProps> = ({ selected, onToggle, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const selectedCount = selected.length;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(12px)' }}
    >
      {/* Dialog panel */}
      <div
        className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: '#080d1f',
          border: '1px solid rgba(51,65,85,0.7)',
          animation: 'slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pt-5 pb-3"
          style={{ borderBottom: '1px solid rgba(51,65,85,0.6)' }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={16} style={{ color: '#a78bfa' }} />
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Choose Categories</h2>
          </div>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 12, color: '#64748b' }}>
              {selectedCount} selected
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg cursor-pointer transition-colors"
              style={{ color: '#94a3b8' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(51,65,85,0.6)'; (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="p-4 grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
          {ALL_CATEGORIES.map((cat) => {
            const active = selected.includes(cat.label);
            const isLast = active && selected.length === 1;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => !isLast && onToggle(cat.label)}
                title={isLast ? 'At least one category must be selected' : undefined}
                className="relative group rounded-2xl overflow-hidden focus:outline-none"
                style={{
                  height: 130,
                  cursor: isLast ? 'not-allowed' : 'pointer',
                  boxShadow: active
                    ? `0 0 0 2.5px ${cat.accentColor}, 0 8px 32px ${cat.accentColor}44`
                    : '0 2px 12px rgba(0,0,0,0.5)',
                  transition: 'box-shadow 0.2s ease',
                  opacity: isLast ? 0.75 : 1,
                }}
              >
                {/* Background image or gradient/SVG fallback */}
                <CategoryCardBg cat={cat} active={active} />

                {/* Glow ring pulse when active */}
                {active && (
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{ boxShadow: `inset 0 0 20px ${cat.accentColor}33` }}
                  />
                )}

                {/* Lock overlay for last-remaining card */}
                {isLast && (
                  <div className="absolute inset-0 flex items-start justify-end p-2.5">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(15,23,42,0.85)', border: '1.5px solid rgba(148,163,184,0.35)' }}
                    >
                      {/* lock icon inline SVG */}
                      <svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="5.5" width="9" height="7" rx="1.5" stroke="#94a3b8" strokeWidth="1.4"/>
                        <path d="M3 5.5V3.5a2.5 2.5 0 015 0v2" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round"/>
                        <circle cx="5.5" cy="9" r="1" fill="#94a3b8"/>
                      </svg>
                    </div>
                  </div>
                )}

                {/* Check badge (only when not the lock overlay) */}
                {!isLast && (
                  <div
                    className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{
                      background: active ? cat.accentColor : 'rgba(15,23,42,0.7)',
                      border: active ? 'none' : '1.5px solid rgba(148,163,184,0.3)',
                      transform: active ? 'scale(1)' : 'scale(0.85)',
                    }}
                  >
                    {active && <Check size={12} color="#fff" strokeWidth={3} />}
                  </div>
                )}

                {/* Label */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)' }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg leading-none">{cat.emoji}</span>
                    <span
                      className="text-sm font-bold leading-tight"
                      style={{ color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
                    >{cat.label}</span>
                  </div>
                </div>

                {/* Hover shimmer */}
                {!isLast && <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/5" />}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="px-4 pb-5 pt-3 flex gap-3"
          style={{ borderTop: '1px solid rgba(51,65,85,0.6)' }}
        >
          {selectedCount > 1 && (
            <button
              type="button"
              onClick={() => {
                // Keep the first selected, deselect the rest
                const [keep, ...rest] = selected;
                rest.forEach(s => onToggle(s));
                void keep;
              }}
              className="flex-1 py-2.5 rounded-xl cursor-pointer transition-all"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#94a3b8',
                background: 'transparent',
                border: '1px solid rgba(71,85,105,0.7)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#e2e8f0'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(100,116,139,0.9)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(71,85,105,0.7)'; }}
            >
              Clear All
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl cursor-pointer transition-all"
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#ffffff',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
            }}
          >
            Done · {selectedCount} selected
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};
