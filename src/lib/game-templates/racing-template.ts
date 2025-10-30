import { GameSpec } from '../../types/game-spec';

/**
 * Phaser.js Racing Game Template (Top-down)
 */

export function generateRacingGame(spec: GameSpec): string {
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
      background: #1a1a1a;
      font-family: 'Courier New', monospace;
    }
    #game-container {
      border: 4px solid #333;
      box-shadow: 0 0 20px rgba(255,69,0,0.5);
    }
    #game-container:focus {
      outline: 2px solid #ff4500;
    }
    .game-instructions {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.8);
      color: #fff;
      padding: 20px 40px;
      border: 2px solid #ff4500;
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
    <small>Arrow Keys: Steer & Speed</small>
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
      backgroundColor: '${visuals.colorScheme === 'monochrome' ? '#000000' : '#2d5016'}'
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
    
    let player;
    let obstacles;
    let collectibles;
    let cursors;
    let score = 0;
    let distance = 0;
    let speed = 3;
    let scoreText;
    let distanceText;
    let speedText;
    let gameOver = false;
    let roadLines;

    function preload() {
      this.textures.generate('player', { data: ['2'], pixelWidth: 40, pixelHeight: 60 });
      this.textures.generate('obstacle', { data: ['1'], pixelWidth: 40, pixelHeight: 60 });
      this.textures.generate('collectible', { data: ['3'], pixelWidth: 24, pixelHeight: 24 });
      this.textures.generate('roadLine', { data: ['4'], pixelWidth: 10, pixelHeight: 40 });
    }

    function create() {
      // Road lines for effect
      roadLines = this.add.group();
      for (let i = 0; i < 10; i++) {
        const line = roadLines.create(${config.width / 2}, i * 80, 'roadLine');
        line.setTint(0xffffff);
        line.setAlpha(0.3);
      }

      // Player car
      player = this.physics.add.sprite(${config.width / 2}, ${config.height - 100}, 'player');
      player.setCollideWorldBounds(true);
      player.setTint(0x00ff00);

      // Obstacles
      obstacles = this.physics.add.group();
      
      // Collectibles
      collectibles = this.physics.add.group();

      // Controls
      cursors = this.input.keyboard.createCursorKeys();

      // UI
      scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '24px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      });

      distanceText = this.add.text(16, 46, 'Distance: 0m', {
        fontSize: '20px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      });

      speedText = this.add.text(${config.width - 16}, 16, 'Speed: 3', {
        fontSize: '20px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      }).setOrigin(1, 0);

      // Spawn obstacles
      this.time.addEvent({
        delay: 1500,
        callback: spawnObstacle,
        callbackScope: this,
        loop: true
      });

      // Spawn collectibles
      this.time.addEvent({
        delay: 3000,
        callback: spawnCollectible,
        callbackScope: this,
        loop: true
      });

      // Collisions
      this.physics.add.overlap(player, obstacles, hitObstacle, null, this);
      this.physics.add.overlap(player, collectibles, collectItem, null, this);
    }

    function update() {
      if (gameOver) return;

      // Player movement
      if (cursors.left.isDown) {
        player.setVelocityX(-300);
      } else if (cursors.right.isDown) {
        player.setVelocityX(300);
      } else {
        player.setVelocityX(0);
      }

      // Speed control
      if (cursors.up.isDown && speed < 10) {
        speed += 0.05;
      } else if (cursors.down.isDown && speed > 1) {
        speed -= 0.05;
      }

      speedText.setText('Speed: ' + Math.floor(speed));

      // Move road lines
      roadLines.children.entries.forEach(line => {
        line.y += speed * 2;
        if (line.y > ${config.height}) {
          line.y = -40;
        }
      });

      // Move obstacles
      obstacles.children.entries.forEach(obstacle => {
        obstacle.y += speed * 2;
        if (obstacle.y > ${config.height}) {
          obstacle.destroy();
        }
      });

      // Move collectibles
      collectibles.children.entries.forEach(collectible => {
        collectible.y += speed * 2;
        if (collectible.y > ${config.height}) {
          collectible.destroy();
        }
      });

      // Update distance
      distance += speed * 0.1;
      distanceText.setText('Distance: ' + Math.floor(distance) + 'm');

      // Increase difficulty
      if (Math.floor(distance) % 100 === 0 && distance > 0) {
        speed = Math.min(speed + 0.1, 10);
      }
    }

    function spawnObstacle() {
      if (gameOver) return;
      
      const lanes = [${config.width * 0.25}, ${config.width * 0.5}, ${config.width * 0.75}];
      const lane = Phaser.Math.RND.pick(lanes);
      
      const obstacle = obstacles.create(lane, -50, 'obstacle');
      obstacle.setTint(0xff0000);
    }

    function spawnCollectible() {
      if (gameOver) return;
      
      const lanes = [${config.width * 0.25}, ${config.width * 0.5}, ${config.width * 0.75}];
      const lane = Phaser.Math.RND.pick(lanes);
      
      const collectible = collectibles.create(lane, -50, 'collectible');
      collectible.setTint(0xffff00);
    }

    function hitObstacle(player, obstacle) {
      this.physics.pause();
      player.setTint(0xff0000);
      gameOver = true;

      const gameOverText = this.add.text(${config.width / 2}, ${config.height / 2}, 'CRASH!', {
        fontSize: '64px',
        fill: '#ff0000',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 6
      });
      gameOverText.setOrigin(0.5);

      const finalScoreText = this.add.text(${config.width / 2}, ${config.height / 2 + 60}, 
        'Distance: ' + Math.floor(distance) + 'm\\nScore: ' + score, {
        fontSize: '28px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4,
        align: 'center'
      });
      finalScoreText.setOrigin(0.5);
    }

    function collectItem(player, collectible) {
      collectible.destroy();
      score += 50;
      scoreText.setText('Score: ' + score);
    }
  </script>
</body>
</html>
  `.trim();
}
