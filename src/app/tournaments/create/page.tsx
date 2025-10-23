'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Trophy } from 'lucide-react';
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
          ...formData,
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
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
                </div>
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
