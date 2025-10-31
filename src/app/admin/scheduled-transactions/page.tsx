import { ScheduledTransactionManager } from '@/components/admin/ScheduledTransactionManager';

export default function ScheduledTransactionsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Scheduled Transactions</h1>
        <p className="text-gray-600">
          Manage automated rewards, prize distributions, and scheduled payments on Hedera
        </p>
      </div>

      <ScheduledTransactionManager />

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">📋 How it works</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Daily Rewards:</strong> Schedule automatic HBAR transfers for user login rewards</li>
          <li>• <strong>Tournament Prizes:</strong> Batch schedule prize distributions for tournament winners</li>
          <li>• <strong>Monitoring:</strong> Click &apos;Monitor&apos; to check execution status and update database</li>
          <li>• <strong>Multi-sig:</strong> Scheduled transactions can require multiple signatures before execution</li>
        </ul>
      </div>
    </div>
  );
}
