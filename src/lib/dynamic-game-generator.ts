import { GameDesign } from '@/types/game-design';
import { mapEntityToIcon, generatePhaserIconTexture } from './icon-mapper';

/**
 * Dynamic Game Code Generator
 * Generates Phaser.js code from detailed GameDesign specifications
 */

export function generateDynamicGame(design: GameDesign): string {
  const { title, gameDesign, visuals, config } = design;
  
  console.log('\n🎨 [Dynamic Generator] Generating game code from design');
  console.log('   Generating textures for', (gameDesign.enemy_types?.length || 0) + 1, 'entities');
  
  // Map entities to icons
  const playerIcon = mapEntityToIcon(gameDesign.player?.type || 'player', design.theme);
  const enemyIcons = gameDesign.enemy_types?.map(e => mapEntityToIcon(e.name, design.theme)) || [];
  const powerUpIcons = gameDesign.power_ups?.map(p => mapEntityToIcon(p.type, design.theme)) || [];
  
  // Generate texture creation code
  const textureCode = generateTextureCode(playerIcon, enemyIcons, powerUpIcons);
  
  // Generate enemy spawning logic
  const enemySpawnCode = generateEnemySpawnCode(gameDesign.enemy_types || []);
  
  // Generate power-up logic
  const powerUpCode = generatePowerUpCode(gameDesign.power_ups || []);
  
  // Generate player controls
  const controlsCode = generateControlsCode(gameDesign.player?.controls || []);
  
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
      background: ${getBackgroundColor(visuals.colorScheme)};
      font-family: 'Courier New', monospace;
    }
    #game-container {
      border: 4px solid #333;
      box-shadow: 0 0 30px rgba(0,0,0,0.5);
    }
    #game-container:focus {
      outline: 2px solid ${playerIcon.color};
    }
    .game-instructions {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.9);
      color: #fff;
      padding: 20px 40px;
      border: 2px solid ${playerIcon.color};
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
    <small>${gameDesign.player?.controls.join(' | ') || 'Arrow Keys to Move'}</small>
  </div>
  <script>
    const config = {
      type: Phaser.AUTO,
      width: ${config.width},
      height: ${config.height},
      parent: 'game-container',
      physics: {
        default: '${config.physics || 'arcade'}',
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
      backgroundColor: '${getSceneBackground(visuals.colorScheme)}'
    };

    const game = new Phaser.Game(config);
    
    // Auto-focus
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
    
    // Game state
    let player;
    let enemies;
    let bullets;
    let powerUps;
    let cursors;
    let spaceKey;
    let shiftKey;
    let score = 0;
    let health = ${gameDesign.player?.health || 3};
    let wave = 0;
    let scoreText;
    let healthText;
    let waveText;
    let gameOver = false;
    let lastFired = 0;
    let fireRate = 200;
    let powerUpActive = null;
    let powerUpTimer = 0;

    // Game design constants
    const PLAYER_SPEED = ${gameDesign.player?.speed || 300};
    const ENEMY_TYPES = ${JSON.stringify(gameDesign.enemy_types || [])};
    const POWER_UPS = ${JSON.stringify(gameDesign.power_ups || [])};
    const MAX_WAVES = ${gameDesign.progression.wave_system ? 10 : 1};

    function preload() {
      ${textureCode}
    }

    function create() {
      // Player
      player = this.physics.add.sprite(${config.width / 2}, ${config.height - 80}, 'player');
      player.setCollideWorldBounds(true);

      // Groups
      enemies = this.physics.add.group();
      bullets = this.physics.add.group();
      powerUps = this.physics.add.group();

      // Controls
      cursors = this.input.keyboard.createCursorKeys();
      spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

      // UI
      scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '24px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      });

      healthText = this.add.text(16, 46, 'Health: ' + health, {
        fontSize: '20px',
        fill: '#ff0000',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 3
      });

      waveText = this.add.text(${config.width - 16}, 16, 'Wave: 1', {
        fontSize: '20px',
        fill: '#00ff00',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 3
      }).setOrigin(1, 0);

      // Collisions
      this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);
      this.physics.add.overlap(player, enemies, hitPlayer, null, this);
      this.physics.add.overlap(player, powerUps, collectPowerUp, null, this);

      // Start first wave
      startWave.call(this);
    }

    function update(time) {
      if (gameOver) return;

      // Player movement
      ${controlsCode}

      // Shooting
      if (spaceKey.isDown && time > lastFired) {
        fireBullet.call(this);
        lastFired = time + fireRate;
      }

      // Power-up timer
      if (powerUpActive && time > powerUpTimer) {
        deactivatePowerUp();
      }

      // Clean up off-screen entities
      bullets.children.entries.forEach(bullet => {
        if (bullet.y < 0 || bullet.y > ${config.height}) bullet.destroy();
      });

      enemies.children.entries.forEach(enemy => {
        if (enemy.y > ${config.height}) {
          enemy.destroy();
        }
      });

      // Check wave completion
      if (enemies.countActive() === 0 && wave < MAX_WAVES) {
        wave++;
        waveText.setText('Wave: ' + wave);
        this.time.delayedCall(2000, () => startWave.call(this));
      }

      // Check win condition
      if (wave >= MAX_WAVES && enemies.countActive() === 0) {
        winGame.call(this);
      }
    }

    ${enemySpawnCode}

    ${powerUpCode}

    function fireBullet() {
      const bullet = bullets.create(player.x, player.y - 20, 'bullet');
      bullet.setVelocityY(-400);
    }

    function hitEnemy(bullet, enemy) {
      bullet.destroy();
      enemy.health--;
      
      if (enemy.health <= 0) {
        enemy.destroy();
        score += enemy.points;
        scoreText.setText('Score: ' + score);
        
        // Chance to drop power-up
        if (Math.random() < 0.15) {
          spawnPowerUp.call(this, enemy.x, enemy.y);
        }
      }
    }

    function hitPlayer(player, enemy) {
      if (powerUpActive === 'shield') return;
      
      enemy.destroy();
      health--;
      healthText.setText('Health: ' + health);
      
      player.setTint(0xff0000);
      this.time.delayedCall(200, () => player.clearTint());
      
      if (health <= 0) {
        endGame.call(this);
      }
    }

    function winGame() {
      gameOver = true;
      this.physics.pause();
      
      const winText = this.add.text(${config.width / 2}, ${config.height / 2}, 'VICTORY!', {
        fontSize: '64px',
        fill: '#00ff00',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 6
      });
      winText.setOrigin(0.5);

      const finalScore = this.add.text(${config.width / 2}, ${config.height / 2 + 60}, 
        'Final Score: ' + score, {
        fontSize: '32px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      });
      finalScore.setOrigin(0.5);
    }

    function endGame() {
      gameOver = true;
      this.physics.pause();
      player.setTint(0xff0000);
      
      const gameOverText = this.add.text(${config.width / 2}, ${config.height / 2}, 'GAME OVER', {
        fontSize: '64px',
        fill: '#ff0000',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 6
      });
      gameOverText.setOrigin(0.5);

      const finalScore = this.add.text(${config.width / 2}, ${config.height / 2 + 60}, 
        'Final Score: ' + score, {
        fontSize: '32px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      });
      finalScore.setOrigin(0.5);
    }
  </script>
</body>
</html>
  `.trim();
}

function generateTextureCode(playerIcon: ReturnType<typeof mapEntityToIcon>, enemyIcons: ReturnType<typeof mapEntityToIcon>[], powerUpIcons: ReturnType<typeof mapEntityToIcon>[]): string {
  let code = `// Generate player texture\n`;
  code += generatePhaserIconTexture('player', playerIcon, 32);
  
  code += `\n// Generate bullet texture\n`;
  code += generatePhaserIconTexture('bullet', { collection: 'game-icons', icon: 'circle', color: '#ffff00' }, 8);
  
  enemyIcons.forEach((icon, i) => {
    code += `\n// Generate enemy${i} texture\n`;
    code += generatePhaserIconTexture(`enemy${i}`, icon, 28);
  });
  
  powerUpIcons.forEach((icon, i) => {
    code += `\n// Generate powerup${i} texture\n`;
    code += generatePhaserIconTexture(`powerup${i}`, icon, 24);
  });
  
  return code;
}

function generateEnemySpawnCode(enemyTypes: any[]): string {
  if (!enemyTypes.length) return '';
  
  return `
    function startWave() {
      const waveMultiplier = 1 + (wave * 0.2);
      
      ${enemyTypes.map((enemy, i) => `
      // Spawn ${enemy.name}
      this.time.addEvent({
        delay: ${enemy.spawn_rate || 2} * 1000,
        callback: () => {
          if (gameOver) return;
          const x = Phaser.Math.Between(50, ${800 - 50});
          const e = enemies.create(x, 50, 'enemy${i}');
          e.setVelocityY(${enemy.speed || 100} * waveMultiplier);
          e.health = ${enemy.health};
          e.points = ${enemy.points};
        },
        callbackScope: this,
        loop: true
      });
      `).join('\n')}
    }
  `;
}

function generatePowerUpCode(powerUps: any[]): string {
  if (!powerUps.length) return '';
  
  return `
    function spawnPowerUp(x, y) {
      const powerUpType = Phaser.Math.RND.pick(POWER_UPS);
      const powerUp = powerUps.create(x, y, 'powerup0');
      powerUp.setVelocityY(100);
      powerUp.powerUpType = powerUpType;
    }

    function collectPowerUp(player, powerUp) {
      powerUp.destroy();
      const type = powerUp.powerUpType;
      
      powerUpActive = type.type;
      powerUpTimer = this.time.now + (type.duration * 1000);
      
      if (type.type === 'shield') {
        player.setTint(0x4444ff);
      } else if (type.type.includes('fire') || type.type.includes('rapid')) {
        fireRate = 100;
      } else if (type.type.includes('spread')) {
        // Implement spread shot
      }
      
      score += 50;
      scoreText.setText('Score: ' + score);
    }

    function deactivatePowerUp() {
      if (powerUpActive === 'shield') {
        player.clearTint();
      } else if (powerUpActive.includes('fire')) {
        fireRate = 200;
      }
      powerUpActive = null;
    }
  `;
}

function generateControlsCode(controls: string[]): string {
  return `
      if (cursors.left.isDown) {
        player.setVelocityX(-PLAYER_SPEED);
      } else if (cursors.right.isDown) {
        player.setVelocityX(PLAYER_SPEED);
      } else {
        player.setVelocityX(0);
      }

      if (cursors.up.isDown) {
        player.setVelocityY(-PLAYER_SPEED);
      } else if (cursors.down.isDown) {
        player.setVelocityY(PLAYER_SPEED);
      } else {
        player.setVelocityY(0);
      }
  `;
}

function getBackgroundColor(colorScheme: string): string {
  const colors: Record<string, string> = {
    monochrome: '#000000',
    retro: '#1a1a2e',
    neon: '#0a0a2e',
    pastel: '#f5e6d3',
    dark: '#0d0d0d',
    vibrant: '#1a0033'
  };
  return colors[colorScheme] || '#000000';
}

function getSceneBackground(colorScheme: string): string {
  const colors: Record<string, string> = {
    monochrome: '#000000',
    retro: '#2d1b69',
    neon: '#0a0a2e',
    pastel: '#87CEEB',
    dark: '#001a00',
    vibrant: '#1a0033'
  };
  return colors[colorScheme] || '#000000';
}
