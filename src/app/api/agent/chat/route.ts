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
            output: JSON.parse(JSON.stringify(response)),
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


// import { handleChatBodySchema } from '@/server/schema';
// import { initializeAgent } from '@/server/initialize-agent';
// import { NextRequest } from 'next/server';

// export const runtime = 'nodejs';

// type ResponseData = {
//     message: string;
//     transactionBytes?: string;
// };

// function extractBytesFromAgentResponse(response: any): any {
//     if (
//       response.intermediateSteps &&
//       response.intermediateSteps.length > 0 &&
//       response.intermediateSteps[0].observation
//     ) {
//       const obs = response.intermediateSteps[0].observation;
//       try {
//         const obsObj = typeof obs === 'string' ? JSON.parse(obs) : obs;
//         if (obsObj.bytes) {
//             const bytes = obsObj.bytes;
//             const buffer = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes.data ?? bytes);
//             return buffer.toString('base64');
//         }
//       } catch (e) {
//         console.error('Error parsing observation:', e);
//       }
//     }
//     return undefined;
//   }

// export async function POST(req: NextRequest) {
//     const data = await req.json();
//     const agentExecutor = await initializeAgent(data.userAccountId);
//     const parsedBody = handleChatBodySchema.safeParse(data);
//     if (!parsedBody.success) {
//         return Response.json({ message: 'Invalid body request' });
//     }

//     const body = parsedBody.data;

//     const agentResponse = await agentExecutor.invoke({
//         input: body.input,
//         chat_history: body.history,
//     });
//     const response: ResponseData = {
//         message: agentResponse.output ?? '-',
//     };

//     response.transactionBytes = extractBytesFromAgentResponse(agentResponse);
//     if (response.transactionBytes) {
//         response.message = 'Sign transaction bytes';
//     }

//     return Response.json(response);
// }