import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournament = await prisma.communityEvent.findUnique({
      where: {
        id: params.id,
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
      },
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    return NextResponse.json({ tournament });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return NextResponse.json({ error: 'Failed to fetch tournament' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, description, imageUrl, startTime, endTime, prizePool, maxParticipants, isActive } = body;

    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (startTime !== undefined) updateData.startTime = new Date(startTime);
    if (endTime !== undefined) updateData.endTime = endTime ? new Date(endTime) : null;
    if (prizePool !== undefined) updateData.prizePool = prizePool;
    if (maxParticipants !== undefined) updateData.maxParticipants = maxParticipants;
    if (isActive !== undefined) updateData.isActive = isActive;

    const tournament = await prisma.communityEvent.update({
      where: {
        id: params.id,
      },
      data: updateData,
    });

    return NextResponse.json({ tournament });
  } catch (error) {
    console.error('Error updating tournament:', error);
    return NextResponse.json({ error: 'Failed to update tournament' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.communityEvent.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json({ error: 'Failed to delete tournament' }, { status: 500 });
  }
}
