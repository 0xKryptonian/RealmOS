'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Terminal, Sparkles, ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface GenerationLog {
  step: string;
  message: string;
  timestamp: number;
}

interface GameRefinementConsoleProps {
  logs: GenerationLog[];
  onRefine: (refinementPrompt: string) => Promise<void>;
  isRefining: boolean;
  gameDesign: any;
  showConsole: boolean;
  onToggleConsole: () => void;
}

export function GameRefinementConsole({
  logs,
  onRefine,
  isRefining,
  gameDesign,
  showConsole,
  onToggleConsole
}: GameRefinementConsoleProps) {
  const [refinementPrompt, setRefinementPrompt] = useState('');

  const handleRefine = async () => {
    if (!refinementPrompt.trim() || isRefining) return;
    await onRefine(refinementPrompt);
    setRefinementPrompt('');
  };

  const quickFixes = [
    'Make enemies move faster',
    'Add more power-ups',
    'Increase player health',
    'Make game easier',
    'Add boss fight',
    'Change color scheme to neon'
  ];

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  const getStepIcon = (step: string) => {
    const icons: Record<string, string> = {
      init: '🚀',
      design: '🤖',
      parse: '🔍',
      validate: '✅',
      generate: '⚙️',
      complete: '🎉',
      error: '❌',
      refine: '✨'
    };
    return icons[step] || '📝';
  };

  return (
    <Card className="mt-6">
      <CardHeader className="cursor-pointer" onClick={onToggleConsole}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            <CardTitle>Generation Console & Refinement</CardTitle>
          </div>
          <Button variant="ghost" size="sm">
            {showConsole ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
        <CardDescription>
          View generation process and refine your game with AI
        </CardDescription>
      </CardHeader>

      {showConsole && (
        <CardContent className="space-y-4">
          {/* Generation Logs */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="w-4 h-4" />
              Generation Timeline
            </div>
            <div className="bg-black/90 rounded-lg p-4 font-mono text-sm max-h-[300px] overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet. Generate a game to see the process.</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="mb-2 flex items-start gap-2">
                    <span className="text-gray-500">[{formatTimestamp(log.timestamp)}]</span>
                    <span>{getStepIcon(log.step)}</span>
                    <span className="text-green-400">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Refinement Interface - Only show if game is generated */}
          {gameDesign && (
            <>
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Sparkles className="w-4 h-4" />
                  Refine Your Game
                </div>

                {/* Quick Fix Buttons */}
                <div className="mb-3">
                  <div className="text-xs text-muted-foreground mb-2">Quick Fixes:</div>
                  <div className="flex flex-wrap gap-2">
                    {quickFixes.map((fix, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => setRefinementPrompt(fix)}
                        disabled={isRefining}
                        className="text-xs"
                      >
                        {fix}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Refinement Input */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Describe what you want to change... (e.g., 'Make enemies move in zigzag patterns' or 'Add a shield power-up that lasts 10 seconds')"
                    value={refinementPrompt}
                    onChange={(e) => setRefinementPrompt(e.target.value)}
                    className="min-h-[80px] resize-none"
                    disabled={isRefining}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRefine}
                      disabled={isRefining || !refinementPrompt.trim()}
                      className="flex-1"
                    >
                      {isRefining ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Refining...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Refine Game
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md text-sm text-blue-400">
                  <strong>💡 Tip:</strong> Be specific about what you want to change. 
                  The AI will modify the game design and regenerate the code.
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
