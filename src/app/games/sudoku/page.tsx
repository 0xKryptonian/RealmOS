'use client';

import React from 'react';
import SudokuGame from '@/components/sudoko-game';
import { GameWrapper } from '@/components/game-wrapper';

const SudokuPage = () => {
    return (
        <GameWrapper gameId="sudoku" gameName="Sudoku">
            {({ onGameEnd, submitting }) => (
                <SudokuGame onGameEnd={onGameEnd} submitting={submitting} />
            )}
        </GameWrapper>
    );
};

export default SudokuPage;
