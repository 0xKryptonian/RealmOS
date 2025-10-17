import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { HederaConsensusService } from '@/lib/hedera/consensus';
import { RewardDistributorAgent } from '@/lib/agents/reward-distributor';
import { TokenId } from '@hashgraph/sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, gameId, score, metadata } = body;

    if (!userId || !gameId || score === undefined) {
      return NextResponse.json(
        { error: 'userId, gameId, and score are required' },
        { status: 400 }
      );
    }

    // Get user and game
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!user || !game) {
      return NextResponse.json(
        { error: 'User or game not found' },
        { status: 404 }
      );
    }

    // Save score to database
    const gameScore = await prisma.gameScore.create({
      data: {
        userId,
        gameId,
        score,
        metadata,
      },
    });

    // Submit to HCS for immutable leaderboard
    let hcsTxId;
    if (process.env.LEADERBOARD_TOPIC_ID) {
      try {
        const topicId = TokenId.fromString(process.env.LEADERBOARD_TOPIC_ID);
        const hcsResult = await HederaConsensusService.submitLeaderboardScore(
          topicId as any,
          {
            userId,
            gameId,
            score,
            username: user.username || user.name || 'Anonymous',
            metadata,
          }
        );
        hcsTxId = hcsResult.txId;

        // Update game score with HCS transaction hash
        await prisma.gameScore.update({
          where: { id: gameScore.id },
          data: { txHash: hcsTxId },
        });
      } catch (error) {
        console.error('Failed to submit to HCS:', error);
      }
    }

    // Check for high score and distribute rewards
    const userGame = await prisma.userGame.findUnique({
      where: {
        gameId_userId: {
          gameId,
          userId,
        },
      },
    });

    let rewardTxId;
    let rewardAmount = 0;

    if (!userGame || score > userGame.highScore) {
      // New high score! Distribute reward
      if (user.hederaAccountId && process.env.REALM_TOKEN_ID) {
        try {
          const rewardAgent = new RewardDistributorAgent(
            process.env.REALM_TOKEN_ID,
            process.env.HEDERA_PRIVATE_KEY
          );

          const reward = await rewardAgent.processHighScoreReward(
            userId,
            user.hederaAccountId,
            gameId,
            score,
            userGame?.highScore || 0
          );

          rewardTxId = reward.txId;
          rewardAmount = reward.amount;

          // Update user balance
          await prisma.user.update({
            where: { id: userId },
            data: {
              realmBalance: {
                increment: rewardAmount,
              },
            },
          });
        } catch (error) {
          console.error('Failed to distribute reward:', error);
        }
      }

      // Update or create user game record
      await prisma.userGame.upsert({
        where: {
          gameId_userId: {
            gameId,
            userId,
          },
        },
        create: {
          gameId,
          userId,
          score,
          highScore: score,
          playCount: 1,
          lastPlayedAt: new Date(),
        },
        update: {
          highScore: score,
          playCount: {
            increment: 1,
          },
          lastPlayedAt: new Date(),
        },
      });
    } else {
      // Just update play count
      await prisma.userGame.update({
        where: {
          gameId_userId: {
            gameId,
            userId,
          },
        },
        data: {
          playCount: {
            increment: 1,
          },
          lastPlayedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        scoreId: gameScore.id,
        score,
        isHighScore: !userGame || score > userGame.highScore,
        hcsTxId,
        reward: rewardAmount > 0 ? {
          amount: rewardAmount,
          txId: rewardTxId,
        } : null,
      },
    });
  } catch (error: any) {
    console.error('Error submitting score:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit score' },
      { status: 500 }
    );
  }
}
