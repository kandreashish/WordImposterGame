import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/Common/Card.js';
import { Button } from '../components/Common/Button.js';
import {
  Sparkles,
  Sun,
  Moon,
  Users,
  EyeOff,
  Vote,
  Trophy,
  Zap,
  HelpCircle,
  Volume2,
  VolumeX,
  Laugh,
  Ghost,
  ShieldAlert,
  Flame,
  Lightbulb,
  Play
} from 'lucide-react';
import { useSocket } from '../contexts/SocketContext.js';
import { trackEvent } from '../utils/analytics.js';
import { playSound, isSoundEnabled, setSoundEnabled } from '../utils/sound.js';
import confetti from 'canvas-confetti';

export const Home: React.FC = () => {
  const { room, theme, toggleTheme } = useSocket();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'tips'>('overview');
  const [soundEffect, setSoundEffect] = useState(() => isSoundEnabled());
  const [sillySecretCount, setSillySecretCount] = useState(0);
  const [totalGamesPlayed, setTotalGamesPlayed] = useState<number>(() => {
    const saved = localStorage.getItem('wi_total_games_played');
    return saved ? Number(saved) : 0;
  });

  const toggleSound = () => {
    const next = !soundEffect;
    setSoundEffect(next);
    setSoundEnabled(next);
    if (next) playSound('click');
  };
  const [showSecretMessage, setShowSecretMessage] = useState(false);

  React.useEffect(() => {
    trackEvent('enter_screen_home', { screen: 'Home' });

    // Fetch live games played counter from API
    fetch('/wordgame/api/stats')
      .then(res => res.json())
      .then(data => {
        if (typeof data.totalGamesPlayed === 'number') {
          setTotalGamesPlayed(data.totalGamesPlayed);
          localStorage.setItem('wi_total_games_played', String(data.totalGamesPlayed));
        }
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (room?.code) {
      navigate(`/room/${room.code}`);
    }
  }, [room, navigate]);

  const handleCreateNav = () => {
    playSound('click');
    trackEvent('click_create_room_nav', { screen: 'Home' });
  };

  const handleJoinNav = () => {
    playSound('click');
    trackEvent('click_join_room_nav', { screen: 'Home' });
  };

  const triggerSecret = () => {
    playSound('click');
    const next = sillySecretCount + 1;
    setSillySecretCount(next);
    if (next >= 5) {
      playSound('gameStart');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f43f5e', '#8b5cf6']
      });
      setShowSecretMessage(true);
      setTimeout(() => setShowSecretMessage(false), 4000);
      setSillySecretCount(0);
    }
  };

  return (
    <div className="min-h-screen game-bg-radial flex flex-col items-center justify-start p-4 md:p-8 relative overflow-x-hidden overflow-y-auto select-none">
      {/* Decorative blurred background lights & ambient goofy floating particles */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-10 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Sparkles elements drifting in the background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[8%] text-violet-500/25 animate-float" style={{ animationDuration: '6s', animationDelay: '0s' }}><Sparkles size={20} /></div>
        <div className="absolute top-[40%] right-[12%] text-indigo-500/20 animate-float" style={{ animationDuration: '8s', animationDelay: '1s' }}><Sparkles size={24} /></div>
        <div className="absolute bottom-[20%] left-[15%] text-fuchsia-500/25 animate-float" style={{ animationDuration: '7s', animationDelay: '2.5s' }}><Sparkles size={16} /></div>
        <div className="absolute bottom-[45%] left-[80%] text-pink-500/20 animate-float" style={{ animationDuration: '9s', animationDelay: '0.5s' }}><Sparkles size={22} /></div>
      </div>

      {/* Floating Goofy Badges for visual flare */}
      <div className="hidden lg:block absolute top-24 left-12 animate-float pointer-events-none">
        <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-amber-400 border-amber-500/20 shadow-lg shadow-amber-500/10 rotate-[-6deg]">
          <Ghost size={16} className="text-amber-400 animate-bounce" />
          <span>"I swear I'm a civilian!"</span>
        </div>
      </div>
      <div className="hidden lg:block absolute top-36 right-12 animate-float [animation-delay:1.5s] pointer-events-none">
        <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-violet-400 border-violet-500/20 shadow-lg shadow-violet-500/10 rotate-[8deg]">
          <Flame size={16} className="text-rose-400 animate-pulse" />
          <span>Spicy Bluffs Guaranteed</span>
        </div>
      </div>
      <div className="hidden lg:block absolute bottom-24 left-16 animate-float [animation-delay:2.8s] pointer-events-none">
        <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/10 rotate-[4deg]">
          <Laugh size={16} className="text-emerald-400" />
          <span>Friendships Ruined: 99.9%</span>
        </div>
      </div>

      {/* Secret Toast Notification */}
      {showSecretMessage && (
        <div className="fixed top-6 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 text-white font-extrabold px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/30 text-sm">
            <Zap className="animate-zap" size={20} />
            <span>Easter Egg Unlocked: You are 100% suspicious right now!</span>
          </div>
        </div>
      )}

      {/* Top Bar Controls */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 z-20">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="badge-you text-xs px-3 py-1 rounded-full flex items-center gap-1.5 font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            LIVE PARTY GAME
          </span>
          {totalGamesPlayed > 0 && (
            <span className="text-2xs font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
              <Flame size={12} className="text-amber-400 animate-pulse" />
              {totalGamesPlayed} Games Played
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-2.5 bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-all cursor-pointer shadow-lg"
            title={soundEffect ? 'Mute Sound FX' : 'Enable Sound FX'}
          >
            {soundEffect ? <Volume2 size={16} className="text-violet-400" /> : <VolumeX size={16} />}
          </button>

          <button
            onClick={() => {
              toggleTheme();
              playSound('click');
            }}
            className="p-2.5 bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-all cursor-pointer shadow-lg"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 flex flex-col gap-6">

        {/* Hero Card */}
        <Card className="items-center text-center glow-card border-violet-500/20 relative overflow-hidden" glow="primary">
          {/* Top banner accent */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-rose-500" />

          {/* Clickable Logo / Icon */}
          <button
            onClick={triggerSecret}
            className="group relative cursor-pointer focus:outline-none mb-4 mt-2"
            title="Click me for a secret!"
          >
            <div className="w-20 h-20 bg-gradient-to-tr from-violet-600 via-indigo-600 to-rose-500 rounded-3xl flex items-center justify-center shadow-xl shadow-violet-500/30 group-hover:scale-110 group-active:scale-95 transition-all duration-300 animate-float">
              <Sparkles className="text-white w-10 h-10 group-hover:rotate-12 transition-transform" />
            </div>
            <span className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow border border-amber-300">
              TAP ME!
            </span>
          </button>

          {/* Title & Tagline */}
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-2 leading-none uppercase">
            Word <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-rose-400">Imposter</span>
          </h1>

          <p className="text-slate-300 text-base md:text-lg font-medium max-w-md mb-6 leading-relaxed">
            The ultra-goofy social deduction game where one of you is completely clueless and trying to fake it till they make it!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3.5 w-full max-w-md mb-6">
            <Link to="/create" onClick={handleCreateNav} className="flex-1">
              <Button size="lg" fullWidth className="group text-base font-bold shadow-lg shadow-violet-600/25">
                <Play size={18} className="mr-2 fill-white group-hover:scale-110 transition-transform" />
                Create Room
              </Button>
            </Link>
            <Link to="/join" onClick={handleJoinNav} className="flex-1">
              <Button variant="secondary" size="lg" fullWidth className="text-base font-bold">
                <Users size={18} className="mr-2 text-violet-400" />
                Join Room
              </Button>
            </Link>
          </div>

          {/* Feature Quick Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-lg pt-4 border-t border-slate-800/80 text-center">
            <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-violet-950/20 border border-violet-500/20 shadow-xs">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Games Played</span>
              <span className="text-sm sm:text-base font-black text-violet-400 font-mono">{totalGamesPlayed}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/50">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Group Size</span>
              <span className="text-sm sm:text-base font-extrabold text-indigo-400">3-12 Players</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/50">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Setup Time</span>
              <span className="text-sm sm:text-base font-extrabold text-amber-400">Instant</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/50">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Cost</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-400">100% Free</span>
            </div>
          </div>
        </Card>

        {/* Informative & Interactive Guide Card */}
        <Card className="p-6 glow-card border-violet-500/10">
          {/* Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
            <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-2xl border border-slate-800/80">
              <button
                onClick={() => {
                  setActiveTab('overview');
                  playSound('click');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                How It Works
              </button>
              <button
                onClick={() => {
                  setActiveTab('rules');
                  playSound('click');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'rules'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Game Rules
              </button>
              <button
                onClick={() => {
                  setActiveTab('tips');
                  playSound('click');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'tips'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Goofy Survival Tips
              </button>
            </div>
          </div>

          {/* Tab Content 1: Overview Steps */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up">
              <div className="flex flex-col items-start p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-violet-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-3 font-black">
                  1
                </div>
                <h3 className="font-extrabold text-white text-base mb-1 flex items-center gap-1.5">
                  <EyeOff size={16} className="text-violet-400" /> Get Secret Role
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Everyone receives a secret word (e.g. <b>"Pizza"</b>), EXCEPT the Imposter who gets a blank or fake prompt!
                </p>
              </div>

              <div className="flex flex-col items-start p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-violet-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 font-black">
                  2
                </div>
                <h3 className="font-extrabold text-white text-base mb-1 flex items-center gap-1.5">
                  <Zap size={16} className="text-indigo-400" /> Give Clues
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Take turns saying one-word clues (e.g. <b>"Cheesy"</b>). Be subtle! Too obvious and the imposter guesses the word!
                </p>
              </div>

              <div className="flex flex-col items-start p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-violet-500/30 transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3 font-black">
                  3
                </div>
                <h3 className="font-extrabold text-white text-base mb-1 flex items-center gap-1.5">
                  <Vote size={16} className="text-rose-400" /> Vote & Accuse
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Debate, interrogate suspect clues, vote out the imposter, or watch them pull off an epic sneaky win!
                </p>
              </div>
            </div>
          )}

          {/* Tab Content 2: Rules */}
          {activeTab === 'rules' && (
            <div className="flex flex-col gap-3 animate-slide-up text-sm text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-3">
                <Trophy size={20} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-white block">Civilian Victory:</span>
                  Correctly identify and vote out ALL imposters before they guess the secret word.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-3">
                <Ghost size={20} className="text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-white block">Imposter Victory:</span>
                  Blend in without getting voted off, OR correctly guess the secret word when accused!
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-3">
                <ShieldAlert size={20} className="text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-white block">The Golden Rule of Clues:</span>
                  Your clue cannot be part of the secret word, and don't repeat clues already used in the round!
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 3: Tips */}
          {activeTab === 'tips' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-slide-up">
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-3">
                <Lightbulb size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-white block mb-0.5">Nod and Agree Aggressively</span>
                  If you are the imposter, pretend like the previous clue was the most genius thing you've ever heard.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-3">
                <Lightbulb size={18} className="text-violet-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-white block mb-0.5">Use Multi-Layered Clues</span>
                  Instead of "Yellow" for Banana, say "Minion". Imposters will be utterly confused!
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-3">
                <Lightbulb size={18} className="text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-white block mb-0.5">Blame the Loudest Player</span>
                  Classic social deduction tactic: point fingers at whoever is accusing people first.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-3">
                <Lightbulb size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-white block mb-0.5">Stay Calm Under Fire</span>
                  If accused, claim your clue was an inside joke or high-level reference.
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 px-2 pb-6">
          <div className="flex items-center gap-1.5">
            <HelpCircle size={14} className="text-slate-600" />
            <span>No sign-up • Works on Mobile & Desktop</span>
          </div>
          <div className="font-semibold text-slate-600">
            Word Imposter Party Edition
          </div>
        </div>

      </div>
    </div>
  );
};

