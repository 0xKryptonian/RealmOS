'use client';

import React from 'react';
import ChessGameApp from '@/components/chess-game';
import { GameWrapper } from '@/components/game-wrapper';

const ChessPage = () => {
    return (
        <GameWrapper gameId="chess" gameName="Chess">
            {({ onGameEnd, submitting }) => (
                <ChessGameApp onGameEnd={onGameEnd} submitting={submitting} />
            )}
        </GameWrapper>
    );
};

export default ChessPage;