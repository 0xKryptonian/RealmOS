import { GameDesign } from '@/types/game-design';

/**
 * Game Classifier Agent
 * 
 * Intelligently classifies games and determines the best generation strategy:
 * 1. Use existing template if available
 * 2. Use dynamic generator for action games
 * 3. Fall back to preview mode for complex games without templates
 */

export interface GameClassification {
  category: 'action' | 'board' | 'card' | 'puzzle' | 'strategy' | 'idle' | 'racing' | 'arcade';
  subcategory: string;
  complexity: 'low' | 'medium' | 'high';
  hasTemplate: boolean;
  templateName?: string;
  generationMode: 'template' | 'dynamic' | 'preview';
  confidence: number;
  reason: string;
}

/**
 * Template Registry - Games we can fully generate
 */
const TEMPLATE_REGISTRY = {
  // Board games with templates
  'snake-ladder': { template: 'board-game', keywords: ['snake', 'ladder', 'snakes and ladders'] },
  
  // Action games (dynamic generator)
  'shooter': { template: 'dynamic', keywords: ['shoot', 'space', 'alien', 'bullet'] },
  'platformer': { template: 'dynamic', keywords: ['platform', 'jump', 'run', 'mario'] },
  'runner': { template: 'dynamic', keywords: ['endless', 'runner', 'run', 'dodge'] },
  
  // Puzzle games with templates
  'match-3': { template: 'puzzle', keywords: ['match', 'candy', 'gem', 'swap'] },
  'tetris': { template: 'puzzle', keywords: ['tetris', 'block', 'falling'] },
  
  // Card games with templates
  'memory': { template: 'card', keywords: ['memory', 'card', 'match', 'flip'] },
  
  // Strategy games with templates
  'tower-defense': { template: 'strategy', keywords: ['tower', 'defense', 'wave', 'enemy'] },
  
  // Idle games with templates
  'clicker': { template: 'idle', keywords: ['click', 'idle', 'upgrade', 'increment'] },
  
  // Racing games with templates
  'racing': { template: 'racing', keywords: ['race', 'car', 'drive', 'speed'] },
  
  // Arcade games with templates
  'breakout': { template: 'arcade', keywords: ['breakout', 'brick', 'paddle', 'ball'] },
};

/**
 * Complex games that need preview mode (no template yet)
 */
const PREVIEW_MODE_GAMES = {
  // Board games without templates
  'ludo': ['ludo', 'pachisi'],
  'chess': ['chess'],
  'checkers': ['checkers', 'draughts'],
  'monopoly': ['monopoly'],
  'scrabble': ['scrabble'],
  'go': ['go game', 'baduk', 'weiqi'],
  'othello': ['othello', 'reversi'],
  
  // Card games without templates
  'poker': ['poker', 'texas holdem'],
  'blackjack': ['blackjack', '21', 'twenty-one'],
  'solitaire': ['solitaire', 'klondike'],
  'uno': ['uno'],
  
  // Complex puzzles without templates
  'sudoku': ['sudoku'],
  'crossword': ['crossword'],
  'mahjong': ['mahjong'],
  
  // Strategy games without templates
  'rts': ['rts', 'real-time strategy', 'starcraft'],
  'turn-based-strategy': ['turn-based strategy', 'civilization'],
};

/**
 * Main classification function
 */
