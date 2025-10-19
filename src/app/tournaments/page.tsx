'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Users, Calendar, Clock, Coins, Zap, Crown, Target } from 'lucide-react';
import { useDAppConnector } from '@/components/client-providers';
import { toast } from 'sonner';

interface Tournament {
  id: string;
  title: string;
  game: string;
  description: string;
  prizePool: string;
  currency: string;
  startDate: string;
  endDate: string;
  participants: number;
  maxParticipants: number;
  status: 'upcoming' | 'active' | 'completed';
  entryFee?: string;
  prizes: {
    position: number;
    amount: string;
    nft?: string;
  }[];
}

const mockTournaments: Tournament[] = [
  {
    id: '1',
    title: 'Chess Championship',
    game: 'Chess',
    description: 'Compete in the ultimate chess tournament. Best of 3 matches.',
    prizePool: '500',
    currency: 'HBAR',
    startDate: '2025-11-01',
    endDate: '2025-11-07',
    participants: 24,
    maxParticipants: 32,
    status: 'upcoming',
    entryFee: '10 HBAR',
    prizes: [
      { position: 1, amount: '250 HBAR', nft: 'Gold Trophy NFT' },
      { position: 2, amount: '150 HBAR', nft: 'Silver Trophy NFT' },
      { position: 3, amount: '100 HBAR', nft: 'Bronze Trophy NFT' },
    ],
  },
  {
    id: '2',
    title: 'Tetris Speed Run',
    game: 'Tetris',
    description: 'Race to clear 40 lines. Fastest time wins!',
    prizePool: '300',
    currency: 'REALM',
    startDate: '2025-10-29',
    endDate: '2025-10-31',
    participants: 45,
    maxParticipants: 50,
    status: 'active',
    entryFee: 'Free',
    prizes: [
      { position: 1, amount: '150 REALM' },
      { position: 2, amount: '100 REALM' },
      { position: 3, amount: '50 REALM' },
    ],
  },
  {
    id: '3',
    title: 'Sudoku Masters',
    game: 'Sudoku',
    description: 'Solve expert-level puzzles. Accuracy and speed matter.',
    prizePool: '200',
    currency: 'HBAR',
    startDate: '2025-11-05',
    endDate: '2025-11-12',
    participants: 0,
    maxParticipants: 64,
    status: 'upcoming',
    entryFee: '5 HBAR',
    prizes: [
      { position: 1, amount: '100 HBAR' },
      { position: 2, amount: '60 HBAR' },
      { position: 3, amount: '40 HBAR' },
    ],
  },
];

export default function TournamentsPage() {
  const { userAccountId } = useDAppConnector() ?? {};
  const [selectedTab, setSelectedTab] = useState('upcoming');

  const handleRegister = (tournamentId: string) => {
    if (!userAccountId) {
      toast.error('Please connect your wallet to register');
      return;
    }
    toast.success('Registration coming soon!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'upcoming':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filterTournaments = (status: string) => {
    if (status === 'all') return mockTournaments;
    return mockTournaments.filter((t) => t.status === status);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Tournaments
            </h1>
            <p className="text-muted-foreground">
              Compete for prizes and glory on Hedera
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {mockTournaments.filter((t) => t.status === 'active').length}
                </p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">
                  {mockTournaments.filter((t) => t.status === 'upcoming').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Prize Pool</p>
                <p className="text-2xl font-bold">1000+</p>
              </div>
              <Coins className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Participants</p>
                <p className="text-2xl font-bold">69</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tournaments List */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        {['all', 'active', 'upcoming', 'completed'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterTournaments(tab).map((tournament) => (
                <Card key={tournament.id} className="group hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getStatusColor(tournament.status)}>
                        {tournament.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{tournament.game}</Badge>
                    </div>
                    <CardTitle className="text-xl">{tournament.title}</CardTitle>
                    <CardDescription>{tournament.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Prize Pool */}
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="text-sm text-muted-foreground">Prize Pool</span>
                      </div>
                      <span className="font-bold text-yellow-500">
                        {tournament.prizePool} {tournament.currency}
                      </span>
                    </div>

                    {/* Dates */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Start:</span>
                        <span>{new Date(tournament.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">End:</span>
                        <span>{new Date(tournament.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Participants */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Participants</span>
                      </div>
                      <span className="text-sm font-medium">
                        {tournament.participants}/{tournament.maxParticipants}
                      </span>
                    </div>

                    {/* Entry Fee */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Entry Fee</span>
                      <Badge variant="secondary">{tournament.entryFee}</Badge>
                    </div>

                    {/* Prizes */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        Prizes
                      </p>
                      {tournament.prizes.map((prize) => (
                        <div
                          key={prize.position}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted-foreground">
                            {prize.position === 1 ? '🥇' : prize.position === 2 ? '🥈' : '🥉'}{' '}
                            {prize.position}st Place
                          </span>
                          <span className="font-medium">{prize.amount}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handleRegister(tournament.id)}
                      disabled={
                        tournament.status === 'completed' ||
                        tournament.participants >= tournament.maxParticipants
                      }
                    >
                      {tournament.status === 'completed'
                        ? 'Completed'
                        : tournament.participants >= tournament.maxParticipants
                        ? 'Full'
                        : tournament.status === 'active'
                        ? 'Join Now'
                        : 'Register'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filterTournaments(tab).length === 0 && (
              <div className="text-center py-12">
                <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tournaments found</h3>
                <p className="text-muted-foreground">Check back later for new tournaments</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
