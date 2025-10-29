'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Clock, TrendingUp, Eye, Zap } from 'lucide-react';

interface TournamentStatsProps {
  stats: {
    totalMatches: number;
    completedMatches: number;
    totalParticipants: number;
    averageMatchDuration?: string;
    peakViewers?: number;
    currentViewers?: number;
    prizePool: string;
    format: string;
  };
}

export default function TournamentStats({ stats }: TournamentStatsProps) {
  const completionPercentage = (stats.completedMatches / stats.totalMatches) * 100;

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 text-center">
            <Trophy className="h-6 w-6 text-[#98ee2c] mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.prizePool}</div>
            <div className="text-xs text-gray-400">Prize Pool</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-[#98ee2c] mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalParticipants}</div>
            <div className="text-xs text-gray-400">Participants</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 text-[#98ee2c] mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.format.replace('_', ' ')}</div>
            <div className="text-xs text-gray-400">Format</div>
          </CardContent>
        </Card>

        {stats.currentViewers !== undefined && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <Eye className="h-6 w-6 text-[#98ee2c] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.currentViewers.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Watching Now</div>
            </CardContent>
          </Card>
        )}

        {stats.averageMatchDuration && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-[#98ee2c] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.averageMatchDuration}</div>
              <div className="text-xs text-gray-400">Avg Duration</div>
            </CardContent>
          </Card>
        )}

        {stats.peakViewers !== undefined && (
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-[#98ee2c] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.peakViewers.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Peak Viewers</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Progress Card */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm">Tournament Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Matches Completed</span>
              <span className="text-white font-semibold">
                {stats.completedMatches} / {stats.totalMatches}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] h-3 rounded-full transition-all flex items-center justify-end pr-2"
                style={{ width: `${completionPercentage}%` }}
              >
                <span className="text-xs font-bold text-black">
                  {Math.round(completionPercentage)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-sm">Match Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total Matches</span>
            <span className="text-white font-semibold">{stats.totalMatches}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Completed</span>
            <span className="text-white font-semibold">{stats.completedMatches}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Remaining</span>
            <span className="text-white font-semibold">{stats.totalMatches - stats.completedMatches}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
