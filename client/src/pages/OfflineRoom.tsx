import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/Common/Card.js';
import { Input } from '../components/Common/Input.js';
import { Button } from '../components/Common/Button.js';
import { CategoryDialog, ALL_CATEGORIES } from '../components/Common/CategoryDialog.js';
import { Timer } from '../components/Common/Timer.js';
import { AvatarDisplay } from '../components/Common/AvatarKit.js';
import {
  Trash2,
  Plus,
  Play,
  RefreshCw,
  LogOut,
  Eye,
  EyeOff,
  Volume2,
  ShieldAlert,
  Sparkles,
  Clock,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { localWordBank } from '../utils/localWords.js';
import { playSound } from '../utils/sound.js';
import { trackEvent } from '../utils/analytics.js';

interface OfflinePlayer {
  id: string;
  nickname: string;
  avatar: string;
  isImposter: boolean;
  role: 'MAJORITY' | 'IMPOSTER';
  word: string | null;
  isAlive: boolean;
}

export const OfflineRoom: React.FC = () => {
  const navigate = useNavigate();

  // Screen Phases: LOBBY | REVEAL | DISCUSSION | VOTING | RESULTS
  const [status, setStatus] = useState<'LOBBY' | 'REVEAL' | 'DISCUSSION' | 'VOTING' | 'RESULTS'>('LOBBY');

  // Players
  const [players, setPlayers] = useState<OfflinePlayer[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [nameError, setNameError] = useState('');

  // Settings
  const [gameMode, setGameMode] = useState<'classic' | 'undercover'>('classic');
  const [discussionTime] = useState<number>(30);
  const [imposterCount, setImposterCount] = useState<number>(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(ALL_CATEGORIES.map(c => c.label));
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  // Active Game State Variables
  const [majorityWord, setMajorityWord] = useState('');
  const [imposterWord, setImposterWord] = useState<string | null>(null);
  const [imposterHint, setImposterHint] = useState<string | null>(null);
  const [turnOrder, setTurnOrder] = useState<string[]>([]); // Player IDs in order
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [timerVal, setTimerVal] = useState(30);

  // Reveal Phase Sub-state
  const [revealStep, setRevealStep] = useState(0); // Index of player revealing
  const [revealState, setRevealState] = useState<'PASS' | 'SHOW'>('PASS');
  const [showSecretWord, setShowSecretWord] = useState(false);

  // Voting Phase Sub-state
  const [selectedVoteId, setSelectedVoteId] = useState<string | null>(null);
  const [votedPlayerId, setVotedPlayerId] = useState<string | null>(null);

  // Track timer interval
  const timerIntervalRef = useRef<any>(null);

  // Initialize with some default players for quick starting
  useEffect(() => {
    trackEvent('enter_screen_offline_lobby', { screen: 'OfflineLobby' });
    setPlayers([
      { id: 'p_1', nickname: 'Player 1', avatar: 'fox', isImposter: false, role: 'MAJORITY', word: null, isAlive: true },
      { id: 'p_2', nickname: 'Player 2', avatar: 'panda', isImposter: false, role: 'MAJORITY', word: null, isAlive: true },
      { id: 'p_3', nickname: 'Player 3', avatar: 'ghost', isImposter: false, role: 'MAJORITY', word: null, isAlive: true },
    ]);
  }, []);

  // Sync settings imposter count cap when players length changes
  useEffect(() => {
    const maxImposters = Math.max(1, players.length - 2);
    if (imposterCount > maxImposters) {
      setImposterCount(maxImposters);
    }
  }, [players.length, imposterCount]);

  // Handle local Discussion Timer tick
  useEffect(() => {
    if (status === 'DISCUSSION') {
      setTimerVal(discussionTime);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setTimerVal((prev) => {
          if (prev <= 1) {
            playSound('yourTurn');
            return 0; // stop at 0, let them click Done Speaking manually
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status, currentTurnIndex, discussionTime]);

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPlayerName.trim();
    if (!name) {
      setNameError('Nickname is required');
      return;
    }
    if (name.length > 15) {
      setNameError('Maximum 15 characters');
      return;
    }
    if (players.some(p => p.nickname.toLowerCase() === name.toLowerCase())) {
      setNameError('Nickname already taken');
      return;
    }
    if (players.length >= 12) {
      setNameError('Maximum 12 players');
      return;
    }

    // Auto assign cute unused avatar
    const ALL_AVATARS = ['fox', 'alien', 'robot', 'ghost', 'panda', 'unicorn', 'lion', 'frog', 'shark', 'dino', 'wizard', 'ninja', 'penguin', 'vampire', 'clown'];
    const taken = new Set(players.map(p => p.avatar));
    const available = ALL_AVATARS.filter(a => !taken.has(a));
    const pool = available.length > 0 ? available : ALL_AVATARS;
    const avatar = pool[Math.floor(Math.random() * pool.length)];

    const newPlayer: OfflinePlayer = {
      id: 'p_' + Math.random().toString(36).substr(2, 9),
      nickname: name,
      avatar,
      isImposter: false,
      role: 'MAJORITY',
      word: null,
      isAlive: true
    };

    playSound('playerJoin');
    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
    setNameError('');
  };

  const handleRemovePlayer = (id: string) => {
    playSound('playerLeave');
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleStartGame = () => {
    if (players.length < 3) return;

    playSound('gameStart');

    // Pick random word pair filtered by selected categories
    let filtered = localWordBank;
    if (selectedCategories.length > 0) {
      filtered = localWordBank.filter(w =>
        selectedCategories.some(c => c.toLowerCase() === w.category.toLowerCase())
      );
    }
    if (filtered.length === 0) filtered = localWordBank;

    const wordPair = filtered[Math.floor(Math.random() * filtered.length)];
    setMajorityWord(wordPair.majority);

    const isClassic = gameMode === 'classic';
    const impWord = isClassic ? null : wordPair.imposter;
    setImposterWord(impWord);
    setImposterHint(wordPair.hint);

    // Shuffle and pick Imposters
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const imposterIds = new Set(
      shuffledPlayers.slice(0, Math.min(imposterCount, players.length - 2)).map(p => p.id)
    );

    // Update players roles and words
    const updatedPlayers = players.map(p => {
      const isImp = imposterIds.has(p.id);
      return {
        ...p,
        isAlive: true,
        isImposter: isImp,
        role: (isImp ? 'IMPOSTER' : 'MAJORITY') as 'MAJORITY' | 'IMPOSTER',
        word: isImp ? impWord : wordPair.majority
      };
    });

    setPlayers(updatedPlayers);

    // Turn order is a shuffle of all players
    const ids = updatedPlayers.map(p => p.id).sort(() => Math.random() - 0.5);
    setTurnOrder(ids);

    setRevealStep(0);
    setRevealState('PASS');
    setShowSecretWord(false);
    setStatus('REVEAL');
  };

  const handleDoneSpeaking = () => {
    playSound('click');
    if (currentTurnIndex + 1 < turnOrder.length) {
      setCurrentTurnIndex(currentTurnIndex + 1);
    } else {
      setStatus('VOTING');
      setSelectedVoteId(null);
    }
  };

  const handleConfirmElimination = () => {
    if (!selectedVoteId) return;

    playSound('gameEnd');
    setVotedPlayerId(selectedVoteId);

    // Mark that player as dead
    setPlayers(prev => prev.map(p => p.id === selectedVoteId ? { ...p, isAlive: false } : p));
    setStatus('RESULTS');
  };

  const handleCategoryToggle = (val: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(val) && prev.length === 1) return prev;
      return prev.includes(val) ? prev.filter(c => c !== val) : [...prev, val];
    });
  };

  const restartWithSamePlayers = () => {
    handleStartGame();
  };

  // Determine game results
  const votedPlayer = players.find(p => p.id === votedPlayerId);
  const wasImposterVotedOut = votedPlayer?.isImposter || false;

  return (
    <div className="min-h-screen game-bg-radial flex flex-col p-4 relative overflow-x-hidden overflow-y-auto">
      {/* Sticky Header */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80 relative z-10">
        <Link to="/" className="flex items-center gap-1.5 cursor-pointer">
          <span className="text-sm font-black text-white uppercase tracking-wider">
            Word <span className="text-violet-400">Imposter</span>
          </span>
          <span className="text-[9px] font-extrabold bg-violet-500/15 border border-violet-500/30 text-violet-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Offline Mode
          </span>
        </Link>
        <button
          onClick={() => {
            if (status === 'LOBBY' || window.confirm('Exit current game and go to Home?')) {
              playSound('click');
              navigate('/');
            }
          }}
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
          title="Exit to Home"
        >
          <LogOut size={16} />
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-md mx-auto flex flex-col justify-start py-2 pb-8 relative z-10">
        
        {/* ── 1. LOBBY PHASE ─────────────────────────────── */}
        {status === 'LOBBY' && (
          <div className="flex flex-col gap-5">
            <Card>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-1">
                Lobby Setup
              </h2>
              <p className="text-xs text-slate-400 font-medium mb-4">
                Add players manually who are sharing this device in person.
              </p>

              {/* Add Player Form */}
              <form onSubmit={handleAddPlayer} className="flex gap-2 mb-3">
                <div className="flex-1">
                  <Input
                    placeholder="e.g. Ashish"
                    value={newPlayerName}
                    onChange={(e) => {
                      setNewPlayerName(e.target.value);
                      if (nameError) setNameError('');
                    }}
                    error={nameError}
                    maxLength={15}
                  />
                </div>
                <Button type="submit" size="md" className="gap-1 flex-shrink-0 self-start">
                  <Plus size={16} /> Add
                </Button>
              </form>

              {/* Players list */}
              <div className="flex flex-col gap-2 max-h-[190px] overflow-y-auto pr-1">
                {players.length > 0 ? (
                  players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/40 border border-slate-850">
                      <div className="flex items-center gap-2.5">
                        <AvatarDisplay avatarId={player.avatar} size={32} />
                        <span className="text-sm font-bold text-slate-200">{player.nickname}</span>
                      </div>
                      <button
                        onClick={() => handleRemovePlayer(player.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-500 text-2xs font-semibold uppercase tracking-wider">
                    No players added yet (Need 3+)
                  </div>
                )}
              </div>
            </Card>

            {/* Offline Game Settings */}
            <Card className="p-4 border-slate-800 bg-slate-950/40 flex flex-col gap-4">
              <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <Clock size={14} className="text-slate-500" />
                Game Rules
              </h3>

              {/* Game Mode */}
              <div className="flex flex-col gap-1.5">
                <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-widest">Game Mode</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { playSound('click'); setGameMode('classic'); }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      gameMode === 'classic'
                        ? 'bg-violet-600/10 border-violet-500 text-violet-300 shadow-md shadow-violet-500/5'
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900/60'
                    }`}
                  >
                    Classic
                  </button>
                  <button
                    onClick={() => { playSound('click'); setGameMode('undercover'); }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      gameMode === 'undercover'
                        ? 'bg-violet-600/10 border-violet-500 text-violet-300 shadow-md shadow-violet-500/5'
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900/60'
                    }`}
                  >
                    Undercover
                  </button>
                </div>
              </div>

              {/* Imposter Count */}
              <div className="flex flex-col gap-1.5">
                <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-widest">Imposter Count</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { playSound('click'); setImposterCount(1); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex-1 ${
                      imposterCount === 1
                        ? 'bg-violet-600/15 border-violet-500/50 text-violet-400'
                        : 'bg-slate-950 border-slate-850 text-slate-500'
                    }`}
                  >
                    1 Imposter
                  </button>
                  <button
                    disabled={players.length < 4}
                    onClick={() => { playSound('click'); setImposterCount(2); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex-1 ${
                      imposterCount === 2
                        ? 'bg-violet-600/15 border-violet-500/50 text-violet-400'
                        : 'bg-slate-950 border-slate-850 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    2 Imposters
                  </button>
                </div>
              </div>

              {/* Word Categories Selection */}
              <div className="flex justify-between items-center bg-slate-950/60 border border-slate-850 px-3.5 py-2.5 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-widest">Word Categories</span>
                  <span className="text-xs font-extrabold text-violet-400 mt-0.5">
                    {selectedCategories.length === ALL_CATEGORIES.length ? 'All Categories Selected' : `${selectedCategories.length} Categories Selected`}
                  </span>
                </div>
                <button
                  onClick={() => { playSound('click'); setShowCategoryDialog(true); }}
                  className="px-3 py-1.5 bg-violet-600/10 border border-violet-500/25 text-violet-400 rounded-lg text-3xs font-bold uppercase tracking-widest hover:bg-violet-600/20"
                >
                  Configure
                </button>
              </div>
            </Card>

            {/* Start Button */}
            <div className="flex gap-3">
              <Button
                variant={players.length >= 3 ? 'primary' : 'secondary'}
                size="lg"
                onClick={handleStartGame}
                disabled={players.length < 3}
                fullWidth
                className="gap-2"
              >
                <Play size={16} /> Start Pass & Play
              </Button>
            </div>
          </div>
        )}

        {/* ── 2. REVEAL PHASE ─────────────────────────────── */}
        {status === 'REVEAL' && players[revealStep] && (
          <div className="flex flex-col gap-6 items-center">
            {/* Header progress info */}
            <div className="w-full flex justify-between items-center border-b border-slate-800/80 pb-2">
              <h2 className="text-lg font-black text-white uppercase tracking-wider">
                Reveal Word
              </h2>
              <span className="text-2xs font-extrabold text-violet-400 uppercase tracking-widest">
                Player {revealStep + 1} of {players.length}
              </span>
            </div>

            {/* Turn pass screen */}
            {revealState === 'PASS' ? (
              <Card className="w-full py-10 px-6 text-center border-slate-800 bg-slate-900/40 flex flex-col items-center gap-6 relative">
                <div className="absolute inset-4 border border-dashed border-slate-800/80 rounded-2xl pointer-events-none" />

                <div className="flex flex-col items-center gap-3">
                  <span className="text-3xs font-extrabold text-violet-400 uppercase tracking-widest bg-violet-500/10 border border-violet-500/20 px-3 py-0.5 rounded-full">
                    Pass Device
                  </span>
                  <h3 className="text-2xl font-black text-white uppercase tracking-wider">
                    {players[revealStep].nickname}
                  </h3>
                </div>

                <div className="w-28 h-28 rounded-3xl overflow-hidden border border-slate-700/60 shadow-xl relative animate-float">
                  <AvatarDisplay avatarId={players[revealStep].avatar} size={112} />
                </div>

                <p className="text-slate-400 text-xs max-w-xs leading-relaxed font-medium">
                  Hand the device to <span className="text-white font-bold">{players[revealStep].nickname}</span>. Ensure other players cannot look at the screen before tapping reveal!
                </p>

                <Button
                  onClick={() => {
                    const isImp = players[revealStep].isImposter;
                    if (isImp) playSound('suspense');
                    else playSound('click');
                    setRevealState('SHOW');
                  }}
                  size="lg"
                  fullWidth
                >
                  I am {players[revealStep].nickname} (Reveal)
                </Button>
              </Card>
            ) : (
              /* Role display screen */
              <Card
                className={`w-full py-8 px-6 text-center border-slate-800/80 transition-colors relative flex flex-col items-center justify-center min-h-[360px]`}
                glow={players[revealStep].isImposter ? 'imposter' : 'majority'}
              >
                <div className="absolute inset-4 border border-dashed border-slate-800/60 rounded-2xl pointer-events-none" />

                <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-700 shrink-0 mb-4 shadow-lg">
                  <AvatarDisplay avatarId={players[revealStep].avatar} size={56} />
                </div>

                <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-1 leading-none">
                  {players[revealStep].nickname}
                </h3>

                {players[revealStep].isImposter ? (
                  <div className="flex flex-col items-center">
                    <span className="text-3xs font-extrabold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-0.5 rounded-full uppercase tracking-widest mb-1.5 leading-none">
                      Your Role
                    </span>
                    <h2 className="text-3xl font-black text-rose-500 uppercase tracking-wide mb-4">
                      IMPOSTER
                    </h2>

                    {/* Word Box */}
                    <div className="px-5 py-3.5 bg-rose-950/20 border border-rose-900/40 rounded-2xl max-w-xs mb-4">
                      {gameMode === 'classic' ? (
                        <span className="text-xs font-bold text-rose-300 block">
                          You have NO word. Bluff and blend in!
                        </span>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-4xs text-rose-400 font-bold uppercase tracking-wider block">Your Similar Word</span>
                          <span className="text-xl font-black text-rose-100 mt-1 block font-sans">{players[revealStep].word}</span>
                        </div>
                      )}
                    </div>

                    {/* Category Hint */}
                    {imposterHint && (
                      <div className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl max-w-xs flex flex-col items-center">
                        <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-widest leading-none">Category Hint</span>
                        <span className="text-xs font-black text-amber-200 mt-1">"{imposterHint}"</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-3xs font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 rounded-full uppercase tracking-widest mb-1.5 leading-none">
                      Your Role
                    </span>
                    <h2 className="text-3xl font-black text-emerald-500 uppercase tracking-wide mb-5">
                      CIVILIAN
                    </h2>

                    {/* Word Box */}
                    <div className="px-6 py-4 bg-emerald-950/20 border border-emerald-900/40 rounded-2xl">
                      <span className="text-4xs text-emerald-400 font-bold uppercase tracking-wider block">Your Secret Word</span>
                      <span className="text-2xl font-black text-emerald-100 tracking-tight mt-1 block font-sans">{players[revealStep].word}</span>
                    </div>
                  </div>
                )}

                <div className="w-full mt-6 max-w-sm">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => {
                      playSound('click');
                      if (revealStep + 1 < players.length) {
                        setRevealStep(revealStep + 1);
                        setRevealState('PASS');
                      } else {
                        // Game discussion start!
                        playSound('gameStart');
                        setCurrentTurnIndex(0);
                        setStatus('DISCUSSION');
                      }
                    }}
                  >
                    I've Memorized It
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ── 3. DISCUSSION PHASE ─────────────────────────── */}
        {status === 'DISCUSSION' && turnOrder[currentTurnIndex] && (
          <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
            {/* Header with Timer */}
            <div className="flex justify-between items-center w-full border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                <Volume2 className="text-violet-400 animate-pulse" size={24} />
                <div>
                  <span className="text-2xs font-bold text-slate-500 uppercase tracking-widest leading-none block">
                    Turn {currentTurnIndex + 1} of {turnOrder.length}
                  </span>
                  <h2 className="text-lg font-black text-white uppercase tracking-wider mt-0.5 leading-none">
                    Verbal Clues
                  </h2>
                </div>
              </div>
              <Timer value={timerVal} total={discussionTime} />
            </div>

            {/* Active Turn Controls Card */}
            {(() => {
              const activeId = turnOrder[currentTurnIndex];
              const activeP = players.find(p => p.id === activeId);
              if (!activeP) return null;

              return (
                <Card className="border-violet-500/50 bg-violet-600/5 py-6 px-4 flex flex-col items-center text-center relative overflow-hidden glow-card">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl animate-pulse" />

                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-violet-400 shadow-md">
                      <AvatarDisplay avatarId={activeP.avatar} size={44} />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-3xs font-extrabold text-violet-400 uppercase tracking-widest flex items-center gap-1">
                        <Volume2 size={12} className="animate-pulse" />
                        YOUR TURN TO SPEAK
                      </span>
                      <span className="text-sm font-black text-white leading-none mt-0.5">{activeP.nickname}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 my-4 max-w-xs">
                    State a single verbal word/clue related to your secret word to the group!
                  </h3>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleDoneSpeaking}
                    fullWidth
                    className="max-w-xs py-2.5"
                  >
                    Done Speaking (Next Turn)
                  </Button>
                </Card>
              );
            })()}

            {/* Grid of Players & spoken list status */}
            <div className="flex flex-col gap-2.5">
              <h3 className="text-4xs font-extrabold uppercase text-slate-500 tracking-widest pl-1 leading-none">
                Player Circle
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {players.map((p) => {
                  const activeId = turnOrder[currentTurnIndex];
                  const isActive = p.id === activeId;

                  // Find index in turn order
                  const turnIdx = turnOrder.indexOf(p.id);
                  const hasSpoken = turnIdx < currentTurnIndex;

                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all ${
                        isActive
                          ? 'bg-violet-600/10 border-violet-500 ring-2 ring-violet-500/35 scale-102 shadow-lg shadow-violet-500/10'
                          : hasSpoken
                          ? 'bg-slate-900/30 border-slate-800 opacity-60'
                          : 'bg-slate-900/40 border-slate-800/80'
                      }`}
                    >
                      <AvatarDisplay avatarId={p.avatar} size={32} />
                      <div className="min-w-0 flex flex-col flex-1">
                        <span className="text-xs font-bold text-slate-200 truncate">{p.nickname}</span>
                        <span className="text-5xs font-bold uppercase tracking-wider mt-0.5 leading-none">
                          {isActive ? (
                            <span className="text-violet-400 font-black animate-pulse">Speaking...</span>
                          ) : hasSpoken ? (
                            <span className="text-slate-500">Spoken</span>
                          ) : (
                            <span className="text-slate-500">Waiting</span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Secret Pocket at the bottom for the active speaker if they forgot */}
            {(() => {
              const activeId = turnOrder[currentTurnIndex];
              const activeP = players.find(p => p.id === activeId);
              if (!activeP) return null;

              return (
                <Card className="p-4 border-slate-200 dark:border-slate-850 bg-white/70 dark:bg-slate-950/40 flex flex-row items-center justify-between mt-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 rounded-lg">
                      <Sparkles size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-4xs font-bold text-slate-500 uppercase tracking-widest">
                        Verify secret word
                      </span>
                      <span className="text-xs font-black theme-text-primary">
                        {showSecretWord
                          ? (activeP.isImposter && gameMode === 'classic' ? 'No Word' : activeP.word)
                          : '••••••••••'
                        }
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowSecretWord(!showSecretWord)}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
                  >
                    {showSecretWord ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </Card>
              );
            })()}
          </div>
        )}

        {/* ── 4. VOTING PHASE ─────────────────────────────── */}
        {status === 'VOTING' && (
          <div className="flex flex-col gap-5">
            <div className="border-b border-slate-800/80 pb-3 mb-2">
              <span className="text-3xs font-extrabold text-rose-500 uppercase tracking-widest leading-none block">
                Social Dedication
              </span>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider mt-0.5 leading-none">
                Voting Time
              </h2>
            </div>

            <Card className="border-rose-500/20 bg-rose-950/5 p-4 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl" />

              <div className="flex items-start gap-3">
                <AlertTriangle className="text-rose-500 w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <h4 className="text-xs font-black uppercase text-rose-400 leading-none">Real-life Voting</h4>
                  <p className="text-2xs text-slate-400 font-medium leading-normal mt-1 max-w-sm">
                    Discuss verbally with your group. Count down from 3, and everyone point at the player they suspect is the Imposter.
                  </p>
                </div>
              </div>
            </Card>

            {/* List of candidates */}
            <Card className="flex flex-col gap-4">
              <h3 className="text-3xs font-black tracking-widest uppercase text-slate-400 border-b border-slate-800 pb-2 leading-none">
                Select Who Got Voted Out
              </h3>

              <div className="grid grid-cols-1 gap-2.5">
                {players.filter(p => p.isAlive).map((p) => {
                  const isSelected = selectedVoteId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => { playSound('click'); setSelectedVoteId(p.id); }}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-rose-500/10 border-rose-500 shadow-md shadow-rose-500/10 ring-2 ring-rose-500/25'
                          : 'bg-slate-900/40 border-slate-850 hover:bg-slate-850/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <AvatarDisplay avatarId={p.avatar} size={36} />
                        <span className="text-sm font-black text-slate-200 leading-none">{p.nickname}</span>
                      </div>
                      {isSelected && (
                        <span className="text-5xs font-black uppercase tracking-widest text-rose-400 bg-rose-500/20 border border-rose-500/40 px-2.5 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>

            <Button
              variant={selectedVoteId ? 'danger' : 'secondary'}
              size="lg"
              onClick={handleConfirmElimination}
              disabled={!selectedVoteId}
              fullWidth
              className="gap-2 mt-2"
            >
              <UserCheck size={18} /> Confirm Elimination & Reveal
            </Button>
          </div>
        )}

        {/* ── 5. RESULTS PHASE ────────────────────────────── */}
        {status === 'RESULTS' && votedPlayer && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-slate-800/80 pb-3 mb-1">
              <span className="text-3xs font-extrabold text-violet-400 uppercase tracking-widest leading-none block">
                Final Showdown
              </span>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider mt-0.5 leading-none">
                Identity Reveal
              </h2>
            </div>

            <Card
              className="text-center py-8 px-6 items-center flex flex-col justify-center min-h-[290px] relative"
              glow={wasImposterVotedOut ? 'majority' : 'imposter'}
            >
              <div className="absolute inset-4 border border-dashed border-slate-800/60 rounded-2xl pointer-events-none" />

              <div className="w-18 h-18 rounded-3xl overflow-hidden border border-slate-700/60 shadow-xl mb-4 relative">
                <AvatarDisplay avatarId={votedPlayer.avatar} size={72} />
              </div>

              <span className="text-3xs font-extrabold uppercase text-slate-400 tracking-wider mb-1 leading-none">
                The group voted out
              </span>
              <h2 className="text-2xl font-black text-white uppercase mb-4 leading-none tracking-wide">
                {votedPlayer.nickname}
              </h2>

              {wasImposterVotedOut ? (
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full mb-3 shadow-inner">
                    <CheckCircle size={36} className="animate-bounce" />
                  </div>
                  <span className="text-xs font-black uppercase text-emerald-400 tracking-widest leading-none">
                    They were the Imposter!
                  </span>
                  <h1 className="text-4xl font-black text-emerald-500 tracking-wide mt-2 leading-none uppercase">
                    Civilian Victory
                  </h1>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-rose-500/10 text-rose-500 rounded-full mb-3 shadow-inner animate-pulse">
                    <ShieldAlert size={36} className="animate-bounce" />
                  </div>
                  <span className="text-xs font-black uppercase text-rose-400 tracking-widest leading-none">
                    They were Innocent!
                  </span>
                  <h1 className="text-4xl font-black text-rose-500 tracking-wide mt-2 leading-none uppercase">
                    Imposter Victory
                  </h1>
                </div>
              )}
            </Card>

            {/* Word details block */}
            <div className="grid grid-cols-2 gap-3.5">
              <Card className="p-4 items-center text-center border-slate-800 bg-slate-900/20">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Civilian Word</span>
                <span className="text-lg font-black text-emerald-400 tracking-tight mt-1.5 block font-sans">"{majorityWord}"</span>
              </Card>
              <Card className="p-4 items-center text-center border-slate-800 bg-slate-900/20">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Imposter Word ({gameMode})</span>
                <span className="text-lg font-black text-rose-400 tracking-tight mt-1.5 block font-sans">
                  {gameMode === 'classic' ? 'None (Bluff)' : `"${imposterWord}"`}
                </span>
              </Card>
            </div>

            {/* Action Footer */}
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => { playSound('click'); setStatus('LOBBY'); }}
                className="sm:w-1/3 gap-1.5"
              >
                <RotateCcw size={16} /> Lobby
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={restartWithSamePlayers}
                className="flex-1 gap-2"
              >
                <RefreshCw size={16} /> Play Again
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Categories dialog */}
      {showCategoryDialog && (
        <CategoryDialog
          selected={selectedCategories}
          onToggle={handleCategoryToggle}
          onClose={() => setShowCategoryDialog(false)}
        />
      )}
    </div>
  );
};
