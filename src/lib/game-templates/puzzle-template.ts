import { GameSpec } from '@/types/game-spec';

/**
 * Phaser.js Puzzle Game Template (Match-3 / Block Matching)
 */

export function generatePuzzleGame(spec: GameSpec): string {
  const { title, config, visuals } = spec;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #2d1b69;
      font-family: 'Courier New', monospace;
    }
    #game-container {
      border: 4px solid #333;
      box-shadow: 0 0 20px rgba(138,43,226,0.5);
    }
  </style>
</head>
<body>
  <div id="game-container"></div>
  <script>
    const config = {
      type: Phaser.AUTO,
      width: ${config.width},
      height: ${config.height},
      parent: 'game-container',
      scene: {
        preload: preload,
        create: create,
        update: update
      },
      backgroundColor: '${visuals.colorScheme === 'monochrome' ? '#000000' : '#1a0033'}'
    };

    const game = new Phaser.Game(config);
    
    const GRID_SIZE = 8;
    const TILE_SIZE = 60;
    const COLORS = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    
    let grid = [];
    let selectedTile = null;
    let score = 0;
    let moves = 30;
    let scoreText;
    let movesText;
    let gameOver = false;
    let isSwapping = false;

    function preload() {
      // Create colored tile sprites
      COLORS.forEach((color, i) => {
        this.textures.generate(\`tile\${i}\`, { 
          data: ['1'], 
          pixelWidth: TILE_SIZE - 4, 
          pixelHeight: TILE_SIZE - 4 
        });
      });
    }

    function create() {
      const startX = (${config.width} - (GRID_SIZE * TILE_SIZE)) / 2;
      const startY = 100;

      // Create grid
      for (let row = 0; row < GRID_SIZE; row++) {
        grid[row] = [];
        for (let col = 0; col < GRID_SIZE; col++) {
          const x = startX + col * TILE_SIZE + TILE_SIZE / 2;
          const y = startY + row * TILE_SIZE + TILE_SIZE / 2;
          const colorIndex = Phaser.Math.Between(0, COLORS.length - 1);
          
          const tile = this.add.sprite(x, y, \`tile\${colorIndex}\`);
          tile.setInteractive();
          tile.setTint(COLORS[colorIndex]);
          tile.setData('row', row);
          tile.setData('col', col);
          tile.setData('colorIndex', colorIndex);
          
          tile.on('pointerdown', () => selectTile(tile));
          
          grid[row][col] = tile;
        }
      }

      // Score and moves
      scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '28px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      });

      movesText = this.add.text(16, 50, 'Moves: 30', {
        fontSize: '24px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      });

      // Instructions
      this.add.text(${config.width / 2}, ${config.height - 30}, 'Click two adjacent tiles to swap', {
        fontSize: '20px',
        fill: '#aaa',
        fontFamily: 'Courier New'
      }).setOrigin(0.5);

      // Check for initial matches
      this.time.delayedCall(100, () => {
        checkMatches.call(this);
      });
    }

    function update() {
      if (gameOver) return;
    }

    function selectTile(tile) {
      if (isSwapping || gameOver) return;

      if (!selectedTile) {
        selectedTile = tile;
        tile.setScale(1.1);
      } else {
        if (selectedTile === tile) {
          selectedTile.setScale(1);
          selectedTile = null;
          return;
        }

        const row1 = selectedTile.getData('row');
        const col1 = selectedTile.getData('col');
        const row2 = tile.getData('row');
        const col2 = tile.getData('col');

        // Check if tiles are adjacent
        const isAdjacent = 
          (Math.abs(row1 - row2) === 1 && col1 === col2) ||
          (Math.abs(col1 - col2) === 1 && row1 === row2);

        if (isAdjacent) {
          swapTiles.call(this, selectedTile, tile);
        }

        selectedTile.setScale(1);
        selectedTile = null;
      }
    }

    function swapTiles(tile1, tile2) {
      isSwapping = true;

      const row1 = tile1.getData('row');
      const col1 = tile1.getData('col');
      const row2 = tile2.getData('row');
      const col2 = tile2.getData('col');

      // Swap in grid
      grid[row1][col1] = tile2;
      grid[row2][col2] = tile1;

      // Swap data
      tile1.setData('row', row2);
      tile1.setData('col', col2);
      tile2.setData('row', row1);
      tile2.setData('col', col1);

      // Animate swap
      this.tweens.add({
        targets: tile1,
        x: tile2.x,
        y: tile2.y,
        duration: 200,
        ease: 'Power2'
      });

      this.tweens.add({
        targets: tile2,
        x: tile1.x,
        y: tile1.y,
        duration: 200,
        ease: 'Power2',
        onComplete: () => {
          const matches = findMatches();
          if (matches.length > 0) {
            moves--;
            movesText.setText('Moves: ' + moves);
            removeMatches.call(this, matches);
          } else {
            // Swap back if no match
            swapBack.call(this, tile1, tile2);
          }
        }
      });
    }

    function swapBack(tile1, tile2) {
      const row1 = tile1.getData('row');
      const col1 = tile1.getData('col');
      const row2 = tile2.getData('row');
      const col2 = tile2.getData('col');

      grid[row1][col1] = tile2;
      grid[row2][col2] = tile1;

      tile1.setData('row', row2);
      tile1.setData('col', col2);
      tile2.setData('row', row1);
      tile2.setData('col', col1);

      this.tweens.add({
        targets: tile1,
        x: tile2.x,
        y: tile2.y,
        duration: 200
      });

      this.tweens.add({
        targets: tile2,
        x: tile1.x,
        y: tile1.y,
        duration: 200,
        onComplete: () => {
          isSwapping = false;
        }
      });
    }

    function findMatches() {
      const matches = [];

      // Check horizontal matches
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE - 2; col++) {
          const color = grid[row][col].getData('colorIndex');
          if (grid[row][col + 1].getData('colorIndex') === color &&
              grid[row][col + 2].getData('colorIndex') === color) {
            matches.push(grid[row][col], grid[row][col + 1], grid[row][col + 2]);
          }
        }
      }

      // Check vertical matches
      for (let col = 0; col < GRID_SIZE; col++) {
        for (let row = 0; row < GRID_SIZE - 2; row++) {
          const color = grid[row][col].getData('colorIndex');
          if (grid[row + 1][col].getData('colorIndex') === color &&
              grid[row + 2][col].getData('colorIndex') === color) {
            matches.push(grid[row][col], grid[row + 1][col], grid[row + 2][col]);
          }
        }
      }

      return [...new Set(matches)];
    }

    function removeMatches(matches) {
      score += matches.length * 10;
      scoreText.setText('Score: ' + score);

      matches.forEach(tile => {
        this.tweens.add({
          targets: tile,
          alpha: 0,
          scale: 0,
          duration: 200
        });
      });

      this.time.delayedCall(250, () => {
        matches.forEach(tile => {
          const row = tile.getData('row');
          const col = tile.getData('col');
          const colorIndex = Phaser.Math.Between(0, COLORS.length - 1);
          
          tile.setData('colorIndex', colorIndex);
          tile.setTexture(\`tile\${colorIndex}\`);
          tile.setTint(COLORS[colorIndex]);
          tile.setAlpha(1);
          tile.setScale(1);
        });

        checkMatches.call(this);
      });
    }

    function checkMatches() {
      const matches = findMatches();
      if (matches.length > 0) {
        removeMatches.call(this, matches);
      } else {
        isSwapping = false;
        if (moves <= 0) {
          endGame.call(this);
        }
      }
    }

    function endGame() {
      gameOver = true;
      
      const endText = this.add.text(${config.width / 2}, ${config.height / 2}, 'GAME OVER', {
        fontSize: '64px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 6
      });
      endText.setOrigin(0.5);

      const finalScoreText = this.add.text(${config.width / 2}, ${config.height / 2 + 60}, 'Final Score: ' + score, {
        fontSize: '32px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      });
      finalScoreText.setOrigin(0.5);
    }
  </script>
</body>
</html>
  `.trim();
}
