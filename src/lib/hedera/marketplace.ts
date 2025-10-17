import { TokenId, AccountId, PrivateKey, Hbar, TransferTransaction } from '@hashgraph/sdk';
import { HederaClient } from './client';
import { HederaTokenService } from './token';

export interface CreateListingParams {
  nftTokenId: TokenId;
  serialNumber: number;
  price: number; // in HBAR
  sellerAccountId: AccountId;
  listingType: 'FIXED_PRICE' | 'AUCTION';
  expiresAt?: Date;
}

export interface PurchaseNFTParams {
  nftTokenId: TokenId;
  serialNumber: number;
  price: number; // in HBAR
  sellerAccountId: AccountId;
  buyerAccountId: AccountId;
  buyerPrivateKey: PrivateKey;
}

/**
 * NFT Marketplace operations on Hedera
 */
export class HederaMarketplaceService {
  /**
   * Purchase NFT with HBAR
   * Atomic swap: HBAR transfer + NFT transfer
   */
  static async purchaseNFT(params: PurchaseNFTParams): Promise<string> {
    const client = HederaClient.getClient();
    const {
      nftTokenId,
      serialNumber,
      price,
      sellerAccountId,
      buyerAccountId,
      buyerPrivateKey,
    } = params;

    // Create atomic transaction: HBAR to seller, NFT to buyer
    const transaction = new TransferTransaction()
      // Transfer HBAR from buyer to seller
      .addHbarTransfer(buyerAccountId, new Hbar(-price))
      .addHbarTransfer(sellerAccountId, new Hbar(price))
      // Transfer NFT from seller to buyer
      .addNftTransfer(nftTokenId, serialNumber, sellerAccountId, buyerAccountId);

    // Sign with buyer's key
    const signedTx = await transaction.freezeWith(client).sign(buyerPrivateKey);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    console.log(`✅ NFT purchased: ${nftTokenId.toString()} #${serialNumber}`);
    return txResponse.transactionId.toString();
  }

  /**
   * Purchase NFT with REALM tokens
   */
  static async purchaseNFTWithToken(
    nftTokenId: TokenId,
    serialNumber: number,
    price: number,
    paymentTokenId: TokenId,
    sellerAccountId: AccountId,
    buyerAccountId: AccountId,
    buyerPrivateKey: PrivateKey
  ): Promise<string> {
    const client = HederaClient.getClient();

    // Create atomic transaction: Tokens to seller, NFT to buyer
    const transaction = new TransferTransaction()
      // Transfer tokens from buyer to seller
      .addTokenTransfer(paymentTokenId, buyerAccountId, -price)
      .addTokenTransfer(paymentTokenId, sellerAccountId, price)
      // Transfer NFT from seller to buyer
      .addNftTransfer(nftTokenId, serialNumber, sellerAccountId, buyerAccountId);

    const signedTx = await transaction.freezeWith(client).sign(buyerPrivateKey);
    const txResponse = await signedTx.execute(client);
    await txResponse.getReceipt(client);

    console.log(`✅ NFT purchased with tokens: ${nftTokenId.toString()} #${serialNumber}`);
    return txResponse.transactionId.toString();
  }

  /**
   * Calculate marketplace fee (2.5% platform fee)
   */
  static calculateMarketplaceFee(price: number): number {
    const FEE_PERCENTAGE = 0.025; // 2.5%
    return price * FEE_PERCENTAGE;
  }

  /**
   * Calculate seller proceeds after fees
   */
  static calculateSellerProceeds(price: number): number {
    const fee = this.calculateMarketplaceFee(price);
    return price - fee;
  }

  /**
   * Calculate royalty payment
   */
  static calculateRoyalty(price: number, royaltyPercentage: number): number {
    return price * (royaltyPercentage / 100);
  }

  /**
   * Execute marketplace sale with fees and royalties
   */
  static async executeSaleWithFees(params: {
    nftTokenId: TokenId;
    serialNumber: number;
    price: number;
    sellerAccountId: AccountId;
    buyerAccountId: AccountId;
    buyerPrivateKey: PrivateKey;
    platformAccountId: AccountId;
    royaltyAccountId?: AccountId;
    royaltyPercentage?: number;
  }): Promise<string> {
    const client = HederaClient.getClient();
    const {
      nftTokenId,
      serialNumber,
      price,
      sellerAccountId,
      buyerAccountId,
      buyerPrivateKey,
      platformAccountId,
      royaltyAccountId,
      royaltyPercentage = 0,
    } = params;

    const platformFee = this.calculateMarketplaceFee(price);
    const royaltyAmount = royaltyAccountId ? this.calculateRoyalty(price, royaltyPercentage) : 0;
    const sellerAmount = price - platformFee - royaltyAmount;

    const transaction = new TransferTransaction()
      // Buyer pays total price
      .addHbarTransfer(buyerAccountId, new Hbar(-price))
      // Platform receives fee
      .addHbarTransfer(platformAccountId, new Hbar(platformFee))
      // Seller receives proceeds
      .addHbarTransfer(sellerAccountId, new Hbar(sellerAmount))
      // NFT goes to buyer
      .addNftTransfer(nftTokenId, serialNumber, sellerAccountId, buyerAccountId);

    // Add royalty payment if applicable
    if (royaltyAccountId && royaltyAmount > 0) {
      transaction.addHbarTransfer(royaltyAccountId, new Hbar(royaltyAmount));
    }

    const signedTx = await transaction.freezeWith(client).sign(buyerPrivateKey);
    const txResponse = await signedTx.execute(client);
    await txResponse.getReceipt(client);

    console.log(`✅ Sale executed with fees: ${nftTokenId.toString()} #${serialNumber}`);
    return txResponse.transactionId.toString();
  }
}
