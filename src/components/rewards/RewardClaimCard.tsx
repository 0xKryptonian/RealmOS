'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Gift, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RewardClaimCardProps {
  reward: {
    id: string;
    amount: number;
    reason: string;
    status: 'PENDING' | 'CLAIMED' | 'FAILED';
    createdAt: string;
    claimedAt?: string;
    txHash?: string;
  };
  onClaim: (rewardId: string) => Promise<void>;
}

export function RewardClaimCard({ reward, onClaim }: RewardClaimCardProps) {
  const [claiming, setClaiming] = useState(false);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await onClaim(reward.id);
      toast.success('Reward claimed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim reward');
    } finally {
      setClaiming(false);
    }
  };

  const getStatusBadge = () => {
    switch (reward.status) {
      case 'PENDING':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'CLAIMED':
        return (
          <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Claimed
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
            Failed
          </Badge>
        );
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-[#98ee2c]/30 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-[#98ee2c]/20 to-[#7bc922]/20">
              <Gift className="w-6 h-6 text-[#98ee2c]" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">{reward.reason}</CardTitle>
              <CardDescription className="text-gray-400">
                {new Date(reward.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-[#98ee2c]">{reward.amount}</span>
          <span className="text-gray-400">REALM</span>
        </div>

        {reward.claimedAt && (
          <p className="text-sm text-gray-400 mt-2">
            Claimed on {new Date(reward.claimedAt).toLocaleString()}
          </p>
        )}

        {reward.txHash && (
          <p className="text-xs text-gray-500 mt-1 truncate">
            TX: {reward.txHash}
          </p>
        )}
      </CardContent>

      {reward.status === 'PENDING' && (
        <CardFooter>
          <Button
            onClick={handleClaim}
            disabled={claiming}
            className="w-full bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90"
          >
            {claiming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Claiming...
              </>
            ) : (
              'Claim Reward'
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
