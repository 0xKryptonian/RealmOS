import { NextRequest, NextResponse } from 'next/server';
import { mirrorNode, HederaMirrorNode } from '@/lib/hedera/mirror-node';
import { 
  LEADERBOARD_TOPIC, 
  GAME_EVENTS_TOPIC, 
  TOURNAMENT_TOPIC 
} from '@/lib/constants';

/**
 * GET /api/hedera/hcs/messages
 * Get HCS topic messages using Mirror Node
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const topicId = searchParams.get('topicId');
    const topicType = searchParams.get('type'); // 'leaderboard', 'events', 'tournament'
    const limit = parseInt(searchParams.get('limit') || '100');
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

    // Determine topic ID from type if not provided
    let finalTopicId = topicId;
    if (!finalTopicId && topicType) {
      switch (topicType.toLowerCase()) {
        case 'leaderboard':
          finalTopicId = LEADERBOARD_TOPIC;
          break;
        case 'events':
        case 'game_events':
          finalTopicId = GAME_EVENTS_TOPIC;
          break;
        case 'tournament':
          finalTopicId = TOURNAMENT_TOPIC;
          break;
      }
    }

    if (!finalTopicId) {
      return NextResponse.json(
        { error: 'topicId or type is required' },
        { status: 400 }
      );
    }

    // Validate topic ID format
    if (!finalTopicId.match(/^\d+\.\d+\.\d+$/)) {
      return NextResponse.json(
        { error: 'Invalid topic ID format. Expected: 0.0.xxxxx' },
        { status: 400 }
      );
    }

    // Get messages from Mirror Node
    const messages = await mirrorNode.getTopicMessages(finalTopicId, limit, order);

    // Decode and parse messages
    const parsedMessages = messages.map(msg => {
      const decoded = HederaMirrorNode.decodeMessage(msg.message);
      let parsedContent = null;
      
      try {
        parsedContent = JSON.parse(decoded);
      } catch {
        parsedContent = decoded;
      }

      return {
        consensusTimestamp: msg.consensus_timestamp,
        sequenceNumber: msg.sequence_number,
        payerAccountId: msg.payer_account_id,
        topicId: msg.topic_id,
        message: parsedContent,
        rawMessage: decoded,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        topicId: finalTopicId,
        messages: parsedMessages,
        count: parsedMessages.length,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch HCS messages';
    console.error('Error fetching HCS messages:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
