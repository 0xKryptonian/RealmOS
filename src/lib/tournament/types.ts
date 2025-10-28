export type TournamentFormat = 
  | 'SINGLE_ELIMINATION' 
  | 'DOUBLE_ELIMINATION' 
  | 'ROUND_ROBIN' 
  | 'SWISS' 
  | 'BATTLE_ROYALE';

export type TournamentStatus = 
  | 'DRAFT' 
  | 'REGISTRATION' 
  | 'UPCOMING' 
  | 'ACTIVE' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface TournamentBracket {
  id: string;
  tournamentId: string;
  format: TournamentFormat;
  rounds: Round[];
  currentRound: number;
}

export interface Round {
  roundNumber: number;
  matches: Match[];
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
}

export interface Match {
  id: string;
  roundNumber: number;
  player1: Player;
  player2: Player;
  winner?: string;
  score?: MatchScore;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
  scheduledTime?: Date;
  streamUrl?: string;
  replayUrl?: string;
}

export interface Player {
  accountId: string;
  username?: string;
  avatar?: string;
  seed?: number;
  eloRating?: number;
}

export interface MatchScore {
  player1Score: number;
  player2Score: number;
  details?: string;
}

export interface Tournament {
  id: string;
  title: string;
  description: string;
  game: string;
  format: TournamentFormat;
  status: TournamentStatus;
  
  // Timing
  registrationStart: Date;
  registrationEnd: Date;
  startDate: Date;
  endDate: Date;
  
  // Participants
  participants: TournamentParticipant[];
  maxParticipants: number;
  minParticipants: number;
  
  // Prizes
  prizePool: string;
  currency: 'HBAR' | 'REALM';
  prizeDistribution: PrizeDistribution[];
  
  // Entry
  entryFee?: string;
  entryFeeCurrency?: 'HBAR' | 'REALM';
  
  // Features
  isStreamed: boolean;
  streamUrl?: string;
  hasSpectatorMode: boolean;
  allowsReplays: boolean;
  
  // Organizer
  organizerId: string;
  guildId?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  rules?: string;
  tags?: string[];
}

export interface TournamentParticipant {
  accountId: string;
  username?: string;
  registeredAt: Date;
  seed?: number;
  currentRound?: number;
  isEliminated: boolean;
  placement?: number;
  prizeClaimed?: boolean;
}

export interface PrizeDistribution {
  position: number;
  amount: string;
  nft?: string;
  claimed: boolean;
  winnerId?: string;
}

export interface TournamentStats {
  totalMatches: number;
  completedMatches: number;
  averageMatchDuration: number;
  totalViewers: number;
  peakViewers: number;
}

export interface SpectatorSession {
  matchId: string;
  viewerId: string;
  joinedAt: Date;
  rewards?: string;
}

export interface TournamentReplay {
  matchId: string;
  tournamentId: string;
  url: string;
  duration: number;
  views: number;
  highlights?: HighlightClip[];
}

export interface HighlightClip {
  timestamp: number;
  duration: number;
  description: string;
  url: string;
}
