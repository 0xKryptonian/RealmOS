# Livepeer Streaming Setup Guide

This guide explains how to set up and use Livepeer for live streaming in RealmOS.

## Overview

RealmOS uses **@livepeer/react v4.3.6** for video streaming functionality. The deprecated `livepeer` package has been removed.

## Architecture

- **Client-side**: `@livepeer/react` components for video playback and broadcasting
- **Server-side**: Direct Livepeer Studio API calls for stream management
- **Theme**: All stream components use the app's primary color `#98ee2c` (lime green)

## Getting Started

### 1. Get Your Livepeer API Key

1. Visit [Livepeer Studio](https://livepeer.studio)
2. Sign up or log in
3. Navigate to **Developers** → **API Keys**
4. Create a new API key
5. Copy the API key

### 2. Configure Environment Variables

Add your Livepeer API key to `.env.local`:

```bash
# Livepeer Configuration
NEXT_PUBLIC_LIVEPEER_STREAM_KEY="your-api-key-here"
LIVEPEER_API_KEY="your-api-key-here"
```

### 3. Install Dependencies

```bash
bun install
```

## Components

### StreamPlayer (Full-featured)

Located at `src/components/stream/StreamPlayer.tsx`

**Features:**
- Full playback controls (play/pause, volume, seek)
- Quality selection
- Playback speed control
- Picture-in-picture
- Fullscreen
- Clip creation
- Live indicator
- Theme-colored controls (#98ee2c)

**Usage:**
```tsx
import { PlayerWithControls } from '@/components/stream/StreamPlayer';
import { Src } from '@livepeer/react';

const src: Src[] = [
  {
    // @ts-expect-error - Livepeer SDK type compatibility
    type: 'playback',
    src: 'your-playback-id',
  },
];

<PlayerWithControls src={src} />
```

### LivestreamPlayer (Simple)

Located at `src/components/stream/LivestreamPlayer.tsx`

**Features:**
- Basic playback controls
- Live badge overlay
- Viewer count display
- Stream info card
- Theme-colored controls (#98ee2c)

**Usage:**
```tsx
import LivestreamPlayer from '@/components/stream/LivestreamPlayer';

<LivestreamPlayer
  playbackId="your-playback-id"
  title="Tournament Finals"
  viewerCount={1234}
  isLive={true}
/>
```

## Server-Side Stream Management

Located at `src/lib/streaming/livepeer-service.ts`

### Create a Stream

```typescript
import { LivepeerService } from '@/lib/streaming/livepeer-service';

const stream = await LivepeerService.createStream('My Tournament Stream');
console.log('Stream Key:', stream.streamKey);
console.log('Playback ID:', stream.playbackId);
```

### Get Stream Details

```typescript
const stream = await LivepeerService.getStream(streamId);
if (stream) {
  console.log('Stream is active:', stream.isActive);
}
```

### Create Tournament Stream

```typescript
const tournamentStream = await LivepeerService.createTournamentStream(
  'tournament-123',
  'match-456',
  'Grand Finals',
  'Epic showdown between top players'
);
```

### Delete a Stream

```typescript
const success = await LivepeerService.deleteStream(streamId);
```

## Broadcasting

To broadcast to a stream, you'll need:

1. **Stream Key**: Obtained when creating a stream
2. **RTMP URL**: `rtmp://rtmp.livepeer.com/live`
3. **Streaming Software**: OBS Studio, Streamlabs, etc.

### OBS Studio Setup

1. Open OBS Studio
2. Go to **Settings** → **Stream**
3. Select **Custom** as Service
4. Set Server: `rtmp://rtmp.livepeer.com/live`
5. Set Stream Key: Your stream key from Livepeer
6. Click **Apply** and **OK**
7. Click **Start Streaming**

### Browser-based Broadcasting

Use the Broadcast component (currently commented out in `src/components/stream/Broadcast.tsx`):

```tsx
import { BroadcastWithControls } from '@/components/stream/Broadcast';

<BroadcastWithControls streamKey="your-stream-key" />
```

## API Reference

### LivepeerService Methods

#### `createStream(name: string): Promise<LiveStream>`
Creates a new stream with recording enabled and multiple quality profiles.

#### `getStream(streamId: string): Promise<LiveStream | null>`
Retrieves stream details by ID.

#### `deleteStream(streamId: string): Promise<boolean>`
Deletes a stream permanently.

#### `createTournamentStream(tournamentId, matchId, title, description?): Promise<TournamentStream>`
Creates a stream specifically for tournament matches.

#### `enableMultistream(streamId, targets): Promise<boolean>`
Enables simultaneous streaming to Twitch/YouTube.

#### `getEmbedCode(playbackId, width?, height?): string`
Generates iframe embed code for a stream.

#### `calculateWatchRewards(watchTimeMinutes, rewardRate?): number`
Calculates REALM token rewards for watching streams.

## Theme Customization

All stream components use the RealmOS theme color `#98ee2c`. This is applied to:

- Play/pause buttons
- Volume controls
- Seek bar progress
- Live indicators
- Loading spinners

To change the theme color, update the inline styles in:
- `src/components/stream/StreamPlayer.tsx`
- `src/components/stream/LivestreamPlayer.tsx`

## Troubleshooting

### Build Errors

**Error**: `Module '"@livepeer/react"' has no exported member 'Player'`

**Solution**: Use the namespaced imports:
```tsx
import * as Player from '@livepeer/react/player';
```

### Type Errors

**Error**: `Type '{ src: string; type: "playback"; }' is not assignable to type 'Src'`

**Solution**: Add type assertion:
```tsx
const src: Src[] = [
  {
    // @ts-expect-error - Livepeer SDK type compatibility
    type: 'playback',
    src: playbackId,
  },
];
```

### Stream Not Playing

1. Verify your API key is correct
2. Check that the playback ID is valid
3. Ensure the stream is active (broadcasting)
4. Check browser console for errors

## Resources

- [Livepeer React SDK Docs](https://docs.livepeer.org/sdks/react/getting-started)
- [Livepeer Player Component](https://docs.livepeer.org/sdks/react/Player)
- [Livepeer Broadcast Component](https://docs.livepeer.org/sdks/react/Broadcast)
- [Livepeer Studio Dashboard](https://livepeer.studio/dashboard)
- [Livepeer API Reference](https://docs.livepeer.org/api-reference/overview/introduction)

## Example: Event Streaming Page

See `src/app/events/[id]/page.tsx` for a complete implementation of:
- Live stream playback
- Real-time chat
- Viewer count
- Like/share functionality

## Next Steps

1. Set up your Livepeer API key
2. Test stream creation with `LivepeerService.createStream()`
3. Implement broadcasting in your tournaments
4. Add watch-to-earn rewards integration
5. Enable multistreaming to Twitch/YouTube
