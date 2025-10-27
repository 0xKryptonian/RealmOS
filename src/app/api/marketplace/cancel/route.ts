import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json(
        { error: 'listingId is required' },
        { status: 400 }
      );
    }

    // Get listing
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

    // Update listing status
    const updatedListing = await prisma.marketplaceListing.update({
      where: { id: listingId },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({
      success: true,
      data: updatedListing,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to cancel listing';
    console.error('Error cancelling listing:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
