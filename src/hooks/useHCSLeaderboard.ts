import { useEffect, useState, useCallback } from 'react';
import { TopicId } from '@hashgraph/sdk';
import { hcsStreamService, LeaderboardScore } from '@/lib/hedera/hcs-stream';

interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  timestamp: string;
}

export function useHCSLeaderboard(gameId?: string) {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const handleNewScore = useCallback((scoreData: LeaderboardScore) => {
    // Filter by gameId if provided
    if (gameId && scoreData.gameId !== gameId) {
      return;
    }

    setScores((prevScores) => {
      // Check if user already has a score
      const existingIndex = prevScores.findIndex(
        (s) => s.userId === scoreData.userId && (!gameId || s.userId === scoreData.userId)
      );

      const newEntry: LeaderboardEntry = {
        userId: scoreData.userId,
        username: scoreData.username,
        score: scoreData.score,
        timestamp: scoreData.timestamp,
      };

      if (existingIndex >= 0) {
        // Update existing score if new score is higher
        if (scoreData.score > prevScores[existingIndex].score) {
          const updated = [...prevScores];
          updated[existingIndex] = newEntry;
          return updated.sort((a, b) => b.score - a.score);
        }
        return prevScores;
      } else {
        // Add new score
        const updated = [...prevScores, newEntry];
        return updated.sort((a, b) => b.score - a.score);
      }
    });
  }, [gameId]);

  useEffect(() => {
    const topicIdString = process.env.NEXT_PUBLIC_LEADERBOARD_TOPIC_ID;
    
    if (!topicIdString) {
      setError(new Error('Leaderboard topic ID not configured'));
      setLoading(false);
      return;
    }

    try {
      const topicId = TopicId.fromString(topicIdString);
      
      // Subscribe to real-time updates
      const unsubscribe = hcsStreamService.subscribeToLeaderboard(
        topicId,
        handleNewScore,
        (err) => {
          console.error('HCS subscription error:', err);
          setError(err);
        }
      );

      setLoading(false);

      // Cleanup on unmount
      return () => {
        unsubscribe();
      };
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [handleNewScore]);

  return { scores, loading, error };
}
