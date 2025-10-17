import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ReactNode } from 'react';
import { ClientProviders } from '@/components/client-providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'HederaVerse - Agentic Gaming on Hedera',
  description: 'Play, Earn, and Own with AI-powered gaming on Hedera blockchain. NFT rewards, tournaments, and immersive experiences.',
  keywords: ['Hedera', 'Gaming', 'NFT', 'Blockchain', 'AI Agents', 'Web3', 'Play-to-Earn'],
  authors: [{ name: 'HederaVerse Team' }],
  openGraph: {
    title: 'HederaVerse - Agentic Gaming Platform',
    description: 'Next-generation gaming with AI agents and NFTs on Hedera',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
