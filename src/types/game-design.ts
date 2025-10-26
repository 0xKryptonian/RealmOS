/**
 * Enhanced Game Design Schema for AI-Powered Generation
 * This extends GameSpec with detailed design specifications
 */

export interface GameDesign {
  // High-level categorization
  category: 'Action Games' | 'Strategy Games' | 'Puzzle Games' | 'Board & Card Games' | 'Casual Games' | 'Simulation Games';
  subcategory: string;
  variant?: string;
  
  // Basic info
  title: string;
  description: string;
  theme: string;
  
  // Core gameplay
  gameDesign: {
    core_mechanic: string;
    player_abilities: string[];
    
    // Entities
    player?: {
      type: string;
      health?: number;
      speed?: number;
      abilities: string[];
      controls: string[];
    };
    
    enemy_types?: Array<{
      name: string;
      behavior: string;
      health: number;
      speed?: number;
      damage?: number;
      points: number;
      spawn_rate?: number;
    }>;
    
    power_ups?: Array<{
      type: string;
      duration?: number;
      effect: string;
      rarity?: 'common' | 'rare' | 'epic';
    }>;
    
    obstacles?: Array<{
      type: string;
      behavior: string;
      damage?: number;
    }>;
    
    collectibles?: Array<{
      type: string;
      points: number;
      effect?: string;
    }>;
    
    // Progression
    progression: {
      difficulty_curve: 'linear' | 'exponential' | 'stepped' | 'adaptive';
      wave_system?: boolean;
      level_system?: boolean;
      boss_fights?: boolean;
      time_limit?: number;
    };
    
    // Win/Lose conditions
    win_condition: string;
    lose_condition: string;
  };
  
  // Visual specifications
  visuals: {
    style: 'pixel' | 'minimal' | 'geometric' | 'cartoon';
    colorScheme: 'monochrome' | 'retro' | 'neon' | 'pastel' | 'dark' | 'vibrant';
    theme: string;
    
    // Asset specifications
    assets: {
      player_icon?: string; // Iconify icon name
      enemy_icons?: string[];
      collectible_icons?: string[];
      background_style?: string;
    };
  };
  
  // Audio
  audio?: {
    music: boolean;
    sfx: boolean;
    ambient?: boolean;
  };
  
  // Technical config
  config: {
    width: number;
    height: number;
    fps: number;
    physics?: 'arcade' | 'matter' | 'none';
  };
}

export interface GameGenerationRequestV2 {
  prompt: string;
  userId?: string;
  mode?: 'template' | 'ai-enhanced' | 'full-ai';
}

export interface GameGenerationResponseV2 {
  success: boolean;
  gameDesign?: GameDesign;
  gameCode?: string;
  generationMode?: 'template' | 'ai-enhanced' | 'full-ai';
  metadata?: {
    generationTime: number;
    codeSize: number;
    templateUsed?: string;
    aiEnhancements?: string[];
  };
  error?: string;
}
