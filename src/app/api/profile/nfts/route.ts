import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');
    const userId = searchParams.get('userId');

    if (!accountId && !userId) {
      return NextResponse.json(
        { error: 'accountId or userId is required' },
        { status: 400 }
      );
    }

    let where: { owner?: string; userId?: string } = {};
    
    if (accountId) {
      where.owner = accountId;
    } else if (userId) {
      where.userId = userId;
    }

    const nfts = await prisma.nFT.findMany({
      where,
      include: {
        listings: {
          where: {
            status: 'ACTIVE',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      nfts,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch NFTs';
    console.error('Error fetching NFTs:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
