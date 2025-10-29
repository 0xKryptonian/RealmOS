'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, Users, Calendar, Clock, Coins, Play, Eye, Video, 
  Share2, Download, MessageSquare, TrendingUp 
} from 'lucide-react';
import LivestreamPlayer from '@/components/stream/LivestreamPlayer';
import { useDAppConnector } from '@/components/client-providers';
import { toast } from 'sonner';

// Mock tournament data
const mockTournament = {
  id: '1',
  title: 'Chess Championship Finals',
  description: 'The ultimate chess tournament. Best players compete for glory and prizes.',
  game: 'Chess',
  format: 'SINGLE_ELIMINATION',
  status: 'ACTIVE',
  prizePool: '1000',
  currency: 'HBAR',
  participants: 32,
  maxParticipants: 32,
  currentRound: 3,
  totalRounds: 5,
  isStreamed: true,
  streamUrl: 'https://livepeer.studio/stream/...',
  playbackId: 'demo-playback-id',
  viewerCount: 1247,
  organizer: {
    name: 'HederaVerse Esports',
    accountId: '0.0.12345',
  },
  bracket: {
    rounds: [
      {
        roundNumber: 1,
        name: 'Round of 32',
        matches: 16,
        completed: 16,
      },
      {
        roundNumber: 2,
        name: 'Round of 16',
        matches: 8,
        completed: 8,
      },
      {
        roundNumber: 3,
        name: 'Quarter Finals',
        matches: 4,
        completed: 2,
      },
      {
        roundNumber: 4,
        name: 'Semi Finals',
        matches: 2,
        completed: 0,
      },
      {
        roundNumber: 5,
        name: 'Grand Final',
        matches: 1,
        completed: 0,
      },
    ],
  },
  activeMatches: [
    {
      id: 'm1',
      player1: { name: 'ChessMaster', accountId: '0.0.111', score: 2 },
      player2: { name: 'KingSlayer', accountId: '0.0.222', score: 1 },
      status: 'ACTIVE',
      streamUrl: 'stream-1',
    },
    {
      id: 'm2',
      player1: { name: 'QueenGambit', accountId: '0.0.333', score: 1 },
      player2: { name: 'RookRuler', accountId: '0.0.444', score: 1 },
      status: 'ACTIVE',
      streamUrl: 'stream-2',
    },
  ],
  prizes: [
    { position: 1, amount: '500 HBAR', nft: 'Gold Trophy NFT' },
    { position: 2, amount: '300 HBAR', nft: 'Silver Trophy NFT' },
    { position: 3, amount: '150 HBAR', nft: 'Bronze Trophy NFT' },
    { position: 4, amount: '50 HBAR' },
  ],
  stats: {
    totalMatches: 31,
    completedMatches: 26,
    averageMatchDuration: '18 min',
    peakViewers: 2341,
  },
};

