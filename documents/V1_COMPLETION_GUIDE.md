# HederaVerse v1 - Frontend Completion Guide

## ✅ What I've Built For You

### 1. **Wallet Balance Component** ✅
**File**: `/src/components/wallet-balance.tsx`

**Features**:
- Displays REALM token balance
- Auto-refreshes when wallet connects
- Manual refresh button
- Loading and error states
- Beautiful gradient design

**Usage**:
```tsx
import { WalletBalance } from '@/components/wallet-balance';

<WalletBalance showRefresh={true} />
```

---

### 2. **Game Score Submission Hook** ✅
**File**: `/src/hooks/use-game-score.ts`

**Features**:
- Handles score submission to API
- Creates user if doesn't exist
- Shows success/error notifications
- Displays reward amounts
- HCS confirmation messages

**Usage**:
```tsx
import { useGameScore } from '@/hooks/use-game-score';

const { submitScore, submitting } = useGameScore();

// When game ends:
await submitScore({
  gameId: 'tetris',
  score: 1500,
  metadata: { level: 5, lines: 20 }
});
```

---

### 3. **Game Wrapper Component** ✅
**File**: `/src/components/game-wrapper.tsx`

**Features**:
- Wraps any game component
- Shows wallet connection prompt
- Displays wallet balance
- Handles score submission
- Provides `onGameEnd` callback

**Usage**:
```tsx
import { GameWrapper } from '@/components/game-wrapper';

export default function TetrisPage() {
  return (
    <GameWrapper gameId="tetris" gameName="Tetris">
      {({ onGameEnd, submitting }) => (
        <TetrisGame onGameEnd={onGameEnd} submitting={submitting} />
      )}
    </GameWrapper>
  );
}
```

---

### 4. **Marketplace UI** ✅
**File**: `/src/app/marketplace/page.tsx`

**Features**:
- Browse NFT listings
- Filter by category (Profile, Game Assets, Achievements)
- Sort by price, rarity, recent
- Search functionality
- Beautiful NFT cards with rarity badges
- Buy button (ready for integration)

**Categories**:
- Profile NFTs
- Game Assets
- Achievements
- Tournament Prizes

---

### 5. **Updated Navbar** ✅
**File**: `/src/components/layout/Navbar.tsx`

**Changes**:
- Added `WalletBalance` component
- Shows balance next to wallet button
- Responsive design maintained

---

### 6. **Leaderboard Page** ✅
**File**: `/src/app/leaderboard/page.tsx`

**Features** (Already existed, verified working):
- All-time and weekly leaderboards
- Game statistics
- Player rankings
- Win rates and earnings
- Beautiful UI with animations

---

## 🎯 How to Integrate Games (Step-by-Step)

### Method 1: Using GameWrapper (Recommended)

**Step 1**: Wrap your game page with GameWrapper

```tsx
// src/app/games/tetris/page.tsx
import { GameWrapper } from '@/components/game-wrapper';
import TetrisGame from '@/components/tetris-game';

export default function TetrisPage() {
  return (
    <GameWrapper gameId="tetris" gameName="Tetris">
      {({ onGameEnd, submitting }) => (
        <TetrisGame 
          onGameEnd={onGameEnd} 
          submitting={submitting} 
        />
      )}
    </GameWrapper>
  );
}
```

**Step 2**: Update your game component to accept props

```tsx
// src/components/tetris-game/index.tsx
interface TetrisGameProps {
  onGameEnd?: (score: number, metadata?: any) => Promise<void>;
  submitting?: boolean;
}

const TetrisGame = ({ onGameEnd, submitting }: TetrisGameProps) => {
  // ... existing code ...
  
  const handleGameOver = async () => {
    setIsGameOver(true);
    
    // Submit score if callback provided
    if (onGameEnd) {
      await onGameEnd(score, {
        level,
        lines,
        duration: Date.now() - gameStartTime.current
      });
    }
  };
  
  // ... rest of code ...
}
```

---

### Method 2: Direct Hook Usage

```tsx
// Inside your game component
import { useGameScore } from '@/hooks/use-game-score';

const YourGame = () => {
  const { submitScore, submitting } = useGameScore();
  
  const handleGameOver = async () => {
    await submitScore({
      gameId: 'your-game-id',
      score: finalScore,
      metadata: { /* optional data */ }
    });
  };
  
  return (
    // Your game JSX
  );
}
```

---

## 📝 Integration Checklist for Each Game

### Chess ✅ (Exists)
**File**: `/src/app/games/chess/page.tsx`
- [ ] Wrap with GameWrapper
- [ ] Add onGameEnd to ChessGameApp
- [ ] Call onGameEnd when game ends
- [ ] Pass game metadata (moves, time, result)

