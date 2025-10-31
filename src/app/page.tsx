"use client";

import Link from "next/link";
import { ArrowRight, Zap, Shield, Coins, Sparkles, Trophy, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "3-5 second finality on Hedera. 10-20x faster than traditional blockchains.",
    stat: "3-5s",
  },
  {
    icon: Coins,
    title: "Ultra Low Cost",
    description: "Pay ~$0.0001 per transaction. 100-10,000x cheaper than EVM chains.",
    stat: "$0.0001",
  },
  {
    icon: Shield,
    title: "Carbon Negative",
    description: "Built on Hedera's sustainable network. Gaming that's good for the planet.",
    stat: "100%",
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    description: "Three specialized AI agents to enhance your gaming experience.",
    stat: "4 Agents",
  },
];

const games = [
  {
    name: "Chess",
    description: "Classic strategy with AI opponent",
    image: "/images/game/chess.jpeg",
    players: "5+",
    reward: "0.5 HBAR",
  },
  {
    name: "Tetris",
    description: "Puzzle blocks with leaderboard",
    image: "/images/game/tetris.jpg",
    players: "5+",
    reward: "0.3 HBAR",
  },
  {
    name: "Snake",
    description: "Retro arcade action",
    image: "/images/game/snake.jpg",
    players: "5+",
    reward: "0.2 HBAR",
  },
];

const stats = [
  { label: "Total Players", value: "50K+", icon: Users },
  { label: "Games Played", value: "1M+", icon: Trophy },
  { label: "HBAR Distributed", value: "100K+", icon: Coins },
  { label: "Avg. Growth", value: "+250%", icon: TrendingUp },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#98ee2c]/5 to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#98ee2c]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-[#98ee2c]/10 border border-[#98ee2c]/30 rounded-full">
              <Sparkles className="h-4 w-4 text-[#98ee2c] mr-2" />
              <span className="text-[#98ee2c] text-sm font-medium">
                Powered by Hedera Network
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Play Games.
              <br />
              <span className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] bg-clip-text text-transparent">
                Earn HBAR.
              </span>
              <br />
              Own Your Wins.
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              The first AI-powered gaming platform on Hedera. Instant rewards, 
              ultra-low fees, and true ownership of your achievements.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/games">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-bold text-lg px-8 py-6 hover:opacity-90"
                >
                  Start Playing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-700 text-white hover:bg-white/5 text-lg px-8 py-6"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4"
                  >
                    <Icon className="h-6 w-6 text-[#98ee2c] mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why RealmOS?
            </h2>
            <p className="text-xl text-gray-400">
              Built on the world&apos;s most sustainable and efficient blockchain
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-[#98ee2c]/30 transition-all group"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 relative">
                      <div className="absolute inset-0 bg-[#98ee2c]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Icon className="h-12 w-12 text-[#98ee2c] relative" />
                    </div>
                    <div className="text-3xl font-bold text-[#98ee2c] mb-2">
                      {feature.stat}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
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

      {/* Games Showcase */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-[#98ee2c]/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Featured Games
            </h2>
            <p className="text-xl text-gray-400">
              Play, compete, and earn HBAR rewards
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {games.map((game) => (
              <Card
                key={game.name}
                className="bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden hover:border-[#98ee2c]/30 transition-all group"
              >
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[#98ee2c]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Trophy className="h-16 w-16 text-[#98ee2c]/50" />
                    <Image src={game.image} alt={game.name} width={500} height={500} />
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {game.name}
                  </h3>
                  <p className="text-gray-400 mb-4">{game.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-400">
                      <Users className="h-4 w-4 mr-1" />
                      {game.players} players
                    </div>
                    <div className="flex items-center text-sm text-[#98ee2c] font-semibold">
                      <Trophy className="h-4 w-4 mr-1" />
                      {game.reward}
                    </div>
                  </div>
                  <Link href={`/games`}>
                    <Button className="w-full bg-[#98ee2c]/10 text-[#98ee2c] hover:bg-[#98ee2c]/20 border border-[#98ee2c]/30">
                      Play Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/games">
              <Button
                size="lg"
                variant="outline"
                className="border-[#98ee2c]/30 text-[#98ee2c] hover:bg-[#98ee2c]/10"
              >
                View All Games
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#98ee2c]/10 to-[#7bc922]/10 border border-[#98ee2c]/30 rounded-2xl p-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Connect your Hedera wallet and start playing in seconds
            </p>
            <Link href="/games">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-bold text-lg px-12 py-6"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
