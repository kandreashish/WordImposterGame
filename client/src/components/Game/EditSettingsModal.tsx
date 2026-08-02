import React, { useState } from 'react';
import { useSocket } from '../../contexts/SocketContext.js';
import { Button } from '../Common/Button.js';
import { CategoryDialog, ALL_CATEGORIES } from '../Common/CategoryDialog.js';
import { GameMode, RoomSettings } from '../../../../shared/types.js';
import { X, Clock, Shield, Users, Sparkles, ChevronRight } from 'lucide-react';

const formatSeconds = (seconds: number): string => {
  if (seconds === 0) return 'None (Direct)';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
};

interface EditSettingsModalProps {
  onClose: () => void;
}

export const EditSettingsModal: React.FC<EditSettingsModalProps> = ({ onClose }) => {
  const { room, updateSettings, theme } = useSocket();

  const currentSettings: RoomSettings = room?.settings || {
    gameMode: 'classic',
    discussionTime: 30,
    revealTime: 10,
    votingTime: 30,
    maxPlayers: 8,
    imposterCount: 1,
    categories: ALL_CATEGORIES.map(c => c.label)
  };

  const [gameMode, setGameMode] = useState<GameMode>(currentSettings.gameMode);
  const [discussionTime, setDiscussionTime] = useState<number>(currentSettings.discussionTime || 30);
  const [revealTime, setRevealTime] = useState<number>(currentSettings.revealTime || 10);
  const [votingTime, setVotingTime] = useState<number>(currentSettings.votingTime || 30);
  const [maxPlayers, setMaxPlayers] = useState<number>(currentSettings.maxPlayers || 8);
  const [imposterCount, setImposterCount] = useState<number>(currentSettings.imposterCount || 1);
  const [categories, setCategories] = useState<string[]>(
    currentSettings.categories && currentSettings.categories.length > 0
      ? currentSettings.categories
      : ALL_CATEGORIES.map(c => c.label)
  );

  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  const handleCategoryToggle = (catLabel: string) => {
    setCategories(prev => {
      if (prev.includes(catLabel) && prev.length === 1) return prev;
      return prev.includes(catLabel)
        ? prev.filter(c => c !== catLabel)
        : [...prev, catLabel];
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      gameMode,
      discussionTime,
      revealTime,
      votingTime,
      maxPlayers,
      imposterCount,
      categories
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="border rounded-3xl p-6 w-full max-w-md flex flex-col gap-5 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        style={{
          background: 'var(--color-card-bg)',
          backdropFilter: 'blur(24px)',
          borderColor: 'var(--color-card-border)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
        >
          <X size={18} />
        </button>

        <div>
          <h4 className="text-base font-black uppercase tracking-wider text-slate-100">
            Edit Game Settings
          </h4>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
            Configure rules for the next round
          </p>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          {/* Game Mode */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
              <Shield size={14} className="text-slate-500" />
              Game Mode
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGameMode('classic')}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  gameMode === 'classic'
                    ? 'bg-violet-600/20 border-violet-500 shadow-inner shadow-violet-500/10'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700/80'
                }`}
              >
                <span className="text-sm font-bold text-slate-100">Classic Spy</span>
                <span className="text-[11px] leading-tight text-slate-400 mt-1">
                  Imposter gets no word and must bluff.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setGameMode('undercover')}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  gameMode === 'undercover'
                    ? 'bg-violet-600/20 border-violet-500 shadow-inner shadow-violet-500/10'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700/80'
                }`}
              >
                <span className="text-sm font-bold text-slate-100">Undercover</span>
                <span className="text-[11px] leading-tight text-slate-400 mt-1">
                  Imposter gets a similar word.
                </span>
              </button>
            </div>
          </div>

          {/* Discussion, Reveal & Voting Time */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400 tracking-wider uppercase">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-500" />
                  Clue Turn Time (Per Player)
                </span>
                <span className="text-violet-400 font-bold">{formatSeconds(discussionTime)}</span>
              </div>
              <input
                type="range"
                min={5}
                max={180}
                step={5}
                value={discussionTime}
                onChange={(e) => setDiscussionTime(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400 tracking-wider uppercase">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-500" />
                  Secret Word Reveal Time
                </span>
                <span className="text-violet-400 font-bold">{formatSeconds(revealTime)}</span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={revealTime}
                onChange={(e) => setRevealTime(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400 tracking-wider uppercase">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-500" />
                  Voting Time
                </span>
                <span className="text-violet-400 font-bold">{formatSeconds(votingTime)}</span>
              </div>
              <input
                type="range"
                min={10}
                max={300}
                step={5}
                value={votingTime}
                onChange={(e) => setVotingTime(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
            </div>
          </div>

          {/* Imposter Count */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
              <Shield size={14} className="text-slate-500" />
              Imposters
            </span>
            <select
              value={imposterCount}
              onChange={(e) => setImposterCount(Number(e.target.value))}
              className="glass-input px-3 py-2 rounded-xl text-slate-100 font-medium text-sm focus:outline-none w-full bg-slate-950 border border-slate-800 cursor-pointer"
            >
              <option value={1} className="bg-slate-950">1 Imposter</option>
              <option value={2} className="bg-slate-950">2 Imposters</option>
            </select>
          </div>

          {/* Category Picker */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles size={14} className="text-slate-500" />
                Categories
              </span>
              <span className="text-xs text-slate-500">
                {categories.length === ALL_CATEGORIES.length ? 'All selected' : `${categories.length} of ${ALL_CATEGORIES.length}`}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowCategoryDialog(true)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70 transition-all cursor-pointer group"
            >
              <div className="flex flex-wrap gap-1.5 flex-1 mr-2">
                {categories.map(c => {
                  const meta = ALL_CATEGORIES.find(a => a.label === c);
                  const chipColor = theme === 'light'
                    ? (meta?.darkAccent ?? '#4338ca')
                    : (meta?.accentColor ?? '#a78bfa');
                  const accentHex = meta?.accentColor ?? '#7c3aed';
                  return (
                    <span
                      key={c}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: theme === 'light' ? `${accentHex}18` : `${accentHex}22`,
                        color: chipColor,
                        border: `1px solid ${accentHex}55`,
                      }}
                    >
                      <span>{meta?.emoji}</span>
                      <span>{c}</span>
                    </span>
                  );
                })}
              </div>
              <ChevronRight size={16} className="text-slate-500 group-hover:text-slate-300 shrink-0 transition-colors" />
            </button>
          </div>

          {/* Max Players */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 tracking-wider uppercase">
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-slate-500" />
                Max Players
              </span>
              <span className="text-violet-400 font-bold">{maxPlayers} Players</span>
            </div>
            <input
              type="range"
              min={4}
              max={12}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full mt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Settings
            </Button>
          </div>
        </form>
      </div>

      {showCategoryDialog && (
        <CategoryDialog
          selected={categories}
          onToggle={handleCategoryToggle}
          onClose={() => setShowCategoryDialog(false)}
        />
      )}
    </div>
  );
};
