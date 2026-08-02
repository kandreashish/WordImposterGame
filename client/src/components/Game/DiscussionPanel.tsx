import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../contexts/SocketContext.js';
import { Card } from '../Common/Card.js';
import { Timer } from '../Common/Timer.js';
import { Button } from '../Common/Button.js';
import { AvatarDisplay } from '../Common/AvatarKit.js';
import { Eye, EyeOff, MessageSquareText, Sparkles, Send, Volume2, HelpCircle, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '../../utils/analytics.js';

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
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-violet-400 shadow-md shadow-violet-500/20">
              <AvatarDisplay avatarId={self.avatar || 'fox'} size={40} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-3xs font-extrabold text-violet-400 uppercase tracking-widest flex items-center gap-1">
                <Volume2 size={12} className="animate-pulse" />
                YOUR TURN
              </span>
              <span className="text-xs font-bold text-white">{self.nickname}</span>
            </div>
          </div>

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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-violet-500/60 shadow-lg shadow-violet-500/20 animate-pulse">
              <AvatarDisplay avatarId={activePlayer?.avatar || 'fox'} size={44} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-3xs font-extrabold text-violet-400 uppercase tracking-widest flex items-center gap-1">
                <Volume2 size={12} className="animate-bounce" />
                CURRENT TURN
              </span>
              <span className="text-sm font-extrabold text-white">{activePlayer?.nickname}</span>
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-300">
            Listening to {activePlayer?.nickname}...
          </h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm leading-relaxed font-medium">
            They can type their clue in the chat log below or present verbally. Wait for them to finish!
          </p>
        </Card>
      )}

      {/* Category Hint Section */}
      {room.imposterHint && (
        <Card className="border-amber-500/20 bg-amber-950/10 p-3.5 flex items-start gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl" />
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg flex-shrink-0 mt-0.5">
            <HelpCircle size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-4xs font-extrabold text-amber-400 uppercase tracking-widest">
              Category Hint
            </span>
            <p className="text-xs font-bold text-slate-100 mt-0.5 leading-relaxed">
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
        <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
          {room.chat && room.chat.length > 0 ? (
            room.chat.map((msg, idx) => {
              const msgPlayer = room.players.find(p => p.id === msg.playerId);
              // Calculate clue round index for this message
              const playerCluesUpToIdx = room.chat.slice(0, idx + 1).filter(m => m.playerId === msg.playerId);
              const roundNum = msg.roundNumber || playerCluesUpToIdx.length;
              const roundLabel = roundNum === 1 ? '1st Round Word' : roundNum === 2 ? '2nd Round Word' : roundNum === 3 ? '3rd Round Word' : `${roundNum}th Round Word`;

              return (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80">
                  <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5 border border-violet-500/30">
                    <AvatarDisplay avatarId={msgPlayer?.avatar || 'fox'} size={28} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-baseline flex-wrap gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-3xs font-black text-violet-400 uppercase tracking-wider truncate">{msg.nickname}</span>
                        <span className="text-[9px] bg-violet-500/15 text-violet-300 border border-violet-500/30 px-1.5 py-0.5 rounded font-extrabold tracking-wider">
                          {roundLabel}
                        </span>
                      </div>
                      <span className="text-5xs text-slate-600 font-bold">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-100 mt-1">"{msg.text}"</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-slate-500 text-2xs font-semibold uppercase tracking-wider">
              No clues submitted yet
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </Card>

      {/* Grid of Players in Room */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {room.players.map((player) => {
          const isSelf = player.id === playerId;
          const isSpeaking = player.id === room.activePlayerId;
          const playerClues = (room.chat || []).filter(c => c.playerId === player.id);

          return (
            <div
              key={player.id}
              className={`flex flex-col gap-2 p-3 rounded-2xl border transition-all ${
                !player.isConnected
                  ? 'bg-red-950/10 border-red-500/20 opacity-60'
                  : isSpeaking
                  ? 'bg-violet-600/10 border-violet-500 shadow-md shadow-violet-500/10 scale-102 ring-1 ring-violet-500/20'
                  : isSelf
                  ? 'bg-violet-600/5 border-violet-500/30'
                  : 'bg-slate-900/40 border-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-slate-700/60">
                  <AvatarDisplay avatarId={player.avatar || 'fox'} size={36} />
                </div>
                <div className="min-w-0 flex flex-col flex-1">
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
                      <span className="text-violet-400 animate-pulse">Speaking...</span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-0.5"><CheckCircle2 size={8} /> Ready</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Player's submitted clues by round (1st Round Word, 2nd Round Word...) */}
              <div className="flex flex-col gap-1 pt-1.5 border-t border-slate-800/60">
                {playerClues.length > 0 ? (
                  playerClues.map((c, cIdx) => {
                    const rNum = c.roundNumber || (cIdx + 1);
                    const rTag = rNum === 1 ? '1st Round' : rNum === 2 ? '2nd Round' : rNum === 3 ? '3rd Round' : `${rNum}th Round`;
                    return (
                      <div key={cIdx} className="flex items-center justify-between text-xs px-2 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80">
                        <span className="text-4xs font-extrabold text-violet-400 uppercase tracking-wider">
                          {rTag} Word:
                        </span>
                        <span className="font-bold text-slate-100 italic">"{c.text}"</span>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-5xs text-slate-500 italic font-medium px-1">
                    No word prompt submitted yet
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Secret Word Pocket Reminder */}
      <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 flex flex-row items-center justify-between mt-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg">
            <Sparkles size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-4xs font-bold text-slate-500 uppercase tracking-widest">
              Show secret word
            </span>
            <span className="text-xs font-bold theme-text-primary">
              {showWord 
                ? (self.isImposter && room.settings.gameMode === 'classic' ? 'No Word' : self.word)
                : '••••••••••'
              }
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setShowWord(!showWord);
            trackEvent('click_toggle_secret_pocket', { screen: 'Discussion', visible: !showWord });
          }}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          title={showWord ? 'Hide Word' : 'Show Word'}
        >
          {showWord ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </Card>
    </div>
  );
};
