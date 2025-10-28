export interface Guild {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  bannerUrl?: string;
  
  // Members
  founderId: string;
  members: GuildMember[];
  maxMembers: number;
  
  // Treasury
  treasuryBalance: string;
  treasuryCurrency: 'HBAR' | 'REALM';
  
  // Settings
  isPublic: boolean;
  requiresApproval: boolean;
  
  // Stats
  totalTournaments: number;
  totalWins: number;
  ranking?: number;
  
  // Features
  hasChat: boolean;
  hasTournaments: boolean;
  hasEvents: boolean;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface GuildMember {
  accountId: string;
  username?: string;
  role: 'FOUNDER' | 'ADMIN' | 'MEMBER';
  joinedAt: Date;
  contribution: number;
  isActive: boolean;
}

export interface GuildTournament {
  id: string;
  guildId: string;
  tournamentId: string;
  isGuildOnly: boolean;
  prizeFromTreasury: boolean;
  createdAt: Date;
}

export interface GuildEvent {
  id: string;
  guildId: string;
  title: string;
  description: string;
  type: 'TOURNAMENT' | 'SOCIAL' | 'TRAINING' | 'MEETING';
  startTime: Date;
  endTime: Date;
  attendees: string[];
  maxAttendees?: number;
  streamUrl?: string;
  createdAt: Date;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: Date;
  respondedAt?: Date;
}

export interface Friendship {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
  lastInteraction?: Date;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface GuildMessage {
  id: string;
  guildId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'ANNOUNCEMENT' | 'SYSTEM';
  createdAt: Date;
}

export interface CoopChallenge {
  id: string;
  title: string;
  description: string;
  game: string;
  participants: string[];
  maxParticipants: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  rewards: {
    amount: string;
    currency: 'HBAR' | 'REALM';
    nft?: string;
  };
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  startTime: Date;
  endTime: Date;
  progress: number;
  createdAt: Date;
}

export interface PlayerProfile {
  accountId: string;
  username?: string;
  avatar?: string;
  bio?: string;
  
  // Stats
  level: number;
  experience: number;
  totalGamesPlayed: number;
  totalWins: number;
  winRate: number;
  
  // Rankings
  globalRank?: number;
  eloRating: number;
  seasonalRank?: number;
  
  // Social
  friends: string[];
  guilds: string[];
  
  // Achievements
  achievements: Achievement[];
  nfts: string[];
  
  // Preferences
  favoriteGames: string[];
  isOnline: boolean;
  lastSeen: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  unlockedAt: Date;
  nftId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'FRIEND_REQUEST' | 'GUILD_INVITE' | 'TOURNAMENT_START' | 'MATCH_READY' | 'PRIZE_WON' | 'MESSAGE';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}
