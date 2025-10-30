'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Calendar, CheckCircle, Clock } from 'lucide-react';

interface TournamentResult {
  tournamentId: string;
  tournamentName: string;
  winner: string;
  winnerUsername?: string;
  finalScore: number;
  participants: number;
  prizePool?: number;
  endedAt: number;
  consensusTimestamp: string;
  sequenceNumber: number;
}

interface HCSTournamentResultsProps {
  tournamentId?: string;
  limit?: number;
}

export function HCSTournamentResults({ 
  tournamentId, 
  limit = 10 
}: HCSTournamentResultsProps) {
  const [results, setResults] = useState<TournamentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTournamentResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId]);

  async function fetchTournamentResults() {
    try {
      const response = await fetch(
        `/api/hedera/hcs/messages?type=tournament&limit=200`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch tournament results');
      }

      const data = await response.json();
      
      if (data.success) {
        // Parse and filter tournament completion messages
        interface TournamentMessageData {
          message?: {
            type?: string;
            status?: string;
            tournamentId?: string;
            id?: string;
            tournamentName?: string;
            name?: string;
            winner?: string;
            winnerId?: string;
            winnerUsername?: string;
            winnerName?: string;
            finalScore?: number;
            winningScore?: number;
            participants?: number;
            playerCount?: number;
            prizePool?: number;
            endedAt?: number;
            timestamp?: number;
          };
          consensusTimestamp: string;
          sequenceNumber: number;
        }

        const tournamentResults: TournamentResult[] = data.data.messages
          .filter((msg: TournamentMessageData) => {
            if (!msg.message) return false;
            if (tournamentId && msg.message.tournamentId !== tournamentId) return false;
            return msg.message.type === 'tournament_ended' || msg.message.status === 'completed';
          })
          .map((msg: TournamentMessageData) => ({
            tournamentId: msg.message?.tournamentId || msg.message?.id || 'unknown',
            tournamentName: msg.message?.tournamentName || msg.message?.name || 'Tournament',
            winner: msg.message?.winner || msg.message?.winnerId || 'unknown',
            winnerUsername: msg.message?.winnerUsername || msg.message?.winnerName,
            finalScore: msg.message?.finalScore || msg.message?.winningScore || 0,
            participants: msg.message?.participants || msg.message?.playerCount || 0,
            prizePool: msg.message?.prizePool,
            endedAt: msg.message?.endedAt || msg.message?.timestamp || Date.now(),
            consensusTimestamp: msg.consensusTimestamp,
            sequenceNumber: msg.sequenceNumber,
          }));

        // Sort by most recent
        const sortedResults = tournamentResults
          .sort((a, b) => b.endedAt - a.endedAt)
          .slice(0, limit);

        setResults(sortedResults);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching tournament results:', err);
      setError(err instanceof Error ? err.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Tournament Results
          </CardTitle>
          <CardDescription>Loading from Hedera Consensus Service...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 animate-pulse rounded" />
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
            Tournament Results Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchTournamentResults}
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
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Tournament Results
        </CardTitle>
        <CardDescription>
          Verified tournament outcomes stored on Hedera Consensus Service
        </CardDescription>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tournament results found. Check back after tournaments complete!
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={`${result.consensusTimestamp}-${result.sequenceNumber}`}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      {result.tournamentName}
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(result.endedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {result.participants} players
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-8 h-8 text-yellow-500" />
                      <div>
                        <div className="text-xs text-gray-600 uppercase font-semibold">Winner</div>
                        <div className="font-bold text-lg">
                          {result.winnerUsername || result.winner}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600 uppercase font-semibold">Score</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {result.finalScore.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {result.prizePool && (
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm font-semibold text-blue-800">Prize Pool</span>
                    <span className="text-sm font-bold text-blue-600">
                      {result.prizePool} REALM
                    </span>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>
                      HCS Sequence: {result.sequenceNumber} • 
                      Consensus: {new Date(parseFloat(result.consensusTimestamp) * 1000).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>🔒 Tamper-Proof Results:</strong> All tournament outcomes are permanently recorded 
              on Hedera Consensus Service with cryptographic proof of authenticity.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
