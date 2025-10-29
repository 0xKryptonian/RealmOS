import { Livepeer } from 'livepeer';
import { streamKey } from '../constants';

export interface LiveStream {
  id: string;
  streamKey: string;
  playbackId: string;
  name: string;
  isActive: boolean;
  viewerCount: number;
  createdAt: Date;
}

export interface StreamSession {
  id: string;
  streamId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  viewerMinutes: number;
  recordingUrl?: string;
}

export interface TournamentStream {
  tournamentId: string;
  matchId?: string;
  streamId: string;
  playbackId: string;
  title: string;
  description?: string;
  isLive: boolean;
  viewerCount: number;
  chatEnabled: boolean;
  rewardsEnabled: boolean;
}

export class LivepeerService {
  private static livepeer = new Livepeer({
    apiKey: streamKey,
  });

  /**
   * Create a new livestream
   */
  static async createStream(name: string): Promise<LiveStream> {
    try {
      const { stream } = await this.livepeer.stream.create({
        name,
        record: true, // Enable recording for replays
        multistream: {
          targets: [], // Can add Twitch, YouTube targets
        },
      });

      if (!stream) {
        throw new Error('Failed to create stream');
      }

      return {
        id: stream.id,
        streamKey: stream.streamKey || '',
        playbackId: stream.playbackId || '',
        name: stream.name,
        isActive: stream.isActive || false,
        viewerCount: 0,
        createdAt: new Date(stream.createdAt || Date.now()),
      };
    } catch (error) {
      console.error('Error creating stream:', error);
      throw error;
    }
  }

  /**
   * Create tournament stream
   */
  static async createTournamentStream(
    tournamentId: string,
    matchId: string,
    title: string,
    description?: string
  ): Promise<TournamentStream> {
    const streamName = `Tournament: ${title} - Match ${matchId}`;
    const stream = await this.createStream(streamName);

    return {
      tournamentId,
      matchId,
      streamId: stream.id,
      playbackId: stream.playbackId,
      title,
      description,
      isLive: stream.isActive,
      viewerCount: 0,
      chatEnabled: true,
      rewardsEnabled: true,
    };
  }

  /**
   * Get stream details
   */
  static async getStream(streamId: string): Promise<LiveStream | null> {
    try {
      const { stream } = await this.livepeer.stream.get(streamId);

      if (!stream) {
        return null;
      }

      return {
        id: stream.id,
        streamKey: stream.streamKey || '',
        playbackId: stream.playbackId || '',
        name: stream.name,
        isActive: stream.isActive || false,
        viewerCount: 0, // TODO: Get from analytics
        createdAt: new Date(stream.createdAt || Date.now()),
      };
    } catch (error) {
      console.error('Error fetching stream:', error);
      return null;
    }
  }

  /**
   * Get stream sessions (for analytics)
   */
  static async getStreamSessions(streamId: string): Promise<StreamSession[]> {
    try {
      // TODO: Implement session fetching from Livepeer
      return [];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  }

  /**
   * Delete stream
   */
  static async deleteStream(streamId: string): Promise<boolean> {
    try {
      await this.livepeer.stream.delete(streamId);
      return true;
    } catch (error) {
      console.error('Error deleting stream:', error);
      return false;
    }
  }

  /**
   * Get stream viewership data
   */
  static async getViewershipData(streamId: string): Promise<{
    currentViewers: number;
    peakViewers: number;
    totalViews: number;
    averageWatchTime: number;
  }> {
    // TODO: Implement analytics fetching
    return {
      currentViewers: 0,
      peakViewers: 0,
      totalViews: 0,
      averageWatchTime: 0,
    };
  }

  /**
   * Enable multistreaming to Twitch/YouTube
   */
  static async enableMultistream(
    streamId: string,
    targets: Array<{
      platform: 'twitch' | 'youtube';
      streamKey: string;
    }>
  ): Promise<boolean> {
    try {
      await this.livepeer.stream.update(streamId, {
        multistream: {
          targets: targets.map(t => ({
            profile: t.platform,
            spec: {
              name: t.platform,
              url: this.getStreamUrl(t.platform, t.streamKey),
            },
          })),
        },
      });
      return true;
    } catch (error) {
      console.error('Error enabling multistream:', error);
      return false;
    }
  }

  /**
   * Get recording URL for a stream session
   */
  static async getRecordingUrl(sessionId: string): Promise<string | null> {
    // TODO: Fetch recording URL from Livepeer
    return null;
  }

  /**
   * Create highlight clip from recording
   */
  static async createHighlightClip(
    sessionId: string,
    startTime: number,
    duration: number,
    title: string
  ): Promise<string | null> {
    // TODO: Create clip using Livepeer API
    return null;
  }

  /**
   * Calculate watch-to-earn rewards
   */
  static calculateWatchRewards(
    watchTimeMinutes: number,
    rewardRate: number = 0.1 // REALM per minute
  ): number {
    // Cap at 2 hours per session to prevent abuse
    const cappedMinutes = Math.min(watchTimeMinutes, 120);
    return cappedMinutes * rewardRate;
  }

  /**
   * Get stream URL for platform
   */
  private static getStreamUrl(platform: 'twitch' | 'youtube', streamKey: string): string {
    switch (platform) {
      case 'twitch':
        return `rtmp://live.twitch.tv/app/${streamKey}`;
      case 'youtube':
        return `rtmp://a.rtmp.youtube.com/live2/${streamKey}`;
      default:
        return '';
    }
  }

  /**
   * Get embed code for stream
   */
  static getEmbedCode(playbackId: string, width: number = 640, height: number = 360): string {
    return `<iframe
  src="https://lvpr.tv/?v=${playbackId}"
  width="${width}"
  height="${height}"
  frameborder="0"
  allow="autoplay; encrypted-media; picture-in-picture"
  allowfullscreen
></iframe>`;
  }

  /**
   * Get stream health metrics
   */
  static async getStreamHealth(streamId: string): Promise<{
    isHealthy: boolean;
    bitrate: number;
    fps: number;
    resolution: string;
    latency: number;
  }> {
    // TODO: Fetch health metrics from Livepeer
    return {
      isHealthy: true,
      bitrate: 0,
      fps: 0,
      resolution: '1920x1080',
      latency: 0,
    };
  }
}
