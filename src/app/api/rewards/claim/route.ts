import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRewardService } from '@/lib/hedera/rewards';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rewardId, userId } = body;

    if (!rewardId) {
      return NextResponse.json(
        { error: 'rewardId is required' },
        { status: 400 }
      );
    }

    // Get reward
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
      include: { user: true },
    });

    if (!reward) {
      return NextResponse.json(
        { error: 'Reward not found' },
        { status: 404 }
      );
    }

    if (reward.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Reward already claimed or failed' },
        { status: 400 }
      );
    }

    if (!reward.user.hederaAccountId) {
      return NextResponse.json(
        { error: 'User does not have a Hedera account linked' },
        { status: 400 }
      );
    }

    // Distribute reward using direct HTS transfer
    try {
      const rewardService = getRewardService();
      const result = await rewardService.distributeReward(
        reward.user.hederaAccountId,
        reward.amount,
        reward.reason
      );

      // Update reward status
      const updatedReward = await prisma.reward.update({
        where: { id: rewardId },
        data: {
          status: 'CLAIMED',
          txHash: result.txId,
          claimedAt: new Date(),
        },
      });

      // Update user balance
      await prisma.user.update({
        where: { id: reward.userId },
        data: {
          realmBalance: {
            increment: reward.amount,
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          reward: updatedReward,
          txId: result.txId,
        },
      });
    } catch (error: unknown) {
      // Mark reward as failed
      await prisma.reward.update({
        where: { id: rewardId },
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
