"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Gamepad2, Sparkles, Trophy, Users, ShoppingBag, Wallet, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDAppConnector } from "@/components/client-providers";
// import { WalletBalance } from "@/components/wallet-balance";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "Games", href: "/games", icon: Gamepad2 },
  { name: "Tournaments", href: "/tournaments", icon: Trophy },
  { name: "AI Agents", href: "/agents", icon: Sparkles },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const dAppContext = useDAppConnector();
  const userAccountId = dAppContext?.userAccountId;
  const dAppConnector = dAppContext?.dAppConnector;
  const disconnect = dAppContext?.disconnect;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleConnect = () => {
    dAppConnector?.openModal();
  };

  const handleDisconnect = async () => {
    if (disconnect) {
      await disconnect();
    }
  };

  const formatAccountId = (accountId: string) => {
    if (accountId.length > 12) {
      return `${accountId.slice(0, 6)}...${accountId.slice(-4)}`;
    }
    return accountId;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/95 backdrop-blur-lg border-b border-gray-800"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#98ee2c] blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <Gamepad2 className="h-8 w-8 text-[#98ee2c] relative" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#98ee2c] to-[#7bc922] bg-clip-text text-transparent">
              HederaVerse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#98ee2c]/10 text-[#98ee2c]"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center space-x-4">
            {userAccountId ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-[#98ee2c]/10 border-[#98ee2c]/30 text-[#98ee2c] hover:bg-[#98ee2c]/20"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    {formatAccountId(userAccountId)}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#1a1a1a] border-gray-800">
                  <DropdownMenuLabel className="text-gray-400">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile#nfts" className="cursor-pointer">
                      My NFTs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile#stats" className="cursor-pointer">
                      Statistics
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem
                    onClick={handleDisconnect}
                    className="text-red-400 cursor-pointer"
                  >
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleConnect}
                className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-lg border-t border-gray-800">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium ${
                    isActive
                      ? "bg-[#98ee2c]/10 text-[#98ee2c]"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
          <div className="border-t border-gray-800 px-4 py-3">
            {userAccountId ? (
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Connected</div>
                <div className="text-[#98ee2c] font-mono text-sm">
                  {userAccountId}
                </div>
                <Link
                  href="/profile"
                  className="block w-full text-center px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  View Profile
                </Link>
                <button
                  onClick={() => {
                    handleDisconnect();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-center px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <Button
                onClick={() => {
                  handleConnect();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
