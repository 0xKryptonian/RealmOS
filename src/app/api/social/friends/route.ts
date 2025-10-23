import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') || 'ACCEPTED';

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { requesterId: userId, status },
          { addresseeId: userId, status },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ friendships });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requesterId, addresseeId } = body;

    if (!requesterId || !addresseeId) {
      return NextResponse.json(
        { error: 'requesterId and addresseeId are required' },
        { status: 400 }
      );
    }

    if (requesterId === addresseeId) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 });
    }

    // Check if friendship already exists
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Friend request already exists' }, { status: 400 });
    }

    const friendship = await prisma.friendship.create({
      data: {
        requesterId,
        addresseeId,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ friendship }, { status: 201 });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 });
  }
}
