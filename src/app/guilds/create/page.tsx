'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield, ArrowLeft } from 'lucide-react';
import { useDAppConnector } from '@/components/client-providers';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CreateGuildPage() {
  const router = useRouter();
  const { userAccountId } = useDAppConnector() ?? {};
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userAccountId) {
      toast.error('Please connect your wallet to create a guild');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Guild name is required');
      return;
    }

    setCreating(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success('Guild created successfully!', {
        description: `${formData.name} is now live`,
      });

      router.push('/guilds');
    } catch (error) {
      toast.error('Failed to create guild. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link
          href="/guilds"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Guilds
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-[#98ee2c]/10 border border-[#98ee2c]/30 rounded-full mb-6">
            <Shield className="h-4 w-4 text-[#98ee2c] mr-2" />
            <span className="text-[#98ee2c] text-sm font-medium">Create Your Guild</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] bg-clip-text text-transparent">
              Start Your Gaming Community
            </span>
          </h1>

          <p className="text-lg text-gray-400">
            Build your guild, recruit members, and compete in tournaments
          </p>
        </div>

        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Guild Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Guild Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter guild name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Description
                </Label>
                <textarea
                  id="description"
                  placeholder="Describe your guild's mission and goals"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[120px] px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#98ee2c]/50"
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="space-y-0.5">
                  <Label htmlFor="isPublic" className="text-white font-medium">
                    Public Guild
                  </Label>
                  <p className="text-sm text-gray-400">
                    Allow anyone to join your guild without approval
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                />
              </div>

              <div className="bg-[#98ee2c]/10 border border-[#98ee2c]/30 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">Guild Benefits</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start">
                    <span className="text-[#98ee2c] mr-2">✓</span>
                    Shared treasury for tournament entries
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#98ee2c] mr-2">✓</span>
                    Exclusive guild tournaments and events
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#98ee2c] mr-2">✓</span>
                    Guild rankings and leaderboards
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#98ee2c] mr-2">✓</span>
                    Private chat and coordination tools
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
                  {creating ? 'Creating...' : 'Create Guild'}
                </Button>
              </div>

              {!userAccountId && (
                <p className="text-center text-sm text-gray-400">
                  Please connect your wallet to create a guild
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
