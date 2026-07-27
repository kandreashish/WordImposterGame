import React, { useState, useEffect } from 'react';
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
import { Wifi, WifiOff, AlertTriangle, ArrowLeft, Sun, Moon } from 'lucide-react';

export const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const {
    room,
    isConnected,
    joinRoom,
    error,
    setError,
    theme,
    toggleTheme
  } = useSocket();

  const [nickname, setNickname] = useState(() => localStorage.getItem('wi_nickname') || '');
  const [nicknameError, setNicknameError] = useState('');

  // Auto join if they refreshed and local credentials match
  useEffect(() => {
    if (room && roomId && room.code !== roomId) {
      // If we are in the wrong room, leave
      navigate(`/room/${room.code}`);
    }
  }, [room, roomId, navigate]);

  const handleJoinDirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || nickname.trim() === '') {
      setNicknameError('Nickname is required');
      return;
    }
    if (!roomId) return;
    joinRoom(nickname.trim(), roomId);
  };

  if (!room) {
    return (
      <div className="min-h-screen game-bg-radial flex flex-col items-center justify-start md:justify-center p-4 relative overflow-x-hidden">
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
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider mb-4 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Go to Home
          </Link>

          <Card>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
              Join Room
            </h2>
            <p className="text-xs text-slate-400 font-medium mb-6">
              You've been invited to room <span className="text-violet-400 font-bold">{roomId}</span>. Enter a nickname to join!
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
          onClose={() => setError(null)}
          title="Game Error"
        >
          <div className="flex flex-col items-center text-center p-2">
            <AlertTriangle className="text-rose-500 w-12 h-12 mb-3" />
            <p className="text-sm font-semibold text-slate-300 leading-relaxed mb-4">
              {error}
            </p>
            <Button variant="secondary" size="md" onClick={() => setError(null)} fullWidth>
              Understood
            </Button>
          </div>
        </Modal>
      </div>
    );
  }

  // Render Room view when connected
  return (
    <div className="min-h-screen game-bg-radial flex flex-col p-4 relative overflow-x-hidden">
      {/* Sticky Room Header */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80 relative z-10">
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
      <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col justify-start py-6 relative z-10">
        {room.status === 'LOBBY' && <LobbyPanel />}
        {room.status === 'REVEAL' && <RevealPanel />}
        {room.status === 'DISCUSSION' && <DiscussionPanel />}
        {room.status === 'VOTING' && <VotingPanel />}
        {room.status === 'VOTE_RESOLVED' && <VoteResolvedPanel />}
        {room.status === 'RESULTS' && <ResultsPanel />}
      </main>

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
    </div>
  );
};
