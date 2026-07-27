import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Room, RoomSettings } from '../../../shared/types.js';
import { trackEvent, identifyUser } from '../utils/analytics.js';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  room: Room | null;
  playerId: string;
  nickname: string;
  error: string | null;
  setError: (err: string | null) => void;
  createRoom: (nickname: string, settings: RoomSettings) => void;
  joinRoom: (nickname: string, roomCode: string) => void;
  toggleReady: (isReady: boolean) => void;
  startGame: () => void;
  submitVote: (targetPlayerId: string) => void;
  kickPlayer: (targetPlayerId: string) => void;
  nextRound: () => void;
  leaveRoom: () => void;
  changeNickname: (nickname: string) => void;
  changeAvatar: (avatar: string) => void;
  submitClue: (text: string) => void;
  doneSpeaking: () => void;
  playMoreRound: () => void;
  revealVotedPlayer: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Generate or fetch a persistent unique player ID
const getOrCreatePlayerId = (): string => {
  const key = 'wi_player_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = 'p_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(key, id);
  }
  return id;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [nickname, setNickname] = useState(() => localStorage.getItem('wi_nickname') || '');
  const [error, setError] = useState<string | null>(null);
  
  // Theme Management
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return document.documentElement.classList.contains('light') ? 'light' : 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
    trackEvent('click_toggle_theme', { screen: room?.status || 'Home', theme: nextTheme });
  };

  const playerId = getOrCreatePlayerId();

  useEffect(() => {
    // Establish connection to same host since server serves client, or localhost for local dev proxy
    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:6969' : window.location.origin;
    const socketIo = io(socketUrl, {
      path: '/wordgame/socket.io',
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    setSocket(socketIo);

    socketIo.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected:', socketIo.id);
      
      // Identify user on connect
      identifyUser(playerId, { nickname });
      trackEvent('socket_connected', { screen: 'System', socketId: socketIo.id });

      // Attempt reconnection if we were previously in a room
      const savedRoomCode = localStorage.getItem('wi_room_code');
      if (savedRoomCode && playerId) {
        socketIo.emit('reconnect-player', { playerId, roomCode: savedRoomCode });
      }
    });

    socketIo.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
      trackEvent('socket_disconnected', { screen: 'System' });
    });

    socketIo.on('game-state', (updatedRoom: Room) => {
      setRoom((prevRoom) => {
        // Track state transitions (contextual screens)
        if (!prevRoom || prevRoom.status !== updatedRoom.status) {
          trackEvent(`enter_screen_${updatedRoom.status.toLowerCase()}`, {
            screen: updatedRoom.status,
            roomCode: updatedRoom.code,
            round: updatedRoom.roundCount
          });
        }
        return updatedRoom;
      });

      // Cache room details for potential reconnects
      localStorage.setItem('wi_room_code', updatedRoom.code);
      const self = updatedRoom.players.find(p => p.id === playerId);
      if (self) {
        setNickname(self.nickname);
        localStorage.setItem('wi_nickname', self.nickname);
        identifyUser(playerId, { nickname: self.nickname, avatar: self.avatar });
      }
    });

    socketIo.on('game-error', (msg: string) => {
      setError(msg);
      trackEvent('game_error_triggered', { screen: room?.status || 'Game', error: msg });
    });

    socketIo.on('reconnect-failed', () => {
      console.log('Reconnection failed - clearing cached room state');
      localStorage.removeItem('wi_room_code');
      setRoom(null);
      trackEvent('reconnect_failed', { screen: 'Room' });
    });

    socketIo.on('room-closed', (reason?: string) => {
      setError(reason || 'The room has been closed');
      localStorage.removeItem('wi_room_code');
      setRoom(null);
      trackEvent('room_closed_by_server', { screen: 'Room', reason });
    });

    return () => {
      socketIo.disconnect();
    };
  }, [playerId]);

  const createRoom = (nickName: string, settings: RoomSettings) => {
    if (!socket) return;
    setError(null);
    localStorage.setItem('wi_nickname', nickName);
    setNickname(nickName);
    identifyUser(playerId, { nickname: nickName });
    trackEvent('click_submit_create_room', { screen: 'CreateRoom', nickname: nickName, settings });
    socket.emit('create-room', { nickname: nickName, settings, playerId });
  };

  const joinRoom = (nickName: string, roomCode: string) => {
    if (!socket) return;
    setError(null);
    const cleanedCode = roomCode.trim();
    localStorage.setItem('wi_nickname', nickName);
    setNickname(nickName);
    identifyUser(playerId, { nickname: nickName });
    trackEvent('click_submit_join_room', { screen: 'JoinRoom', nickname: nickName, roomCode: cleanedCode });
    socket.emit('join-room', { nickname: nickName, roomCode: cleanedCode, playerId });
  };

  const toggleReady = (isReady: boolean) => {
    if (!socket) return;
    trackEvent('click_toggle_ready', { screen: room?.status || 'Lobby', isReady });
    socket.emit('player-ready', { isReady });
  };

  const startGame = () => {
    if (!socket) return;
    trackEvent('click_start_game', { screen: 'Lobby', roomCode: room?.code });
    socket.emit('start-game');
  };

  const submitVote = (targetPlayerId: string) => {
    if (!socket) return;
    trackEvent('click_submit_vote', { screen: 'Voting', targetId: targetPlayerId });
    socket.emit('submit-vote', { targetPlayerId });
  };

  const kickPlayer = (targetPlayerId: string) => {
    if (!socket) return;
    trackEvent('click_kick_player', { screen: 'Lobby', targetPlayerId });
    socket.emit('kick-player', { targetPlayerId });
  };

  const nextRound = () => {
    if (!socket) return;
    trackEvent('click_play_again', { screen: 'Results' });
    socket.emit('next-round');
  };

  const leaveRoom = () => {
    if (!socket) return;
    trackEvent('click_leave_room', { screen: room?.status || 'Room', roomCode: room?.code });
    socket.emit('leave-room');
    localStorage.removeItem('wi_room_code');
    setRoom(null);
  };

  const changeNickname = (newNickname: string) => {
    setNickname(newNickname);
    localStorage.setItem('wi_nickname', newNickname);
    identifyUser(playerId, { nickname: newNickname });
    trackEvent('change_nickname', { screen: 'Lobby', nickname: newNickname });
    socket?.emit('change-nickname', { nickname: newNickname });
  };

  const changeAvatar = (newAvatar: string) => {
    trackEvent('change_avatar', { screen: 'Lobby', avatar: newAvatar });
    socket?.emit('change-avatar', { avatar: newAvatar });
  };

  const submitClue = (text: string) => {
    trackEvent('click_submit_clue', { screen: 'Discussion', wordCount: text.split(' ').length });
    socket?.emit('submit-clue', { text });
  };

  const doneSpeaking = () => {
    trackEvent('click_done_speaking', { screen: 'Discussion' });
    socket?.emit('done-speaking');
  };

  const playMoreRound = () => {
    trackEvent('click_host_one_more_round', { screen: 'VoteResolved' });
    socket?.emit('play-more-round');
  };

  const revealVotedPlayer = () => {
    trackEvent('click_host_reveal', { screen: 'VoteResolved' });
    socket?.emit('reveal-voted-player');
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        room,
        playerId,
        nickname,
        error,
        setError,
        createRoom,
        joinRoom,
        toggleReady,
        startGame,
        submitVote,
        kickPlayer,
        nextRound,
        leaveRoom,
        changeNickname,
        changeAvatar,
        submitClue,
        doneSpeaking,
        playMoreRound,
        revealVotedPlayer,
        theme,
        toggleTheme
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
