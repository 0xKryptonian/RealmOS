'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Users, Calendar, Clock, Coins, Zap, Crown, Target } from 'lucide-react';
import { useDAppConnector } from '@/components/client-providers';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registering, setRegistering] = useState(false);

  const handleRegister = (tournament: Tournament) => {
    if (!userAccountId) {
      toast.error('Please connect your wallet to register');
      return;
    }
    setSelectedTournament(tournament);
    setShowRegisterModal(true);
  };

  const confirmRegistration = async () => {
    if (!selectedTournament) return;
    
    setRegistering(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Successfully registered for ${selectedTournament.title}!`, {
        description: `Entry fee: ${selectedTournament.entryFee}`,
      });
      
      setShowRegisterModal(false);
      setSelectedTournament(null);
    } catch {
      toast.error('Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[#98ee2c]';
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
    <div className="min-h-screen bg-black pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-[#98ee2c]/10 border border-[#98ee2c]/30 rounded-full mb-6">
            <Trophy className="h-4 w-4 text-[#98ee2c] mr-2" />
            <span className="text-[#98ee2c] text-sm font-medium">
              Compete for Prizes on Hedera
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] bg-clip-text text-transparent">
              Tournaments
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl">
            Join competitive tournaments, win prizes, and climb the ranks
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active</p>
                  <p className="text-3xl font-bold text-[#98ee2c]">
                    {mockTournaments.filter((t) => t.status === 'active').length}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-[#98ee2c]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Upcoming</p>
                  <p className="text-3xl font-bold text-white">
                    {mockTournaments.filter((t) => t.status === 'upcoming').length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-[#98ee2c]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Prize Pool</p>
                  <p className="text-3xl font-bold text-white">1000+</p>
                </div>
                <Coins className="w-8 h-8 text-[#98ee2c]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Players</p>
                  <p className="text-3xl font-bold text-white">69</p>
                </div>
                <Users className="w-8 h-8 text-[#98ee2c]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tournaments List */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10 mb-8">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-[#98ee2c]/10 data-[state=active]:text-[#98ee2c]"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-[#98ee2c]/10 data-[state=active]:text-[#98ee2c]"
            >
              Active
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-[#98ee2c]/10 data-[state=active]:text-[#98ee2c]"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-[#98ee2c]/10 data-[state=active]:text-[#98ee2c]"
            >
              Completed
            </TabsTrigger>
          </TabsList>

          {['all', 'active', 'upcoming', 'completed'].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterTournaments(tab).map((tournament) => (
                  <Card key={tournament.id} className="bg-white/5 backdrop-blur-sm border-white/10 group hover:border-[#98ee2c]/30 transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={getStatusColor(tournament.status)}>
                          {tournament.status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="border-[#98ee2c]/30 text-[#98ee2c]">
                          {tournament.game}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl text-white">{tournament.title}</CardTitle>
                      <p className="text-sm text-gray-400">{tournament.description}</p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Prize Pool */}
                      <div className="flex items-center justify-between p-3 bg-[#98ee2c]/10 rounded-lg border border-[#98ee2c]/20">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-[#98ee2c]" />
                          <span className="text-sm text-gray-400">Prize Pool</span>
                        </div>
                        <span className="font-bold text-[#98ee2c]">
                          {tournament.prizePool} {tournament.currency}
                        </span>
                      </div>

                      {/* Dates */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>Start:</span>
                          <span className="text-white">{new Date(tournament.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>End:</span>
                          <span className="text-white">{new Date(tournament.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Participants */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-400">Participants</span>
                        </div>
                        <span className="text-sm font-medium text-white">
                          {tournament.participants}/{tournament.maxParticipants}
                        </span>
                      </div>

                      {/* Entry Fee */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Entry Fee</span>
                        <Badge variant="secondary" className="bg-white/10 text-white">
                          {tournament.entryFee}
                        </Badge>
                      </div>

                      {/* Prizes */}
                      <div className="space-y-2">
                        <p className="text-sm font-semibold flex items-center gap-2 text-white">
                          <Crown className="w-4 h-4 text-[#98ee2c]" />
                          Prizes
                        </p>
                        {tournament.prizes.map((prize) => (
                          <div
                            key={prize.position}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-400">
                              {prize.position === 1 ? '🥇' : prize.position === 2 ? '🥈' : '🥉'}{' '}
                              {prize.position}st Place
                            </span>
                            <span className="font-medium text-white">{prize.amount}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button
                        className="w-full bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90"
                        onClick={() => handleRegister(tournament)}
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
                  <Target className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-white">No tournaments found</h3>
                  <p className="text-gray-400">Check back later for new tournaments</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Registration Modal */}
        <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
          <DialogContent className="bg-[#1a1a1a] border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-white">Register for Tournament</DialogTitle>
              <DialogDescription className="text-gray-400">
                {selectedTournament?.title}
              </DialogDescription>
            </DialogHeader>
            
            {selectedTournament && (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-400">Entry Fee</span>
                  <span className="font-bold text-white">{selectedTournament.entryFee}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-400">Prize Pool</span>
                  <span className="font-bold text-[#98ee2c]">
                    {selectedTournament.prizePool} {selectedTournament.currency}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-400">Participants</span>
                  <span className="font-bold text-white">
                    {selectedTournament.participants}/{selectedTournament.maxParticipants}
                  </span>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRegisterModal(false)}
                className="border-gray-700 text-gray-300 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmRegistration}
                disabled={registering}
                className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90"
              >
                {registering ? 'Registering...' : 'Confirm Registration'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
