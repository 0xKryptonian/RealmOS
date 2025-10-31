import {
  ScheduleCreateTransaction,
  ScheduleSignTransaction,
  ScheduleInfoQuery,
  ScheduleId,
  TransferTransaction,
  AccountId,
  Hbar,
  PrivateKey,
  Timestamp,
} from '@hashgraph/sdk';
import { HederaClient } from './client';
import { prisma } from '@/lib/prisma';

export interface ScheduledTransactionInfo {
  scheduleId: string;
  transactionId: string;
  payerAccountId: string;
  scheduledAt: Date;
  executionTime?: Date;
  status: 'PENDING' | 'EXECUTED' | 'EXPIRED' | 'DELETED';
  memo?: string;
  signers: string[];
}

export interface DailyRewardSchedule {
  userId: string;
  accountId: string;
  amount: number;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  nextExecution: Date;
}

export interface TournamentPrizeSchedule {
  tournamentId: string;
  winners: Array<{
    accountId: string;
    amount: number;
    rank: number;
  }>;
  distributionDate: Date;
}

/**
 * Hedera Scheduled Transaction Service
 * Manages scheduled transactions for automated rewards and prize distribution
 */
export class ScheduledTransactionService {
  private client = HederaClient.getClient();
  private operatorId = AccountId.fromString(
    process.env.HEDERA_OPERATOR_ID || '0.0.0'
  );
  private operatorKey = PrivateKey.fromString(
    process.env.HEDERA_OPERATOR_KEY || ''
  );

  /**
   * Create a scheduled transaction for future execution
   */
  async createScheduledTransaction(
    transaction: TransferTransaction,
    memo: string,
    executionTime?: Date
  ): Promise<ScheduledTransactionInfo> {
    try {
      // Create schedule transaction
      const scheduleTransaction = new ScheduleCreateTransaction()
        .setScheduledTransaction(transaction)
        .setScheduleMemo(memo)
        .setPayerAccountId(this.operatorId);

      // Set execution time if provided (wait until specific time)
      if (executionTime) {
        const waitTime = Math.floor(
          (executionTime.getTime() - Date.now()) / 1000
        );
        if (waitTime > 0) {
          scheduleTransaction.setWaitForExpiry(true);
          const timestamp = Timestamp.fromDate(executionTime);
          scheduleTransaction.setExpirationTime(timestamp);
        }
      }

      // Execute and get receipt
      const txResponse = await scheduleTransaction.execute(this.client);
      const receipt = await txResponse.getReceipt(this.client);
      const scheduleId = receipt.scheduleId;

      if (!scheduleId) {
        throw new Error('Failed to create scheduled transaction');
      }

      // Query schedule info
      const scheduleInfo = await new ScheduleInfoQuery()
        .setScheduleId(scheduleId)
        .execute(this.client);

      return {
        scheduleId: scheduleId.toString(),
        transactionId: txResponse.transactionId.toString(),
        payerAccountId: this.operatorId.toString(),
        scheduledAt: new Date(),
        executionTime: executionTime,
        status: scheduleInfo.executed ? 'EXECUTED' : 'PENDING',
        memo,
        signers: [], // Signatories not directly exposed in current SDK
      };
    } catch (error) {
      console.error('Error creating scheduled transaction:', error);
      throw error;
    }
  }

  /**
   * Schedule daily login rewards for a user
   */
  async scheduleDailyReward(
    userId: string,
    accountId: string,
    amount: number,
    startDate: Date = new Date()
  ): Promise<ScheduledTransactionInfo> {
    try {
      // Create transfer transaction for reward
      const transferTx = new TransferTransaction()
        .addHbarTransfer(this.operatorId, new Hbar(-amount))
        .addHbarTransfer(AccountId.fromString(accountId), new Hbar(amount))
        .setTransactionMemo(`Daily reward for user ${userId}`);

      // Schedule for next day at midnight
      const nextExecution = new Date(startDate);
      nextExecution.setDate(nextExecution.getDate() + 1);
      nextExecution.setHours(0, 0, 0, 0);

      const scheduledTx = await this.createScheduledTransaction(
        transferTx,
        `Daily reward: ${amount} HBAR for ${userId}`,
        nextExecution
      );

      // Store in database
      await prisma.transaction.create({
        data: {
          userId,
          type: 'REWARD',
          amount,
          tokenSymbol: 'HBAR',
          status: 'PENDING',
          description: 'Scheduled daily reward',
          txHash: scheduledTx.scheduleId,
        },
      });

      return scheduledTx;
    } catch (error) {
      console.error('Error scheduling daily reward:', error);
      throw error;
    }
  }

  /**
   * Schedule tournament prize distribution
   */
  async scheduleTournamentPrizes(
    schedule: TournamentPrizeSchedule
  ): Promise<ScheduledTransactionInfo[]> {
    try {
      const scheduledTransactions: ScheduledTransactionInfo[] = [];

      for (const winner of schedule.winners) {
        // Create transfer for each winner
        const transferTx = new TransferTransaction()
          .addHbarTransfer(this.operatorId, new Hbar(-winner.amount))
          .addHbarTransfer(
            AccountId.fromString(winner.accountId),
            new Hbar(winner.amount)
          )
          .setTransactionMemo(
            `Tournament ${schedule.tournamentId} - Rank ${winner.rank} prize`
          );

        const scheduledTx = await this.createScheduledTransaction(
          transferTx,
          `Prize for rank ${winner.rank}: ${winner.amount} HBAR`,
          schedule.distributionDate
        );

        scheduledTransactions.push(scheduledTx);

        // Record in database
        await prisma.transaction.create({
          data: {
            userId: winner.accountId, // Using accountId as userId for now
            type: 'PRIZE',
            amount: winner.amount,
            tokenSymbol: 'HBAR',
            status: 'PENDING',
            description: `Tournament prize - Rank ${winner.rank}`,
            txHash: scheduledTx.scheduleId,
          },
        });
      }

      return scheduledTransactions;
    } catch (error) {
      console.error('Error scheduling tournament prizes:', error);
      throw error;
    }
  }

