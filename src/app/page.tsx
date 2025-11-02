"use client";

import Link from "next/link";
import { 
  ArrowRight, Zap, Shield, Coins, Sparkles, Users,
  Gamepad2, Bot, Swords, ShoppingBag, MessageCircle, BarChart3,
  Rocket, DollarSign, Globe, CheckCircle2, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

const coreFeatures = [
  {
    icon: Bot,
    title: "AI Game Generator",
    description: "Create playable games in 60 seconds from text prompts. 9 templates including Shooter, Platformer, Puzzle, Racing & more.",
    stat: "60s",
    link: "/agents/minigame",
    highlight: "First on Hedera"
  },
  {
    icon: Gamepad2,
    title: "7 Built-in Games",
    description: "Chess, Sudoku, Tetris, Wordle, Crossword, Snake & Ladder - all with blockchain rewards.",
    stat: "7 Games",
    link: "/games",
    highlight: "Play Now"
  },
  {
    icon: DollarSign,
    title: "Play-to-Earn",
    description: "Earn REALM tokens for every action: high scores, daily logins, achievements, watching streams.",
    stat: "Every Action",
    link: "/games",
    highlight: "Start Earning"
  },
  {
    icon: Swords,
    title: "Esports Tournaments",
    description: "5 tournament formats with automated brackets, prize escrow, and instant HBAR/REALM distribution.",
    stat: "5 Formats",
    link: "/tournaments",
    highlight: "Compete"
  },
  {
    icon: ShoppingBag,
    title: "NFT Marketplace",
    description: "Trade Profile NFTs, Game Assets, and Achievement Badges. Fixed price or auction listings.",
    stat: "3 Collections",
    link: "/marketplace",
    highlight: "Browse"
  },
  {
    icon: MessageCircle,
    title: "Social Gaming",
    description: "Join guilds with multi-sig treasury, add friends, compete in co-op challenges, and chat.",
    stat: "Guilds & Friends",
    link: "/social",
    highlight: "Connect"
  },
  {
    icon: BarChart3,
    title: "HCS Leaderboards",
    description: "Immutable rankings on Hedera Consensus Service. Tamper-proof scores with consensus timestamps.",
    stat: "Immutable",
    link: "/leaderboard",
    highlight: "View Rankings"
  },
  {
    icon: Rocket,
    title: "Live Streaming",
    description: "Decentralized Watch-to-earn with Livepeer integration. Earn rewards watching tournaments and streams.Games get users, gamers get rewards.",
    stat: "6 Streams",
    link: "/livestreams",
    highlight: "Watch & Earn"
  },
];

const hederaAdvantages = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "3-5 second finality. Instant rewards and seamless gameplay.",
    stat: "3-5s",
  },
  {
    icon: Coins,
    title: "Ultra Low Cost",
    description: "$0.0001 per transaction. 99.999% cheaper than Ethereum.",
    stat: "$0.0001",
  },
  {
    icon: Shield,
    title: "Carbon Negative",
    description: "Sustainable gaming on Hedera's eco-friendly network.",
    stat: "100%",
  },
  {
    icon: Globe,
    title: "Hedera Native",
    description: "HTS tokens, HCS consensus, HSCS contracts, HFS storage.",
    stat: "All Services",
  },
];

const games = [
  {
    name: "Chess",
    description: "Strategic gameplay with Stockfish AI & ELO rankings",
    image: "/images/game/chess.jpeg",
    players: "5+",
    reward: "1-20 REALM",
  },
  {
    name: "Tetris",
    description: "Classic puzzle with combos and high score challenges",
    image: "/images/game/tetris.jpg",
    players: "5+",
    reward: "1-20 REALM",
  },
  {
    name: "Snake",
    description: "Retro arcade action with multiplayer tournaments",
    image: "/images/game/snake.jpg",
    players: "5+",
    reward: "1-20 REALM",
  },
];

