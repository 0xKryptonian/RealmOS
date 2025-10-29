'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Users, Clock, TrendingUp, Radio } from 'lucide-react';
import Link from 'next/link';

interface Stream {
  id: string;
  playbackId: string;
  title: string;
  streamer: string;
  game: string;
  viewerCount: number;
  isLive: boolean;
  thumbnailUrl?: string;
  startedAt: string;
  description?: string;
}

const mockStreams: Stream[] = [
  {
    id: '1',
    playbackId: 'f5eese9wwl7c7htl',
    title: 'Chess Championship Finals - Epic Showdown!',
    streamer: 'ProGamer123',
    game: 'Chess',
    viewerCount: 1234,
    isLive: true,
    startedAt: new Date().toISOString(),
  },
  {
    id: '2',
    playbackId: 'f5eese9wwl7c7htl',
    title: 'Tetris Speed Run Challenge',
    streamer: 'TetrisMaster',
    game: 'Tetris',
    viewerCount: 567,
    isLive: true,
    startedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export default function LivestreamPage() {
  const [selectedTab, setSelectedTab] = useState('live');
  const [streams, setStreams] = useState<Stream[]>(mockStreams);

  useEffect(() => {
    // Load streams from localStorage
    const savedStreams = localStorage.getItem('hedera-streams');
    if (savedStreams) {
      const parsedStreams = JSON.parse(savedStreams);
      // Merge with mock streams
      setStreams([...parsedStreams, ...mockStreams]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-[#98ee2c]/10 border border-[#98ee2c]/30 rounded-full mb-6">
            <Radio className="h-4 w-4 text-[#98ee2c] mr-2" />
            <span className="text-[#98ee2c] text-sm font-medium">
              Watch Live Gaming Events
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] bg-clip-text text-transparent">
              Live Streams
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mb-8">
            Watch tournaments, learn from pros, and earn rewards while viewing
          </p>

          <Link href="/livestream/create">
            <Button className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90">
              <Video className="w-4 h-4 mr-2" />
              Start Streaming
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Live Now</p>
                  <p className="text-3xl font-bold text-[#98ee2c]">
                    {streams.filter((s) => s.isLive).length}
                  </p>
                </div>
                <Radio className="w-8 h-8 text-[#98ee2c]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Viewers</p>
                  <p className="text-3xl font-bold text-white">
                    {streams.reduce((acc, s) => acc + s.viewerCount, 0).toLocaleString()}
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
                  <p className="text-sm text-gray-400">Hours Streamed</p>
                  <p className="text-3xl font-bold text-white">1.2K</p>
                </div>
                <Clock className="w-8 h-8 text-[#98ee2c]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Trending</p>
                  <p className="text-3xl font-bold text-white">Chess</p>
                </div>
                <TrendingUp className="w-8 h-8 text-[#98ee2c]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Streams */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 mb-8">
            <TabsTrigger
              value="live"
              className="data-[state=active]:bg-[#98ee2c]/10 data-[state=active]:text-[#98ee2c]"
            >
              Live Now
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-[#98ee2c]/10 data-[state=active]:text-[#98ee2c]"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="data-[state=active]:bg-[#98ee2c]/10 data-[state=active]:text-[#98ee2c]"
            >
              Past Streams
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {streams
                .filter((s) => s.isLive)
                .map((stream) => (
                  <Link key={stream.id} href={`/livestream/${stream.id}`}>
                    <Card className="bg-white/5 backdrop-blur-sm border-white/10 group hover:border-[#98ee2c]/30 transition-all overflow-hidden cursor-pointer">
                      <div className="relative aspect-video bg-gradient-to-br from-[#98ee2c]/20 to-[#7bc922]/10">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Video className="w-16 h-16 text-[#98ee2c]/30" />
                        </div>
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-red-500 text-white animate-pulse">
                            <span className="w-2 h-2 bg-white rounded-full mr-2 inline-block" />
                            LIVE
                          </Badge>
                        </div>
                        <div className="absolute bottom-4 right-4">
                          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            <Users className="w-4 h-4 text-white" />
                            <span className="text-white text-sm font-medium">
                              {stream.viewerCount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg text-white group-hover:text-[#98ee2c] transition-colors">
                          {stream.title}
                        </CardTitle>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{stream.streamer}</span>
                          <Badge variant="outline" className="border-[#98ee2c]/30 text-[#98ee2c]">
                            {stream.game}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
            </div>

            {streams.filter((s) => s.isLive).length === 0 && (
              <div className="text-center py-12">
                <Radio className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">No live streams</h3>
                <p className="text-gray-400">Check back later or start your own stream!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">No upcoming streams</h3>
              <p className="text-gray-400">Schedule a stream to appear here</p>
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="text-center py-12">
              <Video className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">No past streams</h3>
              <p className="text-gray-400">Stream recordings will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
