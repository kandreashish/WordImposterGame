import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Room, RoomSettings } from '../../../shared/types.js';

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
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Helper to generate a random client-side player ID
const getOrCreatePlayerId = (): string => {
  let pid = localStorage.getItem('wi_player_id');
  if (!pid) {
    pid = 'p_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('wi_player_id', pid);
  }
  return pid;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [nickname, setNickname] = useState(() => localStorage.getItem('wi_nickname') || '');
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('wi_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  const playerId = getOrCreatePlayerId();

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('wi_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    // Dynamically connect to the backend (port 6969) if we are accessing the client via Vite's port (5173)
    const socketUrl = window.location.port === '5173'
      ? `${window.location.protocol}//${window.location.hostname}:6969`
      : window.location.origin;

    const socketIo = io(socketUrl, {
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    setSocket(socketIo);

    socketIo.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected:', socketIo.id);

      // Attempt reconnection if we were previously in a room
      const savedRoomCode = localStorage.getItem('wi_room_code');
      if (savedRoomCode && playerId) {
        socketIo.emit('reconnect-player', { playerId, roomCode: savedRoomCode });
      }
    });

    socketIo.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    socketIo.on('game-state', (updatedRoom: Room) => {
      setRoom(updatedRoom);
      // Cache room details for potential reconnects
      localStorage.setItem('wi_room_code', updatedRoom.code);
      const self = updatedRoom.players.find(p => p.id === playerId);
      if (self) {
        setNickname(self.nickname);
        localStorage.setItem('wi_nickname', self.nickname);
      }
    });

    socketIo.on('game-error', (msg: string) => {
      setError(msg);
    });

    socketIo.on('reconnect-failed', () => {
      console.log('Reconnection failed - clearing cached room state');
      localStorage.removeItem('wi_room_code');
      setRoom(null);
    });

    socketIo.on('room-closed', (reason?: string) => {
      setError(reason || 'The room has been closed');
      localStorage.removeItem('wi_room_code');
      setRoom(null);
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
    socket.emit('create-room', { nickname: nickName, settings, playerId });
  };

  const joinRoom = (nickName: string, roomCode: string) => {
    if (!socket) return;
    setError(null);
    const cleanedCode = roomCode.trim();
    localStorage.setItem('wi_nickname', nickName);
    setNickname(nickName);
    socket.emit('join-room', { nickname: nickName, roomCode: cleanedCode, playerId });
  };

  const toggleReady = (isReady: boolean) => {
    if (!socket) return;
    socket.emit('player-ready', { isReady });
  };

  const startGame = () => {
    if (!socket) return;
    socket.emit('start-game');
  };

  const submitVote = (targetPlayerId: string) => {
    if (!socket) return;
    socket.emit('submit-vote', { targetPlayerId });
  };

  const kickPlayer = (targetPlayerId: string) => {
    if (!socket) return;
    socket.emit('kick-player', { targetPlayerId });
  };

  const nextRound = () => {
    if (!socket) return;
    socket.emit('next-round');
  };

  const leaveRoom = () => {
    if (!socket) return;
    socket.emit('leave-room');
    localStorage.removeItem('wi_room_code');
    setRoom(null);
  };

  const changeNickname = (newNickname: string) => {
    setNickname(newNickname);
    localStorage.setItem('wi_nickname', newNickname);
    socket?.emit('change-nickname', { nickname: newNickname });
  };

  const changeAvatar = (newAvatar: string) => {
    socket?.emit('change-avatar', { avatar: newAvatar });
  };

  const submitClue = (text: string) => {
    socket?.emit('submit-clue', { text });
  };

  const doneSpeaking = () => {
    socket?.emit('done-speaking');
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
