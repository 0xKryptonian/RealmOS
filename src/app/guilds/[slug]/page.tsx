'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Users, Trophy, Coins, MessageSquare, Calendar,
  Send, Crown, TrendingUp, Target, Settings, UserPlus
} from 'lucide-react';
import { useDAppConnector } from '@/components/client-providers';
import { toast } from 'sonner';

const mockGuild = {
  id: '1',
  name: 'Dragon Slayers',
  slug: 'dragon-slayers',
  description: 'Elite gaming guild focused on competitive tournaments and community growth. Join us to dominate the leaderboards!',
  imageUrl: '/images/guild1.png',
  bannerUrl: '/images/guild-banner.jpg',
  founderId: '0.0.12345',
  members: [
    { accountId: '0.0.12345', username: 'DragonKing', role: 'FOUNDER', contribution: 50000, isActive: true },
    { accountId: '0.0.23456', username: 'FireMage', role: 'ADMIN', contribution: 30000, isActive: true },
    { accountId: '0.0.34567', username: 'IceWarrior', role: 'MEMBER', contribution: 15000, isActive: true },
    { accountId: '0.0.45678', username: 'ThunderBolt', role: 'MEMBER', contribution: 12000, isActive: false },
  ],
  treasuryBalance: '125000',
  treasuryCurrency: 'REALM' as const,
  totalTournaments: 24,
  totalWins: 18,
  ranking: 3,
  isPublic: true,
  createdAt: new Date('2024-01-15'),
  stats: {
    winRate: 75,
    avgPlacement: 2.1,
    totalPrizes: '50000 HBAR',
  },
};

const mockTournaments = [
  { id: '1', title: 'Guild Chess Championship', status: 'ACTIVE', prize: '5000 REALM', participants: 16 },
  { id: '2', title: 'Weekly Tetris Battle', status: 'UPCOMING', prize: '2000 REALM', participants: 8 },
  { id: '3', title: 'Snake Masters Cup', status: 'COMPLETED', prize: '3000 REALM', participants: 12 },
];

const mockMessages = [
  { id: '1', sender: 'DragonKing', content: 'Great tournament today everyone!', time: '2 min ago' },
  { id: '2', sender: 'FireMage', content: 'When is the next practice session?', time: '5 min ago' },
  { id: '3', sender: 'IceWarrior', content: 'I can help with strategy training tomorrow', time: '10 min ago' },
];

const mockEvents = [
  { id: '1', title: 'Strategy Training Session', type: 'TRAINING', date: '2025-10-30', attendees: 12 },
  { id: '2', title: 'Guild Tournament Finals', type: 'TOURNAMENT', date: '2025-11-02', attendees: 24 },
  { id: '3', title: 'Community Hangout', type: 'SOCIAL', date: '2025-11-05', attendees: 18 },
];

export default function GuildDetailPage() {
  const params = useParams();
  const { userAccountId } = useDAppConnector() ?? {};
  const [message, setMessage] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [isMember, setIsMember] = useState(false);

  const handleJoinGuild = () => {
    if (!userAccountId) {
      toast.error('Please connect your wallet to join');
      return;
    }
    setIsMember(true);
    toast.success(`Welcome to ${mockGuild.name}!`);
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
    toast.success(`Contributed ${contributionAmount} ${mockGuild.treasuryCurrency} to treasury!`);
    setContributionAmount('');
  };

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
                <h1 className="text-4xl font-bold text-white">{mockGuild.name}</h1>
                <Badge className="bg-[#98ee2c]/10 text-[#98ee2c] border-[#98ee2c]/30">
                  #{mockGuild.ranking} Ranked
                </Badge>
              </div>
              <p className="text-gray-400 max-w-2xl">{mockGuild.description}</p>
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
              <div className="text-2xl font-bold text-white">{mockGuild.members.length}</div>
              <div className="text-xs text-gray-400">Members</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <Coins className="h-6 w-6 text-[#98ee2c] mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{parseInt(mockGuild.treasuryBalance).toLocaleString()}</div>
              <div className="text-xs text-gray-400">{mockGuild.treasuryCurrency}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 text-[#98ee2c] mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{mockGuild.totalWins}</div>
              <div className="text-xs text-gray-400">Wins</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 text-[#98ee2c] mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{mockGuild.stats.winRate}%</div>
              <div className="text-xs text-gray-400">Win Rate</div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-[#98ee2c] mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">#{mockGuild.ranking}</div>
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
                      {mockMessages.map((msg) => (
                        <div key={msg.id} className="p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[#98ee2c] font-semibold">{msg.sender}</span>
                            <span className="text-xs text-gray-500">{msg.time}</span>
                          </div>
                          <p className="text-white">{msg.content}</p>
                        </div>
                      ))}
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
                    {mockTournaments.map((tournament) => (
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
                          <span className="text-gray-400">{tournament.participants} participants</span>
                          <span className="text-[#98ee2c] font-semibold">{tournament.prize}</span>
                        </div>
                      </div>
                    ))}
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
                    {mockEvents.map((event) => (
                      <div key={event.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-white font-semibold">{event.title}</h3>
                          <Badge variant="outline" className="border-[#98ee2c]/30 text-[#98ee2c]">
                            {event.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {event.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.attendees} attending
                          </span>
                        </div>
                      </div>
                    ))}
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
                        {parseInt(mockGuild.treasuryBalance).toLocaleString()}
                      </div>
                      <div className="text-[#98ee2c]">{mockGuild.treasuryCurrency}</div>
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
                <CardTitle className="text-white">Members ({mockGuild.members.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockGuild.members.map((member) => (
                  <div key={member.accountId} className="flex items-center justify-between p-2">
                    <div>
                      <div className="text-white font-semibold flex items-center gap-2">
                        {member.username}
                        {member.role === 'FOUNDER' && <Crown className="w-4 h-4 text-yellow-500" />}
                        {member.role === 'ADMIN' && <Shield className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">{member.accountId}</div>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Top Contributors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockGuild.members
                  .sort((a, b) => b.contribution - a.contribution)
                  .slice(0, 3)
                  .map((member, index) => (
                    <div key={member.accountId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                        <span className="text-white">{member.username}</span>
                      </div>
                      <span className="text-[#98ee2c] font-semibold">
                        {member.contribution.toLocaleString()}
                      </span>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
