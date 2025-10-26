'use client';

import { useState, useRef } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, Play, Code, Download } from 'lucide-react';
import { GameSpec } from '@/types/game-spec';
import { cn } from '@/lib/utils';
import { GameRefinementConsole } from '@/components/game-refinement-console';

export default function CreateGamePage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [gameSpec, setGameSpec] = useState<GameSpec | null>(null);
  const [gameCode, setGameCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'input' | 'spec' | 'code'>('input');
  const [useV2, setUseV2] = useState(false); // Toggle for V2 generation
  const [generationLogs, setGenerationLogs] = useState<Array<{step: string, message: string, timestamp: number}>>([]);
  const [isRefining, setIsRefining] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [gameDesign, setGameDesign] = useState<any>(null); // Store for refinement
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleExamplePromptSelect = (example: string) => {
    if (isGenerating) return;
    setPrompt(example.substring(3));
  };

  const generateGameSpec = async () => {
    if (!prompt.trim()) {
      setError('Please enter a game description');
      return;
    }

    setIsGenerating(true);
    setError('');
    setCurrentStep('input');
    setGenerationLogs([]);
    setShowConsole(true);

    const addLog = (step: string, message: string) => {
      setGenerationLogs(prev => [...prev, { step, message, timestamp: Date.now() }]);
    };

    try {
      if (useV2) {
        // V2: Enhanced AI Generation
        console.log('🚀 Using V2 Enhanced Generation');
        addLog('init', '🚀 Starting V2 Enhanced Generation');
        
        // Step 1: Generate detailed GameDesign
        addLog('design', '🤖 Calling GPT-4 for detailed game design...');
        const designResponse = await fetch('/api/ai-game-v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, mode: 'ai-enhanced' }),
        });

        if (!designResponse.ok) {
          throw new Error('Failed to generate game design');
        }

        const designData = await designResponse.json();
        
        if (!designData.success || !designData.gameDesign) {
          throw new Error(designData.error || 'Invalid response from server');
        }

        // Convert GameDesign to GameSpec for display compatibility
        const refinedGameDesign = designData.gameDesign;
        setGameDesign(refinedGameDesign); // Store for refinement
        addLog('parse', '✅ Game design parsed successfully');
        addLog('validate', `📊 ${refinedGameDesign.gameDesign.enemy_types?.length || 0} enemy types, ${refinedGameDesign.gameDesign.power_ups?.length || 0} power-ups`);
        
        setGameSpec({
          title: refinedGameDesign.title,
          genre: refinedGameDesign.subcategory.toLowerCase(),
          description: refinedGameDesign.description,
          mechanics: {
            movement: 'keyboard',
            objective: refinedGameDesign.gameDesign.win_condition,
            scoring: 'Points for enemies and collectibles',
            difficulty: refinedGameDesign.gameDesign.progression.difficulty_curve
          },
          entities: {
            player: refinedGameDesign.gameDesign.player,
            enemies: refinedGameDesign.gameDesign.enemy_types,
            collectibles: refinedGameDesign.gameDesign.collectibles,
            obstacles: refinedGameDesign.gameDesign.obstacles
          },
          visuals: refinedGameDesign.visuals,
          config: refinedGameDesign.config
        });
        setCurrentStep('spec');

        // Step 2: Generate dynamic game code
        addLog('generate', '⚙️ Generating dynamic game code...');
        const codeResponse = await fetch('/api/ai-game-code-v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameDesign: refinedGameDesign }),
        });

        if (!codeResponse.ok) {
          throw new Error('Failed to generate game code');
        }

        const codeData = await codeResponse.json();
        
        if (!codeData.success || !codeData.gameCode) {
          throw new Error(codeData.error || 'Invalid response from server');
        }

        addLog('complete', '🎉 V2 Enhanced game generation complete!');
        setGameCode(codeData.gameCode);
        setCurrentStep('code');

        // Render game in iframe
        setTimeout(() => renderGame(codeData.gameCode), 100);

      } else {
        // V1: Template-based Generation
        console.log('📋 Using V1 Template Generation');
        
        // Step 1: Generate GameSpec from prompt
        const specResponse = await fetch('/api/ai-game-generator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });

        if (!specResponse.ok) {
          throw new Error('Failed to generate game specification');
        }

        const specData = await specResponse.json();
        
        if (!specData.success || !specData.gameSpec) {
          throw new Error(specData.error || 'Invalid response from server');
        }

        setGameSpec(specData.gameSpec);
        setCurrentStep('spec');

        // Step 2: Generate game code from spec
        const codeResponse = await fetch('/api/ai-game-html', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameSpec: specData.gameSpec }),
        });

        if (!codeResponse.ok) {
          throw new Error('Failed to generate game code');
        }

        const codeData = await codeResponse.json();
        
        if (!codeData.success || !codeData.gameCode) {
          throw new Error(codeData.error || 'Invalid response from server');
        }

        setGameCode(codeData.gameCode);
        setCurrentStep('code');

        // Render game in iframe
        setTimeout(() => renderGame(codeData.gameCode), 100);
      }

    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate game');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderGame = (code: string) => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    
    if (!iframeDoc) return;

    iframeDoc.open();
    iframeDoc.write(code);
    iframeDoc.close();
    
    // Focus iframe after load to enable keyboard controls
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
      } catch {
        console.log('Could not auto-focus iframe');
      }
    };
  };

  const downloadGame = () => {
    if (!gameCode) return;

    const blob = new Blob([gameCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${gameSpec?.title.replace(/\s+/g, '-').toLowerCase() || 'game'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetGenerator = () => {
    setPrompt('');
    setGameSpec(null);
    setGameCode('');
    setError('');
    setCurrentStep('input');
    setGenerationLogs([]);
    setGameDesign(null);
    setShowConsole(false);
  };

  const handleRefine = async (refinementPrompt: string) => {
    if (!gameDesign || !refinementPrompt.trim()) return;

    setIsRefining(true);
    const addLog = (step: string, message: string) => {
      setGenerationLogs(prev => [...prev, { step, message, timestamp: Date.now() }]);
    };

    try {
      addLog('refine', `✨ Refining game: "${refinementPrompt}"`);

      // Step 1: Refine the game design
      const refineResponse = await fetch('/api/ai-game-refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameDesign, refinementPrompt }),
      });

      if (!refineResponse.ok) {
        throw new Error('Failed to refine game design');
      }

      const refineData = await refineResponse.json();
      
      if (!refineData.success || !refineData.gameDesign) {
        throw new Error(refineData.error || 'Invalid refinement response');
      }

      addLog('refine', '✅ Game design refined successfully');
      const refinedDesign = refineData.gameDesign;
      setGameDesign(refinedDesign);

      // Update GameSpec for display
      setGameSpec({
        title: refinedDesign.title,
        genre: refinedDesign.subcategory.toLowerCase(),
        description: refinedDesign.description,
        mechanics: {
          movement: 'keyboard',
          objective: refinedDesign.gameDesign.win_condition,
          scoring: 'Points for enemies and collectibles',
          difficulty: refinedDesign.gameDesign.progression.difficulty_curve
        },
        entities: {
          player: refinedDesign.gameDesign.player,
          enemies: refinedDesign.gameDesign.enemy_types,
          collectibles: refinedDesign.gameDesign.collectibles
        },
        visuals: refinedDesign.visuals,
        config: refinedDesign.config
      });

      // Step 2: Regenerate game code
      addLog('generate', '⚙️ Regenerating game code with refinements...');
      const codeResponse = await fetch('/api/ai-game-code-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameDesign: refinedDesign }),
      });

      if (!codeResponse.ok) {
        throw new Error('Failed to generate refined game code');
      }

      const codeData = await codeResponse.json();
      
      if (!codeData.success || !codeData.gameCode) {
        throw new Error(codeData.error || 'Invalid code generation response');
      }

      addLog('complete', '🎉 Refined game ready!');
      setGameCode(codeData.gameCode);

      // Render refined game
      setTimeout(() => renderGame(codeData.gameCode), 100);

    } catch (err) {
      console.error('Refinement error:', err);
      addLog('error', `❌ Refinement failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setError(err instanceof Error ? err.message : 'Failed to refine game');
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          AI Game Generator
        </h1>
        <p className="text-muted-foreground">
          Create playable mini-games using natural language - powered by GPT-4 and Phaser.js
        </p>
      </div>

       {/* Example Prompts */}
       <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Example Prompts - Try Different Game Types!</span>
            <span className="text-sm font-normal text-muted-foreground">
              {useV2 ? '✨ V2 Enhanced' : '⚡ V1 Quick'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            {(useV2 ? [
              '🚀 Create a bullet-hell space shooter with 3 enemy types that move in different patterns and power-ups for shields and rapid fire',
              '🏃 Make a platformer with double-jump where you collect gems and avoid spike traps with invincibility power-ups',
              '🎲 Create a snake and ladder board game with 10 snakes and 9 ladders',
              '🧩 Create a match-3 puzzle with 5 colored tiles and row-clearing power-ups',
              '🎯 Make a breakout game with 5 rows of bricks worth different points',
              '🏰 Build a tower defense with 3 tower types: basic, heavy, and rapid fire',
            ] : [
              '🚀 Create a space shooter with enemies and power-ups',
              '🏃 Make a platformer where you collect coins and jump over obstacles',
              '🏎️ Build a racing game where you dodge obstacles and collect fuel',
              '🎲 Create a snake and ladder board game with dice rolling',
              '🧩 Create a match-3 puzzle game with colorful tiles',
              '🎯 Make a breakout game where you break bricks with a ball',
              '🃏 Build a memory card matching game',
              '💰 Create an idle clicker game where you upgrade and earn resources',
              '🏰 Make a tower defense game where you place towers to stop enemies',
            ]).map((example, i) => (
              <div
                key={i}
                role="button"
                tabIndex={0}
                onClick={() => handleExamplePromptSelect(example)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleExamplePromptSelect(example);
                  }
                }}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'h-auto py-3 px-4 text-left justify-start whitespace-normal select-text cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                )}
                aria-disabled={isGenerating}
              >
                {example}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Input & Spec */}
        <div className="space-y-6">
          {/* Prompt Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Describe Your Game
              </CardTitle>
              <CardDescription>
                Tell us what kind of game you want to create
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Generation Mode Selector */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                <div className="flex-1">
                  <div className="font-semibold text-sm">Generation Mode</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {useV2 ? (
                      <>🚀 V2 Enhanced - Dynamic AI generation with custom behaviors</>
                    ) : (
                      <>📋 V1 Template - Fast generation with fixed templates</>
                    )}
                  </div>
                </div>
                <Button
                  variant={useV2 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseV2(!useV2)}
                  disabled={isGenerating}
                  className="ml-4"
                >
                  {useV2 ? '✨ V2' : '⚡ V1'}
                </Button>
              </div>

              {/* Mode Info */}
              {useV2 && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md text-sm text-blue-400">
                  <strong>V2 Mode:</strong> Generates detailed game designs with custom enemy behaviors, 
                  unique power-up systems, and dynamic difficulty scaling. Takes 15-25s.
                </div>
              )}

              <Textarea
                placeholder={useV2 
                  ? "Example: Create a bullet-hell space shooter with 3 enemy types that move in different patterns, power-ups for shields and rapid fire, and exponential difficulty"
                  : "Example: Create a space shooter with power-ups and enemies that move in waves"
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={isGenerating}
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={generateGameSpec}
                  disabled={isGenerating || !prompt.trim()}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {useV2 ? 'Generating (V2)...' : 'Generating...'}
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Game {useV2 ? '(V2)' : ''}
                    </>
                  )}
                </Button>
                
                {(gameSpec || gameCode) && (
                  <Button onClick={resetGenerator} variant="outline">
                    Reset
                  </Button>
                )}
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Game Spec Display */}
          {gameSpec && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Game Specification
                </CardTitle>
                <CardDescription>
                  AI-generated game structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold">Title:</span> {gameSpec.title}
                  </div>
                  <div>
                    <span className="font-semibold">Genre:</span> {gameSpec.genre}
                  </div>
                  <div>
                    <span className="font-semibold">Description:</span> {gameSpec.description}
                  </div>
                  <div>
                    <span className="font-semibold">Objective:</span> {gameSpec.mechanics.objective}
                  </div>
                  <div>
                    <span className="font-semibold">Controls:</span> {gameSpec.mechanics.movement}
                  </div>
                  <div>
                    <span className="font-semibold">Difficulty:</span> {gameSpec.mechanics.difficulty}
                  </div>
                  <div>
                    <span className="font-semibold">Theme:</span> {gameSpec.visuals.theme}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Game Preview */}
        <div className="space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Game Preview
              </CardTitle>
              <CardDescription>
                Your generated game will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gameCode ? (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md text-sm text-blue-400">
                    💡 <strong>Tip:</strong> Click inside the game to activate keyboard controls!
                  </div>
                  
                  <div className="relative bg-black rounded-lg overflow-hidden border-4 border-gray-800">
                    <iframe
                      ref={iframeRef}
                      className="w-full h-[600px]"
                      sandbox="allow-scripts allow-same-origin"
                      title="Game Preview"
                    />
                  </div>
                  
                  <Button
                    onClick={downloadGame}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Game HTML
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[600px] bg-muted rounded-lg border-2 border-dashed">
                  <div className="text-center text-muted-foreground">
                    <Wand2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Enter a game description and click Generate</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generation Console & Refinement */}
      {useV2 && (
        <GameRefinementConsole
          logs={generationLogs}
          onRefine={handleRefine}
          isRefining={isRefining}
          gameDesign={gameDesign}
          showConsole={showConsole}
          onToggleConsole={() => setShowConsole(!showConsole)}
        />
      )}
    </div>
  );
}
