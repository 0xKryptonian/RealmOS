'use client';

import * as Player from '@livepeer/react/player';
import { Src } from '@livepeer/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Eye } from 'lucide-react';
import {
  PlayIcon,
  PauseIcon,
  LoadingIcon,
  MuteIcon,
  UnmuteIcon,
  EnterFullscreenIcon,
  ExitFullscreenIcon,
} from '@livepeer/react/assets';

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
  const src: Src[] = [
    {
      // @ts-expect-error - Livepeer SDK type compatibility
      type: 'playback',
      src: playbackId,
    },
  ];

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden">
      <div className="relative">
        {/* Livepeer Player */}
        <Player.Root src={src}>
          <Player.Container className="h-full w-full overflow-hidden bg-black outline-none">
            <Player.Video
              title={title}
              className="h-full w-full"
            />

            <Player.LoadingIndicator className="w-full relative h-full bg-black/50 backdrop-blur">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <LoadingIcon className="w-8 h-8 animate-spin" style={{ color: '#98ee2c' }} />
              </div>
            </Player.LoadingIndicator>

            {/* Live Badge Overlay */}
            {isLive && (
              <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-red-500 text-white animate-pulse border-0">
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

            {/* Custom Controls with Theme */}
            <Player.Controls className="bg-gradient-to-b gap-2 px-4 py-3 flex-col-reverse flex from-black/20 via-80% via-black/40 to-black/70">
              <div className="flex justify-between gap-4 items-center">
                <div className="flex flex-1 items-center gap-3">
                  <Player.PlayPauseTrigger className="w-8 h-8 hover:scale-110 transition flex-shrink-0" style={{ color: '#98ee2c' }}>
                    <Player.PlayingIndicator asChild matcher={false}>
                      <PlayIcon className="w-full h-full" />
                    </Player.PlayingIndicator>
                    <Player.PlayingIndicator asChild>
                      <PauseIcon className="w-full h-full" />
                    </Player.PlayingIndicator>
                  </Player.PlayPauseTrigger>

                  <Player.MuteTrigger className="w-7 h-7 hover:scale-110 transition flex-shrink-0" style={{ color: '#98ee2c' }}>
                    <Player.VolumeIndicator asChild matcher={false}>
                      <MuteIcon className="w-full h-full" />
                    </Player.VolumeIndicator>
                    <Player.VolumeIndicator asChild matcher={true}>
                      <UnmuteIcon className="w-full h-full" />
                    </Player.VolumeIndicator>
                  </Player.MuteTrigger>

                  <Player.Volume className="relative mr-1 flex-1 group flex cursor-pointer items-center select-none touch-none max-w-[120px] h-5">
                    <Player.Track className="bg-white/30 relative grow rounded-full transition h-[3px] group-hover:h-[4px]">
                      <Player.Range className="absolute rounded-full h-full" style={{ backgroundColor: '#98ee2c' }} />
                    </Player.Track>
                    <Player.Thumb className="block transition group-hover:scale-110 w-3 h-3 rounded-full" style={{ backgroundColor: '#98ee2c' }} />
                  </Player.Volume>
                </div>

                <div className="flex items-center gap-3">
                  <Player.FullscreenTrigger className="w-7 h-7 hover:scale-110 transition flex-shrink-0" style={{ color: '#98ee2c' }}>
                    <Player.FullscreenIndicator asChild>
                      <ExitFullscreenIcon className="w-full h-full" />
                    </Player.FullscreenIndicator>
                    <Player.FullscreenIndicator matcher={false} asChild>
                      <EnterFullscreenIcon className="w-full h-full" />
                    </Player.FullscreenIndicator>
                  </Player.FullscreenTrigger>
                </div>
              </div>
            </Player.Controls>
          </Player.Container>
        </Player.Root>
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
