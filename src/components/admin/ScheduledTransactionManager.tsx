'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Trophy, DollarSign, RefreshCw, Plus } from 'lucide-react';

interface ScheduledTransaction {
  scheduleId: string;
  transactionId: string;
  payerAccountId: string;
  scheduledAt: string;
  executionTime?: string;
  status: 'PENDING' | 'EXECUTED' | 'EXPIRED' | 'DELETED';
  memo?: string;
  signers: string[];
}

export function ScheduledTransactionManager() {
  const [transactions, setTransactions] = useState<ScheduledTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    // Auto-load on mount - in production, you'd pass userId from auth
    // For demo, we'll skip auto-load
  }, []);

  const loadTransactions = async (userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/scheduled-transactions/list?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data);
      } else {
        setError(data.error || 'Failed to load transactions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const monitorTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scheduled-transactions/monitor', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'your-secret-token'}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        alert('Monitoring complete! Transactions updated.');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Failed to monitor'}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'EXECUTED':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'DELETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Scheduled Transaction Manager
              </CardTitle>
              <CardDescription>
                Manage automated rewards and prize distributions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Schedule
              </button>
              <button
                onClick={monitorTransactions}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Monitor
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {showCreateForm && <CreateScheduleForm onClose={() => setShowCreateForm(false)} />}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          {loading && !transactions.length ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 animate-pulse rounded" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No scheduled transactions found</p>
              <p className="text-sm mt-1">Create a new schedule to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.scheduleId}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(tx.status)}>
                          {tx.status}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Schedule ID: {tx.scheduleId}
                        </span>
                      </div>
                      {tx.memo && (
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {tx.memo}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Scheduled:
                      </span>
                      <span className="font-medium">
                        {new Date(tx.scheduledAt).toLocaleString()}
                      </span>
                    </div>
                    {tx.executionTime && (
                      <div>
                        <span className="text-gray-600 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Executes:
                        </span>
                        <span className="font-medium">
                          {new Date(tx.executionTime).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>Payer: {tx.payerAccountId}</span>
                      <span>Tx ID: {tx.transactionId}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">
                  {transactions.filter((t) => t.status === 'PENDING').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Executed</p>
                <p className="text-2xl font-bold">
                  {transactions.filter((t) => t.status === 'EXECUTED').length}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold">
                  {transactions.filter((t) => t.status === 'EXPIRED').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CreateScheduleForm({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<'daily_reward' | 'tournament_prizes'>('daily_reward');
  const [userId, setUserId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [executionDate, setExecutionDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/scheduled-transactions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          userId,
          accountId,
          amount: Number(amount),
          executionDate: executionDate || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Scheduled transaction created successfully!');
        onClose();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to create'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold mb-4">Create Scheduled Transaction</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'daily_reward' | 'tournament_prizes')}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="daily_reward">Daily Reward</option>
            <option value="tournament_prizes">Tournament Prizes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">User ID</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        {type === 'daily_reward' && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Hedera Account ID</label>
              <input
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="0.0.123456"
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Amount (HBAR)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Execution Date (Optional)</label>
              <input
                type="datetime-local"
                value={executionDate}
                onChange={(e) => setExecutionDate(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Schedule'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
