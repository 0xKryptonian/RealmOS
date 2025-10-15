import {
  AccountCreateTransaction,
  AccountBalanceQuery,
  AccountInfoQuery,
  TransferTransaction,
  AccountId,
  PrivateKey,
  Hbar,
  PublicKey,
} from '@hashgraph/sdk';
import { HederaClient } from './client';

export interface CreateAccountParams {
  initialBalance?: number; // in HBAR
  publicKey?: string;
}

/**
 * Hedera Account operations
 */
export class HederaAccountService {
  /**
   * Create a new Hedera account
   */
  static async createAccount(params: CreateAccountParams = {}): Promise<{
    accountId: string;
    privateKey: string;
    publicKey: string;
  }> {
    const client = HederaClient.getClient();
    const { initialBalance = 0 } = params;

    // Generate new key pair
    const newPrivateKey = PrivateKey.generateED25519();
    const newPublicKey = newPrivateKey.publicKey;

    // Create account
    const transaction = new AccountCreateTransaction()
      .setKey(newPublicKey)
      .setInitialBalance(new Hbar(initialBalance));

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const newAccountId = receipt.accountId;

    if (!newAccountId) {
      throw new Error('Account creation failed: No account ID returned');
    }

    console.log(`✅ Created account: ${newAccountId.toString()}`);

    return {
      accountId: newAccountId.toString(),
      privateKey: newPrivateKey.toString(),
      publicKey: newPublicKey.toString(),
    };
  }

  /**
   * Get account balance
   */
  static async getAccountBalance(accountId: string | AccountId): Promise<{
    hbar: string;
    tokens: Map<string, number>;
  }> {
    const client = HederaClient.getClient();
    const accId = typeof accountId === 'string' ? AccountId.fromString(accountId) : accountId;

    const query = new AccountBalanceQuery().setAccountId(accId);
    const balance = await query.execute(client);

    const tokenBalances = new Map<string, number>();
    if (balance.tokens) {
      for (const [tokenId, tokenBalance] of balance.tokens) {
        tokenBalances.set(tokenId.toString(), tokenBalance.toNumber());
      }
    }

    return {
      hbar: balance.hbars.toString(),
      tokens: tokenBalances,
    };
  }

  /**
   * Get account info
   */
  static async getAccountInfo(accountId: string | AccountId) {
    const client = HederaClient.getClient();
    const accId = typeof accountId === 'string' ? AccountId.fromString(accountId) : accountId;

    const query = new AccountInfoQuery().setAccountId(accId);
    const info = await query.execute(client);

    return {
      accountId: info.accountId.toString(),
      balance: info.balance.toString(),
      key: info.key?.toString(),
      isDeleted: info.isDeleted,
      proxyAccountId: info.proxyAccountId?.toString(),
      expirationTime: info.expirationTime?.toString(),
    };
  }

  /**
   * Transfer HBAR between accounts
   */
  static async transferHbar(
    fromAccountId: AccountId,
    toAccountId: AccountId,
    amount: number,
    fromPrivateKey?: PrivateKey
  ): Promise<string> {
    const client = HederaClient.getClient();

    const transaction = new TransferTransaction()
      .addHbarTransfer(fromAccountId, new Hbar(-amount))
      .addHbarTransfer(toAccountId, new Hbar(amount));

    let txResponse;
    if (fromPrivateKey) {
      const signedTx = await transaction.freezeWith(client).sign(fromPrivateKey);
      txResponse = await signedTx.execute(client);
    } else {
      txResponse = await transaction.execute(client);
    }

    await txResponse.getReceipt(client);
    console.log(`✅ Transferred ${amount} HBAR from ${fromAccountId} to ${toAccountId}`);
    return txResponse.transactionId.toString();
  }

  /**
   * Fund account from operator (for testing)
   */
  static async fundAccount(accountId: string | AccountId, amount: number): Promise<string> {
    const operatorId = HederaClient.getOperatorId();
    const accId = typeof accountId === 'string' ? AccountId.fromString(accountId) : accountId;

    return this.transferHbar(operatorId, accId, amount);
  }

  /**
   * Verify account signature (for authentication)
   */
  static verifySignature(
    message: string,
    signature: Uint8Array,
    publicKey: string
  ): boolean {
    try {
      const pubKey = PublicKey.fromString(publicKey);
      const messageBytes = Buffer.from(message);
      return pubKey.verify(messageBytes, signature);
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }
}

// Export PublicKey for signature verification
export { PublicKey } from '@hashgraph/sdk';
