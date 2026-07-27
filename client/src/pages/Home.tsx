import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Common/Card.js';
import { Button } from '../components/Common/Button.js';
import { HelpCircle, Sparkles, Sun, Moon } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext.js';
import { trackEvent } from '../utils/analytics.js';

export const Home: React.FC = () => {
  const { theme, toggleTheme } = useSocket();

  React.useEffect(() => {
    trackEvent('enter_screen_home', { screen: 'Home' });
  }, []);

  const handleCreateNav = () => {
    trackEvent('click_create_room_nav', { screen: 'Home' });
  };

  const handleJoinNav = () => {
    trackEvent('click_join_room_nav', { screen: 'Home' });
  };

  return (
    <div className="min-h-screen game-bg-radial flex flex-col items-center justify-start md:justify-center p-4 relative overflow-x-hidden">
      {/* Decorative blurred background lights */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-82 h-82 bg-indigo-600/10 rounded-full blur-3xl" />


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

      {/* Main Wrapper */}
      <div className="w-full max-w-md relative z-10">
        <Card className="items-center text-center glow-card border-violet-500/10" glow="primary">
          {/* Logo / Icon */}
          <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25 mb-6 animate-float">
            <Sparkles className="text-white w-8 h-8" />
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 leading-none uppercase">
            Word <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Imposter</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium max-w-xs mb-8">
            Uncover the imposter, bluff your friends, and master the social deduction showdown.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col gap-4 w-full">
            <Link to="/create" onClick={handleCreateNav} className="w-full">
              <Button size="lg" fullWidth>
                Create Room
              </Button>
            </Link>
            <Link to="/join" onClick={handleJoinNav} className="w-full">
              <Button variant="secondary" size="lg" fullWidth>
                Join Room
              </Button>
            </Link>
          </div>

          {/* Bottom explanation */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <HelpCircle size={14} className="text-slate-600" />
            3+ Players • No Login Required • Free
          </div>
        </Card>
      </div>
    </div>
  );
};
