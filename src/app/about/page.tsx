"use client";

import { CheckCircle2, Zap, Shield, Coins, Users, Trophy, Sparkles, ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const howItWorks = [
  {
    step: 1,
    title: "Connect Your Wallet",
    description: "Link your HashPack or Blade wallet in seconds. No complex setup required.",
    icon: Users,
  },
  {
    step: 2,
    title: "Choose a Game",
    description: "Browse our collection of games. Pay a tiny entry fee in HBAR (~$0.005).",
    icon: Trophy,
  },
  {
    step: 3,
    title: "Play & Compete",
    description: "Enjoy instant gameplay with AI assistance and real-time leaderboards.",
    icon: Sparkles,
  },
  {
    step: 4,
    title: "Earn Rewards",
    description: "Win HBAR rewards instantly. No waiting, no gas fees, just pure profit.",
    icon: Coins,
  },
];

const benefits = [
  {
    title: "Lightning Fast",
    description: "3-5 second transaction finality on Hedera network",
    stat: "10-20x faster",
    icon: Zap,
  },
  {
    title: "Ultra Low Cost",
    description: "Pay ~$0.0001 per transaction instead of dollars in gas",
    stat: "100-10,000x cheaper",
    icon: Coins,
  },
  {
    title: "Carbon Negative",
    description: "Built on the world's most sustainable blockchain",
    stat: "100% green",
    icon: Leaf,
  },
  {
    title: "Secure & Fair",
    description: "Transparent smart contracts and provably fair gameplay",
    stat: "Bank-grade security",
    icon: Shield,
  },
];

const roadmap = [
  {
    quarter: "Q1 2025",
    title: "Platform Launch",
    items: [
      "Core gaming platform with 5 games",
      "Three AI agents (Game Master, Marketplace, Social)",
      "HBAR rewards system",
      "Profile NFTs and achievements",
    ],
    status: "completed",
  },
  {
    quarter: "Q2 2025",
    title: "Community & Tournaments",
    items: [
      "Tournament system with prize pools",
      "Guild/clan formation",
      "HCS-powered leaderboards",
      "Mobile app (iOS & Android)",
    ],
    status: "in-progress",
  },
  {
    quarter: "Q3 2025",
    title: "Marketplace & Economy",
    items: [
      "NFT marketplace with atomic swaps",
      "Staking and yield farming",
      "DAO governance launch",
      "10+ new games",
    ],
    status: "planned",
  },
  {
    quarter: "Q4 2025",
    title: "Metaverse Integration",
    items: [
      "VR/AR gaming experiences",
      "Cross-chain bridges",
      "Mainnet deployment",
      "Global esports partnerships",
    ],
    status: "planned",
  },
];

const team = [
  {
    role: "Core Technology",
    items: [
      "Hedera Token Service (HTS) for tokens & NFTs",
      "Hedera Consensus Service (HCS) for leaderboards",
      "Native HBAR for all payments",
      "Hedera Wallet Connect for authentication",
    ],
  },
  {
    role: "AI & Backend",
    items: [
      "OpenAI GPT-4 for agent intelligence",
      "Hedera SDK for blockchain interactions",
      "Next.js 15 for server-side rendering",
      "Prisma ORM with PostgreSQL",
    ],
  },
  {
    role: "Frontend & UX",
    items: [
      "React 18 with TypeScript",
      "TailwindCSS for styling",
      "Framer Motion for animations",
      "shadcn/ui component library",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      {/* Hero */}
      <section className="px-4 mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            About
            <br />
            <span className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] bg-clip-text text-transparent">
              RealmOS
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            The first AI-powered gaming platform on Hedera, combining instant rewards, 
            ultra-low fees, and sustainable blockchain technology.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="px-4 mb-20">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-[#98ee2c]/10 to-[#7bc922]/10 border-[#98ee2c]/30">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                We&apos;re building the future of gaming where players truly own their achievements, 
                earn real rewards instantly, and enjoy a sustainable gaming economy. By leveraging 
                Hedera&apos;s speed, low cost, and carbon-negative network, we&apos;re creating an experience 
                that&apos;s 100-10,000x better than traditional blockchain gaming.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 mb-20" id="how-it-works">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">Get started in 4 simple steps</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step) => {
              const Icon = step.icon;
              return (
                <Card
                  key={step.step}
                  className="bg-white/5 backdrop-blur-sm border-white/10 relative overflow-hidden group hover:border-[#98ee2c]/30 transition-all"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#98ee2c]/5 rounded-full blur-3xl group-hover:bg-[#98ee2c]/10 transition-all" />
                  <CardContent className="p-6 relative">
                    <div className="w-12 h-12 rounded-xl bg-[#98ee2c]/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-[#98ee2c]" />
                    </div>
                    <div className="text-4xl font-bold text-[#98ee2c]/20 mb-2">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 mb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Why Hedera?</h2>
            <p className="text-xl text-gray-400">The advantages of building on Hedera</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <Card
                  key={benefit.title}
                  className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-[#98ee2c]/30 transition-all"
                >
                  <CardContent className="p-6">
                    <Icon className="h-10 w-10 text-[#98ee2c] mb-4" />
                    <div className="text-2xl font-bold text-[#98ee2c] mb-2">
                      {benefit.stat}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="px-4 mb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Technology Stack</h2>
            <p className="text-xl text-gray-400">Built with cutting-edge technology</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {team.map((category) => (
              <Card
                key={category.role}
                className="bg-white/5 backdrop-blur-sm border-white/10"
              >
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {category.role}
                  </h3>
                  <ul className="space-y-2">
                    {category.items.map((item, index) => (
                      <li key={index} className="flex items-start text-gray-400 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-[#98ee2c] mr-2 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="px-4 mb-20" id="roadmap">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Roadmap</h2>
            <p className="text-xl text-gray-400">Our journey to revolutionize gaming</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {roadmap.map((phase) => (
              <Card
                key={phase.quarter}
                className={`bg-white/5 backdrop-blur-sm border-white/10 ${
                  phase.status === 'completed' ? 'border-green-500/30' :
                  phase.status === 'in-progress' ? 'border-[#98ee2c]/30' :
                  ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-gray-400">{phase.quarter}</div>
                      <h3 className="text-xl font-semibold text-white">
                        {phase.title}
                      </h3>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      phase.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                      phase.status === 'in-progress' ? 'bg-[#98ee2c]/10 text-[#98ee2c]' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {phase.status === 'completed' ? 'Completed' :
                       phase.status === 'in-progress' ? 'In Progress' :
                       'Planned'}
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {phase.items.map((item, index) => (
                      <li key={index} className="flex items-start text-gray-400 text-sm">
                        <CheckCircle2 className={`h-4 w-4 mr-2 mt-0.5 flex-shrink-0 ${
                          phase.status === 'completed' ? 'text-green-400' :
                          phase.status === 'in-progress' ? 'text-[#98ee2c]' :
                          'text-gray-600'
                        }`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-[#98ee2c]/10 to-[#7bc922]/10 border-[#98ee2c]/30">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Join the Revolution
              </h2>
              <p className="text-gray-400 mb-8">
                Be part of the future of gaming on Hedera
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/games">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-bold"
                  >
                    Start Playing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/agents">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-[#98ee2c]/30 text-[#98ee2c] hover:bg-[#98ee2c]/10"
                  >
                    Explore AI Agents
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
