export type GameMode = 'classic' | 'undercover';

export type GameStatus = 'LOBBY' | 'REVEAL' | 'DISCUSSION' | 'VOTING' | 'VOTE_RESOLVED' | 'RESULTS';

export interface Player {
  id: string;
  nickname: string;
  isHost: boolean;
  isReady: boolean;
  isImposter: boolean;
  word: string | null; // Null until game starts or if Imposter in Classic mode
  role: 'MAJORITY' | 'IMPOSTER';
  isAlive: boolean;
  score: number;
  voteTargetId: string | null; // Player ID they voted for this round
  isConnected: boolean;
  socketId?: string | null;
  avatar: string;
}

export interface RoomSettings {
  gameMode: GameMode;
  discussionTime: number; // Clue turn time (15, 30, 45, 60, 90s)
  revealTime: number;     // Secret word reveal time (5, 10, 15, 20, 30s)
  votingTime: number;     // Voting time (10 to 120s)
  maxPlayers: number;     // 4 to 12
  imposterCount: number;  // 1 or 2
  categories: string[];    // e.g. ['Animals', 'Food'] — empty array means All
}

export interface GameResult {
  winnerRole: 'MAJORITY' | 'IMPOSTER';
  imposterWord: string | null;
  majorityWord: string;
  imposterNicknames: string[];
  majorityNicknames: string[];
  eliminatedPlayerNickname: string | null; // Who was voted out this round
  wasImposterVotedOut: boolean;
}

export interface ChatMessage {
  playerId: string;
  nickname: string;
  text: string;
  timestamp: number;
  roundNumber?: number;
}

export interface Room {
  code: string;           // 4-digit room code
  settings: RoomSettings;
  players: Player[];
  status: GameStatus;
  majorityWord: string;
  imposterWord: string | null;
  timer: number;          // Active countdown timer (in seconds)
  roundResults: GameResult | null;
  roundCount: number;
  chat: ChatMessage[];
  activePlayerId: string | null;
  turnOrder: string[];
  currentTurnIndex: number;
  turnTimer: number;
  imposterHint: string | null;
  votedPlayerId: string | null;
  usedWords: string[];
  hostPlayedWords?: Record<string, { words: string[]; lastPlayedTimestamp: number }>;
}
