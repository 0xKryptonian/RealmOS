import { NextRequest, NextResponse } from 'next/server';
import { getScheduledTransactionService } from '@/lib/hedera/scheduled-transaction-service';

/**
 * Monitor and update scheduled transactions
 * This endpoint should be called periodically (e.g., via cron job)
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication/authorization here
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'your-secret-token';

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const scheduledTxService = getScheduledTransactionService();
    await scheduledTxService.monitorScheduledTransactions();

    return NextResponse.json({
      success: true,
      message: 'Scheduled transactions monitored successfully',
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to monitor scheduled transactions';
    console.error('Error monitoring scheduled transactions:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
