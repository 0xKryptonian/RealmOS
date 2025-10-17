"use client";

import { useState } from "react";
import { Bot, MessageSquare, Trophy, ShoppingCart, Sparkles, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const agents = [
  {
    id: "game-master",
    name: "Game Master Agent",
    icon: Trophy,
    color: "from-blue-500 to-cyan-500",
    description: "Your personal gaming companion that helps you discover games, track progress, and optimize strategies.",
    capabilities: [
      "Game recommendations based on your skill level",
      "Real-time strategy tips and hints",
      "Performance analytics and insights",
      "Achievement tracking and milestones",
      "Personalized challenges and quests",
    ],
    examples: [
      { query: "What game should I play next?", response: "Based on your chess skills, I recommend trying our new strategy puzzle game!" },
      { query: "How can I improve my Tetris score?", response: "Focus on creating T-spins and keeping your stack low. Here are 3 advanced techniques..." },
    ],
  },
  {
    id: "marketplace",
    name: "Marketplace Agent",
    icon: ShoppingCart,
    color: "from-purple-500 to-pink-500",
    description: "Smart trading assistant for buying, selling, and discovering NFTs in the HederaVerse marketplace.",
    capabilities: [
      "NFT price analysis and trends",
      "Automated buy/sell recommendations",
      "Portfolio management and tracking",
      "Rarity scoring and valuation",
      "Market alerts and notifications",
    ],
    examples: [
      { query: "What's the value of my Chess Winner NFT?", response: "Your NFT is valued at 15 HBAR based on recent sales and rarity score of 8.5/10" },
      { query: "Should I sell my achievement NFT?", response: "Market analysis suggests holding. Prices increased 25% this week." },
    ],
  },
  {
    id: "social",
    name: "Social Agent",
    icon: MessageSquare,
    color: "from-green-500 to-emerald-500",
    description: "Community manager that connects players, organizes tournaments, and facilitates social interactions.",
    capabilities: [
      "Player matchmaking and team formation",
      "Tournament organization and brackets",
      "Community event scheduling",
      "Chat moderation and support",
      "Friend recommendations and networking",
    ],
    examples: [
      { query: "Find me a chess opponent", response: "I found 3 players at your skill level online now. Would you like to challenge them?" },
      { query: "When's the next tournament?", response: "Chess Championship starts in 2 hours with 50 HBAR prize pool. Want to register?" },
    ],
  },
];

const features = [
  {
    icon: Zap,
    title: "Instant Responses",
    description: "Get answers in milliseconds powered by advanced AI models",
  },
  {
    icon: Bot,
    title: "Context-Aware",
    description: "Agents remember your preferences and gaming history",
  },
  {
    icon: Sparkles,
    title: "Always Learning",
    description: "AI improves with every interaction and community feedback",
  },
];

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      {/* Hero Section */}
      <section className="px-4 mb-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-[#98ee2c]/10 border border-[#98ee2c]/30 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-[#98ee2c] mr-2" />
            <span className="text-[#98ee2c] text-sm font-medium">
              Powered by Advanced AI
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Meet Your AI
            <br />
            <span className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] bg-clip-text text-transparent">
              Gaming Companions
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Three specialized AI agents working together to enhance your gaming experience, 
            manage your assets, and connect you with the community.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/agents/chat">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-bold"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Start Chatting
              </Button>
            </Link>
            <Link href="/about#agents">
              <Button
                size="lg"
                variant="outline"
                className="border-gray-700 text-white hover:bg-white/5"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 mb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="bg-white/5 backdrop-blur-sm border-white/10"
                >
                  <CardContent className="p-6 text-center">
                    <Icon className="h-12 w-12 text-[#98ee2c] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Agents Showcase */}
      <section className="px-4 mb-20">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="game-master" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 bg-white/5 border border-white/10 mb-8">
              {agents.map((agent) => {
                const Icon = agent.icon;
                return (
                  <TabsTrigger
                    key={agent.id}
                    value={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className="data-[state=active]:bg-[#98ee2c]/10 data-[state=active]:text-[#98ee2c]"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {agent.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {agents.map((agent) => {
              const Icon = agent.icon;
              return (
                <TabsContent key={agent.id} value={agent.id}>
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Agent Info */}
                    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                      <CardHeader>
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center mb-4`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl text-white">
                          {agent.name}
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          {agent.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <h4 className="text-white font-semibold mb-3">Capabilities:</h4>
                        <ul className="space-y-2">
                          {agent.capabilities.map((capability, index) => (
                            <li key={index} className="flex items-start text-gray-400 text-sm">
                              <ArrowRight className="h-4 w-4 text-[#98ee2c] mr-2 mt-0.5 flex-shrink-0" />
                              {capability}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Example Interactions */}
                    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                      <CardHeader>
                        <CardTitle className="text-xl text-white">
                          Example Interactions
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          See how {agent.name} can help you
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {agent.examples.map((example, index) => (
                          <div key={index} className="space-y-2">
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                              <p className="text-sm text-blue-300">
                                <span className="font-semibold">You:</span> {example.query}
                              </p>
                            </div>
                            <div className="bg-[#98ee2c]/10 border border-[#98ee2c]/30 rounded-lg p-3">
                              <p className="text-sm text-[#98ee2c]">
                                <span className="font-semibold">Agent:</span> {example.response}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        <Link href="/agents/chat">
                          <Button className="w-full bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold">
                            Try It Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-[#98ee2c]/10 to-[#7bc922]/10 border-[#98ee2c]/30">
            <CardContent className="p-12 text-center">
              <Bot className="h-16 w-16 text-[#98ee2c] mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Experience AI-Powered Gaming?
              </h2>
              <p className="text-gray-400 mb-8">
                Connect your wallet and start chatting with our AI agents
              </p>
              <Link href="/agents/chat">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-bold"
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Start Chatting Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
