"use client";

import { useState } from "react";
import { Trophy, Medal, Crown, TrendingUp, Gamepad2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";

// Mock data - replace with real HCS data
const leaderboardData = {
  allTime: [
    { rank: 1, player: "0.0.5910536", games: 1250, wins: 892, winRate: 71.4, earnings: "1,250.5", avatar: "👑" },
    { rank: 2, player: "0.0.4821093", games: 1100, wins: 770, winRate: 70.0, earnings: "980.2", avatar: "🏆" },
    { rank: 3, player: "0.0.3912847", games: 980, wins: 647, winRate: 66.0, earnings: "850.7", avatar: "🥇" },
    { rank: 4, player: "0.0.2847561", games: 875, wins: 560, winRate: 64.0, earnings: "720.3", avatar: "🥈" },
    { rank: 5, player: "0.0.1928374", games: 820, wins: 525, winRate: 64.0, earnings: "680.9", avatar: "🥉" },
    { rank: 6, player: "0.0.8374625", games: 750, wins: 480, winRate: 64.0, earnings: "620.4", avatar: "⭐" },
    { rank: 7, player: "0.0.7263849", games: 690, wins: 435, winRate: 63.0, earnings: "580.2", avatar: "⭐" },
    { rank: 8, player: "0.0.6192837", games: 650, wins: 410, winRate: 63.0, earnings: "540.8", avatar: "⭐" },
    { rank: 9, player: "0.0.5283746", games: 620, wins: 385, winRate: 62.0, earnings: "510.5", avatar: "⭐" },
    { rank: 10, player: "0.0.4192837", games: 580, wins: 355, winRate: 61.0, earnings: "480.3", avatar: "⭐" },
  ],
  weekly: [
    { rank: 1, player: "0.0.3912847", games: 85, wins: 62, winRate: 72.9, earnings: "95.5", avatar: "🔥" },
    { rank: 2, player: "0.0.5910536", games: 78, wins: 55, winRate: 70.5, earnings: "88.2", avatar: "🔥" },
    { rank: 3, player: "0.0.4821093", games: 72, wins: 50, winRate: 69.4, earnings: "82.7", avatar: "🔥" },
    { rank: 4, player: "0.0.2847561", games: 68, wins: 46, winRate: 67.6, earnings: "75.3", avatar: "⚡" },
    { rank: 5, player: "0.0.1928374", games: 65, wins: 43, winRate: 66.2, earnings: "70.9", avatar: "⚡" },
  ],
};

const gameStats = [
  { game: "Chess", players: "15,234", avgReward: "0.5 HBAR", topPlayer: "0.0.5910536" },
  { game: "Tetris", players: "12,891", avgReward: "0.3 HBAR", topPlayer: "0.0.3912847" },
  { game: "Snake", players: "10,567", avgReward: "0.2 HBAR", topPlayer: "0.0.4821093" },
  { game: "Puzzle", players: "8,234", avgReward: "0.25 HBAR", topPlayer: "0.0.2847561" },
];

export default function LeaderboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"allTime" | "weekly">("allTime");

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-orange-600" />;
      default:
        return <span className="text-gray-500 font-bold">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30";
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30";
      case 3:
        return "bg-gradient-to-r from-orange-600/20 to-orange-700/20 border-orange-600/30";
      default:
        return "bg-white/5 border-white/10";
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      {/* Hero */}
      <section className="px-4 mb-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-[#98ee2c]/10 border border-[#98ee2c]/30 rounded-full mb-6">
            <Trophy className="h-4 w-4 text-[#98ee2c] mr-2" />
            <span className="text-[#98ee2c] text-sm font-medium">
              Powered by Hedera Consensus Service
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] bg-clip-text text-transparent">
              Leaderboard
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Compete with players worldwide. Climb the ranks and earn HBAR rewards.
          </p>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="px-4 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 text-[#98ee2c] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-sm text-gray-400">Total Players</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4 text-center">
                <Gamepad2 className="h-8 w-8 text-[#98ee2c] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">1M+</div>
                <div className="text-sm text-gray-400">Games Played</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-[#98ee2c] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">100K+</div>
                <div className="text-sm text-gray-400">HBAR Distributed</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 text-[#98ee2c] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">Daily</div>
                <div className="text-sm text-gray-400">Updates</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Leaderboard */}
      <section className="px-4 mb-12">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="allTime" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 mb-8">
              <TabsTrigger
                value="allTime"
                onClick={() => setSelectedPeriod("allTime")}
                className="data-[state=active]:bg-[#98ee2c]/10 data-[state=active]:text-[#98ee2c]"
              >
                All Time
              </TabsTrigger>
              <TabsTrigger
                value="weekly"
                onClick={() => setSelectedPeriod("weekly")}
                className="data-[state=active]:bg-[#98ee2c]/10 data-[state=active]:text-[#98ee2c]"
              >
                This Week
              </TabsTrigger>
            </TabsList>

            <TabsContent value="allTime">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Top Players - All Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboardData.allTime.map((player) => (
                      <div
                        key={player.rank}
                        className={`flex items-center justify-between p-4 rounded-lg border ${getRankBg(player.rank)} transition-all hover:scale-[1.02]`}
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-12 flex items-center justify-center">
                            {getRankIcon(player.rank)}
                          </div>
                          <div className="text-3xl">{player.avatar}</div>
                          <div className="flex-1">
                            <div className="font-mono text-white font-semibold">
                              {player.player}
                            </div>
                            <div className="text-sm text-gray-400">
                              {player.games} games • {player.wins} wins
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className="text-sm text-gray-400">Win Rate</div>
                            <div className="text-lg font-bold text-[#98ee2c]">
                              {player.winRate}%
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">Earnings</div>
                            <div className="text-lg font-bold text-white">
                              {player.earnings} HBAR
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weekly">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Top Players - This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboardData.weekly.map((player) => (
                      <div
                        key={player.rank}
                        className={`flex items-center justify-between p-4 rounded-lg border ${getRankBg(player.rank)} transition-all hover:scale-[1.02]`}
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-12 flex items-center justify-center">
                            {getRankIcon(player.rank)}
                          </div>
                          <div className="text-3xl">{player.avatar}</div>
                          <div className="flex-1">
                            <div className="font-mono text-white font-semibold">
                              {player.player}
                            </div>
                            <div className="text-sm text-gray-400">
                              {player.games} games • {player.wins} wins
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className="text-sm text-gray-400">Win Rate</div>
                            <div className="text-lg font-bold text-[#98ee2c]">
                              {player.winRate}%
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">Earnings</div>
                            <div className="text-lg font-bold text-white">
                              {player.earnings} HBAR
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Game Stats */}
      <section className="px-4">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Game Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {gameStats.map((game) => (
                  <div
                    key={game.game}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-[#98ee2c]/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{game.game}</h3>
                      <Gamepad2 className="h-5 w-5 text-[#98ee2c]" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Players:</span>
                        <span className="text-white font-semibold">{game.players}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg Reward:</span>
                        <span className="text-[#98ee2c] font-semibold">{game.avgReward}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Top Player:</span>
                        <span className="text-white font-mono text-xs">{game.topPlayer}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
