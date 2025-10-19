import { NextRequest, NextResponse } from 'next/server';
import { GameSpec } from '@/types/game-spec';
import { generateGameCode } from '@/lib/game-templates';

/**
 * AI Game Generator API - Step 3: Code Generation
 * Takes GameSpec JSON and generates playable HTML/Phaser.js code
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameSpec } = body;

    if (!gameSpec || typeof gameSpec !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Valid gameSpec is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    const spec = gameSpec as GameSpec;
    if (!spec.title || !spec.genre || !spec.config) {
      return NextResponse.json(
        { success: false, error: 'Invalid GameSpec: missing required fields' },
        { status: 400 }
      );
    }

    // Generate game code from template
    const gameCode = generateGameCode(spec);

    return NextResponse.json({
      success: true,
      gameCode,
      gameSpec: spec,
    });

  } catch (error) {
    console.error('Game Code Generation Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate game code'
      },
      { status: 500 }
    );
  }
}
