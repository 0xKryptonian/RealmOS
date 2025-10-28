import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['ACCEPTED', 'BLOCKED'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (ACCEPTED or BLOCKED)' },
        { status: 400 }
      );
    }

    const friendship = await prisma.friendship.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ friendship });
  } catch (error) {
    console.error('Error updating friendship:', error);
    return NextResponse.json({ error: 'Failed to update friendship' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.friendship.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting friendship:', error);
    return NextResponse.json({ error: 'Failed to delete friendship' }, { status: 500 });
  }
}
