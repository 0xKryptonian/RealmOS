# RealmOS Smart Contracts

Solidity smart contracts for the RealmOS gaming platform on Hedera.

## 📋 Contracts

### 1. NFTMarketplace.sol
**Decentralized NFT marketplace with full trading functionality**

**Features:**
- ✅ Fixed-price listings
- ✅ Auction system with bidding
- ✅ Offer/counter-offer mechanism
- ✅ Platform fees (2.5%)
- ✅ Creator royalties (configurable)
- ✅ Atomic swaps (HBAR + NFT)
- ✅ Withdrawal system
- ✅ Listing management (create, cancel, update)

**Key Functions:**
```solidity
createListing(nftContract, tokenId, price, paymentToken, listingType, expiresAt, royaltyPercentage, royaltyRecipient)
purchaseNFT(listingId)
cancelListing(listingId)
makeOffer(listingId, offerPrice, expiresAt)
acceptOffer(offerId)
placeBid(listingId)
endAuction(listingId)
withdraw()
```

### 2. PrizeEscrow.sol
**Tournament prize pool management with escrow**

**Features:**
- ✅ Create tournaments with prize pools
- ✅ Participant registration
- ✅ Prize distribution configuration
- ✅ Automated prize distribution
- ✅ Winner verification
- ✅ Refund mechanism for cancelled tournaments
- ✅ Multi-position prizes (1st, 2nd, 3rd, etc.)

**Key Functions:**
```solidity
createTournament(startTime, endTime) payable
addToPrizePool(tournamentId) payable
registerParticipant(tournamentId, participant)
setPrizeDistribution(tournamentId, positions[], amounts[])
completeTournament(tournamentId, winners[])
distributePrizes(tournamentId)
claimPrize(tournamentId)
cancelTournament(tournamentId)
```

### 3. GuildTreasury.sol
**Multi-signature treasury for gaming guilds**

**Features:**
- ✅ Guild creation and management
- ✅ Multi-signature withdrawals
- ✅ Member roles (Founder, Admin, Member)
- ✅ Proposal system for governance
- ✅ Contribution tracking
- ✅ Treasury balance management
- ✅ Member addition/removal

**Key Functions:**
```solidity
createGuild(name, requiredSignatures)
deposit(guildId) payable
proposeWithdrawal(guildId, recipient, amount, description)
approveProposal(proposalId)
executeProposal(proposalId)
addMember(guildId, member, role)
removeMember(guildId, member)
```

## 🚀 Deployment

### Prerequisites
```bash
npm install
# or
bun install
```

### Environment Setup
Create `.env` file:
```bash
HEDERA_ACCOUNT_ID="0.0.xxxxx"
HEDERA_PRIVATE_KEY="302e..."
HEDERA_NETWORK="testnet" # or "mainnet"
```

### Compile Contracts
```bash
npm run compile
# or
./compile-and-deploy.sh
```

### Deploy to Hedera
```bash
npm run deploy
```

This will:
1. Compile all Solidity contracts
2. Deploy to Hedera network
3. Output contract IDs
4. Update `.env` with contract addresses

## 📝 Integration Guide

### Frontend Integration

#### 1. Marketplace Contract

```typescript
import { getMarketplaceContract } from '@/lib/hedera/marketplace-contract';

// Create listing
const marketplace = getMarketplaceContract();
const { listingId, txId } = await marketplace.createListing({
  nftContract: '0.0.xxxxx',
  tokenId: 1,
  price: 100000000, // 1 HBAR in tinybars
  paymentToken: '0x0000000000000000000000000000000000000000', // HBAR
  listingType: 0, // FIXED_PRICE
  expiresAt: 0,
  royaltyPercentage: 500, // 5%
  royaltyRecipient: '0.0.xxxxx',
});

// Purchase NFT
await marketplace.purchaseNFT(listingId, price);

// Make offer
const { offerId } = await marketplace.makeOffer(listingId, offerPrice, expiresAt);

// Place bid on auction
await marketplace.placeBid(listingId, bidAmount);
```

#### 2. Prize Escrow Contract

