import { NextRequest, NextResponse } from 'next/server';
import { HederaNFTService } from '@/lib/hedera/nft';
import { HederaTokenService } from '@/lib/hedera/token';
import { getOperatorId, getOperatorKey } from '@/lib/hedera/client';
import { TokenId, PrivateKey, AccountId } from '@hashgraph/sdk';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, tokenId, params, userId, metadataPointer, recipientAccountId } = body as {
      type?: string;
      tokenId: string;
      params?: any;
      userId?: string;
      metadataPointer?: string; // compact pointer string (e.g., "hfs:0.0.123456")
      recipientAccountId?: string; // user wallet to receive NFT
    };

    if (!tokenId) {
      return NextResponse.json(
        { error: 'tokenId is required' },
        { status: 400 }
      );
    }

    const token = TokenId.fromString(tokenId);
    // Prefer token-specific supply key if provided; fallback to generic NFT_SUPPLY_KEY; then operator/legacy
    const supplyKeyStr =
      process.env.GAME_NFT_SUPPLY_KEY ||
      process.env.NFT_SUPPLY_KEY ||
      process.env.HEDERA_OPERATOR_KEY ||
      process.env.HEDERA_PRIVATE_KEY || '';
    const supplyKey = PrivateKey.fromString(supplyKeyStr);

    // Verify provided supply key matches the token's registered supplyKey
    try {
      const info = await HederaTokenService.getTokenInfo(token);
      const onChainSupplyKey = info.supplyKey?.toString();
      const providedPubKey = supplyKey.publicKey.toString();
      if (onChainSupplyKey && !onChainSupplyKey.includes(providedPubKey)) {
        return NextResponse.json(
          {
            error: 'SUPPLY_KEY_MISMATCH',
            details: {
              message: 'Provided supply key does not match token\'s supplyKey',
              tokenId,
              expected: onChainSupplyKey,
              provided: providedPubKey.slice(0, 16) + '...'
            },
          },
          { status: 400 }
        );
      }
    } catch (e) {
      // Non-fatal: if we cannot fetch info, proceed and let network validate
      console.warn('[mint] Could not verify token supplyKey, proceeding...', e);
    }

    // Fast-path: if a compact metadata pointer is supplied, use it directly to avoid size limits
    if (metadataPointer && metadataPointer.length <= 100) {
      const result = await HederaTokenService.mintNFT(token, metadataPointer, supplyKey);

      // Optional immediate transfer to recipient
      let transferTxId: string | undefined;
      let transferError: string | undefined;
      if (recipientAccountId) {
        try {
          const info = await HederaTokenService.getTokenInfo(token);
          const treasuryId = info.treasuryAccountId as AccountId;
          const operatorId = getOperatorId();
          
          console.log('[mint] Transfer attempt:', {
            treasury: treasuryId.toString(),
            operator: operatorId.toString(),
            recipient: recipientAccountId,
            serial: result.serialNumber,
          });

          // Only transfer if operator is treasury (has the key)
          if (operatorId.toString() === treasuryId.toString()) {
            transferTxId = await HederaTokenService.transferNFT(
              token,
              result.serialNumber,
              treasuryId,
              AccountId.fromString(recipientAccountId),
              getOperatorKey()
            );
            console.log('[mint] Transfer successful:', transferTxId);
          } else {
            transferError = `Operator ${operatorId.toString()} is not treasury ${treasuryId.toString()}. NFT remains in treasury. User must claim via marketplace or admin transfer.`;
            console.warn('[mint]', transferError);
          }
        } catch (e: any) {
          transferError = e?.message || 'Transfer failed';
          console.error('[mint] Transfer to recipient failed:', e);
        }
      }

      // Optional DB write if userId provided
      let dbWarning: string | undefined;
      const owner = recipientAccountId || params?.accountId || process.env.HEDERA_OPERATOR_ID || '';
      if (userId) {
        try {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          const data = {
            tokenId: tokenId,
            serialNumber: result.serialNumber.toString(),
            metadata: { pointer: metadataPointer },
            owner,
            category: type || 'GAME_ASSET',
            rarity: params?.rarity || 'COMMON',
            attributes: params?.attributes || {},
            userId: user ? userId : undefined,
          } as any;
          if (!user) dbWarning = 'User not found; NFT stored without user link.';
          await prisma.nFT.create({ data });
        } catch (e: any) {
          // If FK fails, retry without userId and keep mint success
          try {
            await prisma.nFT.create({
              data: {
                tokenId: tokenId,
                serialNumber: result.serialNumber.toString(),
                metadata: { pointer: metadataPointer },
                owner,
                category: type || 'GAME_ASSET',
                rarity: params?.rarity || 'COMMON',
                attributes: params?.attributes || {},
              },
            });
            dbWarning = 'DB relation failed; NFT stored without user link.';
          } catch (e2) {
            console.warn('[mint] Failed to persist NFT record, continuing. Error:', e2);
            dbWarning = 'DB write failed; on-chain mint succeeded.';
          }
        }
      }

      return NextResponse.json({
        success: true,
        data: {
          txId: result.txId,
          serialNumber: result.serialNumber,
          tokenId,
          transferTxId,
          transferError,
        },
        warning: dbWarning,
      });
    }

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

    // Optional immediate transfer to recipient
    let transferTxId: string | undefined;
    let transferError: string | undefined;
    if (recipientAccountId) {
      try {
        const info = await HederaTokenService.getTokenInfo(token);
        const treasuryId = info.treasuryAccountId as AccountId;
        const operatorId = getOperatorId();
        
        console.log('[mint] Transfer attempt:', {
          treasury: treasuryId.toString(),
          operator: operatorId.toString(),
          recipient: recipientAccountId,
          serial: result.serialNumber,
        });

        // Only transfer if operator is treasury (has the key)
        if (operatorId.toString() === treasuryId.toString()) {
          transferTxId = await HederaTokenService.transferNFT(
            token,
            result.serialNumber,
            treasuryId,
            AccountId.fromString(recipientAccountId),
            getOperatorKey()
          );
          console.log('[mint] Transfer successful:', transferTxId);
        } else {
          transferError = `Operator ${operatorId.toString()} is not treasury ${treasuryId.toString()}. NFT remains in treasury. User must claim via marketplace or admin transfer.`;
          console.warn('[mint]', transferError);
        }
      } catch (e: any) {
        transferError = e?.message || 'Transfer failed';
        console.error('[mint] Transfer to recipient failed:', e);
      }
    }

    // Save NFT to database (resilient)
    let dbWarning: string | undefined;
    const owner = recipientAccountId || params?.accountId || process.env.HEDERA_OPERATOR_ID || '';
    if (userId) {
      try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const data = {
          tokenId: tokenId,
          serialNumber: result.serialNumber.toString(),
          metadata: params,
          owner,
          category: type,
          rarity: params?.rarity || 'COMMON',
          attributes: params?.attributes || {},
          userId: user ? userId : undefined,
        } as any;
        if (!user) dbWarning = 'User not found; NFT stored without user link.';
        await prisma.nFT.create({ data });
      } catch (e: any) {
        try {
          await prisma.nFT.create({
            data: {
              tokenId: tokenId,
              serialNumber: result.serialNumber.toString(),
              metadata: params,
              owner,
              category: type,
              rarity: params?.rarity || 'COMMON',
              attributes: params?.attributes || {},
            },
          });
          dbWarning = 'DB relation failed; NFT stored without user link.';
        } catch (e2) {
          console.warn('[mint] Failed to persist NFT record, continuing. Error:', e2);
          dbWarning = 'DB write failed; on-chain mint succeeded.';
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        txId: result.txId,
        serialNumber: result.serialNumber,
        tokenId: tokenId,
        transferTxId,
        transferError,
      },
      warning: dbWarning,
    });
  } catch (error: any) {
    console.error('Error minting NFT:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mint NFT' },
      { status: 500 }
    );
  }
}
