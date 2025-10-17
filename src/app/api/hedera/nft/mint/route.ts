import { NextRequest, NextResponse } from 'next/server';
import { HederaNFTService } from '@/lib/hedera/nft';
import { TokenId, PrivateKey, AccountId } from '@hashgraph/sdk';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, tokenId, params, userId } = body;

    if (!type || !tokenId || !params) {
      return NextResponse.json(
        { error: 'type, tokenId, and params are required' },
        { status: 400 }
      );
    }

    const token = TokenId.fromString(tokenId);
    const supplyKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY!);

    let result;

    switch (type) {
      case 'PROFILE':
        result = await HederaNFTService.mintProfileNFT(token, params, supplyKey);
        break;
      case 'GAME_ASSET':
        result = await HederaNFTService.mintGameAssetNFT(token, params, supplyKey);
        break;
      case 'ACHIEVEMENT':
        result = await HederaNFTService.mintAchievementNFT(token, params, supplyKey);
        break;
      case 'TOURNAMENT_PRIZE':
        result = await HederaNFTService.mintTournamentPrizeNFT(token, params, supplyKey);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid NFT type' },
          { status: 400 }
        );
    }

    // Save NFT to database
    if (userId) {
      await prisma.nFT.create({
        data: {
          tokenId: tokenId,
          serialNumber: result.serialNumber.toString(),
          metadata: params,
          owner: params.accountId || process.env.HEDERA_ACCOUNT_ID!,
          userId: userId,
          category: type,
          rarity: params.rarity || 'COMMON',
          attributes: params.attributes || {},
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        txId: result.txId,
        serialNumber: result.serialNumber,
        tokenId: tokenId,
      },
    });
  } catch (error: any) {
    console.error('Error minting NFT:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mint NFT' },
      { status: 500 }
    );
  }
}
