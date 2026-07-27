import React from 'react';
import { useSocket } from '../../contexts/SocketContext.js';
import { Card } from '../Common/Card.js';
import { Timer } from '../Common/Timer.js';
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
          <div className="p-2.5 bg-rose-600/10 text-rose-400 rounded-xl">
            <UserCheck size={20} className="animate-pulse" />
          </div>
          <div>
            <span className="text-2xs font-bold text-slate-500 uppercase tracking-widest leading-none">
              Phase 3
            </span>
            <h2 className="text-xl font-black text-white uppercase tracking-wider mt-0.5">
              Cast Your Vote
            </h2>
          </div>
        </div>
        <Timer value={room.timer} total={room.settings.votingTime} />
      </div>

      {/* State Callout */}
      {!isAlive ? (
        <Card className="border-red-500/20 bg-red-950/10 text-center py-4">
          <ShieldAlert className="text-red-400 w-8 h-8 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-red-300 uppercase tracking-wide">You are eliminated</h3>
          <p className="text-xs text-slate-400 mt-1 leading-normal font-medium">
            You cannot vote. Wait for other players to finish voting.
          </p>
        </Card>
      ) : hasVoted ? (
        <Card className="border-emerald-500/20 bg-emerald-950/10 text-center py-4">
          <CheckCircle2 className="text-emerald-400 w-8 h-8 mx-auto mb-2 animate-bounce" />
          <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wide">Your vote is locked in</h3>
          <p className="text-xs text-slate-400 mt-1 leading-normal font-medium">
            Waiting for other players to submit their votes...
          </p>
        </Card>
      ) : (
        <Card className="border-slate-800 bg-slate-900/40 text-center py-3">
          <p className="text-xs text-slate-300 font-semibold tracking-wide">
            Select the player you suspect of being the <span className="text-rose-400 font-black uppercase">Imposter</span>!
          </p>
        </Card>
      )}

      {/* Grid of voting options (All Alive Players except Self) */}
      <div className="flex flex-col gap-3">
        <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider">
          Voting Candidates
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {alivePlayers.map((player) => {
            const isSelf = player.id === playerId;
            const isVotedTarget = self.voteTargetId === player.id;
            const disabled = hasVoted || isSelf || !isAlive || !player.isConnected;

            return (
              <button
                key={player.id}
                type="button"
                onClick={() => !disabled && handleVoteSubmit(player.id)}
                disabled={disabled}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                  isVotedTarget
                    ? 'bg-rose-600/25 border-rose-500 text-white shadow-lg shadow-rose-500/10'
                    : isSelf
                    ? 'bg-slate-900/20 border-slate-950 text-slate-500 cursor-not-allowed opacity-50'
                    : disabled
                    ? 'bg-slate-900/10 border-slate-900 text-slate-500 cursor-not-allowed opacity-60'
                    : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-900 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                    isVotedTarget 
                      ? 'bg-rose-500/25 text-rose-450' 
                      : isSelf 
                      ? 'bg-slate-900 text-slate-650' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {player.avatar || '🕵️'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold truncate">
                      {player.nickname}
                      {isSelf && ' (You)'}
                    </span>
                    {!player.isConnected && (
                      <span className="text-5xs text-red-400 font-semibold uppercase tracking-wider">Offline</span>
                    )}
                  </div>
                </div>

                {isVotedTarget && (
                  <span className="text-3xs bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider">
                    My Vote
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Who Voted indicator list */}
      <Card className="border-slate-800 bg-slate-950/40 p-4">
        <span className="text-2xs font-extrabold text-slate-500 uppercase tracking-widest block mb-2.5">
          Submission Tracker
        </span>
        <div className="flex flex-wrap gap-2">
          {votingStatus
            .filter(p => p.isAlive && p.isConnected)
            .map((p, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                  p.hasVoted
                    ? 'bg-rose-600/10 border-rose-500/25 text-rose-400'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <span className="text-sm leading-none">{p.avatar || '🕵️'}</span>
                <span>{p.nickname}</span>
                {p.hasVoted ? (
                  <X size={11} className="text-rose-400 flex-shrink-0 stroke-[3]" />
                ) : (
                  <Hourglass size={10} className="text-slate-500 flex-shrink-0 animate-spin" />
                )}
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};
