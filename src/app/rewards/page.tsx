'use client';

import { useEffect, useState } from 'react';
import { RewardClaimCard } from '@/components/rewards/RewardClaimCard';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, TrendingUp, History } from 'lucide-react';
import { toast } from 'sonner';

interface Reward {
  id: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'CLAIMED' | 'FAILED';
  createdAt: string;
  claimedAt?: string;
  txHash?: string;
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarned: 0,
    pendingRewards: 0,
    claimedRewards: 0,
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rewards/list');
      if (!response.ok) throw new Error('Failed to fetch rewards');

      const data = await response.json();
      setRewards(data.rewards || []);
      setStats(data.stats || { totalEarned: 0, pendingRewards: 0, claimedRewards: 0 });
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast.error('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    const response = await fetch('/api/rewards/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rewardId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to claim reward');
    }

    // Refresh rewards list
    await fetchRewards();
  };

  const pendingRewards = rewards.filter((r) => r.status === 'PENDING');
  const claimedRewards = rewards.filter((r) => r.status === 'CLAIMED');

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] bg-clip-text text-transparent">
              Rewards
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Claim your earned REALM tokens
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-[#98ee2c]/20 to-[#7bc922]/20">
                  <TrendingUp className="w-6 h-6 text-[#98ee2c]" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Earned</p>
                  <p className="text-2xl font-bold text-white">{stats.totalEarned} REALM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                  <Gift className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingRewards} REALM</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                  <History className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Claimed</p>
                  <p className="text-2xl font-bold text-white">{stats.claimedRewards} REALM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rewards List */}
        <Tabs defaultValue="pending" className="mb-8">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingRewards.length})
            </TabsTrigger>
            <TabsTrigger value="claimed">
              Claimed ({claimedRewards.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({rewards.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse bg-white/5 border-white/10">
                    <CardContent className="p-6">
                      <div className="h-32 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : pendingRewards.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">No pending rewards</h3>
                <p className="text-gray-400">
                  Keep playing to earn more REALM tokens!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingRewards.map((reward) => (
                  <RewardClaimCard
                    key={reward.id}
                    reward={reward}
                    onClaim={handleClaimReward}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="claimed" className="mt-6">
            {claimedRewards.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">No claimed rewards yet</h3>
                <p className="text-gray-400">
                  Your claimed rewards will appear here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {claimedRewards.map((reward) => (
                  <RewardClaimCard
                    key={reward.id}
                    reward={reward}
                    onClaim={handleClaimReward}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            {rewards.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">No rewards yet</h3>
                <p className="text-gray-400">
                  Start playing games to earn REALM tokens!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                  <RewardClaimCard
                    key={reward.id}
                    reward={reward}
                    onClaim={handleClaimReward}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
