import React, { useState } from 'react';
import { useSocket } from '../../contexts/SocketContext.js';
import { Button } from '../Common/Button.js';
import { Card } from '../Common/Card.js';
import { Copy, Share2, Crown, Trash2, CheckCircle2, WifiOff, QrCode, Edit2, X } from 'lucide-react';
import { trackEvent } from '../../utils/analytics.js';
import { AVATARS, AvatarDisplay } from '../Common/AvatarKit.js';

export const LobbyPanel: React.FC = () => {
  const { room, playerId, changeNickname, changeAvatar, startGame, kickPlayer, leaveRoom } = useSocket();
  const [copyText, setCopyText] = useState('Copy Code');
  const [shareText, setShareText] = useState('Share Link');
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
    return `${window.location.origin}/join?code=${room.code}`;
  };

  const handleCopyCode = async () => {
    trackEvent('click_copy_room_code', { screen: 'Lobby', roomCode: room.code });
    try {
      await navigator.clipboard.writeText(room.code);
      setCopyText('Copied!');
      setTimeout(() => setCopyText('Copy Code'), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleShareLink = async () => {
    trackEvent('click_share_room_link', { screen: 'Lobby', roomCode: room.code });
    const shareData = {
      title: 'Join my Word Imposter game!',
      text: `Join room code ${room.code} to play Word Imposter.`,
      url: getJoinUrl()
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(getJoinUrl());
        setShareText('Link Copied!');
        setTimeout(() => setShareText('Share Link'), 2000);
      } catch (err) {
        console.error('Failed to copy link', err);
      }
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
    if (!newNickname || newNickname.trim() === '') {
      setNameError('Name cannot be empty');
      return;
    }
    
    changeNickname(newNickname.trim());
    changeAvatar(selectedAvatar);
    setIsEditModalOpen(false);
    trackEvent('click_save_profile', { screen: 'Lobby', nickname: newNickname.trim(), avatar: selectedAvatar });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      {/* Lobby Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Room Code Card */}
        <Card className="p-5 flex flex-col items-center justify-between gap-4 text-center border-slate-800 bg-slate-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/5 rounded-full blur-2xl" />
          <div className="w-full">
            <span className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest block mb-1">
              Room Code
            </span>
            <div className="text-3xl font-black text-white tracking-widest select-all">
              {room.code}
            </div>
          </div>
          <div className="flex gap-2 w-full mt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyCode}
              className="flex-1 gap-1.5"
            >
              <Copy size={12} />
              {copyText}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowQr(!showQr)} className="gap-1.5 px-3">
              <QrCode size={12} />
            </Button>
          </div>
        </Card>

        {/* Game Rules Card */}
        <Card className="p-5 flex flex-col justify-between gap-4 border-slate-800 bg-slate-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/5 rounded-full blur-2xl" />
          <div className="flex flex-col">
            <span className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
              Lobby Rules
            </span>
            <div className="flex flex-col gap-1.5 text-xs text-slate-400 font-medium">
              <div className="flex items-center justify-between">
                <span>Game Mode:</span>
                <span className="font-bold text-slate-200 capitalize">{room.settings.gameMode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Imposter Count:</span>
                <span className="font-bold text-slate-200">{room.settings.imposterCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Categories:</span>
                <span className="font-bold text-slate-200 capitalize">
                  {room.settings.categories && room.settings.categories.length > 0
                    ? room.settings.categories.join(', ')
                    : 'All'}
                </span>
              </div>
            </div>
          </div>
          <Button onClick={handleShareLink} className="w-full gap-1.5">
            <Share2 size={12} />
            {shareText}
          </Button>
        </Card>
      </div>

      {/* QR Code Container */}
      {showQr && (
        <Card className="p-6 flex flex-col items-center justify-center border-slate-800 bg-slate-900/40 text-center animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="text-3xs font-extrabold text-slate-500 uppercase tracking-widest mb-3">
            Scan to Join
          </span>
          <div className="p-3 bg-white rounded-xl shadow-xl shadow-black/10">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(getJoinUrl())}`} 
              alt="QR Code" 
              className="w-36 h-36"
            />
          </div>
          <span className="text-4xs text-slate-500 font-medium mt-3">
            Point your phone's camera at this code to join instantly
          </span>
        </Card>
      )}

      {/* Players List Grid */}
      <Card className="p-5 border-slate-800 bg-slate-900/60 flex flex-col gap-4">
        <h3 className="text-2xs font-extrabold text-slate-400 tracking-wider uppercase border-b border-slate-800 pb-2">
          Players list
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
          {room.players.map((player) => {
            const isSelf = player.id === playerId;
            
            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  !player.isConnected
                    ? 'bg-red-950/10 border-red-500/20 opacity-60'
                    : isSelf
                    ? 'bg-violet-600/10 border-violet-500/50 shadow-lg shadow-violet-500/5 hover:border-violet-500 transition-colors'
                    : 'bg-slate-900/40 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Clickable Avatar for Self to edit */}
                  <button
                    onClick={isSelf ? openEditModal : undefined}
                    disabled={!isSelf}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base transition-transform select-none ${
                      isSelf ? 'cursor-pointer hover:scale-110 active:scale-95' : ''
                    } ${
                      !player.isConnected
                        ? 'bg-red-500/10 text-red-400'
                        : isSelf
                        ? 'bg-violet-500/35 text-violet-300 ring-2 ring-violet-500/25'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                    title={isSelf ? 'Change Avatar / Nickname' : undefined}
                  >
                    <AvatarDisplay avatarId={player.avatar || 'fox'} size={32} />
                  </button>
                  
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-200 truncate">
                        {player.nickname}
                      </span>
                      {player.isHost && (
                        <Crown size={12} className="text-amber-400 flex-shrink-0" />
                      )}
                      {isSelf && (
                        <span className="text-4xs bg-violet-500/20 text-violet-400 px-1 py-0.5 rounded uppercase font-extrabold tracking-wider scale-90 flex-shrink-0">
                          You
                        </span>
                      )}
                      {isSelf && (
                        <button
                          onClick={openEditModal}
                          className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer transition-colors flex-shrink-0"
                          title="Edit Nickname & Icon"
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                    </div>
                    {!player.isConnected && (
                      <span className="text-5xs text-red-400 font-semibold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                        <WifiOff size={8} />
                        Seat holds 60s
                      </span>
                    )}
                  </div>
                </div>

                {/* Status / Kick button */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!player.isConnected ? (
                    <span className="text-2xs text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                      Offline
                    </span>
                  ) : player.isHost ? (
                    <span className="text-2xs bg-amber-400/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider">
                      Host
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-2xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                      <CheckCircle2 size={12} />
                      Ready
                    </span>
                  )}

                  {/* Host Kick Action */}
                  {isHost && !isSelf && (
                    <button
                      onClick={() => kickPlayer(player.id)}
                      className="p-1 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors ml-2 cursor-pointer"
                      title="Kick Player"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
        <Button variant="secondary" size="lg" onClick={leaveRoom} className="sm:w-1/3">
          Leave Room
        </Button>

        {isHost ? (
          <Button
            variant={canStartGame ? 'primary' : 'secondary'}
            size="lg"
            onClick={startGame}
            disabled={!canStartGame}
            className="sm:w-2/3"
          >
            {connectedPlayersCount < 3 
              ? 'Need 3+ Players' 
              : 'Start Game'}
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="lg"
            disabled
            className="sm:w-2/3 cursor-not-allowed opacity-75"
          >
            Waiting for Host...
          </Button>
        )}
      </div>

      {/* Edit Profile Modal Dialog */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm flex flex-col gap-5 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div>
              <h4 className="text-base font-black text-white uppercase tracking-wider">
                Edit Profile
              </h4>
              <p className="text-5xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                Customize your lobby presence
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              {/* Nickname Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-3xs font-extrabold text-slate-400 uppercase tracking-widest">
                  Your Nickname
                </label>
                <input
                  type="text"
                  value={newNickname}
                  onChange={(e) => {
                    setNewNickname(e.target.value);
                    if (nameError) setNameError('');
                  }}
                  className="glass-input px-3.5 py-2 rounded-xl text-slate-100 font-bold text-sm focus:outline-none w-full bg-slate-950 border border-slate-800"
                  maxLength={15}
                  placeholder="Enter nickname"
                  autoFocus
                />
                {nameError && (
                  <span className="text-4xs font-bold text-rose-400 uppercase tracking-wide">
                    {nameError}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-3xs font-extrabold text-slate-400 uppercase tracking-widest">
                  Choose Avatar
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatar(av.id)}
                      className={`relative flex flex-col items-center gap-1 p-2 rounded-2xl border cursor-pointer transition-all ${
                        selectedAvatar === av.id
                          ? 'bg-violet-600/20 border-violet-500 scale-105 shadow-lg shadow-violet-500/20'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="rounded-full overflow-hidden" style={{ width: 52, height: 52 }}>
                        <AvatarDisplay avatarId={av.id} size={52} />
                      </div>
                      <span className={`text-4xs font-bold uppercase tracking-wider ${
                        selectedAvatar === av.id ? 'text-violet-300' : 'text-slate-500'
                      }`}>{av.label}</span>
                      {selectedAvatar === av.id && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1.5 4L3.2 5.8L6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-2 w-full mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
