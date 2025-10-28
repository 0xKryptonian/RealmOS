'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield, Trophy, Search, Plus, Crown, Coins, TrendingUp } from 'lucide-react';
import { useDAppConnector } from '@/components/client-providers';
import { toast } from 'sonner';

interface Guild {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  memberCount: number;
  treasuryBalance: string;
  isPublic: boolean;
  founderId: string;
}

const mockGuilds: Guild[] = [
  {
    id: '1',
    name: 'Dragon Slayers',
    slug: 'dragon-slayers',
    description: 'Elite gaming guild focused on competitive tournaments and community growth',
    imageUrl: '/images/guild1.png',
    memberCount: 156,
    treasuryBalance: '50000',
    isPublic: true,
    founderId: '0.0.12345',
  },
  {
    id: '2',
    name: 'Crypto Knights',
    slug: 'crypto-knights',
    description: 'Building the future of Web3 gaming together. Join us for epic battles!',
    imageUrl: '/images/guild2.png',
    memberCount: 89,
    treasuryBalance: '32000',
    isPublic: true,
    founderId: '0.0.23456',
  },
  {
    id: '3',
    name: 'Hedera Heroes',
    slug: 'hedera-heroes',
    description: 'Official Hedera gaming community. Play, earn, and grow with us.',
    imageUrl: '/images/guild3.png',
    memberCount: 234,
    treasuryBalance: '125000',
    isPublic: true,
    founderId: '0.0.34567',
  },
];

export default function GuildsPage() {
  const { userAccountId } = useDAppConnector() ?? {};
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');

  const handleJoinGuild = (guild: Guild) => {
    if (!userAccountId) {
      toast.error('Please connect your wallet to join a guild');
      return;
    }
    toast.success(`Joined ${guild.name}!`, {
      description: 'Welcome to the guild!',
    });
  };

  const filteredGuilds = mockGuilds.filter((guild) =>
    guild.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-[#98ee2c]/10 border border-[#98ee2c]/30 rounded-full mb-6">
            <Shield className="h-4 w-4 text-[#98ee2c] mr-2" />
            <span className="text-[#98ee2c] text-sm font-medium">
              Build Your Gaming Community
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] bg-clip-text text-transparent">
              Guilds
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mb-8">
            Join or create guilds, compete in tournaments, and build your gaming legacy
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search guilds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <Link href="/guilds/create">
              <Button className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Create Guild
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Guilds</p>
                  <p className="text-3xl font-bold text-white">{mockGuilds.length}</p>
                </div>
                <Shield className="w-8 h-8 text-[#98ee2c]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Members</p>
                  <p className="text-3xl font-bold text-white">
                    {mockGuilds.reduce((acc, g) => acc + g.memberCount, 0)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-[#98ee2c]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Treasury</p>
                  <p className="text-3xl font-bold text-white">
                    {(mockGuilds.reduce((acc, g) => acc + parseInt(g.treasuryBalance), 0) / 1000).toFixed(0)}K
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
                  <p className="text-sm text-gray-400">Active</p>
                  <p className="text-3xl font-bold text-[#98ee2c]">{mockGuilds.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-[#98ee2c]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guilds List */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 mb-8">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-[#98ee2c]/10 data-[state=active]:text-[#98ee2c]"
            >
              All Guilds
            </TabsTrigger>
            <TabsTrigger
              value="popular"
              className="data-[state=active]:bg-[#98ee2c]/10 data-[state=active]:text-[#98ee2c]"
            >
              Popular
            </TabsTrigger>
            <TabsTrigger
              value="my-guilds"
              className="data-[state=active]:bg-[#98ee2c]/10 data-[state=active]:text-[#98ee2c]"
            >
              My Guilds
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuilds.map((guild) => (
                <Card
                  key={guild.id}
                  className="bg-white/5 backdrop-blur-sm border-white/10 group hover:border-[#98ee2c]/30 transition-all overflow-hidden"
                >
                  <div className="h-32 bg-gradient-to-br from-[#98ee2c]/20 to-[#7bc922]/10 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Shield className="w-16 h-16 text-[#98ee2c]/30" />
                    </div>
                  </div>

                  <CardHeader className="relative -mt-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#98ee2c] to-[#7bc922] flex items-center justify-center mb-4 border-4 border-black">
                      <Crown className="w-8 h-8 text-black" />
                    </div>
                    <CardTitle className="text-xl text-white">{guild.name}</CardTitle>
                    <p className="text-sm text-gray-400 line-clamp-2">{guild.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Members</span>
                      </div>
                      <span className="text-sm font-medium text-white">{guild.memberCount}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Treasury</span>
                      </div>
                      <span className="text-sm font-medium text-[#98ee2c]">
                        {parseInt(guild.treasuryBalance).toLocaleString()} REALM
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">Status</span>
                      </div>
                      <Badge className="bg-[#98ee2c]/10 text-[#98ee2c] border-[#98ee2c]/30">
                        {guild.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    <Link href={`/guilds/${guild.slug}`} className="flex-1">
                      <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      className="flex-1 bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90"
                      onClick={() => handleJoinGuild(guild)}
                    >
                      Join Guild
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filteredGuilds.length === 0 && (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">No guilds found</h3>
                <p className="text-gray-400">Try adjusting your search or create a new guild</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
