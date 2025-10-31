import { NextRequest, NextResponse } from 'next/server';
import { getScheduledTransactionService } from '@/lib/hedera/scheduled-transaction-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, userId, accountId, amount, executionDate, tournamentData } = body;

    if (!type || !userId) {
      return NextResponse.json(
        { error: 'type and userId are required' },
        { status: 400 }
      );
    }

    const scheduledTxService = getScheduledTransactionService();

    if (type === 'daily_reward') {
      if (!accountId || !amount) {
        return NextResponse.json(
          { error: 'accountId and amount are required for daily rewards' },
          { status: 400 }
        );
      }

      const executionTime = executionDate ? new Date(executionDate) : new Date();
      
      const scheduledTx = await scheduledTxService.scheduleDailyReward(
        userId,
        accountId,
        Number(amount),
        executionTime
      );

      return NextResponse.json({
        success: true,
        data: scheduledTx,
      });
    }

    if (type === 'tournament_prizes') {
      if (!tournamentData) {
        return NextResponse.json(
          { error: 'tournamentData is required for tournament prizes' },
          { status: 400 }
        );
      }

      const scheduledTxs = await scheduledTxService.scheduleTournamentPrizes({
        tournamentId: tournamentData.tournamentId,
        winners: tournamentData.winners,
        distributionDate: new Date(tournamentData.distributionDate),
      });

      return NextResponse.json({
        success: true,
        data: scheduledTxs,
      });
    }

    return NextResponse.json(
      { error: 'Invalid transaction type' },
      { status: 400 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create scheduled transaction';
    console.error('Error creating scheduled transaction:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