### Sudoku ✅ (Exists)
**File**: `/src/app/games/sudoku/page.tsx`
- [ ] Wrap with GameWrapper
- [ ] Add onGameEnd to SudokuGame
- [ ] Call onGameEnd when puzzle solved
- [ ] Pass metadata (difficulty, time, hints used)

### Tetris ✅ (Exists)
**File**: `/src/app/games/tetris/page.tsx`
- [ ] Wrap with GameWrapper
- [ ] Add onGameEnd to TetrisGame
- [ ] Call onGameEnd when game over
- [ ] Pass metadata (level, lines, duration)

### Wordle ✅ (Exists)
**File**: `/src/app/games/wordle/page.tsx`
- [ ] Wrap with GameWrapper
- [ ] Add onGameEnd to WordleGame
- [ ] Call onGameEnd when word guessed/failed
- [ ] Pass metadata (attempts, time, word)

### Crypto Crossword ✅ (Exists)
**File**: `/src/app/games/crypto-crossword/page.tsx`
- [ ] Wrap with GameWrapper
- [ ] Add onGameEnd to CrosswordGame
- [ ] Call onGameEnd when completed
- [ ] Pass metadata (time, hints, difficulty)

### Snake & Ladder ✅ (Exists)
**File**: `/src/app/games/snake-ladder/page.tsx`
- [ ] Wrap with GameWrapper
- [ ] Add onGameEnd to SnakeLadderGame
- [ ] Call onGameEnd when game ends
- [ ] Pass metadata (turns, final position)

---

## 🎨 Example: Complete Tetris Integration

### Step 1: Update Tetris Page

```tsx
// src/app/games/tetris/page.tsx
import { GameWrapper } from '@/components/game-wrapper';
import TetrisGame from '@/components/tetris-game';

export default function TetrisPage() {
  return (
    <GameWrapper gameId="tetris" gameName="Tetris">
      {({ onGameEnd, submitting }) => (
        <TetrisGame 
          onGameEnd={onGameEnd} 
          submitting={submitting} 
        />
      )}
    </GameWrapper>
  );
}
```

### Step 2: Update Tetris Component

```tsx
// src/components/tetris-game/index.tsx

// Add to props interface
interface TetrisGameProps {
  onGameEnd?: (score: number, metadata?: any) => Promise<void>;
  submitting?: boolean;
}

// Update component signature
const TetrisGame = ({ onGameEnd, submitting }: TetrisGameProps = {}) => {
  // ... existing state ...
  
  // Update handleGameOver function
  const handleGameOver = useCallback(async () => {
    setIsGameOver(true);
    
    // Stop game interval
    if (gameInterval.current) {
      clearInterval(gameInterval.current);
      gameInterval.current = null;
    }
    
    // Submit score if callback provided
    if (onGameEnd && !submitting) {
      try {
        await onGameEnd(score, {
          level,
          lines,
          duration: Math.floor((Date.now() - gameStartTime.current) / 1000),
          highScore: score > highScore
        });
      } catch (error) {
        console.error('Failed to submit score:', error);
      }
    }
    
    // Update stats
    setGameStats(prev => ({
      gamesPlayed: prev.gamesPlayed + 1,
      totalScore: prev.totalScore + score,
      totalLines: prev.totalLines + lines,
      bestLevel: Math.max(prev.bestLevel, level),
    }));
  }, [score, level, lines, highScore, onGameEnd, submitting]);
  
  // ... rest of component ...
}
```

---

## 🚀 Quick Start (5 Minutes)

### 1. Test Wallet Balance

```bash
# Start dev server
bun run dev

# Navigate to any page
# Connect wallet
# Balance should appear in navbar
```

### 2. Test Score Submission

```tsx
// Add to any game's game-over handler:
if (onGameEnd) {
  await onGameEnd(finalScore, { /* metadata */ });
}

// You should see:
// ✅ "Score submitted!" toast
// ✅ "New High Score!" toast (if applicable)
// ✅ "You earned X REALM tokens!" toast
// ✅ "Score recorded on HCS" toast
```

### 3. Test Marketplace

```bash
# Navigate to /marketplace
# Should see NFT listings
# Can filter and search
# Buy button shows (needs wallet)
```

### 4. Test Leaderboard

```bash
# Navigate to /leaderboard
# Should see rankings
# Can switch between all-time and weekly
# Shows game statistics
```

---

## 🎯 Remaining Tasks

### High Priority (2-3 hours)

1. **Integrate All 7 Games** (1.5 hours)
   - Add GameWrapper to each game page
   - Add onGameEnd prop to each game component
   - Call onGameEnd when game ends
   - Test each game

