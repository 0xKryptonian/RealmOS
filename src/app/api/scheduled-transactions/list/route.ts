import { NextRequest, NextResponse } from 'next/server';
import { getScheduledTransactionService } from '@/lib/hedera/scheduled-transaction-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const scheduledTxService = getScheduledTransactionService();
    const scheduledTransactions = await scheduledTxService.getUserScheduledTransactions(userId);

    return NextResponse.json({
      success: true,
      data: scheduledTransactions,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch scheduled transactions';
    console.error('Error fetching scheduled transactions:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
