import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const gameId = searchParams.get('gameId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {
      isActive: true,
    };

    if (status) {
      where.status = status.toUpperCase();
    }

    if (gameId) {
      where.gameId = gameId;
    }

    const tournaments = await prisma.communityEvent.findMany({
      where: {
        ...where,
        eventType: 'TOURNAMENT',
      },
      include: {
        participants: {
          select: {
            id: true,
            userId: true,
            status: true,
            registeredAt: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      take: limit,
      orderBy: {
        startTime: 'asc',
      },
    });

    return NextResponse.json({ tournaments });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json({ error: 'Failed to fetch tournaments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      imageUrl,
      startTime,
      endTime,
      prizePool,
      maxParticipants,
      gameId,
      location,
    } = body;

    if (!title || !description || !startTime) {
      return NextResponse.json(
        { error: 'Title, description, and startTime are required' },
        { status: 400 }
      );
    }

    const tournament = await prisma.communityEvent.create({
      data: {
        title,
        description,
        imageUrl: imageUrl || '/images/tournament-default.png',
        eventType: 'TOURNAMENT',
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        prizePool: prizePool || '0',
        maxParticipants: maxParticipants || null,
        location: location || 'online',
        isActive: true,
      },
    });

    return NextResponse.json({ tournament }, { status: 201 });
  } catch (error) {
    console.error('Error creating tournament:', error);
    return NextResponse.json({ error: 'Failed to create tournament' }, { status: 500 });
  }
}
