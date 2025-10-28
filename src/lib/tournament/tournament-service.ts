import { Tournament, TournamentParticipant, TournamentBracket, Match, TournamentFormat } from './types';
import { BracketGenerator } from './bracket-generator';
import { HederaTokenService } from '@/lib/hedera/token';
import { AccountId, TokenId } from '@hashgraph/sdk';

export class TournamentService {
  /**
   * Create a new tournament
   */
  static async createTournament(data: Partial<Tournament>): Promise<Tournament> {
    const tournament: Tournament = {
      id: `tournament-${Date.now()}`,
      title: data.title || 'Untitled Tournament',
      description: data.description || '',
      game: data.game || '',
      format: data.format || 'SINGLE_ELIMINATION',
      status: 'DRAFT',
      
      registrationStart: data.registrationStart || new Date(),
      registrationEnd: data.registrationEnd || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      startDate: data.startDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: data.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      
      participants: [],
      maxParticipants: data.maxParticipants || 32,
      minParticipants: data.minParticipants || 4,
      
      prizePool: data.prizePool || '0',
      currency: data.currency || 'HBAR',
      prizeDistribution: data.prizeDistribution || [],
      
      entryFee: data.entryFee,
      entryFeeCurrency: data.entryFeeCurrency,
      
      isStreamed: data.isStreamed || false,
      streamUrl: data.streamUrl,
      hasSpectatorMode: data.hasSpectatorMode || true,
      allowsReplays: data.allowsReplays || true,
      
      organizerId: data.organizerId || '',
      guildId: data.guildId,
      
      createdAt: new Date(),
      updatedAt: new Date(),
      rules: data.rules,
      tags: data.tags,
    };
    
    // TODO: Save to database
    return tournament;
  }

  /**
   * Register player for tournament
   */
  static async registerPlayer(
    tournamentId: string,
    accountId: string,
    username?: string
  ): Promise<TournamentParticipant> {
    // TODO: Validate tournament exists and is in registration phase
    // TODO: Check if player already registered
    // TODO: Process entry fee if required
    
    const participant: TournamentParticipant = {
      accountId,
      username,
      registeredAt: new Date(),
      isEliminated: false,
    };
    
    // TODO: Save to database
    return participant;
  }

  /**
   * Start tournament and generate bracket
   */
  static async startTournament(tournamentId: string): Promise<TournamentBracket> {
    // TODO: Fetch tournament from database
    // TODO: Validate minimum participants
    // TODO: Update tournament status to ACTIVE
    
    const tournament = await this.getTournament(tournamentId);
    
    const players = tournament.participants.map(p => ({
      accountId: p.accountId,
      username: p.username,
      seed: p.seed,
      eloRating: 1500, // TODO: Fetch from leaderboard
    }));
    
    const bracket = BracketGenerator.generateBracket(
      tournamentId,
      tournament.format,
      players
    );
    
    // TODO: Save bracket to database
    return bracket;
  }

  /**
   * Submit match result
   */
  static async submitMatchResult(
    matchId: string,
    winnerId: string,
    score: { player1Score: number; player2Score: number }
  ): Promise<Match> {
    // TODO: Fetch match from database
    // TODO: Validate match is active
    // TODO: Validate winner is a participant
    
    const match: Match = {
      id: matchId,
      roundNumber: 1,
      player1: { accountId: 'player1' },
      player2: { accountId: 'player2' },
      winner: winnerId,
      score,
      status: 'COMPLETED',
    };
    
    // TODO: Update bracket with winner
    // TODO: Record result on HCS
    // TODO: Save to database
    
    return match;
  }

  /**
   * Distribute prizes to winners
   */
  static async distributePrizes(tournamentId: string): Promise<string[]> {
    const tournament = await this.getTournament(tournamentId);
    const txIds: string[] = [];
    
    for (const prize of tournament.prizeDistribution) {
      if (prize.winnerId && !prize.claimed) {
        try {
          const tokenId = tournament.currency === 'HBAR' 
            ? TokenId.fromString('0.0.0') // Native HBAR
            : TokenId.fromString(process.env.NEXT_PUBLIC_REALM_TOKEN_ID || '');
          
          const operatorAccountId = process.env.HEDERA_ACCOUNT_ID;
          if (!operatorAccountId) {
            throw new Error('HEDERA_ACCOUNT_ID not configured');
          }
          
          const txId = await HederaTokenService.transferToken({
            tokenId,
            fromAccountId: AccountId.fromString(operatorAccountId),
            toAccountId: AccountId.fromString(prize.winnerId),
            amount: parseFloat(prize.amount),
          });
          
          txIds.push(txId);
          prize.claimed = true;
          
          console.log(`✅ Distributed ${prize.amount} ${tournament.currency} to position ${prize.position}`);
        } catch (error) {
          console.error(`❌ Failed to distribute prize to position ${prize.position}:`, error);
        }
      }
    }
    
    // TODO: Update tournament in database
    return txIds;
  }

  /**
   * Get tournament by ID
   */
  static async getTournament(tournamentId: string): Promise<Tournament> {
    // TODO: Fetch from database
    throw new Error('Not implemented');
  }

  /**
   * Get tournament bracket
   */
  static async getBracket(tournamentId: string): Promise<TournamentBracket> {
    // TODO: Fetch from database
    throw new Error('Not implemented');
  }

  /**
   * Get active matches for a tournament
   */
  static async getActiveMatches(tournamentId: string): Promise<Match[]> {
    const bracket = await this.getBracket(tournamentId);
    const activeMatches: Match[] = [];
    
    for (const round of bracket.rounds) {
      for (const match of round.matches) {
        if (match.status === 'ACTIVE') {
          activeMatches.push(match);
        }
      }
    }
    
    return activeMatches;
  }

  /**
   * Enable spectator mode for a match
   */
  static async enableSpectatorMode(matchId: string, streamUrl: string): Promise<void> {
    // TODO: Update match with stream URL
    // TODO: Notify spectators
  }

  /**
   * Record spectator session (for watch-to-earn)
   */
  static async recordSpectatorSession(
    matchId: string,
    viewerId: string,
    duration: number
  ): Promise<void> {
    // TODO: Calculate rewards based on watch time
    // TODO: Record on HCS
    // TODO: Distribute rewards
  }

  /**
   * Save match replay
   */
  static async saveReplay(
    matchId: string,
    replayUrl: string,
    duration: number
  ): Promise<void> {
    // TODO: Save replay metadata
    // TODO: Generate highlights using AI
  }
}
