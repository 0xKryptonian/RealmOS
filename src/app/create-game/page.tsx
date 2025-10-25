'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, Play, Code, Download } from 'lucide-react';
import { GameSpec } from '@/types/game-spec';

export default function CreateGamePage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [gameSpec, setGameSpec] = useState<GameSpec | null>(null);
  const [gameCode, setGameCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'input' | 'spec' | 'code'>('input');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const generateGameSpec = async () => {
    if (!prompt.trim()) {
      setError('Please enter a game description');
      return;
    }

    setIsGenerating(true);
    setError('');
    setCurrentStep('input');

    try {
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
              <Textarea
                placeholder="Example: Create a space shooter with power-ups and enemies that move in waves"
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
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Game
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

      {/* Example Prompts */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Example Prompts - Try Different Game Types!</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              '🚀 Create a space shooter with enemies and power-ups',
              '🏃 Make a platformer where you collect coins and jump over obstacles',
              '🏎️ Build a racing game where you dodge obstacles and collect fuel',
              '🧩 Create a match-3 puzzle game with colorful tiles',
              '🎯 Make a breakout game where you break bricks with a ball',
              '🃏 Build a memory card matching game',
              '💰 Create an idle clicker game where you upgrade and earn resources',
              '🏰 Make a tower defense game where you place towers to stop enemies',
            ].map((example, i) => (
              <Button
                key={i}
                variant="outline"
                className="h-auto py-3 px-4 text-left justify-start whitespace-normal"
                onClick={() => setPrompt(example.substring(3))}
                disabled={isGenerating}
              >
                {example}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
