import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { GameSpec, GameGenerationRequest } from '@/types/game-spec';

/**
 * AI Game Generator API - Step 1: Intent Parsing
 * Converts natural language prompts into structured GameSpec JSON
 */

const SYSTEM_PROMPT = `You are an expert game designer AI that converts natural language game ideas into structured JSON specifications.

Your task is to analyze the user's game idea and output a valid GameSpec JSON object.

Rules:
1. Always output valid JSON matching the GameSpec schema
2. Be creative but practical - games should be implementable in Phaser.js
3. Keep mechanics simple and fun
4. Use pixel art style for visuals
5. Infer missing details intelligently

GameSpec Schema:
{
  "title": "string",
  "genre": "platformer | puzzle | arcade | shooter | racing | strategy | idle | card",
  "description": "string",
  "mechanics": {
    "movement": "keyboard | mouse | touch | auto",
    "objective": "string",
    "scoring": "string",
    "difficulty": "easy | medium | hard"
  },
  "entities": {
    "player": {
      "type": "string",
      "controls": ["string"],
      "abilities": ["string"]
    },
    "enemies": [{"type": "string", "behavior": "string", "count": number}],
    "collectibles": [{"type": "string", "effect": "string", "points": number}],
    "obstacles": [{"type": "string", "behavior": "string"}]
  },
  "visuals": {
    "theme": "string",
    "colorScheme": "monochrome | retro | neon | pastel",
    "style": "pixel | minimal | geometric"
  },
  "audio": {
    "music": boolean,
    "sfx": boolean
  },
  "config": {
    "width": 800,
    "height": 600,
    "fps": 60,
    "duration": number (optional)
  }
}

Example Input: "Create a space shooter with power-ups"
Example Output:
{
  "title": "Cosmic Defender",
  "genre": "shooter",
  "description": "Defend Earth from alien invaders while collecting power-ups",
  "mechanics": {
    "movement": "keyboard",
    "objective": "Destroy all enemies and survive as long as possible",
    "scoring": "Points for each enemy destroyed, bonus for power-ups",
    "difficulty": "medium"
  },
  "entities": {
    "player": {
      "type": "spaceship",
      "controls": ["arrow keys", "space to shoot"],
      "abilities": ["shoot", "move"]
    },
    "enemies": [
      {"type": "alien", "behavior": "move down and shoot", "count": 10}
    ],
    "collectibles": [
      {"type": "shield", "effect": "temporary invincibility", "points": 50},
      {"type": "rapid-fire", "effect": "faster shooting", "points": 30}
    ]
  },
  "visuals": {
    "theme": "space",
    "colorScheme": "neon",
    "style": "pixel"
  },
  "audio": {
    "music": true,
    "sfx": true
  },
  "config": {
    "width": 800,
    "height": 600,
    "fps": 60
  }
}

Now convert the user's prompt into a GameSpec JSON.`;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  console.log('\n🎮 ========================================');
  console.log('🎮 [AI Game Generator] New Generation Request');
  console.log('🎮 ========================================');
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  try {
    const body: GameGenerationRequest = await request.json();
    const { prompt } = body;

    console.log('\n📝 [Step 1/6] User Input Received');
    console.log('   Prompt:', prompt);
    console.log('   Length:', prompt?.length, 'characters');

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      console.error('❌ [ERROR] Invalid prompt provided');
      return NextResponse.json(
        { success: false, error: 'Valid prompt is required' },
        { status: 400 }
      );
    }

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ [ERROR] OpenAI API key not configured');
      return NextResponse.json(
        { 
          success: false, 
          error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to environment variables.' 
        },
        { status: 500 }
      );
    }

    console.log('\n🤖 [Step 2/6] Initializing GPT-4');
    console.log('   Model: gpt-4');
    console.log('   Temperature: 0.7');
    console.log('   Provider: OpenAI via LangChain');

    // Initialize GPT-4 with LangChain
    const model = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    console.log('\n🚀 [Step 3/6] Calling GPT-4 API...');
    console.log('   Sending prompt to AI...');
    
    // Generate GameSpec from prompt
    const response = await model.invoke([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ]);

    console.log('✅ [Step 3/6] GPT-4 Response Received');
    console.log('   Response length:', response.content.toString().length, 'characters');

    const content = response.content.toString();
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    console.log('\n🔍 [Step 4/6] Parsing JSON Response');
    console.log('   Extracting GameSpec from AI response...');
    
    // Parse and validate GameSpec
    const gameSpec: GameSpec = JSON.parse(jsonContent.trim());

    console.log('✅ [Step 4/6] GameSpec Parsed Successfully');
    console.log('   Title:', gameSpec.title);
    console.log('   Genre:', gameSpec.genre);
    console.log('   Description:', gameSpec.description?.substring(0, 100) + '...');

    // Basic validation
    console.log('\n🔍 [Step 5/6] Validating GameSpec');
    if (!gameSpec.title || !gameSpec.genre || !gameSpec.mechanics) {
      console.error('❌ [ERROR] Invalid GameSpec structure');
      throw new Error('Invalid GameSpec structure');
    }
    
    console.log('✅ [Step 5/6] Validation Passed');
    console.log('   Mechanics:', Object.keys(gameSpec.mechanics));
    console.log('   Entities:', Object.keys(gameSpec.entities || {}));
    console.log('   Config:', `${gameSpec.config.width}x${gameSpec.config.height}`);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n✅ [Step 6/6] Generation Complete!');
    console.log('⏱️  Total Time:', duration, 'seconds');
    console.log('💰 Estimated Cost: $0.01-0.03');
    console.log('🎮 ========================================\n');

    return NextResponse.json({
      success: true,
      gameSpec,
    });

  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.error('\n❌ ========================================');
    console.error('❌ [ERROR] Generation Failed');
    console.error('❌ ========================================');
    console.error('Error:', error);
    console.error('Time elapsed:', duration, 'seconds');
    console.error('❌ ========================================\n');
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate game specification'
      },
      { status: 500 }
    );
  }
}
