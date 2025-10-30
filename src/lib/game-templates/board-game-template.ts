import { GameSpec } from '../../types/game-spec';

/**
 * Phaser.js Board Game Template (Snake & Ladders, Ludo, etc.)
 */

export function generateBoardGame(spec: GameSpec): string {
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
      background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
      font-family: 'Courier New', monospace;
    }
    #game-container {
      border: 4px solid #333;
      box-shadow: 0 0 30px rgba(139,69,19,0.7);
    }
    #game-container:focus {
      outline: 2px solid #FFD700;
    }
    .game-instructions {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.9);
      color: #fff;
      padding: 20px 40px;
      border: 2px solid #FFD700;
      font-size: 18px;
      text-align: center;
      z-index: 1000;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="game-container" tabindex="0"></div>
  <div id="instructions" class="game-instructions">
    Click here to start!<br>
    <small>Click "Roll Dice" to play</small>
  </div>
  <script>
    const gameConfig = {
      type: Phaser.AUTO,
      width: ${config.width},
      height: ${config.height},
      parent: 'game-container',
      scene: {
        preload: preload,
        create: create,
        update: update
      },
      backgroundColor: '${visuals.colorScheme === 'monochrome' ? '#000000' : '#2F4F4F'}'
    };

    const game = new Phaser.Game(gameConfig);
    
    const container = document.getElementById('game-container');
    const instructions = document.getElementById('instructions');
    container.addEventListener('click', () => {
      container.focus();
      if (instructions) instructions.style.display = 'none';
    });
    setTimeout(() => {
      container.focus();
      if (instructions) instructions.style.display = 'none';
    }, 500);
    
    const BOARD_SIZE = 10;
    const CELL_SIZE = 60;
    const START_X = 100;
    const START_Y = 80;
    
    let player;
    let playerPosition = 0;
    let diceValue = 0;
    let rollButton;
    let diceText;
    let positionText;
    let isRolling = false;
    let gameOver = false;
    
    // Snakes and Ladders positions
    const snakes = {
      16: 6,
      47: 26,
      49: 11,
      56: 53,
      62: 19,
      64: 60,
      87: 24,
      93: 73,
      95: 75,
      98: 78
    };
    
    const ladders = {
      1: 38,
      4: 14,
      9: 31,
      21: 42,
      28: 84,
      36: 44,
      51: 67,
      71: 91,
      80: 100
    };

    function preload() {
      this.textures.generate('cell', { data: ['1'], pixelWidth: CELL_SIZE - 4, pixelHeight: CELL_SIZE - 4 });
      this.textures.generate('player', { data: ['2'], pixelWidth: 30, pixelHeight: 30 });
      this.textures.generate('button', { data: ['3'], pixelWidth: 150, pixelHeight: 60 });
      this.textures.generate('snake', { data: ['4'], pixelWidth: 40, pixelHeight: 40 });
      this.textures.generate('ladder', { data: ['5'], pixelWidth: 40, pixelHeight: 40 });
    }

    function create() {
      // Title
      this.add.text(${config.width / 2}, 30, '${title}', {
        fontSize: '28px',
        fill: '#FFD700',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      }).setOrigin(0.5);

      // Draw board
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          const isReverse = row % 2 === 1;
          const cellNum = (BOARD_SIZE - 1 - row) * BOARD_SIZE + (isReverse ? (BOARD_SIZE - 1 - col) : col) + 1;
          
          const x = START_X + col * CELL_SIZE;
          const y = START_Y + row * CELL_SIZE;
          
          const cell = this.add.sprite(x, y, 'cell');
          const color = (row + col) % 2 === 0 ? 0xF5DEB3 : 0xD2B48C;
          cell.setTint(color);
          cell.setOrigin(0);
          
          // Cell number
          this.add.text(x + CELL_SIZE / 2, y + CELL_SIZE / 2, cellNum.toString(), {
            fontSize: '16px',
            fill: '#000',
            fontFamily: 'Courier New',
            fontStyle: 'bold'
          }).setOrigin(0.5);
          
          // Mark snakes
          if (snakes[cellNum]) {
            const snake = this.add.sprite(x + CELL_SIZE / 2, y + CELL_SIZE / 2 - 15, 'snake');
            snake.setTint(0xff0000);
            snake.setScale(0.6);
          }
          
          // Mark ladders
          if (ladders[cellNum]) {
            const ladder = this.add.sprite(x + CELL_SIZE / 2, y + CELL_SIZE / 2 - 15, 'ladder');
            ladder.setTint(0x00ff00);
            ladder.setScale(0.6);
          }
        }
      }

      // Player
      player = this.add.sprite(START_X + CELL_SIZE / 2, START_Y + (BOARD_SIZE - 1) * CELL_SIZE + CELL_SIZE / 2, 'player');
      player.setTint(0x0000ff);

      // Roll dice button
      rollButton = this.add.sprite(${config.width - 120}, 200, 'button');
      rollButton.setInteractive();
      rollButton.setTint(0x4169E1);
      
      this.add.text(${config.width - 120}, 200, 'ROLL DICE', {
        fontSize: '20px',
        fill: '#fff',
        fontFamily: 'Courier New',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      rollButton.on('pointerdown', () => {
        if (!isRolling && !gameOver) {
          rollDice.call(this);
        }
      });

      // Dice display
      diceText = this.add.text(${config.width - 120}, 280, 'Dice: -', {
        fontSize: '24px',
        fill: '#FFD700',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 3
      }).setOrigin(0.5);

      // Position display
      positionText = this.add.text(${config.width - 120}, 320, 'Position: 0', {
        fontSize: '20px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 3
      }).setOrigin(0.5);

      // Instructions
      this.add.text(${config.width / 2}, ${config.height - 20}, 'Reach square 100 to win!', {
        fontSize: '18px',
        fill: '#FFD700',
        fontFamily: 'Courier New'
      }).setOrigin(0.5);
    }

    function update() {
      // Game logic handled by events
    }

    function rollDice() {
      isRolling = true;
      diceValue = Phaser.Math.Between(1, 6);
      diceText.setText('Dice: ' + diceValue);

      // Animate dice roll
      this.tweens.add({
        targets: rollButton,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          movePlayer.call(this);
        }
      });
    }

    function movePlayer() {
      const newPosition = Math.min(playerPosition + diceValue, 100);
      
      if (newPosition === playerPosition) {
        isRolling = false;
        return;
      }

      playerPosition = newPosition;
      positionText.setText('Position: ' + playerPosition);

      // Calculate board position
      const row = Math.floor((playerPosition - 1) / BOARD_SIZE);
      const col = (playerPosition - 1) % BOARD_SIZE;
      const isReverse = (BOARD_SIZE - 1 - row) % 2 === 1;
      const actualCol = isReverse ? (BOARD_SIZE - 1 - col) : col;
      
      const targetX = START_X + actualCol * CELL_SIZE + CELL_SIZE / 2;
      const targetY = START_Y + (BOARD_SIZE - 1 - row) * CELL_SIZE + CELL_SIZE / 2;

      // Move player
      this.tweens.add({
        targets: player,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          checkSpecialSquare.call(this);
        }
      });
    }

    function checkSpecialSquare() {
      // Check for snake
      if (snakes[playerPosition]) {
        const newPos = snakes[playerPosition];
        
        this.add.text(player.x, player.y - 40, 'Snake! 🐍', {
          fontSize: '20px',
          fill: '#ff0000',
          fontFamily: 'Courier New'
        }).setOrigin(0.5);

        this.time.delayedCall(1000, () => {
          playerPosition = newPos;
          positionText.setText('Position: ' + playerPosition);
          movePlayerToPosition.call(this, newPos);
        });
        return;
      }

      // Check for ladder
      if (ladders[playerPosition]) {
        const newPos = ladders[playerPosition];
        
        this.add.text(player.x, player.y - 40, 'Ladder! 🪜', {
          fontSize: '20px',
          fill: '#00ff00',
          fontFamily: 'Courier New'
        }).setOrigin(0.5);

        this.time.delayedCall(1000, () => {
          playerPosition = newPos;
          positionText.setText('Position: ' + playerPosition);
          movePlayerToPosition.call(this, newPos);
        });
        return;
      }

      // Check win
      if (playerPosition === 100) {
        winGame.call(this);
        return;
      }

      isRolling = false;
    }

    function movePlayerToPosition(position) {
      const row = Math.floor((position - 1) / BOARD_SIZE);
      const col = (position - 1) % BOARD_SIZE;
      const isReverse = (BOARD_SIZE - 1 - row) % 2 === 1;
      const actualCol = isReverse ? (BOARD_SIZE - 1 - col) : col;
      
      const targetX = START_X + actualCol * CELL_SIZE + CELL_SIZE / 2;
      const targetY = START_Y + (BOARD_SIZE - 1 - row) * CELL_SIZE + CELL_SIZE / 2;

      this.tweens.add({
        targets: player,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2',
        onComplete: () => {
          isRolling = false;
        }
      });
    }

    function winGame() {
      gameOver = true;

      const winText = this.add.text(${config.width / 2}, ${config.height / 2}, 'YOU WIN! 🎉', {
        fontSize: '64px',
        fill: '#FFD700',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 6
      });
      winText.setOrigin(0.5);

      this.tweens.add({
        targets: winText,
        scale: 1.2,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  </script>
</body>
</html>
  `.trim();
}