  /**
   * Sign a scheduled transaction (for multi-sig)
   */
  async signScheduledTransaction(
    scheduleId: string,
    signerKey: PrivateKey
  ): Promise<void> {
    try {
      const signTx = new ScheduleSignTransaction()
        .setScheduleId(ScheduleId.fromString(scheduleId))
        .freezeWith(this.client);

      const signedTx = await signTx.sign(signerKey);
      await signedTx.execute(this.client);
    } catch (error) {
      console.error('Error signing scheduled transaction:', error);
      throw error;
    }
  }

  /**
   * Get scheduled transaction info
   */
  async getScheduleInfo(scheduleId: string): Promise<ScheduledTransactionInfo> {
    try {
      const scheduleInfo = await new ScheduleInfoQuery()
        .setScheduleId(ScheduleId.fromString(scheduleId))
        .execute(this.client);

      return {
        scheduleId,
        transactionId: scheduleInfo.scheduledTransactionId?.toString() || '',
        payerAccountId: scheduleInfo.payerAccountId?.toString() || '',
        scheduledAt: new Date(), // SDK doesn't expose createdAt directly
        executionTime: undefined, // SDK doesn't expose executedAt as Date
        status: scheduleInfo.executed
          ? 'EXECUTED'
          : scheduleInfo.deleted
          ? 'DELETED'
          : 'PENDING',
        memo: scheduleInfo.scheduleMemo || '',
        signers: [], // Signatories not directly exposed
      };
    } catch (error) {
      console.error('Error getting schedule info:', error);
      throw error;
    }
  }

  /**
   * Delete a scheduled transaction (before execution)
   */
  async deleteScheduledTransaction(scheduleId: string): Promise<void> {
    try {
      // Note: Requires admin signature
      // Implementation depends on your multi-sig setup
      console.log(`Deleting scheduled transaction: ${scheduleId}`);
      // ScheduleDeleteTransaction not available in current SDK
      // Would need to wait for expiration or use admin controls
    } catch (error) {
      console.error('Error deleting scheduled transaction:', error);
      throw error;
    }
  }

  /**
   * Monitor scheduled transactions and update database
   */
  async monitorScheduledTransactions(): Promise<void> {
    try {
      // Get all pending scheduled transactions from database
      const pendingTxs = await prisma.transaction.findMany({
        where: {
          status: 'PENDING',
          txHash: { startsWith: '0.0.' }, // Schedule IDs start with 0.0.
        },
      });

      for (const tx of pendingTxs) {
        if (!tx.txHash) continue;

        try {
          const scheduleInfo = await this.getScheduleInfo(tx.txHash);

          // Update status if executed
          if (scheduleInfo.status === 'EXECUTED') {
            await prisma.transaction.update({
              where: { id: tx.id },
              data: {
                status: 'COMPLETED',
              },
            });

            // Update user balance if reward
            if (tx.type === 'REWARD') {
              await prisma.user.update({
                where: { id: tx.userId },
                data: {
                  realmBalance: {
                    increment: tx.amount,
                  },
                },
              });
            }
          }

          // Mark as failed if deleted or expired
          if (
            scheduleInfo.status === 'DELETED' ||
            scheduleInfo.status === 'EXPIRED'
          ) {
            await prisma.transaction.update({
              where: { id: tx.id },
              data: { status: 'FAILED' },
            });
          }
        } catch (error) {
          console.error(`Error monitoring schedule ${tx.txHash}:`, error);
        }
      }
    } catch (error) {
      console.error('Error monitoring scheduled transactions:', error);
      throw error;
    }
  }

  /**
   * Batch schedule rewards for multiple users
   */
  async batchScheduleRewards(
    rewards: Array<{ userId: string; accountId: string; amount: number }>,
    executionDate: Date
  ): Promise<ScheduledTransactionInfo[]> {
    const scheduled: ScheduledTransactionInfo[] = [];

    for (const reward of rewards) {
      try {
        const scheduledTx = await this.scheduleDailyReward(
          reward.userId,
          reward.accountId,
          reward.amount,
          executionDate
        );
        scheduled.push(scheduledTx);
      } catch (error) {
        console.error(
          `Failed to schedule reward for user ${reward.userId}:`,
          error
        );
      }
    }

    return scheduled;
  }

  /**
   * Get all scheduled transactions for a user
   */
  async getUserScheduledTransactions(
    userId: string
  ): Promise<ScheduledTransactionInfo[]> {
    try {
      const userTxs = await prisma.transaction.findMany({
        where: {
          userId,
          status: 'PENDING',
          txHash: { startsWith: '0.0.' },
        },
      });

      const scheduleInfos: ScheduledTransactionInfo[] = [];

      for (const tx of userTxs) {
        if (tx.txHash) {
          try {
            const info = await this.getScheduleInfo(tx.txHash);
            scheduleInfos.push(info);
          } catch (error) {
            console.error(`Error fetching schedule ${tx.txHash}:`, error);
          }
        }
      }

      return scheduleInfos;
    } catch (error) {
      console.error('Error getting user scheduled transactions:', error);
      throw error;
    }
  }
}

// Singleton instance
let scheduledTxService: ScheduledTransactionService | null = null;

export function getScheduledTransactionService(): ScheduledTransactionService {
  if (!scheduledTxService) {
    scheduledTxService = new ScheduledTransactionService();
  }
  return scheduledTxService;
}
