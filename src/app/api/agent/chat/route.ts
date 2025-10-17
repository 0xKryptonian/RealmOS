import { NextRequest, NextResponse } from 'next/server';
import { AgentFactory } from '@/lib/agents';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, agentType, userId, context } = body;

    if (!message || !agentType) {
      return NextResponse.json(
        { error: 'message and agentType are required' },
        { status: 400 }
      );
    }

    let agent;
    let response;

    switch (agentType) {
      case 'GAME_ASSISTANT':
        agent = AgentFactory.getGameAssistant();
        response = await agent.processMessage(message, context);
        break;

      case 'TOURNAMENT_MANAGER':
        agent = AgentFactory.getTournamentManager();
        response = await agent.processMessage(message, context);
        break;

      case 'REWARD_DISTRIBUTOR':
        agent = AgentFactory.getRewardDistributor(
          process.env.REALM_TOKEN_ID,
          process.env.HEDERA_PRIVATE_KEY
        );
        response = await agent.processMessage(message, context);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid agent type' },
          { status: 400 }
        );
    }

    // Log interaction to database
    if (userId) {
      try {
        // Find or create agent record
        let agentRecord = await prisma.aIAgent.findFirst({
          where: { type: agentType },
        });

        if (!agentRecord) {
          agentRecord = await prisma.aIAgent.create({
            data: {
              name: agentType.replace('_', ' '),
              type: agentType,
              status: 'ACTIVE',
              config: {},
            },
          });
        }

        await prisma.agentInteraction.create({
          data: {
            agentId: agentRecord.id,
            userId,
            type: 'CHAT',
            input: { message, context },
            output: response,
            status: 'COMPLETED',
            cost: response.cost || 0,
          },
        });
      } catch (error) {
        console.error('Failed to log agent interaction:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error('Error processing agent chat:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process agent chat' },
      { status: 500 }
    );
  }
}
