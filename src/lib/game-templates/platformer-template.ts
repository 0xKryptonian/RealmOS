import { GameSpec } from '../../types/game-spec';

/**
 * Phaser.js Platformer Game Template
 */

export function generatePlatformerGame(spec: GameSpec): string {
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
      background: #1a1a2e;
      font-family: 'Courier New', monospace;
    }
    #game-container {
      border: 4px solid #333;
      box-shadow: 0 0 20px rgba(255,100,100,0.3);
    }
    #game-container:focus {
      outline: 2px solid #ff6464;
    }
    .game-instructions {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.8);
      color: #fff;
      padding: 20px 40px;
      border: 2px solid #ff6464;
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
    <small>Arrow Keys: Move & Jump</small>
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
          gravity: { y: 800 },
          debug: false
        }
      },
      scene: {
        preload: preload,
        create: create,
        update: update
      },
      backgroundColor: '${visuals.colorScheme === 'monochrome' ? '#000000' : '#87CEEB'}'
    };

    const game = new Phaser.Game(gameConfig);
    
    // Auto-focus game container
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
    
    let player;
    let platforms;
    let collectibles;
    let cursors;
    let score = 0;
    let scoreText;
    let gameOver = false;

    function preload() {
      // Generate simple sprites
      this.textures.generate('player', { data: ['2'], pixelWidth: 32, pixelHeight: 48 });
      this.textures.generate('platform', { data: ['1'], pixelWidth: 200, pixelHeight: 32 });
      this.textures.generate('collectible', { data: ['3'], pixelWidth: 24, pixelHeight: 24 });
    }

    function create() {
      // Platforms
      platforms = this.physics.add.staticGroup();
      
      // Ground
      const ground = platforms.create(${config.width / 2}, ${config.height - 16}, 'platform');
      ground.setScale(${config.width / 200}, 1).refreshBody();
      ground.setTint(0x00ff00);

      // Floating platforms
      platforms.create(${config.width * 0.25}, ${config.height * 0.7}, 'platform').setTint(0x00ff00);
      platforms.create(${config.width * 0.75}, ${config.height * 0.7}, 'platform').setTint(0x00ff00);
      platforms.create(${config.width * 0.5}, ${config.height * 0.5}, 'platform').setTint(0x00ff00);
      platforms.create(${config.width * 0.2}, ${config.height * 0.35}, 'platform').setTint(0x00ff00);
      platforms.create(${config.width * 0.8}, ${config.height * 0.35}, 'platform').setTint(0x00ff00);

      // Player
      player = this.physics.add.sprite(100, ${config.height - 200}, 'player');
      player.setBounce(0.2);
      player.setCollideWorldBounds(true);
      player.setTint(0xff00ff);

      // Collectibles
      collectibles = this.physics.add.group({
        key: 'collectible',
        repeat: 11,
        setXY: { x: 50, y: 0, stepX: ${config.width / 12} }
      });

      collectibles.children.iterate((child) => {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.setTint(0xffff00);
      });

      // Controls
      cursors = this.input.keyboard.createCursorKeys();

      // Score
      scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '28px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      });

      // Collisions
      this.physics.add.collider(player, platforms);
      this.physics.add.collider(collectibles, platforms);
      this.physics.add.overlap(player, collectibles, collectItem, null, this);
    }

    function update() {
      if (gameOver) return;

      // Player movement
      if (cursors.left.isDown) {
        player.setVelocityX(-200);
      } else if (cursors.right.isDown) {
        player.setVelocityX(200);
      } else {
        player.setVelocityX(0);
      }

      // Jump
      if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-500);
      }

      // Check win condition
      if (score >= 120) {
        winGame.call(this);
      }
    }

    function collectItem(player, item) {
      item.disableBody(true, true);
      score += 10;
      scoreText.setText('Score: ' + score);

      // Respawn collectibles if all collected
      if (collectibles.countActive(true) === 0) {
        collectibles.children.iterate((child) => {
          child.enableBody(true, child.x, 0, true, true);
        });
      }
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
