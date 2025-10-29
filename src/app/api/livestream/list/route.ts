import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'live', 'all', etc.

    const where: any = {};
    
    if (status === 'live') {
      where.isLive = true;
    }

    const streams = await prisma.streamingSession.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            hederaAccountId: true,
            walletAddress: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to match frontend interface
    const transformedStreams = streams.map((stream) => ({
      id: stream.streamId,
      playbackId: stream.playbackId || '',
      title: stream.title,
      streamer: stream.user.username || stream.user.name || stream.user.hederaAccountId || stream.user.walletAddress,
      streamerId: stream.userId,
      game: stream.game || 'Gaming',
      viewerCount: stream.viewerCount,
      isLive: stream.isLive,
      description: stream.description,
      startedAt: stream.startedAt.toISOString(),
      streamKey: stream.streamKey,
      rtmpUrl: stream.rtmpUrl,
    }));

    return NextResponse.json({
      success: true,
      streams: transformedStreams,
    });
  } catch (error) {
    console.error('Error fetching streams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streams', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
