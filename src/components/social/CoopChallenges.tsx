'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, Trophy, Clock, Target, Plus, Play, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface CoopChallenge {
  id: string;
  title: string;
  description: string;
  game: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  participants: Array<{ accountId: string; username: string }>;
  maxParticipants: number;
  rewards: {
    amount: string;
    currency: 'HBAR' | 'REALM';
    nft?: string;
  };
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  progress: number;
  timeRemaining: number;
}

const mockChallenges: CoopChallenge[] = [
  {
    id: '1',
    title: 'Chess Marathon',
    description: 'Win 50 chess games as a team within 24 hours',
    game: 'Chess',
    difficulty: 'MEDIUM',
    participants: [
      { accountId: '0.0.111', username: 'ChessMaster' },
      { accountId: '0.0.222', username: 'KingSlayer' },
    ],
    maxParticipants: 4,
    rewards: {
      amount: '1000',
      currency: 'REALM',
      nft: 'Team Champion Badge',
    },
    status: 'ACTIVE',
    progress: 62,
    timeRemaining: 14 * 60 * 60 * 1000,
  },
  {
    id: '2',
    title: 'Tetris Speed Challenge',
    description: 'Clear 1000 lines collectively in under 2 hours',
    game: 'Tetris',
    difficulty: 'HARD',
    participants: [
      { accountId: '0.0.333', username: 'TetrisKing' },
    ],
    maxParticipants: 3,
    rewards: {
      amount: '500',
      currency: 'HBAR',
    },
    status: 'ACTIVE',
    progress: 35,
    timeRemaining: 1.5 * 60 * 60 * 1000,
  },
  {
    id: '3',
    title: 'Multi-Game Masters',
    description: 'Win at least 5 games in each of 3 different games',
    game: 'Multiple',
    difficulty: 'EXPERT',
    participants: [
      { accountId: '0.0.444', username: 'AllRounder' },
      { accountId: '0.0.555', username: 'ProGamer' },
      { accountId: '0.0.666', username: 'GameMaster' },
    ],
    maxParticipants: 4,
    rewards: {
      amount: '2000',
      currency: 'REALM',
      nft: 'Legendary Team NFT',
    },
    status: 'ACTIVE',
    progress: 80,
    timeRemaining: 6 * 60 * 60 * 1000,
  },
];

export default function CoopChallenges() {
  const [challenges, setChallenges] = useState(mockChallenges);

  const handleJoinChallenge = (challengeId: string) => {
    toast.success('Joined co-op challenge!');
  };

  const handleStartChallenge = (challengeId: string) => {
    toast.success('Challenge started! Good luck!');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'HARD': return 'bg-orange-500';
      case 'EXPERT': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Co-op Challenges</h2>
          <p className="text-gray-400">Team up with friends to complete challenges and earn rewards</p>
        </div>
        <Button className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Create Challenge
        </Button>
      </div>

      {/* Active Challenges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((challenge) => (
          <Card key={challenge.id} className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-[#98ee2c]/30 transition-all">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <CardTitle className="text-white mb-2">{challenge.title}</CardTitle>
                  <p className="text-sm text-gray-400">{challenge.description}</p>
                </div>
                <Badge className={getDifficultyColor(challenge.difficulty)}>
                  {challenge.difficulty}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="border-[#98ee2c]/30 text-[#98ee2c]">
                  {challenge.game}
                </Badge>
                {challenge.status === 'ACTIVE' && (
                  <Badge className="bg-green-500">ACTIVE</Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="text-sm font-semibold text-[#98ee2c]">{challenge.progress}%</span>
                </div>
                <Progress value={challenge.progress} className="h-2" />
              </div>

              {/* Time Remaining */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Time Remaining</span>
                </div>
                <span className="text-sm font-semibold text-white">
                  {formatTimeRemaining(challenge.timeRemaining)}
                </span>
              </div>

              {/* Participants */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Team</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {challenge.participants.map((p, i) => (
                      <div
                        key={p.accountId}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-[#98ee2c] to-[#7bc922] flex items-center justify-center border-2 border-black"
                        title={p.username}
                      >
                        <span className="text-xs text-black font-bold">
                          {p.username[0].toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {challenge.participants.length}/{challenge.maxParticipants}
                  </span>
                </div>
              </div>

              {/* Rewards */}
              <div className="p-3 bg-gradient-to-br from-[#98ee2c]/20 to-[#7bc922]/10 rounded-lg border border-[#98ee2c]/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#98ee2c]" />
                    <span className="text-sm font-semibold text-white">Rewards</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-[#98ee2c]">
                    {challenge.rewards.amount} {challenge.rewards.currency}
                  </div>
                  {challenge.rewards.nft && (
                    <div className="text-xs text-gray-300">{challenge.rewards.nft}</div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {challenge.participants.length < challenge.maxParticipants && (
                  <Button
                    onClick={() => handleJoinChallenge(challenge.id)}
                    variant="outline"
                    className="flex-1 border-white/10 text-white hover:bg-white/5"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Join Team
                  </Button>
                )}
                <Button
                  onClick={() => handleStartChallenge(challenge.id)}
                  className="flex-1 bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Playing
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completed Challenges */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Recently Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <div className="text-white font-semibold">Snake Speed Run</div>
                <div className="text-sm text-gray-400">Completed 2 hours ago</div>
              </div>
              <div className="text-right">
                <div className="text-[#98ee2c] font-bold">+750 REALM</div>
                <div className="text-xs text-gray-400">Team of 3</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <div className="text-white font-semibold">Puzzle Masters</div>
                <div className="text-sm text-gray-400">Completed yesterday</div>
              </div>
              <div className="text-right">
                <div className="text-[#98ee2c] font-bold">+500 HBAR</div>
                <div className="text-xs text-gray-400">Team of 2</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
