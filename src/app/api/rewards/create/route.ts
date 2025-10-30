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

    // Create pending reward transaction (tracked via Transaction model)
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: 'REWARD',
        amount: Number(amount),
        tokenSymbol: 'REALM',
        status: 'PENDING',
        description: String(reason),
      },
      include: { user: true },
    });

    // Auto-distribute if requested and user has Hedera account
    if (autoDistribute && transaction.user?.hederaAccountId) {
      try {
        const { getRewardService } = await import('@/lib/hedera/rewards');
        const rewardService = getRewardService();
        
        const result = await rewardService.distributeReward(
          transaction.user.hederaAccountId,
          Number(amount),
          String(reason)
        );

        // Mark transaction as completed with tx hash
        const updatedTransaction = await prisma.transaction.update({
          where: { id: transaction.id },
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
              increment: Number(amount),
            },
          },
        });

        return NextResponse.json({
          success: true,
          data: updatedTransaction,
          autoDistributed: true,
        });
      } catch (error) {
        console.error('Auto-distribution failed:', error);
        // Return reward as pending if auto-distribution fails
      }
    }

    return NextResponse.json({
      success: true,
      data: transaction,
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
