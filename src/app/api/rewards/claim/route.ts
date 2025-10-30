import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRewardService } from '@/lib/hedera/rewards';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, userId } = body;

    if (!transactionId || !userId) {
      return NextResponse.json(
        { error: 'transactionId and userId are required' },
        { status: 400 }
      );
    }

    // Get pending reward transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: true },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (transaction.type !== 'REWARD') {
      return NextResponse.json(
        { error: 'Transaction is not a reward' },
        { status: 400 }
      );
    }

    if (transaction.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Reward already claimed or failed' },
        { status: 400 }
      );
    }

    if (transaction.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (!transaction.user.hederaAccountId) {
      return NextResponse.json(
        { error: 'User does not have a Hedera account linked' },
        { status: 400 }
      );
    }

    // Distribute reward using direct HTS transfer
    try {
      const rewardService = getRewardService();
      const result = await rewardService.distributeReward(
        transaction.user.hederaAccountId,
        transaction.amount,
        transaction.description || 'Reward claim'
      );

      // Update transaction status
      const updatedTransaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'COMPLETED',
          txHash: result.txId,
        },
      });

      // Update user balance
      await prisma.user.update({
        where: { id: userId },
        data: {
          realmBalance: {
            increment: transaction.amount,
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          transaction: updatedTransaction,
          txId: result.txId,
        },
      });
    } catch (error: unknown) {
      // Mark transaction as failed
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'FAILED' },
      });

      const errorMessage = error instanceof Error ? error.message : 'Failed to distribute reward';
      throw new Error(errorMessage);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to claim reward';
    console.error('Error claiming reward:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
