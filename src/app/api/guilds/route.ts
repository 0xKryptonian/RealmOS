import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');

    const guilds = await prisma.guild.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: {
        _count: {
          select: { members: true },
        },
      },
      take: limit,
      orderBy: {
        memberCount: 'desc',
      },
    });

    return NextResponse.json({ guilds });
  } catch (error) {
    console.error('Error fetching guilds:', error);
    return NextResponse.json({ error: 'Failed to fetch guilds' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, isPublic, founderId } = body;

    if (!name || !founderId) {
      return NextResponse.json(
        { error: 'Name and founderId are required' },
        { status: 400 }
      );
    }

    // Create slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Check if guild with same name or slug exists
    const existing = await prisma.guild.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Guild with this name already exists' },
        { status: 400 }
      );
    }

    // Create guild
    const guild = await prisma.guild.create({
      data: {
        name,
        slug,
        description,
        isPublic: isPublic ?? true,
        founderId,
        memberCount: 1,
      },
    });

    // Add founder as first member
    await prisma.guildMember.create({
      data: {
        guildId: guild.id,
        userId: founderId,
        role: 'FOUNDER',
      },
    });

    return NextResponse.json({ guild }, { status: 201 });
  } catch (error) {
    console.error('Error creating guild:', error);
    return NextResponse.json({ error: 'Failed to create guild' }, { status: 500 });
  }
}
