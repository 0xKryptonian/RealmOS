import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { HederaConsensusService } from '@/lib/hedera/consensus';
import { RewardDistributorAgent } from '@/lib/agents/reward-distributor';
import { TopicId } from '@hashgraph/sdk';
import { LEADERBOARD_TOPIC } from '@/lib/constants';

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

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get or create game (using slug as gameId)
    let game = await prisma.game.findFirst({
      where: {
        OR: [
          { id: gameId },
          { slug: gameId },
        ],
      },
    });

    if (!game) {
      // Auto-create game if it doesn't exist
      const gameNames: Record<string, string> = {
        tetris: 'Tetris',
        chess: 'Chess',
        sudoku: 'Sudoku',
        wordle: 'Wordle',
        'crypto-crossword': 'Crypto Crossword',
        'snake-ladder': 'Snake & Ladder',
        'candy-saga': 'Candy Saga',
      };

      game = await prisma.game.create({
        data: {
          name: gameNames[gameId] || gameId.charAt(0).toUpperCase() + gameId.slice(1),
          slug: gameId,
          description: `Play ${gameNames[gameId] || gameId} and earn REALM tokens!`,
        },
      });
    }

    // Save score to database
    const gameScore = await prisma.gameScore.create({
      data: {
        userId,
        gameId: game.id, // Use the actual game ID from database
        score,
        metadata,
      },
    });

    // Submit to HCS for immutable leaderboard
    let hcsTxId;
    try {
      const topicString = process.env.LEADERBOARD_TOPIC_ID || LEADERBOARD_TOPIC;
      if (topicString) {
        const topicId = TopicId.fromString(topicString);
        const hcsResult = await HederaConsensusService.submitLeaderboardScore(
          topicId,
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
      }
    } catch (error) {
      console.error('Failed to submit to HCS:', error);
    }

    // Check for high score and distribute rewards
    const userGame = await prisma.userGame.findUnique({
      where: {
        gameId_userId: {
          gameId: game.id, // Use actual database ID, not slug
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
            gameId: game.id, // Use actual database ID, not slug
            userId,
          },
        },
        create: {
          gameId: game.id, // Use actual database ID, not slug
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
            gameId: game.id, // Use actual database ID, not slug
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
  } catch (error: unknown) {
    console.error('Error submitting score:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit score';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
