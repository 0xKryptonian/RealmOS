import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const otherUserId = searchParams.get('otherUserId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const where: any = {
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
    };

    if (otherUserId) {
      where.OR = [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ];
    }

    const messages = await prisma.directMessage.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderId, receiverId, content } = body;

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'senderId, receiverId, and content are required' },
        { status: 400 }
      );
    }

    const message = await prisma.directMessage.create({
      data: {
        senderId,
        receiverId,
        content,
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
