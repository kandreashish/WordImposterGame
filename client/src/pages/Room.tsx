import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext.js';
import { LobbyPanel } from '../components/Game/LobbyPanel.js';
import { RevealPanel } from '../components/Game/RevealPanel.js';
import { DiscussionPanel } from '../components/Game/DiscussionPanel.js';
import { VotingPanel } from '../components/Game/VotingPanel.js';
import { VoteResolvedPanel } from '../components/Game/VoteResolvedPanel.js';
import { ResultsPanel } from '../components/Game/ResultsPanel.js';
import { Card } from '../components/Common/Card.js';
import { Input } from '../components/Common/Input.js';
import { Button } from '../components/Common/Button.js';
import { Modal } from '../components/Common/Modal.js';
import { Wifi, WifiOff, AlertTriangle, ArrowLeft, Sun, Moon, RotateCcw, Vote, Sparkles, MessageSquareText, Trophy, UserCheck } from 'lucide-react';
import { ErrorDialog } from '../components/Common/ErrorDialog.js';
import { playSound } from '../utils/sound.js';
import { AvatarDisplay } from '../components/Common/AvatarKit.js';

export const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const {
    room,
    playerId,
    isConnected,
    joinRoom,
    startGame,
    nextRound,
    leaveRoom,
    error,
    setError,
    serverError,
    clearServerError,
    theme,
    toggleTheme,
    reactions,
    sendEmojiReaction
  } = useSocket();

  const [nickname, setNickname] = useState(() => localStorage.getItem('wi_nickname') || '');
  const [nicknameError, setNicknameError] = useState('');
  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState(false);
  const [splash, setSplash] = useState<{ show: boolean; title: string; subtitle: string; type: string } | null>(null);
  const prevStatusRef = useRef<string | null>(null);

  // Auto join if they refreshed and local credentials match
  useEffect(() => {
    if (room && roomId && room.code !== roomId) {
      // If we are in the wrong room, leave
      navigate(`/room/${room.code}`);
    }
  }, [room, roomId, navigate]);

  // Flash splash card on phase transitions
  useEffect(() => {
    if (!room) return;
    const prevStatus = prevStatusRef.current;
    const currentStatus = room.status;

    if (prevStatus && prevStatus !== currentStatus) {
      let title = '';
      let subtitle = '';
      let type = 'default';

      if (currentStatus === 'DISCUSSION') {
        title = "Clue Discussion";
        subtitle = "Present your clues verbally or type them. Try not to sound suspicious!";
        type = 'discussion';
      } else if (currentStatus === 'VOTING') {
        title = "IT'S VOTING TIME!";
        subtitle = "Identify the Imposter! Cast your vote now.";
        type = 'voting';
      } else if (currentStatus === 'VOTE_RESOLVED') {
        title = "Voting Ended";
        subtitle = "Let's see who the group voted to eliminate...";
        type = 'resolved';
      } else if (currentStatus === 'RESULTS') {
        title = "Final Results";
        subtitle = "Did the Imposter survive, or did the civilian team win?";
        type = 'results';
      } else if (currentStatus === 'REVEAL') {
        title = "Secret Word Assigned";
        subtitle = "Check your secret pocket at the bottom of the screen!";
        type = 'reveal';
      }

      if (title) {
        setSplash({ show: true, title, subtitle, type });
        const timer = setTimeout(() => {
          setSplash(null);
        }, 2200);
        return () => clearTimeout(timer);
      }
    }
    prevStatusRef.current = currentStatus;
  }, [room?.status]);

  const handleJoinDirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || nickname.trim() === '') {
      setNicknameError('Nickname is required');
      return;
    }
    if (!roomId) return;
    joinRoom(nickname.trim(), roomId);
  };

  // Check if we are currently attempting reconnection or initial connection
  const savedRoomCode = localStorage.getItem('wi_room_code');
  const isAutoReconnecting = savedRoomCode === roomId && (!isConnected || serverError === null);

  if (!room) {
    if (isAutoReconnecting && !error && serverError === null) {
      return (
        <div className="min-h-screen game-bg-radial flex flex-col items-center justify-center p-4 relative overflow-x-hidden">
          <div className="flex flex-col items-center gap-4 text-center z-10">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-violet-500/20 animate-ping" />
              <div className="w-16 h-16 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Connecting to Room...
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Entering room <span className="text-violet-500 dark:text-violet-400 font-bold">{roomId}</span>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen game-bg-radial flex flex-col items-center justify-start md:justify-center p-4 relative overflow-x-hidden">
        {/* Theme Toggle Button */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => {
              toggleTheme();
              playSound('click');
            }}
            className="p-2.5 bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-md"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>

        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-82 h-82 bg-indigo-600/5 rounded-full blur-3xl" />

        <div className="w-full max-w-md relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors uppercase tracking-wider mb-4 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Go to Home
          </Link>

          <Card>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Join Room
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-6">
              You've been invited to room <span className="text-violet-600 dark:text-violet-400 font-bold">{roomId}</span>. Enter a nickname to join!
            </p>

            <form onSubmit={handleJoinDirect} className="flex flex-col gap-4">
              <Input
                label="Your Nickname"
                placeholder="e.g. Maverick"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  if (nicknameError) setNicknameError('');
                }}
                error={nicknameError}
                maxLength={15}
                autoFocus
              />
              <Button type="submit" size="lg" className="mt-2" fullWidth>
                Join Game
              </Button>
            </form>
          </Card>
        </div>

        {/* Global Error Modal for Join Errors */}
        <Modal
          isOpen={error !== null}
          onClose={() => {
            setError(null);
            navigate('/');
          }}
          title="Cannot Join Room"
        >
          <div className="flex flex-col items-center text-center p-2">
            <AlertTriangle className="text-rose-500 w-12 h-12 mb-3" />
            <p className="text-sm font-semibold text-slate-300 leading-relaxed mb-4">
              {error}
            </p>
            <Button variant="secondary" size="md" onClick={() => {
              setError(null);
              navigate('/');
            }} fullWidth>
              Go to Home
            </Button>
          </div>
        </Modal>

        {/* Server Error Dialog */}
        <ErrorDialog
          isOpen={serverError !== null}
          type={serverError?.type}
          title={serverError?.title}
          message={serverError?.message ?? ''}
          onRetry={() => { clearServerError(); navigate('/'); }}
          onGoHome={() => { clearServerError(); navigate('/'); }}
          buttonText="Go to Home"
        />
      </div>
    );
  }

  const self = room.players.find(p => p.id === playerId);
  const isHost = self?.isHost || false;

  // Render Room view when connected
  return (
    <div className="min-h-screen game-bg-radial flex flex-col p-4 relative overflow-x-hidden overflow-y-auto">
      {/* Sticky Room Header */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80 relative z-10">
        <Link to="/" className="flex items-center gap-1.5 cursor-pointer">
          <span className="text-sm font-black text-white uppercase tracking-wider">
            Word <span className="text-violet-400">Imposter</span>
          </span>
        </Link>

        {/* Theme & Connection indicators */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-xl transition-all cursor-pointer"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          {isConnected ? (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-5xs font-bold uppercase tracking-wider">
              <Wifi size={10} className="animate-pulse" />
              Connected
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-5xs font-bold uppercase tracking-wider">
              <WifiOff size={10} className="animate-bounce" />
              Reconnecting
            </div>
          )}
        </div>
      </header>

      {/* Main Game Screen */}
      <main className="flex-1 w-full max-w-md mx-auto flex flex-col justify-start py-2 pb-8 relative z-10">
        {room.status === 'LOBBY' && <LobbyPanel />}
        {room.status === 'REVEAL' && <RevealPanel />}
        {room.status === 'DISCUSSION' && <DiscussionPanel />}
        {room.status === 'VOTING' && <VotingPanel />}
        {room.status === 'VOTE_RESOLVED' && <VoteResolvedPanel />}
        {room.status === 'RESULTS' && <ResultsPanel />}

        {/* Host New Game Button at bottom during active gameplay */}
        {isHost && room.status !== 'LOBBY' && (
          <div className="w-full max-w-xl mx-auto mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex justify-center">
            <button
              type="button"
              onClick={() => setIsNewGameModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <RotateCcw size={14} />
              Load a new game
            </button>
          </div>
        )}

        {/* Phase Transition Splash Overlay */}
        {splash?.show && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center animate-fade-in backdrop-blur-md rounded-2xl border border-slate-800">
            <div className="flex flex-col items-center gap-5 animate-scale-up max-w-xs">
              <div className={`p-5 rounded-3xl ${
                splash.type === 'voting'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-lg shadow-rose-500/10'
                  : splash.type === 'discussion'
                  ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-lg shadow-violet-500/10'
                  : splash.type === 'reveal'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-500/10'
                  : splash.type === 'results'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10'
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10'
              }`}>
                {splash.type === 'voting' && <Vote size={48} className="animate-bounce" />}
                {splash.type === 'discussion' && <MessageSquareText size={48} className="animate-pulse" />}
                {splash.type === 'reveal' && <Sparkles size={48} className="animate-pulse" />}
                {splash.type === 'resolved' && <UserCheck size={48} className="animate-bounce" />}
                {splash.type === 'results' && <Trophy size={48} className="animate-bounce" />}
              </div>
              <div className="flex flex-col gap-2">
                <h1 className={`text-2xl font-black uppercase tracking-wider ${
                  splash.type === 'voting'
                    ? 'text-rose-500'
                    : splash.type === 'discussion'
                    ? 'text-violet-400'
                    : splash.type === 'reveal'
                    ? 'text-amber-400'
                    : splash.type === 'results'
                    ? 'text-emerald-400'
                    : 'text-white'
                }`}>
                  {splash.title}
                </h1>
                <p className="text-xs font-bold text-slate-400 leading-relaxed">
                  {splash.subtitle}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Real-time Floating Reactions Overlay */}
      {room && (
        <div className="absolute inset-x-0 bottom-24 top-0 pointer-events-none overflow-hidden z-40 max-w-md mx-auto">
          {reactions.map((r, idx) => {
            const charCodeSum = r.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const leftOffset = 15 + (charCodeSum % 70);
            return (
              <div
                key={r.id}
                className="absolute bottom-4 pointer-events-none flex flex-col items-center animate-float-emoji"
                style={{
                  left: `${leftOffset}%`,
                  animationDelay: `${(idx * 0.05) % 0.2}s`,
                }}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700/60 bg-slate-950/90 shadow-md flex items-center justify-center p-0.5">
                  <AvatarDisplay avatarId={r.emoji} size={36} />
                </div>
                <span className="text-[8px] bg-slate-950/85 text-slate-300 border border-slate-800/80 px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider whitespace-nowrap mt-1 shadow-md">
                  {r.nickname}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Avatar Reaction Bar */}
      {room && (
        <div className="w-full max-w-md mx-auto mt-2 pt-3 border-t border-slate-800/40 flex justify-center gap-3 relative z-30 pb-2">
          {['ghost', 'panda', 'unicorn', 'frog', 'shark', 'ninja'].map((avId) => (
            <button
              key={avId}
              onClick={() => sendEmojiReaction(avId)}
              className="w-10 h-10 rounded-xl bg-slate-900/60 border border-slate-850 hover:bg-slate-850/50 hover:border-slate-700 flex items-center justify-center hover:scale-115 active:scale-90 active:bg-violet-600/20 active:border-violet-500 transition-all cursor-pointer shadow-md duration-150 p-1"
            >
              <AvatarDisplay avatarId={avId} size={32} />
            </button>
          ))}
        </div>
      )}

      {/* Host New Game Confirmation Dialog */}
      <Modal
        isOpen={isNewGameModalOpen}
        onClose={() => setIsNewGameModalOpen(false)}
        title="Load a New Game"
      >
        <div className="flex flex-col items-center text-center p-3">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-full mb-3">
            <RotateCcw className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold theme-text-primary uppercase tracking-wide mb-1">
            Choose Game Action
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-5 max-w-xs">
            Would you like to restart immediately with a new secret word using the same players, or return all players to a fresh room lobby?
          </p>

          <div className="flex flex-col gap-2.5 w-full">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setIsNewGameModalOpen(false);
                startGame();
              }}
              fullWidth
            >
              Restart with New Word (Same Players)
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setIsNewGameModalOpen(false);
                nextRound();
              }}
              fullWidth
            >
              Back to Room Lobby
            </Button>

            <Button
              variant="danger"
              size="md"
              onClick={() => {
                setIsNewGameModalOpen(false);
                leaveRoom();
                navigate('/');
              }}
              fullWidth
            >
              Start a New Room (Exit Current)
            </Button>

            <button
              type="button"
              onClick={() => setIsNewGameModalOpen(false)}
              className="mt-1 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-1 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Global Error Modal for In-Game notifications */}
      <Modal
        isOpen={error !== null}
        onClose={() => setError(null)}
        title="Notice"
      >
        <div className="flex flex-col items-center text-center p-2">
          <AlertTriangle className="text-amber-500 w-12 h-12 mb-3 animate-bounce" />
          <p className="text-sm font-semibold text-slate-300 leading-relaxed mb-4">
            {error}
          </p>
          <Button variant="secondary" size="md" onClick={() => setError(null)} fullWidth>
            Close
          </Button>
        </div>
      </Modal>
      {/* Server Error Dialog — shown for disconnects / room closed */}
      <ErrorDialog
        isOpen={serverError !== null}
        type={serverError?.type}
        title={serverError?.title}
        message={serverError?.message ?? ''}
        onRetry={() => { clearServerError(); navigate('/'); }}
        onGoHome={() => { clearServerError(); navigate('/'); }}
        buttonText="Go to Home"
      />
    </div>
  );
};
