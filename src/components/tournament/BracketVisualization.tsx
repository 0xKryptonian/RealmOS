'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users } from 'lucide-react';

interface Match {
  id: string;
  roundNumber: number;
  player1?: {
    accountId: string;
    name?: string;
    score?: number;
  };
  player2?: {
    accountId: string;
    name?: string;
    score?: number;
  };
  winner?: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
}

interface Round {
  roundNumber: number;
  matches: Match[];
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
}

interface BracketVisualizationProps {
  rounds: Round[];
  format: string;
}

export default function BracketVisualization({ rounds, format }: BracketVisualizationProps) {
  const getRoundName = (roundNumber: number, totalRounds: number) => {
    const roundsFromEnd = totalRounds - roundNumber;
    if (roundsFromEnd === 0) return 'Grand Final';
    if (roundsFromEnd === 1) return 'Semi Finals';
    if (roundsFromEnd === 2) return 'Quarter Finals';
    return `Round ${roundNumber}`;
  };

  return (
    <div className="space-y-6">
      {/* Format Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#98ee2c]" />
          <h3 className="text-xl font-bold text-white">Tournament Bracket</h3>
        </div>
        <Badge className="bg-[#98ee2c]/10 text-[#98ee2c] border-[#98ee2c]/30">
          {format.replace('_', ' ')}
        </Badge>
      </div>

      {/* Bracket Rounds */}
      <div className="space-y-6">
        {rounds.map((round) => (
          <Card key={round.roundNumber} className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    {getRoundName(round.roundNumber, rounds.length)}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {round.matches.filter(m => m.status === 'COMPLETED').length} / {round.matches.length} matches completed
                  </p>
                </div>
                <Badge className={
                  round.status === 'COMPLETED' ? 'bg-gray-500' :
                  round.status === 'ACTIVE' ? 'bg-[#98ee2c]' :
                  'bg-blue-500'
                }>
                  {round.status}
                </Badge>
              </div>

              {/* Matches Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {round.matches.map((match) => (
                  <div
                    key={match.id}
                    className={`p-4 rounded-lg border transition-all ${
                      match.status === 'ACTIVE'
                        ? 'bg-[#98ee2c]/10 border-[#98ee2c]/50'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    {/* Player 1 */}
                    <div className={`flex items-center justify-between p-2 rounded mb-2 ${
                      match.winner === match.player1?.accountId ? 'bg-[#98ee2c]/20' : 'bg-white/5'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#98ee2c] to-[#7bc922] flex items-center justify-center">
                          <Users className="w-4 h-4 text-black" />
                        </div>
                        <span className="text-white font-medium">
                          {match.player1?.name || match.player1?.accountId || 'TBD'}
                        </span>
                      </div>
                      {match.player1?.score !== undefined && (
                        <span className="text-xl font-bold text-[#98ee2c]">
                          {match.player1.score}
                        </span>
                      )}
                    </div>

                    {/* VS Divider */}
                    <div className="text-center text-xs text-gray-500 my-1">VS</div>

                    {/* Player 2 */}
                    <div className={`flex items-center justify-between p-2 rounded ${
                      match.winner === match.player2?.accountId ? 'bg-[#98ee2c]/20' : 'bg-white/5'
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#98ee2c] to-[#7bc922] flex items-center justify-center">
                          <Users className="w-4 h-4 text-black" />
                        </div>
                        <span className="text-white font-medium">
                          {match.player2?.name || match.player2?.accountId || 'TBD'}
                        </span>
                      </div>
                      {match.player2?.score !== undefined && (
                        <span className="text-xl font-bold text-[#98ee2c]">
                          {match.player2.score}
                        </span>
                      )}
                    </div>

                    {/* Match Status */}
                    {match.status === 'ACTIVE' && (
                      <div className="mt-2 text-center">
                        <Badge className="bg-red-500 text-white animate-pulse">
                          <span className="w-2 h-2 bg-white rounded-full mr-2 inline-block" />
                          LIVE
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bracket Progress */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="p-6">
          <h4 className="text-white font-semibold mb-4">Tournament Progress</h4>
          <div className="space-y-2">
            {rounds.map((round) => {
              const completed = round.matches.filter(m => m.status === 'COMPLETED').length;
              const total = round.matches.length;
              const percentage = (completed / total) * 100;

              return (
                <div key={round.roundNumber}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-400">
                      {getRoundName(round.roundNumber, rounds.length)}
                    </span>
                    <span className="text-white font-medium">
                      {completed}/{total}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
