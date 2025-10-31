import { NextRequest, NextResponse } from 'next/server';
import { mirrorNode } from '@/lib/hedera/mirror-node';

/**
 * GET /api/hedera/transactions
 * Get transaction history for an account using Mirror Node
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId is required' },
        { status: 400 }
      );
    }

    // Validate account ID format
    if (!accountId.match(/^\d+\.\d+\.\d+$/)) {
      return NextResponse.json(
        { error: 'Invalid account ID format. Expected: 0.0.xxxxx' },
        { status: 400 }
      );
    }

    // Get transactions from Mirror Node
    const transactions = await mirrorNode.getTransactionHistory(accountId, limit);

    // Get account info for balance
    const accountInfo = await mirrorNode.getAccountInfo(accountId);

    return NextResponse.json({
      success: true,
      data: {
        accountId,
        balance: accountInfo?.balance?.balance || 0,
        transactions: transactions.map(tx => ({
          transactionId: tx.transaction_id,
          consensusTimestamp: tx.consensus_timestamp,
          transactionHash: tx.transaction_hash,
          type: tx.type,
          result: tx.result,
          fee: tx.charged_tx_fee,
          memo: tx.memo_base64 ? Buffer.from(tx.memo_base64, 'base64').toString('utf-8') : null,
          payerAccountId: tx.payer_account_id,
        })),
        count: transactions.length,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transactions';
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
