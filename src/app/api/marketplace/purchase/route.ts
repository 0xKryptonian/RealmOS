import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/marketplace/purchase
 * Marks a listing as SOLD after a successful on-chain purchase executed by the client.
 * This does NOT execute the blockchain transfer; it only updates application state.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, buyerAccountId, txId } = body as {
      listingId: string;
      buyerAccountId: string;
      txId?: string;
    };

    if (!listingId || !buyerAccountId) {
      return NextResponse.json(
        { error: 'listingId and buyerAccountId are required' },
        { status: 400 }
      );
    }

    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: listingId },
      include: { nft: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (listing.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Listing is not active' },
        { status: 400 }
      );
    }

    // Update NFT owner to buyer and mark listing as SOLD
    const [updatedListing, updatedNft] = await prisma.$transaction([
      prisma.marketplaceListing.update({
        where: { id: listingId },
        data: {
          status: 'SOLD',
        },
      }),
      prisma.nFT.update({
        where: { id: listing.nftId },
        data: {
          owner: buyerAccountId,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        listing: updatedListing,
        nft: updatedNft,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process marketplace purchase';
    console.error('Error in marketplace purchase:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
