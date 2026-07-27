import { Room, RoomSettings, Player, GameMode, GameStatus, GameResult } from '../../shared/types.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load word bank
interface WordPair {
  majority: string;
  imposter: string;
  category: string;
  hint: string;
}

let wordBank: WordPair[] = [];
const wordsPathsToTry = [
  path.join(__dirname, '../words.json'), // Dev mode
  path.join(__dirname, '../../../../words.json'), // Prod compiled mode inside dist/server/src
  path.join(process.cwd(), 'words.json'),
  path.join(process.cwd(), 'server/words.json'),
];

let wordsPath = '';
for (const p of wordsPathsToTry) {
  if (fs.existsSync(p) && fs.statSync(p).isFile()) {
    wordsPath = p;
    break;
  }
}

if (!wordsPath) {
  wordsPath = path.join(__dirname, '../words.json');
}

try {
  console.log(`Loading word bank from: ${wordsPath}`);
  const wordsRaw = fs.readFileSync(wordsPath, 'utf8');
  wordBank = JSON.parse(wordsRaw);
} catch (error) {
  console.error('Failed to load word bank, using fallback list:', error);
  wordBank = [
    { majority: "Apple", imposter: "Pear", category: "Food", hint: "A sweet orchard fruit." },
    { majority: "Cat", imposter: "Dog", category: "Animals", hint: "A furry domestic household pet." },
    { majority: "Coffee", imposter: "Tea", category: "Food", hint: "A hot caffeinated brewed drink." }
  ];
}

export class RoomStore {
  private rooms = new Map<string, Room>();
  private inactivityTimers = new Map<string, NodeJS.Timeout>();
  private gameIntervals = new Map<string, NodeJS.Timeout>();
  private disconnectTimers = new Map<string, Map<string, NodeJS.Timeout>>(); // roomCode -> (playerId -> Timeout)
  private dataFilePath: string;

