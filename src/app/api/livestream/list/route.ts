import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'live', 'all', etc.

    console.log('[LIST API] Fetching streams with status:', status);

    const where: any = {};
    
    if (status === 'live') {
      where.isLive = true;
    }

    const streams = await prisma.streamingSession.findMany({
      where,
      orderBy: {
        startedAt: 'desc',
      },
    });

    console.log('[LIST API] Found streams:', streams.length);

    // Get user info for each stream
    const transformedStreams = await Promise.all(
      streams.map(async (stream) => {
        const user = await prisma.user.findUnique({
          where: { id: stream.userId },
          select: {
            id: true,
            username: true,
            name: true,
            hederaAccountId: true,
            walletAddress: true,
          },
        });

        const streamAny = stream as any;

        return {
          id: stream.streamId,
          playbackId: streamAny.playbackId || '',
          title: stream.title,
          streamer: user?.username || user?.name || user?.hederaAccountId || user?.walletAddress || 'Unknown',
          streamerId: stream.userId,
          streamerAccountId: user?.hederaAccountId || user?.walletAddress,
          game: streamAny.game || 'Gaming',
          viewerCount: stream.viewerCount,
          isLive: streamAny.isLive || false,
          description: stream.description,
          startedAt: stream.startedAt.toISOString(),
        };
      })
    );

    console.log('[LIST API] Transformed streams:', transformedStreams);

    return NextResponse.json({
      success: true,
      streams: transformedStreams,
      count: transformedStreams.length,
    });
  } catch (error) {
    console.error('[LIST API] Error fetching streams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch streams', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
