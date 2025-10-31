import { NextRequest, NextResponse } from 'next/server';
import { mirrorNode } from '@/lib/hedera/mirror-node';

/**
 * GET /api/hedera/nfts
 * Get NFTs owned by an account using Mirror Node
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');
    const tokenId = searchParams.get('tokenId');

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

    // Get NFTs from Mirror Node
    const nfts = await mirrorNode.getAccountNFTs(accountId, tokenId || undefined);

    return NextResponse.json({
      success: true,
      data: {
        accountId,
        tokenId: tokenId || 'all',
        nfts: nfts.map(nft => ({
          tokenId: nft.token_id,
          serialNumber: nft.serial_number,
          accountId: nft.account_id,
          createdTimestamp: nft.created_timestamp,
          metadata: nft.metadata,
        })),
        count: nfts.length,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch NFTs';
    console.error('Error fetching NFTs:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