export function classifyGame(design: GameDesign): GameClassification {
  const title = design.title.toLowerCase();
  const subcategory = design.subcategory.toLowerCase();
  const description = design.description.toLowerCase();
  const searchText = `${title} ${subcategory} ${description}`;
  
  console.log('\n🤖 [Game Classifier Agent] Analyzing game...');
  console.log('   Title:', design.title);
  console.log('   Subcategory:', design.subcategory);
  console.log('   Description:', design.description.substring(0, 100) + '...');
  console.log('   Search Text (first 150 chars):', searchText.substring(0, 150) + '...');
  
  // CRITICAL: Check preview mode FIRST (before templates)
  // This ensures complex games like Ludo don't accidentally match generic keywords
  for (const [gameName, keywords] of Object.entries(PREVIEW_MODE_GAMES)) {
    const hasKeyword = keywords.some(keyword => searchText.includes(keyword));
    
    if (hasKeyword) {
      console.log('   ⚠️  Complex game detected:', gameName);
      console.log('   📋 No template available - using preview mode');
      console.log('   ✅ Matched keyword:', keywords.find(k => searchText.includes(k)));
      
      return {
        category: getCategoryFromGameName(gameName),
        subcategory: gameName,
        complexity: 'high',
        hasTemplate: false,
        generationMode: 'preview',
        confidence: 0.85,
        reason: `Complex game without template: ${gameName}`
      };
    }
  }
  
  // Step 2: Check if we have a template for this game
  for (const [gameName, config] of Object.entries(TEMPLATE_REGISTRY)) {
    const hasKeyword = config.keywords.some(keyword => searchText.includes(keyword));
    
    if (hasKeyword) {
      console.log('   ✅ Template match found:', gameName);
      console.log('   📋 Template:', config.template);
      
      const mode = config.template === 'dynamic' ? 'dynamic' : 'template';
      
      return {
        category: getCategoryFromTemplate(config.template),
        subcategory: gameName,
        complexity: 'medium',
        hasTemplate: true,
        templateName: config.template,
        generationMode: mode,
        confidence: 0.9,
        reason: `Matched template: ${config.template} for ${gameName}`
      };
    }
  }
  
  // Step 3: Default to dynamic generator for unknown action games
  console.log('   🎮 Unknown game type - using dynamic generator');
  
  return {
    category: 'action',
    subcategory: 'custom',
    complexity: 'medium',
    hasTemplate: false,
    generationMode: 'dynamic',
    confidence: 0.7,
    reason: 'Unknown game type - attempting dynamic generation'
  };
}

/**
 * Helper: Get category from template name
 */
function getCategoryFromTemplate(template: string): GameClassification['category'] {
  const mapping: Record<string, GameClassification['category']> = {
    'board-game': 'board',
    'dynamic': 'action',
    'puzzle': 'puzzle',
    'card': 'card',
    'strategy': 'strategy',
    'idle': 'idle',
    'racing': 'racing',
    'arcade': 'arcade'
  };
  
  return mapping[template] || 'action';
}

/**
 * Helper: Get category from game name
 */
function getCategoryFromGameName(gameName: string): GameClassification['category'] {
  if (['ludo', 'chess', 'checkers', 'monopoly', 'scrabble', 'go', 'othello'].includes(gameName)) {
    return 'board';
  }
  if (['poker', 'blackjack', 'solitaire', 'uno'].includes(gameName)) {
    return 'card';
  }
  if (['sudoku', 'crossword', 'mahjong'].includes(gameName)) {
    return 'puzzle';
  }
  if (['rts', 'turn-based-strategy'].includes(gameName)) {
    return 'strategy';
  }
  return 'action';
}

/**
 * Check if a specific template exists
 */
export function hasTemplate(gameName: string): boolean {
  const lowerName = gameName.toLowerCase();
  
  for (const config of Object.values(TEMPLATE_REGISTRY)) {
    if (config.keywords.some(keyword => lowerName.includes(keyword))) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get recommended refinement prompts for preview mode games
 */
export function getRefinementSuggestions(classification: GameClassification): string[] {
  const suggestions: Record<string, string[]> = {
    'ludo': [
      'Add piece movement when clicking on pieces',
      'Implement capturing when landing on opponent',
      'Add safe zones that prevent capturing',
      'Create home stretch for final pieces',
      'Add win condition when all pieces reach home'
    ],
    'chess': [
      'Add piece movement validation',
      'Implement check and checkmate detection',
      'Add castling and en passant rules',
      'Highlight valid moves when selecting piece',
      'Add turn-based player switching'
    ],
    'poker': [
      'Add card dealing mechanics',
      'Implement betting system',
      'Add hand ranking detection',
      'Create AI opponents',
      'Add pot management'
    ],
    'sudoku': [
      'Add number input validation',
      'Implement row/column/box checking',
      'Add hint system',
      'Create puzzle generation',
      'Add win condition detection'
    ]
  };
  
  return suggestions[classification.subcategory] || [
    'Add game mechanics',
    'Implement game rules',
    'Add win conditions',
    'Create interactive elements'
  ];
}
