import { GameDesign } from '@/types/game-design';
import { GameSpec, GameGenre } from '@/types/game-spec';
import { generateGameCode } from './game-templates';

/**
 * V2 to V1 Bridge
 * 
 * Converts V2's GameDesign format to V1's GameSpec format
 * so we can use V1's proven templates for board games, puzzles, etc.
 */

/**
 * Convert V2 GameDesign to V1 GameSpec
 */
// Helper functions to map V2 enums to V1 enums
const mapDifficulty = (difficultyCurve: string): 'easy' | 'medium' | 'hard' => {
  switch (difficultyCurve) {
    case 'linear':
      return 'medium';
    case 'exponential':
      return 'hard';
    case 'stepped':
      return 'medium';
    case 'adaptive':
      return 'hard';
    default:
      return 'medium';
  }
};

const mapColorScheme = (scheme: string): 'monochrome' | 'retro' | 'neon' | 'pastel' => {
  if (scheme === 'monochrome' || scheme === 'retro' || scheme === 'neon' || scheme === 'pastel') {
    return scheme;
  }
  return 'retro'; // Default value
};

const mapStyle = (style: string): 'pixel' | 'minimal' | 'geometric' => {
  if (style === 'pixel' || style === 'minimal' || style === 'geometric') {
    return style;
  }
  return 'pixel'; // Default value
};

export function convertGameDesignToGameSpec(design: GameDesign): GameSpec {
  // Extract genre from subcategory
  let genre: GameGenre = 'arcade';
  const sub = design.subcategory.toLowerCase();

  if (sub.includes('shooter') || sub.includes('space')) {
    genre = 'shooter';
  } else if (sub.includes('platform')) {
    genre = 'platformer';
  } else if (sub.includes('puzzle') || sub.includes('match')) {
    genre = 'puzzle';
  } else if (sub.includes('racing') || sub.includes('car')) {
    genre = 'racing';
  } else if (sub.includes('strategy') || sub.includes('tower')) {
    genre = 'strategy';
  } else if (sub.includes('idle') || sub.includes('clicker')) {
    genre = 'idle';
  } else if (sub.includes('card') || sub.includes('memory')) {
    genre = 'card';
  } else if (sub.includes('board') || sub.includes('classic')) {
    genre = 'arcade';
  }

  const gameSpec: GameSpec = {
    title: design.title,
    genre: genre,
    description: design.description,
    mechanics: {
      movement: 'keyboard',
      objective: design.gameDesign.win_condition || 'Win the game',
      scoring: 'points',
      difficulty: mapDifficulty(design.gameDesign.progression?.difficulty_curve || 'medium'),
    },
    entities: {
      player: {
        type: 'player',
        controls: design.gameDesign.player?.controls || ['move'],
        abilities: design.gameDesign.player?.abilities || [],
      },
      enemies: (design.gameDesign.enemy_types || []).map(e => ({
        type: e.name,
        behavior: e.behavior,
        count: e.spawn_rate ? Math.round(e.spawn_rate * 10) : 10, // Approximate count
      })),
      collectibles: (design.gameDesign.power_ups || []).map(p => ({
        type: p.type,
        effect: p.effect,
        points: 10, // V1 requires points, V2 does not have it.
      })),
      obstacles: design.gameDesign.obstacles || [],
    },
    visuals: {
      theme: design.visuals.theme || 'default',
      colorScheme: mapColorScheme(design.visuals.colorScheme || 'retro'),
      style: mapStyle(design.visuals.style || 'pixel'),
    },
    config: {
      width: design.config?.width || 800,
      height: design.config?.height || 600,
      fps: design.config?.fps || 60,
    },
  };

  return gameSpec;
}

/**
 * Generate game using V1 template system
 * This uses the proven template router that handles board games, puzzles, etc.
 */
export function generateGameUsingV1Templates(design: GameDesign): string {
  console.log('\n🌉 [V2→V1 Bridge] Converting GameDesign to GameSpec');
  console.log('   Title:', design.title);
  console.log('   Subcategory:', design.subcategory);
  
  // Convert V2 format to V1 format
  const gameSpec = convertGameDesignToGameSpec(design);
  
  console.log('   Converted Genre:', gameSpec.genre);
  console.log('   Using V1 Template System');
  
  // Use V1's template router
  const gameCode = generateGameCode(gameSpec);
  
  console.log('✅ [V2→V1 Bridge] Game generated using V1 template');
  
  return gameCode;
}

/**
 * Check if a game should use V1 templates instead of V2 dynamic generator
 * 
 * CRITICAL: Only route games that V1 actually has templates for!
 * V1 has: Snake & Ladder, Match-3, Memory Card, Racing, etc.
 * V1 does NOT have: Ludo, Chess, Poker, etc. (these should use preview mode)
 */
export function shouldUseV1Templates(design: GameDesign): boolean {
  const title = design.title.toLowerCase();
  const subcategory = design.subcategory.toLowerCase();
  const description = design.description.toLowerCase();
  const searchText = `${title} ${subcategory} ${description}`;
  
  // SNAKE & LADDER ONLY - V1 has this specific template
  const isSnakeLadder = 
    (searchText.includes('snake') && searchText.includes('ladder')) ||
    searchText.includes('snakes and ladders') ||
    searchText.includes('chutes and ladders');
  
  if (isSnakeLadder) {
    console.log('   🎲 Snake & Ladder detected - will use V1 template');
    return true;
  }
  
  // IMPORTANT: Do NOT route Ludo, Chess, Checkers, etc. to V1
  // These should go to preview mode instead
  const unsupportedBoardGames = ['ludo', 'chess', 'checkers', 'monopoly', 'scrabble'];
  const isUnsupportedBoardGame = unsupportedBoardGames.some(game => searchText.includes(game));
  
  if (isUnsupportedBoardGame) {
    console.log('   ⚠️  Complex board game - will NOT use V1 (no template available)');
    return false;
  }
  
  // Puzzle games - V1 has good templates for Match-3, etc.
  const puzzleKeywords = ['match-3', 'match 3', 'candy', 'gem', 'puzzle'];
  const isPuzzleGame = puzzleKeywords.some(keyword => searchText.includes(keyword));
  
  if (isPuzzleGame) {
    console.log('   🧩 Puzzle game detected - will use V1 templates');
    return true;
  }
  
  // Card games - V1 has memory card template
  const cardKeywords = ['memory card', 'flip card', 'card match'];
  const isCardGame = cardKeywords.some(keyword => searchText.includes(keyword));
  
  if (isCardGame) {
    console.log('   🃏 Card game detected - will use V1 templates');
    return true;
  }
  
  // Default: use V2 classifier (dynamic or preview)
  console.log('   🎮 Will use V2 classifier (dynamic or preview)');
  return false;
}
