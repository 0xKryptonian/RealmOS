import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try to find stream by streamId first
    let stream = await prisma.streamingSession.findFirst({
      where: { 
        OR: [
          { streamId: id },
          { id: id }
        ]
      },
    });

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      );
    }

    // Get user info
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

    if (!user) {
      return NextResponse.json(
        { error: 'Stream owner not found' },
        { status: 404 }
      );
    }

    // Transform to match frontend interface
    // Use type assertion to access fields that may not exist in current Prisma client
    const streamAny = stream as any;
    
    const transformedStream = {
      id: stream.streamId,
      playbackId: stream.playbackId || '',
      title: stream.title,
      streamer: user.username || user.name || user.hederaAccountId || user.walletAddress,
      streamerId: stream.userId,
      streamerAccountId: user.hederaAccountId || user.walletAddress,
      streamerWalletAddress: user.walletAddress,
      game: streamAny.game || 'Gaming',
      viewerCount: stream.viewerCount,
      isLive: streamAny.isLive || false,
      description: stream.description,
      startedAt: stream.startedAt.toISOString(),
      streamKey: streamAny.streamKey || null,
      rtmpUrl: streamAny.rtmpUrl || 'rtmp://rtmp.livepeer.com/live',
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
