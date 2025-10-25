import { GameSpec } from '@/types/game-spec';
import { generateShooterGame } from './shooter-template';
import { generatePlatformerGame } from './platformer-template';
import { generatePuzzleGame } from './puzzle-template';
import { generateRacingGame } from './racing-template';
import { generateIdleGame } from './idle-template';
import { generateCardGame } from './card-template';
import { generateArcadeGame } from './arcade-template';
import { generateStrategyGame } from './strategy-template';

/**
 * Game Template Generator
 * Routes to appropriate template based on genre
 */

export function generateGameCode(spec: GameSpec): string {
  switch (spec.genre) {
    case 'shooter':
      return generateShooterGame(spec);
    
    case 'platformer':
      return generatePlatformerGame(spec);
    
    case 'puzzle':
      return generatePuzzleGame(spec);
    
    case 'racing':
      return generateRacingGame(spec);
    
    case 'strategy':
      return generateStrategyGame(spec);
    
    case 'idle':
      return generateIdleGame(spec);
    
    case 'card':
      return generateCardGame(spec);
    
    case 'arcade':
      return generateArcadeGame(spec);
    
    default:
      throw new Error(`Unsupported game genre: ${spec.genre}`);
  }
}
