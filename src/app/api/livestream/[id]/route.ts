import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const stream = await prisma.streamingSession.findUnique({
      where: { streamId: id },
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
    });

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    // Transform to match frontend interface
    const transformedStream = {
      id: stream.streamId,
      playbackId: stream.playbackId || '',
      title: stream.title,
      streamer: stream.user.username || stream.user.name || stream.user.hederaAccountId || stream.user.walletAddress,
      streamerId: stream.userId,
      streamerAccountId: stream.user.hederaAccountId,
      game: stream.game || 'Gaming',
      viewerCount: stream.viewerCount,
      isLive: stream.isLive,
      description: stream.description,
      startedAt: stream.startedAt.toISOString(),
      streamKey: stream.streamKey,
      rtmpUrl: stream.rtmpUrl,
    };

    return NextResponse.json({
      success: true,
      stream: transformedStream,
    });
  } catch (error) {
    console.error('Error fetching stream:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stream', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
