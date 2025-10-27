import { GameSpec } from '@/types/game-spec';

/**
 * Phaser.js Idle/Clicker Game Template
 */

export function generateIdleGame(spec: GameSpec): string {
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Courier New', monospace;
    }
    #game-container {
      border: 4px solid #333;
      box-shadow: 0 0 30px rgba(102,126,234,0.5);
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
      scene: {
        preload: preload,
        create: create,
        update: update
      },
      backgroundColor: '${visuals.colorScheme === 'monochrome' ? '#000000' : '#1a1a2e'}'
    };

    const game = new Phaser.Game(gameConfig);
    
    let resources = 0;
    let resourcesPerClick = 1;
    let resourcesPerSecond = 0;
    let clickPower = 1;
    let autoClickers = 0;
    let multipliers = 0;
    
    let resourceText;
    let perSecondText;
    let clickButton;
    let upgradeButtons = [];
    
    const UPGRADES = [
      { name: 'Auto Clicker', cost: 10, effect: 'auto', value: 1, owned: 0 },
      { name: 'Click Power', cost: 25, effect: 'click', value: 1, owned: 0 },
      { name: 'Multiplier', cost: 100, effect: 'multiplier', value: 2, owned: 0 },
      { name: 'Super Clicker', cost: 500, effect: 'auto', value: 10, owned: 0 },
      { name: 'Mega Power', cost: 1000, effect: 'click', value: 10, owned: 0 }
    ];

    function preload() {
      this.textures.generate('clickButton', { data: ['1'], pixelWidth: 150, pixelHeight: 150 });
      this.textures.generate('upgradeButton', { data: ['2'], pixelWidth: 200, pixelHeight: 60 });
    }

    function create() {
      // Title
      this.add.text(${config.width / 2}, 40, '${title}', {
        fontSize: '36px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      }).setOrigin(0.5);

      // Resource counter
      resourceText = this.add.text(${config.width / 2}, 100, 'Resources: 0', {
        fontSize: '32px',
        fill: '#ffff00',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      }).setOrigin(0.5);

      perSecondText = this.add.text(${config.width / 2}, 135, 'Per Second: 0', {
        fontSize: '20px',
        fill: '#aaa',
        fontFamily: 'Courier New'
      }).setOrigin(0.5);

      // Click button
      clickButton = this.add.sprite(${config.width / 2}, 280, 'clickButton');
      clickButton.setInteractive();
      clickButton.setTint(0x00ff00);
      
      clickButton.on('pointerdown', () => {
        clickResource.call(this);
      });

      this.add.text(${config.width / 2}, 280, 'CLICK', {
        fontSize: '32px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      }).setOrigin(0.5);

      // Upgrades section
      this.add.text(50, 400, 'UPGRADES', {
        fontSize: '24px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 3
      });

      // Create upgrade buttons
      UPGRADES.forEach((upgrade, i) => {
        const y = 450 + i * 70;
        
        const button = this.add.sprite(${config.width / 2}, y, 'upgradeButton');
        button.setInteractive();
        button.setTint(0x4444ff);
        
        const nameText = this.add.text(${config.width / 2 - 90}, y - 15, upgrade.name, {
          fontSize: '18px',
          fill: '#fff',
          fontFamily: 'Courier New'
        });

        const costText = this.add.text(${config.width / 2 - 90}, y + 5, \`Cost: \${upgrade.cost}\`, {
          fontSize: '14px',
          fill: '#ffff00',
          fontFamily: 'Courier New'
        });

        const ownedText = this.add.text(${config.width / 2 + 70}, y, 'x0', {
          fontSize: '16px',
          fill: '#aaa',
          fontFamily: 'Courier New'
        });

        button.on('pointerdown', () => {
          buyUpgrade.call(this, i);
        });

        upgradeButtons.push({
          button,
          nameText,
          costText,
          ownedText,
          upgrade
        });
      });

      // Auto-generate resources
      this.time.addEvent({
        delay: 1000,
        callback: generateResources,
        callbackScope: this,
        loop: true
      });
    }

    function update() {
      // Update button states
      upgradeButtons.forEach(btn => {
        if (resources >= btn.upgrade.cost) {
          btn.button.setTint(0x00ff00);
        } else {
          btn.button.setTint(0x444444);
        }
      });
    }

    function clickResource() {
      const amount = resourcesPerClick * (multipliers > 0 ? Math.pow(2, multipliers) : 1);
      resources += amount;
      updateDisplay();

      // Visual feedback
      const plusText = this.add.text(
        clickButton.x + Phaser.Math.Between(-30, 30),
        clickButton.y - 50,
        '+' + amount,
        {
          fontSize: '24px',
          fill: '#ffff00',
          fontFamily: 'Courier New'
        }
      ).setOrigin(0.5);

      this.tweens.add({
        targets: plusText,
        y: plusText.y - 50,
        alpha: 0,
        duration: 1000,
        onComplete: () => plusText.destroy()
      });

      // Button animation
      this.tweens.add({
        targets: clickButton,
        scale: 1.1,
        duration: 100,
        yoyo: true
      });
    }

    function generateResources() {
      if (resourcesPerSecond > 0) {
        const amount = resourcesPerSecond * (multipliers > 0 ? Math.pow(2, multipliers) : 1);
        resources += amount;
        updateDisplay();
      }
    }

    function buyUpgrade(index) {
      const upgrade = UPGRADES[index];
      
      if (resources >= upgrade.cost) {
        resources -= upgrade.cost;
        upgrade.owned++;
        
        // Apply upgrade effect
        if (upgrade.effect === 'auto') {
          autoClickers += upgrade.value;
          resourcesPerSecond = autoClickers;
        } else if (upgrade.effect === 'click') {
          clickPower += upgrade.value;
          resourcesPerClick = clickPower;
        } else if (upgrade.effect === 'multiplier') {
          multipliers++;
        }

        // Increase cost
        upgrade.cost = Math.floor(upgrade.cost * 1.5);
        
        updateDisplay();
        updateUpgradeButtons();
      }
    }

    function updateDisplay() {
      resourceText.setText('Resources: ' + Math.floor(resources));
      const perSec = resourcesPerSecond * (multipliers > 0 ? Math.pow(2, multipliers) : 1);
      perSecondText.setText('Per Second: ' + perSec);
    }

    function updateUpgradeButtons() {
      upgradeButtons.forEach((btn, i) => {
        btn.costText.setText(\`Cost: \${UPGRADES[i].cost}\`);
        btn.ownedText.setText('x' + UPGRADES[i].owned);
      });
    }
  </script>
</body>
</html>
  `.trim();
}
