import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Find guild
    const guild = await prisma.guild.findUnique({
      where: { slug: params.slug },
    });

    if (!guild) {
      return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
    }

    // Check if user is already a member
    const existingMember = await prisma.guildMember.findUnique({
      where: {
        guildId_userId: {
          guildId: guild.id,
          userId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 });
    }

    // Add member
    const member = await prisma.guildMember.create({
      data: {
        guildId: guild.id,
        userId,
        role: 'MEMBER',
      },
    });

    // Update member count
    await prisma.guild.update({
      where: { id: guild.id },
      data: {
        memberCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error('Error joining guild:', error);
    return NextResponse.json({ error: 'Failed to join guild' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Find guild
    const guild = await prisma.guild.findUnique({
      where: { slug: params.slug },
    });

    if (!guild) {
      return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
    }

    // Check if user is founder
    const member = await prisma.guildMember.findUnique({
      where: {
        guildId_userId: {
          guildId: guild.id,
          userId,
        },
      },
    });

    if (member?.role === 'FOUNDER') {
      return NextResponse.json({ error: 'Founder cannot leave guild' }, { status: 400 });
    }

    // Remove member
    await prisma.guildMember.delete({
      where: {
        guildId_userId: {
          guildId: guild.id,
          userId,
        },
      },
    });

    // Update member count
    await prisma.guild.update({
      where: { id: guild.id },
      data: {
        memberCount: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error leaving guild:', error);
    return NextResponse.json({ error: 'Failed to leave guild' }, { status: 500 });
  }
}
