import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext.js';
import { Card } from '../components/Common/Card.js';
import { Input } from '../components/Common/Input.js';
import { Button } from '../components/Common/Button.js';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import { trackEvent } from '../utils/analytics.js';

export const JoinRoom: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { room, joinRoom, theme, toggleTheme } = useSocket();

  const [nickname, setNickname] = useState(() => localStorage.getItem('wi_nickname') || '');
  const [roomCode, setRoomCode] = useState(() => searchParams.get('code') || '');
  const [errors, setErrors] = useState<{ nickname?: string; roomCode?: string }>({});

  useEffect(() => {
    trackEvent('enter_screen_join_room', { screen: 'JoinRoom' });
  }, []);

  useEffect(() => {
    if (room) {
      navigate(`/room/${room.code}`);
    }
  }, [room, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { nickname?: string; roomCode?: string } = {};

    if (!nickname || nickname.trim() === '') {
      newErrors.nickname = 'Nickname is required';
    }
    if (!roomCode || roomCode.trim().length !== 6) {
      newErrors.roomCode = 'Room Code must be 6 digits';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    joinRoom(nickname.trim(), roomCode.trim());
  };

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
        <Link to="/" onClick={() => trackEvent('click_back_to_home_nav', { screen: 'JoinRoom' })} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider mb-4 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <Card>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-6">
            Join a Room
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Nickname Input */}
            <Input
              label="Your Nickname"
              placeholder="e.g. Maverick"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                if (errors.nickname) setErrors({ ...errors, nickname: undefined });
              }}
              error={errors.nickname}
              maxLength={15}
            />

            {/* Room Code */}
            <Input
              label="6-Digit Room Code"
              placeholder="e.g. 847291"
              value={roomCode}
              onChange={(e) => {
                // Enforce digits only
                const val = e.target.value.replace(/\D/g, '');
                setRoomCode(val);
                if (errors.roomCode) setErrors({ ...errors, roomCode: undefined });
              }}
              error={errors.roomCode}
              maxLength={6}
              className="text-center tracking-widest text-lg font-bold"
            />

            {/* Submit */}
            <Button type="submit" size="lg" className="mt-2" fullWidth>
              Join Game
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
