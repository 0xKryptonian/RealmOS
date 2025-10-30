import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Build filter for reward transactions
    const where: Prisma.TransactionWhereInput = {
      userId,
      type: 'REWARD',
    };

    // Optional status filter (PENDING | COMPLETED | FAILED)
    if (status && ['PENDING', 'COMPLETED', 'FAILED'].includes(status)) {
      where.status = status as 'PENDING' | 'COMPLETED' | 'FAILED';
    }

    const rewards = await prisma.transaction.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate stats from transactions
    const totalEarned = await prisma.transaction.aggregate({
      where: { userId, type: 'REWARD', status: 'COMPLETED' },
      _sum: { amount: true },
    });

    const pendingRewards = await prisma.transaction.aggregate({
      where: { userId, type: 'REWARD', status: 'PENDING' },
      _sum: { amount: true },
    });

    const claimedRewards = await prisma.transaction.aggregate({
      where: { userId, type: 'REWARD', status: 'COMPLETED' },
      _sum: { amount: true },
    });

    return NextResponse.json({
      success: true,
      rewards,
      stats: {
        totalEarned: totalEarned._sum.amount || 0,
        pendingRewards: pendingRewards._sum.amount || 0,
        claimedRewards: claimedRewards._sum.amount || 0,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rewards';
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
