# RealmOS 🎮

**The First AI-Powered Gaming Operating System on Hedera**

> Transform natural language into playable games. Earn while you play. Build gaming communities. All on Hedera.

[![Built on Hedera](https://img.shields.io/badge/Built%20on-Hedera-00D4AA?style=for-the-badge)](https://hedera.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)

---

## 🚀 What is RealmOS?

RealmOS is a **complete gaming ecosystem** that merges AI, blockchain, and social gaming:

- **🤖 AI Game Generator**: Create playable games from text prompts in <60 seconds
- **🎮 7 Built-in Games**: Chess, Sudoku, Tetris, Wordle, Crossword, Snake & Ladder
- **💰 Play-to-Earn**: Earn REALM tokens for gameplay, achievements, streaming
- **🏆 Esports Infrastructure**: Tournaments, guilds, ELO rankings, live streaming
- **🎨 NFT Marketplace**: Trade game assets, achievements, profile NFTs
- **🤝 Social Gaming**: Friends, messaging, co-op challenges, guild chat

---

## 🎯 Core Features

### 1. AI-Powered Game Generation ✨
- **Natural Language to Game**: "Create a space shooter" → Playable game in 60s
- **9 Game Templates**: Shooter, Platformer, Puzzle, Racing, Idle, Card, Arcade, Strategy, Board
- **Phaser.js Engine**: Production-ready games with physics, collisions, scoring
- **Instant Preview**: Play immediately in browser, download as HTML
- **GPT-4 Powered**: Intelligent prompt parsing and game specification

### 2. Blockchain Gaming (Hedera) ⛓️
- **HTS Integration**: REALM token + 3 NFT collections (Profile, Game Assets, Achievements)
- **HCS Leaderboards**: Immutable score verification and tournament results
- **Micro-transactions**: ~$0.0001 per transaction, 3-5s finality
- **Wallet Support**: HashPack, Blade, WalletConnect
- **Smart Rewards**: Automated token distribution

### 3. Esports & Tournaments 🏆
- **5 Tournament Formats**: Single/Double Elimination, Round Robin, Swiss, Battle Royale
- **Live Streaming**: Livepeer integration with watch-to-earn (0.1 REALM/min)
- **Prize Pools**: Automated HBAR/REALM distribution
- **Spectator Mode**: Watch live matches, earn rewards
- **Replays & Highlights**: Automatic recording

### 4. Guild System 🛡️
- **Guild Management**: Roles (Founder, Admin, Member), treasury, events
- **Real-time Chat**: Guild messaging with activity tracking
- **Guild Tournaments**: Exclusive competitions
- **Treasury**: Collective HBAR/REALM management
- **Contribution Tracking**: Leaderboards

### 5. Social Features 🤝
- **Friend System**: Add friends, send invites, track status
- **Direct Messaging**: Private conversations
- **Co-op Challenges**: Team-based challenges with shared rewards
- **Activity Feed**: Track friends' achievements

### 6. ELO Rating System 📊
- **Dynamic Rankings**: Chess-style ELO (1500 starting)
- **9 Rating Tiers**: Beginner → Legendary (2800+)
- **Seasonal Leaderboards**: Global and game-specific
- **Win Streaks**: Track consecutive victories
- **HCS Verification**: Tamper-proof scores

---



## 🎮 Games & Rewards

### Built-in Games (7)
| Game | Type | Rewards | Status |
|------|------|---------|--------|
| ♟️ Chess | Strategy | 50-200 REALM | ✅ Live |
| 🔢 Sudoku | Puzzle | 30-150 REALM | ✅ Live |
| 🧱 Tetris | Arcade | 40-180 REALM | ✅ Live |
| 📝 Wordle | Word | 25-100 REALM | ✅ Live |
| 🔤 Crypto Crossword | Puzzle | 60-250 REALM | ✅ Live |
| 🐍 Snake & Ladder | Board | 20-80 REALM | ✅ Live |

### AI-Generated Games (9 Templates)
| Template | Genre | Controls | Status |
|----------|-------|----------|--------|
| 🚀 Shooter | Action | Arrows + Space | ✅ Ready |
| 🏃 Platformer | Action | Arrows | ✅ Ready |
| 🧩 Puzzle | Puzzle | Mouse | ✅ Ready |
| 🏎️ Racing | Racing | Arrows | ✅ Ready |
| 💰 Idle/Clicker | Idle | Mouse | ✅ Ready |
| 🃏 Card | Card | Mouse | ✅ Ready |
| 🎯 Arcade | Arcade | Arrows + Space | ✅ Ready |
| 🏰 Strategy | Strategy | Mouse | ✅ Ready |
| 🎲 Board | Board | Mouse | ✅ Ready |

### Reward System
| Action | Reward | Frequency |
|--------|--------|-----------|
| Daily Login | 10 REALM + streak bonus | Daily |
| High Score | 50-500 REALM | Per improvement |
| Achievement | 100 REALM + NFT | One-time |
| Tournament Win | Prize pool + Trophy NFT | Per tournament |
| Watch Stream | 0.1 REALM/min (max 2hrs) | Per session |
| Referral | 200 REALM | Per successful referral |
| Guild Contribution | Variable | Per contribution |

---

## 🤖 AI Capabilities

### 1. AI Game Generator
**Prompt → Playable Game in 60 seconds**

```
User: "Create a space shooter with power-ups"
  ↓
GPT-4 Intent Parser
  ↓ Analyzes prompt, extracts mechanics
GameSpec Generation
  ↓ Creates structured JSON
Template Selection
  ↓ Routes to Phaser.js template
Code Generation
  ↓ Injects GameSpec into template
Instant Preview
  ↓ Playable game + download HTML
```

**Supported Prompts:**
- "Create a space shooter with power-ups"
- "Make a platformer where you collect coins"
- "Build a match-3 puzzle game"
- "Create a racing game with obstacles"
- "Make a tower defense game"

### 2. AI Agents (3)

**Game Assistant**
- Natural language game rules
- Strategy tips and hints
- Platform feature guidance
- Hedera blockchain education

**Tournament Manager**
- Automated bracket generation
- Fair ELO-based seeding
- Match scheduling
- Prize distribution

**Reward Distributor**
- Dynamic reward calculation
- Anti-abuse detection
- Automated REALM distribution
- Achievement tracking

---

## 🏪 NFT Marketplace

### Features
- **3 NFT Collections**: Profile NFTs, Game Assets, Achievement Badges
- **Listing Types**: Fixed price or auction
- **Payment**: HBAR or REALM tokens
- **Creator Royalties**: 5% on secondary sales
- **Platform Fee**: 2.5%
- **Smart Filters**: Category, rarity, price
- **HTS Integration**: Native Hedera NFTs

### NFT Categories
| Category | Use Case | Rarity Levels |
|----------|----------|---------------|
| Profile NFTs | Avatar customization | Common → Legendary |
| Game Assets | In-game items, skins | Common → Epic |
| Achievements | Badges, trophies | Rare → Legendary |
| AI-Generated Games | Playable game NFTs | Unique |

---

## 🏆 Tournament System

### Tournament Formats (5)
1. **Single Elimination**: Classic knockout bracket
2. **Double Elimination**: Losers bracket for second chances
3. **Round Robin**: Everyone plays everyone
4. **Swiss System**: Pairing based on performance
5. **Battle Royale**: Last player standing

### Features
- **Automated Brackets**: AI-generated with ELO seeding
- **Live Streaming**: Livepeer integration
- **Spectator Mode**: Watch + earn REALM (0.1/min)
- **Prize Distribution**: Instant HBAR/REALM via Hedera
- **NFT Trophies**: Top 3 receive achievement NFTs
- **HCS Recording**: Immutable results
- **Replays**: Automatic recording

### Prize Pool Structure
| Position | Prize | NFT Trophy |
|----------|-------|------------|
| 🥇 1st | 50% of pool | Legendary |
| 🥈 2nd | 30% of pool | Epic |
| 🥉 3rd | 20% of pool | Rare |

---


## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router) + React 19
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State**: React Query (TanStack)

### Backend
- **Database**: PostgreSQL + Prisma ORM (20+ models)
- **AI**: OpenAI GPT-4 via LangChain
- **Game Engine**: Phaser.js 3.80.1
- **Streaming**: Livepeer Studio

### Blockchain (Hedera)
- **SDK**: @hashgraph/sdk v2.67
- **Agent Kit**: hedera-agent-kit v3.0.4
- **Wallet**: @hashgraph/hedera-wallet-connect
- **Services**: HTS, HCS, Smart Contracts

---


## 📊 What We have built so far 

#### Core Platform
- [x] Next.js 15 app with App Router
- [x] PostgreSQL database with Prisma (20+ models)
- [x] Hedera wallet integration (HashPack, Blade, WalletConnect)
- [x] REALM token + 3 NFT collections
- [x] HCS topics for leaderboards, events, tournaments
- [x] User authentication and profiles

#### AI Game Generation
- [x] GPT-4 prompt parser
- [x] 9 Phaser.js game templates
- [x] Smart template routing
- [x] Instant preview system
- [x] HTML export functionality
- [x] GameSpec schema and validation

#### Gaming Features
- [x] 7 playable games (Chess, Sudoku, Tetris, Wordle, Crossword, Snake & Ladder)
- [x] Game wrapper with score submission
- [x] Reward calculation and distribution
- [x] High score tracking
- [x] Achievement system

#### Esports Infrastructure
- [x] Tournament system (5 formats)
- [x] Bracket generation with seeding
- [x] Livepeer streaming integration
- [x] Watch-to-earn rewards
- [x] Match replays and highlights
- [x] Prize distribution automation

#### Social Features
- [x] Guild creation and management
- [x] Guild chat (real-time ready)
- [x] Friend system with requests
- [x] Co-op challenges
- [x] Online status tracking
- [x] Direct messaging (infrastructure)

#### Marketplace
- [x] NFT listing (fixed price + auction)
- [x] Buy/sell with HBAR or REALM
- [x] Creator royalties (5%)
- [x] Platform fee (2.5%)
- [x] Category filtering

#### Leaderboards
- [x] ELO rating system
- [x] Global and seasonal rankings
- [x] Game-specific leaderboards
- [x] Rating tiers with badges
- [x] HCS score verification

## 🚀 Quick Start

### Prerequisites
- **Runtime**: Bun or Node.js 18+
- **Database**: PostgreSQL 14+
- **Hedera**: Testnet account ([Get free account](https://portal.hedera.com))
- **AI**: OpenAI API key ([Get key](https://platform.openai.com))
- **Streaming**: Livepeer API key ([Get key](https://livepeer.studio))

### Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd hedera-verse

# 2. Install dependencies
bun install

# 3. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 4. Setup database
bun run build:prisma
npx prisma migrate dev

# 5. Initialize Hedera (creates tokens + HCS topics)
bun run setup:hedera

# 6. Start development server
bun run dev

# 7. Open browser
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

## 🏗️ Architecture

```
RealmOS/
├── AI Layer
│   ├── GPT-4 Intent Parser
│   ├── Game Specification Generator
│   ├── Template Router
│   └── Code Generator
│
├── Gaming Layer
│   ├── 7 Built-in Games
│   ├── AI-Generated Games (9 templates)
│   ├── Score Submission System
│   └── Reward Distribution
│
├── Blockchain Layer (Hedera)
│   ├── HTS: REALM token + NFTs
│   ├── HCS: Leaderboards + Events
│   ├── Smart Contracts: Escrow + Treasury
│   └── Wallet Integration
│
├── Social Layer
│   ├── Guilds + Chat
│   ├── Friends + Messaging
│   ├── Tournaments + Streaming
│   └── Co-op Challenges
│
└── Data Layer
    ├── PostgreSQL + Prisma
    ├── 20+ Database Models
    ├── Redis Caching (ready)
    └── WebSocket Server (ready)
```

---

## 📁 Project Structure

```
realmos/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── page.tsx                 # Landing page
│   │   ├── create-game/             # AI game generator UI
│   │   ├── games/                   # 7 built-in games
│   │   ├── tournaments/             # Tournament system
│   │   ├── guilds/                  # Guild management
│   │   ├── marketplace/             # NFT marketplace
│   │   ├── leaderboard/             # ELO rankings
│   │   ├── livestream/              # Livepeer streaming
│   │   ├── social/                  # Friends & messaging
│   │   └── api/                     # API routes
│   │
│   ├── components/                   # React components
│   │   ├── games/                   # Game components
│   │   ├── social/                  # Social features
│   │   ├── stream/                  # Streaming
│   │   └── ui/                      # shadcn/ui
│   │
│   ├── lib/                          # Core services
│   │   ├── hedera/                  # Hedera integration
│   │   ├── agents/                  # AI agents
│   │   ├── game-templates/          # 9 Phaser.js templates
│   │   ├── tournament/              # Tournament logic
│   │   ├── social/                  # Social services
│   │   ├── leaderboard/             # ELO system
│   │   └── streaming/               # Livepeer
│   │
│   └── types/                        # TypeScript definitions
│
├── prisma/
│   ├── schema.prisma                # 20+ database models
│   └── migrations/                  # Migration history
│
├── scripts/
│   └── setup-hedera.ts              # Token/topic creation
│
└── documents/                        # Technical docs
    ├── AI_GAME_GENERATOR_README.md
    └── IMPLEMENTATION_SUMMARY.md
```

---

## 🔧 Development

### Available Scripts
```bash
# Development
bun run dev              # Start dev server (Turbopack)
bun run build            # Production build
bun run start            # Start production server

# Database
bun run build:prisma     # Generate Prisma client
npx prisma migrate dev   # Run migrations
npx prisma studio        # Open database GUI

# Hedera
bun run setup:hedera     # Create tokens + HCS topics

# Code Quality
bun run lint             # ESLint check
```

### Database Schema
**20+ Prisma Models:**
- User, Game, GameScore, GamePlay
- Tournament, TournamentPrize, Match
- Guild, GuildMember, GuildTournament
- NFT, Token, MarketplaceListing
- StreamingSession, HCSMessage
- Friendship, DirectMessage
- Achievement, AIAgent, AgentInteraction

---

## 🎯 Why RealmOS Wins

### 1. **Innovation** 🚀
- **First AI game generator on Hedera**: No other platform offers text-to-game in 60s
- **Complete gaming OS**: Not just games, but entire ecosystem
- **9 production-ready templates**: Instant game creation at scale

### 2. **Hedera Integration** ⛓️
- **Full HTS utilization**: REALM token + 3 NFT collections
- **HCS for trust**: Immutable leaderboards and tournament results
- **Micro-transaction ready**: ~$0.0001 per tx enables true play-to-earn
- **3-5s finality**: Instant rewards, no waiting

### 3. **Technical Excellence** 💻
- **90% complete**: Production-ready, not just a prototype
- **Modern stack**: Next.js 15, React 19, TypeScript 5
- **Scalable architecture**: Microservices-ready, horizontal scaling
- **20+ database models**: Comprehensive data modeling

### 4. **User Experience** 🎮
- **Instant gratification**: Create and play games in <60s
- **Earn while playing**: Every action rewarded
- **Social gaming**: Guilds, friends, tournaments
- **Professional UI**: shadcn/ui, Tailwind CSS, smooth animations

### 5. **Business Model** 💰
- **Platform fees**: 2.5% marketplace, sustainable revenue
- **Token economy**: REALM token with real utility
- **NFT royalties**: 5% creator royalties
- **Tournament entry fees**: Revenue from esports

---

## 📈 Metrics & KPIs

### Platform Metrics
- **Games Generated**: AI game creation count
- **Active Players**: Daily/Monthly active users
- **REALM Distributed**: Total rewards paid out
- **NFT Volume**: Marketplace trading volume
- **Tournament Participation**: Players per tournament

### Blockchain Metrics
- **HCS Messages**: Leaderboard entries + events
- **HTS Transactions**: Token transfers + NFT trades
- **Wallet Connections**: Unique Hedera accounts
- **Transaction Cost**: Average cost per interaction

### Engagement Metrics
- **Session Duration**: Average playtime
- **Retention Rate**: D1, D7, D30 retention
- **Social Connections**: Friends + guild members
- **Streaming Hours**: Total watch time

---

## 📚 Documentation

- **[AI Game Generator Guide](./documents/AI_GAME_GENERATOR_README.md)** - Complete AI system docs
- **[Implementation Summary](./documents/IMPLEMENTATION_SUMMARY.md)** - Technical implementation details
- **[Completion Status](./COMPLETION_STATUS.md)** - Current progress tracker
- **[Hedera Docs](https://docs.hedera.com)** - Official Hedera documentation
- **[Agent Kit](https://github.com/hashgraph/hedera-agent-kit)** - Hedera Agent Kit


## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines.

---

## 📄 License

MIT License - see LICENSE file for details

---

<!-- ## 🔗 Links

- **Website**: [realmos.io](https://realmos.io)
- **Twitter**: [@RealmOS](https://twitter.com/RealmOS)
- **Discord**: [Join our community](https://discord.gg/realmos)
- **GitHub**: [github.com/realmos](https://github.com/realmos)

--- -->

## 🙏 Acknowledgments

- **Hedera Hashgraph** - For the incredible blockchain infrastructure - HTS, HCS, Smart Contracts
- **Hedera Agent Kit** - For Hedera integration with LangChain and OpenAI
- **Livepeer** - For decentralized streaming infrastructure
- **Phaser.js** - For the game engine powering our templates

---

**Built for Hedera Gaming & NFT Track - Immersive Experience Category**

*Create. Play. Earn. Own. On Hedera.*

🎮 **RealmOS - The Future of Gaming is Here** 🎮