import {
  FileCreateTransaction,
  FileAppendTransaction,
  FileContentsQuery,
  FileId,
  Hbar,
  PrivateKey,
} from '@hashgraph/sdk';
import { HederaClient } from './client';

export interface HFSFileMetadata {
  fileId: string;
  size: number;
  createdAt: Date;
  contentType: string;
  description?: string;
}

/**
 * Hedera File Service (HFS) operations for RealmOS
 * Store game assets, NFT metadata, and AI-generated games on Hedera
 */
export class HederaFileService {
  /**
   * Store a file on Hedera File Service
   * Files larger than 4KB are automatically chunked
   */
  static async createFile(
    contents: string | Buffer,
    options: {
      contentType?: string;
      description?: string;
      keys?: PrivateKey[];
    } = {}
  ): Promise<HFSFileMetadata> {
    const client = HederaClient.getClient();
    const operatorKey = HederaClient.getOperatorKey();
    const keys = options.keys || [operatorKey];

    const contentBuffer = typeof contents === 'string' 
      ? Buffer.from(contents, 'utf-8') 
      : contents;

    const fileSize = contentBuffer.length;
    const maxChunkSize = 4096; // 4KB max per transaction

    try {
      // Create file with first chunk (up to 4KB)
      const firstChunk = contentBuffer.slice(0, maxChunkSize);
      
      const fileCreateTx = new FileCreateTransaction()
        .setKeys(keys)
        .setContents(firstChunk)
        .setMaxTransactionFee(new Hbar(5))
        .setTransactionValidDuration(180); // 3 minutes

      if (options.description) {
        fileCreateTx.setFileMemo(options.description.substring(0, 100));
      }

      const txResponse = await fileCreateTx.execute(client);
      const receipt = await txResponse.getReceipt(client);
      const fileId = receipt.fileId;

      if (!fileId) {
        throw new Error('File creation failed: No file ID returned');
      }

      console.log(`✅ Created HFS file: ${fileId.toString()} (${fileSize} bytes)`);

      // Append remaining chunks if file is larger than 4KB
      if (fileSize > maxChunkSize) {
        let offset = maxChunkSize;
        
        while (offset < fileSize) {
          const chunk = contentBuffer.slice(offset, offset + maxChunkSize);
          
          const fileAppendTx = new FileAppendTransaction()
            .setFileId(fileId)
            .setContents(chunk)
            .setMaxTransactionFee(new Hbar(5))
            .setTransactionValidDuration(180); // 3 minutes

          const appendResponse = await fileAppendTx.execute(client);
          await appendResponse.getReceipt(client); // Wait for confirmation
          
          offset += maxChunkSize;
          console.log(`📎 Appended chunk: ${offset}/${fileSize} bytes`);
        }
      }

      return {
        fileId: fileId.toString(),
        size: fileSize,
        createdAt: new Date(),
        contentType: options.contentType || 'application/octet-stream',
        description: options.description,
      };
    } catch (error) {
      console.error('Error creating HFS file:', error);
      throw error;
    }
  }

  /**
   * Store AI-generated game HTML on HFS
   */
  static async storeGameOnHFS(
    gameHtml: string,
    gameName: string
  ): Promise<HFSFileMetadata> {
    console.log(`📦 Storing game "${gameName}" on HFS...`);
    
    return this.createFile(gameHtml, {
      contentType: 'text/html',
      description: `RealmOS Game: ${gameName}`,
    });
  }

  /**
   * Store NFT metadata on HFS
   */
  static async storeNFTMetadata(
    metadata: {
      name: string;
      description: string;
      image: string;
      attributes?: Array<{ trait_type: string; value: string | number }>;
      external_url?: string;
    }
  ): Promise<HFSFileMetadata> {
    const metadataJson = JSON.stringify(metadata, null, 2);
    
    console.log(`📦 Storing NFT metadata on HFS: ${metadata.name}`);
    
    return this.createFile(metadataJson, {
      contentType: 'application/json',
      description: `NFT Metadata: ${metadata.name}`,
    });
  }

  /**
   * Store game asset (image, sound, etc.) on HFS
   */
  static async storeGameAsset(
    assetData: Buffer,
    assetName: string,
    contentType: string
  ): Promise<HFSFileMetadata> {
    console.log(`📦 Storing game asset "${assetName}" on HFS...`);
    
    return this.createFile(assetData, {
      contentType,
      description: `Game Asset: ${assetName}`,
    });
  }

  /**
   * Retrieve file contents from HFS
   */
  static async getFileContents(fileId: string): Promise<Buffer> {
    const client = HederaClient.getClient();
    
    try {
      const query = new FileContentsQuery()
        .setFileId(FileId.fromString(fileId))
        .setMaxQueryPayment(new Hbar(1));

      const contents = await query.execute(client);
      
      console.log(`✅ Retrieved HFS file: ${fileId} (${contents.length} bytes)`);
      
      return Buffer.from(contents);
    } catch (error) {
      console.error(`Error retrieving HFS file ${fileId}:`, error);
      throw error;
    }
  }

  /**
   * Get file contents as string
   */
  static async getFileContentsAsString(fileId: string): Promise<string> {
    const contents = await this.getFileContents(fileId);
    return contents.toString('utf-8');
  }

  /**
   * Get file contents as JSON
   */
  static async getFileContentsAsJSON<T = Record<string, unknown>>(fileId: string): Promise<T> {
    const contents = await this.getFileContentsAsString(fileId);
    return JSON.parse(contents);
  }

  /**
   * Generate HFS URL for file (for display purposes)
   */
  static getFileUrl(fileId: string, network: 'testnet' | 'mainnet' = 'testnet'): string {
    return `https://hashscan.io/${network}/file/${fileId}`;
  }

  /**
   * Check if a string is a valid HFS file ID
   */
  static isValidFileId(fileId: string): boolean {
    try {
      FileId.fromString(fileId);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Helper function to get HFS service instance
 */
export function getHFSService(): typeof HederaFileService {
  return HederaFileService;
}
