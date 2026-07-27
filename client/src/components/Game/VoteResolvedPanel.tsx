import React from 'react';
import { useSocket } from '../../contexts/SocketContext.js';
import { Button } from '../Common/Button.js';
import { Card } from '../Common/Card.js';
import { Timer } from '../Common/Timer.js';
import { AvatarDisplay } from '../Common/AvatarKit.js';
import { UserCheck, ShieldAlert, ArrowRight, Hourglass, RefreshCw, Eye } from 'lucide-react';

export const VoteResolvedPanel: React.FC = () => {
  const { room, playerId, playMoreRound, revealVotedPlayer } = useSocket();

  if (!room) return null;

  const self = room.players.find(p => p.id === playerId);
  if (!self) return null;

  const candidate = room.players.find(p => p.id === room.votedPlayerId);
  const isHost = self.isHost;

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      {/* Header with Timer */}
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-600/10 text-violet-600 dark:text-violet-400 rounded-xl">
            <UserCheck size={20} className="animate-pulse" />
          </div>
          <div>
            <span className="text-2xs font-bold text-slate-500 uppercase tracking-widest leading-none">
              Phase 4
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider mt-0.5">
              Vote Verdict
            </h2>
          </div>
        </div>
        <Timer value={room.timer} total={25} />
      </div>

      {/* Decision Summary Card */}
      <Card className="text-center py-6 border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl animate-pulse" />
        
        {candidate ? (
          <>
            <span className="text-3xs font-extrabold text-rose-600 dark:text-rose-500 uppercase tracking-widest block mb-2">
              Highest Voted Candidate
            </span>
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 animate-pulse shadow-lg shadow-rose-500/15 ring-2 ring-rose-500/30">
              <AvatarDisplay avatarId={candidate.avatar || 'fox'} size={64} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
              {candidate.nickname}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-2 max-w-xs mx-auto leading-relaxed">
              Received the most suspicion votes. Should we reveal their identity, or play one more clue round first?
            </p>
          </>
        ) : (
          <>
            <ShieldAlert className="text-amber-500 dark:text-amber-400 w-12 h-12 mx-auto mb-3" />
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-200 uppercase tracking-wide">
              Voting Tie!
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-2 max-w-xs mx-auto leading-relaxed">
              No single player received the majority of suspicion votes.
            </p>
          </>
        )}
      </Card>

      {/* Action Buttons for Host / Spinner for Players */}
      {isHost ? (
        <Card className="p-5 border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/40 flex flex-col gap-3">
          <span className="text-3xs font-extrabold text-violet-600 dark:text-violet-400 uppercase tracking-widest block mb-1 text-center">
            Host Decision Required
          </span>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              size="lg"
              onClick={playMoreRound}
              className="flex-1 gap-2 border-slate-300 dark:border-slate-800"
            >
              <RefreshCw size={16} />
              One More Clue Round
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={revealVotedPlayer}
              className="flex-1 gap-2"
            >
              <Eye size={16} />
              Reveal & End Round
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="py-5 border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/20 text-center flex flex-col items-center justify-center gap-2 select-none">
          <Hourglass size={20} className="text-slate-400 dark:text-slate-500 animate-spin" />
          <span className="text-3xs font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest">
            Waiting for Host to decide
          </span>
          <p className="text-4xs text-slate-500 dark:text-slate-600 font-medium">
            They are choosing whether to start one more round of descriptions or reveal roles.
          </p>
        </Card>
      )}

      {/* Votes cast trail list */}
      <Card className="p-4 border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/40">
        <span className="text-2xs font-extrabold text-slate-600 dark:text-slate-500 uppercase tracking-widest block mb-3 border-b border-slate-200 dark:border-slate-900 pb-2">
          Cast Votes Log
        </span>

        <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
          {room.players
            .filter(p => p.isAlive && p.voteTargetId !== null)
            .map((player) => {
              const target = room.players.find(t => t.id === player.voteTargetId);
              if (!target) return null;

              return (
                <div key={player.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/35 border border-slate-200 dark:border-slate-900/80">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                      <AvatarDisplay avatarId={player.avatar || 'fox'} size={24} />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-200">{player.nickname}</span>
                  </div>
                  <ArrowRight size={12} className="text-slate-400 dark:text-slate-600" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-300">{target.nickname}</span>
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                      <AvatarDisplay avatarId={target.avatar || 'fox'} size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </Card>
    </div>
  );
};
