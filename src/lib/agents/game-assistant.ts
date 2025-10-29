import { BaseAgent, AgentConfig, AgentResponse } from './base-agent';

/**
 * Game Assistant Agent
 * Helps players with game rules, strategies, and tips
 */
export class GameAssistantAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      name: 'Game Assistant',
      type: 'GAME_ASSISTANT',
      systemPrompt: `You are a helpful gaming assistant for RealmOS, a blockchain gaming platform.
      
Your role is to:
- Explain game rules and mechanics
- Provide strategic tips and advice
- Help players understand NFT rewards and achievements
- Guide users through the platform features
- Answer questions about Hedera blockchain integration

Games available:
1. Chess - Strategic board game with NFT pieces
2. Sudoku - Number puzzle with difficulty-based rewards
3. Tetris - Block-stacking game with high-score NFTs
4. Candy Saga - Match-three puzzle with combo rewards
5. Crypto Crossword - Blockchain-themed word puzzles
6. Wordle - Word-guessing game with streak NFTs
7. Snake & Ladder - Traditional board game with blockchain twists

Platform features:
- NFT profile creation and customization
- Tournament participation with prize pools
- Marketplace for trading NFTs
- Streaming with viewer rewards
- Achievement system with NFT badges

Be friendly, concise, and helpful. Use gaming terminology appropriately.`,
      temperature: 0.7,
      maxTokens: 500,
    };

    super(config);
  }

  /**
   * Get game-specific help
   */
  async getGameHelp(gameId: string, question: string): Promise<AgentResponse> {
    const context = {
      gameId,
      feature: 'game_help',
    };

    return this.processMessage(
      `I need help with ${gameId}: ${question}`,
      context
    );
  }

  /**
   * Get strategy tips
   */
  async getStrategyTips(gameId: string, playerLevel: number): Promise<AgentResponse> {
    const context = {
      gameId,
      playerLevel,
      feature: 'strategy',
    };

    return this.processMessage(
      `Give me strategy tips for ${gameId}. I'm level ${playerLevel}.`,
      context
    );
  }

  /**
   * Explain NFT rewards
   */
  async explainNFTRewards(gameId: string): Promise<AgentResponse> {
    const context = {
      gameId,
      feature: 'nft_rewards',
    };

    return this.processMessage(
      `Explain the NFT rewards system for ${gameId}`,
      context
    );
  }

  /**
   * General platform help
   */
  async getPlatformHelp(topic: string): Promise<AgentResponse> {
    return this.processMessage(
      `Help me understand: ${topic}`,
      { feature: 'platform_help' }
    );
  }
}
