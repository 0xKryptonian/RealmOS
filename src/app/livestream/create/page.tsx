'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Video, ArrowLeft, Radio } from 'lucide-react';
import { useDAppConnector } from '@/components/client-providers';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CreateLivestreamPage() {
  const router = useRouter();
  const { userAccountId } = useDAppConnector() ?? {};
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userAccountId) {
      toast.error('Please connect your wallet to create a stream');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Stream title is required');
      return;
    }

    setCreating(true);
    try {
      // Create stream using Livepeer API
      const response = await fetch('/api/livestream/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          game: formData.game,
          streamer: userAccountId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create stream');
      }

      const data = await response.json();

      // Save to localStorage for now
      const savedStreams = localStorage.getItem('hedera-streams');
      const streams = savedStreams ? JSON.parse(savedStreams) : [];
      streams.push({
        id: data.streamId,
        playbackId: data.playbackId,
        title: formData.title,
        streamer: userAccountId,
        game: formData.game || 'Gaming',
        viewerCount: 0,
        isLive: false,
        description: formData.description,
        startedAt: new Date().toISOString(),
        streamKey: data.streamKey,
      });
      localStorage.setItem('hedera-streams', JSON.stringify(streams));

      toast.success('Stream created successfully!', {
        description: `Stream Key: ${data.streamKey.slice(0, 20)}...`,
        duration: 5000,
      });

      router.push(`/livestream/${data.streamId}`);
    } catch (error) {
      console.error('Error creating stream:', error);
      toast.error('Failed to create stream. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link
          href="/livestream"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Streams
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-[#98ee2c]/10 border border-[#98ee2c]/30 rounded-full mb-6">
            <Radio className="h-4 w-4 text-[#98ee2c] mr-2" />
            <span className="text-[#98ee2c] text-sm font-medium">Create Livestream</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] bg-clip-text text-transparent">
              Start Broadcasting
            </span>
          </h1>

          <p className="text-lg text-gray-400">
            Stream your gameplay and earn rewards from viewers
          </p>
        </div>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Stream Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">
                  Stream Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter stream title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="game" className="text-white">
                  Game
                </Label>
                <Input
                  id="game"
                  type="text"
                  placeholder="What game are you playing?"
                  value={formData.game}
                  onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Description
                </Label>
                <textarea
                  id="description"
                  placeholder="Tell viewers what to expect"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[120px] px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#98ee2c]/50"
                  rows={4}
                />
              </div>

              <div className="bg-[#98ee2c]/10 border border-[#98ee2c]/30 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Streaming Features</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start">
                    <span className="text-[#98ee2c] mr-2">✓</span>
                    Low-latency streaming powered by Livepeer
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#98ee2c] mr-2">✓</span>
                    Earn REALM tokens from viewer engagement
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#98ee2c] mr-2">✓</span>
                    Real-time chat and interaction
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#98ee2c] mr-2">✓</span>
                    Automatic recording and VOD storage
                  </li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 border-white/10 text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating || !userAccountId}
                  className="flex-1 bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90"
                >
                  {creating ? 'Creating...' : 'Create Stream'}
                </Button>
              </div>

              {!userAccountId && (
                <p className="text-center text-sm text-gray-400">
                  Please connect your wallet to create a stream
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Technical Info */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10 mt-6">
          <CardHeader>
            <CardTitle className="text-lg text-white">Streaming Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-300">
            <div>
              <h4 className="text-white font-medium mb-1">Recommended Software</h4>
              <p>OBS Studio, Streamlabs, or XSplit</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-1">Recommended Settings</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Resolution: 1920x1080 (1080p)</li>
                <li>Bitrate: 4500-6000 kbps</li>
                <li>Framerate: 30 or 60 FPS</li>
                <li>Encoder: x264 or NVENC</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
