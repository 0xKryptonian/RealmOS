'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useGameScore } from '@/hooks/use-game-score';
import { useDAppConnector } from './client-providers';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Wallet, Trophy, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { WalletBalance } from './wallet-balance';

interface GameWrapperProps {
  gameId: string;
  gameName: string;
  children: (props: {
    onGameEnd: (score: number, metadata?: any) => Promise<void>;
    submitting: boolean;
  }) => ReactNode;
}

export function GameWrapper({ gameId, gameName, children }: GameWrapperProps) {
  const { userAccountId } = useDAppConnector() ?? {};
  const { submitScore, submitting } = useGameScore();
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);

  useEffect(() => {
    if (!userAccountId) {
      setShowConnectPrompt(true);
    } else {
      setShowConnectPrompt(false);
    }
  }, [userAccountId]);

  const handleGameEnd = async (score: number, metadata?: any) => {
    if (!userAccountId) {
      toast.error('Please connect your wallet to earn rewards');
      setShowConnectPrompt(true);
      return;
    }

    await submitScore({ gameId, score, metadata });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header with Balance */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{gameName}</h1>
          <p className="text-muted-foreground">
            Play and earn REALM tokens for high scores
          </p>
        </div>
        {userAccountId && <WalletBalance />}
      </div>

      {/* Connect Wallet Prompt */}
      {showConnectPrompt && (
        <Card className="mb-6 border-yellow-500/50 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-500">
              <Wallet className="w-5 h-5" />
              Connect Wallet to Earn Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Hedera wallet to submit scores and earn REALM tokens for high scores!
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="w-4 h-4 text-green-500" />
                <span>High Score Rewards</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span>Earn REALM Tokens</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Game Content */}
      {children({ onGameEnd: handleGameEnd, submitting })}
    </div>
  );
}
