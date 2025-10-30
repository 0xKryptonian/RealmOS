"use client"

import React from 'react';
import { WordleGame } from '@/components/wordle-game';
import { GameWrapper } from '@/components/game-wrapper';
import gameWords from '@/data/words.json';
import validWords from '@/data/validWords.json';

// For now, we'll use placeholder data
// const gameWords = [
//     "apple", "beach", "chair", "dance", "eagle", "flame", "ghost", "heart", "igloo", "joker",
//     "knife", "lemon", "music", "night", "ocean", "piano", "queen", "river", "snake", "tiger",
//     "umbra", "voice", "water", "xenon", "yacht", "zebra", "brave", "cloud", "dream", "earth"
// ];
// const validWords = [
//  
//     ...gameWords,
//     "about", "above", "abuse", "actor", "adapt", "admit", "adopt", "adult", "after", "again",
//     "agent", "agree", "ahead", "alarm", "album", "alert", "alike", "alive", "allow", "alone",
//     "along", "alter", "among", "anger", "angle", "angry", "ankle", "apart", "apple", "apply"
// ];

export default function WordlePage() {
    return (
        <GameWrapper gameId="wordle" gameName="Wordle">
            {({ onGameEnd, submitting }) => (
                <WordleGame onGameEnd={onGameEnd} submitting={submitting} />
            )}
        </GameWrapper>
    );
}