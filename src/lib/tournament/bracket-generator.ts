import { TournamentFormat, TournamentBracket, Round, Match, Player } from './types';

export class BracketGenerator {
  /**
   * Generate tournament bracket based on format
   */
  static generateBracket(
    tournamentId: string,
    format: TournamentFormat,
    players: Player[]
  ): TournamentBracket {
    switch (format) {
      case 'SINGLE_ELIMINATION':
        return this.generateSingleElimination(tournamentId, players);
      case 'DOUBLE_ELIMINATION':
        return this.generateDoubleElimination(tournamentId, players);
      case 'ROUND_ROBIN':
        return this.generateRoundRobin(tournamentId, players);
      case 'SWISS':
        return this.generateSwiss(tournamentId, players);
      case 'BATTLE_ROYALE':
        return this.generateBattleRoyale(tournamentId, players);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Single Elimination Bracket
   */
  private static generateSingleElimination(
    tournamentId: string,
    players: Player[]
  ): TournamentBracket {
    const seededPlayers = this.seedPlayers(players);
    const rounds: Round[] = [];
    
    // Calculate number of rounds needed
    const numRounds = Math.ceil(Math.log2(seededPlayers.length));
    
    // First round
    const firstRoundMatches: Match[] = [];
    for (let i = 0; i < seededPlayers.length; i += 2) {
      if (i + 1 < seededPlayers.length) {
        firstRoundMatches.push({
          id: `${tournamentId}-r1-m${i / 2}`,
          roundNumber: 1,
          player1: seededPlayers[i],
          player2: seededPlayers[i + 1],
          status: 'PENDING',
        });
      }
    }
    
    rounds.push({
      roundNumber: 1,
      matches: firstRoundMatches,
      status: 'PENDING',
    });
    
    // Generate subsequent rounds
    for (let r = 2; r <= numRounds; r++) {
      const numMatches = Math.pow(2, numRounds - r);
      const roundMatches: Match[] = [];
      
      for (let m = 0; m < numMatches; m++) {
        roundMatches.push({
          id: `${tournamentId}-r${r}-m${m}`,
          roundNumber: r,
          player1: { accountId: 'TBD' },
          player2: { accountId: 'TBD' },
          status: 'PENDING',
        });
      }
      
      rounds.push({
        roundNumber: r,
        matches: roundMatches,
        status: 'PENDING',
      });
    }
    
    return {
      id: `${tournamentId}-bracket`,
      tournamentId,
      format: 'SINGLE_ELIMINATION',
      rounds,
      currentRound: 1,
    };
  }

  /**
   * Double Elimination Bracket
   */
  private static generateDoubleElimination(
    tournamentId: string,
    players: Player[]
  ): TournamentBracket {
    // Similar to single elimination but with winners and losers brackets
    const seededPlayers = this.seedPlayers(players);
    const rounds: Round[] = [];
    
    // Winners bracket
    const winnersBracket = this.generateSingleElimination(tournamentId + '-winners', seededPlayers);
    
    // Losers bracket (half the size)
    const losersBracket = this.generateSingleElimination(
      tournamentId + '-losers',
      seededPlayers.slice(0, Math.floor(seededPlayers.length / 2))
    );
    
    // Combine brackets
    rounds.push(...winnersBracket.rounds);
    rounds.push(...losersBracket.rounds);
    
    // Grand finals
    rounds.push({
      roundNumber: rounds.length + 1,
      matches: [{
        id: `${tournamentId}-grand-final`,
        roundNumber: rounds.length + 1,
        player1: { accountId: 'TBD' },
        player2: { accountId: 'TBD' },
        status: 'PENDING',
      }],
      status: 'PENDING',
    });
    
    return {
      id: `${tournamentId}-bracket`,
      tournamentId,
      format: 'DOUBLE_ELIMINATION',
      rounds,
      currentRound: 1,
    };
  }

  /**
   * Round Robin Bracket
   */
  private static generateRoundRobin(
    tournamentId: string,
    players: Player[]
  ): TournamentBracket {
    const rounds: Round[] = [];
    const n = players.length;
    const numRounds = n % 2 === 0 ? n - 1 : n;
    
    for (let round = 0; round < numRounds; round++) {
      const matches: Match[] = [];
      
      for (let i = 0; i < Math.floor(n / 2); i++) {
        const player1Index = (round + i) % n;
        const player2Index = (n - 1 - i + round) % n;
        
        if (player1Index !== player2Index) {
          matches.push({
            id: `${tournamentId}-r${round + 1}-m${i}`,
            roundNumber: round + 1,
            player1: players[player1Index],
            player2: players[player2Index],
            status: 'PENDING',
          });
        }
      }
      
      rounds.push({
        roundNumber: round + 1,
        matches,
        status: 'PENDING',
      });
    }
    
    return {
      id: `${tournamentId}-bracket`,
      tournamentId,
      format: 'ROUND_ROBIN',
      rounds,
      currentRound: 1,
    };
  }

  /**
   * Swiss System Bracket
   */
  private static generateSwiss(
    tournamentId: string,
    players: Player[]
  ): TournamentBracket {
    const rounds: Round[] = [];
    const numRounds = Math.ceil(Math.log2(players.length));
    
    // First round: pair by seeding
    const seededPlayers = this.seedPlayers(players);
    const firstRoundMatches: Match[] = [];
    
    for (let i = 0; i < seededPlayers.length; i += 2) {
      if (i + 1 < seededPlayers.length) {
        firstRoundMatches.push({
          id: `${tournamentId}-r1-m${i / 2}`,
          roundNumber: 1,
          player1: seededPlayers[i],
          player2: seededPlayers[i + 1],
          status: 'PENDING',
        });
      }
    }
    
    rounds.push({
      roundNumber: 1,
      matches: firstRoundMatches,
      status: 'PENDING',
    });
    
    // Subsequent rounds: pair by score (to be determined dynamically)
    for (let r = 2; r <= numRounds; r++) {
      rounds.push({
        roundNumber: r,
        matches: [],
        status: 'PENDING',
      });
    }
    
    return {
      id: `${tournamentId}-bracket`,
      tournamentId,
      format: 'SWISS',
      rounds,
      currentRound: 1,
    };
  }

  /**
   * Battle Royale Bracket
   */
  private static generateBattleRoyale(
    tournamentId: string,
    players: Player[]
  ): TournamentBracket {
    const rounds: Round[] = [];
    
    // Single round with all players
    rounds.push({
      roundNumber: 1,
      matches: [{
        id: `${tournamentId}-battle-royale`,
        roundNumber: 1,
        player1: { accountId: 'ALL_PLAYERS' },
        player2: { accountId: 'ALL_PLAYERS' },
        status: 'PENDING',
      }],
      status: 'PENDING',
    });
    
    return {
      id: `${tournamentId}-bracket`,
      tournamentId,
      format: 'BATTLE_ROYALE',
      rounds,
      currentRound: 1,
    };
  }

  /**
   * Seed players based on ELO or random
   */
  private static seedPlayers(players: Player[]): Player[] {
    const seeded = [...players];
    
    // Sort by ELO if available, otherwise random
    if (players.some(p => p.eloRating)) {
      seeded.sort((a, b) => (b.eloRating || 0) - (a.eloRating || 0));
    } else {
      // Fisher-Yates shuffle
      for (let i = seeded.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [seeded[i], seeded[j]] = [seeded[j], seeded[i]];
      }
    }
    
    // Assign seeds
    seeded.forEach((player, index) => {
      player.seed = index + 1;
    });
    
    return seeded;
  }

  /**
   * Advance winner to next round
   */
  static advanceWinner(
    bracket: TournamentBracket,
    matchId: string,
    winnerId: string
  ): TournamentBracket {
    const updatedBracket = { ...bracket };
    
    // Find the match
    for (const round of updatedBracket.rounds) {
      const match = round.matches.find(m => m.id === matchId);
      if (match) {
        match.winner = winnerId;
        match.status = 'COMPLETED';
        
        // Find next match and advance winner
        if (round.roundNumber < updatedBracket.rounds.length) {
          const nextRound = updatedBracket.rounds[round.roundNumber];
          const matchIndex = round.matches.indexOf(match);
          const nextMatchIndex = Math.floor(matchIndex / 2);
          const nextMatch = nextRound.matches[nextMatchIndex];
          
          if (nextMatch) {
            const winner = match.player1.accountId === winnerId ? match.player1 : match.player2;
            if (matchIndex % 2 === 0) {
              nextMatch.player1 = winner;
            } else {
              nextMatch.player2 = winner;
            }
          }
        }
        
        break;
      }
    }
    
    return updatedBracket;
  }
}
