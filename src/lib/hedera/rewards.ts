import { TokenId, AccountId, PrivateKey, TransferTransaction } from '@hashgraph/sdk';
import { HederaClient } from './client';

export interface RewardClaim {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'CLAIMED' | 'FAILED';
  txHash?: string;
  createdAt: Date;
  claimedAt?: Date;
}

/**
 * Reward Distribution Service
 * Direct HTS token transfers for rewards
 */
export class RewardService {
  private tokenId: TokenId;
  private treasuryKey: PrivateKey;

  constructor(tokenIdString: string, treasuryKeyString?: string) {
    this.tokenId = TokenId.fromString(tokenIdString);
    
    if (treasuryKeyString) {
      this.treasuryKey = PrivateKey.fromString(treasuryKeyString);
    } else {
      this.treasuryKey = HederaClient.getOperatorKey();
    }
  }

  /**
   * Distribute reward to user
   */
  async distributeReward(
    recipientAccountId: string,
    amount: number,
    memo?: string
  ): Promise<{ txId: string; amount: number }> {
    const client = HederaClient.getClient();
    const recipient = AccountId.fromString(recipientAccountId);
    const treasury = HederaClient.getOperatorId();

    try {
      const transaction = new TransferTransaction()
        .addTokenTransfer(this.tokenId, treasury, -amount)
        .addTokenTransfer(this.tokenId, recipient, amount);

      if (memo) {
        transaction.setTransactionMemo(memo);
      }

      const signedTx = await transaction.freezeWith(client).sign(this.treasuryKey);
      const txResponse = await signedTx.execute(client);
      const receipt = await txResponse.getReceipt(client);

      console.log(`✅ Reward distributed: ${amount} tokens to ${recipientAccountId}`);

      return {
        txId: txResponse.transactionId.toString(),
        amount,
      };
    } catch (error) {
      console.error('Failed to distribute reward:', error);
      throw error;
    }
  }

  /**
   * Batch distribute rewards
   */
  async batchDistributeRewards(
    recipients: Array<{ accountId: string; amount: number }>
  ): Promise<{ txId: string; totalAmount: number }> {
    const client = HederaClient.getClient();
    const treasury = HederaClient.getOperatorId();

    let transaction = new TransferTransaction();
    let totalAmount = 0;

    // Add all transfers to single transaction
    for (const recipient of recipients) {
      const accountId = AccountId.fromString(recipient.accountId);
      transaction = transaction
        .addTokenTransfer(this.tokenId, treasury, -recipient.amount)
        .addTokenTransfer(this.tokenId, accountId, recipient.amount);
      totalAmount += recipient.amount;
    }

    const signedTx = await transaction.freezeWith(client).sign(this.treasuryKey);
    const txResponse = await signedTx.execute(client);
    await txResponse.getReceipt(client);

    console.log(`✅ Batch rewards distributed: ${totalAmount} tokens to ${recipients.length} users`);

    return {
      txId: txResponse.transactionId.toString(),
      totalAmount,
    };
  }

  /**
   * Calculate high score reward
   */
  calculateHighScoreReward(
    newScore: number,
    previousHighScore: number,
    baseReward: number = 10
  ): number {
    if (newScore <= previousHighScore) {
      return 0;
    }

    const improvement = newScore - previousHighScore;
    const improvementPercentage = (improvement / Math.max(previousHighScore, 1)) * 100;

    // Base reward + bonus for improvement
    let reward = baseReward;

    if (improvementPercentage > 50) {
      reward *= 2; // 100% bonus for >50% improvement
    } else if (improvementPercentage > 25) {
      reward *= 1.5; // 50% bonus for >25% improvement
    } else if (improvementPercentage > 10) {
      reward *= 1.25; // 25% bonus for >10% improvement
    }

    return Math.floor(reward);
  }

  /**
   * Calculate achievement reward
   */
  calculateAchievementReward(achievementType: string): number {
    const rewards: Record<string, number> = {
      FIRST_WIN: 50,
      STREAK_5: 100,
      STREAK_10: 250,
      STREAK_20: 500,
      LEVEL_UP: 25,
      TOURNAMENT_WIN: 1000,
      TOURNAMENT_TOP_3: 500,
      TOURNAMENT_TOP_10: 250,
      DAILY_QUEST: 10,
      WEEKLY_QUEST: 50,
      MONTHLY_QUEST: 200,
    };

    return rewards[achievementType] || 10;
  }

  /**
   * Process high score reward
   */
  async processHighScoreReward(
    userId: string,
    recipientAccountId: string,
    gameId: string,
    newScore: number,
    previousHighScore: number
  ): Promise<{ txId: string; amount: number }> {
    const amount = this.calculateHighScoreReward(newScore, previousHighScore);

    if (amount === 0) {
      throw new Error('No reward for this score');
    }

    return this.distributeReward(
      recipientAccountId,
      amount,
      `High score reward: ${gameId} - ${newScore}`
    );
  }

  /**
   * Process achievement reward
   */
  async processAchievementReward(
    recipientAccountId: string,
    achievementType: string,
    achievementName: string
  ): Promise<{ txId: string; amount: number }> {
    const amount = this.calculateAchievementReward(achievementType);

    return this.distributeReward(
      recipientAccountId,
      amount,
      `Achievement: ${achievementName}`
    );
  }
}

/**
 * Get reward service instance
 */
export function getRewardService(): RewardService {
  const tokenId = process.env.REALM_TOKEN_ID;
  const treasuryKey = process.env.HEDERA_PRIVATE_KEY;

  if (!tokenId) {
    throw new Error('REALM_TOKEN_ID not configured');
  }

  return new RewardService(tokenId, treasuryKey);
}
