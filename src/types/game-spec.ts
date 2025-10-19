/**
 * GameSpec - Structured JSON schema for AI-generated games
 */

export type GameGenre = 
  | 'platformer'
  | 'puzzle'
  | 'arcade'
  | 'shooter'
  | 'racing'
  | 'strategy'
  | 'idle'
  | 'card';

export interface GameSpec {
  title: string;
  genre: GameGenre;
  description: string;
  mechanics: {
    movement?: 'keyboard' | 'mouse' | 'touch' | 'auto';
    objective: string;
    scoring: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  entities: {
    player?: {
      type: string;
      controls: string[];
      abilities: string[];
    };
    enemies?: Array<{
      type: string;
      behavior: string;
      count: number;
    }>;
    collectibles?: Array<{
      type: string;
      effect: string;
      points: number;
    }>;
    obstacles?: Array<{
      type: string;
      behavior: string;
    }>;
  };
  visuals: {
    theme: string;
    colorScheme: 'monochrome' | 'retro' | 'neon' | 'pastel';
    style: 'pixel' | 'minimal' | 'geometric';
  };
  audio?: {
    music: boolean;
    sfx: boolean;
  };
  config: {
    width: number;
    height: number;
    fps: number;
    duration?: number; // in seconds, if time-limited
  };
}

export interface GameGenerationRequest {
  prompt: string;
  userId?: string;
}

export interface GameGenerationResponse {
  success: boolean;
  gameSpec?: GameSpec;
  gameCode?: string;
  error?: string;
}
