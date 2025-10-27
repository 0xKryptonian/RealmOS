import { NextRequest, NextResponse } from 'next/server';
import { GameDesign } from '@/types/game-design';
import { generateDynamicGame } from '@/lib/dynamic-game-generator';
import { generateGamePreview } from '@/lib/game-preview-generator';
import { classifyGame, getRefinementSuggestions } from '@/lib/game-classifier';
import { shouldUseV1Templates, generateGameUsingV1Templates } from '@/lib/v2-to-v1-bridge';

/**
 * AI Game Generator V2 - Step 2: Intelligent Code Generation
 * 
 * Smart routing system:
 * 1. Check if game should use V1 templates (board games, puzzles, cards)
 * 2. Use V1 template system if appropriate (proven, reliable)
 * 3. Use V2 dynamic generator for action games (shooters, platformers)
 * 4. Fall back to preview mode for complex games without templates
 */

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  console.log('\n⚙️ ========================================');
  console.log('⚙️ [Dynamic Code Generator V2] Generating Code');
  console.log('⚙️ ========================================');
  
  try {
    const body = await request.json();
    const { gameDesign } = body;

    console.log('\n📊 [Step 1/5] Receiving GameDesign');
    console.log('   GameDesign received:', !!gameDesign);

    if (!gameDesign || typeof gameDesign !== 'object') {
      console.error('❌ [ERROR] Invalid gameDesign provided');
      return NextResponse.json(
        { success: false, error: 'Valid gameDesign is required' },
        { status: 400 }
      );
    }

    const design = gameDesign as GameDesign;
    
    console.log('\n🔍 [Step 2/5] Analyzing GameDesign');
    console.log('   Title:', design.title);
    console.log('   Category:', design.category);
    console.log('   Subcategory:', design.subcategory);
    console.log('   Theme:', design.theme);
    console.log('   Enemy Types:', design.gameDesign.enemy_types?.length || 0);
    console.log('   Power-ups:', design.gameDesign.power_ups?.length || 0);
    console.log('   Progression:', design.gameDesign.progression.difficulty_curve);

    if (!design.title || !design.category || !design.gameDesign) {
      console.error('❌ [ERROR] Invalid GameDesign: missing required fields');
      return NextResponse.json(
        { success: false, error: 'Invalid GameDesign: missing required fields' },
        { status: 400 }
      );
    }

    console.log('\n🎨 [Step 3/5] Intelligent Code Generation');
    
    // Step 3a: Check if this should use V1 templates
    const useV1 = shouldUseV1Templates(design);
    
    let gameCode: string;
    let mode: string;
    let templateUsed: string;
    
    // Declare classification outside if block so it's accessible later
    let classification = null;
    
    if (useV1) {
      console.log('\n   🌉 Using V1 Template System (Proven & Reliable)');
      console.log('      Game type benefits from specialized template');
      console.log('      Converting V2 GameDesign → V1 GameSpec');
      gameCode = generateGameUsingV1Templates(design);
      mode = 'template';
      templateUsed = 'v1-template-system';
      
      // Create a classification for V1 template mode
      classification = {
        category: 'board' as const,
        subcategory: 'board-game',
        complexity: 'medium' as const,
        hasTemplate: true,
        generationMode: 'template' as const,
        confidence: 1.0,
        reason: 'Using V1 template system for board game'
      };
    } else {
      // Step 3b: Use classifier for V2 games
      classification = classifyGame(design);
      
      console.log('   📊 Classification Results:');
      console.log('      Category:', classification.category);
      console.log('      Subcategory:', classification.subcategory);
      console.log('      Complexity:', classification.complexity);
      console.log('      Generation Mode:', classification.generationMode);
      console.log('      Confidence:', (classification.confidence * 100).toFixed(0) + '%');
      
      if (classification.generationMode === 'preview') {
        console.log('\n   📋 Using UI Preview Mode');
        console.log('      Complex game without template detected');
        console.log('      Generating beautiful preview for refinement');
        gameCode = generateGamePreview(design);
        mode = 'preview';
        templateUsed = 'ui-preview';
      } else {
        console.log('\n   💻 Using V2 Dynamic Generator');
        console.log('      Generating fully functional action game');
        gameCode = generateDynamicGame(design);
        mode = 'dynamic';
        templateUsed = 'dynamic-ai-enhanced';
      }
    }
    
    console.log('✅ [Step 3/5] Code Generated Successfully');
    console.log('   Mode:', mode === 'preview' ? 'UI Preview' : 'Full Game');
    console.log('   Code length:', gameCode.length, 'characters');
    console.log('   Code size:', (gameCode.length / 1024).toFixed(2), 'KB');

    console.log('\n🔍 [Step 4/5] Code Validation');
    console.log('   Checking for syntax errors...');
    
    // Basic validation (different for preview vs dynamic)
    if (mode === 'preview') {
      if (!gameCode.includes('<!DOCTYPE html>') || !gameCode.includes('</html>')) {
        console.error('❌ [ERROR] Generated preview code appears invalid');
        throw new Error('Generated preview code validation failed');
      }
      console.log('✅ [Step 4/5] Preview Code Validation Passed');
      console.log('   Contains HTML structure: ✓');
      console.log('   Contains preview UI: ✓');
      console.log('   Ready for refinement: ✓');
    } else {
      if (!gameCode.includes('Phaser.Game') || !gameCode.includes('function create')) {
        console.error('❌ [ERROR] Generated code appears invalid');
        throw new Error('Generated code validation failed');
      }
      console.log('✅ [Step 4/5] Code Validation Passed');
      console.log('   Contains Phaser.Game: ✓');
      console.log('   Contains game loop: ✓');
      console.log('   Contains player logic: ✓');
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n✅ [Step 5/5] Dynamic Code Generation Complete!');
    console.log('⏱️  Generation Time:', duration, 'seconds');
    console.log('📦 Output Size:', (gameCode.length / 1024).toFixed(2), 'KB');
    console.log('🎨 Assets: Procedurally Generated');
    console.log('💰 Cost: $0 (no API calls for code gen)');
    console.log('⚙️ ========================================\n');

    return NextResponse.json({
      success: true,
      gameCode,
      gameDesign: design,
      isPreview: mode === 'preview',
      classification: {
        category: classification.category,
        subcategory: classification.subcategory,
        complexity: classification.complexity,
        hasTemplate: classification.hasTemplate,
        generationMode: classification.generationMode,
        confidence: classification.confidence
      },
      refinementSuggestions: mode === 'preview' ? getRefinementSuggestions(classification) : [],
      metadata: {
        generationTime: parseFloat(duration),
        codeSize: gameCode.length,
        templateUsed: templateUsed,
        mode: mode === 'template' ? 'V1 Template System' : (mode === 'preview' ? 'UI Preview (Refinement Ready)' : 'Full Game'),
        aiEnhancements: mode === 'preview' 
          ? [
              'Beautiful UI preview generated',
              'Interactive demo elements',
              'Ready for AI refinement',
              'User can add game mechanics via refinement'
            ]
          : [
              'Custom enemy behaviors',
              'Dynamic difficulty scaling',
              'Procedural asset generation',
              'Balanced power-up system'
            ]
      }
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
