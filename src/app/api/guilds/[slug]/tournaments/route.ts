import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const guild = await prisma.guild.findUnique({
      where: { slug: params.slug },
    });

    if (!guild) {
      return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
    }

    const tournaments = await prisma.guildTournament.findMany({
      where: {
        guildId: guild.id,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json({ tournaments });
  } catch (error) {
    console.error('Error fetching guild tournaments:', error);
    return NextResponse.json({ error: 'Failed to fetch tournaments' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const { title, description, prizePool, startDate, endDate } = body;

    if (!title || !prizePool || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Title, prizePool, startDate, and endDate are required' },
        { status: 400 }
      );
    }

    const guild = await prisma.guild.findUnique({
      where: { slug: params.slug },
    });

    if (!guild) {
      return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
    }

    const tournament = await prisma.guildTournament.create({
      data: {
        guildId: guild.id,
        title,
        description,
        prizePool,
        status: 'UPCOMING',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return NextResponse.json({ tournament }, { status: 201 });
  } catch (error) {
    console.error('Error creating guild tournament:', error);
    return NextResponse.json({ error: 'Failed to create tournament' }, { status: 500 });
  }
}
