import { GameSpec } from '@/types/game-spec';
import { generateShooterGame } from './shooter-template';
import { generatePlatformerGame } from './platformer-template';

/**
 * Game Template Generator
 * Routes to appropriate template based on genre
 */

export function generateGameCode(spec: GameSpec): string {
  switch (spec.genre) {
    case 'shooter':
    case 'arcade':
      return generateShooterGame(spec);
    
    case 'platformer':
      return generatePlatformerGame(spec);
    
    case 'puzzle':
    case 'racing':
    case 'strategy':
    case 'idle':
    case 'card':
      // For now, default to shooter template for unsupported genres
      // TODO: Implement additional templates
      return generateShooterGame(spec);
    
    default:
      throw new Error(`Unsupported game genre: ${spec.genre}`);
  }
}
