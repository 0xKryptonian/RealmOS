import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { GameDesign, GameGenerationRequestV2 } from '@/types/game-design';

/**
 * AI Game Generator V2 - Enhanced with Detailed Game Design
 * Step 1: Generate comprehensive game design document
 */

const ENHANCED_SYSTEM_PROMPT = `You are an expert game designer AI that creates detailed, comprehensive game design documents.

Your task is to analyze the user's game idea and output a complete GameDesign JSON specification.

The GameDesign should include:
1. Category and subcategory classification
2. Detailed core mechanics
3. Complete entity specifications (player, enemies, power-ups)
4. Progression and difficulty systems
5. Win/lose conditions
6. Visual and audio specifications

GameDesign Schema:
{
  "category": "Action Games | Strategy Games | Puzzle Games | Board & Card Games | Casual Games | Simulation Games",
  "subcategory": "string (e.g., Shooter, Platformer, Tower Defense)",
  "variant": "string (optional, e.g., bullet-hell, side-scroll)",
  "title": "string",
  "description": "string",
  "theme": "string (e.g., space, medieval, underwater)",
  "gameDesign": {
    "core_mechanic": "string (detailed description)",
    "player_abilities": ["ability1", "ability2"],
    "player": {
      "type": "string",
      "health": number,
      "speed": number,
      "abilities": ["string"],
      "controls": ["string"]
    },
    "enemy_types": [
      {
        "name": "string",
        "behavior": "detailed behavior description",
        "health": number,
        "speed": number,
        "damage": number,
        "points": number,
        "spawn_rate": number
      }
    ],
    "power_ups": [
      {
        "type": "string",
        "duration": number,
        "effect": "detailed effect description",
        "rarity": "common | rare | epic"
      }
    ],
    "obstacles": [
      {
        "type": "string",
        "behavior": "string",
        "damage": number
      }
    ],
    "collectibles": [
      {
        "type": "string",
        "points": number,
        "effect": "string (optional)"
      }
    ],
    "progression": {
      "difficulty_curve": "linear | exponential | stepped | adaptive",
      "wave_system": boolean,
      "level_system": boolean,
      "boss_fights": boolean,
      "time_limit": number (optional)
    },
    "win_condition": "string",
    "lose_condition": "string"
  },
  "visuals": {
    "style": "pixel | minimal | geometric | cartoon",
    "colorScheme": "monochrome | retro | neon | pastel | dark | vibrant",
    "theme": "string",
    "assets": {
      "player_icon": "string (describe visual)",
      "enemy_icons": ["string"],
      "collectible_icons": ["string"],
      "background_style": "string"
    }
  },
  "audio": {
    "music": boolean,
    "sfx": boolean,
    "ambient": boolean
  },
  "config": {
    "width": 800,
    "height": 600,
    "fps": 60,
    "physics": "arcade | matter | none"
  }
}

Rules:
1. Be VERY detailed in behavior descriptions
2. Include specific numbers for health, speed, damage, points
3. Design balanced, fun gameplay
4. Consider player progression and difficulty
5. Make mechanics clear and implementable
6. Include at least 2-3 enemy types for variety
7. Add 2-3 power-ups for depth
8. Specify exact win/lose conditions

Example Input: "Create a bullet-hell space shooter with power-ups"

Example Output:
{
  "category": "Action Games",
  "subcategory": "Shooter",
  "variant": "bullet-hell",
  "title": "Cosmic Chaos",
  "description": "An intense bullet-hell space shooter where you dodge intricate enemy patterns while collecting power-ups to upgrade your ship",
  "theme": "space",
  "gameDesign": {
    "core_mechanic": "Player controls a spaceship that can move in 8 directions and shoot. Must dodge complex bullet patterns from enemies while destroying them and collecting power-ups",
    "player_abilities": ["move", "shoot", "dash"],
    "player": {
      "type": "spaceship",
      "health": 3,
      "speed": 300,
      "abilities": ["shoot bullets", "dash to dodge"],
      "controls": ["arrow keys for movement", "space to shoot", "shift to dash"]
    },
    "enemy_types": [
      {
        "name": "Basic Drone",
        "behavior": "Moves straight down, shoots single bullet every 2 seconds",
        "health": 1,
        "speed": 100,
        "damage": 1,
        "points": 10,
        "spawn_rate": 2
      },
      {
        "name": "Elite Fighter",
        "behavior": "Moves in sine wave pattern, shoots 3-bullet spread every 1.5 seconds",
        "health": 3,
        "speed": 150,
        "damage": 1,
        "points": 50,
        "spawn_rate": 5
      },
      {
        "name": "Heavy Bomber",
        "behavior": "Moves slowly, shoots circular bullet pattern of 8 bullets",
        "health": 5,
        "speed": 80,
        "damage": 2,
        "points": 100,
        "spawn_rate": 10
      }
    ],
    "power_ups": [
      {
        "type": "shield",
        "duration": 5,
        "effect": "Grants temporary invincibility, player glows blue",
        "rarity": "rare"
      },
      {
        "type": "rapid_fire",
        "duration": 8,
        "effect": "Doubles fire rate, bullets turn red",
        "rarity": "common"
      },
      {
        "type": "spread_shot",
        "duration": 10,
        "effect": "Shoots 3 bullets in spread pattern",
        "rarity": "rare"
      }
    ],
    "collectibles": [
      {
        "type": "health_pack",
        "points": 0,
        "effect": "Restores 1 health point"
      }
    ],
    "progression": {
      "difficulty_curve": "exponential",
      "wave_system": true,
      "level_system": false,
      "boss_fights": false,
      "time_limit": null
    },
    "win_condition": "Survive 10 waves of enemies",
    "lose_condition": "Player health reaches 0"
  },
  "visuals": {
    "style": "pixel",
    "colorScheme": "neon",
    "theme": "cyberpunk space",
    "assets": {
      "player_icon": "sleek blue spaceship with glowing engines",
      "enemy_icons": ["red drone", "purple fighter", "orange bomber"],
      "collectible_icons": ["blue shield bubble", "red rapid-fire icon", "green spread icon"],
      "background_style": "scrolling starfield with nebula"
    }
  },
  "audio": {
    "music": true,
    "sfx": true,
    "ambient": true
  },
  "config": {
    "width": 800,
    "height": 600,
    "fps": 60,
    "physics": "arcade"
  }
}

Now analyze the user's prompt and create a detailed GameDesign JSON.`;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  console.log('\n🚀 ========================================');
  console.log('🚀 [AI Game Generator V2] Enhanced Generation');
  console.log('🚀 ========================================');
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  try {
    const body: GameGenerationRequestV2 = await request.json();
    const { prompt, mode = 'ai-enhanced' } = body;

    console.log('\n📝 [Step 1/7] User Input Received');
    console.log('   Prompt:', prompt);
    console.log('   Mode:', mode);
    console.log('   Length:', prompt?.length, 'characters');

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      console.error('❌ [ERROR] Invalid prompt provided');
      return NextResponse.json(
        { success: false, error: 'Valid prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ [ERROR] OpenAI API key not configured');
      return NextResponse.json(
        { 
          success: false, 
          error: 'OpenAI API key not configured' 
        },
        { status: 500 }
      );
    }

    console.log('\n🤖 [Step 2/7] Initializing GPT-4 (Enhanced Mode)');
    console.log('   Model: gpt-4');
    console.log('   Temperature: 0.7');
    console.log('   Max Tokens: 2000 (detailed output)');

    const model = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    console.log('\n🚀 [Step 3/7] Calling GPT-4 for Detailed Game Design...');
    console.log('   Generating comprehensive game design document...');
    
    const response = await model.invoke([
      { role: 'system', content: ENHANCED_SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ]);

    console.log('✅ [Step 3/7] GPT-4 Response Received');
    console.log('   Response length:', response.content.toString().length, 'characters');

    const content = response.content.toString();
    
    console.log('\n🔍 [Step 4/7] Parsing GameDesign JSON');
    
    // Extract JSON from response
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }
    
    const gameDesign: GameDesign = JSON.parse(jsonContent.trim());

    console.log('✅ [Step 4/7] GameDesign Parsed Successfully');
    console.log('   Title:', gameDesign.title);
    console.log('   Category:', gameDesign.category);
    console.log('   Subcategory:', gameDesign.subcategory);
    console.log('   Variant:', gameDesign.variant || 'standard');

    console.log('\n📊 [Step 5/7] Analyzing Game Design Complexity');
    console.log('   Enemy Types:', gameDesign.gameDesign.enemy_types?.length || 0);
    console.log('   Power-ups:', gameDesign.gameDesign.power_ups?.length || 0);
    console.log('   Player Abilities:', gameDesign.gameDesign.player_abilities?.length || 0);
    console.log('   Progression:', gameDesign.gameDesign.progression.difficulty_curve);

    // Validate
    console.log('\n🔍 [Step 6/7] Validating GameDesign');
    if (!gameDesign.title || !gameDesign.category || !gameDesign.gameDesign) {
      console.error('❌ [ERROR] Invalid GameDesign structure');
      throw new Error('Invalid GameDesign structure');
    }
    
    console.log('✅ [Step 6/7] Validation Passed');

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n✅ [Step 7/7] Game Design Generation Complete!');
    console.log('⏱️  Total Time:', duration, 'seconds');
    console.log('💰 Estimated Cost: $0.02-0.05 (enhanced mode)');
    console.log('📊 Design Complexity: HIGH');
    console.log('🚀 ========================================\n');

    return NextResponse.json({
      success: true,
      gameDesign,
      generationMode: mode,
      metadata: {
        generationTime: parseFloat(duration),
        codeSize: 0, // Will be filled by code generator
        aiEnhancements: [
          'Detailed enemy behaviors',
          'Balanced progression system',
          'Multiple power-ups',
          'Comprehensive mechanics'
        ]
      }
    });

  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.error('\n❌ ========================================');
    console.error('❌ [ERROR] Game Design Generation Failed');
    console.error('❌ ========================================');
    console.error('Error:', error);
    console.error('Time elapsed:', duration, 'seconds');
    console.error('❌ ========================================\n');
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate game design'
      },
      { status: 500 }
    );
  }
}
