import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

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

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const rewards = await prisma.reward.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate stats
    const totalEarned = await prisma.reward.aggregate({
      where: { userId, status: 'CLAIMED' },
      _sum: { amount: true },
    });

    const pendingRewards = await prisma.reward.aggregate({
      where: { userId, status: 'PENDING' },
      _sum: { amount: true },
    });

    const claimedRewards = await prisma.reward.aggregate({
      where: { userId, status: 'CLAIMED' },
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
