'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Coins, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

const REWARDS = [10, 20, 30, 40, 50, 100, 250];

export function DailyCheckIn() {
    const [isOpen, setIsOpen] = useState(false);
    const [claimed, setClaimed] = useState(false);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        // Check local storage for last claim
        const lastClaim = localStorage.getItem('daily_claim_date');
        const currentStreak = parseInt(localStorage.getItem('daily_streak') || '0');
        const today = new Date().toDateString();

        setStreak(currentStreak);

        if (lastClaim !== today) {
            // Show modal after a short delay
            const timer = setTimeout(() => setIsOpen(true), 2000);
            return () => clearTimeout(timer);
        } else {
            setClaimed(true);
        }
    }, []);

    const handleClaim = () => {
        const today = new Date().toDateString();
        localStorage.setItem('daily_claim_date', today);
        const newStreak = streak + 1;
        localStorage.setItem('daily_streak', newStreak.toString());

        setStreak(newStreak);
        setClaimed(true);

        // Celebrate
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        setTimeout(() => setIsOpen(false), 2500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
                    >
                        {/* Background decoration */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-[#98ee2c] to-purple-500" />

                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-[#98ee2c]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-8 h-8 text-[#98ee2c]" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Daily Login Bonus</h2>
                            <p className="text-gray-400">Keep your streak alive to earn massive HBAR rewards!</p>
                        </div>

                        <div className="grid grid-cols-7 gap-2 mb-6">
                            {REWARDS.map((amount, i) => {
                                const isToday = i === (streak % 7);
                                const isPast = i < (streak % 7);

                                return (
                                    <div key={i} className="flex flex-col items-center gap-1">
                                        <div className={`
                                            w-10 h-10 rounded-lg flex items-center justify-center border text-xs font-bold transition-all
                                            ${isToday ? 'border-[#98ee2c] bg-[#98ee2c]/20 text-[#98ee2c] scale-110 shadow-[0_0_10px_rgba(152,238,44,0.3)]' : ''}
                                            ${isPast ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' : 'border-white/5 bg-white/5 text-gray-500'}
                                        `}>
                                            {isPast ? <Check className="w-4 h-4" /> : `${amount}ℏ`}
                                        </div>
                                        <span className="text-[10px] text-gray-500">Day {i + 1}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <Button
                            onClick={handleClaim}
                            disabled={claimed}
                            className={`w-full h-12 text-lg font-bold ${claimed
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/20'
                                : 'bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black hover:brightness-110'
                                }`}
                        >
                            {claimed ? 'Claimed!' : 'Claim Reward'}
                        </Button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
