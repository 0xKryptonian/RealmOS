import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import type { ReactNode } from 'react';
import { ClientProviders } from '@/components/client-providers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { GlobalChat } from '@/components/social/GlobalChat';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { ActivityTicker } from '@/components/activity/ActivityTicker';
import { DailyCheckIn } from '@/components/rewards/DailyCheckIn';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'RealmOS - AI-Powered Gaming on Hedera',
    template: '%s | RealmOS'
  },
  description: 'The first AI-powered gaming operating system on Hedera. Build, play, and earn with instant rewards, 7+ built-in games, and decentralized chat.',
  keywords: ['Hedera', 'Gaming', 'NFT', 'Blockchain', 'AI Agents', 'Web3', 'Play-to-Earn', 'HBAR', 'Metaverse'],
  authors: [{ name: 'RealmOS Team', url: 'https://realmos.xyz' }],
  creator: 'RealmOS',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://realmos.xyz',
    title: 'RealmOS - AI-Powered Gaming on Hedera',
    description: 'Build, play, and earn in the decentralized metaverse. Powered by Hedera.',
    siteName: 'RealmOS',
    images: [
      {
        url: 'https://realmos.xyz/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RealmOS Platform Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RealmOS - AI Gaming on Hedera',
    description: 'Build, play, and earn in the decentralized metaverse.',
    images: ['https://realmos.xyz/og-image.jpg'],
    creator: '@RealmOS_Hedera',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ClientProviders>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <GlobalChat />
          <ActivityTicker />
          <DailyCheckIn />
          <OnboardingTour />
        </ClientProviders>
      </body>
    </html>
  );
}
