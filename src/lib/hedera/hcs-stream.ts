import { TopicId, TopicMessageQuery } from '@hashgraph/sdk';
import { HederaClient } from './client';

export interface HCSMessage {
  consensusTimestamp: string;
  sequenceNumber: number;
  contents: string;
  runningHash: Uint8Array;
}

export interface LeaderboardScore {
  userId: string;
  username: string;
  gameId: string;
  score: number;
  timestamp: string;
  metadata?: any;
}

export interface GameEvent {
  eventType: string;
  userId: string;
  gameId: string;
  data: any;
  timestamp: string;
}

export interface TournamentResult {
  tournamentId: string;
  winners: Array<{
    position: number;
    userId: string;
    username: string;
    score: number;
  }>;
  timestamp: string;
}

/**
 * HCS Stream Service for real-time message streaming
 */
export class HCSStreamService {
  private client = HederaClient.getClient();
  private subscriptions: Map<string, any> = new Map();

  /**
   * Subscribe to leaderboard updates
   */
  subscribeToLeaderboard(
    topicId: TopicId,
    onMessage: (score: LeaderboardScore) => void,
    onError?: (error: Error) => void
  ): () => void {
    const query = new TopicMessageQuery()
      .setTopicId(topicId)
      .setStartTime(0);

    const subscription = query.subscribe(
      this.client,
      null,
      (message) => {
        try {
          const contents = Buffer.from(message.contents).toString('utf-8');
          const data = JSON.parse(contents);
          
          if (data.type === 'leaderboard_score') {
            onMessage(data.payload as LeaderboardScore);
          }
        } catch (error) {
          console.error('Error parsing HCS message:', error);
          if (onError) onError(error as Error);
        }
      }
    );

    const subscriptionId = `leaderboard_${topicId.toString()}`;
    this.subscriptions.set(subscriptionId, subscription);

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
    };
  }

  /**
   * Subscribe to game events
   */
  subscribeToGameEvents(
    topicId: TopicId,
    onMessage: (event: GameEvent) => void,
    onError?: (error: Error) => void
  ): () => void {
    const query = new TopicMessageQuery()
      .setTopicId(topicId)
      .setStartTime(0);

    const subscription = query.subscribe(
      this.client,
      null,
      (message) => {
        try {
          const contents = Buffer.from(message.contents).toString('utf-8');
          const data = JSON.parse(contents);
          
          if (data.type === 'game_event') {
            onMessage(data.payload as GameEvent);
          }
        } catch (error) {
          console.error('Error parsing HCS message:', error);
          if (onError) onError(error as Error);
        }
      }
    );

    const subscriptionId = `game_events_${topicId.toString()}`;
    this.subscriptions.set(subscriptionId, subscription);

    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
    };
  }

  /**
   * Subscribe to tournament results
   */
  subscribeToTournaments(
    topicId: TopicId,
    onMessage: (result: TournamentResult) => void,
    onError?: (error: Error) => void
  ): () => void {
    const query = new TopicMessageQuery()
      .setTopicId(topicId)
      .setStartTime(0);

    const subscription = query.subscribe(
      this.client,
      null,
      (message) => {
        try {
          const contents = Buffer.from(message.contents).toString('utf-8');
          const data = JSON.parse(contents);
          
          if (data.type === 'tournament_result') {
            onMessage(data.payload as TournamentResult);
          }
        } catch (error) {
          console.error('Error parsing HCS message:', error);
          if (onError) onError(error as Error);
        }
      }
    );

    const subscriptionId = `tournaments_${topicId.toString()}`;
    this.subscriptions.set(subscriptionId, subscription);

    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
    };
  }

  /**
   * Get historical messages from topic
   */
  async getHistoricalMessages(
    topicId: TopicId,
    limit: number = 100
  ): Promise<HCSMessage[]> {
    const messages: HCSMessage[] = [];

    return new Promise((resolve, reject) => {
      const query = new TopicMessageQuery()
        .setTopicId(topicId)
        .setStartTime(0)
        .setLimit(limit);

      query.subscribe(
        this.client,
        null,
        (message) => {
          messages.push({
            consensusTimestamp: message.consensusTimestamp.toString(),
            sequenceNumber: message.sequenceNumber.toNumber(),
            contents: Buffer.from(message.contents).toString('utf-8'),
            runningHash: message.runningHash,
          });
        },
        (error) => {
          reject(error);
        }
      );

      // Wait for messages to be collected
      setTimeout(() => {
        resolve(messages);
      }, 5000);
    });
  }

  /**
   * Unsubscribe from all topics
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }
}

export const hcsStreamService = new HCSStreamService();
