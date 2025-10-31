import {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenBurnTransaction,
  TransferTransaction,
  AccountId,
  PrivateKey,
  TokenId,
  TokenInfoQuery,
  AccountBalanceQuery,
  TokenAssociateTransaction,
  Hbar,
} from '@hashgraph/sdk';
import { HederaClient } from './client';

export interface CreateTokenParams {
  name: string;
  symbol: string;
  decimals?: number;
  initialSupply?: number;
  maxSupply?: number;
  treasuryId?: AccountId;
  adminKey?: PrivateKey;
  supplyKey?: PrivateKey;
  freezeKey?: PrivateKey;
  wipeKey?: PrivateKey;
}

export interface MintTokenParams {
  tokenId: TokenId;
  amount: number;
  supplyKey: PrivateKey;
}

export interface TransferTokenParams {
  tokenId: TokenId;
  fromAccountId: AccountId;
  toAccountId: AccountId;
  amount: number;
  fromPrivateKey?: PrivateKey;
}

/**
 * Hedera Token Service (HTS) operations
 */
export class HederaTokenService {
  /**
   * Create a new fungible token
   */
  static async createFungibleToken(params: CreateTokenParams): Promise<TokenId> {
    const client = HederaClient.getClient();
    const operatorId = HederaClient.getOperatorId();
    const operatorKey = HederaClient.getOperatorKey();

    const {
      name,
      symbol,
      decimals = 8,
      initialSupply = 0,
      maxSupply,
      treasuryId = operatorId,
      adminKey = operatorKey,
      supplyKey = operatorKey,
    } = params;

    const transaction = new TokenCreateTransaction()
      .setTokenName(name)
      .setTokenSymbol(symbol)
      .setDecimals(decimals)
      .setInitialSupply(initialSupply)
      .setTreasuryAccountId(treasuryId)
      .setAdminKey(adminKey)
      .setSupplyKey(supplyKey)
      .setTokenType(TokenType.FungibleCommon)
      .setMaxTransactionFee(new Hbar(30)); // Increase max fee for token creation

    if (maxSupply) {
      transaction.setSupplyType(TokenSupplyType.Finite);
      transaction.setMaxSupply(maxSupply);
    } else {
      transaction.setSupplyType(TokenSupplyType.Infinite);
    }

    // Freeze the transaction and sign
    const txResponse = await transaction.freezeWith(client).execute(client);
    const receipt = await txResponse.getReceipt(client);
    const tokenId = receipt.tokenId;

    if (!tokenId) {
      throw new Error('Token creation failed: No token ID returned');
    }

    console.log(`✅ Created fungible token: ${tokenId.toString()}`);
    return tokenId;
  }

  /**
   * Create a new NFT collection
   */
  static async createNFTCollection(params: Omit<CreateTokenParams, 'decimals' | 'initialSupply'>): Promise<TokenId> {
    const client = HederaClient.getClient();
    const operatorId = HederaClient.getOperatorId();
    const operatorKey = HederaClient.getOperatorKey();

    const {
      name,
      symbol,
      maxSupply,
      treasuryId = operatorId,
      adminKey = operatorKey,
      supplyKey = operatorKey,
    } = params;

    const transaction = new TokenCreateTransaction()
      .setTokenName(name)
      .setTokenSymbol(symbol)
      .setTokenType(TokenType.NonFungibleUnique)
      .setTreasuryAccountId(treasuryId)
      .setAdminKey(adminKey)
      .setSupplyKey(supplyKey)
      .setMaxTransactionFee(new Hbar(30)); // Increase max fee for NFT collection creation

    if (maxSupply) {
      transaction.setSupplyType(TokenSupplyType.Finite);
      transaction.setMaxSupply(maxSupply);
    } else {
      transaction.setSupplyType(TokenSupplyType.Infinite);
    }

    const txResponse = await transaction.freezeWith(client).execute(client);
    const receipt = await txResponse.getReceipt(client);
    const tokenId = receipt.tokenId;

    if (!tokenId) {
      throw new Error('NFT collection creation failed: No token ID returned');
    }

    console.log(`✅ Created NFT collection: ${tokenId.toString()}`);
    return tokenId;
  }

