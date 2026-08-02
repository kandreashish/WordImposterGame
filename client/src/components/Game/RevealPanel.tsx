import React, { useState } from 'react';
import { useSocket } from '../../contexts/SocketContext.js';
import { Card } from '../Common/Card.js';
import { Timer } from '../Common/Timer.js';
import { Eye, EyeOff, HelpCircle, ShieldAlert } from 'lucide-react';
import { trackEvent } from '../../utils/analytics.js';

export const RevealPanel: React.FC = () => {
  const { room, playerId } = useSocket();
  const [isRevealed, setIsRevealed] = useState(false);

  if (!room) return null;

  const self = room.players.find(p => p.id === playerId);
  if (!self) return null;

  const isImposter = self.isImposter;
  const word = self.word;

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto items-center">
      {/* Header with Timer */}
      <div className="flex justify-between items-center w-full">
        <div>
          <span className="text-2xs font-bold text-slate-500 uppercase tracking-widest leading-none">
            Phase 1
          </span>
          <h2 className="text-xl font-black text-white uppercase tracking-wider mt-0.5">
            Reveal Secret Word
          </h2>
        </div>
        <Timer value={room.timer} total={10} />
      </div>

      <div 
        onClick={() => {
          setIsRevealed(!isRevealed);
          trackEvent('click_reveal_word', { screen: 'Reveal', isRevealed: !isRevealed, isImposter });
        }}
        className="w-full h-80 perspective-1000 cursor-pointer group"
      >
        <div className={`relative w-full h-full duration-500 preserve-3d transition-transform ${
          isRevealed ? 'rotate-y-180' : ''
        }`}>
          
          {/* FRONT: Tap to Reveal */}
          <div className="absolute inset-0 w-full h-full backface-hidden">
            <Card 
              className="w-full h-full justify-center items-center border-slate-800/80 bg-slate-900/60 hover:bg-slate-900/80 hover:border-violet-500/20 text-center transition-colors shadow-2xl relative"
              glow="none"
            >
              {/* Card Texture details */}
              <div className="absolute inset-4 border border-dashed border-slate-800 rounded-2xl pointer-events-none" />

              <div className="p-4 bg-violet-600/10 text-violet-400 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <Eye size={36} />
              </div>
              <span className="text-2xs font-extrabold text-violet-400 uppercase tracking-widest mb-1.5">
                Secret Word
              </span>
              <h3 className="text-xl font-bold text-slate-100">
                Tap to Reveal
              </h3>
              <p className="text-slate-500 text-3xs max-w-xs mt-3 leading-normal font-medium">
                Make sure no one is looking at your screen before tapping!
              </p>
            </Card>
          </div>

          {/* BACK: The Secret Word */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
            {isImposter ? (
              <Card 
                className="w-full h-full justify-center items-center border-rose-500/30 text-center relative p-5"
                glow="imposter"
              >
                <div className="absolute inset-4 border border-dashed border-rose-950/40 rounded-2xl pointer-events-none" />

                <div className="p-3 bg-rose-600/10 text-rose-400 rounded-full mb-3">
                  <ShieldAlert size={32} className="animate-pulse" />
                </div>
                <span className="text-2xs font-extrabold text-rose-400 uppercase tracking-widest mb-0.5">
                  You are the
                </span>
                <h3 className="text-3xl font-black text-rose-500 uppercase tracking-wide">
                  Imposter
                </h3>
                
                <div className="mt-3 px-4 py-2 bg-rose-950/20 border border-rose-900/40 rounded-xl max-w-xs">
                  {room.settings.gameMode === 'classic' ? (
                    <span className="text-xs font-bold text-rose-300">
                      You have NO word. Blend in!
                    </span>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-4xs text-rose-400 font-bold uppercase tracking-wider">Your Similar Word</span>
                      <span className="text-lg font-black text-rose-100 tracking-tight mt-0.5">{word}</span>
                    </div>
                  )}
                </div>

                {/* Show Hint as well */}
                {room.imposterHint && (
                  <div className="mt-3 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl max-w-xs flex flex-col items-center shadow-xs">
                    <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-widest">
                      Category Hint
                    </span>
                    <span className="text-xs font-black text-amber-200 mt-0.5">
                      "{room.imposterHint}"
                    </span>
                  </div>
                )}
              </Card>
            ) : (
              <Card 
                className="w-full h-full justify-center items-center border-emerald-500/30 text-center relative p-5"
                glow="majority"
              >
                <div className="absolute inset-4 border border-dashed border-emerald-950/40 rounded-2xl pointer-events-none" />

                <div className="p-3 bg-emerald-600/10 text-emerald-400 rounded-full mb-3">
                  <EyeOff size={32} />
                </div>
                <span className="text-2xs font-extrabold text-emerald-400 uppercase tracking-widest mb-0.5">
                  You are part of the
                </span>
                <h3 className="text-3xl font-black text-emerald-500 uppercase tracking-wide">
                  Majority
                </h3>

                <div className="mt-3 px-6 py-2 bg-emerald-950/20 border border-emerald-900/40 rounded-xl">
                  <span className="text-4xs text-emerald-400 font-bold uppercase tracking-wider block">Your Secret Word</span>
                  <span className="text-2xl font-black text-emerald-100 tracking-tight mt-0.5 block">{word}</span>
                </div>

                {/* Show Hint as well */}
                {room.imposterHint && (
                  <div className="mt-3 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl max-w-xs flex flex-col items-center shadow-xs">
                    <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-widest">
                      Category Hint
                    </span>
                    <span className="text-xs font-black text-amber-200 mt-0.5">
                      "{room.imposterHint}"
                    </span>
                  </div>
                )}
              </Card>
            )}
          </div>

        </div>
      </div>

      {/* Helpful Hint */}
      <div className="flex items-start gap-2 bg-slate-900/40 border border-slate-800/80 p-3.5 rounded-2xl">
        <HelpCircle size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
        <p className="text-3xs text-slate-400 leading-normal font-medium">
          Once the timer expires, you will enter the Discussion phase. Keep your card hidden and start forming clues!
        </p>
      </div>
    </div>
  );
};
