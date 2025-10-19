import { GameSpec } from '@/types/game-spec';

/**
 * Phaser.js Shooter Game Template
 * Generates playable shooter game code from GameSpec
 */

export function generateShooterGame(spec: GameSpec): string {
  const { title, entities, config, visuals } = spec;
  
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
      border: 4px solid #333;
      box-shadow: 0 0 20px rgba(0,255,255,0.3);
    }
  </style>
</head>
<body>
  <div id="game-container"></div>
  <script>
    // Game Configuration
    const config = {
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
      backgroundColor: '${visuals.colorScheme === 'monochrome' ? '#000000' : '#0a0a2e'}'
    };

    const game = new Phaser.Game(config);
    
    let player;
    let enemies;
    let bullets;
    let collectibles;
    let cursors;
    let spaceKey;
    let score = 0;
    let scoreText;
    let gameOver = false;
    let lastFired = 0;
    let fireRate = 200;

    function preload() {
      // Create simple pixel art sprites using graphics
      this.textures.generate('player', { data: ['2'], pixelWidth: 32, pixelHeight: 32 });
      this.textures.generate('enemy', { data: ['1'], pixelWidth: 24, pixelHeight: 24 });
      this.textures.generate('bullet', { data: ['3'], pixelWidth: 8, pixelHeight: 16 });
      this.textures.generate('collectible', { data: ['4'], pixelWidth: 16, pixelHeight: 16 });
    }

    function create() {
      // Create player
      player = this.physics.add.sprite(${config.width / 2}, ${config.height - 80}, 'player');
      player.setCollideWorldBounds(true);
      player.setTint(0x00ff00);

      // Create groups
      enemies = this.physics.add.group();
      bullets = this.physics.add.group();
      collectibles = this.physics.add.group();

      // Spawn initial enemies
      spawnEnemies.call(this);

      // Spawn collectibles periodically
      this.time.addEvent({
        delay: 5000,
        callback: spawnCollectible,
        callbackScope: this,
        loop: true
      });

      // Controls
      cursors = this.input.keyboard.createCursorKeys();
      spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

      // Score
      scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '24px',
        fill: '#fff',
        fontFamily: 'Courier New'
      });

      // Collisions
      this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);
      this.physics.add.overlap(player, enemies, hitPlayer, null, this);
      this.physics.add.overlap(player, collectibles, collectPowerUp, null, this);

      // Enemy spawning
      this.time.addEvent({
        delay: 2000,
        callback: spawnEnemies,
        callbackScope: this,
        loop: true
      });
    }

    function update(time) {
      if (gameOver) return;

      // Player movement
      if (cursors.left.isDown) {
        player.setVelocityX(-300);
      } else if (cursors.right.isDown) {
        player.setVelocityX(300);
      } else {
        player.setVelocityX(0);
      }

      if (cursors.up.isDown) {
        player.setVelocityY(-300);
      } else if (cursors.down.isDown) {
        player.setVelocityY(300);
      } else {
        player.setVelocityY(0);
      }

      // Shooting
      if (spaceKey.isDown && time > lastFired) {
        fireBullet.call(this);
        lastFired = time + fireRate;
      }

      // Clean up off-screen bullets
      bullets.children.entries.forEach(bullet => {
        if (bullet.y < 0) bullet.destroy();
      });

      // Move enemies down
      enemies.children.entries.forEach(enemy => {
        if (enemy.y > ${config.height}) {
          enemy.destroy();
        }
      });
    }

    function spawnEnemies() {
      const enemyCount = ${entities.enemies?.[0]?.count || 3};
      for (let i = 0; i < enemyCount; i++) {
        const x = Phaser.Math.Between(50, ${config.width - 50});
        const enemy = enemies.create(x, 50, 'enemy');
        enemy.setVelocityY(Phaser.Math.Between(50, 150));
        enemy.setTint(0xff0000);
      }
    }

    function spawnCollectible() {
      const x = Phaser.Math.Between(50, ${config.width - 50});
      const collectible = collectibles.create(x, 50, 'collectible');
      collectible.setVelocityY(100);
      collectible.setTint(0xffff00);
    }

    function fireBullet() {
      const bullet = bullets.create(player.x, player.y - 20, 'bullet');
      bullet.setVelocityY(-400);
      bullet.setTint(0x00ffff);
    }

    function hitEnemy(bullet, enemy) {
      bullet.destroy();
      enemy.destroy();
      score += 10;
      scoreText.setText('Score: ' + score);
    }

    function hitPlayer(player, enemy) {
      this.physics.pause();
      player.setTint(0xff0000);
      gameOver = true;
      
      const gameOverText = this.add.text(${config.width / 2}, ${config.height / 2}, 'GAME OVER', {
        fontSize: '64px',
        fill: '#fff',
        fontFamily: 'Courier New'
      });
      gameOverText.setOrigin(0.5);

      const finalScoreText = this.add.text(${config.width / 2}, ${config.height / 2 + 60}, 'Final Score: ' + score, {
        fontSize: '32px',
        fill: '#fff',
        fontFamily: 'Courier New'
      });
      finalScoreText.setOrigin(0.5);
    }

    function collectPowerUp(player, collectible) {
      collectible.destroy();
      score += 50;
      scoreText.setText('Score: ' + score);
      
      // Power-up effect: faster fire rate
      fireRate = 100;
      this.time.delayedCall(5000, () => {
        fireRate = 200;
      });
    }
  </script>
</body>
</html>
  `.trim();
}
