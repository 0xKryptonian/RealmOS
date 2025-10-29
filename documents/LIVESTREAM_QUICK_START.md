# Livestream Quick Start Guide

## What Was Fixed

1. **Created dynamic route** `/livestream/[id]/page.tsx` - Now individual streams can be viewed
2. **Implemented stream creation** - API route `/api/livestream/create` that calls Livepeer
3. **Added localStorage persistence** - Streams are saved and loaded from browser storage
4. **Fixed 404 errors** - All livestream routes now work properly

## How It Works Now

### 1. Creating a Stream

When you click "Start Streaming" and fill out the form:

1. Form submits to `/api/livestream/create`
2. API calls Livepeer to create a real stream
3. Returns: `streamId`, `streamKey`, `playbackId`, `rtmpUrl`
4. Stream is saved to localStorage
5. You're redirected to `/livestream/{streamId}`

### 2. Viewing Streams

- Main page (`/livestream`) shows all streams (saved + mock data)
- Click any stream card to go to `/livestream/{id}`
- Stream detail page shows:
  - Live video player (using Livepeer playback)
  - Stream info
  - Live chat
  - Share/Like buttons

### 3. Broadcasting to Your Stream

After creating a stream, you'll receive a **Stream Key**. Use it with OBS Studio:

**OBS Settings:**
- **Server**: `rtmp://rtmp.livepeer.com/live`
- **Stream Key**: (the key from stream creation)

## Testing Right Now

### Option 1: View Demo Streams

1. Go to http://localhost:3000/livestream
2. Click on "Chess Championship Finals" or "Tetris Speed Run"
3. These use a working Livepeer playback ID: `f5eese9wwl7c7htl`

### Option 2: Create Your Own Stream

1. Connect your wallet
2. Click "Start Streaming"
3. Fill out the form
4. Click "Create Stream"
5. You'll see your stream key in the success toast
6. Use OBS Studio to broadcast

## Environment Variables

Make sure your `.env.local` has:

```bash
NEXT_PUBLIC_LIVEPEER_API_KEY="a1167f45-dffd-4887-bafd-660cc4a35e4d"
```

This is your Livepeer Studio API key for creating/managing streams.

## Current Limitations

1. **localStorage only** - Streams aren't saved to database yet
2. **No real-time updates** - Viewer count doesn't update automatically
3. **Mock data mixed in** - Demo streams are shown alongside real ones
4. **No authentication** - Anyone can create streams

## Next Steps to Improve

1. **Add Prisma database** - Save streams to PostgreSQL
2. **Real-time features** - Use WebSockets for live updates
3. **Stream management** - Edit/delete your streams
4. **Analytics** - Track views, watch time, earnings
5. **Moderation** - Chat moderation, stream reporting

## File Structure

```
src/
├── app/
│   ├── livestream/
│   │   ├── page.tsx              # Main streams list
│   │   ├── [id]/
│   │   │   └── page.tsx          # Individual stream view (NEW)
│   │   └── create/
│   │       └── page.tsx          # Create stream form
│   └── api/
│       └── livestream/
│           └── create/
│               └── route.ts      # Stream creation API (NEW)
├── components/
│   └── stream/
│       ├── StreamPlayer.tsx      # Full-featured player
│       └── LivestreamPlayer.tsx  # Simple player
└── lib/
    └── streaming/
        └── livepeer-service.ts   # Livepeer API wrapper
```

## Troubleshooting

### "Stream Not Found" Error

- The stream ID doesn't exist in localStorage or mock data
- Try creating a new stream or viewing demo streams (ID: 1 or 2)

### "Failed to create stream" Error

- Check your Livepeer API key is correct
- Check browser console for detailed error
- Verify API key has permissions to create streams

### Video Player Not Loading

- Check the playback ID is valid
- Verify Livepeer API key is set
- Check browser console for errors
- Try the demo playback ID: `f5eese9wwl7c7htl`

## Demo Playback IDs

For testing, use these working Livepeer playback IDs:
- `f5eese9wwl7c7htl` - Working demo stream

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify environment variables are set
3. Check Livepeer Studio dashboard for stream status
4. Review `LIVEPEER_SETUP.md` for detailed documentation
