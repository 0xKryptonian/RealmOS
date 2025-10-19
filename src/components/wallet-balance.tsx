'use client';

import { useEffect, useState } from 'react';
import { Coins, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useDAppConnector } from './client-providers';

interface WalletBalanceProps {
  className?: string;
  showRefresh?: boolean;
}

export function WalletBalance({ className, showRefresh = true }: WalletBalanceProps) {
  const { userAccountId } = useDAppConnector() ?? {};
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!userAccountId) {
      setBalance(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/hedera/account/balance?accountId=${userAccountId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const data = await response.json();
      setBalance(data.realmBalance || 0);
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to load balance');
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [userAccountId]);

  if (!userAccountId) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg border border-yellow-500/20', className)}>
      <Coins className="w-5 h-5 text-yellow-500" />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">REALM Balance</span>
        <span className="font-bold text-lg">
          {loading ? (
            <span className="text-muted-foreground">Loading...</span>
          ) : error ? (
            <span className="text-red-500 text-sm">{error}</span>
          ) : (
            <span className="text-yellow-500">{balance.toFixed(2)}</span>
          )}
        </span>
      </div>
      {showRefresh && (
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchBalance}
          disabled={loading}
          className="ml-auto"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </Button>
      )}
    </div>
  );
}
