import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nftId, sellerId, price, currency, listingType, expiresAt } = body;

    if (!nftId || !sellerId || !price) {
      return NextResponse.json(
        { error: 'nftId, sellerId, and price are required' },
        { status: 400 }
      );
    }

    // Verify NFT ownership
    const nft = await prisma.nFT.findUnique({
      where: { id: nftId },
    });

    if (!nft) {
      return NextResponse.json(
        { error: 'NFT not found' },
        { status: 404 }
      );
    }

    if (nft.userId !== sellerId) {
      return NextResponse.json(
        { error: 'You do not own this NFT' },
        { status: 403 }
      );
    }

    // Check for existing active listing
    const existingListing = await prisma.marketplaceListing.findFirst({
      where: {
        nftId,
        status: 'ACTIVE',
      },
    });

    if (existingListing) {
      return NextResponse.json(
        { error: 'NFT is already listed' },
        { status: 400 }
      );
    }

    // Create listing
    const listing = await prisma.marketplaceListing.create({
      data: {
        nftId,
        sellerId,
        price: price.toString(),
        currency: currency || 'HBAR',
        status: 'ACTIVE',
        listingType: listingType || 'FIXED_PRICE',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        nft: true,
        seller: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: listing,
    });
  } catch (error: any) {
    console.error('Error creating marketplace listing:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create listing' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'ACTIVE';
    const category = searchParams.get('category');
    const rarity = searchParams.get('rarity');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = { status };

    if (category || rarity) {
      where.nft = {};
      if (category) where.nft.category = category;
      if (rarity) where.nft.rarity = rarity;
    }

    const [listings, total] = await Promise.all([
      prisma.marketplaceListing.findMany({
        where,
        include: {
          nft: true,
          seller: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.marketplaceListing.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        listings,
        total,
        limit,
        offset,
      },
    });
  } catch (error: any) {
    console.error('Error fetching marketplace listings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}