const ecosystemLayers = [
  {
    title: "AI Generation",
    description: "9 game templates powered by GPT-4 and Hedera Agent Kit",
    icon: Bot,
    features: ["60-second creation", "Phaser.js engine", "NFT minting", "Unlimited games"]
  },
  {
    title: "Esports Infrastructure",
    description: "Complete tournament system with automated management",
    icon: Swords,
    features: ["5 tournament formats", "Smart contract escrow", "Live streaming", "Instant payouts"]
  },
  {
    title: "NFT Economy",
    description: "3 collections with marketplace and royalties",
    icon: ShoppingBag,
    features: ["Profile NFTs", "Game assets", "Achievement badges", "Dual listing"]
  },
  {
    title: "Social Layer",
    description: "Guilds, friends, and community features",
    icon: MessageCircle,
    features: ["Guild treasury", "Co-op missions", "Friend network", "Activity feed"]
  },
];

// const stats = [
//   { label: "Game Templates", value: "9", icon: Bot },
//   { label: "Built-in Games", value: "7", icon: Gamepad2 },
//   { label: "NFT Collections", value: "3", icon: ShoppingBag },
//   { label: "AI Agents", value: "3", icon: Sparkles },
// ];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-48 pb-28 px-4">
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
              The world&apos;s first <span className="text-[#98ee2c] font-semibold">AI-powered gaming operating system</span>. 
              Generate games in 60 seconds, earn real tokens, compete in esports, trade NFTs, and build communities—all on Hedera.
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
              <Link href="/agents/minigame">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#98ee2c]/30 text-[#98ee2c] hover:bg-[#98ee2c]/10 text-lg px-8 py-6"
                >
                  <Bot className="mr-2 h-5 w-5" />
                  Generate Game with AI
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-[#98ee2c]/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-[#98ee2c]/10 border border-[#98ee2c]/30 rounded-full mb-4">
              <Sparkles className="h-4 w-4 text-[#98ee2c] mr-2" />
              <span className="text-[#98ee2c] text-sm font-medium">Complete Gaming Ecosystem</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything You Need to <span className="text-[#98ee2c]">Create, Play & Earn</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              RealmOS combines AI generation, play-to-earn, esports, NFTs, and social gaming into one unified platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link href={feature.link} key={feature.title}>
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-[#98ee2c]/50 transition-all group cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="mb-4 relative">
                        <div className="absolute inset-0 bg-[#98ee2c]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Icon className="h-12 w-12 text-[#98ee2c] relative" />
                      </div>
                      <div className="inline-block px-3 py-1 bg-[#98ee2c]/20 text-[#98ee2c] text-xs font-bold rounded-full mb-3">
                        {feature.highlight}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3">
                        {feature.description}
                      </p>
                      <div className="text-2xl font-bold text-[#98ee2c]">
                        {feature.stat}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hedera Advantages Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Powered by <span className="text-[#98ee2c]">Hedera</span>
            </h2>
            <p className="text-xl text-gray-400">
              Built on the world&apos;s most sustainable and efficient blockchain
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hederaAdvantages.map((feature) => {
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

      {/* Ecosystem Layers Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              7-Layer Gaming <span className="text-[#98ee2c]">Operating System</span>
            </h2>
            <p className="text-xl text-gray-400">
              Not just games—a complete infrastructure for the future of gaming
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {ecosystemLayers.map((layer, index) => {
              const Icon = layer.icon;
              return (
                <Card
                  key={layer.title}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border-white/20 hover:border-[#98ee2c]/50 transition-all group"
                >
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#98ee2c]/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Icon className="h-14 w-14 text-[#98ee2c] relative" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[#98ee2c]/60 text-sm font-bold mb-1">
                          LAYER {index + 1}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {layer.title}
                        </h3>
                        <p className="text-gray-400">
                          {layer.description}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-6">
                      {layer.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-center gap-2 text-sm text-gray-300"
                        >
                          <CheckCircle2 className="h-4 w-4 text-[#98ee2c]" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Games Showcase */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              7 Built-in Games + <span className="text-[#98ee2c]">Unlimited AI-Generated</span>
            </h2>
            <p className="text-xl text-gray-400">
              Play professionally designed games or create your own in 60 seconds
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
                    <Image src={game.image} alt={game.name} width={500} height={500} className="object-cover w-full h-full" />
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
                      <Coins className="h-4 w-4 mr-1" />
                      {game.reward}
                    </div>
                  </div>
                  <Link href="/games">
                    <Button className="w-full bg-[#98ee2c]/10 text-[#98ee2c] hover:bg-[#98ee2c]/20 border border-[#98ee2c]/30">
                      Play Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/games">
              <Button
                size="lg"
                variant="outline"
                className="border-[#98ee2c]/30 text-[#98ee2c] hover:bg-[#98ee2c]/10"
              >
                View All 7 Games
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/agents/minigame">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-bold"
              >
                <Bot className="mr-2 h-5 w-5" />
                Generate Your Own Game
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Competitive Advantage Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#98ee2c]/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why RealmOS Wins
            </h2>
            <p className="text-xl text-gray-400">
              99.999% cost savings vs Ethereum. Complete ecosystem vs single features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="text-red-400 font-bold text-lg mb-2">Ethereum</div>
                  <div className="text-4xl font-bold text-white">$80,000</div>
                  <div className="text-gray-400 text-sm">for 1000 operations</div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Mint NFT</span>
                    <span className="text-red-400 font-bold">$50</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Submit Score</span>
                    <span className="text-red-400 font-bold">$10</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Transfer Token</span>
                    <span className="text-red-400 font-bold">$20</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="text-purple-400 font-bold text-lg mb-2">Polygon</div>
                  <div className="text-4xl font-bold text-white">$170</div>
                  <div className="text-gray-400 text-sm">for 1000 operations</div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Mint NFT</span>
                    <span className="text-purple-400 font-bold">$0.10</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Submit Score</span>
                    <span className="text-purple-400 font-bold">$0.02</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Transfer Token</span>
                    <span className="text-purple-400 font-bold">$0.05</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#98ee2c]/20 to-[#98ee2c]/10 border-[#98ee2c]/50 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Star className="h-6 w-6 text-[#98ee2c] fill-[#98ee2c]" />
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="text-[#98ee2c] font-bold text-lg mb-2">Hedera (RealmOS)</div>
                  <div className="text-4xl font-bold text-white">$1.10</div>
                  <div className="text-gray-400 text-sm">for 1000 operations</div>
                  <div className="inline-block mt-2 px-3 py-1 bg-[#98ee2c]/20 text-[#98ee2c] text-xs font-bold rounded-full">
                    99.999% SAVINGS
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Mint NFT</span>
                    <span className="text-[#98ee2c] font-bold">$0.001</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Submit Score</span>
                    <span className="text-[#98ee2c] font-bold">$0.0001</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Transfer Token</span>
                    <span className="text-[#98ee2c] font-bold">$0.001</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-[#98ee2c]/10 to-[#7bc922]/10 border border-[#98ee2c]/30 rounded-2xl p-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#98ee2c]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Join the Future of Gaming
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  Connect your Hedera wallet and experience the world&apos;s first AI-powered gaming operating system
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#98ee2c]/20 rounded-full mb-4">
                    <Bot className="h-8 w-8 text-[#98ee2c]" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Create Games</h3>
                  <p className="text-gray-400 text-sm">Generate playable games in 60 seconds with AI</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#98ee2c]/20 rounded-full mb-4">
                    <Gamepad2 className="h-8 w-8 text-[#98ee2c]" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Play & Earn</h3>
                  <p className="text-gray-400 text-sm">Earn REALM tokens for every action you take</p>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#98ee2c]/20 rounded-full mb-4">
                    <Swords className="h-8 w-8 text-[#98ee2c]" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Compete</h3>
                  <p className="text-gray-400 text-sm">Join tournaments with automated prize distribution</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/games">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-bold text-lg px-12 py-6 hover:opacity-90"
                  >
                    Start Playing Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/agents/minigame">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-[#98ee2c]/30 text-[#98ee2c] hover:bg-[#98ee2c]/10 text-lg px-12 py-6"
                  >
                    <Bot className="mr-2 h-5 w-5" />
                    Generate Game
                  </Button>
                </Link>
              </div>

              <div className="mt-8 text-center text-sm text-gray-400">
                <p>Supports HashPack, Blade Wallet, and WalletConnect • Built on Hedera Testnet</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