  constructor(
    private onStateUpdate: (code: string, room: Room) => void,
    private onRoomClosed: (code: string) => void
  ) {
    const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) {}
    }
    this.dataFilePath = path.join(dataDir, 'rooms.json');
    this.loadFromDisk();
  }

  // Save room store state to disk
  private saveToDisk() {
    try {
      const serializableRooms: Room[] = Array.from(this.rooms.values()).map(r => ({
        ...r,
        // Mark players as disconnected on disk reboot so they reconnect cleanly
        players: r.players.map(p => ({ ...p, isConnected: false, socketId: null }))
      }));
      fs.writeFileSync(this.dataFilePath, JSON.stringify(serializableRooms, null, 2));
    } catch (err) {
      console.error('Failed to save rooms to disk:', err);
    }
  }

  // Load room store state from disk on server start
  private loadFromDisk() {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const raw = fs.readFileSync(this.dataFilePath, 'utf8');
        const loaded: Room[] = JSON.parse(raw);
        for (const room of loaded) {
          // Reset runtime variables
          room.players.forEach(p => { p.isConnected = false; p.socketId = null; });
          this.rooms.set(room.code, room);
          this.disconnectTimers.set(room.code, new Map());
          this.touchRoom(room.code);
        }
        console.log(`Restored ${loaded.length} room(s) from persistent disk storage.`);
      }
    } catch (err) {
      console.error('Failed to load rooms from disk:', err);
    }
  }

  // Generate 6-digit code
  private generateRoomCode(): string {
    const chars = '0123456789';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(code));
    return code;
  }

  // Reset inactivity timer (30 minutes) and persist state
  private touchRoom(code: string) {
    const existing = this.inactivityTimers.get(code);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      console.log(`Room ${code} closed due to 30 mins inactivity.`);
      this.closeRoom(code);
    }, 30 * 60 * 1000);

    this.inactivityTimers.set(code, timer);
    this.saveToDisk();
  }

  // Get room
  public getRoom(code: string): Room | undefined {
    return this.rooms.get(code);
  }

  // Create room
  public createRoom(settings: RoomSettings): Room {
    const code = this.generateRoomCode();
    const room: Room = {
      code,
      settings,
      players: [],
      status: 'LOBBY',
      majorityWord: '',
      imposterWord: null,
      timer: 0,
      roundResults: null,
      roundCount: 0,
      chat: [],
      activePlayerId: null,
      turnOrder: [],
      currentTurnIndex: 0,
      turnTimer: 0,
      imposterHint: null,
      votedPlayerId: null
    };
    this.rooms.set(code, room);
    this.disconnectTimers.set(code, new Map());
    this.touchRoom(code);
    return room;
  }

  // Join Room
  public joinRoom(code: string, playerId: string, nickname: string, socketId: string): Room {
    const room = this.rooms.get(code);
    if (!room) throw new Error('Room not found');

    if (room.players.length >= room.settings.maxPlayers) {
      throw new Error('Room is full');
    }

    if (room.status !== 'LOBBY') {
      throw new Error('Game already in progress');
    }

    // Check if nickname taken
    const nameTaken = room.players.some(p => p.nickname.toLowerCase() === nickname.toLowerCase());
    if (nameTaken) throw new Error('Nickname already taken in this room');

    const isHost = room.players.length === 0;

    const ALL_AVATAR_IDS = [
      'fox', 'alien', 'robot', 'ghost', 'panda', 'unicorn',
      'lion', 'frog', 'shark', 'dino', 'wizard', 'ninja',
      'penguin', 'vampire', 'clown'
    ];
    const takenAvatars = new Set(room.players.map(p => p.avatar));
    const available = ALL_AVATAR_IDS.filter(id => !takenAvatars.has(id));
    // If all are taken (shouldn't happen with 15 avatars & max ~12 players), fall back to full list
    const pool = available.length > 0 ? available : ALL_AVATAR_IDS;
    const randomAvatar = pool[Math.floor(Math.random() * pool.length)];

    const newPlayer: Player = {
      id: playerId,
      nickname,
      isHost,
      isReady: true,
      isImposter: false,
      word: null,
      role: 'MAJORITY',
      isAlive: true,
      score: 0,
      voteTargetId: null,
      isConnected: true,
      socketId,
      avatar: randomAvatar
    };

    room.players.push(newPlayer);
    this.touchRoom(code);
    this.onStateUpdate(code, room);
    return room;
  }

  // Reconnect Player
  public reconnectPlayer(code: string, playerId: string, socketId: string): Room | null {
    const room = this.rooms.get(code);
    if (!room) return null;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return null;

    player.isConnected = true;
    player.socketId = socketId;

    // Clear disconnect timer if any
    const roomDisconnects = this.disconnectTimers.get(code);
    if (roomDisconnects) {
      const timeout = roomDisconnects.get(playerId);
      if (timeout) {
        clearTimeout(timeout);
        roomDisconnects.delete(playerId);
      }
    }

    this.touchRoom(code);
    this.onStateUpdate(code, room);
    return room;
  }

  // Disconnect Player (returns true if room closed/removed, false otherwise)
  public disconnectPlayer(code: string, playerId: string, socketId: string): boolean {
    const room = this.rooms.get(code);
    if (!room) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    // If the player has already connected on a newer socket, ignore the old socket's disconnect
    if (player.socketId && player.socketId !== socketId) {
      console.log(`Ignoring disconnect for player ${player.nickname} because they reconnected on a different socket.`);
      return false;
    }

    player.isConnected = false;
    player.socketId = null;

    this.touchRoom(code);

    // Setup 10-minute seat reservation timer (allows container restart / network drops)
    const roomDisconnects = this.disconnectTimers.get(code);
    if (roomDisconnects) {
      // Clear any existing
      const existing = roomDisconnects.get(playerId);
      if (existing) clearTimeout(existing);

      const timeout = setTimeout(() => {
        console.log(`Seat reservation expired for ${player.nickname} in room ${code}`);
        this.removePlayer(code, playerId);
      }, 10 * 60 * 1000);

      roomDisconnects.set(playerId, timeout);
    }

    this.onStateUpdate(code, room);
    return false;
  }

  // Leave room voluntarily
  public leaveRoom(code: string, playerId: string) {
    this.removePlayer(code, playerId);
  }

  // Remove Player (triggers host transfer or room deletion if empty)
  private removePlayer(code: string, playerId: string) {
    const room = this.rooms.get(code);
    if (!room) return;

    // Clear seat timer if any
    const roomDisconnects = this.disconnectTimers.get(code);
    if (roomDisconnects) {
      const timeout = roomDisconnects.get(playerId);
      if (timeout) clearTimeout(timeout);
      roomDisconnects.delete(playerId);
    }

    const playerIdx = room.players.findIndex(p => p.id === playerId);
    if (playerIdx === -1) return;

    const player = room.players[playerIdx];
    room.players.splice(playerIdx, 1);

    // If room is empty, close it
    if (room.players.length === 0) {
      this.closeRoom(code);
      return;
    }

    // Host transfer
    if (player.isHost) {
      // Find the first connected player to host, else first player
      const nextHost = room.players.find(p => p.isConnected) || room.players[0];
      if (nextHost) {
        nextHost.isHost = true;
        console.log(`Host transferred to ${nextHost.nickname} in room ${code}`);
      }
    }

    // If game in progress, check if we need to resolve it
    if (room.status !== 'LOBBY') {
      this.checkGameViability(code);
    } else {
      this.onStateUpdate(code, room);
    }
  }

  // Kick player
  public kickPlayer(code: string, hostPlayerId: string, targetPlayerId: string) {
    const room = this.rooms.get(code);
    if (!room) return;

    const host = room.players.find(p => p.id === hostPlayerId);
    if (!host || !host.isHost) throw new Error('Only the host can kick players');

    this.removePlayer(code, targetPlayerId);
  }

  // Player Ready
  public playerReady(code: string, playerId: string, isReady: boolean) {
    const room = this.rooms.get(code);
    if (!room) return;

    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.isReady = isReady;
      this.touchRoom(code);
      this.onStateUpdate(code, room);
    }
  }

  // Update Player Nickname in Lobby
  public updatePlayerNickname(code: string, playerId: string, nickname: string) {
    const room = this.rooms.get(code);
    if (!room) return;

    const player = room.players.find(p => p.id === playerId);
    if (player) {
      player.nickname = nickname.trim();
      this.touchRoom(code);
      this.onStateUpdate(code, room);
    }
  }

  // Update Player Avatar in Lobby
  public updatePlayerAvatar(code: string, playerId: string, avatar: string) {
    const room = this.rooms.get(code);
    if (!room) return;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return;

    // Reject if another player already has this avatar
    const alreadyTaken = room.players.some(p => p.id !== playerId && p.avatar === avatar);
    if (alreadyTaken) return;

    player.avatar = avatar;
    this.touchRoom(code);
    this.onStateUpdate(code, room);
  }

  // Start game
  public startGame(code: string, hostPlayerId: string) {
    const room = this.rooms.get(code);
    if (!room) return;

    const host = room.players.find(p => p.id === hostPlayerId);
    if (!host || !host.isHost) throw new Error('Only the host can start the game');

    // Filter connected players
    const activePlayers = room.players.filter(p => p.isConnected);
    if (activePlayers.length < 3) {
      throw new Error('At least 3 players are required to start the game');
    }

    // Determine safe imposter count (must leave at least 2 majority players)
    const targetImposters = Math.max(1, Math.min(room.settings.imposterCount, activePlayers.length - 2));

    // Select Imposters by shuffling active players
    const activePlayerIds = activePlayers.map(p => p.id);
    const shuffledIds = [...activePlayerIds].sort(() => Math.random() - 0.5);
    const imposterIds = new Set(shuffledIds.slice(0, targetImposters));

    // Pick random word pair filtered by categories (empty array = All)
    let filteredBank = wordBank;
    const selectedCategories = room.settings.categories;
    if (selectedCategories && selectedCategories.length > 0) {
      const lowerSelected = selectedCategories.map(c => c.toLowerCase());
      filteredBank = wordBank.filter(w => lowerSelected.includes(w.category.toLowerCase()));
    }
    if (filteredBank.length === 0) {
      filteredBank = wordBank;
    }
    const wordPair = filteredBank[Math.floor(Math.random() * filteredBank.length)];

    room.majorityWord = wordPair.majority;
    if (room.settings.gameMode === 'classic') {
      room.imposterWord = null;
    } else {
      room.imposterWord = wordPair.imposter;
    }

    // Setup players state for game start and assign roles/words
    room.players.forEach(p => {
      if (activePlayerIds.includes(p.id)) {
        p.isAlive = true;
        p.isReady = false;
        p.voteTargetId = null;
        if (imposterIds.has(p.id)) {
          p.isImposter = true;
          p.role = 'IMPOSTER';
          p.word = room.imposterWord;
        } else {
          p.isImposter = false;
          p.role = 'MAJORITY';
          p.word = room.majorityWord;
        }
      } else {
        // Disconnected players are dead/inactive for this game round
        p.isAlive = false;
        p.isReady = false;
        p.voteTargetId = null;
        p.isImposter = false;
        p.role = 'MAJORITY';
        p.word = null;
      }
    });

    room.roundResults = null;
    room.roundCount++;
    room.chat = [];
    room.imposterHint = wordPair.hint;
    room.turnOrder = [];
    room.currentTurnIndex = 0;
    room.activePlayerId = null;
    room.turnTimer = 0;
    room.votedPlayerId = null;
    this.touchRoom(code);

    // Transition to Reveal phase
    this.startPhase(code, 'REVEAL', 10); // 10s for reveal
  }

  // Start a game phase with a timer
  private startPhase(code: string, status: GameStatus, durationSeconds: number) {
    const room = this.rooms.get(code);
    if (!room) return;

    room.status = status;
    room.timer = durationSeconds;

    // Clear active interval
    const existingInterval = this.gameIntervals.get(code);
    if (existingInterval) clearInterval(existingInterval);

    this.onStateUpdate(code, room);

    const interval = setInterval(() => {
      const r = this.rooms.get(code);
      if (!r) {
        clearInterval(interval);
        return;
      }

      r.timer--;
      if (r.timer <= 0) {
        clearInterval(interval);
        this.advancePhase(code);
      } else {
        this.onStateUpdate(code, r);
      }
    }, 1000);

    this.gameIntervals.set(code, interval);
  }

  // Advance to next game phase
  private advancePhase(code: string) {
    const room = this.rooms.get(code);
    if (!room) return;

    if (room.status === 'REVEAL') {
      // Initialize turn order for discussion phase
      const activePlayers = room.players.filter(p => p.isConnected && p.isAlive);
      room.turnOrder = activePlayers.map(p => p.id).sort(() => Math.random() - 0.5);
      room.currentTurnIndex = 0;
      room.activePlayerId = room.turnOrder[0] || null;
      room.chat = [];

      this.startPhase(code, 'DISCUSSION', 30); // 30 seconds for the first player's description
    } else if (room.status === 'DISCUSSION') {
      // Active player's turn timed out, advance to the next player
      this.advanceTurn(code);
    } else if (room.status === 'VOTING') {
      this.goToVoteResolved(code);
    } else if (room.status === 'VOTE_RESOLVED') {
      this.resolveVoting(code);
    }
  }

  // Advance turn inside Discussion phase
  public advanceTurn(code: string) {
    const room = this.rooms.get(code);
    if (!room) return;

    if (room.status !== 'DISCUSSION') return;

    room.currentTurnIndex++;
    if (room.currentTurnIndex >= room.turnOrder.length) {
      // All players have spoken, advance to Voting phase
      this.startPhase(code, 'VOTING', room.settings.votingTime);
    } else {
      room.activePlayerId = room.turnOrder[room.currentTurnIndex];
      // Reset timer to 30s for the next player
      this.startPhase(code, 'DISCUSSION', 30);
    }
  }

  // Submit Clue text in Discussion phase
  public submitClue(code: string, playerId: string, text: string) {
    const room = this.rooms.get(code);
    if (!room) return;

    if (room.status !== 'DISCUSSION') return;
    if (room.activePlayerId !== playerId) return;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return;

    // Count how many clues this player has submitted so far in this game session to label round number (Round 1, Round 2, etc)
    const playerClueCount = room.chat.filter(m => m.playerId === playerId).length + 1;

    room.chat.push({
      playerId,
      nickname: player.nickname,
      text: text.trim(),
      timestamp: Date.now(),
      roundNumber: playerClueCount
    });

    this.advanceTurn(code);
  }

  // Done Speaking inside Discussion phase
  public doneSpeaking(code: string, playerId: string) {
    const room = this.rooms.get(code);
    if (!room) return;

    if (room.status !== 'DISCUSSION') return;
    if (room.activePlayerId !== playerId) return;

    this.advanceTurn(code);
  }

  // Submit Vote
  public submitVote(code: string, voterId: string, targetId: string) {
    const room = this.rooms.get(code);
    if (!room) return;

    const voter = room.players.find(p => p.id === voterId);
    if (!voter || !voter.isAlive || !voter.isConnected) return;
    if (voterId === targetId) throw new Error('You cannot vote for yourself');

    voter.voteTargetId = targetId;
    this.touchRoom(code);

    // Check if everyone voted
    const activeVotingPlayers = room.players.filter(p => p.isAlive && p.isConnected);
    const allVoted = activeVotingPlayers.every(p => p.voteTargetId !== null);

    if (allVoted) {
      const interval = this.gameIntervals.get(code);
      if (interval) clearInterval(interval);
      this.goToVoteResolved(code);
    } else {
      this.onStateUpdate(code, room);
    }
  }

  // Go to Vote Resolved phase (pending host decision)
  private goToVoteResolved(code: string) {
    const room = this.rooms.get(code);
    if (!room) return;

    // Count votes
    const votesMap = new Map<string, number>();
    room.players.forEach(p => {
      if (p.voteTargetId) {
        votesMap.set(p.voteTargetId, (votesMap.get(p.voteTargetId) || 0) + 1);
      }
    });

    // Find player with maximum votes
    let maxVotes = -1;
    let candidatesToEliminate: Player[] = [];

    room.players.forEach(p => {
      const votes = votesMap.get(p.id) || 0;
      if (votes > maxVotes) {
        maxVotes = votes;
        candidatesToEliminate = [p];
      } else if (votes === maxVotes && votes > 0) {
        candidatesToEliminate.push(p);
      }
    });

    let candidateId: string | null = null;
    if (candidatesToEliminate.length === 1 && maxVotes > 0) {
      candidateId = candidatesToEliminate[0].id;
    }

    room.votedPlayerId = candidateId;
    this.startPhase(code, 'VOTE_RESOLVED', 25); // 25s for the host to decide
  }

  // Play one more round of description clues
  public playOneMoreRound(code: string, hostPlayerId: string) {
    const room = this.rooms.get(code);
    if (!room) return;

    const host = room.players.find(p => p.id === hostPlayerId);
    if (!host || !host.isHost) throw new Error('Only the host can decide to play one more round');

    if (room.status !== 'VOTE_RESOLVED') return;

    // Reset votes for all players
    room.players.forEach(p => {
      p.voteTargetId = null;
    });
    room.votedPlayerId = null;

    // Initialize description turn order again
    const activePlayers = room.players.filter(p => p.isConnected && p.isAlive);
    room.turnOrder = activePlayers.map(p => p.id).sort(() => Math.random() - 0.5);
    room.currentTurnIndex = 0;
    room.activePlayerId = room.turnOrder[0] || null;
    room.chat = [];

    this.startPhase(code, 'DISCUSSION', 30);
  }

  // Reveal Voted Player (commit elimination and end round)
  public revealVotedPlayer(code: string, hostPlayerId: string) {
    const room = this.rooms.get(code);
    if (!room) return;

    const host = room.players.find(p => p.id === hostPlayerId);
    if (!host || !host.isHost) throw new Error('Only the host can reveal the identity');

    if (room.status !== 'VOTE_RESOLVED') return;

    // Resolve standard voting logic to end game round
    this.resolveVoting(code);
  }

  // Resolve Voting Phase
  private resolveVoting(code: string) {
    const room = this.rooms.get(code);
    if (!room) return;

    // Count votes
    const votesMap = new Map<string, number>(); // playerId -> vote count
    room.players.forEach(p => {
      if (p.voteTargetId) {
        votesMap.set(p.voteTargetId, (votesMap.get(p.voteTargetId) || 0) + 1);
      }
    });

    // Find player with maximum votes
    let maxVotes = -1;
    let candidatesToEliminate: Player[] = [];

    room.players.forEach(p => {
      const votes = votesMap.get(p.id) || 0;
      if (votes > maxVotes) {
        maxVotes = votes;
        candidatesToEliminate = [p];
      } else if (votes === maxVotes && votes > 0) {
        candidatesToEliminate.push(p);
      }
    });

    let eliminatedPlayer: Player | null = null;
    let wasImposterVotedOut = false;

    // In case of a tie or no votes at all, no one gets eliminated or pick randomly?
    // Let's say: if there is a tie, no one is eliminated (round ends in failure for majority, or imposter wins)
    // To make it fun: if there is a tie, no one is eliminated.
    if (candidatesToEliminate.length === 1 && maxVotes > 0) {
      eliminatedPlayer = candidatesToEliminate[0];
      eliminatedPlayer.isAlive = false;
      if (eliminatedPlayer.isImposter) {
        wasImposterVotedOut = true;
      }
    }

    // Determine Winner
    // If imposter is voted out -> MAJORITY wins
    // If imposter is NOT voted out (or tie) -> IMPOSTER wins
    let winnerRole: 'MAJORITY' | 'IMPOSTER' = 'IMPOSTER';
    if (wasImposterVotedOut) {
      winnerRole = 'MAJORITY';
    }

    // Update scores
    room.players.forEach(p => {
      if (p.role === winnerRole) {
        p.score += 100; // award points
      }
    });

    // Gather results metadata
    const imposterNicknames = room.players.filter(p => p.isImposter).map(p => p.nickname);
    const majorityNicknames = room.players.filter(p => !p.isImposter).map(p => p.nickname);

    const result: GameResult = {
      winnerRole,
      imposterWord: room.imposterWord,
      majorityWord: room.majorityWord,
      imposterNicknames,
      majorityNicknames,
      eliminatedPlayerNickname: eliminatedPlayer ? eliminatedPlayer.nickname : null,
      wasImposterVotedOut
    };

    room.roundResults = result;
    room.status = 'RESULTS';
    room.timer = 0;

    // Clear game interval
    const interval = this.gameIntervals.get(code);
    if (interval) clearInterval(interval);

    this.onStateUpdate(code, room);
  }

  // Trigger Play Again (reset variables, keep scores, go back to lobby)
  public nextRound(code: string, hostPlayerId: string) {
    const room = this.rooms.get(code);
    if (!room) return;

    const host = room.players.find(p => p.id === hostPlayerId);
    if (!host || !host.isHost) throw new Error('Only the host can start the next round');

    room.status = 'LOBBY';
    room.majorityWord = '';
    room.imposterWord = null;
    room.roundResults = null;
    room.timer = 0;

    room.players.forEach(p => {
      p.isReady = false;
      p.isAlive = true;
      p.isImposter = false;
      p.role = 'MAJORITY';
      p.voteTargetId = null;
      p.word = null;
    });

    this.touchRoom(code);
    this.onStateUpdate(code, room);
  }

  // In case of sudden drops, check if game is still viable (needs at least 1 alive majority and 1 alive imposter)
  private checkGameViability(code: string) {
    const room = this.rooms.get(code);
    if (!room) return;

    const connectedPlayers = room.players.filter(p => p.isConnected);
    const connectedImposters = connectedPlayers.filter(p => p.isImposter && p.isAlive);
    const connectedMajority = connectedPlayers.filter(p => !p.isImposter && p.isAlive);

    // If the imposter left, majority wins automatically
    if (connectedImposters.length === 0) {
      console.log(`No active imposters left in Room ${code}. Force resolving.`);
      this.resolveVoting(code);
    } 
    // If too few players, revert to lobby
    else if (connectedPlayers.length < 3) {
      console.log(`Fewer than 3 active players in Room ${code}. Reverting to lobby.`);
      this.resetToLobby(code);
    } else {
      this.onStateUpdate(code, room);
    }
  }

  private resetToLobby(code: string) {
    const room = this.rooms.get(code);
    if (!room) return;

    const interval = this.gameIntervals.get(code);
    if (interval) clearInterval(interval);

    room.status = 'LOBBY';
    room.majorityWord = '';
    room.imposterWord = null;
    room.timer = 0;
    room.roundResults = null;
    room.players.forEach(p => {
      p.isReady = false;
      p.isAlive = true;
      p.isImposter = false;
      p.role = 'MAJORITY';
      p.voteTargetId = null;
      p.word = null;
    });

    this.onStateUpdate(code, room);
  }

  // Close / Delete Room
  public closeRoom(code: string) {
    // Clear inactivity timer
    const inactivityTimer = this.inactivityTimers.get(code);
    if (inactivityTimer) clearTimeout(inactivityTimer);
    this.inactivityTimers.delete(code);

    // Clear game timer interval
    const gameInterval = this.gameIntervals.get(code);
    if (gameInterval) clearInterval(gameInterval);
    this.gameIntervals.delete(code);

    // Clear any seat timers
    const roomDisconnects = this.disconnectTimers.get(code);
    if (roomDisconnects) {
      roomDisconnects.forEach(t => clearTimeout(t));
      this.disconnectTimers.delete(code);
    }

    this.rooms.delete(code);
    this.saveToDisk();
    this.onRoomClosed(code);
    console.log(`Room ${code} closed.`);
  }
}
