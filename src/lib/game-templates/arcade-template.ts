import { GameSpec } from '@/types/game-spec';

/**
 * Phaser.js Arcade Game Template (Breakout/Brick Breaker)
 */

export function generateArcadeGame(spec: GameSpec): string {
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
      background: #000;
      font-family: 'Courier New', monospace;
    }
    #game-container {
      border: 4px solid #00ff00;
      box-shadow: 0 0 30px rgba(0,255,0,0.5);
    }
    #game-container:focus {
      outline: 2px solid #00ff00;
    }
    .game-instructions {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.8);
      color: #fff;
      padding: 20px 40px;
      border: 2px solid #00ff00;
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
    <small>Arrow Keys: Move | Space: Launch Ball</small>
  </div>
  <script>
    const gameConfig = {
      type: Phaser.AUTO,
      width: ${config.width},
      height: ${config.height},
      parent: 'game-container',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: {
        preload: preload,
        create: create,
        update: update
      },
      backgroundColor: '${visuals.colorScheme === 'monochrome' ? '#000000' : '#001a00'}'
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
    
    let paddle;
    let ball;
    let bricks;
    let cursors;
    let score = 0;
    let lives = 3;
    let scoreText;
    let livesText;
    let gameOver = false;
    let ballOnPaddle = true;

    function preload() {
      this.textures.generate('paddle', { data: ['1'], pixelWidth: 120, pixelHeight: 20 });
      this.textures.generate('ball', { data: ['2'], pixelWidth: 16, pixelHeight: 16 });
      this.textures.generate('brick', { data: ['3'], pixelWidth: 64, pixelHeight: 32 });
    }

    function create() {
      // Paddle
      paddle = this.physics.add.sprite(${config.width / 2}, ${config.height - 50}, 'paddle');
      paddle.setImmovable(true);
      paddle.setCollideWorldBounds(true);
      paddle.setTint(0x00ff00);

      // Ball
      ball = this.physics.add.sprite(${config.width / 2}, ${config.height - 70}, 'ball');
      ball.setCollideWorldBounds(true);
      ball.setBounce(1);
      ball.setTint(0xffffff);

      // Bricks
      bricks = this.physics.add.staticGroup();
      
      const colors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff];
      const rows = 5;
      const cols = 10;
      const brickWidth = 70;
      const brickHeight = 35;
      const startX = (${config.width} - (cols * brickWidth)) / 2 + brickWidth / 2;
      const startY = 80;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = startX + col * brickWidth;
          const y = startY + row * brickHeight;
          const brick = bricks.create(x, y, 'brick');
          brick.setTint(colors[row]);
          brick.setData('points', (5 - row) * 10);
        }
      }

      // Controls
      cursors = this.input.keyboard.createCursorKeys();
      this.input.keyboard.on('keydown-SPACE', launchBall, this);

      // UI
      scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '24px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      });

      livesText = this.add.text(${config.width - 16}, 16, 'Lives: 3', {
        fontSize: '24px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      }).setOrigin(1, 0);

      // Instructions
      const instructText = this.add.text(${config.width / 2}, ${config.height / 2}, 
        'Press SPACE to start\\nArrow keys to move', {
        fontSize: '24px',
        fill: '#00ff00',
        fontFamily: 'Courier New',
        align: 'center'
      });
      instructText.setOrigin(0.5);

      // Collisions
      this.physics.add.collider(ball, paddle, hitPaddle, null, this);
      this.physics.add.collider(ball, bricks, hitBrick, null, this);

      // Ball out of bounds
      ball.setData('outOfBounds', false);
    }

    function update() {
      if (gameOver) return;

      // Paddle movement
      if (cursors.left.isDown) {
        paddle.setVelocityX(-600);
      } else if (cursors.right.isDown) {
        paddle.setVelocityX(600);
      } else {
        paddle.setVelocityX(0);
      }

      // Ball follows paddle before launch
      if (ballOnPaddle) {
        ball.x = paddle.x;
      }

      // Check if ball fell
      if (ball.y > ${config.height} && !ball.getData('outOfBounds')) {
        ball.setData('outOfBounds', true);
        loseLife.call(this);
      }
    }

    function launchBall() {
      if (ballOnPaddle && !gameOver) {
        ballOnPaddle = false;
        ball.setVelocity(
          Phaser.Math.Between(-200, 200),
          -400
        );
      }
    }

    function hitPaddle(ball, paddle) {
      // Add spin based on where ball hits paddle
      const diff = ball.x - paddle.x;
      ball.setVelocityX(diff * 10);
    }

    function hitBrick(ball, brick) {
      brick.destroy();
      
      const points = brick.getData('points');
      score += points;
      scoreText.setText('Score: ' + score);

      // Check win condition
      if (bricks.countActive() === 0) {
        winGame.call(this);
      }
    }

    function loseLife() {
      lives--;
      livesText.setText('Lives: ' + lives);

      if (lives === 0) {
        endGame.call(this);
      } else {
        resetBall.call(this);
      }
    }

    function resetBall() {
      ballOnPaddle = true;
      ball.setPosition(paddle.x, ${config.height - 70});
      ball.setVelocity(0, 0);
      ball.setData('outOfBounds', false);
    }

    function winGame() {
      gameOver = true;
      this.physics.pause();

      const winText = this.add.text(${config.width / 2}, ${config.height / 2}, 'YOU WIN!', {
        fontSize: '64px',
        fill: '#00ff00',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 6
      });
      winText.setOrigin(0.5);

      const finalScoreText = this.add.text(${config.width / 2}, ${config.height / 2 + 60}, 
        'Final Score: ' + score, {
        fontSize: '32px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      });
      finalScoreText.setOrigin(0.5);
    }

    function endGame() {
      gameOver = true;
      this.physics.pause();

      const gameOverText = this.add.text(${config.width / 2}, ${config.height / 2}, 'GAME OVER', {
        fontSize: '64px',
        fill: '#ff0000',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 6
      });
      gameOverText.setOrigin(0.5);

      const finalScoreText = this.add.text(${config.width / 2}, ${config.height / 2 + 60}, 
        'Final Score: ' + score, {
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
