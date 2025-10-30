import { GameSpec } from '../../types/game-spec';

/**
 * Phaser.js Strategy Game Template (Tower Defense)
 */

export function generateStrategyGame(spec: GameSpec): string {
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
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      font-family: 'Courier New', monospace;
    }
    #game-container {
      border: 4px solid #333;
      box-shadow: 0 0 30px rgba(52,73,94,0.7);
    }
  </style>
</head>
<body>
  <div id="game-container"></div>
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
      backgroundColor: '${visuals.colorScheme === 'monochrome' ? '#000000' : '#1a1a1a'}'
    };

    const game = new Phaser.Game(gameConfig);
    
    const PATH = [
      { x: 0, y: 200 },
      { x: 200, y: 200 },
      { x: 200, y: 400 },
      { x: 500, y: 400 },
      { x: 500, y: 200 },
      { x: ${config.width}, y: 200 }
    ];
    
    let towers = [];
    let enemies;
    let bullets;
    let money = 200;
    let lives = 10;
    let wave = 0;
    let enemiesInWave = 5;
    let moneyText;
    let livesText;
    let waveText;
    let gameOver = false;
    let selectedTowerType = null;
    let towerButtons = [];

    function preload() {
      this.textures.generate('tower', { data: ['1'], pixelWidth: 40, pixelHeight: 40 });
      this.textures.generate('enemy', { data: ['2'], pixelWidth: 30, pixelHeight: 30 });
      this.textures.generate('bullet', { data: ['3'], pixelWidth: 8, pixelHeight: 8 });
      this.textures.generate('path', { data: ['4'], pixelWidth: 20, pixelHeight: 20 });
      this.textures.generate('button', { data: ['5'], pixelWidth: 100, pixelHeight: 60 });
    }

    function create() {
      // Draw path
      const graphics = this.add.graphics();
      graphics.lineStyle(40, 0x8b4513, 0.5);
      graphics.beginPath();
      graphics.moveTo(PATH[0].x, PATH[0].y);
      for (let i = 1; i < PATH.length; i++) {
        graphics.lineTo(PATH[i].x, PATH[i].y);
      }
      graphics.strokePath();

      // Groups
      enemies = this.physics.add.group();
      bullets = this.physics.add.group();

      // UI
      moneyText = this.add.text(16, 16, 'Money: $200', {
        fontSize: '24px',
        fill: '#ffff00',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      });

      livesText = this.add.text(16, 46, 'Lives: 10', {
        fontSize: '24px',
        fill: '#ff0000',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      });

      waveText = this.add.text(${config.width / 2}, 16, 'Wave: 0', {
        fontSize: '24px',
        fill: '#00ff00',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      }).setOrigin(0.5, 0);

      // Tower selection buttons
      const towerTypes = [
        { name: 'Basic', cost: 50, damage: 10, range: 150, color: 0x00ff00 },
        { name: 'Rapid', cost: 100, damage: 5, range: 120, color: 0x0088ff },
        { name: 'Heavy', cost: 150, damage: 30, range: 180, color: 0xff0000 }
      ];

      towerTypes.forEach((type, i) => {
        const x = ${config.width - 120};
        const y = 100 + i * 80;
        
        const button = this.add.sprite(x, y, 'button');
        button.setInteractive();
        button.setTint(type.color);
        
        const nameText = this.add.text(x, y - 15, type.name, {
          fontSize: '16px',
          fill: '#fff',
          fontFamily: 'Courier New'
        }).setOrigin(0.5);

        const costText = this.add.text(x, y + 5, \`$\${type.cost}\`, {
          fontSize: '14px',
          fill: '#ffff00',
          fontFamily: 'Courier New'
        }).setOrigin(0.5);

        button.on('pointerdown', () => {
          if (money >= type.cost) {
            selectedTowerType = type;
            towerButtons.forEach(b => b.button.setAlpha(0.5));
            button.setAlpha(1);
          }
        });

        towerButtons.push({ button, type });
      });

      // Click to place tower
      this.input.on('pointerdown', (pointer) => {
        if (selectedTowerType && pointer.x < ${config.width - 150}) {
          placeTower.call(this, pointer.x, pointer.y);
        }
      });

      // Start wave button
      const startButton = this.add.text(${config.width / 2}, ${config.height - 30}, 
        'START WAVE', {
        fontSize: '24px',
        fill: '#00ff00',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      }).setOrigin(0.5);
      startButton.setInteractive();
      startButton.on('pointerdown', () => startWave.call(this));

      // Collisions
      this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);
    }

    function update() {
      if (gameOver) return;

      // Tower shooting
      towers.forEach(tower => {
        tower.cooldown = Math.max(0, tower.cooldown - 1);
        
        if (tower.cooldown === 0) {
          const target = findNearestEnemy(tower);
          if (target) {
            shootBullet.call(this, tower, target);
            tower.cooldown = 60 / (tower.type.name === 'Rapid' ? 3 : 1);
          }
        }
      });

      // Move enemies along path
      enemies.children.entries.forEach(enemy => {
        if (!enemy.active) return;

        const target = PATH[enemy.pathIndex];
        const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, target.x, target.y);

        if (distance < 5) {
          enemy.pathIndex++;
          if (enemy.pathIndex >= PATH.length) {
            enemy.destroy();
            lives--;
            livesText.setText('Lives: ' + lives);
            if (lives <= 0) {
              endGame.call(this);
            }
          }
        } else {
          this.physics.moveToObject(enemy, target, 100);
        }
      });
    }

    function placeTower(x, y) {
      if (!selectedTowerType || money < selectedTowerType.cost) return;

      const tower = this.add.sprite(x, y, 'tower');
      tower.setTint(selectedTowerType.color);
      tower.type = selectedTowerType;
      tower.cooldown = 0;

      // Range indicator
      const rangeCircle = this.add.circle(x, y, selectedTowerType.range, 0xffffff, 0.1);
      tower.rangeCircle = rangeCircle;

      towers.push(tower);
      money -= selectedTowerType.cost;
      moneyText.setText('Money: $' + money);
      selectedTowerType = null;
      towerButtons.forEach(b => b.button.setAlpha(0.5));
    }

    function startWave() {
      if (enemies.countActive() > 0) return;

      wave++;
      enemiesInWave = 5 + wave * 2;
      waveText.setText('Wave: ' + wave);

      for (let i = 0; i < enemiesInWave; i++) {
        this.time.delayedCall(i * 1000, () => {
          spawnEnemy.call(this);
        });
      }
    }

    function spawnEnemy() {
      const enemy = enemies.create(PATH[0].x, PATH[0].y, 'enemy');
      enemy.setTint(0xff0000);
      enemy.pathIndex = 1;
      enemy.health = 20 + wave * 5;
      enemy.maxHealth = enemy.health;
    }

    function findNearestEnemy(tower) {
      let nearest = null;
      let minDist = tower.type.range;

      enemies.children.entries.forEach(enemy => {
        if (!enemy.active) return;
        const dist = Phaser.Math.Distance.Between(tower.x, tower.y, enemy.x, enemy.y);
        if (dist < minDist) {
          minDist = dist;
          nearest = enemy;
        }
      });

      return nearest;
    }

    function shootBullet(tower, target) {
      const bullet = bullets.create(tower.x, tower.y, 'bullet');
      bullet.setTint(0xffff00);
      bullet.damage = tower.type.damage;
      this.physics.moveToObject(bullet, target, 400);
    }

    function hitEnemy(bullet, enemy) {
      bullet.destroy();
      enemy.health -= bullet.damage;

      if (enemy.health <= 0) {
        enemy.destroy();
        money += 25;
        moneyText.setText('Money: $' + money);

        // Check if wave complete
        if (enemies.countActive() === 0) {
          money += 50; // Wave bonus
          moneyText.setText('Money: $' + money);
        }
      }
    }

    function endGame() {
      gameOver = true;
      this.physics.pause();

      const gameOverText = this.add.text(${config.width / 2}, ${config.height / 2}, 
        'GAME OVER', {
        fontSize: '64px',
        fill: '#ff0000',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 6
      });
      gameOverText.setOrigin(0.5);

      const waveText = this.add.text(${config.width / 2}, ${config.height / 2 + 60}, 
        'Survived ' + wave + ' waves', {
        fontSize: '28px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      });
      waveText.setOrigin(0.5);
    }
  </script>
</body>
</html>
  `.trim();
}
