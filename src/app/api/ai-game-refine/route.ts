import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { GameDesign } from '@/types/game-design';

/**
 * AI Game Refinement API
 * Takes existing GameDesign and refinement instructions to improve the game
 */

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  console.log('\n✨ ========================================');
  console.log('✨ [Game Refinement] Refining Game Design');
  console.log('✨ ========================================');
  
  try {
    const body = await request.json();
    const { gameDesign, refinementPrompt } = body;

    console.log('\n📝 [Step 1/5] Refinement Request Received');
    console.log('   Current Game:', gameDesign?.title);
    console.log('   Refinement:', refinementPrompt);

    if (!gameDesign || !refinementPrompt) {
      console.error('❌ [ERROR] Missing gameDesign or refinementPrompt');
      return NextResponse.json(
        { success: false, error: 'gameDesign and refinementPrompt are required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ [ERROR] OpenAI API key not configured');
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    console.log('\n🤖 [Step 2/5] Initializing GPT-4 for Refinement');
    
    const model = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const refinementSystemPrompt = `You are an expert game designer AI that refines and improves existing game designs.

You will receive:
1. An existing GameDesign JSON
2. Refinement instructions from the user

Your task:
- Analyze the current game design
- Apply the requested changes
- Maintain consistency with the original design
- Output the complete updated GameDesign JSON

Rules:
1. Keep the same structure as the original GameDesign
2. Only modify what the user requests
3. Ensure changes are balanced and fun
4. Maintain game coherence
5. Output valid JSON

Example Refinement Request: "Make enemies move faster"
Example Change: Increase enemy speed values by 50%

Example Refinement Request: "Add a shield power-up"
Example Change: Add new power-up to power_ups array with shield properties

Now refine the game design based on the user's request.`;

    const userPrompt = `Current Game Design:
${JSON.stringify(gameDesign, null, 2)}

Refinement Request:
${refinementPrompt}

Please output the complete refined GameDesign JSON with the requested changes applied.`;

    console.log('\n🚀 [Step 3/5] Calling GPT-4 for Refinement...');
    
    const response = await model.invoke([
      { role: 'system', content: refinementSystemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    console.log('✅ [Step 3/5] GPT-4 Response Received');

    const content = response.content.toString();
    
    console.log('\n🔍 [Step 4/5] Parsing Refined GameDesign');
    
    // Extract JSON from response
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }
    
    const refinedGameDesign: GameDesign = JSON.parse(jsonContent.trim());

    console.log('✅ [Step 4/5] Refined GameDesign Parsed');
    console.log('   Title:', refinedGameDesign.title);
    console.log('   Changes Applied:', refinementPrompt);

    // Validate
    if (!refinedGameDesign.title || !refinedGameDesign.gameDesign) {
      console.error('❌ [ERROR] Invalid refined GameDesign');
      throw new Error('Invalid refined GameDesign structure');
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n✅ [Step 5/5] Refinement Complete!');
    console.log('⏱️  Total Time:', duration, 'seconds');
    console.log('💰 Estimated Cost: $0.02-0.04');
    console.log('✨ ========================================\n');

    return NextResponse.json({
      success: true,
      gameDesign: refinedGameDesign,
      refinementApplied: refinementPrompt,
      metadata: {
        refinementTime: parseFloat(duration),
        originalTitle: gameDesign.title,
        refinedTitle: refinedGameDesign.title
      }
    });

  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.error('\n❌ ========================================');
    console.error('❌ [ERROR] Refinement Failed');
    console.error('❌ ========================================');
    console.error('Error:', error);
    console.error('Time elapsed:', duration, 'seconds');
    console.error('❌ ========================================\n');
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to refine game design'
      },
      { status: 500 }
    );
  }
}
