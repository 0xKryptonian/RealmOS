import {
  Client,
  AccountId,
  PrivateKey,
  PublicKey,
  Hbar,
  HbarUnit,
} from '@hashgraph/sdk';

/**
 * Hedera Client Configuration
 * Manages connection to Hedera network (testnet/mainnet)
 */
export class HederaClient {
  private static instance: Client | null = null;
  private static operatorId: AccountId | null = null;
  private static operatorKey: PrivateKey | null = null;

  /**
   * Initialize Hedera client with operator credentials
   */
  static initialize(): Client {
    if (this.instance) {
      return this.instance;
    }

    const accountId = process.env.HEDERA_ACCOUNT_ID;
    const privateKey = process.env.HEDERA_PRIVATE_KEY;
    const network = process.env.HEDERA_NETWORK || 'testnet';

    if (!accountId || !privateKey) {
      throw new Error('HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set');
    }

    this.operatorId = AccountId.fromString(accountId);
    this.operatorKey = PrivateKey.fromString(privateKey);

    // Create client based on network
    if (network === 'mainnet') {
      this.instance = Client.forMainnet();
    } else if (network === 'testnet') {
      this.instance = Client.forTestnet();
    } else {
      throw new Error(`Unsupported network: ${network}`);
    }

    // Set operator
    this.instance.setOperator(this.operatorId, this.operatorKey);

    // Set default transaction fee and query payment
    this.instance.setDefaultMaxTransactionFee(new Hbar(2));
    this.instance.setDefaultMaxQueryPayment(new Hbar(1));

    return this.instance;
  }

  /**
   * Get the initialized client instance
   */
  static getClient(): Client {
    if (!this.instance) {
      return this.initialize();
    }
    return this.instance;
  }

  /**
   * Get operator account ID
   */
  static getOperatorId(): AccountId {
    if (!this.operatorId) {
      this.initialize();
    }
    return this.operatorId!;
  }

  /**
   * Get operator private key
   */
  static getOperatorKey(): PrivateKey {
    if (!this.operatorKey) {
      this.initialize();
    }
    return this.operatorKey!;
  }

  /**
   * Get operator public key
   */
  static getOperatorPublicKey(): PublicKey {
    return this.getOperatorKey().publicKey;
  }

  /**
   * Close the client connection
   */
  static async close(): Promise<void> {
    if (this.instance) {
      await this.instance.close();
      this.instance = null;
      this.operatorId = null;
      this.operatorKey = null;
    }
  }

  /**
   * Convert HBAR to tinybars
   */
  static hbarToTinybar(hbar: number): bigint {
    return BigInt(Math.floor(hbar * 100_000_000));
  }

  /**
   * Convert tinybars to HBAR
   */
  static tinybarToHbar(tinybar: bigint): number {
    return Number(tinybar) / 100_000_000;
  }

  /**
   * Format HBAR amount for display
   */
  static formatHbar(amount: number | bigint): string {
    const hbar = typeof amount === 'bigint' ? this.tinybarToHbar(amount) : amount;
    return `${hbar.toFixed(8)} ℏ`;
  }
}

/**
 * Helper function to get initialized client
 */
export function getHederaClient(): Client {
  return HederaClient.getClient();
}

/**
 * Helper function to get operator account ID
 */
export function getOperatorId(): AccountId {
  return HederaClient.getOperatorId();
}

/**
 * Helper function to get operator private key
 */
export function getOperatorKey(): PrivateKey {
  return HederaClient.getOperatorKey();
}