  /**
   * Mint fungible tokens
   */
  static async mintFungibleToken(params: MintTokenParams): Promise<string> {
    const client = HederaClient.getClient();
    const { tokenId, amount, supplyKey } = params;

    const transaction = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .setAmount(amount)
      .freezeWith(client);

    const signedTx = await transaction.sign(supplyKey);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    console.log(`✅ Minted ${amount} tokens of ${tokenId.toString()}`);
    return txResponse.transactionId.toString();
  }

  /**
   * Mint NFT with metadata
   */
  static async mintNFT(tokenId: TokenId, metadata: string, supplyKey: PrivateKey): Promise<{ txId: string; serialNumber: number }> {
    const client = HederaClient.getClient();

    // Convert metadata to bytes
    const metadataBytes = Buffer.from(metadata);

    const transaction = await new TokenMintTransaction()
      .setTokenId(tokenId)
      .addMetadata(metadataBytes)
      .freezeWith(client);

    const signedTx = await transaction.sign(supplyKey);
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    const serialNumber = receipt.serials[0].toNumber();

    console.log(`✅ Minted NFT ${tokenId.toString()} #${serialNumber}`);
    return {
      txId: txResponse.transactionId.toString(),
      serialNumber,
    };
  }

  /**
   * Transfer tokens between accounts
   */
  static async transferToken(params: TransferTokenParams): Promise<string> {
    const client = HederaClient.getClient();
    const { tokenId, fromAccountId, toAccountId, amount, fromPrivateKey } = params;

    const transaction = new TransferTransaction()
      .addTokenTransfer(tokenId, fromAccountId, -amount)
      .addTokenTransfer(tokenId, toAccountId, amount);

    if (fromPrivateKey) {
      const signedTx = await transaction.freezeWith(client).sign(fromPrivateKey);
      const txResponse = await signedTx.execute(client);
      const receipt = await txResponse.getReceipt(client);
      return txResponse.transactionId.toString();
    } else {
      const txResponse = await transaction.execute(client);
      const receipt = await txResponse.getReceipt(client);
      return txResponse.transactionId.toString();
    }
  }

  /**
   * Transfer NFT between accounts
   */
  static async transferNFT(
    tokenId: TokenId,
    serialNumber: number,
    fromAccountId: AccountId,
    toAccountId: AccountId,
    fromPrivateKey?: PrivateKey
  ): Promise<string> {
    const client = HederaClient.getClient();

    const transaction = new TransferTransaction()
      .addNftTransfer(tokenId, serialNumber, fromAccountId, toAccountId);

    if (fromPrivateKey) {
      const signedTx = await transaction.freezeWith(client).sign(fromPrivateKey);
      const txResponse = await signedTx.execute(client);
      await txResponse.getReceipt(client);
      return txResponse.transactionId.toString();
    } else {
      const txResponse = await transaction.execute(client);
      await txResponse.getReceipt(client);
      return txResponse.transactionId.toString();
    }
  }

  /**
   * Associate token with account
   */
  static async associateToken(accountId: AccountId, tokenId: TokenId, accountKey: PrivateKey): Promise<string> {
    const client = HederaClient.getClient();

    const transaction = await new TokenAssociateTransaction()
      .setAccountId(accountId)
      .setTokenIds([tokenId])
      .freezeWith(client);

    const signedTx = await transaction.sign(accountKey);
    const txResponse = await signedTx.execute(client);
    await txResponse.getReceipt(client);

    console.log(`✅ Associated token ${tokenId.toString()} with account ${accountId.toString()}`);
    return txResponse.transactionId.toString();
  }

  /**
   * Get token info
   */
  static async getTokenInfo(tokenId: TokenId) {
    const client = HederaClient.getClient();
    const query = new TokenInfoQuery().setTokenId(tokenId);
    const tokenInfo = await query.execute(client);
    return tokenInfo;
  }

  /**
   * Get account token balance
   */
  static async getAccountBalance(accountId: AccountId, tokenId?: TokenId): Promise<any> {
    const client = HederaClient.getClient();
    const query = new AccountBalanceQuery().setAccountId(accountId);
    const balance = await query.execute(client);

    if (tokenId) {
      return balance.tokens?.get(tokenId) || 0;
    }

    return {
      hbar: balance.hbars.toString(),
      tokens: balance.tokens,
    };
  }
}
