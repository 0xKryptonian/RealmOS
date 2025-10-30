'use client';

import React from 'react';
import CryptoCrosswordGame from '@/components/crypto-crossword-game';
import { GameWrapper } from '@/components/game-wrapper';

const CryptoCrossword = () => {
    return (
        <GameWrapper gameId="crypto-crossword" gameName="Crypto Crossword">
            {({ onGameEnd, submitting }) => (
                <CryptoCrosswordGame onGameEnd={onGameEnd} submitting={submitting} />
            )}
        </GameWrapper>
    );
};

export default CryptoCrossword;