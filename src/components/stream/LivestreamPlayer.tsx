'use client';

import { Player } from '@livepeer/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Eye } from 'lucide-react';

interface LivestreamPlayerProps {
  playbackId: string;
  title: string;
  viewerCount?: number;
  isLive?: boolean;
}

export default function LivestreamPlayer({
  playbackId,
  title,
  viewerCount = 0,
  isLive = true,
}: LivestreamPlayerProps) {
  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden">
      <div className="relative">
        {/* Livepeer Player */}
        <Player
          playbackId={playbackId}
          autoPlay
          muted={false}
          showPipButton
          objectFit="cover"
          theme={{
            colors: {
              accent: '#98ee2c',
            },
          }}
        />

        {/* Live Badge Overlay */}
        {isLive && (
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-red-500 text-white animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full mr-2 inline-block" />
              LIVE
            </Badge>
          </div>
        )}

        {/* Viewer Count Overlay */}
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Eye className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">{viewerCount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Stream Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Users className="w-4 h-4" />
          <span>{viewerCount} watching now</span>
        </div>
      </div>
    </Card>
  );
}
