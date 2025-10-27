import { GameDesign } from '@/types/game-design';

/**
 * Game Preview Generator
 * 
 * When we can't generate a fully functional game, we generate a beautiful
 * UI preview that shows what the game WOULD look like. Users can then refine
 * it to add functionality.
 */

export function generateGamePreview(gameDesign: GameDesign): string {
  const category = gameDesign.subcategory.toLowerCase();
  
  // Detect game type and generate appropriate preview
  if (category.includes('ludo') || category.includes('board') || gameDesign.title.toLowerCase().includes('ludo')) {
    return generateLudoPreview(gameDesign);
  } else if (category.includes('chess') || gameDesign.title.toLowerCase().includes('chess')) {
    return generateChessPreview(gameDesign);
  } else if (category.includes('card') || category.includes('poker') || category.includes('blackjack')) {
    return generateCardGamePreview(gameDesign);
  } else if (category.includes('puzzle') || category.includes('match')) {
    return generatePuzzlePreview(gameDesign);
  } else {
    return generateGenericPreview(gameDesign);
  }
}

function generateLudoPreview(design: GameDesign): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${design.title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    
    .game-container {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 800px;
      width: 100%;
    }
    
    .game-header {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .game-title {
      font-size: 36px;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    
    .game-description {
      color: #666;
      font-size: 16px;
    }
    
    .ludo-board {
      width: 500px;
      height: 500px;
      margin: 0 auto;
      background: #fff;
      border: 3px solid #333;
      position: relative;
      display: grid;
      grid-template-columns: repeat(15, 1fr);
      grid-template-rows: repeat(15, 1fr);
    }
    
    .board-section {
      position: relative;
    }
    
    .home-area {
      grid-column: span 6;
      grid-row: span 6;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    
    .home-red { background: #ff6b6b; grid-column: 1 / 7; grid-row: 1 / 7; }
    .home-green { background: #51cf66; grid-column: 10 / 16; grid-row: 1 / 7; }
    .home-yellow { background: #ffd93d; grid-column: 10 / 16; grid-row: 10 / 16; }
    .home-blue { background: #4dabf7; grid-column: 1 / 7; grid-row: 10 / 16; }
    
    .path-cell {
      border: 1px solid #ddd;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #999;
    }
    
    .safe-zone {
      background: #f8f9fa;
      position: relative;
    }
    
    .safe-zone::after {
      content: '★';
      position: absolute;
      font-size: 20px;
      color: gold;
    }
    
    .center-area {
      grid-column: 7 / 10;
      grid-row: 7 / 10;
      background: linear-gradient(135deg, #ff6b6b 0%, #51cf66 25%, #ffd93d 50%, #4dabf7 75%, #ff6b6b 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
      color: white;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .game-controls {
      margin-top: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
    }
    
    .dice-container {
      text-align: center;
    }
    
    .dice {
      width: 80px;
      height: 80px;
      background: white;
      border: 3px solid #333;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .dice:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 12px rgba(0,0,0,0.2);
    }
    
    .dice:active {
      transform: scale(0.95);
    }
    
    .current-player {
      padding: 15px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 10px;
      font-size: 18px;
      font-weight: bold;
    }
    
    .preview-notice {
      margin-top: 30px;
      padding: 20px;
      background: #fff3cd;
      border: 2px solid #ffc107;
      border-radius: 10px;
      text-align: center;
    }
    
    .preview-notice h3 {
      color: #856404;
      margin-bottom: 10px;
      font-size: 20px;
    }
    
    .preview-notice p {
      color: #856404;
      margin-bottom: 15px;
    }
    
    .refine-button {
      padding: 12px 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .refine-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    
    .piece {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      position: absolute;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    
    .piece-red { background: #ff6b6b; }
    .piece-green { background: #51cf66; }
    .piece-yellow { background: #ffd93d; }
    .piece-blue { background: #4dabf7; }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    .dice.rolling {
      animation: pulse 0.3s infinite;
    }
  </style>
</head>
<body>
  <div class="game-container">
    <div class="game-header">
      <h1 class="game-title">${design.title}</h1>
      <p class="game-description">${design.description}</p>
    </div>
    
    <div class="ludo-board">
      <!-- Home Areas -->
      <div class="home-area home-red">
        <div class="piece piece-red" style="top: 30%; left: 30%;"></div>
        <div class="piece piece-red" style="top: 30%; right: 30%;"></div>
        <div class="piece piece-red" style="bottom: 30%; left: 30%;"></div>
        <div class="piece piece-red" style="bottom: 30%; right: 30%;"></div>
      </div>
      
      <div class="home-area home-green">
        <div class="piece piece-green" style="top: 30%; left: 30%;"></div>
        <div class="piece piece-green" style="top: 30%; right: 30%;"></div>
        <div class="piece piece-green" style="bottom: 30%; left: 30%;"></div>
        <div class="piece piece-green" style="bottom: 30%; right: 30%;"></div>
      </div>
      
      <div class="home-area home-yellow">
        <div class="piece piece-yellow" style="top: 30%; left: 30%;"></div>
        <div class="piece piece-yellow" style="top: 30%; right: 30%;"></div>
        <div class="piece piece-yellow" style="bottom: 30%; left: 30%;"></div>
        <div class="piece piece-yellow" style="bottom: 30%; right: 30%;"></div>
      </div>
      
      <div class="home-area home-blue">
        <div class="piece piece-blue" style="top: 30%; left: 30%;"></div>
        <div class="piece piece-blue" style="top: 30%; right: 30%;"></div>
        <div class="piece piece-blue" style="bottom: 30%; left: 30%;"></div>
        <div class="piece piece-blue" style="bottom: 30%; right: 30%;"></div>
      </div>
      
      <!-- Center -->
      <div class="center-area">🏆</div>
      
      <!-- Path cells (simplified for preview) -->
      ${generateLudoPath()}
    </div>
    
    <div class="game-controls">
      <div class="dice-container">
        <div class="dice" id="dice" onclick="rollDice()">🎲</div>
        <p style="margin-top: 10px; font-weight: bold;">Click to Roll</p>
      </div>
      
      <div class="current-player">
        Current Player: <span id="player">Red</span>
      </div>
    </div>
    
    <div class="preview-notice">
      <h3>🎨 UI Preview Mode</h3>
      <p>This is a visual preview of your Ludo game. The full game mechanics are being generated.</p>
      <p><strong>Use the refinement console below to add:</strong></p>
      <p>• Piece movement logic • Dice rolling mechanics • Turn-based system • Win conditions</p>
      <button class="refine-button" onclick="showRefinementTips()">
        ✨ Refine This Game
      </button>
    </div>
  </div>
  
  <script>
    let diceValue = 1;
    let currentPlayer = 0;
    const players = ['Red', 'Green', 'Yellow', 'Blue'];
    const colors = ['#ff6b6b', '#51cf66', '#ffd93d', '#4dabf7'];
    
    function rollDice() {
      const dice = document.getElementById('dice');
      dice.classList.add('rolling');
      
      let rolls = 0;
      const rollInterval = setInterval(() => {
        diceValue = Math.floor(Math.random() * 6) + 1;
        dice.textContent = diceValue;
        rolls++;
        
        if (rolls > 10) {
          clearInterval(rollInterval);
          dice.classList.remove('rolling');
          
          // Switch player
          setTimeout(() => {
            currentPlayer = (currentPlayer + 1) % 4;
            document.getElementById('player').textContent = players[currentPlayer];
            document.querySelector('.current-player').style.background = 
              \`linear-gradient(135deg, \${colors[currentPlayer]} 0%, \${colors[(currentPlayer + 1) % 4]} 100%)\`;
          }, 500);
        }
      }, 100);
    }
    
    function showRefinementTips() {
      alert('💡 Refinement Tips:\\n\\n' +
            '1. "Add piece movement when clicking on pieces"\\n' +
            '2. "Implement capturing when landing on opponent"\\n' +
            '3. "Add safe zones that prevent capturing"\\n' +
            '4. "Create home stretch for final pieces"\\n' +
            '5. "Add win condition when all pieces reach home"\\n\\n' +
            'Use the refinement console below to improve this game!');
    }
    
    // Auto-roll demo
    setTimeout(() => {
      rollDice();
    }, 1000);
  </script>
</body>
</html>
  `;
}

function generateLudoPath(): string {
  // Generate simplified path cells for visual preview
  let pathHTML = '';
  const pathPositions = [
    // Top row
    { col: 7, row: 1 }, { col: 7, row: 2 }, { col: 7, row: 3 },
    { col: 7, row: 4 }, { col: 7, row: 5 }, { col: 7, row: 6 },
    // Right column
    { col: 10, row: 7 }, { col: 11, row: 7 }, { col: 12, row: 7 },
    { col: 13, row: 7 }, { col: 14, row: 7 }, { col: 15, row: 7 },
  ];
  
  pathPositions.forEach((pos, i) => {
    const isSafe = i % 6 === 0;
    pathHTML += `<div class="path-cell ${isSafe ? 'safe-zone' : ''}" 
                      style="grid-column: ${pos.col}; grid-row: ${pos.row};"></div>`;
  });
  
  return pathHTML;
}

function generateChessPreview(design: GameDesign): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${design.title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    
    .chess-container {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    
    .chess-board {
      width: 480px;
      height: 480px;
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      grid-template-rows: repeat(8, 1fr);
      border: 4px solid #333;
    }
    
    .chess-square {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .chess-square:hover {
      transform: scale(1.05);
      z-index: 10;
    }
    
    .light { background: #f0d9b5; }
    .dark { background: #b58863; }
    
    .preview-notice {
      margin-top: 20px;
      padding: 20px;
      background: #fff3cd;
      border: 2px solid #ffc107;
      border-radius: 10px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="chess-container">
    <h1 style="text-align: center; margin-bottom: 20px;">${design.title}</h1>
    <div class="chess-board" id="board"></div>
    <div class="preview-notice">
      <h3>🎨 UI Preview Mode</h3>
      <p>Chess board preview. Use refinement to add move validation and game logic!</p>
    </div>
  </div>
  
  <script>
    const pieces = {
      '♜': 'black-rook', '♞': 'black-knight', '♝': 'black-bishop',
      '♛': 'black-queen', '♚': 'black-king', '♟': 'black-pawn',
      '♖': 'white-rook', '♘': 'white-knight', '♗': 'white-bishop',
      '♕': 'white-queen', '♔': 'white-king', '♙': 'white-pawn'
    };
    
    const initialBoard = [
      ['♜','♞','♝','♛','♚','♝','♞','♜'],
      ['♟','♟','♟','♟','♟','♟','♟','♟'],
      ['','','','','','','',''],
      ['','','','','','','',''],
      ['','','','','','','',''],
      ['','','','','','','',''],
      ['♙','♙','♙','♙','♙','♙','♙','♙'],
      ['♖','♘','♗','♕','♔','♗','♘','♖']
    ];
    
    const board = document.getElementById('board');
    initialBoard.forEach((row, i) => {
      row.forEach((piece, j) => {
        const square = document.createElement('div');
        square.className = \`chess-square \${(i + j) % 2 === 0 ? 'light' : 'dark'}\`;
        square.textContent = piece;
        board.appendChild(square);
      });
    });
  </script>
</body>
</html>
  `;
}

function generateCardGamePreview(design: GameDesign): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${design.title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    
    .card-table {
      background: #2d5016;
      border-radius: 200px;
      padding: 60px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      text-align: center;
    }
    
    .card {
      width: 80px;
      height: 120px;
      background: white;
      border-radius: 8px;
      display: inline-block;
      margin: 5px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      font-size: 40px;
      line-height: 120px;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .card:hover {
      transform: translateY(-10px);
    }
    
    .card.red { color: #e74c3c; }
    .card.black { color: #2c3e50; }
  </style>
</head>
<body>
  <div class="card-table">
    <h1 style="color: white; margin-bottom: 30px;">${design.title}</h1>
    <div id="hand"></div>
    <div class="preview-notice" style="color: white; margin-top: 30px;">
      <h3>🎨 Card Game Preview</h3>
      <p>Use refinement to add game rules and mechanics!</p>
    </div>
  </div>
  
  <script>
    const suits = ['♠','♥','♦','♣'];
    const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const hand = document.getElementById('hand');
    
    for (let i = 0; i < 5; i++) {
      const card = document.createElement('div');
      const suit = suits[Math.floor(Math.random() * 4)];
      const value = values[Math.floor(Math.random() * 13)];
      card.className = \`card \${suit === '♥' || suit === '♦' ? 'red' : 'black'}\`;
      card.textContent = value + suit;
      hand.appendChild(card);
    }
  </script>
</body>
</html>
  `;
}

function generatePuzzlePreview(design: GameDesign): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${design.title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    
    .puzzle-grid {
      display: grid;
      grid-template-columns: repeat(8, 60px);
      grid-template-rows: repeat(8, 60px);
      gap: 2px;
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    
    .tile {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .tile:hover {
      transform: scale(1.1);
    }
  </style>
</head>
<body>
  <div>
    <h1 style="color: white; text-align: center; margin-bottom: 20px;">${design.title}</h1>
    <div class="puzzle-grid" id="grid"></div>
    <div style="color: white; text-align: center; margin-top: 20px;">
      <h3>🎨 Puzzle Preview</h3>
      <p>Use refinement to add match logic and animations!</p>
    </div>
  </div>
  
  <script>
    const colors = ['#ff6b6b', '#51cf66', '#ffd93d', '#4dabf7', '#ff6b9d'];
    const grid = document.getElementById('grid');
    
    for (let i = 0; i < 64; i++) {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.style.background = colors[Math.floor(Math.random() * colors.length)];
      tile.textContent = '●';
      grid.appendChild(tile);
    }
  </script>
</body>
</html>
  `;
}

function generateGenericPreview(design: GameDesign): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${design.title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    
    .preview-container {
      background: white;
      border-radius: 20px;
      padding: 40px;
      max-width: 600px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    
    .game-icon {
      font-size: 120px;
      margin: 20px 0;
    }
    
    .preview-notice {
      margin-top: 30px;
      padding: 20px;
      background: #fff3cd;
      border: 2px solid #ffc107;
      border-radius: 10px;
    }
  </style>
</head>
<body>
  <div class="preview-container">
    <h1>${design.title}</h1>
    <div class="game-icon">🎮</div>
    <p style="font-size: 18px; color: #666; margin: 20px 0;">${design.description}</p>
    
    <div class="preview-notice">
      <h3 style="color: #856404;">🎨 Game Preview Mode</h3>
      <p style="color: #856404;">This game type requires specialized implementation.</p>
      <p style="color: #856404;"><strong>Use the refinement console to:</strong></p>
      <ul style="text-align: left; color: #856404; margin: 15px 0;">
        <li>Add specific game mechanics</li>
        <li>Implement game rules</li>
        <li>Create interactive elements</li>
        <li>Add win conditions</li>
      </ul>
    </div>
  </div>
</body>
</html>
  `;
}
