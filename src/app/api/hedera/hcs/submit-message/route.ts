import { NextRequest, NextResponse } from 'next/server';
import { HederaConsensusService } from '@/lib/hedera/consensus';
import { TopicId } from '@hashgraph/sdk';
import { LEADERBOARD_TOPIC, GAME_EVENTS_TOPIC, TOURNAMENT_TOPIC } from '@/lib/constants';

function resolveTopicId(topicId?: string | null, type?: string | null): string | null {
  if (topicId && /^\d+\.\d+\.\d+$/.test(topicId)) return topicId;
  if (!type) return null;
  switch (type.toLowerCase()) {
    case 'leaderboard':
      return LEADERBOARD_TOPIC || null;
    case 'events':
    case 'game_events':
      return GAME_EVENTS_TOPIC || null;
    case 'tournament':
      return TOURNAMENT_TOPIC || null;
    default:
      return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topicId, type, message } = body as { topicId?: string; type?: string; message: any };

    const topicIdStr = resolveTopicId(topicId, type);
    if (!topicIdStr) {
      return NextResponse.json(
        { error: 'topicId or valid type (leaderboard|events|tournament) is required' },
        { status: 400 }
      );
    }

    const topic = TopicId.fromString(topicIdStr);

    // Wrap with standard envelope if useful
    const payload = typeof message === 'object' && message !== null
      ? message
      : { type: type || 'custom', payload: message, timestamp: new Date().toISOString() };

    const result = await HederaConsensusService.submitMessage({ topicId: topic, message: payload });

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error('Error submitting HCS message:', error);
    const msg = error instanceof Error ? error.message : 'Failed to submit HCS message';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
