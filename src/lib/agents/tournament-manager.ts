import { BaseAgent, AgentConfig, AgentResponse } from './base-agent';
import { HederaTokenService } from '@/lib/hedera/token';
import { TokenId, AccountId } from '@hashgraph/sdk';

export interface TournamentConfig {
  name: string;
  gameId: string;
  maxPlayers: number;
  entryFee?: number;
  prizePool: number;
  startTime: Date;
  endTime: Date;
}

export interface TournamentResult {
  position: number;
  playerId: string;
  score: number;
  prize?: number;
}

/**
 * Tournament Manager Agent
 * Automates tournament creation, management, and prize distribution
 */
export class TournamentManagerAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      name: 'Tournament Manager',
      type: 'TOURNAMENT_MANAGER',
      systemPrompt: `You are an automated tournament manager for RealmOS.
      
Your responsibilities:
- Generate fair tournament brackets
- Schedule matches automatically
- Verify game results
- Calculate prize distributions
- Handle edge cases (ties, disputes, no-shows)

You have access to Hedera blockchain for:
- Distributing HBAR and REALM token prizes
- Minting tournament NFT badges
- Recording results on HCS (Hedera Consensus Service)

Be precise, fair, and transparent in all tournament operations.`,
      temperature: 0.3, // Lower temperature for more consistent decisions
      maxTokens: 800,
    };

    super(config);
  }

  /**
   * Generate tournament bracket
   */
  async generateBracket(players: string[], tournamentType: 'SINGLE_ELIMINATION' | 'ROUND_ROBIN'): Promise<any> {
    const message = `Generate a ${tournamentType} bracket for ${players.length} players: ${players.join(', ')}`;
    
    const response = await this.processMessage(message, {
      players,
      tournamentType,
      action: 'generate_bracket',
    });

    // Parse bracket structure from response
    return {
      bracket: this.parseBracketFromResponse(response.message),
      message: response.message,
    };
  }

  /**
   * Calculate prize distribution
   */
  async calculatePrizeDistribution(
    prizePool: number,
    numWinners: number,
    distribution: 'STANDARD' | 'TOP_HEAVY' | 'EQUAL'
  ): Promise<number[]> {
    const distributions: Record<string, number[]> = {
      STANDARD: [0.5, 0.3, 0.15, 0.05], // 1st: 50%, 2nd: 30%, 3rd: 15%, 4th: 5%
      TOP_HEAVY: [0.7, 0.2, 0.1], // 1st: 70%, 2nd: 20%, 3rd: 10%
      EQUAL: Array(numWinners).fill(1 / numWinners), // Equal distribution
    };

    const percentages = distributions[distribution] || distributions.STANDARD;
    return percentages.slice(0, numWinners).map(p => prizePool * p);
  }

  /**
   * Distribute prizes to winners
   */
  async distributePrizes(
    results: TournamentResult[],
    tokenId: TokenId,
    tournamentId: string
  ): Promise<string[]> {
    const txIds: string[] = [];

    for (const result of results) {
      if (result.prize && result.prize > 0) {
        try {
          const recipientId = AccountId.fromString(result.playerId);
          
          // Transfer prize tokens
          const operatorAccountId = process.env.HEDERA_ACCOUNT_ID;
          if (!operatorAccountId) {
            throw new Error('HEDERA_ACCOUNT_ID not configured');
          }

          const txId = await HederaTokenService.transferToken({
            tokenId,
            fromAccountId: AccountId.fromString(operatorAccountId),
            toAccountId: recipientId,
            amount: result.prize,
          });

          txIds.push(txId);
          
          console.log(`✅ Distributed ${result.prize} tokens to position ${result.position}: ${result.playerId}`);
        } catch (error) {
          console.error(`❌ Failed to distribute prize to ${result.playerId}:`, error);
        }
      }
    }

    return txIds;
  }

  /**
   * Verify tournament results
   */
  async verifyResults(results: TournamentResult[]): Promise<{ valid: boolean; issues: string[] }> {
    const message = `Verify these tournament results for fairness and correctness: ${JSON.stringify(results)}`;
    
    const response = await this.processMessage(message, {
      results,
      action: 'verify_results',
    });

    return {
      valid: !response.message.toLowerCase().includes('invalid'),
      issues: this.extractIssuesFromResponse(response.message),
    };
  }

  /**
   * Handle tournament dispute
   */
  async handleDispute(
    disputeDescription: string,
    evidence: any
  ): Promise<AgentResponse> {
    const message = `Analyze this tournament dispute and recommend a resolution: ${disputeDescription}`;
    
    return this.processMessage(message, {
      evidence,
      action: 'handle_dispute',
    });
  }

  /**
   * Parse bracket structure from AI response
   */
  private parseBracketFromResponse(response: string): any {
    // Simple bracket parsing - in production, use more robust parsing
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse bracket:', error);
    }
    
    return { rounds: [], matches: [] };
  }

  /**
   * Extract issues from verification response
   */
  private extractIssuesFromResponse(response: string): string[] {
    const issues: string[] = [];
    const lines = response.split('\n');
    
    for (const line of lines) {
      if (line.includes('issue') || line.includes('problem') || line.includes('error')) {
        issues.push(line.trim());
      }
    }
    
    return issues;
  }
}
