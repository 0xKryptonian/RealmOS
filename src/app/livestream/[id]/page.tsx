'use client';

import { use, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Share2, Heart, MessageCircle, Copy, Key, Video as VideoIcon } from 'lucide-react';
import Link from 'next/link';
import { PlayerWithControls } from '@/components/stream/StreamPlayer';
import { Src } from '@livepeer/react';
import { toast } from 'sonner';
import { useDAppConnector } from '@/components/client-providers';

interface StreamData {
  id: string;
  playbackId: string;
  title: string;
  streamer: string;
  streamerId?: string;
  streamerAccountId?: string;
  game: string;
  viewerCount: number;
  isLive: boolean;
  description?: string;
  startedAt: string;
  streamKey?: string;
  rtmpUrl?: string;
}

export default function LivestreamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const dAppContext = useDAppConnector();
  const userAccountId = dAppContext?.userAccountId;
  const [stream, setStream] = useState<StreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; text: string; sender: string; timestamp: number }>>([]);

  const isOwner = stream && userAccountId && (stream.streamerAccountId === userAccountId);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  useEffect(() => {
    // Load stream data from API
    const loadStream = async () => {
      try {
        const response = await fetch(`/api/livestream/${id}`);
        const data = await response.json();

        if (data.success && data.stream) {
          setStream(data.stream);
        } else {
          // Fallback to mock data for demo
          const mockStreams: StreamData[] = [
            {
              id: '1',
              playbackId: 'f5eese9wwl7c7htl',
              title: 'Chess Championship Finals - Epic Showdown!',
              streamer: 'ProGamer123',
              game: 'Chess',
              viewerCount: 1234,
              isLive: true,
              description: 'Watch the most intense chess match of the year!',
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
              description: 'Attempting world record speed run',
              startedAt: new Date(Date.now() - 3600000).toISOString(),
            },
          ];

          const foundStream = mockStreams.find((s) => s.id === id);
          if (foundStream) {
            setStream(foundStream);
          }
        }
      } catch (error) {
        console.error('Error loading stream:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStream();

    // Load messages
    const savedMessages = localStorage.getItem(`stream-${id}-messages`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, [id]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'User',
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem(`stream-${id}-messages`, JSON.stringify(updatedMessages));
    setMessage('');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#98ee2c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading stream...</p>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Stream Not Found</h1>
          <p className="text-gray-400 mb-8">This stream doesn&apos;t exist or has been removed.</p>
          <Link href="/livestream">
            <Button className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold">
              Back to Streams
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const src: Src[] = [
    {
      // @ts-expect-error - Livepeer SDK type compatibility
      type: 'playback',
      src: stream.playbackId,
    },
  ];

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      <div className="container mx-auto px-4">
        <Link
          href="/livestream"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Streams
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - Video player and info */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden mb-6">
              <div className="aspect-video bg-black">
                <PlayerWithControls src={src} />
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h1 className="text-2xl font-bold text-white">{stream.title}</h1>
                      {stream.isLive && (
                        <Badge className="bg-red-500 text-white animate-pulse border-0">
                          <span className="w-2 h-2 bg-white rounded-full mr-2 inline-block" />
                          LIVE
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="text-[#98ee2c] font-medium">{stream.streamer}</span>
                      <span>•</span>
                      <span>{stream.game}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{stream.viewerCount.toLocaleString()} viewers</span>
                      </div>
                    </div>
                  </div>
                </div>

                {stream.description && (
                  <p className="text-gray-300 mb-4">{stream.description}</p>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Like
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Chat section */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 h-[600px] flex flex-col">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-[#98ee2c]" />
                  Live Chat
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No messages yet. Be the first to chat!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#98ee2c]/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#98ee2c] text-xs font-bold">
                          {msg.sender.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[#98ee2c] text-sm font-medium">{msg.sender}</span>
                          <span className="text-gray-500 text-xs">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-white text-sm">{msg.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Send a message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#98ee2c]/50"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
