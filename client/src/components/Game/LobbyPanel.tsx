import React, { useState } from 'react';
import { useSocket } from '../../contexts/SocketContext.js';
import { Button } from '../Common/Button.js';
import { Card } from '../Common/Card.js';
import { Copy, Share2, Crown, Trash2, CheckCircle2, WifiOff, QrCode, Edit2, X, Zap, Users } from 'lucide-react';
import { trackEvent } from '../../utils/analytics.js';
import { AVATARS, AvatarDisplay } from '../Common/AvatarKit.js';

export const LobbyPanel: React.FC = () => {
  const { room, playerId, changeNickname, changeAvatar, startGame, kickPlayer, leaveRoom } = useSocket();
  const [copyText, setCopyText] = useState('Copy');
  const [shareText, setShareText] = useState('Share');
  const [showQr, setShowQr] = useState(false);

  // Modal Profile Edit states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [nameError, setNameError] = useState('');

  if (!room) return null;

  const self = room.players.find(p => p.id === playerId);
  const isHost = self?.isHost || false;

  const connectedPlayersCount = room.players.filter(p => p.isConnected).length;
  const canStartGame = connectedPlayersCount >= 3;

  const getJoinUrl = () => {
    const baseUrl = import.meta.env.BASE_URL ? import.meta.env.BASE_URL.replace(/\/$/, '') : '/wordgame';
    return `${window.location.origin}${baseUrl}/join?code=${room.code}`;
  };

  const getShareMessage = () => `Join room code ${room.code} to play Word Imposter. ${getJoinUrl()}`;

  const handleCopyCode = async () => {
    trackEvent('click_copy_room_code', { screen: 'Lobby', roomCode: room.code });
    try {
      await navigator.clipboard.writeText(room.code);
      setCopyText('Copied!');
      setTimeout(() => setCopyText('Copy'), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleShareLink = async () => {
    trackEvent('click_share_room_link', { screen: 'Lobby', roomCode: room.code });
    const shareMessage = getShareMessage();
    const shareData = {
      title: 'Join my Word Imposter game!',
      text: `Join room code ${room.code} to play Word Imposter.`,
      url: getJoinUrl()
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log('Share canceled', err); }
    } else {
      try {
        await navigator.clipboard.writeText(shareMessage);
        setShareText('Copied!');
        setTimeout(() => setShareText('Share'), 2000);
      } catch (err) { console.error('Failed to copy link', err); }
    }
  };

  const openEditModal = () => {
    if (self) {
      setNewNickname(self.nickname);
      setSelectedAvatar(self.avatar || 'fox');
      setNameError('');
      setIsEditModalOpen(true);
      trackEvent('click_open_edit_profile', { screen: 'Lobby' });
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNickname || newNickname.trim() === '') { setNameError('Name cannot be empty'); return; }
    changeNickname(newNickname.trim());
    changeAvatar(selectedAvatar);
    setIsEditModalOpen(false);
    trackEvent('click_save_profile', { screen: 'Lobby', nickname: newNickname.trim(), avatar: selectedAvatar });
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-xl mx-auto">

      {/* ── Top Cards Row ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Room Code */}
        <Card className="p-5 flex flex-col items-center justify-between gap-4 text-center border-slate-800 bg-slate-900/40 relative overflow-hidden" glow="primary">
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-violet-600/12 rounded-full blur-2xl pointer-events-none" />
          <div className="w-full">
            <span className="text-[9px] font-extrabold tracking-[0.18em] uppercase mb-1 block"
              style={{ color: 'var(--color-text-secondary)' }}>
              Room Code
            </span>
            <div className="text-3xl font-black tracking-widest select-all"
              style={{
                background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
              {room.code}
            </div>
          </div>
          <div className="flex gap-2 w-full">
            <Button variant="secondary" size="sm" onClick={handleCopyCode} className="flex-1 gap-1.5">
              <Copy size={11} /> {copyText}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowQr(!showQr)} className="gap-1.5 px-3">
              <QrCode size={11} />
            </Button>
          </div>
        </Card>

        {/* Lobby Rules */}
        <Card className="p-5 flex flex-col justify-between gap-3 border-slate-800 bg-slate-900/40 relative overflow-hidden">
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-extrabold tracking-[0.18em] uppercase block"
              style={{ color: 'var(--color-text-secondary)' }}>
              Game Settings
            </span>
            <div className="flex flex-col gap-1.5 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              <div className="flex items-center justify-between">
                <span>Mode</span>
                <span className="font-bold capitalize" style={{ color: 'var(--color-text-primary)' }}>{room.settings.gameMode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Imposters</span>
                <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{room.settings.imposterCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Categories</span>
                <span className="font-bold truncate max-w-[80px] text-right" style={{ color: 'var(--color-text-primary)' }}>
                  {room.settings.categories && room.settings.categories.length > 0
                    ? room.settings.categories.join(', ')
                    : 'All'}
                </span>
              </div>
            </div>
          </div>
          <Button onClick={handleShareLink} size="sm" className="w-full gap-1.5">
            <Share2 size={11} /> {shareText}
          </Button>
        </Card>
      </div>

      {/* ── QR Code ───────────────────────────────────── */}
      {showQr && (
        <Card className="p-6 flex flex-col items-center justify-center border-slate-800 bg-slate-900/40 text-center animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="text-[9px] font-extrabold tracking-[0.18em] uppercase mb-3"
            style={{ color: 'var(--color-text-secondary)' }}>
            Scan to Join
          </span>
          <div className="p-3 bg-white rounded-2xl shadow-2xl shadow-black/20">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(getJoinUrl())}`}
              alt="QR Code"
              className="w-36 h-36"
            />
          </div>
          <span className="text-[10px] mt-3 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Point your camera to join instantly
          </span>
        </Card>
      )}

      {/* ── Players List ───────────────────────────────── */}
      <Card className="p-5 border-slate-800 bg-slate-900/60 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(124,58,237,0.14)' }}>
              <Users size={13} style={{ color: '#a78bfa' }} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
              Players
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.25)',
              color: '#a78bfa',
            }}>
            {connectedPlayersCount} / {room.settings.maxPlayers ?? '∞'}
          </span>
        </div>

        {/* Player Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto p-1">
          {room.players.map((player) => {
            const isSelf = player.id === playerId;
            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${
                  !player.isConnected
                    ? 'bg-red-950/10 border-red-500/20 opacity-60'
                    : isSelf
                    ? 'player-card-self hover:scale-[1.02] hover:z-10'
                    : 'player-card-other hover:scale-[1.02] hover:z-10 hover:border-violet-500/20'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Avatar */}
                  <button
                    onClick={isSelf ? openEditModal : undefined}
                    disabled={!isSelf}
                    title={isSelf ? 'Edit Profile' : undefined}
                    className={`relative flex-shrink-0 rounded-xl overflow-hidden transition-all select-none ${
                      isSelf ? 'cursor-pointer hover:scale-110 active:scale-95' : ''
                    }`}
                    style={{ width: 40, height: 40 }}
                  >
                    {/* Ring for self */}
                    {isSelf && (
                      <div className="absolute inset-0 rounded-xl pointer-events-none z-10 avatar-ring-self" />
                    )}
                    <div className={`w-full h-full flex items-center justify-center rounded-xl ${
                      !player.isConnected
                        ? 'bg-red-500/10'
                        : isSelf
                        ? 'bg-violet-500/20'
                        : 'bg-slate-800'
                    }`}>
                      <AvatarDisplay avatarId={player.avatar || 'fox'} size={36} />
                    </div>
                    {/* Edit overlay for self */}
                    {isSelf && (
                      <div className="absolute inset-0 bg-violet-600/0 hover:bg-violet-600/25 flex items-center justify-center transition-all rounded-xl z-20">
                        <Edit2 size={12} className="text-white opacity-0 hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </button>

                  {/* Info */}
                  <div className="flex flex-col min-w-0 gap-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {player.nickname}
                      </span>
                      {player.isHost && (
                        <Crown size={12} className="text-amber-400 flex-shrink-0" />
                      )}
                    </div>

                    {/* Bottom badges row */}
                    <div className="flex items-center gap-1.5">
                      {isSelf && <span className="badge-you">You</span>}
                      {player.isHost && <span className="badge-host">Host</span>}
                      {!player.isHost && player.isConnected && !isSelf && (
                        <span className="badge-ready flex items-center gap-0.5">
                          <CheckCircle2 size={8} /> Ready
                        </span>
                      )}
                      {!player.isConnected && (
                        <span className="badge-offline flex items-center gap-0.5">
                          <WifiOff size={8} /> Offline
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isSelf && (
                    <button
                      onClick={openEditModal}
                      className="p-1.5 rounded-lg transition-all cursor-pointer"
                      style={{ color: 'var(--color-text-secondary)' }}
                      title="Edit Profile"
                    >
                      <Edit2 size={13} />
                    </button>
                  )}
                  {isHost && !isSelf && (
                    <button
                      onClick={() => kickPlayer(player.id)}
                      className="p-1.5 rounded-lg transition-all cursor-pointer text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                      title="Kick Player"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Action Footer ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Button variant="secondary" size="lg" onClick={leaveRoom} className="sm:w-1/3">
          Leave
        </Button>
        {isHost ? (
          <Button
            variant={canStartGame ? 'primary' : 'secondary'}
            size="lg"
            onClick={startGame}
            disabled={!canStartGame}
            className="sm:w-2/3 gap-2"
          >
            <Zap size={18} className={canStartGame ? "animate-zap" : "text-slate-400"} />
            {connectedPlayersCount < 3 ? 'Need 3+ Players' : 'Start Game'}
          </Button>
        ) : (
          <Button variant="secondary" size="lg" disabled className="sm:w-2/3 cursor-not-allowed opacity-60">
            Waiting for Host…
          </Button>
        )}
      </div>

      {/* ── Edit Profile Modal ────────────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className="border rounded-3xl p-6 w-full max-w-sm flex flex-col gap-5 shadow-2xl relative animate-in zoom-in-95 duration-200"
            style={{
              background: 'var(--color-card-bg)',
              backdropFilter: 'blur(24px)',
              borderColor: 'var(--color-card-border)',
            }}
          >
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl transition-all cursor-pointer"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <X size={18} />
            </button>

            <div>
              <h4 className="text-base font-black uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                Edit Profile
              </h4>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Customize your lobby presence
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              {/* Nickname */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
                  Nickname
                </label>
                <input
                  type="text"
                  value={newNickname}
                  onChange={(e) => { setNewNickname(e.target.value); if (nameError) setNameError(''); }}
                  className="glass-input px-3.5 py-2.5 rounded-xl font-bold text-sm focus:outline-none w-full"
                  maxLength={15}
                  placeholder="Enter nickname"
                  autoFocus
                />
                {nameError && (
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide">{nameError}</span>
                )}
              </div>

              {/* Avatar grid */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
                  Choose Avatar
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
                  {AVATARS.map((av) => {
                    const isTaken = room.players.some(p => p.id !== playerId && p.avatar === av.id);
                    const isSelected = selectedAvatar === av.id;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => !isTaken && setSelectedAvatar(av.id)}
                        disabled={isTaken}
                        className={`relative flex flex-col items-center gap-1 p-2.5 rounded-2xl border transition-all ${
                          isTaken
                            ? 'opacity-40 cursor-not-allowed bg-slate-900/30 border-slate-800'
                            : isSelected
                            ? 'bg-violet-600/20 border-violet-500 scale-105 shadow-lg shadow-violet-500/20 cursor-pointer'
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 cursor-pointer'
                        }`}
                      >
                        <div className="rounded-full overflow-hidden" style={{ width: 52, height: 52 }}>
                          <AvatarDisplay avatarId={av.id} size={52} />
                        </div>
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider"
                          style={{
                            color: isSelected
                              ? 'var(--color-primary-violet)'
                              : isTaken
                              ? 'var(--color-text-secondary)'
                              : 'var(--color-text-secondary)',
                          }}
                        >
                          {isTaken ? 'Taken' : av.label}
                        </span>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                              <path d="M1.5 4L3.2 5.8L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                        {isTaken && (
                          <div className="absolute inset-0 rounded-2xl flex items-center justify-center">
                            <div className="w-full h-[1px] bg-slate-600/40 rotate-45 absolute" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 w-full mt-1">
                <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
