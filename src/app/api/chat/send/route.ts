import { NextRequest, NextResponse } from 'next/server';
import { HederaConsensusService } from '@/lib/hedera/consensus';
import { TopicId } from '@hashgraph/sdk';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message, sender } = body;

        if (!message || !sender) {
            return NextResponse.json(
                { error: 'Message and sender are required' },
                { status: 400 }
            );
        }

        const topicIdStr = process.env.NEXT_PUBLIC_GLOBAL_CHAT_TOPIC_ID;
        if (!topicIdStr) {
            return NextResponse.json(
                { error: 'Chat topic not configured' },
                { status: 500 }
            );
        }

        // Subsidized submission via platform operator
        const result = await HederaConsensusService.submitMessage({
            topicId: TopicId.fromString(topicIdStr),
            message: {
                text: message,
                sender: sender,
                timestamp: Date.now()
            }
        });

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('Error sending chat message:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}
