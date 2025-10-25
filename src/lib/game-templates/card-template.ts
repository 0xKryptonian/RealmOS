import { GameSpec } from '@/types/game-spec';

/**
 * Phaser.js Card Game Template (Memory Match / Concentration)
 */

export function generateCardGame(spec: GameSpec): string {
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
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      font-family: 'Courier New', monospace;
    }
    #game-container {
      border: 4px solid #333;
      box-shadow: 0 0 30px rgba(30,60,114,0.7);
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
      backgroundColor: '${visuals.colorScheme === 'monochrome' ? '#000000' : '#0f2027'}'
    };

    const game = new Phaser.Game(config);
    
    const CARD_WIDTH = 80;
    const CARD_HEIGHT = 110;
    const GRID_COLS = 4;
    const GRID_ROWS = 4;
    const CARD_COLORS = [
      0xff0000, 0x00ff00, 0x0000ff, 0xffff00,
      0xff00ff, 0x00ffff, 0xff8800, 0x8800ff
    ];
    
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let moves = 0;
    let canFlip = true;
    let scoreText;
    let movesText;
    let gameOver = false;

    function preload() {
      this.textures.generate('cardBack', { 
        data: ['1'], 
        pixelWidth: CARD_WIDTH - 4, 
        pixelHeight: CARD_HEIGHT - 4 
      });
      
      CARD_COLORS.forEach((color, i) => {
        this.textures.generate(\`card\${i}\`, { 
          data: ['2'], 
          pixelWidth: CARD_WIDTH - 4, 
          pixelHeight: CARD_HEIGHT - 4 
        });
      });
    }

    function create() {
      // Title
      this.add.text(${config.width / 2}, 30, '${title}', {
        fontSize: '32px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      }).setOrigin(0.5);

      // Stats
      movesText = this.add.text(16, 70, 'Moves: 0', {
        fontSize: '24px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 3
      });

      scoreText = this.add.text(${config.width - 16}, 70, 'Pairs: 0/8', {
        fontSize: '24px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 3
      }).setOrigin(1, 0);

      // Create card deck (pairs)
      const cardValues = [];
      for (let i = 0; i < 8; i++) {
        cardValues.push(i, i);
      }
      Phaser.Utils.Array.Shuffle(cardValues);

      // Create cards
      const startX = (${config.width} - (GRID_COLS * (CARD_WIDTH + 10))) / 2 + CARD_WIDTH / 2;
      const startY = 120;

      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          const index = row * GRID_COLS + col;
          const x = startX + col * (CARD_WIDTH + 10);
          const y = startY + row * (CARD_HEIGHT + 10);
          
          const card = this.add.sprite(x, y, 'cardBack');
          card.setInteractive();
          card.setTint(0x333333);
          card.setData('value', cardValues[index]);
          card.setData('flipped', false);
          card.setData('matched', false);
          
          card.on('pointerdown', () => flipCard.call(this, card));
          
          cards.push(card);
        }
      }

      // Instructions
      this.add.text(${config.width / 2}, ${config.height - 20}, 'Click cards to find matching pairs', {
        fontSize: '18px',
        fill: '#aaa',
        fontFamily: 'Courier New'
      }).setOrigin(0.5);
    }

    function update() {
      // Game logic handled by events
    }

    function flipCard(card) {
      if (!canFlip || card.getData('flipped') || card.getData('matched')) {
        return;
      }

      // Flip the card
      card.setData('flipped', true);
      const value = card.getData('value');
      card.setTexture(\`card\${value}\`);
      card.setTint(CARD_COLORS[value]);

      this.tweens.add({
        targets: card,
        scaleX: 1.1,
        duration: 100,
        yoyo: true
      });

      flippedCards.push(card);

      // Check for match
      if (flippedCards.length === 2) {
        canFlip = false;
        moves++;
        movesText.setText('Moves: ' + moves);

        this.time.delayedCall(800, () => {
          checkMatch.call(this);
        });
      }
    }

    function checkMatch() {
      const card1 = flippedCards[0];
      const card2 = flippedCards[1];

      if (card1.getData('value') === card2.getData('value')) {
        // Match found!
        card1.setData('matched', true);
        card2.setData('matched', true);
        matchedPairs++;
        scoreText.setText('Pairs: ' + matchedPairs + '/8');

        // Animate matched cards
        this.tweens.add({
          targets: [card1, card2],
          alpha: 0.5,
          scale: 0.9,
          duration: 300
        });

        if (matchedPairs === 8) {
          this.time.delayedCall(500, () => {
            winGame.call(this);
          });
        }
      } else {
        // No match - flip back
        this.tweens.add({
          targets: [card1, card2],
          scaleX: 0,
          duration: 150,
          onComplete: () => {
            card1.setTexture('cardBack');
            card2.setTexture('cardBack');
            card1.setTint(0x333333);
            card2.setTint(0x333333);
            card1.setData('flipped', false);
            card2.setData('flipped', false);
            
            this.tweens.add({
              targets: [card1, card2],
              scaleX: 1,
              duration: 150
            });
          }
        });
      }

      flippedCards = [];
      canFlip = true;
    }

    function winGame() {
      gameOver = true;

      const winText = this.add.text(${config.width / 2}, ${config.height / 2}, 'YOU WIN!', {
        fontSize: '64px',
        fill: '#00ff00',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 6
      });
      winText.setOrigin(0.5);

      const movesText = this.add.text(${config.width / 2}, ${config.height / 2 + 60}, 'Completed in ' + moves + ' moves', {
        fontSize: '28px',
        fill: '#fff',
        fontFamily: 'Courier New',
        stroke: '#000',
        strokeThickness: 4
      });
      movesText.setOrigin(0.5);

      // Calculate rating
      let rating = '⭐⭐⭐';
      if (moves > 20) rating = '⭐⭐';
      if (moves > 30) rating = '⭐';

      const ratingText = this.add.text(${config.width / 2}, ${config.height / 2 + 95}, rating, {
        fontSize: '32px',
        fill: '#ffff00',
        fontFamily: 'Courier New'
      });
      ratingText.setOrigin(0.5);
    }
  </script>
</body>
</html>
  `.trim();
}
