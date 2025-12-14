'use client';

import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function OnboardingTour() {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (!hasMounted) return;

        const hasSeenTour = localStorage.getItem('realmos-tour-completed');
        if (hasSeenTour) return;

        // Slight delay to ensure DOM is ready
        const timer = setTimeout(() => {
            const driverObj = driver({
                showProgress: true,
                animate: true,
                steps: [
                    {
                        element: '#wallet-connect-btn',
                        popover: {
                            title: 'Connect Your Wallet',
                            description: 'Start here! Connect your Hedera wallet to earn rewards, save progress, and mint NFTs.',
                            side: 'bottom',
                            align: 'end'
                        }
                    },
                    {
                        element: '#global-chat-toggle',
                        popover: {
                            title: 'Global Community',
                            description: 'Chat with other players in real-time. Powered by Hedera Consensus Service.',
                            side: 'left',
                            align: 'end'
                        }
                    },
                    {
                        popover: {
                            title: 'You are Ready!',
                            description: 'Explore games, generate your own AI mini-games, and start earning.',
                        }
                    }
                ],
                onDestroyed: () => {
                    localStorage.setItem('realmos-tour-completed', 'true');
                }
            });

            driverObj.drive();
        }, 1500);

        return () => clearTimeout(timer);
    }, [hasMounted]);

    return null;
}
