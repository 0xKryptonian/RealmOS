import { BaseAgent, AgentConfig, AgentResponse } from './base-agent';
import { HederaTokenService } from '@/lib/hedera/token';
import { HederaNFTService } from '@/lib/hedera/nft';
import { TokenId, AccountId, PrivateKey } from '@hashgraph/sdk';

export interface RewardConfig {
  type: 'DAILY_LOGIN' | 'HIGH_SCORE' | 'STREAK' | 'ACHIEVEMENT' | 'REFERRAL';
  amount: number;
  tokenId?: string;
}

export interface RewardClaim {
  userId: string;
  accountId: string;
  rewardType: string;
  amount: number;
  metadata?: any;
}

/**
 * Reward Distributor Agent
 * Automates reward distribution for various player activities
 */
export class RewardDistributorAgent extends BaseAgent {
  private realmTokenId: TokenId | null = null;
  private supplyKey: PrivateKey | null = null;

  constructor(realmTokenId?: string, supplyKey?: string) {
    const config: AgentConfig = {
      name: 'Reward Distributor',
      type: 'REWARD_DISTRIBUTOR',
      systemPrompt: `You are an automated reward distribution system for RealmOS.

Your responsibilities:
- Calculate fair rewards based on player activities
- Prevent reward abuse and exploitation
- Track daily/weekly/monthly reward limits
- Determine achievement eligibility
- Suggest bonus rewards for exceptional performance

Reward types:
- Daily login: 10 REALM tokens
- High score: 50-500 REALM (based on difficulty)
- Win streak: 25 REALM per consecutive win
- Achievement unlock: NFT badge + 100 REALM
- Referral: 200 REALM per successful referral

Be fair, consistent, and prevent gaming the system.`,
      temperature: 0.2, // Very low temperature for consistent reward calculations
      maxTokens: 600,
    };

    super(config);

    if (realmTokenId) {
      this.realmTokenId = TokenId.fromString(realmTokenId);
    }
    if (supplyKey) {
      this.supplyKey = PrivateKey.fromString(supplyKey);
    }
  }

  /**
   * Calculate reward amount based on activity
   */
  async calculateReward(
    activityType: string,
    activityData: any
  ): Promise<{ amount: number; reasoning: string }> {
    const message = `Calculate appropriate reward for: ${activityType}. Data: ${JSON.stringify(activityData)}`;
    
    const response = await this.processMessage(message, {
      activityType,
      activityData,
      action: 'calculate_reward',
    });

    return {
      amount: this.extractAmountFromResponse(response.message),
      reasoning: response.message,
    };
  }

  /**
   * Distribute REALM tokens to player
   */
  async distributeTokenReward(
    accountId: string,
    amount: number,
    reason: string
  ): Promise<string> {
    if (!this.realmTokenId) {
      throw new Error('REALM token ID not configured');
    }

    const recipientId = AccountId.fromString(accountId);

    const operatorAccountId = process.env.HEDERA_ACCOUNT_ID;
    if (!operatorAccountId) {
      throw new Error('HEDERA_ACCOUNT_ID not configured');
    }

    const txId = await HederaTokenService.transferToken({
      tokenId: this.realmTokenId,
      fromAccountId: AccountId.fromString(operatorAccountId),
      toAccountId: recipientId,
      amount,
    });

    console.log(`✅ Distributed ${amount} REALM to ${accountId} for: ${reason}`);
    return txId;
  }

  /**
   * Process daily login reward
   */
  async processDailyLogin(
    userId: string,
    accountId: string,
    consecutiveDays: number
  ): Promise<{ txId: string; amount: number; bonus: number }> {
    const baseReward = 10;
    const streakBonus = Math.min(consecutiveDays * 2, 50); // Max 50 bonus
    const totalReward = baseReward + streakBonus;

    const txId = await this.distributeTokenReward(
      accountId,
      totalReward,
      `Daily login (${consecutiveDays} day streak)`
    );

    return {
      txId,
      amount: baseReward,
      bonus: streakBonus,
    };
  }

  /**
   * Process high score reward
   */
  async processHighScoreReward(
    userId: string,
    accountId: string,
    gameId: string,
    score: number,
    previousHighScore: number
  ): Promise<{ txId: string; amount: number }> {
    const improvement = score - previousHighScore;
    const improvementPercentage = (improvement / previousHighScore) * 100;

    // Calculate reward based on improvement
    let reward = 50; // Base reward
    if (improvementPercentage > 50) reward = 200;
    else if (improvementPercentage > 25) reward = 150;
    else if (improvementPercentage > 10) reward = 100;

    const txId = await this.distributeTokenReward(
      accountId,
      reward,
      `High score in ${gameId}: ${score} (+${improvement})`
    );

    return { txId, amount: reward };
  }

  /**
   * Process achievement reward
   */
  async processAchievementReward(
    userId: string,
    accountId: string,
    achievementType: string,
    achievementData: any
  ): Promise<{ txId: string; amount: number; nftMinted?: boolean }> {
    const baseReward = 100;
    
    // Determine if achievement deserves NFT badge
    const shouldMintNFT = await this.shouldMintAchievementNFT(achievementType, achievementData);

    const txId = await this.distributeTokenReward(
      accountId,
      baseReward,
      `Achievement unlocked: ${achievementType}`
    );

    return {
      txId,
      amount: baseReward,
      nftMinted: shouldMintNFT,
    };
  }

  /**
   * Process referral reward
   */
  async processReferralReward(
    referrerId: string,
    referrerAccountId: string,
    referredUserId: string
  ): Promise<{ txId: string; amount: number }> {
    const referralReward = 200;

    const txId = await this.distributeTokenReward(
      referrerAccountId,
      referralReward,
      `Referral reward for inviting user ${referredUserId}`
    );

    return { txId, amount: referralReward };
  }

  /**
   * Validate reward claim to prevent abuse
   */
  async validateRewardClaim(claim: RewardClaim): Promise<{ valid: boolean; reason: string }> {
    const message = `Validate this reward claim for potential abuse: ${JSON.stringify(claim)}`;
    
    const response = await this.processMessage(message, {
      claim,
      action: 'validate_claim',
    });

    const valid = response.message.toLowerCase().includes('valid') && 
                  !response.message.toLowerCase().includes('invalid');

    return {
      valid,
      reason: response.message,
    };
  }

  /**
   * Determine if achievement should mint NFT
   */
  private async shouldMintAchievementNFT(
    achievementType: string,
    data: any
  ): Promise<boolean> {
    // Rare achievements get NFTs
    const nftAchievements = [
      'FIRST_WIN',
      'PERFECT_GAME',
      'TOURNAMENT_WINNER',
      'LEGENDARY_SCORE',
      'MASTER_LEVEL',
    ];

    return nftAchievements.includes(achievementType);
  }

  /**
   * Extract reward amount from AI response
   */
  private extractAmountFromResponse(response: string): number {
    const match = response.match(/(\d+)\s*(REALM|tokens?)/i);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Get reward statistics
   */
  async getRewardStats(userId: string): Promise<any> {
    // This would query the database for user's reward history
    return {
      totalEarned: 0,
      dailyLoginStreak: 0,
      achievementsUnlocked: 0,
      referralsCompleted: 0,
    };
  }
}
