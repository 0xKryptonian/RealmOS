import { NextRequest, NextResponse } from 'next/server';
import { LivepeerService } from '@/lib/streaming/livepeer-service';

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

    // Create stream using Livepeer
    const streamName = `${title} - ${game || 'Gaming'}`;
    const stream = await LivepeerService.createStream(streamName);

    return NextResponse.json({
      success: true,
      streamId: stream.id,
      streamKey: stream.streamKey,
      playbackId: stream.playbackId,
      rtmpUrl: 'rtmp://rtmp.livepeer.com/live',
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
