import React, { useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext.js';
import { Button } from '../Common/Button.js';
import { Card } from '../Common/Card.js';
import { AvatarDisplay } from '../Common/AvatarKit.js';
import { Crown, LogOut, RefreshCw, Trophy, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { trackEvent } from '../../utils/analytics.js';

export const ResultsPanel: React.FC = () => {
  const { room, playerId, nextRound, leaveRoom } = useSocket();

  useEffect(() => {
    if (room && room.roundResults) {
      const self = room.players.find(p => p.id === playerId);
      const isWinner = self?.role === room.roundResults.winnerRole;
      trackEvent('game_round_ended', {
        screen: 'Results',
        winnerRole: room.roundResults.winnerRole,
        isWinner,
        wasImposterVotedOut: room.roundResults.wasImposterVotedOut,
        roomCode: room.code
      });
    }
  }, []);

  if (!room || !room.roundResults) return null;

  const {
    winnerRole,
    imposterWord,
    majorityWord,
    imposterNicknames,
    majorityNicknames,
    eliminatedPlayerNickname,
    wasImposterVotedOut
  } = room.roundResults;

  const self = room.players.find(p => p.id === playerId);
  const isHost = self?.isHost || false;
  const isWinner = self?.role === winnerRole;

  // Trigger confetti if player won!
  useEffect(() => {
    if (isWinner) {
      // Fire confetti multiple times for a premium feel
      const duration = 2 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#7c3aed', '#4f46e5', '#10b981']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#7c3aed', '#4f46e5', '#10b981']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isWinner]);

  // Sort scoreboard by score descending
  const scoreboard = [...room.players].sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      {/* Top Banner Winner Reveal */}
      <Card 
        className={`text-center py-8 relative overflow-hidden border ${
          winnerRole === 'MAJORITY' 
            ? 'border-emerald-500/20 bg-emerald-950/15 text-emerald-400' 
            : 'border-rose-500/20 bg-rose-950/15 text-rose-400'
        }`}
        glow={winnerRole === 'MAJORITY' ? 'majority' : 'imposter'}
      >
        <span className="text-2xs font-extrabold uppercase tracking-widest block mb-1">
          Round Ended
        </span>
        <h2 className="text-4xl font-black uppercase tracking-tight">
          {winnerRole} Victory!
        </h2>
        <p className="text-slate-300 text-xs font-semibold tracking-wide mt-2 max-w-sm mx-auto leading-normal">
          {eliminatedPlayerNickname ? (
            <>
              Player <span className="font-extrabold text-white underline decoration-rose-500">{eliminatedPlayerNickname}</span> was voted out. 
              {wasImposterVotedOut ? ' They were the Imposter!' : ' They were innocent.'}
            </>
          ) : (
            'No one was voted out this round due to a tie.'
          )}
        </p>
      </Card>

      {/* Identity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Majority Word card */}
        <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40">
          <span className="text-4xs font-extrabold text-slate-500 uppercase tracking-widest">
            Majority Word
          </span>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-1 mb-2 capitalize">
            {majorityWord}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {majorityNicknames.map((nick, idx) => (
              <span key={idx} className="text-5xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 px-2 py-0.5 rounded font-bold border border-slate-200 dark:border-slate-700">
                {nick}
              </span>
            ))}
          </div>
        </Card>

        {/* Imposter Word card */}
        <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40">
          <span className="text-4xs font-extrabold text-slate-500 uppercase tracking-widest">
            Imposter Word ({room.settings.gameMode === 'classic' ? 'Classic' : 'Undercover'})
          </span>
          <h3 className="text-2xl font-black text-rose-600 dark:text-rose-500 tracking-tight mt-1 mb-2 capitalize">
            {room.settings.gameMode === 'classic' ? 'No Word' : imposterWord}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {imposterNicknames.map((nick, idx) => (
              <span key={idx} className="text-5xs bg-rose-500/15 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 dark:border-rose-500/20 px-2 py-0.5 rounded font-bold">
                {nick}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Leaderboard/Scoreboard Card */}
      <Card>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
            <Trophy size={14} className="text-amber-500 dark:text-amber-400" />
            Active Scoreboard
          </h3>
          <span className="text-4xs text-slate-500 font-bold uppercase tracking-wider">
            Round {room.roundCount}
          </span>
        </div>

        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
          {scoreboard.map((player, idx) => {
            const isSelf = player.id === playerId;
            const isLeader = idx === 0 && player.score > 0;

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isSelf
                    ? 'bg-violet-50/90 dark:bg-violet-600/10 border-2 border-violet-500 shadow-xs'
                    : 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="text-xs font-black text-slate-500 w-5 text-center">
                    #{idx + 1}
                  </div>
                  <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                    <AvatarDisplay avatarId={player.avatar || 'fox'} size={28} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold theme-text-primary truncate flex items-center gap-1.5">
                      {player.nickname}
                      {isLeader && <Crown size={12} className="text-amber-500 dark:text-amber-400 flex-shrink-0" />}
                      {isSelf && (
                        <span className="text-5xs bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400 px-1.5 py-0.5 rounded uppercase font-extrabold tracking-wider">
                          You
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <span className="text-xs font-black text-violet-600 dark:text-violet-400 font-mono">
                    {player.score} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Voting Trail Breakdown */}
      <Card>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
            <UserCheck size={14} className="text-rose-500" />
            Who Voted For Whom
          </h3>
        </div>

        <div className="flex flex-col gap-2.5">
          {room.players.map((player) => {
            const voters = room.players.filter(p => p.voteTargetId === player.id);
            const isImposter = player.role === 'IMPOSTER';
            
            return (
              <div key={player.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                    <AvatarDisplay avatarId={player.avatar || 'fox'} size={32} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-bold theme-text-primary">{player.nickname}</span>
                    <span className={`text-5xs font-black uppercase tracking-wider leading-none mt-0.5 px-1.5 py-0.5 rounded w-fit ${
                      isImposter 
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30' 
                        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {player.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {voters.length > 0 ? (
                    <>
                      <span className="text-4xs font-bold theme-text-secondary uppercase tracking-wider mr-1">Voted by:</span>
                      <div className="flex -space-x-1">
                        {voters.map((voter) => (
                            <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-xs hover:-translate-y-0.5 transition-transform cursor-help" title={`${voter.nickname} voted for ${player.nickname}`}>
                              <AvatarDisplay avatarId={voter.avatar || 'fox'} size={24} />
                            </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 italic">No votes</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Action Footer buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
        <Button variant="secondary" size="lg" onClick={leaveRoom} className="sm:w-1/3 gap-2">
          <LogOut size={16} />
          Leave Room
        </Button>

        {isHost ? (
          <Button variant="primary" size="lg" onClick={nextRound} className="sm:w-2/3 gap-2">
            <RefreshCw size={16} />
            Play Again
          </Button>
        ) : (
          <Card className="sm:w-2/3 p-0 justify-center items-center bg-slate-100/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 border flex select-none py-3 text-2xs font-extrabold theme-text-secondary tracking-wider uppercase">
            Ask the host to restart
          </Card>
        )}
      </div>
    </div>
  );
};
