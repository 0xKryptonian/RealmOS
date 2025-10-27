import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, reason, autoDistribute = false } = body;

    if (!userId || !amount || !reason) {
      return NextResponse.json(
        { error: 'userId, amount, and reason are required' },
        { status: 400 }
      );
    }

    // Create reward
    const reward = await prisma.reward.create({
      data: {
        userId,
        amount,
        reason,
        status: 'PENDING',
      },
      include: {
        user: true,
      },
    });

    // Auto-distribute if requested and user has Hedera account
    if (autoDistribute && reward.user.hederaAccountId) {
      try {
        const { getRewardService } = await import('@/lib/hedera/rewards');
        const rewardService = getRewardService();
        
        const result = await rewardService.distributeReward(
          reward.user.hederaAccountId,
          amount,
          reason
        );

        // Update reward
        const updatedReward = await prisma.reward.update({
          where: { id: reward.id },
          data: {
            status: 'CLAIMED',
            txHash: result.txId,
            claimedAt: new Date(),
          },
        });

        // Update user balance
        await prisma.user.update({
          where: { id: userId },
          data: {
            realmBalance: {
              increment: amount,
            },
          },
        });

        return NextResponse.json({
          success: true,
          data: updatedReward,
          autoDistributed: true,
        });
      } catch (error) {
        console.error('Auto-distribution failed:', error);
        // Return reward as pending if auto-distribution fails
      }
    }

    return NextResponse.json({
      success: true,
      data: reward,
      autoDistributed: false,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create reward';
    console.error('Error creating reward:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
