'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Users, Calendar, Clock, Coins, Zap, Crown, Target } from 'lucide-react';
import { useDAppConnector } from '@/components/client-providers';
import { toast } from 'sonner';
import Link from 'next/link';
import { Plus } from 'lucide-react';
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
  description: string;
  imageUrl: string;
  eventType: string;
  startTime: string;
  endTime: string | null;
  location: string | null;
  prizePool: string | null;
  maxParticipants: number | null;
  isActive: boolean;
  participants: any[];
  _count: {
    participants: number;
  };
}


export default function TournamentsPage() {
  const { userAccountId } = useDAppConnector() ?? {};
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tournaments');
      const data = await response.json();
      setTournaments(data.tournaments || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast.error('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (tournament: Tournament) => {
    if (!userAccountId) {
      toast.error('Please connect your wallet to register');
      return;
    }
    setSelectedTournament(tournament);
    setShowRegisterModal(true);
  };

  const confirmRegistration = async () => {
    if (!selectedTournament || !userAccountId) return;
    
    setRegistering(true);
    try {
      const response = await fetch(`/api/tournaments/${selectedTournament.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userAccountId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }
      
      toast.success(`Successfully registered for ${selectedTournament.title}!`);
      setShowRegisterModal(false);
      setSelectedTournament(null);
      fetchTournaments();
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const getTournamentStatus = (tournament: Tournament) => {
    const now = new Date();
    const start = new Date(tournament.startTime);
    const end = tournament.endTime ? new Date(tournament.endTime) : null;

    if (end && now > end) return 'completed';
    if (now >= start && (!end || now <= end)) return 'active';
    return 'upcoming';
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
    if (status === 'all') return tournaments;
    return tournaments.filter((t) => getTournamentStatus(t) === status);
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
          
          <p className="text-xl text-gray-400 max-w-2xl mb-6">
            Join competitive tournaments, win prizes, and climb the ranks
          </p>

          <Link href="/tournaments/create">
            <Button className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Create Tournament
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active</p>
                  <p className="text-3xl font-bold text-[#98ee2c]">
                    {tournaments.filter((t) => getTournamentStatus(t) === 'active').length}
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
                    {tournaments.filter((t) => getTournamentStatus(t) === 'upcoming').length}
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
                  <p className="text-3xl font-bold text-white">
                    {tournaments.reduce((acc, t) => acc + parseInt(t.prizePool || '0'), 0)}
                  </p>
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
                  <p className="text-3xl font-bold text-white">
                    {tournaments.reduce((acc, t) => acc + t._count.participants, 0)}
                  </p>
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
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#98ee2c] mx-auto"></div>
                  <p className="text-gray-400 mt-4">Loading tournaments...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterTournaments(tab).map((tournament) => {
                    const status = getTournamentStatus(tournament);
                    return (
                      <Card key={tournament.id} className="bg-white/5 backdrop-blur-sm border-white/10 group hover:border-[#98ee2c]/30 transition-all">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <Badge className={getStatusColor(status)}>
                              {status.toUpperCase()}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl text-white">{tournament.title}</CardTitle>
                          <p className="text-sm text-gray-400">{tournament.description}</p>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Prize Pool */}
                          {tournament.prizePool && (
                            <div className="flex items-center justify-between p-3 bg-[#98ee2c]/10 rounded-lg border border-[#98ee2c]/20">
                              <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-[#98ee2c]" />
                                <span className="text-sm text-gray-400">Prize Pool</span>
                              </div>
                              <span className="font-bold text-[#98ee2c]">
                                {tournament.prizePool} REALM
                              </span>
                            </div>
                          )}

                          {/* Dates */}
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>Start:</span>
                              <span className="text-white">{new Date(tournament.startTime).toLocaleDateString()}</span>
                            </div>
                            {tournament.endTime && (
                              <div className="flex items-center gap-2 text-gray-400">
                                <Clock className="w-4 h-4" />
                                <span>End:</span>
                                <span className="text-white">{new Date(tournament.endTime).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          {/* Participants */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400">Participants</span>
                            </div>
                            <span className="text-sm font-medium text-white">
                              {tournament._count.participants}
                              {tournament.maxParticipants ? `/${tournament.maxParticipants}` : ''}
                            </span>
                          </div>

                          {/* Location */}
                          {tournament.location && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-400">Location</span>
                              <Badge variant="secondary" className="bg-white/10 text-white">
                                {tournament.location}
                              </Badge>
                            </div>
                          )}
                        </CardContent>

                        <CardFooter>
                          <Button
                            className="w-full bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90"
                            onClick={() => handleRegister(tournament)}
                            disabled={
                              status === 'completed' ||
                              (tournament.maxParticipants !== null && tournament._count.participants >= tournament.maxParticipants)
                            }
                          >
                            {status === 'completed'
                              ? 'Completed'
                              : tournament.maxParticipants && tournament._count.participants >= tournament.maxParticipants
                              ? 'Full'
                              : status === 'active'
                              ? 'Join Now'
                              : 'Register'}
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
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
                {selectedTournament.prizePool && (
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400">Prize Pool</span>
                    <span className="font-bold text-[#98ee2c]">
                      {selectedTournament.prizePool} REALM
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-400">Participants</span>
                  <span className="font-bold text-white">
                    {selectedTournament._count.participants}
                    {selectedTournament.maxParticipants ? `/${selectedTournament.maxParticipants}` : ''}
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

