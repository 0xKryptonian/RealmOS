'use client';

import React from 'react';
import SnakesAndLaddersGame from '@/components/snake-game';
import { GameWrapper } from '@/components/game-wrapper';

const SnakeLadderGame = () => {
    return (
        <GameWrapper gameId="snake-ladder" gameName="Snake & Ladder">
            {({ onGameEnd, submitting }) => (
                <SnakesAndLaddersGame onGameEnd={onGameEnd} submitting={submitting} />
            )}
        </GameWrapper>
    );
};

export default SnakeLadderGame;
