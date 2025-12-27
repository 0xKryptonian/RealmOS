import { z } from 'zod';

export const ChatMessageSchema = z.object({
    message: z.string()
        .min(1, 'Message cannot be empty')
        .max(500, 'Message is too long (max 500 chars)')
        .refine(val => !/(badword1|badword2)/i.test(val), 'Please keep the chat clean'),
});

export const GamePromptSchema = z.object({
    title: z.string().min(3, 'Title is too short').max(50, 'Title is too long'),
    prompt: z.string()
        .min(10, 'Please describe your game in more detail')
        .max(1000, 'Description limit reached'),
    category: z.enum(['Arcade', 'Puzzle', 'Action', 'Strategy']),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type GamePrompt = z.infer<typeof GamePromptSchema>;
