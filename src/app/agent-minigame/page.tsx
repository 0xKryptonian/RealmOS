'use client';

import { useState, useRef } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, Play, Code, Download } from 'lucide-react';
import { GameSpec } from '@/types/game-spec';
import { GameDesign } from '@/types/game-design';
import { cn } from '@/lib/utils';
import { GameRefinementConsole, GenerationLog } from '@/components/game-refinement-console';

export default function CreateGamePage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [gameSpec, setGameSpec] = useState<GameSpec | null>(null);
  const [gameCode, setGameCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [useV2, setUseV2] = useState(false); // Toggle for V2 generation
  const [generationLogs, setGenerationLogs] = useState<GenerationLog[]>([]);
  const [isRefining, setIsRefining] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [gameDesign, setGameDesign] = useState<GameDesign | null>(null); // Store for refinement
  const [refinementSuggestions, setRefinementSuggestions] = useState<string[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Global addLog helper
  const addLog = (step: string, message: string, type?: 'info' | 'success' | 'error' | 'warning', details?: string) => {
    setGenerationLogs(prev => [...prev, { step, message, timestamp: Date.now(), type, details }]);
  };

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
    setGenerationLogs([]);
    setShowConsole(true);

    const addLog = (step: string, message: string, type?: 'info' | 'success' | 'error' | 'warning', details?: string) => {
      setGenerationLogs(prev => [...prev, { step, message, timestamp: Date.now(), type, details }]);
    };

    try {
      if (useV2) {
        // V2: Enhanced AI Generation
        console.log('🚀 Using V2 Enhanced Generation');
        addLog('init', '🚀 Starting V2 Enhanced Generation', 'info', 'Mode: AI-Enhanced Dynamic Generation');
        
        // Step 1: Generate detailed GameDesign
        addLog('api', '🌐 Calling GPT-4 API for detailed game design...', 'info', 'Endpoint: /api/ai-game-v2');
        const designResponse = await fetch('/api/ai-game-v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, mode: 'ai-enhanced' }),
        });

        if (!designResponse.ok) {
          throw new Error('Failed to generate game design');
        }

        addLog('loading', '⏳ Receiving response from GPT-4...', 'info');
        const designData = await designResponse.json();
        
        if (!designData.success || !designData.gameDesign) {
          addLog('error', '❌ Failed to parse game design', 'error', designData.error || 'Invalid response structure');
          throw new Error(designData.error || 'Invalid response from server');
        }

        // Convert GameDesign to GameSpec for display compatibility
        const refinedGameDesign = designData.gameDesign;
        setGameDesign(refinedGameDesign); // Store for refinement
        addLog('parse', '✅ Game design parsed successfully', 'success', `Title: ${refinedGameDesign.title}`);
        addLog('validate', `📊 Design validated`, 'success', 
          `Enemy Types: ${refinedGameDesign.gameDesign.enemy_types?.length || 0} | ` +
          `Power-ups: ${refinedGameDesign.gameDesign.power_ups?.length || 0} | ` +
          `Difficulty: ${refinedGameDesign.gameDesign.progression?.difficulty_curve || 'N/A'}`);
        
        setGameSpec({
          title: refinedGameDesign.title,
          genre: refinedGameDesign.subcategory.toLowerCase() as GameSpec['genre'],
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

        // Step 2: Generate dynamic game code
        addLog('code', '💻 Generating dynamic Phaser.js game code...', 'info', 'Using procedural asset generation');
        addLog('api', '🌐 Calling code generation API...', 'info', 'Endpoint: /api/ai-game-code-v2');
        const codeResponse = await fetch('/api/ai-game-code-v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameDesign: refinedGameDesign }),
        });

        if (!codeResponse.ok) {
          addLog('error', '❌ Code generation API failed', 'error', `Status: ${codeResponse.status}`);
          throw new Error('Failed to generate game code');
        }

        addLog('loading', '⏳ Processing generated code...', 'info');
        const codeData = await codeResponse.json();
        
        if (!codeData.success || !codeData.gameCode) {
          addLog('error', '❌ Invalid code response', 'error', codeData.error || 'Missing game code in response');
          throw new Error(codeData.error || 'Invalid response from server');
        }

        const codeSizeKB = (codeData.gameCode.length / 1024).toFixed(2);
        addLog('validate', '✅ Game code validated', 'success', `Size: ${codeSizeKB} KB | Lines: ~${codeData.gameCode.split('\n').length}`);
        
        // Check if this is preview mode
        if (codeData.isPreview) {
          addLog('complete', '🎨 UI Preview generated!', 'success', 'Complex game detected - showing preview UI');
          addLog('refine', '✨ Use refinement to add game mechanics', 'info', 'Add functionality via AI refinement below');
          setIsPreviewMode(true);
          
          // Store AI-suggested refinements
          if (codeData.refinementSuggestions && codeData.refinementSuggestions.length > 0) {
            setRefinementSuggestions(codeData.refinementSuggestions);
            addLog('refine', `💡 ${codeData.refinementSuggestions.length} refinement suggestions available`, 'info', 'Check quick fixes below');
          }
        } else {
          addLog('complete', '🎉 V2 Enhanced game generation complete!', 'success', 'Ready to play!');
          setIsPreviewMode(false);
          setRefinementSuggestions([]);
        }
        
        setGameCode(codeData.gameCode);

        // Render game in iframe
        addLog('loading', '⏳ Loading game in preview...', 'info');
        setTimeout(() => {
          renderGame(codeData.gameCode);
          if (codeData.isPreview) {
            addLog('complete', '✅ Preview loaded!', 'success', 'Beautiful UI ready - refine to add mechanics');
          } else {
            addLog('complete', '✅ Game loaded successfully!', 'success', 'Click inside to play');
          }
        }, 100);

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

        // Render game in iframe
        setTimeout(() => renderGame(codeData.gameCode), 100);
      }

    } catch (err) {
      console.error('Generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate game';
      addLog('error', '❌ Generation failed', 'error', errorMessage);
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
      if (error) {
        addLog('error', '⚠️ Generation process terminated with errors', 'error');
      }
    }
  };

  const renderGame = (code: string) => {
    if (!iframeRef.current) return;

    try {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (!iframeDoc) {
        addLog('error', '❌ Cannot access iframe', 'error', 'Security or loading issue');
        return;
      }

      // Listen for errors in the iframe
      iframe.contentWindow?.addEventListener('error', (e) => {
        console.error('🎮 [Game Runtime Error]', e.message, 'at', e.filename, 'line', e.lineno);
        addLog('error', '❌ Game error detected', 'error', `${e.message} at line ${e.lineno}`);
        addLog('error', '💡 Possible issue', 'warning', 'The generated code has a bug. Try refining or regenerating.');
      });

      iframeDoc.open();
      iframeDoc.write(code);
      iframeDoc.close();
      
      addLog('complete', '✅ Code injected into iframe', 'success', 'Game initializing...');
      
      // Focus iframe after load to enable keyboard controls
      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus();
          addLog('complete', '✅ Game ready', 'success', 'Click inside to activate controls');
        } catch {
          console.log('Could not auto-focus iframe');
        }
      };
    } catch (err) {
      console.error('🎮 [Render Error]', err);
      addLog('error', '❌ Failed to render game', 'error', err instanceof Error ? err.message : 'Unknown error');
    }
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
    setGenerationLogs([]);
    setGameDesign(null);
    setShowConsole(false);
  };

  const handleRefine = async (refinementPrompt: string) => {
    if (!gameDesign || !refinementPrompt.trim()) return;

    setIsRefining(true);
    setError('');
    const addLog = (step: string, message: string, type?: 'info' | 'success' | 'error' | 'warning', details?: string) => {
      setGenerationLogs(prev => [...prev, { step, message, timestamp: Date.now(), type, details }]);
    };

    try {
      addLog('refine', `✨ Refining game`, 'info', `Request: "${refinementPrompt}"`);
      addLog('api', '🌐 Calling refinement API...', 'info', 'Endpoint: /api/ai-game-refine');

      // Step 1: Refine the game design
      const refineResponse = await fetch('/api/ai-game-refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameDesign, refinementPrompt }),
      });

      if (!refineResponse.ok) {
        throw new Error('Failed to refine game design');
      }

      addLog('loading', '⏳ Processing refinement...', 'info');
      const refineData = await refineResponse.json();
      
      if (!refineData.success || !refineData.gameDesign) {
        addLog('error', '❌ Refinement failed', 'error', refineData.error || 'Invalid response');
        throw new Error(refineData.error || 'Invalid refinement response');
      }

      addLog('validate', '✅ Game design refined successfully', 'success', `Applied: ${refinementPrompt}`);
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
      addLog('code', '💻 Regenerating game code with refinements...', 'info');
      addLog('api', '🌐 Calling code generation API...', 'info', 'Endpoint: /api/ai-game-code-v2');
      const codeResponse = await fetch('/api/ai-game-code-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameDesign: refinedDesign }),
      });

      if (!codeResponse.ok) {
        addLog('error', '❌ Code generation failed', 'error', `Status: ${codeResponse.status}`);
        throw new Error('Failed to generate refined game code');
      }

      addLog('loading', '⏳ Processing refined code...', 'info');
      const codeData = await codeResponse.json();
      
      if (!codeData.success || !codeData.gameCode) {
        addLog('error', '❌ Invalid code response', 'error', codeData.error || 'Missing game code');
        throw new Error(codeData.error || 'Invalid code generation response');
      }

      const codeSizeKB = (codeData.gameCode.length / 1024).toFixed(2);
      addLog('validate', '✅ Refined code validated', 'success', `Size: ${codeSizeKB} KB`);
      addLog('complete', '🎉 Refined game ready!', 'success', 'Loading in preview...');
      setGameCode(codeData.gameCode);

      // Render refined game
      setTimeout(() => {
        renderGame(codeData.gameCode);
        addLog('complete', '✅ Refined game loaded!', 'success', 'Try it out!');
      }, 100);

    } catch (err) {
      console.error('Refinement error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      addLog('error', `❌ Refinement failed`, 'error', errorMessage);
      setError(err instanceof Error ? err.message : 'Failed to refine game');
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-20 max-w-7xl">
      <div className="mb-8 text-center">
        <div className="inline-block mb-4">
          <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full border border-purple-500/20">
            <Wand2 className="w-6 h-6 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
              AI Game Generator
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
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
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
                <div className="flex-1">
                  <div className="font-semibold text-sm flex items-center gap-2">
                    {useV2 ? '✨ V2 Enhanced Mode' : '⚡ V1 Template Mode'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {useV2 ? (
                      <>Dynamic AI generation with custom behaviors & mechanics</>
                    ) : (
                      <>Fast generation using proven game templates</>
                    )}
                  </div>
                </div>
                <Button
                  variant={useV2 ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setUseV2(!useV2)}
                  disabled={isGenerating}
                  className={cn(
                    "ml-4 min-w-[80px]",
                    useV2 ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" : ""
                  )}
                >
                  {useV2 ? '✨ V2' : '⚡ V1'}
                </Button>
              </div>

              {/* Mode Info */}
              {useV2 ? (
                <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg text-sm">
                  <div className="font-semibold text-blue-400 mb-1">✨ V2 Mode Features:</div>
                  <ul className="text-muted-foreground space-y-1 text-xs ml-4">
                    <li>• Custom enemy AI with unique behaviors</li>
                    <li>• Dynamic power-up systems</li>
                    <li>• Adaptive difficulty scaling</li>
                    <li>• Generation time: 15-25 seconds</li>
                  </ul>
                </div>
              ) : (
                <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg text-sm">
                  <div className="font-semibold text-green-400 mb-1">⚡ V1 Mode Features:</div>
                  <ul className="text-muted-foreground space-y-1 text-xs ml-4">
                    <li>• Proven game templates</li>
                    <li>• Fast generation (5-10 seconds)</li>
                    <li>• Reliable & tested mechanics</li>
                    <li>• Perfect for quick prototypes</li>
                  </ul>
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
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg text-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💡</span>
                      <div>
                        <div className="font-semibold text-blue-400 mb-1">Tip: Click inside the game to activate keyboard controls!</div>
                        <div className="text-xs text-muted-foreground">Most games use Arrow Keys or WASD for movement and Space for actions.</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border-4 border-gray-700 shadow-2xl">
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-800/50 to-transparent z-10 pointer-events-none" />
                    <iframe
                      ref={iframeRef}
                      className="w-full h-[600px]"
                      sandbox="allow-scripts allow-same-origin"
                      title="Game Preview"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-800/50 to-transparent pointer-events-none" />
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
                <div className="flex items-center justify-center h-[600px] bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-xl border-2 border-dashed border-purple-500/20">
                  <div className="text-center text-muted-foreground">
                    <div className="relative">
                      <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full" />
                      <Wand2 className="w-16 h-16 mx-auto mb-4 opacity-50 relative" />
                    </div>
                    <p className="text-lg font-medium mb-2">Your generated game will appear here</p>
                    <p className="text-sm">Enter a game description and click Generate to start</p>
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
          isGenerating={isGenerating}
          error={error}
          refinementSuggestions={refinementSuggestions}
          isPreview={isPreviewMode}
        />
      )}
    </div>
  );
}
