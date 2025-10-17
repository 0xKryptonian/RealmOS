# Getting Started with HederaVerse

## Overview
HederaVerse is now configured with a complete Hedera blockchain integration, AI agent system, and gaming infrastructure. This guide will help you get the platform running.

## ⚠️ Important Notes

### TypeScript Errors
The current TypeScript errors you're seeing are **expected** and will be resolved once you run Prisma migrations:

```
Property 'nFT' does not exist on type 'PrismaClient'
Property 'aIAgent' does not exist on type 'PrismaClient'
Property 'marketplaceListing' does not exist on type 'PrismaClient'
```

**Why?** These errors occur because:
1. We've updated the Prisma schema with new models (NFT, AIAgent, MarketplaceListing, etc.)
2. The Prisma client hasn't been regenerated yet
3. Once you run `bun run build:prisma` or `npx prisma generate`, these will disappear

## 🚀 Setup Steps

### 1. Install Dependencies
```bash
bun install
# or
npm install
```

### 2. Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Required: Get from portal.hedera.com
HEDERA_ACCOUNT_ID="0.0.xxxxx"
HEDERA_PRIVATE_KEY="302e..."
HEDERA_NETWORK="testnet"

# Required: Get from platform.openai.com
OPENAI_API_KEY="sk-..."

# Required: Get from walletconnect.com
NEXT_PUBLIC_WALLET_CONNECT_ID="..."

# Required: Your PostgreSQL database
DATABASE_URL="postgresql://user:password@localhost:5432/hedera_verse"
```

### 3. Set Up Database
```bash
# Generate Prisma client (this fixes TypeScript errors)
bun run build:prisma

# Run migrations to create tables
npx prisma migrate dev --name init

# Optional: Open Prisma Studio to view database
npx prisma studio
```

### 4. Initialize Hedera Tokens & Topics
This script creates all necessary Hedera infrastructure:
```bash
bun run setup:hedera
```

This will create:
- ✅ REALM token (platform currency)
- ✅ Profile NFT collection
- ✅ Game Asset NFT collection  
- ✅ Achievement NFT collection
- ✅ HCS topics for leaderboards, events, and tournaments

The script automatically updates your `.env` file with the created token IDs.

### 5. Start Development Server
```bash
bun run dev
# or
npm run dev
```

Visit: http://localhost:3000

## 📋 What's Been Built

### ✅ Completed Features

#### 1. **Hedera Integration Layer** (`src/lib/hedera/`)
- **client.ts**: Hedera client initialization and management
- **token.ts**: HTS token operations (create, mint, transfer)
- **nft.ts**: NFT-specific operations (profile, game assets, achievements)
- **consensus.ts**: HCS message submission and subscriptions
- **marketplace.ts**: NFT trading with atomic swaps
- **account.ts**: Account creation and balance queries

#### 2. **AI Agent System** (`src/lib/agents/`)
- **base-agent.ts**: Base class for all agents
- **game-assistant.ts**: Helps players with rules and strategies
- **tournament-manager.ts**: Automates tournament management
- **reward-distributor.ts**: Calculates and distributes rewards

#### 3. **API Routes** (`src/app/api/`)
- **hedera/account/balance**: Get account balances
- **hedera/nft/mint**: Mint NFTs (profiles, assets, achievements)
- **games/submit-score**: Submit scores with HCS + rewards
- **agent/chat**: Chat with AI agents
- **marketplace/list**: List and browse NFTs

#### 4. **Database Schema** (`prisma/schema.prisma`)
Enhanced with Hedera-specific models:
- User (with hederaAccountId, realmBalance)
- Token (HTS token tracking)
- NFT (NFT ownership and metadata)
- HCSMessage (consensus messages)
- MarketplaceListing (NFT marketplace)
- AIAgent & AgentInteraction
- Achievement, TournamentPrize, StreamingSession

#### 5. **Documentation**
- README.md: Comprehensive project overview
- IMPLEMENTATION_PLAN.md: Detailed technical plan
- GETTING_STARTED.md: This file

### 🔄 Next Steps to Complete

#### 1. **Game Integration**
The games already exist in `src/components/` but need Hedera integration:
- Connect score submission to `/api/games/submit-score`
- Add NFT reward displays
- Integrate with HCS leaderboards

#### 2. **UI Components**
Update landing page and components:
- Hero section with Hedera branding
- Wallet connection UI
- NFT gallery
- Leaderboard displays
- Tournament brackets

#### 3. **Tournament System**
Build tournament pages:
- Tournament creation form
- Bracket visualization
- Match management
- Prize distribution UI

#### 4. **Marketplace UI**
Create marketplace pages:
- NFT listing page
- NFT detail page
- Buy/sell interface
- User's NFT collection

#### 5. **Profile System**
Build user profile:
- Profile NFT minting
- Stats dashboard
- Achievement gallery
- Transaction history

## 🎮 How to Use the Platform

### For Players

1. **Connect Wallet**
   - Use HashPack or Blade Wallet
   - Connect via WalletConnect

2. **Create Profile NFT**
   ```typescript
   POST /api/hedera/nft/mint
   {
     "type": "PROFILE",
     "params": {
       "username": "player123",
       "bio": "Gamer on Hedera",
       "avatarUrl": "ipfs://...",
       "accountId": "0.0.xxxxx"
     }
   }
   ```

3. **Play Games**
   - Navigate to `/games/chess`, `/games/sudoku`, etc.
   - Submit scores automatically
   - Earn REALM tokens for high scores

4. **Chat with AI Assistant**
   ```typescript
   POST /api/agent/chat
   {
     "message": "How do I play chess?",
     "agentType": "GAME_ASSISTANT",
     "userId": "user-id"
   }
   ```

5. **Trade NFTs**
   - List your NFTs on marketplace
   - Browse and purchase others' NFTs
   - Automatic royalty distribution

### For Developers

#### Create a New Game
1. Add game component in `src/components/games/`
2. Create game page in `src/app/games/[game-name]/`
3. Integrate score submission:
```typescript
const submitScore = async (score: number) => {
  const response = await fetch('/api/games/submit-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      gameId: 'your-game-id',
      score,
      metadata: { /* game-specific data */ }
    })
  });
  
  const result = await response.json();
  if (result.data.reward) {
    console.log(`Earned ${result.data.reward.amount} REALM!`);
  }
};
```

#### Add Custom NFT Type
1. Update `src/lib/hedera/nft.ts` with new mint function
2. Add to NFT type enum in schema
3. Create API endpoint if needed

#### Create Custom Agent
1. Extend `BaseAgent` in `src/lib/agents/`
2. Define system prompt and capabilities
3. Add to `AgentFactory`

## 🔧 Troubleshooting

### TypeScript Errors
**Problem**: `Property 'nFT' does not exist on type 'PrismaClient'`
**Solution**: Run `bun run build:prisma` to regenerate Prisma client

### Database Connection
**Problem**: Cannot connect to database
**Solution**: 
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env`
- Run `npx prisma migrate dev`

