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
  title: 'RealmOS - AI-Powered Gaming on Hedera',
  description: 'Play games, earn HBAR rewards, and own your achievements. The first AI-powered gaming platform on Hedera with instant rewards and ultra-low fees.',
  keywords: ['Hedera', 'Gaming', 'NFT', 'Blockchain', 'AI Agents', 'Web3', 'Play-to-Earn', 'HBAR'],
  authors: [{ name: 'RealmOS Team' }],
  openGraph: {
    title: 'RealmOS - AI-Powered Gaming on Hedera',
    description: 'Play games, earn HBAR rewards instantly. Built on the world\'s most sustainable blockchain.',
    type: 'website',
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
