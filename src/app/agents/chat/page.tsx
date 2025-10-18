'use client';

import { ChatMessage } from '@/shared/types';
import { useState } from 'react';
import { useHandleChat } from '@/lib/handle-chat';
import { ChatInput } from '@/components/chat-input';
import { useDAppConnector } from '@/components/client-providers';
import { Chat } from '@/components/chat';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Trophy, ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const agents = [
  {
    id: 'game-master',
    name: 'Game Master',
    icon: Trophy,
    color: 'from-blue-500 to-cyan-500',
    description: 'Your personal gaming companion',
    systemPrompt: `You are the Game Master AI agent for HederaVerse. Your role is to help players with:
- Game strategies and tips for Chess, Sudoku, Tetris, Candy Saga, Crypto Crossword, Wordle (Wodle), and Snake & Ladder
- Understanding game rules and mechanics
- Maximizing scores and earning NFT rewards
- Tracking progress and achievements
- Recommending games based on skill level and preferences

For Wordle (Wodle), remember: 6 attempts to guess a 5-letter word, with Green (correct position), Yellow (wrong position), and Gray (not in word) feedback. Suggest starting with common vowels and consonants.

Be encouraging, strategic, and help players improve their gaming skills.`,
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    icon: ShoppingCart,
    color: 'from-purple-500 to-pink-500',
    description: 'Smart trading assistant',
    systemPrompt: `You are the Marketplace AI agent for HederaVerse. Your expertise includes:
- NFT trading strategies and price analysis
- Evaluating game NFTs, achievement badges, and profile items
- Portfolio management and tracking
- Market trends and rarity scoring
- Buy/sell recommendations based on market conditions
- Understanding HBAR token economics

Help users make informed decisions about their NFT investments and maximize the value of their gaming achievements on the Hedera network.`,
  },
  {
    id: 'social',
    name: 'Social',
    icon: MessageSquare,
    color: 'from-green-500 to-emerald-500',
    description: 'Community manager',
    systemPrompt: `You are the Social AI agent for HederaVerse. Your responsibilities include:
- Connecting players with similar interests and skill levels
- Organizing and promoting tournaments with HBAR prize pools
- Facilitating team formation and multiplayer matches
- Scheduling community events and challenges
- Providing tournament information (brackets, standings, prize pools)
- Helping players find opponents for specific games
- Promoting social features and community engagement

Be friendly, inclusive, and help build a vibrant gaming community on HederaVerse.`,
  },
];

export default function AgentsChatPage() {
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      type: 'ai',
      content: `Hello! I'm the ${selectedAgent.name} agent. ${selectedAgent.description}. How can I help you today?`,
    },
  ]);
  const [prompt, setPrompt] = useState('');
  const { mutateAsync, isPending } = useHandleChat();

  const dAppContext = useDAppConnector();
  const dAppConnector = dAppContext?.dAppConnector;

  const handleAgentChange = (agent: typeof agents[0]) => {
    setSelectedAgent(agent);
    setChatHistory([
      {
        type: 'ai',
        content: `Hello! I'm the ${agent.name} agent. ${agent.description}. How can I help you today?`,
      },
    ]);
  };

  async function handleUserMessage() {
    if (!dAppConnector?.signers?.[0]) {
      console.error('No wallet connected');
      setChatHistory((v) => [
        ...v,
        {
          type: 'ai',
          content: '⚠️ Please connect your wallet to use the agent chat feature.',
        },
      ]);
      return;
    }

    const currentPrompt = prompt;
    setPrompt('');

    setChatHistory((v) => [
      ...v,
      {
        type: 'human',
        content: currentPrompt,
      },
    ]);

    try {
      const agentResponse = await mutateAsync({
        userAccountId: dAppConnector.signers[0].getAccountId().toString(),
        input: `${selectedAgent.systemPrompt}\n\nUser: ${currentPrompt}`,
        history: chatHistory,
      });

      setChatHistory((v) => [
        ...v,
        {
          type: 'ai',
          content: agentResponse.message,
        },
      ]);

      if (agentResponse.transactionBytes) {
        const result = await dAppConnector.signAndExecuteTransaction({
          signerAccountId: dAppConnector.signers[0].getAccountId().toString(),
          transactionList: agentResponse.transactionBytes,
        });
        const transactionId = 'transactionId' in result ? result.transactionId : null;

        setChatHistory((v) => [
          ...v,
          {
            type: 'ai',
            content: `✅ Transaction signed and executed successfully!\n\nTransaction ID: ${transactionId}`,
          },
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setChatHistory((v) => [
        ...v,
        {
          type: 'ai',
          content: '❌ Sorry, I encountered an error processing your request. Please try again.',
        },
      ]);
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-16 flex flex-col gap-6">
        {/* Header */}
        <div>
          <Link href="/agents">
            <Button variant="ghost" className="text-gray-400 hover:text-white mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Agents
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-1">AI Agent Chat</h1>
          <p className="text-gray-400 text-sm">
            Select an agent and start chatting to get personalized assistance
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-4">
          {/* Agent Selection Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 sticky top-24">
              <CardHeader>
                <CardTitle className="text-white text-lg">Select Agent</CardTitle>
                <CardDescription className="text-gray-400 text-sm">
                  Choose your AI assistant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {agents.map((agent) => {
                  const Icon = agent.icon;
                  const isSelected = selectedAgent.id === agent.id;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => handleAgentChange(agent)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-[#98ee2c]/20 border-2 border-[#98ee2c]'
                          : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-semibold text-sm truncate">
                            {agent.name}
                          </div>
                          <div className="text-gray-400 text-xs truncate">
                            {agent.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 min-h-[70vh] flex flex-col">
              <CardHeader className="border-b border-white/10 flex-none py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedAgent.color} flex items-center justify-center flex-shrink-0`}
                  >
                    {(() => {
                      const Icon = selectedAgent.icon;
                      return <Icon className="h-5 w-5 text-white" />;
                    })()}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-white text-lg">
                      {selectedAgent.name} Agent
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-sm truncate">
                      {selectedAgent.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0 min-h-[0]">
                <div className="flex-1 min-h-0">
                  <Chat chatHistory={chatHistory} isLoading={isPending} />
                </div>

                <div className="flex-none p-4 border-t border-white/10 bg-zinc-900/50">
                  <ChatInput
                    handleUserMessage={handleUserMessage}
                    prompt={prompt}
                    setPrompt={setPrompt}
                    isPending={isPending}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