```typescript
import { PrizeEscrowContract } from '@/lib/hedera/prize-escrow-contract';

const escrow = new PrizeEscrowContract(contractId);

// Create tournament
const { tournamentId } = await escrow.createTournament(
  startTime,
  endTime,
  prizePool
);

// Set prize distribution
await escrow.setPrizeDistribution(
  tournamentId,
  [1, 2, 3], // positions
  [50000000, 30000000, 20000000] // amounts in tinybars
);

// Complete tournament
await escrow.completeTournament(
  tournamentId,
  [winner1Address, winner2Address, winner3Address]
);

// Distribute prizes
await escrow.distributePrizes(tournamentId);
```

#### 3. Guild Treasury Contract

```typescript
import { GuildTreasuryContract } from '@/lib/hedera/guild-treasury-contract';

const treasury = new GuildTreasuryContract(contractId);

// Create guild
const { guildId } = await treasury.createGuild('My Guild', 2); // 2 signatures required

// Deposit to treasury
await treasury.deposit(guildId, amount);

// Propose withdrawal
const { proposalId } = await treasury.proposeWithdrawal(
  guildId,
  recipientAddress,
  amount,
  'Tournament prizes'
);

// Approve proposal
await treasury.approveProposal(proposalId);

// Auto-executes when enough approvals
```

## 🔒 Security Features

### Marketplace
- ✅ Reentrancy protection
- ✅ Ownership verification
- ✅ Status checks
- ✅ Expiration validation
- ✅ Atomic transactions

### Prize Escrow
- ✅ Participant verification
- ✅ Time-locked distributions
- ✅ Refund mechanism
- ✅ Winner validation
- ✅ Double-claim prevention

### Guild Treasury
- ✅ Multi-signature requirements
- ✅ Role-based access control
- ✅ Proposal expiration
- ✅ Balance verification
- ✅ Approval tracking

## 📊 Gas Estimates

| Operation | Gas Cost |
|-----------|----------|
| Create Listing | ~200,000 |
| Purchase NFT | ~300,000 |
| Place Bid | ~250,000 |
| Create Tournament | ~250,000 |
| Distribute Prizes | ~300,000 |
| Create Guild | ~200,000 |
| Propose Withdrawal | ~150,000 |

## 🧪 Testing

```bash
npm run test
```

Run specific test:
```bash
npm run test:marketplace
npm run test:escrow
npm run test:treasury
```

## 📖 API Reference

### Marketplace Events

```solidity
event ListingCreated(uint256 indexed listingId, address indexed seller, address nftContract, uint256 tokenId, uint256 price, ListingType listingType)
event ListingSold(uint256 indexed listingId, address indexed seller, address indexed buyer, uint256 price)
event ListingCancelled(uint256 indexed listingId)
event OfferCreated(uint256 indexed offerId, uint256 indexed listingId, address indexed buyer, uint256 offerPrice)
event BidPlaced(uint256 indexed listingId, address indexed bidder, uint256 amount)
```

### Prize Escrow Events

```solidity
event TournamentCreated(uint256 indexed tournamentId, address indexed organizer, uint256 prizePool, uint256 startTime, uint256 endTime)
event TournamentCompleted(uint256 indexed tournamentId)
event PrizeDistributed(uint256 indexed tournamentId, uint256 position, address indexed winner, uint256 amount)
event PrizeClaimed(uint256 indexed tournamentId, address indexed winner, uint256 amount)
```

### Guild Treasury Events

```solidity
event GuildCreated(uint256 indexed guildId, string name, address indexed founder)
event MemberAdded(uint256 indexed guildId, address indexed member, MemberRole role)
event DepositMade(uint256 indexed guildId, address indexed depositor, uint256 amount)
event ProposalCreated(uint256 indexed proposalId, uint256 indexed guildId, ProposalType proposalType, address indexed proposer)
event WithdrawalExecuted(uint256 indexed guildId, address indexed recipient, uint256 amount)
```

## 🛠️ Development

### Project Structure
```
contracts/
├── src/
│   ├── NFTMarketplace.sol
│   ├── PrizeEscrow.sol
│   └── GuildTreasury.sol
├── scripts/
│   └── deploy.js
├── hardhat.config.js
└── package.json
```

### Adding New Contracts

1. Create `.sol` file in `src/`
2. Add deployment script in `scripts/`
3. Update `hardhat.config.js`
4. Compile and deploy

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📞 Support

For issues or questions:
- GitHub Issues: [hedera-verse/issues](https://github.com/your-org/hedera-verse/issues)
- Discord: [RealmOS Community](https://discord.gg/realmos)

---

**Built for Hedera Hashgraph** 🌐  
*Powering the future of blockchain gaming*
