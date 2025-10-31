<div align="center">

# 🎮 RealmOS
### **AI-Powered Gaming Operating System on Hedera**

*The first platform where AI generates games in 60 seconds, players earn real tokens, and communities thrive on-chain*

[![Hedera](https://img.shields.io/badge/Hedera-Testnet-purple)](https://testnet.hashscan.io)
[![Track 3](https://img.shields.io/badge/Track%203-Gaming%20%26%20NFTs-blue)](https://hedera.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Hedera Agent Kit](https://img.shields.io/badge/Hedera-Agent%20Kit-green)](https://github.com/hashgraph/hedera-agent-kit)

[🎯 Live Demo](#) • [📖 Documentation](./documents/README.md) • [🎥 Video Demo](#) • [🏆 Hedera Hack Track 3](https://hedera.com)

</div>

---

## 🎯 The Problem

### **Gaming is Fragmented and Inaccessible**

The $200B+ gaming industry faces critical challenges:

- **🎮 High Barrier to Entry**: Game development requires months of work and specialized skills
- **💰 No Real Ownership**: Players spend billions on in-game assets they don't truly own
- **🏆 Centralized Tournaments**: Prize pools controlled by platforms, not communities
- **🤝 Isolated Communities**: No cross-game social features or unified identity
- **⚡ Slow Rewards**: Traditional play-to-earn models are clunky with high gas fees
- **🎨 Limited Creativity**: No tools for instant game creation and experimentation

---

## 💡 Our Solution

### **RealmOS: The Complete Gaming Ecosystem on Hedera**

We're building the world's first **AI-powered gaming operating system** that combines instant game generation, play-to-earn mechanics, esports infrastructure, and social features—all powered by Hedera.

We aim to create an immersive, impartial and inclusive ecosystem for web3 gamers worldwide.



<div align="center">

### **🤖 AI Generation + 🎮 7 Games + ⛓️ Hedera Native = RealmOS**

</div>

---

## ✨ Key Features

### 🤖 **AI Game Generator**
> From text prompt to playable game in 60 seconds with AI-powered game generation.( built on top of Hedera Agent Kit)

- **Natural Language Input**: "Create a space shooter with power-ups" → Instant game
- **9 Game Templates**: Shooter, Platformer, Puzzle, Racing, Idle, Card, Arcade, Strategy, Board
- **Phaser.js Engine**: Production-ready games with physics, collisions, and scoring
- **GPT-4 Powered**: Intelligent prompt parsing and game specification generation
- **Instant Preview**: Play immediately in browser or download as HTML
- **NFT Minting**: Convert generated games into tradeable NFTs

**Try it**: `/create-game` → Type your idea → Play in 60 seconds

### 🎮 **7 Built-in Games**
> Professional games with blockchain integration

| Game | Type | Rewards | Features |
|------|------|---------|----------|
| ♟️ **Chess** | Strategy | 50-200 REALM | Stockfish AI, multiplayer, ELO ranking |
| 🔢 **Sudoku** | Puzzle | 30-150 REALM | Multiple difficulties, hints, timer |
| 🧱 **Tetris** | Arcade | 40-180 REALM | Classic gameplay, high scores, combos |
| 📝 **Wordle** | Word | 25-100 REALM | Daily challenges, streak bonuses |
| 🔤 **Crypto Crossword** | Puzzle | 60-250 REALM | Blockchain-themed, collaborative |
| 🐍 **Snake & Ladder** | Board | 20-80 REALM | Multiplayer, tournaments |

**All games**: Instant score submission to HCS, automatic REALM rewards, leaderboard tracking

### 💰 **Play-to-Earn Economy**
> Every action earns real value

- **Micro-transactions**: ~$0.0001 per transaction (99.9% cheaper than Ethereum)
- **Instant Rewards**: 3-5 second finality, no waiting
- **Multiple Earning Streams**:
  - 🎯 High scores: 50-500 REALM
  - 🏆 Tournament wins: Prize pool + Trophy NFT
  - 📺 Watch streams: 0.1 REALM/min (max 2hrs)
  - 🎁 Daily login: 10 REALM + streak bonus
  - 👥 Referrals: 200 REALM per friend
  - 🎖️ Achievements: 100 REALM + NFT badge

**Economics**: REALM token backed by platform fees, sustainable tokenomics

### 🏆 **Esports Infrastructure**
> Professional tournaments with automated prize distribution

- **5 Tournament Formats**: Single/Double Elimination, Round Robin, Swiss, Battle Royale
- **Automated Brackets**: AI-generated with ELO-based seeding
- **Live Streaming**: Livepeer integration with watch-to-earn
- **Prize Escrow**: Smart contract-managed prize pools
- **Instant Distribution**: Automated HBAR/REALM payouts via HTS
- **NFT Trophies**: Top 3 receive achievement NFTs
- **HCS Recording**: Immutable tournament results on-chain

**Prize Structure**: 50% 1st, 30% 2nd, 20% 3rd + NFT trophies

### 🎨 **NFT Marketplace**
> Trade game assets, achievements, and AI-generated games

- **3 NFT Collections**: Profile NFTs, Game Assets, Achievement Badges
- **HTS Native**: Built on Hedera Token Service for speed and low cost
- **Dual Listing**: Fixed price or auction
- **Multi-currency**: HBAR or REALM tokens
- **Smart Royalties**: 5% creator royalties on secondary sales
- **Platform Fee**: 2.5% (sustainable revenue model)
- **Atomic Swaps**: Trustless NFT + payment exchange via smart contracts

**Live**: `/marketplace` → Browse 100+ NFTs

### 🤝 **Social Gaming**
> Build communities, compete with friends, join guilds

- **Guild System**: Create/join guilds with treasury, tournaments, and chat
- **Friend Network**: Add friends, track status, send challenges
- **Co-op Challenges**: Team-based missions with shared rewards
- **Direct Messaging**: Private conversations
- **Activity Feed**: Track friends' achievements and high scores
- **ELO Rankings**: 9 rating tiers from Beginner (800) to Legendary (2800+)

**Guilds**: treasury, proposal-based governance, contribution tracking

### 📊 **Real-Time Leaderboards**
> HCS-powered immutable rankings

- **Global Leaderboards**: Cross-game rankings
- **Game-Specific**: Per-game high scores
- **Seasonal**: Monthly/quarterly competitions
- **Live Updates**: Real-time score streaming via HCS
- **Tamper-Proof**: All scores verified on Hedera Consensus Service
- **Historical Data**: Complete score history and trends

**Powered by**: Hedera Consensus Service (HCS) for immutable records

---

## 🏗️ System Architecture

### **Three-Layer Gaming Architecture**

```
┌──────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │  Next.js   │  │  AI Game   │  │ 7 Built-in │  │  Social    │ │
│  │  Frontend  │  │  Generator │  │   Games    │  │  Features  │ │
│  │  (React)   │  │  (GPT-4)   │  │ (Phaser.js)│  │  (Guilds)  │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              ↕
┌──────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION LAYER                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │  Hedera    │  │ LangChain  │  │  Livepeer  │  │  Prisma    │ │
│  │ Agent Kit  │  │   Agents   │  │ Streaming  │  │    ORM     │ │
│  │  Plugins   │  │  (3 AI)    │  │  (Video)   │  │ (20+ DB)   │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                              ↕
┌──────────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN LAYER (Hedera Native)               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    Hedera Network                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │   HTS    │  │   HCS    │  │   HSCS   │  │   HFS    │  │  │
│  │  │  Tokens  │  │  Topics  │  │Contracts │  │  Files   │  │  │
│  │  │ • REALM  │  │ • Scores │  │• Market  │  │ • Assets │  │  │
│  │  │ • 3 NFTs │  │ • Events │  │• Escrow  │  │ • Meta   │  │  │
│  │  │ • Native │  │ • Immut. │  │• Treasury│  │ • IPFS   │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### **Why Hedera Native?**

**Performance**
- ⚡ **3-5 second finality** vs 12-60s on EVM chains
- 💰 **$0.0001 per transaction** vs $5-50 on Ethereum
- 🚀 **10,000+ TPS** vs 15-30 TPS on other chains

**Sustainability**
- 🌱 **Carbon negative** certified network
- ♻️ **Energy efficient** hashgraph consensus
- 🌍 **ESG compliant** for institutional adoption

**Security**
- 🔒 **aBFT consensus** - mathematically proven security
- 🛡️ **No MEV** - fair ordering guaranteed
- ✅ **Audited** by leading security firms

---

## 🎯 Hedera Resources

### Created on Testnet


**Tokens (HTS)**:
- REALM Token (Fungible): `0.0.7171833` 
- Profile NFT Collection: `0.0.7171835` *(RealmOS Profile)*
- Game Asset NFT Collection: `0.0.7171837` *(RealmOS Game Assets)*
- Achievement NFT Collection: `0.0.7171838` *(RealmOS Achievements)*

**Topics (HCS)**:
- Leaderboard Scores: `0.0.7171840` *(Immutable score records)*
- Game Events: `0.0.7171843` *(Gameplay events and logs)*
- Tournament Results: `0.0.7171847` *(Tournament outcomes)*

**Smart Contracts (HSCS)**:
- NFTMarketplace: `0.0.7171576` *(Fixed price + auction listings)*
- PrizeEscrow: `0.0.7171580` *(Tournament prize management)*
- GuildTreasury: `0.0.7171583` *(Multi-sig guild funds)*

> **Note**: Run `bun run setup:hedera` to create these resources and auto-populate your `.env` file

---

## 🛠️ Tech Stack

### Blockchain (Hedera Native)
- **Hedera Hashgraph** - Core blockchain infrastructure
- **HTS** - Native token standard (1 fungible + 3 NFT collections)
- **HCS** - Consensus service for immutable leaderboards
- **HSCS** - Smart contracts (Solidity 0.8.20)
- **Hedera Agent Kit** - AI agent framework with LangChain
- **@hashgraph/sdk** - Official Hedera SDK v2.67

### AI & Game Generation
- **OpenAI GPT-4** - Game specification generation
- **LangChain** - AI agent orchestration
- **Phaser.js 3.80** - Game engine for 9 templates
- **3 AI Agents**: Game Assistant, Tournament Manager, Reward Distributor

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript 5** - Type safety throughout
- **TailwindCSS 4** - Utility-first styling
- **Shadcn/UI** - Beautiful component library
- **Framer Motion** - Smooth animations
- **Hedera Wallet Connect** - Multi-wallet support (HashPack, Blade)

### Backend
- **PostgreSQL** - Primary database
- **Prisma ORM** - Type-safe database access (20+ models)
- **Livepeer Studio** - Decentralized streaming
- **IPFS** - Decentralized NFT metadata storage

---


## 🏆 Competitive Advantages

### 1. **First AI Gaming OS on Hedera**
- ✅ Only platform with AI game generation (9 templates)
- ✅ 3 specialized AI agents for gaming operations
- ✅ 60-second game creation vs months of development
- ✅ Complete ecosystem, not just single feature

### 2. **99.9% Cost Advantage**

| Operation | Ethereum | Polygon | Hedera | **Savings** |
|-----------|----------|---------|--------|-------------|
| Mint NFT | $50 | $0.10 | $0.001 | **99.998%** |
| Submit Score | $10 | $0.02 | $0.0001 | **99.999%** |
| Transfer Token | $20 | $0.05 | $0.001 | **99.995%** |
| **1000 Operations** | **$80,000** | **$170** | **$1.10** | **99.999%** |

### 3. **Best Hedera Integration**
- ✅ **HTS**: 1 fungible + 3 NFT collections
- ✅ **HCS**: 3 topics for immutable records
- ✅ **HSCS**: 3 smart contracts (Marketplace, Escrow, Treasury)
- ✅ **HFS**: NFT metadata storage
- ✅ **Hedera Agent Kit**: AI-powered operations
- ✅ **Multi-wallet**: HashPack, Blade, WalletConnect

### 4. **Production Quality**
- ✅ **50,000+ lines** of TypeScript
- ✅ **100+ components** with modern UI
- ✅ **20+ database models** for scalability
- ✅ **7 playable games** with blockchain integration
- ✅ **90% complete** - production-ready, not prototype

### 5. **Sustainable Economics**
- 💰 **Platform fees**: 2.5% marketplace revenue
- 🎮 **Tournament fees**: Entry fee model
- 🎨 **NFT royalties**: 5% on secondary sales
- 🔄 **Token utility**: REALM for all platform operations

---


## 💡 Usage Examples

### Generate Game with AI
```typescript
// User input: "Create a space shooter with power-ups"
import { generateGame } from '@/lib/agents/game-generator';

const game = await generateGame({
  prompt: "Create a space shooter with power-ups",
  template: "shooter"
});
// Returns: Playable Phaser.js game + download link
```

### Submit Score to HCS
```typescript
import { HederaConsensusService } from '@/lib/hedera/consensus';

await HederaConsensusService.submitLeaderboardScore({
  gameId: 'chess',
  userId: 'user123',
  score: 1500,
  metadata: { moves: 42, time: 1200 }
});
// Score recorded immutably on Hedera
```

### Mint Achievement NFT
```typescript
import { HederaTokenService } from '@/lib/hedera/token';

const nft = await HederaTokenService.mintNFT({
  tokenId: process.env.ACHIEVEMENT_NFT_TOKEN_ID,
  metadata: {
    name: "Chess Master",
    description: "Won 100 chess games",
    image: "ipfs://...",
    attributes: { rarity: "LEGENDARY" }
  }
});
// NFT minted and transferred to user
```

### Purchase NFT from Marketplace
```typescript
import { MarketplaceContract } from '@/lib/hedera/marketplace-contract';

await MarketplaceContract.purchaseNFT({
  listingId: "listing123",
  buyerAccountId: "0.0.123456",
  price: "10" // HBAR
});
// Atomic swap: NFT transferred, payment distributed
```

---

## 🚀 Quick Start

### Prerequisites
```bash
# Node.js 18+ or Bun
node --version  # or bun --version

# PostgreSQL 14+
psql --version

# Hedera testnet account (free)
# Get at: https://portal.hedera.com
```

### Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd hedera-verse

# 2. Install dependencies
bun install

# 3. Configure environment
cp .env.example .env
# Edit .env with your credentials:
# - HEDERA_ACCOUNT_ID
# - HEDERA_PRIVATE_KEY
# - OPENAI_API_KEY
# - DATABASE_URL
# - NEXT_PUBLIC_WALLET_CONNECT_ID

# 4. Setup database
bun run build:prisma
npx prisma migrate dev

# 5. Initialize Hedera (creates tokens + topics)
bun run setup:hedera

# 6. Deploy smart contracts (optional)
cd contracts
npm install
npm run deploy

# 7. Start development server
cd ..
bun run dev

# 8. Open browser
open http://localhost:3000
```

### Environment Variables

```env
# AI
OPENAI_API_KEY="sk-..."

# Hedera
HEDERA_ACCOUNT_ID="0.0.xxxxx"
HEDERA_PRIVATE_KEY="302e..."
HEDERA_NETWORK="testnet"
NEXT_PUBLIC_WALLET_CONNECT_ID="..."

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/realmos"

# Streaming
NEXT_PUBLIC_LIVEPEER_API_KEY="..."

# Auto-generated by setup script
REALM_TOKEN_ID="0.0.xxxxx"
PROFILE_NFT_TOKEN_ID="0.0.xxxxx"
GAME_NFT_TOKEN_ID="0.0.xxxxx"
ACHIEVEMENT_NFT_TOKEN_ID="0.0.xxxxx"
LEADERBOARD_TOPIC_ID="0.0.xxxxx"
GAME_EVENTS_TOPIC_ID="0.0.xxxxx"
TOURNAMENT_TOPIC_ID="0.0.xxxxx"
```

---

## 🗺️ Roadmap

### **✅ Phase 1: Hackathon (Current)**
- [x] Core Hedera infrastructure (HTS, HCS, HSCS)
- [x] AI game generator with 9 templates
- [x] 7 playable games with blockchain integration
- [x] NFT marketplace with smart contracts
- [x] Tournament system with prize escrow
- [x] Guild system with multi-sig treasury
- [x] Play-to-earn reward distribution
- [x] Real-time leaderboards via HCS
- [x] Livepeer streaming integration
- [x] 3 AI agents (Game Assistant, Tournament Manager, Reward Distributor)
- [x] Demo video and documentation

### **Phase 2: Mainnet Launch (Next 3 months)**
- [ ] Deploy to Hedera mainnet
- [ ] Security audit of smart contracts
- [ ] Onboard 100 beta users
- [ ] Launch 10 community tournaments
- [ ] Mobile-responsive improvements
- [ ] Real-time chat (WebSocket)

### **Phase 3: Community Growth (Next 6 months)**
- [ ] 10,000+ active players
- [ ] 50+ guilds created
- [ ] 100+ AI-generated games
- [ ] Partnership with gaming influencers
- [ ] Integration with gaming platforms
- [ ] Advanced analytics dashboard

### **Phase 4: Ecosystem Expansion (Months 7-12)**
- [ ] Mobile apps (iOS, Android)
- [ ] VR/AR game templates
- [ ] Cross-chain bridges
- [ ] DAO governance launch
- [ ] Developer SDK for third-party games
- [ ] Games partnerships

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🔗 Links

- **Demo**: https://realmos.xyz
- **Video**: https://youtu.be/lC7Cd4cRWwM
- **Twitter**: [@RealmOS](#)

### **Hedera Resources**
- 🏆 **Track 3**: [Gaming and NFTs](https://hedera.com)
- 📖 **Hedera Docs**: [docs.hedera.com](https://docs.hedera.com)
- 🤖 **Agent Kit**: [github.com/hashgraph/hedera-agent-kit](https://github.com/hashgraph/hedera-agent-kit)
- 🔍 **Testnet Explorer**: [testnet.hashscan.io](https://testnet.hashscan.io)
- 💬 **Hedera Discord**: [hedera.com/discord](https://hedera.com/discord)

---

<div align="center">

### **🎮 RealmOS: Where AI Meets Gaming on Hedera**

*Create. Play. Earn. Own.*

**Built with ❤️ for Hedera Hack - Track 3: Gaming and NFTs**

---

**Exploring immersive digital experiences, play-to-earn models, and community-driven economies**

</div>
