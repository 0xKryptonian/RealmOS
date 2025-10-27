'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Loader2, Terminal, Sparkles, ChevronDown, ChevronUp, Clock, CheckCircle2, XCircle, AlertCircle, Zap, Code, Cpu } from 'lucide-react';
import { Badge } from './ui/badge';

export interface GenerationLog {
  step: string;
  message: string;
  timestamp: number;
  type?: 'info' | 'success' | 'error' | 'warning';
  details?: string;
}

interface GameRefinementConsoleProps {
  logs: GenerationLog[];
  onRefine: (refinementPrompt: string) => Promise<void>;
  isRefining: boolean;
  gameDesign: any;
  showConsole: boolean;
  onToggleConsole: () => void;
  isGenerating?: boolean;
  error?: string;
  refinementSuggestions?: string[];
  isPreview?: boolean;
}

export function GameRefinementConsole({
  logs,
  onRefine,
  isRefining,
  gameDesign,
  showConsole,
  onToggleConsole,
  isGenerating = false,
  error = '',
  refinementSuggestions = [],
  isPreview = false
}: GameRefinementConsoleProps) {
  const [refinementPrompt, setRefinementPrompt] = useState('');

  const handleRefine = async () => {
    if (!refinementPrompt.trim() || isRefining) return;
    await onRefine(refinementPrompt);
    setRefinementPrompt('');
  };

  // Use AI-suggested refinements for preview mode, or default quick fixes
  const quickFixes = isPreview && refinementSuggestions.length > 0
    ? refinementSuggestions
    : [
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

  const getElapsedTime = () => {
    if (logs.length === 0) return '0.00s';
    const first = logs[0].timestamp;
    const last = logs[logs.length - 1].timestamp;
    return ((last - first) / 1000).toFixed(2) + 's';
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
      refine: '✨',
      loading: '⏳',
      api: '🌐',
      code: '💻'
    };
    return icons[step] || '📝';
  };

  const getLogTypeColor = (type?: string) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  const getLogTypeIcon = (type?: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-3 h-3" />;
      case 'error': return <XCircle className="w-3 h-3" />;
      case 'warning': return <AlertCircle className="w-3 h-3" />;
      default: return <Zap className="w-3 h-3" />;
    }
  };

  const getStatusBadge = () => {
    if (isGenerating || isRefining) {
      return <Badge variant="default" className="animate-pulse"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
    }
    if (error) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
    }
    if (logs.length > 0 && logs[logs.length - 1].step === 'complete') {
      return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Complete</Badge>;
    }
    return <Badge variant="outline">Ready</Badge>;
  };

  return (
    <Card className="mt-6 border-2">
      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={onToggleConsole}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-purple-500" />
            <div>
              <CardTitle className="flex items-center gap-2">
                Generation Console & Refinement
                {getStatusBadge()}
              </CardTitle>
              <CardDescription className="mt-1">
                {logs.length > 0 && `${logs.length} events • ${getElapsedTime()} elapsed`}
                {logs.length === 0 && 'View generation process and refine your game with AI'}
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            {showConsole ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      {showConsole && (
        <CardContent className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-500/10 border-2 border-red-500/50 rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-red-400 mb-1">Generation Error</div>
                  <div className="text-sm text-red-300">{error}</div>
                  <div className="mt-2 text-xs text-red-400/70">
                    Check the console logs below for more details or try regenerating with a different prompt.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Generation Logs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="w-4 h-4 text-blue-500" />
                Generation Timeline
                {logs.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {logs.length} events
                  </Badge>
                )}
              </div>
              {logs.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  Total: {getElapsedTime()}
                </div>
              )}
            </div>
            
            <div className="bg-gradient-to-br from-gray-950 to-black rounded-lg p-4 font-mono text-xs max-h-[400px] overflow-y-auto border-2 border-gray-800 shadow-inner">
              {logs.length === 0 ? (
                <div className="text-center py-8">
                  <Terminal className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                  <div className="text-gray-500">No logs yet. Generate a game to see the process.</div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {logs.map((log, i) => (
                    <div key={i} className="group hover:bg-white/5 rounded px-2 py-1.5 transition-colors">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600 text-[10px] font-medium min-w-[90px] flex-shrink-0">
                          [{formatTimestamp(log.timestamp)}]
                        </span>
                        <span className="flex-shrink-0">{getStepIcon(log.step)}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getLogTypeIcon(log.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`${getLogTypeColor(log.type)} break-words`}>
                            {log.message}
                          </span>
                          {log.details && (
                            <div className="text-gray-500 text-[10px] mt-1 pl-4 border-l-2 border-gray-800">
                              {log.details}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
