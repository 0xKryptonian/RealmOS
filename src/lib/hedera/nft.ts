import { TokenId, AccountId, PrivateKey } from '@hashgraph/sdk';
import { HederaTokenService } from './token';

export interface NFTMetadata {
  name: string;
  description: string;
  image: string; // IPFS URL
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  animation_url?: string;
}

export interface MintProfileNFTParams {
  username: string;
  bio: string;
  avatarUrl: string;
  accountId: AccountId;
  level?: number;
  achievements?: string[];
}

export interface MintGameAssetNFTParams {
  name: string;
  description: string;
  imageUrl: string;
  gameId: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  attributes?: Record<string, any>;
}

/**
 * NFT-specific operations for HederaVerse
 */
export class HederaNFTService {
  /**
   * Create metadata JSON for NFT
   */
  static createMetadata(metadata: NFTMetadata): string {
    return JSON.stringify(metadata);
  }

  /**
   * Mint a Profile NFT
   */
  static async mintProfileNFT(
    tokenId: TokenId,
    params: MintProfileNFTParams,
    supplyKey: PrivateKey
  ): Promise<{ txId: string; serialNumber: number }> {
    const { username, bio, avatarUrl, level = 1, achievements = [] } = params;

    const metadata: NFTMetadata = {
      name: `${username}'s Profile`,
      description: bio || `Gaming profile for ${username}`,
      image: avatarUrl,
      attributes: [
        { trait_type: 'Username', value: username },
        { trait_type: 'Level', value: level },
        { trait_type: 'Achievements', value: achievements.length },
        { trait_type: 'Type', value: 'Profile' },
      ],
      external_url: `https://hederaverse.io/profile/${username}`,
    };

    const metadataString = this.createMetadata(metadata);
    return HederaTokenService.mintNFT(tokenId, metadataString, supplyKey);
  }

  /**
   * Mint a Game Asset NFT
   */
  static async mintGameAssetNFT(
    tokenId: TokenId,
    params: MintGameAssetNFTParams,
    supplyKey: PrivateKey
  ): Promise<{ txId: string; serialNumber: number }> {
    const { name, description, imageUrl, gameId, rarity, attributes = {} } = params;

    const nftAttributes = [
      { trait_type: 'Game', value: gameId },
      { trait_type: 'Rarity', value: rarity },
      { trait_type: 'Type', value: 'Game Asset' },
    ];

    // Add custom attributes
    Object.entries(attributes).forEach(([key, value]) => {
      nftAttributes.push({
        trait_type: key,
        value: value,
      });
    });

    const metadata: NFTMetadata = {
      name,
      description,
      image: imageUrl,
      attributes: nftAttributes,
      external_url: `https://hederaverse.io/nft/${tokenId}`,
    };

    const metadataString = this.createMetadata(metadata);
    return HederaTokenService.mintNFT(tokenId, metadataString, supplyKey);
  }

  /**
   * Mint an Achievement NFT
   */
  static async mintAchievementNFT(
    tokenId: TokenId,
    params: {
      title: string;
      description: string;
      imageUrl: string;
      achievementType: string;
      earnedBy: string;
      earnedAt: Date;
    },
    supplyKey: PrivateKey
  ): Promise<{ txId: string; serialNumber: number }> {
    const { title, description, imageUrl, achievementType, earnedBy, earnedAt } = params;

    const metadata: NFTMetadata = {
      name: title,
      description,
      image: imageUrl,
      attributes: [
        { trait_type: 'Achievement Type', value: achievementType },
        { trait_type: 'Earned By', value: earnedBy },
        { trait_type: 'Earned At', value: earnedAt.toISOString() },
        { trait_type: 'Type', value: 'Achievement' },
      ],
      external_url: `https://hederaverse.io/achievements`,
    };

    const metadataString = this.createMetadata(metadata);
    return HederaTokenService.mintNFT(tokenId, metadataString, supplyKey);
  }

  /**
   * Mint a Tournament Prize NFT
   */
  static async mintTournamentPrizeNFT(
    tokenId: TokenId,
    params: {
      tournamentName: string;
      position: number;
      imageUrl: string;
      winnerId: string;
      prizeValue?: string;
    },
    supplyKey: PrivateKey
  ): Promise<{ txId: string; serialNumber: number }> {
    const { tournamentName, position, imageUrl, winnerId, prizeValue } = params;

    const positionText = position === 1 ? '1st' : position === 2 ? '2nd' : position === 3 ? '3rd' : `${position}th`;

    const metadata: NFTMetadata = {
      name: `${tournamentName} - ${positionText} Place`,
      description: `Tournament prize for finishing ${positionText} in ${tournamentName}`,
      image: imageUrl,
      attributes: [
        { trait_type: 'Tournament', value: tournamentName },
        { trait_type: 'Position', value: position },
        { trait_type: 'Winner', value: winnerId },
        { trait_type: 'Type', value: 'Tournament Prize' },
      ],
      external_url: `https://hederaverse.io/tournaments`,
    };

    if (prizeValue) {
      metadata.attributes?.push({ trait_type: 'Prize Value', value: prizeValue });
    }

    const metadataString = this.createMetadata(metadata);
    return HederaTokenService.mintNFT(tokenId, metadataString, supplyKey);
  }

  /**
   * Parse NFT metadata from string
   */
  static parseMetadata(metadataString: string): NFTMetadata {
    try {
      return JSON.parse(metadataString);
    } catch (error) {
      throw new Error('Invalid NFT metadata format');
    }
  }

  /**
   * Get rarity multiplier for rewards
   */
  static getRarityMultiplier(rarity: string): number {
    const multipliers: Record<string, number> = {
      COMMON: 1,
      RARE: 2,
      EPIC: 5,
      LEGENDARY: 10,
    };
    return multipliers[rarity] || 1;
  }

  /**
   * Calculate NFT value based on attributes
   */
  static calculateNFTValue(metadata: NFTMetadata): number {
    const rarityAttr = metadata.attributes?.find((attr) => attr.trait_type === 'Rarity');
    const rarity = rarityAttr?.value as string || 'COMMON';
    const baseValue = 10; // Base value in REALM tokens
    return baseValue * this.getRarityMultiplier(rarity);
  }
}
