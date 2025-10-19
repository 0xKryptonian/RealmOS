'use client';

import React from 'react';
import TetrisGame from '@/components/tetris-game';
import { GameWrapper } from '@/components/game-wrapper';

const TetrisPage = () => {
  return (
    <GameWrapper gameId="tetris" gameName="Tetris">
      {({ onGameEnd, submitting }) => (
        <TetrisGame onGameEnd={onGameEnd} submitting={submitting} />
      )}
    </GameWrapper>
  );
};

export default TetrisPage;