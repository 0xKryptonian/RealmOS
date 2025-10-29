"use client";

import Link from "next/link";
import { Gamepad2, Twitter, Github, MessageCircle, Mail, ExternalLink } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Games", href: "/games" },
    { name: "AI Agents", href: "/agents" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Marketplace", href: "/marketplace" },
  ],
  resources: [
    { name: "Documentation", href: "/docs" },
    { name: "About", href: "/about" },
    { name: "How It Works", href: "/about#how-it-works" },
    { name: "Roadmap", href: "/about#roadmap" },
  ],
  hedera: [
    { name: "Hedera Network", href: "https://hedera.com", external: true },
    { name: "HashScan Explorer", href: "https://hashscan.io/testnet", external: true },
    { name: "Hedera Portal", href: "https://portal.hedera.com", external: true },
    { name: "HTS Documentation", href: "https://docs.hedera.com/hedera/sdks-and-apis/sdks/token-service", external: true },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
};

const socialLinks = [
  { name: "Twitter", href: "https://twitter.com/hederaverse", icon: Twitter },
  { name: "Discord", href: "https://discord.gg/hederaverse", icon: MessageCircle },
  { name: "GitHub", href: "https://github.com/hederaverse", icon: Github },
  { name: "Email", href: "mailto:hello@hederaverse.io", icon: Mail },
];

export function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 group mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-[#98ee2c] blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <Gamepad2 className="h-8 w-8 text-[#98ee2c] relative" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#98ee2c] to-[#7bc922] bg-clip-text text-transparent">
                RealmOS
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-4 max-w-sm">
              The first AI-powered gaming platform on Hedera. Play games, earn HBAR rewards, 
              and own your achievements with NFTs. Built for speed, sustainability, and fairness.
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#98ee2c] transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#98ee2c] text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#98ee2c] text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hedera */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hedera</h3>
            <ul className="space-y-2">
              {footerLinks.hedera.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#98ee2c] text-sm transition-colors flex items-center gap-1"
                  >
                    {link.name}
                    {link.external && <ExternalLink className="h-3 w-3" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} RealmOS. Built on{" "}
              <a
                href="https://hedera.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#98ee2c] hover:underline"
              >
                Hedera
              </a>
              {" "}with ❤️
            </div>
            <div className="flex items-center space-x-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-gray-400 hover:text-[#98ee2c] text-sm transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Hackathon Badge */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#98ee2c]/10 to-[#7bc922]/10 border border-[#98ee2c]/30 rounded-full">
              <span className="text-[#98ee2c] text-sm font-medium">
                🏆 Built for Hedera Hackathon 2025
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
