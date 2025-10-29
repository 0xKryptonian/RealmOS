import { EloSystem, EloRating } from './elo-system';

export interface LeaderboardEntry {
  rank: number;
  accountId: string;
  username?: string;
  avatar?: string;
  rating: number;
  games: number;
  wins: number;
  losses: number;
  winRate: number;
  earnings: string;
  tier: string;
  tierColor: string;
  tierIcon: string;
  streak?: number;
  lastActive: Date;
}

export interface SeasonalLeaderboard {
  season: number;
  startDate: Date;
  endDate: Date;
  entries: LeaderboardEntry[];
  prizes: SeasonPrize[];
}

export interface SeasonPrize {
  rankStart: number;
  rankEnd: number;
  prize: string;
  currency: 'HBAR' | 'REALM';
  nft?: string;
}

export interface GameLeaderboard {
  gameId: string;
  gameName: string;
  entries: LeaderboardEntry[];
  totalPlayers: number;
  averageRating: number;
}

export class LeaderboardService {
  /**
   * Get global leaderboard
   */
  static async getGlobalLeaderboard(
    limit: number = 100,
    offset: number = 0
  ): Promise<LeaderboardEntry[]> {
    // TODO: Fetch from database, sorted by rating
    // TODO: Include HCS-verified scores
    return [];
  }

  /**
   * Get seasonal leaderboard
   */
  static async getSeasonalLeaderboard(season?: number): Promise<SeasonalLeaderboard> {
    // TODO: Fetch current or specified season
    const currentSeason = season || this.getCurrentSeason();
    
    return {
      season: currentSeason,
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-12-31'),
      entries: [],
      prizes: this.getSeasonPrizes(),
    };
  }

  /**
   * Get game-specific leaderboard
   */
  static async getGameLeaderboard(
    gameId: string,
    limit: number = 100
  ): Promise<GameLeaderboard> {
    // TODO: Fetch from database filtered by game
    return {
      gameId,
      gameName: 'Chess',
      entries: [],
      totalPlayers: 0,
      averageRating: 1500,
    };
  }

  /**
   * Get player rank
   */
  static async getPlayerRank(accountId: string): Promise<{
    globalRank: number;
    seasonalRank: number;
    percentile: number;
  }> {
    // TODO: Calculate player's rank
    return {
      globalRank: 0,
      seasonalRank: 0,
      percentile: 0,
    };
  }

  /**
   * Update player rating after match
   */
  static async updatePlayerRating(
    player1Id: string,
    player2Id: string,
    winner: 'player1' | 'player2' | 'draw',
    gameId: string
  ): Promise<void> {
    // TODO: Fetch current ratings
    const player1Rating = await this.getPlayerRating(player1Id, gameId);
    const player2Rating = await this.getPlayerRating(player2Id, gameId);

    // Calculate new ratings
    const updated = EloSystem.updateMatchRatings(
      player1Rating,
      player2Rating,
      winner
    );

    // TODO: Save to database
    // TODO: Record on HCS for transparency
    // TODO: Update seasonal leaderboard
  }

  /**
   * Get player rating
   */
  static async getPlayerRating(
    accountId: string,
    gameId?: string
  ): Promise<EloRating> {
    // TODO: Fetch from database
    // If not found, create initial rating
    return EloSystem.createInitialRating(accountId);
  }

  /**
   * Get top players by game
   */
  static async getTopPlayersByGame(
    gameId: string,
    limit: number = 10
  ): Promise<LeaderboardEntry[]> {
    // TODO: Fetch top players for specific game
    return [];
  }

  /**
   * Get player's rating history
   */
  static async getRatingHistory(
    accountId: string,
    gameId?: string,
    days: number = 30
  ): Promise<Array<{ date: Date; rating: number }>> {
    // TODO: Fetch rating history from database
    return [];
  }

  /**
   * Get current season number
   */
  private static getCurrentSeason(): number {
    const startDate = new Date('2025-01-01');
    const now = new Date();
    const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + 
                       (now.getMonth() - startDate.getMonth());
    return Math.floor(monthsDiff / 3) + 1; // Quarterly seasons
  }

  /**
   * Get season prize structure
   */
  private static getSeasonPrizes(): SeasonPrize[] {
    return [
      { rankStart: 1, rankEnd: 1, prize: '10000', currency: 'HBAR', nft: 'Legendary Champion NFT' },
      { rankStart: 2, rankEnd: 2, prize: '5000', currency: 'HBAR', nft: 'Epic Runner-up NFT' },
      { rankStart: 3, rankEnd: 3, prize: '2500', currency: 'HBAR', nft: 'Rare Third Place NFT' },
      { rankStart: 4, rankEnd: 10, prize: '1000', currency: 'HBAR' },
      { rankStart: 11, rankEnd: 50, prize: '500', currency: 'REALM' },
      { rankStart: 51, rankEnd: 100, prize: '250', currency: 'REALM' },
    ];
  }

  /**
   * Calculate win streak
   */
  static async getPlayerStreak(accountId: string): Promise<number> {
    // TODO: Fetch recent matches and calculate streak
    return 0;
  }

  /**
   * Get leaderboard changes (movers)
   */
  static async getLeaderboardMovers(
    period: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<Array<{
    accountId: string;
    username?: string;
    oldRank: number;
    newRank: number;
    change: number;
  }>> {
    // TODO: Compare current ranks with historical data
    return [];
  }

  /**
   * Record score on HCS for transparency
   */
  static async recordScoreOnHCS(
    accountId: string,
    gameId: string,
    score: number,
    metadata: any
  ): Promise<string> {
    // TODO: Submit to Hedera Consensus Service
    // TODO: Return transaction ID
    return '';
  }

  /**
   * Verify score from HCS
   */
  static async verifyScoreFromHCS(
    transactionId: string
  ): Promise<boolean> {
    // TODO: Query HCS and verify score
    return true;
  }

  /**
   * Get achievement progress
   */
  static async getAchievementProgress(
    accountId: string
  ): Promise<Array<{
    id: string;
    name: string;
    description: string;
    progress: number;
    target: number;
    unlocked: boolean;
  }>> {
    // TODO: Calculate achievement progress
    return [];
  }

  /**
   * Distribute seasonal rewards
   */
  static async distributeSeasonalRewards(season: number): Promise<void> {
    const leaderboard = await this.getSeasonalLeaderboard(season);
    
    // TODO: For each prize tier
    // TODO: Transfer tokens to winners
    // TODO: Mint NFT badges
    // TODO: Record on HCS
  }
}
