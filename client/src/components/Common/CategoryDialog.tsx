import React, { useEffect } from 'react';
import { X, Check, Sparkles } from 'lucide-react';

export interface CategoryMeta {
  label: string;
  emoji: string;
  image?: string;       // path under /categories/
  gradient: string;     // tailwind gradient classes used as fallback or overlay
  accentColor: string;  // hex for the glow ring when selected
}

export const ALL_CATEGORIES: CategoryMeta[] = [
  {
    label: 'Animals',
    emoji: '🐾',
    image: '/categories/animals.jpg',
    gradient: 'from-blue-900 via-violet-900 to-indigo-950',
    accentColor: '#818cf8',
  },
  {
    label: 'Food',
    emoji: '🍕',
    image: '/categories/food.jpg',
    gradient: 'from-amber-900 via-red-900 to-rose-950',
    accentColor: '#f97316',
  },
  {
    label: 'Nature',
    emoji: '🌿',
    image: '/categories/nature.jpg',
    gradient: 'from-teal-900 via-emerald-900 to-green-950',
    accentColor: '#34d399',
  },
  {
    label: 'Objects',
    emoji: '🔧',
    image: '/categories/objects.jpg',
    gradient: 'from-indigo-900 via-purple-900 to-violet-950',
    accentColor: '#a78bfa',
  },
  {
    label: 'Sports',
    emoji: '⚽',
    image: '/categories/sports.jpg',
    gradient: 'from-orange-900 via-red-900 to-rose-950',
    accentColor: '#fb923c',
  },
  {
    label: 'Movies & TV',
    emoji: '🎬',
    image: '/categories/movies.jpg',
    gradient: 'from-yellow-900 via-amber-900 to-orange-950',
    accentColor: '#fbbf24',
  },
  {
    label: 'Music',
    emoji: '🎵',
    image: '/categories/music.jpg',
    gradient: 'from-violet-900 via-purple-900 to-fuchsia-950',
    accentColor: '#c084fc',
  },
  {
    label: 'Science',
    emoji: '🔬',
    image: '/categories/science.jpg',
    gradient: 'from-cyan-900 via-blue-900 to-indigo-950',
    accentColor: '#22d3ee',
  },
  {
    label: 'Places',
    emoji: '🗺️',
    image: '/categories/places.jpg',
    gradient: 'from-sky-900 via-blue-900 to-cyan-950',
    accentColor: '#38bdf8',
  },
  {
    label: 'Professions',
    emoji: '💼',
    image: '/categories/professions.jpg',
    gradient: 'from-slate-700 via-slate-800 to-slate-900',
    accentColor: '#94a3b8',
  },
];

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
        className="relative w-full sm:max-w-lg bg-slate-950 border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
        style={{
          animation: 'slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-violet-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Choose Categories</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              {selectedCount === 0 ? 'All active' : `${selectedCount} selected`}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="p-4 grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
          {ALL_CATEGORIES.map((cat) => {
            const active = selected.includes(cat.label);
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => onToggle(cat.label)}
                className="relative group rounded-2xl overflow-hidden cursor-pointer focus:outline-none"
                style={{
                  height: 130,
                  boxShadow: active
                    ? `0 0 0 2.5px ${cat.accentColor}, 0 8px 32px ${cat.accentColor}44`
                    : '0 2px 12px rgba(0,0,0,0.5)',
                  transition: 'box-shadow 0.2s ease',
                }}
              >
                {/* Background image or gradient */}
                {cat.image ? (
                  <>
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    {/* Dark overlay — lighter when selected */}
                    <div
                      className={`absolute inset-0 transition-opacity duration-200 bg-gradient-to-t from-black/80 via-black/40 to-black/10 ${active ? 'opacity-70' : 'opacity-100'}`}
                    />
                  </>
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient}`} />
                )}

                {/* Glow ring pulse when active */}
                {active && (
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{ boxShadow: `inset 0 0 20px ${cat.accentColor}33` }}
                  />
                )}

                {/* Check badge */}
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

                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6 bg-gradient-to-t from-black/90 to-transparent">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg leading-none">{cat.emoji}</span>
                    <span className="text-sm font-bold text-white leading-tight drop-shadow">{cat.label}</span>
                  </div>
                </div>

                {/* Hover shimmer */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/5" />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 pb-5 pt-3 border-t border-slate-800/60 flex gap-3">
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={() => {
                selected.forEach(s => onToggle(s));
              }}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-400 border border-slate-700 hover:border-slate-600 hover:text-slate-200 transition-all cursor-pointer"
            >
              Clear All
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-all"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
            }}
          >
            {selectedCount === 0 ? 'Use All Categories' : `Done · ${selectedCount} selected`}
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
