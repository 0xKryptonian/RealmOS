/**
 * ELO Rating System for HederaVerse
 * Based on standard chess ELO with adjustments for gaming
 */

export interface EloRating {
  accountId: string;
  rating: number;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  peak: number;
  lastUpdated: Date;
}

export interface EloChange {
  oldRating: number;
  newRating: number;
  change: number;
  expectedScore: number;
  actualScore: number;
}

export class EloSystem {
  // K-factor determines how much ratings change per game
  private static readonly K_FACTOR_NEW = 40; // For players with < 30 games
  private static readonly K_FACTOR_REGULAR = 20; // For regular players
  private static readonly K_FACTOR_MASTER = 10; // For players rated > 2400
  
  private static readonly INITIAL_RATING = 1500;
  private static readonly MASTER_THRESHOLD = 2400;
  private static readonly NEW_PLAYER_GAMES = 30;

  /**
   * Calculate new ELO rating after a match
   */
  static calculateNewRating(
    playerRating: number,
    opponentRating: number,
    actualScore: number, // 1 for win, 0.5 for draw, 0 for loss
    playerGames: number = 100
  ): EloChange {
    const kFactor = this.getKFactor(playerRating, playerGames);
    const expectedScore = this.getExpectedScore(playerRating, opponentRating);
    const ratingChange = kFactor * (actualScore - expectedScore);
    const newRating = Math.round(playerRating + ratingChange);

    return {
      oldRating: playerRating,
      newRating,
      change: Math.round(ratingChange),
      expectedScore,
      actualScore,
    };
  }

  /**
   * Calculate expected score (probability of winning)
   */
  static getExpectedScore(playerRating: number, opponentRating: number): number {
    return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  }

  /**
   * Get K-factor based on rating and experience
   */
  private static getKFactor(rating: number, games: number): number {
    if (games < this.NEW_PLAYER_GAMES) {
      return this.K_FACTOR_NEW;
    }
    if (rating >= this.MASTER_THRESHOLD) {
      return this.K_FACTOR_MASTER;
    }
    return this.K_FACTOR_REGULAR;
  }

  /**
   * Update ratings for both players after a match
   */
  static updateMatchRatings(
    player1: EloRating,
    player2: EloRating,
    winner: 'player1' | 'player2' | 'draw'
  ): { player1: EloRating; player2: EloRating } {
    const player1Score = winner === 'player1' ? 1 : winner === 'draw' ? 0.5 : 0;
    const player2Score = winner === 'player2' ? 1 : winner === 'draw' ? 0.5 : 0;

    const player1Change = this.calculateNewRating(
      player1.rating,
      player2.rating,
      player1Score,
      player1.games
    );

    const player2Change = this.calculateNewRating(
      player2.rating,
      player1.rating,
      player2Score,
      player2.games
    );

    return {
      player1: {
        ...player1,
        rating: player1Change.newRating,
        games: player1.games + 1,
        wins: player1.wins + (winner === 'player1' ? 1 : 0),
        losses: player1.losses + (winner === 'player2' ? 1 : 0),
        draws: player1.draws + (winner === 'draw' ? 1 : 0),
        peak: Math.max(player1.peak, player1Change.newRating),
        lastUpdated: new Date(),
      },
      player2: {
        ...player2,
        rating: player2Change.newRating,
        games: player2.games + 1,
        wins: player2.wins + (winner === 'player2' ? 1 : 0),
        losses: player2.losses + (winner === 'player1' ? 1 : 0),
        draws: player2.draws + (winner === 'draw' ? 1 : 0),
        peak: Math.max(player2.peak, player2Change.newRating),
        lastUpdated: new Date(),
      },
    };
  }

  /**
   * Get rating tier/rank name
   */
  static getRatingTier(rating: number): {
    tier: string;
    color: string;
    icon: string;
  } {
    if (rating >= 2800) return { tier: 'Legendary', color: '#FFD700', icon: '👑' };
    if (rating >= 2600) return { tier: 'Grandmaster', color: '#E5E4E2', icon: '💎' };
    if (rating >= 2400) return { tier: 'Master', color: '#CD7F32', icon: '🏆' };
    if (rating >= 2200) return { tier: 'Expert', color: '#9370DB', icon: '⭐' };
    if (rating >= 2000) return { tier: 'Advanced', color: '#4169E1', icon: '🔷' };
    if (rating >= 1800) return { tier: 'Intermediate', color: '#32CD32', icon: '🟢' };
    if (rating >= 1600) return { tier: 'Competent', color: '#FFD700', icon: '🟡' };
    if (rating >= 1400) return { tier: 'Novice', color: '#FFA500', icon: '🟠' };
    return { tier: 'Beginner', color: '#808080', icon: '⚪' };
  }

  /**
   * Create initial rating for new player
   */
  static createInitialRating(accountId: string): EloRating {
    return {
      accountId,
      rating: this.INITIAL_RATING,
      games: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      peak: this.INITIAL_RATING,
      lastUpdated: new Date(),
    };
  }

  /**
   * Calculate rating change for tournament placement
   */
  static calculateTournamentRating(
    playerRating: number,
    placement: number,
    totalPlayers: number,
    averageOpponentRating: number
  ): EloChange {
    // Convert placement to score (1st = 1.0, last = 0.0)
    const placementScore = 1 - (placement - 1) / (totalPlayers - 1);
    
    return this.calculateNewRating(
      playerRating,
      averageOpponentRating,
      placementScore,
      100 // Assume experienced player for tournaments
    );
  }

  /**
   * Calculate performance rating for a tournament
   */
  static calculatePerformanceRating(
    results: Array<{ opponentRating: number; result: number }>,
    playerRating: number
  ): number {
    if (results.length === 0) return playerRating;

    const totalScore = results.reduce((sum, r) => sum + r.result, 0);
    const scorePercentage = totalScore / results.length;
    
    const avgOpponentRating = 
      results.reduce((sum, r) => sum + r.opponentRating, 0) / results.length;

    // Performance rating formula
    const performanceRating = avgOpponentRating + 400 * Math.log10(scorePercentage / (1 - scorePercentage));
    
    return Math.round(performanceRating);
  }
}
