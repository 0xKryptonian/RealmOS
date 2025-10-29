/**
 * AI Agents for RealmOS
 * Exports all agent classes and utilities
 */

export * from './base-agent';
export * from './game-assistant';
export * from './tournament-manager';
export * from './reward-distributor';

import { GameAssistantAgent } from './game-assistant';
import { TournamentManagerAgent } from './tournament-manager';
import { RewardDistributorAgent } from './reward-distributor';

/**
 * Agent factory for creating and managing agents
 */
export class AgentFactory {
  private static gameAssistant: GameAssistantAgent | null = null;
  private static tournamentManager: TournamentManagerAgent | null = null;
  private static rewardDistributor: RewardDistributorAgent | null = null;

  /**
   * Get Game Assistant agent (singleton)
   */
  static getGameAssistant(): GameAssistantAgent {
    if (!this.gameAssistant) {
      this.gameAssistant = new GameAssistantAgent();
    }
    return this.gameAssistant;
  }

  /**
   * Get Tournament Manager agent (singleton)
   */
  static getTournamentManager(): TournamentManagerAgent {
    if (!this.tournamentManager) {
      this.tournamentManager = new TournamentManagerAgent();
    }
    return this.tournamentManager;
  }

  /**
   * Get Reward Distributor agent (singleton)
   */
  static getRewardDistributor(realmTokenId?: string, supplyKey?: string): RewardDistributorAgent {
    if (!this.rewardDistributor) {
      this.rewardDistributor = new RewardDistributorAgent(realmTokenId, supplyKey);
    }
    return this.rewardDistributor;
  }

  /**
   * Reset all agents (for testing)
   */
  static reset(): void {
    this.gameAssistant = null;
    this.tournamentManager = null;
    this.rewardDistributor = null;
  }
}
