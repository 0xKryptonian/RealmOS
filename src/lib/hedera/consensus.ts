import {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicId,
  PrivateKey,
  TopicInfoQuery,
  TopicMessageQuery,
} from '@hashgraph/sdk';
import { HederaClient } from './client';

export interface CreateTopicParams {
  memo?: string;
  adminKey?: PrivateKey;
  submitKey?: PrivateKey;
}

export interface SubmitMessageParams {
  topicId: TopicId;
  message: string | object;
  submitKey?: PrivateKey;
}

/**
 * Hedera Consensus Service (HCS) operations
 */
export class HederaConsensusService {
  /**
   * Create a new HCS topic
   */
  static async createTopic(params: CreateTopicParams = {}): Promise<TopicId> {
    const client = HederaClient.getClient();
    const operatorKey = HederaClient.getOperatorKey();

    const { memo, adminKey = operatorKey, submitKey } = params;

    const transaction = new TopicCreateTransaction();

    if (memo) {
      transaction.setTopicMemo(memo);
    }

    if (adminKey) {
      transaction.setAdminKey(adminKey);
    }

    if (submitKey) {
      transaction.setSubmitKey(submitKey);
    }

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const topicId = receipt.topicId;

    if (!topicId) {
      throw new Error('Topic creation failed: No topic ID returned');
    }

    console.log(`✅ Created HCS topic: ${topicId.toString()}`);
    return topicId;
  }

  /**
   * Submit a message to an HCS topic
   */
  static async submitMessage(params: SubmitMessageParams): Promise<{
    txId: string;
    sequenceNumber: number;
    consensusTimestamp: string;
  }> {
    const client = HederaClient.getClient();
    const { topicId, message, submitKey } = params;

    // Convert message to string if it's an object
    const messageString = typeof message === 'string' ? message : JSON.stringify(message);

    const transaction = new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(messageString);

    let txResponse;
    if (submitKey) {
      const signedTx = await transaction.freezeWith(client).sign(submitKey);
      txResponse = await signedTx.execute(client);
    } else {
      txResponse = await transaction.execute(client);
    }

    const receipt = await txResponse.getReceipt(client);
    const record = await txResponse.getRecord(client);

    console.log(`✅ Submitted message to topic ${topicId.toString()}`);

    return {
      txId: txResponse.transactionId.toString(),
      sequenceNumber: receipt.topicSequenceNumber?.toNumber() || 0,
      consensusTimestamp: record.consensusTimestamp.toString(),
    };
  }

  /**
   * Submit leaderboard score to HCS
   */
  static async submitLeaderboardScore(
    topicId: TopicId,
    data: {
      userId: string;
      gameId: string;
      score: number;
      username: string;
      metadata?: any;
    }
  ): Promise<{
    txId: string;
    sequenceNumber: number;
    consensusTimestamp: string;
  }> {
    const message = {
      type: 'LEADERBOARD_SCORE',
      timestamp: new Date().toISOString(),
      ...data,
    };

    return this.submitMessage({
      topicId,
      message,
    });
  }

  /**
   * Submit game event to HCS
   */
  static async submitGameEvent(
    topicId: TopicId,
    data: {
      eventType: string;
      userId?: string;
      gameId?: string;
      metadata?: any;
    }
  ): Promise<{
    txId: string;
    sequenceNumber: number;
    consensusTimestamp: string;
  }> {
    const message = {
      type: 'GAME_EVENT',
      timestamp: new Date().toISOString(),
      ...data,
    };

    return this.submitMessage({
      topicId,
      message,
    });
  }

  /**
   * Submit tournament result to HCS
   */
  static async submitTournamentResult(
    topicId: TopicId,
    data: {
      tournamentId: string;
      winnerId: string;
      results: any[];
      metadata?: any;
    }
  ): Promise<{
    txId: string;
    sequenceNumber: number;
    consensusTimestamp: string;
  }> {
    const message = {
      type: 'TOURNAMENT_RESULT',
      timestamp: new Date().toISOString(),
      ...data,
    };

    return this.submitMessage({
      topicId,
      message,
    });
  }

  /**
   * Get topic info
   */
  static async getTopicInfo(topicId: TopicId) {
    const client = HederaClient.getClient();
    const query = new TopicInfoQuery().setTopicId(topicId);
    const topicInfo = await query.execute(client);
    return topicInfo;
  }

  /**
   * Subscribe to topic messages
   */
  static subscribeToTopic(
    topicId: TopicId,
    onMessage: (message: any) => void,
    startTime?: Date
  ): () => void {
    const client = HederaClient.getClient();

    const query = new TopicMessageQuery().setTopicId(topicId);

    if (startTime) {
      query.setStartTime(startTime);
    }

    const subscription = query.subscribe(client, null, (message) => {
      try {
        const messageString = Buffer.from(message.contents).toString();
        const parsedMessage = JSON.parse(messageString);
        onMessage({
          sequenceNumber: message.sequenceNumber.toNumber(),
          consensusTimestamp: message.consensusTimestamp.toString(),
          contents: parsedMessage,
        });
      } catch (error) {
        console.error('Error parsing HCS message:', error);
      }
    });

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  }
}
