import { useState } from 'react';
import { toast } from 'sonner';
import { useDAppConnector } from '@/components/client-providers';

interface SubmitScoreParams {
  gameId: string;
  score: number;
  metadata?: any;
}

interface ScoreResult {
  success: boolean;
  data?: {
    scoreId: string;
    score: number;
    isHighScore: boolean;
    hcsTxId?: string;
    reward?: {
      amount: number;
      txId: string;
    };
  };
  error?: string;
}

export function useGameScore() {
  const { userAccountId } = useDAppConnector() ?? {};
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<ScoreResult | null>(null);

  const submitScore = async ({ gameId, score, metadata }: SubmitScoreParams): Promise<ScoreResult> => {
    if (!userAccountId) {
      const error = 'Please connect your wallet first';
      toast.error(error);
      return { success: false, error };
    }

    setSubmitting(true);

    try {
      // Get or create user
      const userResponse = await fetch('/api/profile/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          walletAddress: userAccountId
        }),
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user');
      }

      const userData = await userResponse.json();
      const userId = userData.user.id;

      // Submit score
      const response = await fetch('/api/games/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          gameId,
          score,
          metadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit score');
      }

      const result: ScoreResult = await response.json();
      setLastResult(result);

      // Show success notifications
      if (result.data?.isHighScore) {
        toast.success('🎉 New High Score!', {
          description: `You scored ${score} points!`,
        });

        if (result.data.reward) {
          toast.success(`💰 You earned ${result.data.reward.amount} REALM tokens!`, {
            description: 'Reward sent to your wallet',
            duration: 5000,
          });
        }
      } else {
        toast.success('Score submitted!', {
          description: `You scored ${score} points`,
        });
      }

      if (result.data?.hcsTxId) {
        toast.info('📝 Score recorded on Hedera Consensus Service', {
          description: 'Your score is now immutable',
          duration: 3000,
        });
      }

      return result;
    } catch (error: any) {
      console.error('Error submitting score:', error);
      const errorMessage = error.message || 'Failed to submit score';
      toast.error(errorMessage);
      
      const errorResult = { success: false, error: errorMessage };
      setLastResult(errorResult);
      return errorResult;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitScore,
    submitting,
    lastResult,
  };
}
