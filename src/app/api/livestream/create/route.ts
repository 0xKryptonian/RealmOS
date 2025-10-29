import { NextRequest, NextResponse } from 'next/server';
import { LivepeerService } from '@/lib/streaming/livepeer-service';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, game, streamer } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Stream title is required' },
        { status: 400 }
      );
    }

    if (!streamer) {
      return NextResponse.json(
        { error: 'User account ID is required' },
        { status: 400 }
      );
    }

    // Create stream using Livepeer
    const streamName = `${title} - ${game || 'Gaming'}`;
    const stream = await LivepeerService.createStream(streamName);

    // Find or create user in database
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress: streamer },
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: streamer,
          name: streamer,
        },
      });
    }

    // Save stream to database
    const streamingSession = await prisma.streamingSession.create({
      data: {
        userId: user.id,
        streamId: stream.id,
        streamKey: stream.streamKey,
        playbackId: stream.playbackId || '',
        rtmpUrl: 'rtmp://rtmp.livepeer.com/live',
        title,
        description: description || '',
        game: game || 'Gaming',
        status: 'SCHEDULED',
        isLive: false,
      },
    });

    return NextResponse.json({
      success: true,
      streamId: stream.id,
      streamKey: stream.streamKey,
      playbackId: stream.playbackId,
      rtmpUrl: 'rtmp://rtmp.livepeer.com/live',
      dbId: streamingSession.id,
      message: 'Stream created successfully',
    });
  } catch (error) {
    console.error('Error creating stream:', error);
    return NextResponse.json(
      { error: 'Failed to create stream', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
