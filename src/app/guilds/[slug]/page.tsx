'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Users, Trophy, Coins, MessageSquare,
  Send, Crown, TrendingUp, Target, UserPlus
} from 'lucide-react';
import { useDAppConnector } from '@/components/client-providers';
import { toast } from 'sonner';


interface Guild {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  bannerUrl: string | null;
  founderId: string;
  treasuryBalance: string;
  memberCount: number;
  isPublic: boolean;
  members: Array<{
    id: string;
    userId: string;
    role: string;
    contribution: string;
    joinedAt: string;
  }>;
  tournaments: Array<{
    id: string;
    title: string;
    status: string;
    prizePool: string;
  }>;
}

export default function GuildDetailPage() {
  const params = useParams();
  const { userAccountId } = useDAppConnector() ?? {};
  const [message, setMessage] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [guild, setGuild] = useState<Guild | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchGuildData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.slug]);

  const fetchGuildData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/guilds/${params.slug}`);
      if (!response.ok) throw new Error('Guild not found');
      const data = await response.json();
      setGuild(data.guild);
      
      // Check if user is a member
      if (userAccountId && data.guild.members) {
        setIsMember(data.guild.members.some((m: { userId: string }) => m.userId === userAccountId));
      }
    } catch (error) {
      console.error('Error fetching guild:', error);
      toast.error('Failed to load guild');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGuild = async () => {
    if (!userAccountId) {
      toast.error('Please connect your wallet to join');
      return;
    }
    if (!guild) return;

    try {
      const response = await fetch(`/api/guilds/${guild.slug}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userAccountId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join guild');
      }

      setIsMember(true);
      toast.success(`Welcome to ${guild.name}!`);
      fetchGuildData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join guild';
      toast.error(errorMessage);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    toast.success('Message sent!');
    setMessage('');
  };

  const handleContribute = () => {
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    toast.success(`Contributed ${contributionAmount} REALM to treasury!`);
    setContributionAmount('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#98ee2c]"></div>
      </div>
    );
  }

  if (!guild) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Guild Not Found</h2>
          <p className="text-gray-400">The guild you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  const ranking = 3;
  const winRate = 75;
  const totalWins = guild.tournaments?.filter(t => t.status === 'COMPLETED').length || 0;

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Banner */}
        <div className="relative h-48 md:h-64 rounded-xl overflow-hidden mb-8 bg-gradient-to-br from-[#98ee2c]/20 to-[#7bc922]/10">
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="w-32 h-32 text-[#98ee2c]/30" />
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 -mt-20 relative z-10">
          <div className="flex items-start gap-4 mb-4 md:mb-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#98ee2c] to-[#7bc922] flex items-center justify-center border-4 border-black">
              <Crown className="w-12 h-12 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-4xl font-bold text-white">{guild.name}</h1>
                <Badge className="bg-[#98ee2c]/10 text-[#98ee2c] border-[#98ee2c]/30">
                  #{ranking} Ranked
                </Badge>
              </div>
              <p className="text-gray-400 max-w-2xl">{guild.description || 'No description available'}</p>
            </div>
          </div>
          {!isMember && (
            <Button
              onClick={handleJoinGuild}
              className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Join Guild
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-[#98ee2c] mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{guild.memberCount}</div>
              <div className="text-xs text-gray-400">Members</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <Coins className="h-6 w-6 text-[#98ee2c] mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{parseInt(guild.treasuryBalance).toLocaleString()}</div>
              <div className="text-xs text-gray-400">REALM</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 text-[#98ee2c] mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{totalWins}</div>
              <div className="text-xs text-gray-400">Wins</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 text-[#98ee2c] mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{winRate}%</div>
              <div className="text-xs text-gray-400">Win Rate</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-[#98ee2c] mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">#{ranking}</div>
              <div className="text-xs text-gray-400">Global Rank</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10 mb-6">
                <TabsTrigger value="chat" className="data-[state=active]:bg-[#98ee2c]/10 data-[state=active]:text-[#98ee2c]">
                  Chat
                </TabsTrigger>
                <TabsTrigger value="tournaments" className="data-[state=active]:bg-[#98ee2c]/10 data-[state=active]:text-[#98ee2c]">
                  Tournaments
                </TabsTrigger>
                <TabsTrigger value="events" className="data-[state=active]:bg-[#98ee2c]/10 data-[state=active]:text-[#98ee2c]">
                  Events
                </TabsTrigger>
                <TabsTrigger value="treasury" className="data-[state=active]:bg-[#98ee2c]/10 data-[state=active]:text-[#98ee2c]">
                  Treasury
                </TabsTrigger>
              </TabsList>

              {/* Chat Tab */}
              <TabsContent value="chat">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-[#98ee2c]" />
                      Guild Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4 h-96 overflow-y-auto">
                      <div className="text-center py-12 text-gray-400">
                        Guild chat coming soon! Connect with your guild members.
                      </div>
                    </div>
                    {isMember && (
                      <div className="flex gap-2">
                        <Input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="bg-white/5 border-white/10 text-white"
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button
                          onClick={handleSendMessage}
                          className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {!isMember && (
                      <div className="text-center py-4 text-gray-400">
                        Join the guild to participate in chat
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tournaments Tab */}
              <TabsContent value="tournaments">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Guild Tournaments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {guild.tournaments && guild.tournaments.length > 0 ? (
                      guild.tournaments.map((tournament) => (
                        <div key={tournament.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white font-semibold">{tournament.title}</h3>
                            <Badge className={
                              tournament.status === 'ACTIVE' ? 'bg-[#98ee2c]' :
                              tournament.status === 'UPCOMING' ? 'bg-blue-500' :
                              'bg-gray-500'
                            }>
                              {tournament.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#98ee2c] font-semibold">{tournament.prizePool} REALM</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        No tournaments yet. Create one to get started!
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Upcoming Events</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center py-8 text-gray-400">
                      No upcoming events. Check back later!
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Treasury Tab */}
              <TabsContent value="treasury">
                <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Coins className="w-5 h-5 text-[#98ee2c]" />
                      Guild Treasury
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 p-6 bg-gradient-to-br from-[#98ee2c]/20 to-[#7bc922]/10 rounded-lg border border-[#98ee2c]/30">
                      <div className="text-sm text-gray-400 mb-2">Total Balance</div>
                      <div className="text-4xl font-bold text-white mb-1">
                        {parseInt(guild.treasuryBalance).toLocaleString()}
                      </div>
                      <div className="text-[#98ee2c]">REALM</div>
                    </div>

                    {isMember && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-gray-400 mb-2 block">Contribute to Treasury</label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={contributionAmount}
                              onChange={(e) => setContributionAmount(e.target.value)}
                              placeholder="Amount"
                              className="bg-white/5 border-white/10 text-white"
                            />
                            <Button
                              onClick={handleContribute}
                              className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold"
                            >
                              Contribute
                            </Button>
                          </div>
                        </div>

                        <div className="text-sm text-gray-400">
                          Treasury funds are used for guild tournaments, events, and member rewards.
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Members */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Members ({guild.memberCount})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {guild.members && guild.members.length > 0 ? (
                  guild.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2">
                      <div>
                        <div className="text-white font-semibold flex items-center gap-2">
                          {member.userId}
                          {member.role === 'FOUNDER' && <Crown className="w-4 h-4 text-yellow-500" />}
                          {member.role === 'ADMIN' && <Shield className="w-4 h-4 text-blue-500" />}
                        </div>
                        <div className="text-xs text-gray-400">{member.role}</div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400">No members yet</div>
                )}
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Top Contributors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {guild.members && guild.members.length > 0 ? (
                  guild.members
                    .sort((a, b) => parseInt(b.contribution) - parseInt(a.contribution))
                    .slice(0, 3)
                    .map((member, index) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                          <span className="text-white">{member.userId}</span>
                        </div>
                        <span className="text-[#98ee2c] font-semibold">
                          {parseInt(member.contribution).toLocaleString()}
                        </span>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-4 text-gray-400">No contributors yet</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
