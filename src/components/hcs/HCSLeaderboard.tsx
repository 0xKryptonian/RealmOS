'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Clock } from 'lucide-react';

interface LeaderboardEntry {
  userId: string;
  username?: string;
  score: number;
  gameId: string;
  timestamp: number;
  consensusTimestamp: string;
  sequenceNumber: number;
}

interface HCSLeaderboardProps {
  gameId?: string;
  limit?: number;
  showConsensusInfo?: boolean;
}

export function HCSLeaderboard({ 
  gameId, 
  limit = 10,
  showConsensusInfo = false 
}: HCSLeaderboardProps) {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    fetchLeaderboard();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  async function fetchLeaderboard() {
    try {
      const response = await fetch(
        `/api/hedera/hcs/messages?type=leaderboard&limit=200`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      
      if (data.success) {
        // Parse and filter messages
        interface HCSMessageData {
          message?: {
            type?: string;
            gameId?: string;
            userId?: string;
            user?: string;
            username?: string;
            score?: number;
            game?: string;
            timestamp?: number;
          };
          consensusTimestamp: string;
          sequenceNumber: number;
        }

        const entries: LeaderboardEntry[] = data.data.messages
          .filter((msg: HCSMessageData) => {
            if (!msg.message) return false;
            if (gameId && msg.message.gameId !== gameId) return false;
            return msg.message.type === 'score' || msg.message.score !== undefined;
          })
          .map((msg: HCSMessageData) => ({
            userId: msg.message?.userId || msg.message?.user || 'Unknown',
            username: msg.message?.username,
            score: msg.message?.score || 0,
            gameId: msg.message?.gameId || msg.message?.game || 'unknown',
            timestamp: msg.message?.timestamp || Date.now(),
            consensusTimestamp: msg.consensusTimestamp,
            sequenceNumber: msg.sequenceNumber,
          }));

        // Sort by score (highest first) and take top entries
        const topScores = entries
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);

        setScores(topScores);
        setLastUpdate(new Date());
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500">1st</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400">2nd</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600">3rd</Badge>;
    return <Badge variant="outline">#{rank}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Leaderboard
          </CardTitle>
          <CardDescription>Loading from Hedera Consensus Service...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trophy className="w-5 h-5" />
            Leaderboard Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchLeaderboard}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Leaderboard {gameId && `- ${gameId}`}
            </CardTitle>
            <CardDescription>
              Immutable scores stored on Hedera Consensus Service
            </CardDescription>
          </div>
          {lastUpdate && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              Updated {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {scores.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No scores recorded yet. Be the first to play!
          </div>
        ) : (
          <div className="space-y-2">
            {scores.map((entry, index) => (
              <div
                key={`${entry.consensusTimestamp}-${entry.sequenceNumber}`}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  index === 0 ? 'bg-yellow-50 border-yellow-200' :
                  index === 1 ? 'bg-gray-50 border-gray-200' :
                  index === 2 ? 'bg-amber-50 border-amber-200' :
                  'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {getRankIcon(index + 1)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {entry.username || entry.userId}
                      </span>
                      {getRankBadge(index + 1)}
                    </div>
                    {showConsensusInfo && (
                      <div className="text-xs text-gray-500 mt-1">
                        HCS Seq: {entry.sequenceNumber} • 
                        {new Date(parseFloat(entry.consensusTimestamp) * 1000).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {showConsensusInfo && scores.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>🔒 Immutable & Verifiable:</strong> All scores are stored on Hedera Consensus Service (HCS) 
              and cannot be altered. Each entry has a consensus timestamp and sequence number proving its authenticity.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
