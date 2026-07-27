import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../contexts/SocketContext.js';
import { Card } from '../Common/Card.js';
import { Timer } from '../Common/Timer.js';
import { Button } from '../Common/Button.js';
import { Eye, EyeOff, MessageSquareText, Sparkles, User, Send, Volume2, HelpCircle, CheckCircle2 } from 'lucide-react';

export const DiscussionPanel: React.FC = () => {
  const { room, playerId, submitClue, doneSpeaking } = useSocket();
  const [showWord, setShowWord] = useState(false);
  const [clueText, setClueText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  if (!room) return null;

  const self = room.players.find(p => p.id === playerId);
  if (!self) return null;

  const activePlayer = room.players.find(p => p.id === room.activePlayerId);
  const isActiveSelf = room.activePlayerId === playerId;

  // Scroll chat history to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room.chat?.length]);

  const handleClueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clueText || clueText.trim() === '') return;
    submitClue(clueText.trim());
    setClueText('');
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      {/* Header with Timer */}
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-600/10 text-violet-400 rounded-xl">
            <MessageSquareText size={20} className="animate-pulse" />
          </div>
          <div>
            <span className="text-2xs font-bold text-slate-500 uppercase tracking-widest leading-none">
              Turn {room.currentTurnIndex + 1} of {room.turnOrder.length}
            </span>
            <h2 className="text-xl font-black text-white uppercase tracking-wider mt-0.5">
              Live Clues
            </h2>
          </div>
        </div>
        <Timer value={room.timer} total={30} />
      </div>

      {/* Turn Indicator / Clue Input Box */}
      {isActiveSelf ? (
        <Card className="border-violet-500/50 bg-violet-600/5 py-5 px-4 flex flex-col items-center text-center relative overflow-hidden glow-card">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl animate-pulse" />
          <span className="text-3xs font-extrabold text-violet-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5 animate-pulse">
            <Volume2 size={12} />
            Your Turn to Speak / Describe
          </span>
          <h3 className="text-base font-bold text-slate-100 mb-4">
            Provide a clue for your word!
          </h3>
          
          <form onSubmit={handleClueSubmit} className="flex gap-2 w-full max-w-sm mb-3">
            <input
              type="text"
              value={clueText}
              onChange={(e) => setClueText(e.target.value)}
              placeholder="Type your clue here... (e.g. Warm)"
              className="glass-input px-3.5 py-2 rounded-xl text-slate-100 font-medium text-sm focus:outline-none flex-1 bg-slate-950 border border-slate-800"
              maxLength={30}
              autoFocus
            />
            <Button type="submit" size="sm" className="gap-1.5 flex-shrink-0">
              <Send size={12} /> Send
            </Button>
          </form>

          <span className="text-5xs text-slate-500 font-bold uppercase tracking-wider mb-2">
            Or explain verbally and pass
          </span>

          <Button variant="secondary" size="sm" onClick={() => doneSpeaking()} className="w-full max-w-sm">
            Done Speaking (Pass Turn)
          </Button>
        </Card>
      ) : (
        <Card className="border-slate-800 bg-slate-900/40 py-5 px-4 flex flex-col items-center text-center">
          <span className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Volume2 size={12} className="animate-bounce text-violet-400" />
            {activePlayer?.nickname}'s Turn
          </span>
          <h3 className="text-base font-bold text-slate-300">
            Listening to {activePlayer?.nickname}...
          </h3>
          <p className="text-slate-400 text-xs mt-1.5 max-w-sm leading-relaxed font-medium">
            They can type their clue in the chat log below or present verbally. Wait for them to finish!
          </p>
        </Card>
      )}

      {/* Imposter Hint Section */}
      {self.isImposter && room.imposterHint && (
        <Card className="border-rose-500/20 bg-rose-950/10 p-4 flex items-start gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-full blur-xl" />
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg flex-shrink-0 mt-0.5">
            <HelpCircle size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-4xs font-extrabold text-rose-400 uppercase tracking-widest">
              Imposter Clue Hint
            </span>
            <p className="text-xs font-bold text-slate-200 mt-1 leading-relaxed">
              "{room.imposterHint}"
            </p>
          </div>
        </Card>
      )}

      {/* Clues Chat History Log */}
      <Card className="p-4 border-slate-800 bg-slate-950/40 flex flex-col gap-3">
        <h3 className="text-2xs font-extrabold text-slate-400 tracking-wider uppercase border-b border-slate-800 pb-2 flex items-center gap-1.5">
          <MessageSquareText size={12} className="text-slate-500" />
          Submitted Clues Log
        </h3>
        <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
          {room.chat && room.chat.length > 0 ? (
            room.chat.map((msg, idx) => (
              <div key={idx} className="flex flex-col gap-0.5 p-2 rounded-xl bg-slate-900/35 border border-slate-900">
                <div className="flex justify-between items-baseline">
                  <span className="text-3xs font-black text-violet-400 uppercase tracking-wider">{msg.nickname}</span>
                  <span className="text-5xs text-slate-600 font-bold">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-200 mt-0.5">"{msg.text}"</span>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500 text-2xs font-semibold uppercase tracking-wider">
              No clues submitted yet
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </Card>

      {/* Grid of Players in Room */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {room.players.map((player) => {
          const isSelf = player.id === playerId;
          const isSpeaking = player.id === room.activePlayerId;
          
          return (
            <div
              key={player.id}
              className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all ${
                !player.isConnected
                  ? 'bg-red-950/10 border-red-500/20 opacity-60'
                  : isSpeaking
                  ? 'bg-violet-600/10 border-violet-500 shadow-md shadow-violet-500/10 scale-102 ring-1 ring-violet-500/20'
                  : isSelf
                  ? 'bg-violet-600/5 border-violet-500/30'
                  : 'bg-slate-900/40 border-slate-800/80'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isSpeaking ? 'bg-violet-500 text-white' : isSelf ? 'bg-violet-500/30 text-violet-300' : 'bg-slate-800 text-slate-400'
              }`}>
                <User size={16} />
              </div>
              <div className="min-w-0 flex flex-col">
                <span className="text-xs font-bold text-slate-200 truncate flex items-center gap-1">
                  {player.nickname}
                  {isSelf && (
                    <span className="text-5xs bg-violet-500/20 text-violet-400 px-1 py-0.5 rounded uppercase font-bold tracking-wider">
                      You
                    </span>
                  )}
                </span>
                <span className="text-4xs font-semibold uppercase tracking-wider mt-0.5">
                  {!player.isConnected ? (
                    <span className="text-red-400">Offline</span>
                  ) : isSpeaking ? (
                    <span className="text-violet-400 animate-pulse">Speaking</span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-0.5"><CheckCircle2 size={8} /> Ready</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secret Word Pocket Reminder */}
      <Card className="p-4 border-slate-800 bg-slate-900/60 flex flex-row items-center justify-between mt-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-800 text-slate-400 rounded-lg">
            <Sparkles size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-4xs font-bold text-slate-500 uppercase tracking-widest">
              My Secret Word Pocket
            </span>
            <span className="text-xs font-bold text-slate-300">
              {showWord 
                ? (self.isImposter && room.settings.gameMode === 'classic' ? 'No Word' : self.word)
                : '••••••••••'
              }
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowWord(!showWord)}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          title={showWord ? 'Hide Word' : 'Show Word'}
        >
          {showWord ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </Card>
    </div>
  );
};
