'use client';

import { useEffect, useState, useCallback } from 'react';

export interface HCSMessage {
  consensusTimestamp: string;
  sequenceNumber: number;
  payerAccountId: string;
  topicId: string;
  message: Record<string, unknown>;
  rawMessage: string;
}

interface UseHCSMessagesOptions {
  topicId?: string;
  topicType?: 'leaderboard' | 'events' | 'tournament';
  limit?: number;
  pollingInterval?: number; // in milliseconds
  autoRefresh?: boolean;
}

interface UseHCSMessagesReturn {
  messages: HCSMessage[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdate: Date | null;
}

/**
 * Hook for real-time HCS message streaming
 * Polls Mirror Node API at specified interval for new messages
 */
export function useHCSMessages({
  topicId,
  topicType,
  limit = 100,
  pollingInterval = 10000, // 10 seconds default
  autoRefresh = true,
}: UseHCSMessagesOptions): UseHCSMessagesReturn {
  const [messages, setMessages] = useState<HCSMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      let url = `/api/hedera/hcs/messages?limit=${limit}`;
      
      if (topicId) {
        url += `&topicId=${topicId}`;
      } else if (topicType) {
        url += `&type=${topicType}`;
      }

      const response = await fetch(url, {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch HCS messages');
      }

      const data = await response.json();
      
      if (data.success) {
        setMessages(data.data.messages);
        setLastUpdate(new Date());
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to fetch messages');
      }
    } catch (err) {
      console.error('Error fetching HCS messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [topicId, topicType, limit]);

  useEffect(() => {
    fetchMessages();

    if (autoRefresh) {
      const interval = setInterval(fetchMessages, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [fetchMessages, autoRefresh, pollingInterval]);

  return {
    messages,
    loading,
    error,
    refresh: fetchMessages,
    lastUpdate,
  };
}

/**
 * Hook for filtering HCS messages by type
 */
export function useFilteredHCSMessages(
  messages: HCSMessage[],
  filterFn: (message: Record<string, unknown>) => boolean
): HCSMessage[] {
  return messages.filter(msg => {
    try {
      return filterFn(msg.message);
    } catch {
      return false;
    }
  });
}

/**
 * Hook for getting latest message
 */
export function useLatestHCSMessage(
  messages: HCSMessage[]
): HCSMessage | null {
  if (messages.length === 0) return null;
  return messages[0]; // Messages are ordered desc by default
}

/**
 * Hook for counting messages by type
 */
export function useHCSMessageStats(messages: HCSMessage[]): {
  total: number;
  byType: Record<string, number>;
} {
  const stats = {
    total: messages.length,
    byType: {} as Record<string, number>,
  };

  messages.forEach(msg => {
    const type = msg.message?.type || 'unknown';
    stats.byType[type as string] = (stats.byType[type as string] || 0) + 1;
  });

  return stats;
}
