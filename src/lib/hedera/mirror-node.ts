/**
 * Hedera Mirror Node REST API Integration
 * Efficient queries for transactions, NFTs, tokens, and account data
 */

export interface MirrorTransaction {
  consensus_timestamp: string;
  transaction_hash: string;
  transaction_id: string;
  type: string;
  result: string;
  charged_tx_fee: number;
  memo_base64?: string;
  payer_account_id: string;
  valid_start_timestamp: string;
  name?: string;
}

export interface MirrorNFT {
  token_id: string;
  serial_number: number;
  account_id: string;
  created_timestamp: string;
  metadata?: string;
  delegating_spender?: string;
}

export interface MirrorTokenBalance {
  token_id: string;
  balance: number;
  decimals: number;
}

export interface MirrorAccountInfo {
  account: string;
  balance: {
    balance: number;
    timestamp: string;
  };
  tokens: MirrorTokenBalance[];
}

export interface MirrorTopicMessage {
  consensus_timestamp: string;
  message: string;
  sequence_number: number;
  payer_account_id: string;
  topic_id: string;
  running_hash: string;
  running_hash_version: number;
}

export interface NetworkStats {
  totalTransactions: number;
  successRate: number;
  averageFee: number;
  last24hVolume: number;
}

/**
 * Hedera Mirror Node Client
 * Server-safe REST API client for efficient queries
 */
export class HederaMirrorNode {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.baseUrl = network === 'mainnet'
      ? 'https://mainnet-public.mirrornode.hedera.com/api/v1'
      : 'https://testnet.mirrornode.hedera.com/api/v1';
    
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get transaction history for an account
   */
  async getTransactionHistory(
    accountId: string,
    limit: number = 100
  ): Promise<MirrorTransaction[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/transactions?account.id=${accountId}&limit=${limit}&order=desc`,
        { headers: this.headers, cache: 'no-store' }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch transactions:', response.statusText);
        return [];
      }

      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  /**
   * Get NFTs owned by an account
   */
  async getAccountNFTs(
    accountId: string,
    tokenId?: string
  ): Promise<MirrorNFT[]> {
    try {
      let url = `${this.baseUrl}/accounts/${accountId}/nfts?limit=100&order=desc`;
      
      if (tokenId) {
        url += `&token.id=${tokenId}`;
      }

      const response = await fetch(url, { 
        headers: this.headers,
        cache: 'no-store' 
      });
      
      if (!response.ok) {
        console.error('Failed to fetch NFTs:', response.statusText);
        return [];
      }

      const data = await response.json();
      return data.nfts || [];
    } catch (error) {
      console.error('Error fetching account NFTs:', error);
      return [];
    }
  }

  /**
   * Get token balances for an account
   */
  async getAccountTokenBalances(accountId: string): Promise<MirrorTokenBalance[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/accounts/${accountId}/tokens?limit=100`,
        { headers: this.headers, cache: 'no-store' }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch token balances:', response.statusText);
        return [];
      }

      const data = await response.json();
      return data.tokens || [];
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return [];
    }
  }

  /**
   * Get account information including HBAR balance
   */
  async getAccountInfo(accountId: string): Promise<MirrorAccountInfo | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/accounts/${accountId}`,
        { headers: this.headers, cache: 'no-store' }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch account info:', response.statusText);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching account info:', error);
      return null;
    }
  }

  /**
   * Get HCS topic messages
   */
  async getTopicMessages(
    topicId: string,
    limit: number = 100,
    order: 'asc' | 'desc' = 'desc'
  ): Promise<MirrorTopicMessage[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/topics/${topicId}/messages?limit=${limit}&order=${order}`,
        { headers: this.headers, cache: 'no-store' }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch topic messages:', response.statusText);
        return [];
      }

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error fetching topic messages:', error);
      return [];
    }
  }

  /**
   * Get specific NFT information
   */
  async getNFTInfo(tokenId: string, serialNumber: number): Promise<MirrorNFT | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/tokens/${tokenId}/nfts/${serialNumber}`,
        { headers: this.headers, cache: 'no-store' }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch NFT info:', response.statusText);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching NFT info:', error);
      return null;
    }
  }

  /**
   * Get token information
   */
  async getTokenInfo(tokenId: string): Promise<Record<string, unknown> | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/tokens/${tokenId}`,
        { headers: this.headers, cache: 'no-store' }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch token info:', response.statusText);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching token info:', error);
      return null;
    }
  }

  /**
   * Get network statistics
   */
  async getNetworkStats(): Promise<NetworkStats | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/transactions?limit=100&order=desc`,
        { headers: this.headers, cache: 'no-store' }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch network stats:', response.statusText);
        return null;
      }

      const data = await response.json();
      const transactions = data.transactions || [];

      if (transactions.length === 0) {
        return {
          totalTransactions: 0,
          successRate: 0,
          averageFee: 0,
          last24hVolume: 0,
        };
      }

      const successfulTxs = transactions.filter((tx: MirrorTransaction) => tx.result === 'SUCCESS');
      const totalFees = transactions.reduce((sum: number, tx: MirrorTransaction) => 
        sum + (tx.charged_tx_fee || 0), 0
      );

      return {
        totalTransactions: transactions.length,
        successRate: (successfulTxs.length / transactions.length) * 100,
        averageFee: totalFees / transactions.length,
        last24hVolume: transactions.length,
      };
    } catch (error) {
      console.error('Error fetching network stats:', error);
      return null;
    }
  }

  /**
   * Get contract call results
   */
  async getContractResults(contractId: string, limit: number = 100): Promise<Record<string, unknown>[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/contracts/${contractId}/results?limit=${limit}&order=desc`,
        { headers: this.headers, cache: 'no-store' }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch contract results:', response.statusText);
        return [];
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching contract results:', error);
      return [];
    }
  }

  /**
   * Get contract logs/events
   */
  async getContractLogs(contractId: string, limit: number = 100): Promise<Record<string, unknown>[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/contracts/${contractId}/results/logs?limit=${limit}&order=desc`,
        { headers: this.headers, cache: 'no-store' }
      );
      
      if (!response.ok) {
        console.error('Failed to fetch contract logs:', response.statusText);
        return [];
      }

      const data = await response.json();
      return data.logs || [];
    } catch (error) {
      console.error('Error fetching contract logs:', error);
      return [];
    }
  }

  /**
   * Decode HCS message (handles both hex and base64 encoding)
   */
  static decodeMessage(message: string): string {
    try {
      // HGraph/Mirror returns hex-encoded messages (with \\x prefix)
      if (message.startsWith('\\x')) {
        const hexString = message.slice(2);
        return Buffer.from(hexString, 'hex').toString('utf-8');
      }
      // Fallback to base64
      return Buffer.from(message, 'base64').toString('utf-8');
    } catch (error) {
      console.error('Error decoding message:', error);
      return message;
    }
  }

  /**
   * Parse decoded message as JSON
   */
  static parseMessage<T = Record<string, unknown>>(message: string): T | null {
    try {
      const decoded = this.decodeMessage(message);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error parsing message:', error);
      return null;
    }
  }
}

/**
 * Get Mirror Node client instance
 */
export function getMirrorNode(network: 'testnet' | 'mainnet' = 'testnet'): HederaMirrorNode {
  return new HederaMirrorNode(network);
}

/**
 * Singleton instance for server-side use
 */
export const mirrorNode = new HederaMirrorNode(
  (process.env.HEDERA_NETWORK as 'testnet' | 'mainnet') || 'testnet'
);
