'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHCSMessages, useHCSMessageStats } from '@/hooks/useHCSMessages';
import { MessageSquare, Clock, Hash, User, RefreshCw, Filter } from 'lucide-react';

interface HCSMessageViewerProps {
  topicType?: 'leaderboard' | 'events' | 'tournament';
  topicId?: string;
  limit?: number;
  showRawMessages?: boolean;
}

export function HCSMessageViewer({ 
  topicType = 'leaderboard',
  topicId,
  limit = 50,
  showRawMessages = false,
}: HCSMessageViewerProps) {
  const [filterType, setFilterType] = useState<string | null>(null);
  const { messages, loading, error, refresh, lastUpdate } = useHCSMessages({
    topicType,
    topicId,
    limit,
    pollingInterval: 15000, // 15 seconds
    autoRefresh: true,
  });

  const stats = useHCSMessageStats(messages);

  const filteredMessages = filterType
    ? messages.filter(msg => msg.message?.type === filterType)
    : messages;

  const getMessageTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      score: 'bg-blue-100 text-blue-800',
      tournament_ended: 'bg-green-100 text-green-800',
      tournament_started: 'bg-yellow-100 text-yellow-800',
      game_event: 'bg-purple-100 text-purple-800',
      achievement: 'bg-orange-100 text-orange-800',
      default: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.default;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseFloat(timestamp) * 1000);
    return date.toLocaleString();
  };

  // Runtime helpers to safely narrow unknown values coming from Mirror Node parsing
  const asString = (v: unknown): string | null => (typeof v === 'string' ? v : null);
  const asNumber = (v: unknown): number | null => (typeof v === 'number' ? v : null);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            HCS Message History
          </CardTitle>
          <CardDescription>Loading messages from Hedera Consensus Service...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <MessageSquare className="w-5 h-5" />
            HCS Message History Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={refresh}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              HCS Message History
            </CardTitle>
            <CardDescription>
              Real-time messages from topic: {topicType}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdate && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={refresh}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Refresh messages"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Badge variant="outline" className="bg-blue-50">
            {stats.total} messages
          </Badge>
          {Object.entries(stats.byType).map(([type, count]) => (
            <Badge
              key={type}
              variant="outline"
              className={`cursor-pointer ${filterType === type ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setFilterType(filterType === type ? null : type)}
            >
              <Filter className="w-3 h-3 mr-1" />
              {type}: {count}
            </Badge>
          ))}
          {filterType && (
            <button
              onClick={() => setFilterType(null)}
              className="text-xs text-blue-600 hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {filteredMessages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No messages found. Messages will appear here in real-time.
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredMessages.map((msg) => (
              <div
                key={`${msg.consensusTimestamp}-${msg.sequenceNumber}`}
                className="border rounded-lg p-3 hover:shadow-sm transition-shadow bg-white"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const typeStr = asString((msg.message as any)?.type) ?? undefined;
                      if (!typeStr) return null;
                      return (
                        <Badge className={getMessageTypeColor(typeStr)}>
                          {typeStr}
                        </Badge>
                      );
                    })()}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      Seq: {msg.sequenceNumber}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(msg.consensusTimestamp)}
                  </span>
                </div>

                {/* Message Content */}
                <div className="space-y-1">
                  {(() => {
                    const username =
                      asString((msg.message as any)?.username) ??
                      asString((msg.message as any)?.userId);
                    if (!username) return null;
                    return (
                      <div className="text-sm flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="font-medium">{username}</span>
                      </div>
                    );
                  })()}
                  
                  {(() => {
                    const score = asNumber((msg.message as any)?.score);
                    if (score === null) return null;
                    return (
                      <div className="text-sm">
                        Score: <span className="font-bold text-blue-600">{score.toLocaleString()}</span>
                      </div>
                    );
                  })()}

                  {(() => {
                    const gameIdStr = asString((msg.message as any)?.gameId);
                    if (!gameIdStr) return null;
                    return (
                      <div className="text-sm text-gray-600">Game: {gameIdStr}</div>
                    );
                  })()}

                  {(() => {
                    const tName = asString((msg.message as any)?.tournamentName);
                    if (!tName) return null;
                    return (
                      <div className="text-sm text-gray-600">Tournament: {tName}</div>
                    );
                  })()}

                  {(() => {
                    const desc = asString((msg.message as any)?.description);
                    if (!desc) return null;
                    return (
                      <div className="text-sm text-gray-700 mt-1">{desc}</div>
                    );
                  })()}
                </div>

                {/* Raw Message (Optional) */}
                {showRawMessages && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                      Show raw message
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                      {JSON.stringify(msg.message as Record<string, unknown>, null, 2)}
                    </pre>
                  </details>
                )}

                {/* Consensus Info */}
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Payer: {msg.payerAccountId}
                  </span>
                  <span>Topic: {msg.topicId}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>🔄 Real-time Updates:</strong> This view automatically refreshes every 15 seconds 
            to show new messages from Hedera Consensus Service.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
