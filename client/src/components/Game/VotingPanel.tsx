import React from 'react';
import { useSocket } from '../../contexts/SocketContext.js';
import { Card } from '../Common/Card.js';
import { Timer } from '../Common/Timer.js';
import { AvatarDisplay } from '../Common/AvatarKit.js';
import { CheckCircle2, ShieldAlert, UserCheck, X, Hourglass } from 'lucide-react';

export const VotingPanel: React.FC = () => {
  const { room, playerId, submitVote } = useSocket();

  if (!room) return null;

  const self = room.players.find(p => p.id === playerId);
  if (!self) return null;

  const hasVoted = self.voteTargetId !== null;
  const isAlive = self.isAlive;

  // Filter alive players
  const alivePlayers = room.players.filter(p => p.isAlive);
  
  // Who has voted
  const votingStatus = room.players.map(p => ({
    nickname: p.nickname,
    hasVoted: p.voteTargetId !== null,
    isAlive: p.isAlive,
    isConnected: p.isConnected,
    avatar: p.avatar
  }));

  const handleVoteSubmit = (targetPlayerId: string) => {
    if (hasVoted || !isAlive) return;
    submitVote(targetPlayerId);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      {/* Header with Timer */}
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-600/10 text-rose-600 dark:text-rose-400 rounded-xl">
            <UserCheck size={20} className="animate-pulse" />
          </div>
          <div>
            <span className="text-2xs font-bold text-slate-500 uppercase tracking-widest leading-none block">
              Phase 3
            </span>
            <h2 className="text-xl font-black theme-text-primary uppercase tracking-wider mt-0.5">
              Cast Your Vote
            </h2>
          </div>
        </div>
        <Timer value={room.timer} total={room.settings.votingTime} />
      </div>

      {/* State Callout */}
      {!isAlive ? (
        <Card className="border-red-500/30 dark:border-red-500/20 bg-red-50/80 dark:bg-red-950/10 text-center py-4">
          <ShieldAlert className="text-red-500 dark:text-red-400 w-8 h-8 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-red-700 dark:text-red-300 uppercase tracking-wide">You are eliminated</h3>
          <p className="text-xs text-red-600/80 dark:text-slate-400 mt-1 leading-normal font-medium">
            You cannot vote. Wait for other players to finish voting.
          </p>
        </Card>
      ) : hasVoted ? (
        <Card className="border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-50/80 dark:bg-emerald-950/10 text-center py-4">
          <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 w-8 h-8 mx-auto mb-2 animate-bounce" />
          <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Your vote is locked in</h3>
          <p className="text-xs text-emerald-700/80 dark:text-slate-400 mt-1 leading-normal font-medium">
            Waiting for other players to submit their votes...
          </p>
        </Card>
      ) : (
        <Card className="border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 text-center py-3">
          <p className="text-xs theme-text-primary font-semibold tracking-wide">
            Select the player you suspect of being the <span className="text-rose-600 dark:text-rose-400 font-black uppercase">Imposter</span>!
          </p>
        </Card>
      )}

      {/* Grid of voting options (All Alive Players) */}
      <div className="flex flex-col gap-3">
        <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>Voting Candidates</span>
          <span className="text-4xs text-slate-500 font-normal">Cross = Received suspicion votes</span>
        </span>
        <div className="grid grid-cols-1 gap-2.5">
          {alivePlayers.map((player) => {
            const isSelf = player.id === playerId;
            const isMyVotedTarget = self.voteTargetId === player.id;
            const disabled = hasVoted || !isAlive;

            // Count live votes cast against this player by anyone
            const votesForThisPlayer = room.players.filter(p => p.voteTargetId === player.id);
            const hasVotesReceived = votesForThisPlayer.length > 0;

            return (
              <button
                key={player.id}
                type="button"
                onClick={() => !disabled && handleVoteSubmit(player.id)}
                disabled={disabled}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                  isMyVotedTarget
                    ? 'bg-violet-50/90 dark:bg-violet-950/40 border-2 border-violet-500 shadow-md shadow-violet-500/10'
                    : hasVotesReceived
                    ? 'bg-rose-50/70 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-500/40'
                    : disabled
                    ? 'bg-slate-100/50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800/60 opacity-60 cursor-not-allowed'
                    : 'bg-white/90 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-violet-400 dark:hover:border-violet-500/40 hover:bg-white dark:hover:bg-slate-900 cursor-pointer shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 relative border border-slate-200 dark:border-slate-700">
                    <AvatarDisplay avatarId={player.avatar || 'fox'} size={32} />
                  </div>
                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    <span className="text-sm font-bold theme-text-primary truncate">
                      {player.nickname}
                    </span>
                    {isSelf && (
                      <span className="text-4xs font-extrabold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-950/80 px-2 py-0.5 rounded-full uppercase flex-shrink-0">
                        You
                      </span>
                    )}
                    {!player.isConnected && (
                      <span className="text-4xs font-extrabold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 rounded-full uppercase flex-shrink-0">
                        Offline
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  {/* Show Cross indicator if votes received from anyone */}
                  {hasVotesReceived && (
                    <span className="inline-flex items-center gap-1 text-xs font-black bg-rose-600 text-white dark:bg-rose-500/25 dark:text-rose-300 border border-rose-600 dark:border-rose-500/40 px-2.5 py-1 rounded-lg whitespace-nowrap shadow-xs">
                      <X size={12} className="stroke-[3]" />
                      {votesForThisPlayer.length}
                    </span>
                  )}

                  {isMyVotedTarget && (
                    <span className="inline-flex items-center gap-1 text-3xs font-extrabold bg-violet-600 text-white dark:bg-violet-600/40 dark:text-violet-200 border border-violet-600 dark:border-violet-500/40 px-2.5 py-1 rounded-lg uppercase tracking-wider whitespace-nowrap shadow-xs">
                      <CheckCircle2 size={12} className="stroke-[2.5]" />
                      My Choice
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Who Voted indicator list */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 p-4">
        <span className="text-2xs font-extrabold text-slate-500 uppercase tracking-widest block mb-2.5">
          Submission Tracker
        </span>
        <div className="flex flex-wrap gap-2">
          {votingStatus
            .filter(p => p.isAlive)
            .map((p, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                  p.hasVoted
                    ? 'bg-rose-500/15 dark:bg-rose-600/10 border-rose-500/30 dark:border-rose-500/25 text-rose-700 dark:text-rose-400'
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-500'
                }`}
              >
                <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                  <AvatarDisplay avatarId={p.avatar || 'fox'} size={24} />
                </div>
                <span>{p.nickname}</span>
                {!p.isConnected && (
                  <span className="text-5xs text-rose-600 dark:text-rose-400/80 font-bold">(Offline)</span>
                )}
                {p.hasVoted ? (
                  <X size={11} className="text-rose-600 dark:text-rose-400 flex-shrink-0 stroke-[3]" />
                ) : (
                  <Hourglass size={10} className="text-slate-400 dark:text-slate-500 flex-shrink-0 animate-spin" />
                )}
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};
