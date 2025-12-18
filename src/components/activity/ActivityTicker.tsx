'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Trophy, Swords, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
    id: string;
    type: 'score' | 'nft' | 'tournament' | 'join';
    message: string;
    timestamp: number;
    user: string;
}

const MOCK_ACTIVITIES: ActivityItem[] = [
    { id: '1', type: 'score', message: 'scored 5240 in Tetris', timestamp: Date.now(), user: 'CryptoKing' },
    { id: '2', type: 'nft', message: 'minted a new Space Shooter', timestamp: Date.now() - 5000, user: 'Unknown' },
    { id: '3', type: 'join', message: 'joined the Global Chat', timestamp: Date.now() - 10000, user: 'HederaFan' },
    { id: '4', type: 'tournament', message: 'won the daily cup', timestamp: Date.now() - 60000, user: 'ProGamer' },
];

export function ActivityTicker() {
    const [activities, setActivities] = useState<ActivityItem[]>(MOCK_ACTIVITIES);
    const [isVisible, setIsVisible] = useState(true);
    const TOPIC_ID = process.env.NEXT_PUBLIC_ACTIVITY_TOPIC_ID;

    useEffect(() => {
        if (!TOPIC_ID) return;

        // Poll Mirror Node for real activity
        const fetchActivity = async () => {
            try {
                const response = await fetch(
                    `https://testnet.mirrornode.hedera.com/api/v1/topics/${TOPIC_ID}/messages?order=desc&limit=5`
                );
                const data = await response.json();

                const newActivities = data.messages.map((msg: any) => {
                    try {
                        const content = JSON.parse(atob(msg.message));
                        return {
                            id: msg.sequence_number.toString(),
                            type: content.type || 'score',
                            message: content.message,
                            timestamp: parseFloat(msg.consensus_timestamp) * 1000,
                            user: content.user || 'Anonymous'
                        };
                    } catch {
                        return null;
                    }
                }).filter(Boolean);

                if (newActivities.length > 0) {
                    setActivities(prev => {
                        const ids = new Set(prev.map(a => a.id));
                        const uniqueNew = newActivities.filter((a: any) => !ids.has(a.id));
                        return [...uniqueNew, ...prev].slice(0, 5);
                    });
                }
            } catch (e) {
                console.error('Failed to fetch activity', e);
            }
        };

        const interval = setInterval(fetchActivity, 5000);
        return () => clearInterval(interval);
    }, [TOPIC_ID]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 z-40 hidden md:block">
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-3 w-80 shadow-lg">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                        <Activity className="w-3 h-3 text-[#98ee2c]" />
                        <span>LIVE ACTIVITY</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#98ee2c] animate-pulse" />
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-hidden relative">
                    <AnimatePresence mode='popLayout'>
                        {activities.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-2 text-xs"
                            >
                                <div className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                                    item.type === 'score' && "bg-blue-500/20 text-blue-400",
                                    item.type === 'nft' && "bg-purple-500/20 text-purple-400",
                                    item.type === 'tournament' && "bg-yellow-500/20 text-yellow-400",
                                    item.type === 'join' && "bg-green-500/20 text-green-400",
                                )}>
                                    {item.type === 'score' && <Trophy className="w-3 h-3" />}
                                    {item.type === 'nft' && <Sparkles className="w-3 h-3" />}
                                    {item.type === 'tournament' && <Swords className="w-3 h-3" />}
                                    {item.type === 'join' && <Activity className="w-3 h-3" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="font-semibold text-gray-300 truncate">{item.user}</span>
                                    <span className="text-gray-500 truncate block">{item.message}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {/* Fade out bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
            </div>
        </div>
    );
}
