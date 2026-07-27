import React, { useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext.js';
import { Button } from '../Common/Button.js';
import { Card } from '../Common/Card.js';
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
        <Card className="p-5 border-slate-800 bg-slate-900/40">
          <span className="text-4xs font-extrabold text-slate-500 uppercase tracking-widest">
            Majority Word
          </span>
          <h3 className="text-2xl font-black text-emerald-400 tracking-tight mt-1 mb-2 capitalize">
            {majorityWord}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {majorityNicknames.map((nick, idx) => (
              <span key={idx} className="text-5xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">
                {nick}
              </span>
            ))}
          </div>
        </Card>

        {/* Imposter Word card */}
        <Card className="p-5 border-slate-800 bg-slate-900/40">
          <span className="text-4xs font-extrabold text-slate-500 uppercase tracking-widest">
            Imposter Word ({room.settings.gameMode === 'classic' ? 'Classic' : 'Undercover'})
          </span>
          <h3 className="text-2xl font-black text-rose-500 tracking-tight mt-1 mb-2 capitalize">
            {room.settings.gameMode === 'classic' ? 'No Word' : imposterWord}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {imposterNicknames.map((nick, idx) => (
              <span key={idx} className="text-5xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-bold">
                {nick}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Leaderboard/Scoreboard Card */}
      <Card>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
            <Trophy size={14} className="text-amber-400" />
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
                    ? 'bg-violet-600/10 border-violet-500/50 shadow-lg shadow-violet-500/5'
                    : 'bg-slate-900/40 border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="text-xs font-black text-slate-500 w-5 text-center">
                    #{idx + 1}
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-slate-805 border border-slate-800 flex items-center justify-center text-sm flex-shrink-0">
                    {player.avatar || '🕵️'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-200 truncate flex items-center gap-1.5">
                      {player.nickname}
                      {isLeader && <Crown size={12} className="text-amber-400 flex-shrink-0" />}
                      {isSelf && (
                        <span className="text-5xs bg-violet-500/20 text-violet-400 px-1 py-0.5 rounded uppercase font-bold tracking-wider">
                          You
                        </span>
                      )}
                    </span>
                    <span className="text-5xs text-slate-500 font-semibold uppercase tracking-wider">
                      Role: {player.role}
                    </span>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <span className="text-xs font-black text-violet-400 font-mono">
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
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
            <UserCheck size={14} className="text-rose-450" />
            Who Voted For Whom
          </h3>
        </div>

        <div className="flex flex-col gap-2.5">
          {room.players.map((player) => {
            const voters = room.players.filter(p => p.voteTargetId === player.id);
            
            return (
              <div key={player.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-905/30 border border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg leading-none">{player.avatar || '🕵️'}</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">{player.nickname}</span>
                    <span className="text-5xs text-slate-500 font-extrabold uppercase tracking-wider leading-none mt-0.5 animate-pulse">
                      {player.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {voters.length > 0 ? (
                    <>
                      <span className="text-5xs text-slate-500 font-extrabold uppercase tracking-wider mr-1">Voted by:</span>
                      <div className="flex -space-x-1">
                        {voters.map((voter) => (
                          <div 
                            key={voter.id}
                            title={`${voter.nickname} voted for ${player.nickname}`}
                            className="w-6.5 h-6.5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs shadow-md select-none hover:translate-y-[-2px] transition-transform cursor-help"
                          >
                            {voter.avatar || '🕵️'}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <span className="text-4xs text-slate-500 font-medium uppercase italic">No votes</span>
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
          <Card className="sm:w-2/3 p-0 justify-center items-center bg-slate-900/20 border-slate-800 border flex select-none py-2 text-3xs font-semibold text-slate-400 tracking-wider uppercase">
            Waiting for Host to restart...
          </Card>
        )}
      </div>
    </div>
  );
};
