'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Trophy, Info, Zap, Award } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CreateTournamentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prizePool: '',
    maxParticipants: '',
    startTime: '',
    endTime: '',
    location: 'online',
    format: 'SINGLE_ELIMINATION',
    gameId: '',
    entryFee: '',
    enableStreaming: true,
    enableNFTRewards: true,
    enableELOSeeding: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.startTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          imageUrl: '/images/tournament-default.png',
          eventType: 'TOURNAMENT',
          startTime: new Date(formData.startTime).toISOString(),
          endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
          location: formData.location,
          prizePool: formData.prizePool || null,
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
          format: formData.format,
          gameId: formData.gameId || null,
          entryFee: formData.entryFee || null,
          metadata: {
            enableStreaming: formData.enableStreaming,
            enableNFTRewards: formData.enableNFTRewards,
            enableELOSeeding: formData.enableELOSeeding,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create tournament');
      }

      toast.success('Tournament created successfully!');
      router.push('/tournaments');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/tournaments">
            <Button variant="ghost" className="text-gray-400 hover:text-white mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tournaments
            </Button>
          </Link>

          <div className="inline-flex items-center px-4 py-2 bg-[#98ee2c]/10 border border-[#98ee2c]/30 rounded-full mb-6">
            <Trophy className="h-4 w-4 text-[#98ee2c] mr-2" />
            <span className="text-[#98ee2c] text-sm font-medium">
              Create New Tournament
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] bg-clip-text text-transparent">
              Create Tournament
            </span>
          </h1>

          <p className="text-lg text-gray-400">
            Set up a new competitive tournament for the community
          </p>
        </div>

        {/* Form */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Tournament Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Chess Championship 2025"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your tournament..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="format" className="text-white">
                  Tournament Format <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.format}
                  onValueChange={(value) => setFormData({ ...formData, format: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white">
                    <SelectItem value="SINGLE_ELIMINATION">Single Elimination</SelectItem>
                    <SelectItem value="DOUBLE_ELIMINATION">Double Elimination</SelectItem>
                    <SelectItem value="ROUND_ROBIN">Round Robin</SelectItem>
                    <SelectItem value="SWISS">Swiss System</SelectItem>
                    <SelectItem value="BATTLE_ROYALE">Battle Royale</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Automated bracket generation based on format
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gameId" className="text-white">
                    Game
                  </Label>
                  <Select
                    value={formData.gameId}
                    onValueChange={(value) => setFormData({ ...formData, gameId: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select game" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-gray-800 text-white">
                      <SelectItem value="chess">Chess</SelectItem>
                      <SelectItem value="tetris">Tetris</SelectItem>
                      <SelectItem value="snake">Snake</SelectItem>
                      <SelectItem value="sudoku">Sudoku</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entryFee" className="text-white">
                    Entry Fee (REALM)
                  </Label>
                  <Input
                    id="entryFee"
                    type="number"
                    value={formData.entryFee}
                    onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                    placeholder="e.g., 10"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prizePool" className="text-white">
                    Prize Pool (REALM)
                  </Label>
                  <Input
                    id="prizePool"
                    type="number"
                    value={formData.prizePool}
                    onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                    placeholder="e.g., 1000"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxParticipants" className="text-white">
                    Max Participants
                  </Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                    placeholder="e.g., 32"
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                  <p className="text-xs text-gray-400">
                    {formData.enableELOSeeding && 'ELO-based seeding will be applied'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#98ee2c]" />
                  Tournament Features
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableStreaming" className="text-white font-medium">
                        Live Streaming
                      </Label>
                      <p className="text-sm text-gray-400">
                        Enable Livepeer streaming integration
                      </p>
                    </div>
                    <Switch
                      id="enableStreaming"
                      checked={formData.enableStreaming}
                      onCheckedChange={(checked) => setFormData({ ...formData, enableStreaming: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableNFTRewards" className="text-white font-medium">
                        NFT Trophy Rewards
                      </Label>
                      <p className="text-sm text-gray-400">
                        Mint NFT trophies for winners
                      </p>
                    </div>
                    <Switch
                      id="enableNFTRewards"
                      checked={formData.enableNFTRewards}
                      onCheckedChange={(checked) => setFormData({ ...formData, enableNFTRewards: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableELOSeeding" className="text-white font-medium">
                        ELO-Based Seeding
                      </Label>
                      <p className="text-sm text-gray-400">
                        Seed players based on ELO ratings
                      </p>
                    </div>
                    <Switch
                      id="enableELOSeeding"
                      checked={formData.enableELOSeeding}
                      onCheckedChange={(checked) => setFormData({ ...formData, enableELOSeeding: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#98ee2c]/10 border border-[#98ee2c]/30 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Automated Features
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start">
                    <span className="text-[#98ee2c] mr-2">✓</span>
                    Automated bracket generation & match scheduling
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#98ee2c] mr-2">✓</span>
                    Real-time match result submission
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#98ee2c] mr-2">✓</span>
                    Automated prize distribution
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#98ee2c] mr-2">✓</span>
                    Spectator mode for all matches
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#98ee2c] mr-2">✓</span>
                    Tournament analytics & statistics
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-white">
                    Start Date & Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-white">
                    End Date & Time
                  </Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-white">
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., online, Discord, etc."
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/tournaments')}
                  className="flex-1 border-white/10 text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90"
                >
                  {loading ? 'Creating...' : 'Create Tournament'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
