# Final Integration Steps - HederaVerse v1

## ✅ COMPLETED
1. **Tournaments Page** - Redesigned with proper theme (#98ee2c green on black)
2. **Registration Modal** - Fully functional with confirmation
3. **Wallet Balance Component** - Created
4. **Game Score Hook** - Created
5. **Game Wrapper** - Created

## 🎯 REMAINING TASKS (2-3 Hours)

### 1. Update Marketplace Theme (30 min)

**File**: `/src/app/marketplace/page.tsx`

**Changes Needed**:
```tsx
// Replace light theme with dark theme
<div className="min-h-screen bg-black pt-24 pb-20">
  
// Update header
<h1 className="text-5xl font-bold">
  <span className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] bg-clip-text text-transparent">
    NFT Marketplace
  </span>
</h1>

// Update cards
<Card className="bg-white/5 backdrop-blur-sm border-white/10">

// Update buttons
<Button className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold">

// Update badges
<Badge className="bg-[#98ee2c]">
```

### 2. Add Marketplace Buy Modal (30 min)

**Add to marketplace page**:
```tsx
const [selectedNFT, setSelectedNFT] = useState<NFTListing | null>(null);
const [showBuyModal, setShowBuyModal] = useState(false);
const [buying, setBuying] = useState(false);

const handleBuy = (listing: NFTListing) => {
  if (!userAccountId) {
    toast.error('Please connect your wallet');
    return;
  }
  setSelectedNFT(listing);
  setShowBuyModal(true);
};

const confirmPurchase = async () => {
  if (!selectedNFT) return;
  
  setBuying(true);
  try {
    // Call API to purchase NFT
    const response = await fetch('/api/marketplace/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId: selectedNFT.id,
        buyerAccountId: userAccountId,
      }),
    });
    
    if (!response.ok) throw new Error('Purchase failed');
    
    toast.success('NFT purchased successfully!');
    setShowBuyModal(false);
    fetchListings(); // Refresh
  } catch (error) {
    toast.error('Purchase failed. Please try again.');
  } finally {
    setBuying(false);
  }
};

// Add Dialog component at end
<Dialog open={showBuyModal} onOpenChange={setShowBuyModal}>
  <DialogContent className="bg-[#1a1a1a] border-gray-800">
    <DialogHeader>
      <DialogTitle className="text-white">Purchase NFT</DialogTitle>
    </DialogHeader>
    {selectedNFT && (
      <div className="space-y-4">
        <img src={selectedNFT.nft.metadata?.image} className="w-full rounded-lg" />
        <div className="flex justify-between">
          <span className="text-gray-400">Price</span>
          <span className="text-[#98ee2c] font-bold">
            {selectedNFT.price} {selectedNFT.currency}
          </span>
        </div>
      </div>
    )}
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowBuyModal(false)}>
        Cancel
      </Button>
      <Button
        onClick={confirmPurchase}
        disabled={buying}
        className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black"
      >
        {buying ? 'Processing...' : 'Confirm Purchase'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 3. Integrate All 7 Games (35 min - 5 min each)

For EACH game, follow this pattern:

#### **Chess** (`/src/app/games/chess/page.tsx`)
```tsx
import { GameWrapper } from '@/components/game-wrapper';
import ChessGameApp from '@/components/chess-game';

export default function ChessPage() {
  return (
    <GameWrapper gameId="chess" gameName="Chess">
      {({ onGameEnd, submitting }) => (
        <ChessGameApp onGameEnd={onGameEnd} submitting={submitting} />
      )}
    </GameWrapper>
  );
}
```

Then in `/src/components/chess-game/index.tsx`:
```tsx
// Add to props
interface ChessGameAppProps {
  onGameEnd?: (score: number, metadata?: any) => Promise<void>;
  submitting?: boolean;
}

const ChessGameApp = ({ onGameEnd, submitting }: ChessGameAppProps = {}) => {
  // Find the game over handler and add:
  const handleGameOver = async () => {
    setGameOver(true);
    
    if (onGameEnd && !submitting) {
      await onGameEnd(score, {
        moves: moveHistory.length,
        duration: Math.floor((Date.now() - gameStartTime) / 1000),
        result: gameStatus.winner,
      });
    }
  };
}
```

#### **Repeat for**:
- Sudoku (`/src/app/games/sudoku/page.tsx`)
- Tetris (`/src/app/games/tetris/page.tsx`)
- Wordle (`/src/app/games/wordle/page.tsx`)
- Crypto Crossword (`/src/app/games/crypto-crossword/page.tsx`)
- Snake & Ladder (`/src/app/games/snake-ladder/page.tsx`)
- Candy Saga (if exists)

### 4. Create Marketplace Buy API (20 min)

**File**: `/src/app/api/marketplace/buy/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { HederaMarketplace } from '@/lib/hedera/marketplace';

export async function POST(request: NextRequest) {
  try {
    const { listingId, buyerAccountId } = await request.json();
    
    // Get listing
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id: listingId },
      include: { nft: true, seller: true },
    });
    
    if (!listing || listing.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    
    // Execute atomic swap on Hedera
    const marketplace = new HederaMarketplace();
    const txId = await marketplace.executeAtomicSwap({
      nftTokenId: listing.nft.tokenId,
      nftSerial: listing.nft.serialNumber,
      sellerAccountId: listing.seller.hederaAccountId!,
      buyerAccountId,
      price: listing.price,
      currency: listing.currency,
    });
    
    // Update database
    await prisma.marketplacePurchase.create({
      data: {
        listingId,
        buyerId: buyerAccountId, // Should be user ID
        price: listing.price,
        txHash: txId,
        status: 'COMPLETED',
      },
    });
    
    await prisma.marketplaceListing.update({
      where: { id: listingId },
      data: { status: 'SOLD' },
    });
    
    await prisma.nFT.update({
      where: { id: listing.nft.id },
      data: { owner: buyerAccountId },
    });
    
    return NextResponse.json({ success: true, txId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### 5. Test Everything (30 min)

**Checklist**:
- [ ] Connect wallet
- [ ] Play each game
- [ ] Submit score
- [ ] See reward notification
- [ ] Check balance updated
- [ ] View leaderboard
- [ ] Browse marketplace
- [ ] View tournaments
- [ ] Register for tournament
- [ ] Test on mobile

### 6. Polish UI (20 min)

**Quick Wins**:
- Add loading spinners
- Improve error messages
- Add hover effects
- Check mobile responsiveness
- Add smooth transitions

## 📝 Quick Copy-Paste Templates

### Game Page Template
```tsx
import { GameWrapper } from '@/components/game-wrapper';
import YourGame from '@/components/your-game';

export default function YourGamePage() {
  return (
    <GameWrapper gameId="your-game-id" gameName="Your Game Name">
      {({ onGameEnd, submitting }) => (
        <YourGame onGameEnd={onGameEnd} submitting={submitting} />
      )}
    </GameWrapper>
  );
}
```

### Game Component Update
```tsx
interface YourGameProps {
  onGameEnd?: (score: number, metadata?: any) => Promise<void>;
  submitting?: boolean;
}

const YourGame = ({ onGameEnd, submitting }: YourGameProps = {}) => {
  const handleGameOver = async () => {
    if (onGameEnd && !submitting) {
      await onGameEnd(finalScore, { /* metadata */ });
    }
  };
}
```

## 🎯 Priority Order

1. **Integrate 1 game (Tetris)** - 10 min - Test the flow
2. **Integrate other 6 games** - 30 min - Replicate pattern
3. **Update marketplace theme** - 20 min - Match design
4. **Add marketplace buy modal** - 20 min - Functional purchase
5. **Test everything** - 20 min - Verify all works
6. **Polish** - 20 min - Final touches

**Total**: ~2 hours

## ✅ What You'll Have

After completing these steps:
- ✅ All 7 games integrated with rewards
- ✅ Marketplace with buy functionality
- ✅ Tournaments with registration
- ✅ Consistent dark theme with #98ee2c green
- ✅ Wallet balance everywhere
- ✅ Score submission working
- ✅ Leaderboard updating
- ✅ Professional UI/UX
- ✅ Mobile responsive
- ✅ Ready for demo!

## 🚀 You're Almost There!

Just 2 hours of focused work and v1 is complete! 💪
