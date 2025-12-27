'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

type EventName =
    | 'page_view'
    | 'game_start'
    | 'game_over'
    | 'wallet_connect'
    | 'chat_message'
    | 'nft_mint';

interface AnalyticsContextType {
    track: (event: EventName, properties?: Record<string, any>) => void;
    identify: (userId: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const track = (event: EventName, properties?: Record<string, any>) => {
        // In production, this would send data to PostHog/GA4
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics] ${event}`, properties);
        }
    };

    const identify = (userId: string) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics] Identified user: ${userId}`);
        }
    };

    useEffect(() => {
        track('page_view', { path: pathname });
    }, [pathname, searchParams]);

    return (
        <AnalyticsContext.Provider value={{ track, identify }}>
            {children}
        </AnalyticsContext.Provider>
    );
}

export function useAnalytics() {
    const context = useContext(AnalyticsContext);
    if (!context) {
        throw new Error('useAnalytics must be used within an AnalyticsProvider');
    }
    return context;
}