export default function TournamentDetailPage() {
  const params = useParams();
  const { userAccountId } = useDAppConnector() ?? {};
  const [selectedMatch, setSelectedMatch] = useState(mockTournament.activeMatches[0]);
  const [isSpectating, setIsSpectating] = useState(false);

  const handleSpectate = (match: any) => {
    setSelectedMatch(match);
    setIsSpectating(true);
    toast.success(`Now spectating ${match.player1.name} vs ${match.player2.name}`);
  };

  const handleShareTournament = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Tournament link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-[#98ee2c] text-black">
                  {mockTournament.status}
                </Badge>
                <Badge variant="outline" className="border-[#98ee2c]/30 text-[#98ee2c]">
                  {mockTournament.format}
                </Badge>
                {mockTournament.isStreamed && (
                  <Badge className="bg-red-500 text-white animate-pulse">
                    <span className="w-2 h-2 bg-white rounded-full mr-2 inline-block" />
                    LIVE
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {mockTournament.title}
              </h1>
              <p className="text-gray-400 text-lg">{mockTournament.description}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleShareTournament}
              className="border-white/10 text-white hover:bg-white/5"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4 text-center">
                <Trophy className="h-6 w-6 text-[#98ee2c] mx-auto mb-1" />
                <div className="text-xl font-bold text-white">{mockTournament.prizePool}</div>
                <div className="text-xs text-gray-400">{mockTournament.currency}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 text-[#98ee2c] mx-auto mb-1" />
                <div className="text-xl font-bold text-white">{mockTournament.participants}</div>
                <div className="text-xs text-gray-400">Players</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4 text-center">
                <Eye className="h-6 w-6 text-[#98ee2c] mx-auto mb-1" />
                <div className="text-xl font-bold text-white">{mockTournament.viewerCount}</div>
                <div className="text-xs text-gray-400">Watching</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 text-[#98ee2c] mx-auto mb-1" />
                <div className="text-xl font-bold text-white">Round {mockTournament.currentRound}</div>
                <div className="text-xs text-gray-400">of {mockTournament.totalRounds}</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4 text-center">
                <Video className="h-6 w-6 text-[#98ee2c] mx-auto mb-1" />
                <div className="text-xl font-bold text-white">{mockTournament.activeMatches.length}</div>
                <div className="text-xs text-gray-400">Live Matches</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Livestream */}
            {mockTournament.isStreamed && (
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Video className="w-5 h-5 text-[#98ee2c]" />
                    Live Tournament Stream
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LivestreamPlayer
                    playbackId={mockTournament.playbackId}
                    title={`${selectedMatch.player1.name} vs ${selectedMatch.player2.name}`}
                    viewerCount={mockTournament.viewerCount}
                    isLive={true}
                  />
                  <div className="mt-4 p-4 bg-[#98ee2c]/10 border border-[#98ee2c]/30 rounded-lg">
                    <p className="text-sm text-gray-300">
                      💰 <strong>Watch-to-Earn:</strong> Earn REALM tokens by watching the tournament!
                      You&apos;ve earned <span className="text-[#98ee2c] font-bold">0.5 REALM</span> so far.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Matches */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Active Matches</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockTournament.activeMatches.map((match) => (
                  <div
                    key={match.id}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-[#98ee2c]/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold">{match.player1.name}</span>
                          <span className="text-2xl font-bold text-[#98ee2c]">{match.player1.score}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white font-semibold">{match.player2.name}</span>
                          <span className="text-2xl font-bold text-[#98ee2c]">{match.player2.score}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSpectate(match)}
                      className="w-full bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Spectate Match
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Bracket */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Tournament Bracket</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockTournament.bracket.rounds.map((round) => (
                    <div
                      key={round.roundNumber}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div>
                        <div className="text-white font-semibold">{round.name}</div>
                        <div className="text-sm text-gray-400">
                          {round.completed}/{round.matches} matches completed
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#98ee2c]">
                          {Math.round((round.completed / round.matches) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Prize Pool */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#98ee2c]" />
                  Prize Pool
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockTournament.prizes.map((prize) => (
                  <div
                    key={prize.position}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div>
                      <div className="text-white font-semibold">
                        {prize.position === 1 ? '🥇' : prize.position === 2 ? '🥈' : prize.position === 3 ? '🥉' : '🏅'}{' '}
                        {prize.position}st Place
                      </div>
                      {prize.nft && (
                        <div className="text-xs text-gray-400">{prize.nft}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-[#98ee2c] font-bold">{prize.amount}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tournament Stats */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Matches</span>
                  <span className="text-white font-semibold">{mockTournament.stats.totalMatches}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Completed</span>
                  <span className="text-white font-semibold">{mockTournament.stats.completedMatches}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Duration</span>
                  <span className="text-white font-semibold">{mockTournament.stats.averageMatchDuration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Peak Viewers</span>
                  <span className="text-white font-semibold">{mockTournament.stats.peakViewers.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Organizer */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-white font-semibold mb-1">{mockTournament.organizer.name}</div>
                <div className="text-sm text-gray-400 font-mono">{mockTournament.organizer.accountId}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
