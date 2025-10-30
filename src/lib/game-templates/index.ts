import { GameSpec } from '../../types/game-spec';
import { generateShooterGame } from './shooter-template';
import { generatePlatformerGame } from './platformer-template';
import { generatePuzzleGame } from './puzzle-template';
import { generateRacingGame } from './racing-template';
import { generateIdleGame } from './idle-template';
import { generateCardGame } from './card-template';
import { generateArcadeGame } from './arcade-template';
import { generateStrategyGame } from './strategy-template';
import { generateBoardGame } from './board-game-template';

/**
 * Game Template Generator
 * Routes to appropriate template based on genre
 */

export function generateGameCode(spec: GameSpec): string {
  console.log('\n🎯 [Template Router] Analyzing GameSpec for template selection');
  
  // Check description for board game keywords
  const description = spec.description?.toLowerCase() || '';
  const title = spec.title?.toLowerCase() || '';
  const isBoardGame = 
    description.includes('snake') && description.includes('ladder') ||
    description.includes('snakes and ladders') ||
    title.includes('snake') && title.includes('ladder') ||
    description.includes('board game') ||
    description.includes('dice') && description.includes('board');

  // If it's a board game, use board game template regardless of genre
  if (isBoardGame) {
    console.log('   ✅ Board game keywords detected!');
    console.log('   📋 Selected Template: Board Game (Snake & Ladders)');
    console.log('   🎲 Reason: Keyword match in description/title');
    return generateBoardGame(spec);
  }

  console.log('   📊 Genre from AI:', spec.genre);

  switch (spec.genre) {
    case 'shooter':
      console.log('   📋 Selected Template: Shooter');
      return generateShooterGame(spec);
    
    case 'platformer':
      console.log('   📋 Selected Template: Platformer');
      return generatePlatformerGame(spec);
    
    case 'puzzle':
      console.log('   📋 Selected Template: Puzzle (Match-3)');
      return generatePuzzleGame(spec);
    
    case 'racing':
      console.log('   📋 Selected Template: Racing');
      return generateRacingGame(spec);
    
    case 'strategy':
      // Check if it's actually a board game misclassified as strategy
      if (description.includes('reach') && description.includes('square')) {
        console.log('   ⚠️  Strategy reclassified as Board Game');
        console.log('   📋 Selected Template: Board Game');
        return generateBoardGame(spec);
      }
      console.log('   📋 Selected Template: Strategy (Tower Defense)');
      return generateStrategyGame(spec);
    
    case 'idle':
      console.log('   📋 Selected Template: Idle/Clicker');
      return generateIdleGame(spec);
    
    case 'card':
      console.log('   📋 Selected Template: Card (Memory Match)');
      return generateCardGame(spec);
    
    case 'arcade':
      console.log('   📋 Selected Template: Arcade (Breakout)');
      return generateArcadeGame(spec);
    
    default:
      console.error('   ❌ Unsupported genre:', spec.genre);
      throw new Error(`Unsupported game genre: ${spec.genre}`);
  }
}
