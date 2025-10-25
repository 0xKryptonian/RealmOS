import { NextRequest, NextResponse } from 'next/server';
import { GameSpec } from '@/types/game-spec';
import { generateGameCode } from '@/lib/game-templates';

/**
 * AI Game Generator API - Step 3: Code Generation
 * Takes GameSpec JSON and generates playable HTML/Phaser.js code
 */

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  console.log('\n⚙️ ========================================');
  console.log('⚙️ [Code Generator] New Code Generation Request');
  console.log('⚙️ ========================================');
  
  try {
    const body = await request.json();
    const { gameSpec } = body;

    console.log('\n📊 [Step 1/4] Receiving GameSpec');
    console.log('   GameSpec received:', !!gameSpec);

    if (!gameSpec || typeof gameSpec !== 'object') {
      console.error('❌ [ERROR] Invalid gameSpec provided');
      return NextResponse.json(
        { success: false, error: 'Valid gameSpec is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    const spec = gameSpec as GameSpec;
    console.log('\n🔍 [Step 2/4] Validating GameSpec');
    console.log('   Title:', spec.title);
    console.log('   Genre:', spec.genre);
    console.log('   Config:', spec.config ? `${spec.config.width}x${spec.config.height}` : 'missing');
    
    if (!spec.title || !spec.genre || !spec.config) {
      console.error('❌ [ERROR] Invalid GameSpec: missing required fields');
      return NextResponse.json(
        { success: false, error: 'Invalid GameSpec: missing required fields' },
        { status: 400 }
      );
    }

    console.log('\n🎯 [Step 3/4] Selecting Template');
    console.log('   Genre:', spec.genre);
    console.log('   Description keywords:', spec.description?.toLowerCase().split(' ').slice(0, 5).join(', '));
    
    // Generate game code from template
    const gameCode = generateGameCode(spec);
    
    console.log('✅ [Step 3/4] Template Selected & Code Generated');
    console.log('   Code length:', gameCode.length, 'characters');
    console.log('   Code size:', (gameCode.length / 1024).toFixed(2), 'KB');

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n✅ [Step 4/4] Code Generation Complete!');
    console.log('⏱️  Generation Time:', duration, 'seconds');
    console.log('📦 Output Size:', (gameCode.length / 1024).toFixed(2), 'KB');
    console.log('⚙️ ========================================\n');

    return NextResponse.json({
      success: true,
      gameCode,
      gameSpec: spec,
    });

  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.error('\n❌ ========================================');
    console.error('❌ [ERROR] Code Generation Failed');
    console.error('❌ ========================================');
    console.error('Error:', error);
    console.error('Time elapsed:', duration, 'seconds');
    console.error('❌ ========================================\n');
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate game code'
      },
      { status: 500 }
    );
  }
}
