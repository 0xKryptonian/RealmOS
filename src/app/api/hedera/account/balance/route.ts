import { NextRequest, NextResponse } from 'next/server';
import { HederaAccountService } from '@/lib/hedera/account';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId is required' },
        { status: 400 }
      );
    }

    const balance = await HederaAccountService.getAccountBalance(accountId);

    return NextResponse.json({
      success: true,
      data: balance,
    });
  } catch (error: any) {
    console.error('Error fetching account balance:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch account balance' },
      { status: 500 }
    );
  }
}
