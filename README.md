# HederaVerse 🎮

**An Agentic Gaming Platform on Hedera Blockchain**

HederaVerse is a next-generation gaming platform built on Hedera Hashgraph, featuring AI-powered agents, NFT integration, and immersive gaming experiences. Built for the Hedera Gaming & NFT Track.

## 🌟 Features

### Core Features
- **7 Puzzle Games**: Chess, Sudoku, Tetris, Candy Saga, Crypto Crossword, Wordle, Snake & Ladder
- **NFT Integration**: Profile NFTs, game assets, achievements, and tournament prizes
- **AI Agents**: Game assistant, tournament manager, and reward distributor
- **Marketplace**: Trade NFTs with HBAR or REALM tokens
- **Tournaments**: Automated tournament management with prize pools
- **Streaming**: Livepeer integration with viewer rewards
- **Leaderboards**: Immutable leaderboards using HCS (Hedera Consensus Service)

### Hedera Integration
- **HTS (Hedera Token Service)**: REALM token and NFT collections
- **HCS (Hedera Consensus Service)**: Immutable game events and leaderboards
- **Low-cost transactions**: ~$0.0001 per transaction
- **Fast finality**: 3-5 second transaction confirmation
- **Wallet Support**: HashPack, Blade Wallet, WalletConnect

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL database
- Hedera testnet account ([Get one here](https://portal.hedera.com))
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd hedera-verse
```

2. **Install dependencies**
```bash
bun install
# or
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
OPENAI_API_KEY="your-openai-key"
HEDERA_ACCOUNT_ID="0.0.xxxxx"
HEDERA_PRIVATE_KEY="302e..."
HEDERA_NETWORK="testnet"
NEXT_PUBLIC_WALLET_CONNECT_ID="your-wallet-connect-id"
DATABASE_URL="postgresql://user:password@localhost:5432/hedera_verse"
```

4. **Set up database**
```bash
bun run build:prisma
npx prisma migrate dev
```

5. **Initialize Hedera tokens and topics**
```bash
bun run scripts/setup-hedera.ts
```

This will create:
- REALM token (platform currency)
- Profile NFT collection
- Game Asset NFT collection
- Achievement NFT collection
- HCS topics for leaderboards, events, and tournaments

6. **Start the development server**
```bash
bun run dev
# or
npm run dev
```

7. **Open your browser**
```
http://localhost:3000
```

## 📁 Project Structure

```
hedera-verse/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   │   ├── hedera/       # Hedera operations
│   │   │   ├── games/        # Game endpoints
│   │   │   ├── agent/        # AI agent endpoints
│   │   │   └── marketplace/  # NFT marketplace
│   │   ├── games/            # Game pages
│   │   ├── profile/          # User profile
│   │   └── marketplace/      # NFT marketplace
│   ├── components/            # React components
│   │   ├── games/            # Game components
│   │   ├── ui/               # shadcn/ui components
│   │   └── landing/          # Landing page
│   ├── lib/                   # Utilities and services
│   │   ├── hedera/           # Hedera integration
│   │   │   ├── client.ts     # Hedera client
│   │   │   ├── token.ts      # HTS operations
│   │   │   ├── consensus.ts  # HCS operations
│   │   │   ├── nft.ts        # NFT operations
│   │   │   ├── marketplace.ts # Marketplace
│   │   │   └── account.ts    # Account operations
│   │   └── agents/           # AI agents
│   │       ├── game-assistant.ts
│   │       ├── tournament-manager.ts
│   │       └── reward-distributor.ts
│   └── types/                # TypeScript types
├── prisma/
│   └── schema.prisma         # Database schema
├── scripts/
│   └── setup-hedera.ts       # Hedera setup script
└── IMPLEMENTATION_PLAN.md    # Detailed implementation plan
```

## 🎮 Games

### Available Games
1. **Chess** - Strategic board game with NFT pieces
2. **Sudoku** - Number puzzles with difficulty-based rewards
3. **Tetris** - Block-stacking with high-score NFTs
4. **Candy Saga** - Match-three with combo rewards
5. **Crypto Crossword** - Blockchain-themed puzzles
6. **Wordle** - Word-guessing with streak NFTs
7. **Snake & Ladder** - Traditional game with blockchain twists

### Rewards System
- **Daily Login**: 10 REALM + streak bonus
- **High Score**: 50-500 REALM based on improvement
- **Achievements**: 100 REALM + NFT badge
- **Tournament Win**: Prize pool + NFT trophy
- **Referrals**: 200 REALM per successful referral

## 🤖 AI Agents

### Game Assistant
- Explains game rules and mechanics
- Provides strategy tips
- Helps with platform features
- Answers Hedera blockchain questions

### Tournament Manager
- Generates fair brackets
- Schedules matches automatically
- Verifies results
- Distributes prizes

### Reward Distributor
- Calculates fair rewards
- Prevents abuse
- Automates token distribution
- Tracks achievements

## 🏪 NFT Marketplace

- **List NFTs**: Fixed price or auction
- **Buy/Sell**: HBAR or REALM tokens
- **Royalties**: Creator royalties on secondary sales
- **Platform Fee**: 2.5% marketplace fee
- **Categories**: Profiles, Game Assets, Achievements

## 🏆 Tournaments

- **Create Tournaments**: Custom prize pools
- **Automated Brackets**: AI-generated fair brackets
- **Prize Distribution**: Automatic HBAR/REALM distribution
- **NFT Trophies**: Winners receive unique NFTs
- **HCS Recording**: Results recorded on-chain

## 🔧 Development

### Scripts
```bash
# Development
bun run dev

# Build
bun run build

# Prisma
bun run build:prisma
npx prisma migrate dev
npx prisma studio

# Hedera setup
bun run scripts/setup-hedera.ts
```

### Environment Variables
See `.env.example` for all required variables.

## 📚 Documentation

- [Implementation Plan](./IMPLEMENTATION_PLAN.md) - Detailed technical plan
- [Hedera Docs](https://docs.hedera.com) - Hedera documentation
- [Agent Kit](https://github.com/hashgraph/hedera-agent-kit) - Hedera Agent Kit

## 🎯 Roadmap

### Phase 1: MVP (Current)
- ✅ Core platform architecture
- ✅ Hedera integration (HTS, HCS)
- ✅ AI agent system
- ✅ 7 puzzle games
- ✅ NFT marketplace
- ✅ Tournament system

### Phase 2: Enhancement
- [ ] Mobile app (React Native)
- [ ] Advanced streaming features
- [ ] DAO governance
- [ ] Cross-game assets
- [ ] Multiplayer modes

### Phase 3: Expansion
- [ ] Mainnet deployment
- [ ] Additional games
- [ ] Esports infrastructure
- [ ] VR/AR integration
- [ ] Cross-chain bridge

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Website**: [hederaverse.io](https://hederaverse.io)
- **Twitter**: [@HederaVerse](https://twitter.com/HederaVerse)
- **Discord**: [Join our community](https://discord.gg/hederaverse)

## 🙏 Acknowledgments

- Hedera Hashgraph team
- OpenAI for GPT-4
- Livepeer for streaming
- shadcn/ui for components

---

**Built for Hedera Gaming & NFT Track - Immersive Experience Category**

*Play. Earn. Own. On Hedera.*