2. **Create Tournament Page** (1 hour)
   - Basic tournament listing
   - Tournament details
   - Registration button
   - Prize pool display

3. **Polish UI** (0.5 hours)
   - Add loading states
   - Improve error handling
   - Add animations
   - Mobile responsiveness

### Medium Priority (2-3 hours)

4. **Marketplace Buy Flow** (1.5 hours)
   - Implement purchase modal
   - Hedera transaction
   - Success/error handling
   - Update NFT ownership

5. **Profile Page Enhancements** (1 hour)
   - Show NFT collection
   - Display game statistics
   - Transaction history
   - Achievement badges

6. **Real Leaderboard Data** (0.5 hours)
   - Fetch from HCS
   - Real-time updates
   - Per-game leaderboards

---

## 📊 Testing Checklist

### Wallet Integration
- [ ] Connect wallet shows balance
- [ ] Balance updates after rewards
- [ ] Disconnect works properly
- [ ] Reconnect restores state

### Game Integration
- [ ] Score submission works
- [ ] Rewards are distributed
- [ ] HCS messages submitted
- [ ] High scores detected
- [ ] Notifications appear

### Marketplace
- [ ] Listings load
- [ ] Filters work
- [ ] Search works
- [ ] NFT cards display
- [ ] Categories filter

### Leaderboard
- [ ] Rankings display
- [ ] Tabs switch
- [ ] Stats show
- [ ] Responsive design

---

## 🐛 Common Issues & Solutions

### Issue: "Please connect your wallet first"
**Solution**: Make sure wallet is connected before playing

### Issue: Balance not updating
**Solution**: Click refresh button or reconnect wallet

### Issue: Score not submitting
**Solution**: Check console for errors, ensure API is running

### Issue: No rewards received
**Solution**: Check if it's a new high score (only high scores get rewards)

---

## 🎉 What You Get

### User Experience
1. **Connect Wallet** → See balance in navbar
2. **Play Game** → Automatic score submission
3. **Get Reward** → Toast notification with amount
4. **View Leaderboard** → See your rank
5. **Browse Marketplace** → Trade NFTs
6. **Check Profile** → View stats and NFTs

### Developer Experience
- Clean, reusable components
- Type-safe hooks
- Error handling built-in
- Toast notifications
- Loading states
- Responsive design

---

## 📚 API Reference

### useGameScore Hook

```typescript
const { submitScore, submitting, lastResult } = useGameScore();

// Submit score
await submitScore({
  gameId: string,      // 'chess', 'tetris', etc.
  score: number,       // Final score
  metadata?: any       // Optional game data
});

// Returns:
{
  success: boolean,
  data?: {
    scoreId: string,
    score: number,
    isHighScore: boolean,
    hcsTxId?: string,
    reward?: {
      amount: number,
      txId: string
    }
  },
  error?: string
}
```

### GameWrapper Component

```typescript
<GameWrapper 
  gameId="your-game-id"
  gameName="Your Game Name"
>
  {({ onGameEnd, submitting }) => (
    <YourGame 
      onGameEnd={onGameEnd}
      submitting={submitting}
    />
  )}
</GameWrapper>
```

---

## 🎯 Next Steps

1. **Integrate one game** (Tetris recommended) - 15 min
2. **Test end-to-end** - 10 min
3. **Replicate for other 6 games** - 1 hour
4. **Build tournament page** - 1 hour
5. **Polish and test** - 1 hour

**Total Time**: ~3-4 hours to complete v1 frontend

---

## 🏆 Success Metrics

After completion, you should have:
- ✅ All 7 games integrated with rewards
- ✅ Wallet balance visible everywhere
- ✅ Marketplace browsing functional
- ✅ Leaderboard displaying data
- ✅ Tournament page created
- ✅ Professional UI/UX
- ✅ Mobile responsive
- ✅ Ready for demo

---

## 💡 Pro Tips

1. **Start with one game** - Get it perfect, then replicate
2. **Test with real wallet** - Use Hedera testnet
3. **Check console logs** - Helpful for debugging
4. **Use toast notifications** - Great user feedback
5. **Keep metadata simple** - Just essential game data

---

## 🎬 Demo Script

When showing your project:

1. **Connect Wallet** - Show balance appearing
2. **Play Tetris** - Get a decent score
3. **Game Over** - Show reward notification
4. **Check Balance** - Show it increased
5. **View Leaderboard** - Show your score
6. **Browse Marketplace** - Show NFTs
7. **Explain HCS** - Immutable leaderboards
8. **Highlight AI Agents** - Unique feature

---

**You're 90% done! Just need to integrate the games and polish. Let's ship this! 🚀**
