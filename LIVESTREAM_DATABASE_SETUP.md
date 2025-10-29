# Livestream Database Setup Guide

## Overview

I've updated the livestream system to use Prisma database instead of localStorage. This provides proper persistence, user management, and stream ownership tracking.

## Changes Made

### 1. **Prisma Schema Updates** (`prisma/schema.prisma`)

Updated `StreamingSession` model with new fields:
- `streamKey` - For OBS broadcasting
- `rtmpUrl` - RTMP server URL
- `game` - Game being streamed
- `isLive` - Live status boolean
- `createdAt` / `updatedAt` - Timestamps

### 2. **New API Routes**

#### `/api/livestream/create` (POST)
- Creates stream in Livepeer
- Saves to database
- Auto-creates user if doesn't exist
- Returns: `streamId`, `streamKey`, `playbackId`, `rtmpUrl`

#### `/api/livestream/list` (GET)
- Fetches all streams from database
- Supports filtering by status (`?status=live`)
- Includes user information
- Returns formatted stream list

#### `/api/livestream/[id]` (GET)
- Fetches single stream by ID
- Includes owner information
- Returns stream details with keys (for owner)

#### `/api/profile/username` (POST/GET)
- POST: Set/update username
- GET: Fetch username
- Validates username format (3-20 chars, alphanumeric + _ -)
- Checks for uniqueness

### 3. **Updated Pages**

#### `/livestream/page.tsx`
- Now loads streams from database via API
- Shows both saved streams and demo streams
- Real-time updates when new streams created

#### `/livestream/[id]/page.tsx`
- Loads stream from database
- Shows owner-only information (streamKey, RTMP URL)
- OBS setup instructions for stream owners
- Live chat functionality

#### `/livestream/create/page.tsx`
- Creates stream in database
- Shows stream key after creation
- Redirects to stream detail page

#### `/profile/page.tsx`
- Username management UI (coming)
- Shows username or falls back to wallet address

## Required Steps

### Step 1: Run Prisma Migration

```bash
cd /Users/shikharsingh/Downloads/code/hedera/game/hedera-verse

# Generate Prisma client with new schema
bun run prisma generate

# Create and apply migration
bun run prisma migrate dev --name add_livestream_fields

# Or if you want to reset the database (WARNING: Deletes all data)
bun run prisma migrate reset
```

### Step 2: Verify Database Connection

Make sure your `.env` has:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/hedera_verse?schema=public"
```

### Step 3: Test the System

1. **Create a Stream**:
   ```
   - Go to /livestream
   - Click "Start Streaming"
   - Fill out the form
   - Submit
   ```

2. **View Stream Details**:
   ```
   - You'll be redirected to /livestream/{streamId}
   - As the owner, you'll see:
     * Stream Key
     * RTMP URL
     * Playback ID
     * OBS setup instructions
   ```

3. **Broadcast with OBS**:
   ```
   - Open OBS Studio
   - Settings → Stream
   - Server: rtmp://rtmp.livepeer.com/live
   - Stream Key: (from stream details)
   - Start Streaming
   ```

## Stream Owner Features

When you visit `/livestream/{streamId}` and you're the owner (your wallet address matches the stream creator), you'll see:

### Stream Configuration Card
```
🔑 Stream Configuration (Owner Only)

Stream ID: abc123...
Stream Key: xyz789... [Copy]
Playback ID: def456...
RTMP URL: rtmp://rtmp.livepeer.com/live [Copy]

📺 OBS Studio Setup:
1. Open OBS Studio
2. Go to Settings → Stream
3. Service: Custom
4. Server: rtmp://rtmp.livepeer.com/live
5. Stream Key: [your key]
6. Click Apply and Start Streaming
```

## Username System

### Setting a Username

```typescript
// API Call
POST /api/profile/username
{
  "accountId": "0.0.12345",
  "username": "cool_gamer_123"
}

// Response
{
  "success": true,
  "username": "cool_gamer_123",
  "message": "Username updated successfully"
}
```

### Username Rules
- 3-20 characters
- Letters, numbers, underscores, hyphens only
- Must be unique
- Case-sensitive

### Display Priority
1. Username (if set)
2. Name (if set)
3. Hedera Account ID
4. Wallet Address

## Database Schema

```prisma
model StreamingSession {
  id            String   @id @default(cuid())
  userId        String
  streamId      String   @unique // Livepeer stream ID
  streamKey     String   // For OBS
  playbackId    String?
  rtmpUrl       String   @default("rtmp://rtmp.livepeer.com/live")
  title         String
  description   String?
  game          String?
  status        String   // LIVE, ENDED, SCHEDULED
  isLive        Boolean  @default(false)
  viewerCount   Int      @default(0)
  startedAt     DateTime @default(now())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model User {
  id              String   @id @default(cuid())
  username        String?  @unique
  name            String?
  walletAddress   String   @unique
  hederaAccountId String?  @unique
  // ... other fields
}
```

## API Examples

### Create Stream
```bash
curl -X POST http://localhost:3000/api/livestream/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Epic Gaming Session",
    "description": "Playing my favorite game",
    "game": "Chess",
    "streamer": "0.0.12345"
  }'
```

### List All Streams
```bash
curl http://localhost:3000/api/livestream/list
```

### List Live Streams Only
```bash
curl http://localhost:3000/api/livestream/list?status=live
```

### Get Single Stream
```bash
curl http://localhost:3000/api/livestream/abc123
```

### Set Username
```bash
curl -X POST http://localhost:3000/api/profile/username \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "0.0.12345",
    "username": "pro_gamer"
  }'
```

## Troubleshooting

### Error: "streamKey does not exist in type"

**Solution**: Run Prisma migration
```bash
bun run prisma generate
bun run prisma migrate dev
```

### Error: "Failed to create stream"

**Causes**:
1. Livepeer API key not set
2. Database connection issue
3. User creation failed

**Check**:
```bash
# Verify env variables
echo $NEXT_PUBLIC_LIVEPEER_API_KEY

# Test database connection
bun run prisma studio
```

### Streams Not Showing

**Solution**: Check API response
```bash
# Open browser console on /livestream page
# Look for API errors
# Verify database has streams:
bun run prisma studio
```

## Next Steps

1. **Run the migration** (Step 1 above)
2. **Test stream creation**
3. **Add username UI to profile page** (partially implemented)
4. **Add real-time viewer count updates**
5. **Add stream status updates (LIVE/ENDED)**
6. **Add stream analytics**

## Files Modified

- `prisma/schema.prisma` - Updated StreamingSession model
- `src/app/api/livestream/create/route.ts` - Database integration
- `src/app/api/livestream/list/route.ts` - NEW
- `src/app/api/livestream/[id]/route.ts` - NEW
- `src/app/api/profile/username/route.ts` - NEW
- `src/app/livestream/page.tsx` - Load from database
- `src/app/livestream/[id]/page.tsx` - Show owner info
- `src/app/livestream/create/page.tsx` - Save to database
- `src/app/profile/page.tsx` - Username state (UI pending)

## Important Notes

⚠️ **Before running migration**: Backup your database if it has important data

⚠️ **Stream keys are sensitive**: Only show to stream owners

⚠️ **Username is optional**: System falls back to wallet address

✅ **Streams persist**: No more localStorage, everything in PostgreSQL

✅ **Multi-user support**: Each user can create multiple streams

✅ **Owner verification**: Stream keys only visible to creators
