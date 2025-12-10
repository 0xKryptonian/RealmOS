'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatMessage {
    sequenceNumber: number;
    consensusTimestamp: string;
    message: string;
    sender: string;
    time: number;
}

export function GlobalChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [username, setUsername] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const TOPIC_ID = process.env.NEXT_PUBLIC_GLOBAL_CHAT_TOPIC_ID;

    // Generate random username if not set (or use wallet in future)
    useEffect(() => {
        if (!username) {
            const randomId = Math.floor(Math.random() * 10000);
            setUsername(`Guest-${randomId}`);
        }
    }, [username]);

    // Poll for messages
    useEffect(() => {
        if (!isOpen || !TOPIC_ID) return;

        const fetchMessages = async () => {
            try {
                const response = await fetch(
                    `https://testnet.mirrornode.hedera.com/api/v1/topics/${TOPIC_ID}/messages?order=desc&limit=20`
                );
                const data = await response.json();

                const parsed: ChatMessage[] = data.messages.map((msg: any) => {
                    try {
                        const content = JSON.parse(atob(msg.message));
                        return {
                            sequenceNumber: msg.sequence_number,
                            consensusTimestamp: msg.consensus_timestamp,
                            message: content.text,
                            sender: content.sender,
                            time: content.timestamp
                        };
                    } catch (e) {
                        return null;
                    }
                }).filter(Boolean).reverse();

                setMessages(parsed);
            } catch (error) {
                console.error('Failed to fetch messages', error);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [isOpen, TOPIC_ID]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isSending) return;

        setIsSending(true);
        try {
            const response = await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: inputValue,
                    sender: username
                })
            });

            if (!response.ok) throw new Error('Failed to send');

            setInputValue('');
            // Optimistic update could happen here, but we wait for polling for truth
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    if (!TOPIC_ID) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="pointer-events-auto mb-4 w-[calc(100vw-2rem)] sm:w-96 rounded-xl border border-border bg-background/95 backdrop-blur-md shadow-2xl overflow-hidden flex flex-col h-[500px] max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="p-3 border-b border-border bg-accent/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="font-semibold text-sm">Global Chat</span>
                                <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-accent">Live (HCS)</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" ref={scrollRef}>
                            <div className="space-y-4">
                                {messages.length === 0 ? (
                                    <div className="text-center text-muted-foreground text-sm py-8">
                                        No messages yet.<br />Be the first to say hello!
                                    </div>
                                ) : (
                                    messages.map((msg, i) => {
                                        const isMe = msg.sender === username;
                                        return (
                                            <div key={`${msg.sequenceNumber}-${i}`} className={cn(
                                                "flex gap-2 text-sm",
                                                isMe ? "justify-end" : "justify-start"
                                            )}>
                                                {!isMe && (
                                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                                        <User className="w-3 h-3 text-primary" />
                                                    </div>
                                                )}
                                                <div className={cn(
                                                    "px-3 py-2 rounded-lg max-w-[80%]",
                                                    isMe
                                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                                        : "bg-muted rounded-tl-none"
                                                )}>
                                                    {!isMe && <p className="text-[10px] opacity-70 mb-0.5">{msg.sender}</p>}
                                                    <p className="leading-snug">{msg.message}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div >

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-3 border-t border-border bg-background mt-auto flex gap-2">
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 h-9 text-sm"
                                disabled={isSending}
                            />
                            <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={isSending}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                size="lg"
                className={cn(
                    "pointer-events-auto rounded-full shadow-lg h-12 w-12 p-0 transition-transform hover:scale-105 active:scale-95",
                    isOpen ? "bg-muted text-foreground hover:bg-muted/80" : "bg-primary text-primary-foreground"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </Button>
        </div>
    );
}
