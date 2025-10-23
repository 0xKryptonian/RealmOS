import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Check if tournament exists
    const tournament = await prisma.communityEvent.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { participants: true },
        },
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Check if tournament is full
    if (tournament.maxParticipants && tournament._count.participants >= tournament.maxParticipants) {
      return NextResponse.json({ error: 'Tournament is full' }, { status: 400 });
    }

    // Check if user is already registered
    const existingParticipant = await prisma.communityEventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId,
        },
      },
    });

    if (existingParticipant) {
      return NextResponse.json({ error: 'Already registered' }, { status: 400 });
    }

    // Register user
    const participant = await prisma.communityEventParticipant.create({
      data: {
        eventId: params.id,
        userId,
        status: 'REGISTERED',
      },
    });

    return NextResponse.json({ participant }, { status: 201 });
  } catch (error) {
    console.error('Error registering for tournament:', error);
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    await prisma.communityEventParticipant.delete({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unregistering from tournament:', error);
    return NextResponse.json({ error: 'Failed to unregister' }, { status: 500 });
  }
}
