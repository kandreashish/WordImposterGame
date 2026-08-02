import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext.js';
import { Card } from '../components/Common/Card.js';
import { Input } from '../components/Common/Input.js';
import { Button } from '../components/Common/Button.js';
import { CategoryDialog, ALL_CATEGORIES } from '../components/Common/CategoryDialog.js';
import { ArrowLeft, Clock, Shield, Users, Sparkles, Sun, Moon, ChevronRight } from 'lucide-react';
import { GameMode } from '../../../shared/types.js';

const formatSeconds = (seconds: number): string => {
  if (seconds === 0) return 'None (Direct)';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
};

import { trackEvent } from '../utils/analytics.js';

export const CreateRoom: React.FC = () => {
  const navigate = useNavigate();
  const { room, createRoom, theme, toggleTheme } = useSocket();

  useEffect(() => {
    trackEvent('enter_screen_create_room', { screen: 'CreateRoom' });
  }, []);

  const blurActiveInput = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const [nickname, setNickname] = useState(() => localStorage.getItem('wi_nickname') || '');
  const [gameMode, setGameMode] = useState<GameMode>(() => {
    const saved = localStorage.getItem('wi_settings_gamemode');
    return (saved === 'classic' || saved === 'undercover') ? saved : 'classic';
  });
  const [discussionTime, setDiscussionTime] = useState<number>(() => {
    const saved = localStorage.getItem('wi_settings_discussion');
    return saved !== null ? Number(saved) : 30;
  });
  const [revealTime, setRevealTime] = useState<number>(() => {
    const saved = localStorage.getItem('wi_settings_reveal');
    return saved !== null ? Number(saved) : 10;
  });
  const [votingTime, setVotingTime] = useState<number>(() => {
    const saved = localStorage.getItem('wi_settings_voting');
    return saved !== null ? Number(saved) : 30;
  });
  const [maxPlayers, setMaxPlayers] = useState<number>(() => {
    const saved = localStorage.getItem('wi_settings_maxplayers');
    return saved !== null ? Number(saved) : 8;
  });
  const [imposterCount, setImposterCount] = useState<number>(() => {
    const saved = localStorage.getItem('wi_settings_impostercount');
    return saved !== null ? Number(saved) : 1;
  });
  const [category, setCategory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('wi_settings_categories');
      const parsed: string[] = saved ? JSON.parse(saved) : [];
      // Default to all categories if nothing was saved or list is empty
      return parsed.length > 0 ? parsed : ALL_CATEGORIES.map(c => c.label);
    } catch {
      return ALL_CATEGORIES.map(c => c.label);
    }
  });
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [errors, setErrors] = useState<{ nickname?: string }>({});

  useEffect(() => {
    if (room) {
      navigate(`/room/${room.code}`);
    }
  }, [room, navigate]);

  // Synchronous setters that update state and write directly to localStorage instantly
  const handleGameMode = (val: GameMode) => {
    setGameMode(val);
    localStorage.setItem('wi_settings_gamemode', val);
    trackEvent('change_gamemode_setting', { screen: 'CreateRoom', mode: val });
  };
  const handleDiscussionTime = (val: number) => {
    setDiscussionTime(val);
    localStorage.setItem('wi_settings_discussion', String(val));
    trackEvent('change_discussion_timer_setting', { screen: 'CreateRoom', seconds: val });
  };
  const handleRevealTime = (val: number) => {
    setRevealTime(val);
    localStorage.setItem('wi_settings_reveal', String(val));
    trackEvent('change_reveal_timer_setting', { screen: 'CreateRoom', seconds: val });
  };
  const handleVotingTime = (val: number) => {
    setVotingTime(val);
    localStorage.setItem('wi_settings_voting', String(val));
    trackEvent('change_voting_timer_setting', { screen: 'CreateRoom', seconds: val });
  };
  const handleMaxPlayers = (val: number) => {
    setMaxPlayers(val);
    localStorage.setItem('wi_settings_maxplayers', String(val));
    trackEvent('change_maxplayers_setting', { screen: 'CreateRoom', count: val });
  };
  const handleImposterCount = (val: number) => {
    setImposterCount(val);
    localStorage.setItem('wi_settings_impostercount', String(val));
    trackEvent('change_impostercount_setting', { screen: 'CreateRoom', count: val });
  };
  const handleCategory = (val: string) => {
    setCategory(prev => {
      // Must keep at least one category selected
      if (prev.includes(val) && prev.length === 1) return prev;
      const next = prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val];
      localStorage.setItem('wi_settings_categories', JSON.stringify(next));
      trackEvent('change_category_setting', { screen: 'CreateRoom', categories: next });
      return next;
    });
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || nickname.trim() === '') {
      setErrors({ nickname: 'Nickname is required' });
      return;
    }

    createRoom(nickname.trim(), {
      gameMode,
      discussionTime,
      revealTime,
      votingTime,
      maxPlayers,
      imposterCount,
      categories: category
    });
  };

  return (
    <div className="min-h-screen game-bg-radial flex flex-col items-center justify-start md:justify-center p-4 relative overflow-x-hidden overflow-y-auto">
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleTheme}
          className="p-2.5 bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-all cursor-pointer shadow-lg"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>

      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-600/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-82 h-82 bg-indigo-600/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        <Link to="/" onClick={() => trackEvent('click_back_to_home_nav', { screen: 'CreateRoom' })} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider mb-4 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <Card>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-6">
            Create a New Room
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Nickname Input */}
            <Input
              label="Choose Nickname"
              placeholder="e.g. Maverick"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                if (errors.nickname) setErrors({});
              }}
              error={errors.nickname}
              maxLength={15}
            />

            {/* Game Mode */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                <Shield size={14} className="text-slate-500" />
                Game Mode
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleGameMode('classic')}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    gameMode === 'classic'
                      ? 'bg-violet-600/20 border-violet-500 shadow-inner shadow-violet-500/10'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700/80'
                  }`}
                >
                  <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Classic Spy</span>
                  <span className="text-[11px] leading-tight mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Imposter gets no word and must bluff.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleGameMode('undercover')}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    gameMode === 'undercover'
                      ? 'bg-violet-600/20 border-violet-500 shadow-inner shadow-violet-500/10'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700/80'
                  }`}
                >
                  <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Undercover</span>
                  <span className="text-[11px] leading-tight mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Imposter gets a similar word.
                  </span>
                </button>
              </div>
            </div>

            {/* Discussion, Reveal & Voting Sliders */}
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
                  onChange={(e) => handleDiscussionTime(Number(e.target.value))}
                  onPointerDown={blurActiveInput}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <div className="flex justify-between text-4xs text-slate-500 px-1">
                  <span>5s</span>
                  <span>45s</span>
                  <span>3m</span>
                </div>
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
                  onChange={(e) => handleRevealTime(Number(e.target.value))}
                  onPointerDown={blurActiveInput}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <div className="flex justify-between text-4xs text-slate-500 px-1">
                  <span>5s</span>
                  <span>30s</span>
                  <span>60s</span>
                </div>
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
                  onChange={(e) => handleVotingTime(Number(e.target.value))}
                  onPointerDown={blurActiveInput}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <div className="flex justify-between text-4xs text-slate-500 px-1">
                  <span>10s</span>
                  <span>2m 30s</span>
                  <span>5m</span>
                </div>
              </div>
            </div>

            {/* Imposters */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                <Shield size={14} className="text-slate-500" />
                Imposters
              </span>
              <select
                value={imposterCount}
                onChange={(e) => handleImposterCount(Number(e.target.value))}
                onPointerDown={blurActiveInput}
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
                  {category.length === ALL_CATEGORIES.length ? 'All selected' : `${category.length} of ${ALL_CATEGORIES.length}`}
                </span>
              </div>

              {/* Trigger button */}
              <button
                type="button"
                onClick={() => setShowCategoryDialog(true)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70 transition-all cursor-pointer group"
              >
                <div className="flex flex-wrap gap-1.5 flex-1 mr-2">
                  {category.map(c => {
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
                          background: theme === 'light'
                            ? `${accentHex}18`
                            : `${accentHex}22`,
                          color: chipColor,
                          border: `1px solid ${accentHex}${theme === 'light' ? '55' : '55'}`,
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
                onChange={(e) => handleMaxPlayers(Number(e.target.value))}
                onPointerDown={blurActiveInput}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
              <div className="flex justify-between text-4xs text-slate-500 px-1">
                <span>4</span>
                <span>8</span>
                <span>12</span>
              </div>
            </div>

            {/* Submit */}
            <Button type="submit" size="lg" className="mt-2" fullWidth>
              Create Room
            </Button>
          </form>
        </Card>
      </div>

      {/* Category dialog portal */}
      {showCategoryDialog && (
        <CategoryDialog
          selected={category}
          onToggle={handleCategory}
          onClose={() => setShowCategoryDialog(false)}
        />
      )}
    </div>
  );
};
