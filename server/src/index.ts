import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import { RoomStore } from './roomStore.js';
import { RoomSettings } from '../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

const PORT = process.env.PORT || 6969;
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Broadcast state update to all players in a room
const broadcastState = (code: string, room: any) => {
  io.to(code).emit('game-state', room);
};

// Send room closed warning to all players in a room and disconnect them
const notifyRoomClosed = (code: string) => {
  io.to(code).emit('room-closed');
  // Make everyone leave the socket room
  io.in(code).socketsLeave(code);
};

// Initialize the Room Store
const store = new RoomStore(broadcastState, notifyRoomClosed);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // 1. Create Room
  socket.on('create-room', ({ nickname, settings, playerId }: { nickname: string; settings: RoomSettings; playerId: string }) => {
    try {
      if (!nickname || nickname.trim() === '') {
        return socket.emit('game-error', 'Nickname is required');
      }
      const room = store.createRoom(settings);

      // Attach player info and join channel first
      socket.data.playerId = playerId;
      socket.data.roomCode = room.code;
      socket.join(room.code);

      // Join room in store (which triggers initial state broadcast)
      store.joinRoom(room.code, playerId, nickname, socket.id);
      console.log(`Room ${room.code} created by host ${nickname} (${playerId})`);
    } catch (error: any) {
      socket.emit('game-error', error.message || 'Failed to create room');
    }
  });

  // 2. Join Room
  socket.on('join-room', ({ nickname, roomCode, playerId }: { nickname: string; roomCode: string; playerId: string }) => {
    try {
      if (!nickname || nickname.trim() === '') {
        return socket.emit('game-error', 'Nickname is required');
      }
      if (!roomCode || roomCode.length !== 6) {
        return socket.emit('game-error', 'Invalid Room Code format');
      }

      // Join channel first
      socket.data.playerId = playerId;
      socket.data.roomCode = roomCode;
      socket.join(roomCode);

      try {
        store.joinRoom(roomCode, playerId, nickname, socket.id);
        console.log(`Player ${nickname} (${playerId}) joined Room ${roomCode}`);
      } catch (storeError: any) {
        // Leave channel if store rejection occurs (full, duplicate nickname, etc)
        socket.leave(roomCode);
        socket.data.playerId = undefined;
        socket.data.roomCode = undefined;
        throw storeError;
      }
    } catch (error: any) {
      socket.emit('game-error', error.message || 'Failed to join room');
    }
  });

  // 3. Reconnect Player
  socket.on('reconnect-player', ({ playerId, roomCode }: { playerId: string; roomCode: string }) => {
    try {
      // Join channel first
      socket.data.playerId = playerId;
      socket.data.roomCode = roomCode;
      socket.join(roomCode);

      const room = store.reconnectPlayer(roomCode, playerId, socket.id);
      if (room) {
        console.log(`Player ${playerId} reconnected to Room ${roomCode}`);
      } else {
        socket.leave(roomCode);
        socket.data.playerId = undefined;
        socket.data.roomCode = undefined;
        socket.emit('reconnect-failed', 'Session expired or Room closed');
      }
    } catch (error: any) {
      socket.leave(roomCode);
      socket.data.playerId = undefined;
      socket.data.roomCode = undefined;
      socket.emit('reconnect-failed', 'Could not reconnect');
    }
  });

  // 4. Ready Status Toggle
  socket.on('player-ready', ({ isReady }: { isReady: boolean }) => {
    const { playerId, roomCode } = socket.data;
    if (playerId && roomCode) {
      store.playerReady(roomCode, playerId, isReady);
    }
  });

  // Change Player Nickname
  socket.on('change-nickname', ({ nickname }: { nickname: string }) => {
    const { playerId, roomCode } = socket.data;
    if (playerId && roomCode && nickname) {
      store.updatePlayerNickname(roomCode, playerId, nickname);
    }
  });

  // Change Player Avatar
  socket.on('change-avatar', ({ avatar }: { avatar: string }) => {
    const { playerId, roomCode } = socket.data;
    if (playerId && roomCode && avatar) {
      store.updatePlayerAvatar(roomCode, playerId, avatar);
    }
  });

  // 5. Host starts game
  socket.on('start-game', () => {
    const { playerId, roomCode } = socket.data;
    if (playerId && roomCode) {
      try {
        store.startGame(roomCode, playerId);
        console.log(`Game started in Room ${roomCode}`);
      } catch (error: any) {
        socket.emit('game-error', error.message || 'Failed to start game');
      }
    }
  });

  // Submit Description Clue
  socket.on('submit-clue', ({ text }: { text: string }) => {
    const { playerId, roomCode } = socket.data;
    if (playerId && roomCode && text) {
      store.submitClue(roomCode, playerId, text);
    }
  });

  // Done Speaking
  socket.on('done-speaking', () => {
    const { playerId, roomCode } = socket.data;
    if (playerId && roomCode) {
      store.doneSpeaking(roomCode, playerId);
    }
  });

  // 6. Submit Vote
  socket.on('submit-vote', ({ targetPlayerId }: { targetPlayerId: string }) => {
    const { playerId, roomCode } = socket.data;
    if (playerId && roomCode) {
      try {
        store.submitVote(roomCode, playerId, targetPlayerId);
      } catch (error: any) {
        socket.emit('game-error', error.message || 'Failed to submit vote');
      }
    }
  });

  // Play one more round of clues (Host only)
  socket.on('play-more-round', () => {
    const { playerId, roomCode } = socket.data;
    if (playerId && roomCode) {
      try {
        store.playOneMoreRound(roomCode, playerId);
      } catch (error: any) {
        socket.emit('game-error', error.message || 'Failed to request another round');
      }
    }
  });

  // Reveal voted player and end round (Host only)
  socket.on('reveal-voted-player', () => {
    const { playerId, roomCode } = socket.data;
    if (playerId && roomCode) {
      try {
        store.revealVotedPlayer(roomCode, playerId);
      } catch (error: any) {
        socket.emit('game-error', error.message || 'Failed to reveal identity');
      }
    }
  });

  // 7. Kick Player (Host Only)
  socket.on('kick-player', ({ targetPlayerId }: { targetPlayerId: string }) => {
    const { playerId, roomCode } = socket.data;
    if (playerId && roomCode) {
      try {
        store.kickPlayer(roomCode, playerId, targetPlayerId);
        // Instruct that player's socket to leave the room channel
        const sockets = io.sockets.adapter.rooms.get(roomCode);
        if (sockets) {
          for (const id of sockets) {
            const clientSocket = io.sockets.sockets.get(id);
            if (clientSocket && clientSocket.data.playerId === targetPlayerId) {
              clientSocket.emit('room-closed', 'You have been kicked by the host');
              clientSocket.leave(roomCode);
              break;
            }
          }
        }
      } catch (error: any) {
        socket.emit('game-error', error.message || 'Failed to kick player');
      }
    }
  });

  // 8. Next Round (Host Only)
  socket.on('next-round', () => {
    const { playerId, roomCode } = socket.data;
    if (playerId && roomCode) {
      try {
        store.nextRound(roomCode, playerId);
      } catch (error: any) {
        socket.emit('game-error', error.message || 'Failed to start next round');
      }
    }
  });

  // 9. Leave Room Voluntarily
  socket.on('leave-room', () => {
    const { playerId, roomCode } = socket.data;
    if (playerId && roomCode) {
      store.leaveRoom(roomCode, playerId);
      socket.leave(roomCode);
      socket.data.playerId = undefined;
      socket.data.roomCode = undefined;
      console.log(`Player ${playerId} voluntarily left Room ${roomCode}`);
    }
  });

  // 10. Disconnect
  socket.on('disconnect', () => {
    const { playerId, roomCode } = socket.data;
    if (playerId && roomCode) {
      console.log(`Player ${playerId} temporarily disconnected from Room ${roomCode}`);
      store.disconnectPlayer(roomCode, playerId, socket.id);
    }
  });
});

// Serve Client static build files in Production
const pathsToTry = [
  path.join(__dirname, '../../client/dist'), // Dev mode
  path.join(__dirname, '../../../../client/dist'), // Prod compiled mode
  path.join(process.cwd(), '../client/dist'), // Running from server folder
  path.join(process.cwd(), 'client/dist'), // Running from root folder
];

let clientBuildPath = '';
for (const p of pathsToTry) {
  if (fs.existsSync(path.join(p, 'index.html'))) {
    clientBuildPath = p;
    break;
  }
}

if (!clientBuildPath) {
  clientBuildPath = path.join(__dirname, '../../client/dist');
}

console.log(`Serving static client files from: ${clientBuildPath}`);
app.use(express.static(clientBuildPath));

// React SPA fallback routing
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Word Imposter server running on port ${PORT}`);
});