### Hedera Connection
**Problem**: Hedera transactions failing
**Solution**:
- Verify HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY
- Ensure account has testnet HBAR (get from portal.hedera.com)
- Check network is set to "testnet"

### Setup Script Fails
**Problem**: `setup-hedera.ts` errors
**Solution**:
- Ensure all env variables are set
- Check account has sufficient HBAR (~10 HBAR for setup)
- Verify network connectivity

## 📚 Key Concepts

### REALM Token
- Platform currency (fungible token)
- Earned through gameplay
- Used for marketplace transactions
- 8 decimals, 100M max supply

### NFT Collections
1. **Profile NFTs**: User identity on-chain
2. **Game Assets**: In-game items and skins
3. **Achievements**: Badges for accomplishments
4. **Tournament Prizes**: Winner trophies

### HCS Topics
1. **Leaderboard**: Immutable score records
2. **Game Events**: Gameplay events log
3. **Tournaments**: Tournament results

### AI Agents
1. **Game Assistant**: Player help and guidance
2. **Tournament Manager**: Automated tournaments
3. **Reward Distributor**: Fair reward calculation

## 🎯 Testing the Platform

### Test Score Submission
```bash
curl -X POST http://localhost:3000/api/games/submit-score \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "gameId": "chess",
    "score": 1500
  }'
```

### Test AI Agent
```bash
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain chess rules",
    "agentType": "GAME_ASSISTANT"
  }'
```

### Test NFT Minting
```bash
curl -X POST http://localhost:3000/api/hedera/nft/mint \
  -H "Content-Type: application/json" \
  -d '{
    "type": "ACHIEVEMENT",
    "tokenId": "0.0.xxxxx",
    "params": {
      "title": "First Win",
      "description": "Won your first game",
      "imageUrl": "ipfs://...",
      "achievementType": "FIRST_WIN",
      "earnedBy": "player123",
      "earnedAt": "2025-10-27T00:00:00Z"
    }
  }'
```

## 🚀 Deployment

### Environment Setup
1. Set up production database (PostgreSQL)
2. Get production Hedera account (mainnet)
3. Configure production environment variables
4. Run setup script on mainnet

### Build & Deploy
```bash
# Build application
bun run build

# Start production server
bun run start
```

### Recommended Hosting
- **Vercel**: Best for Next.js (automatic deployments)
- **Railway**: Good for full-stack with database
- **AWS/GCP**: For enterprise deployments

## 📞 Support

For issues or questions:
1. Check the IMPLEMENTATION_PLAN.md for technical details
2. Review Hedera docs: https://docs.hedera.com
3. Join Hedera Discord: https://hedera.com/discord

---

**Ready to build the future of gaming on Hedera! 🎮⚡**
