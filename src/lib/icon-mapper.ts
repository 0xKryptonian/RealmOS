/**
 * Icon Mapper - Maps game entities to Iconify icons
 * Uses game-icons collection for game-specific sprites
 */

export interface IconMapping {
  collection: string;
  icon: string;
  color?: string;
}

// Map entity types to appropriate game icons
export function mapEntityToIcon(entityType: string, category: string): IconMapping {
  const type = entityType.toLowerCase();
  
  // Player icons
  if (type.includes('player') || type.includes('hero') || type.includes('character')) {
    if (category.includes('space') || category.includes('sci-fi')) {
      return { collection: 'game-icons', icon: 'spaceship', color: '#00ff00' };
    }
    if (category.includes('medieval') || category.includes('fantasy')) {
      return { collection: 'game-icons', icon: 'knight-helmet', color: '#ffd700' };
    }
    return { collection: 'game-icons', icon: 'player-next', color: '#00ffff' };
  }
  
  // Spaceship/Space themed
  if (type.includes('spaceship') || type.includes('rocket')) {
    return { collection: 'game-icons', icon: 'rocket', color: '#00ff00' };
  }
  
  // Enemies
  if (type.includes('alien') || type.includes('enemy') || type.includes('monster')) {
    return { collection: 'game-icons', icon: 'alien-skull', color: '#ff0000' };
  }
  
  if (type.includes('robot') || type.includes('drone')) {
    return { collection: 'game-icons', icon: 'robot-golem', color: '#ff4444' };
  }
  
  if (type.includes('zombie') || type.includes('undead')) {
    return { collection: 'game-icons', icon: 'zombie', color: '#88ff88' };
  }
  
  // Power-ups
  if (type.includes('shield') || type.includes('armor')) {
    return { collection: 'game-icons', icon: 'shield', color: '#4444ff' };
  }
  
  if (type.includes('heart') || type.includes('health')) {
    return { collection: 'game-icons', icon: 'health-normal', color: '#ff0000' };
  }
  
  if (type.includes('star') || type.includes('bonus')) {
    return { collection: 'game-icons', icon: 'star-medal', color: '#ffff00' };
  }
  
  if (type.includes('coin') || type.includes('money') || type.includes('gold')) {
    return { collection: 'game-icons', icon: 'gold-stack', color: '#ffd700' };
  }
  
  if (type.includes('gem') || type.includes('diamond') || type.includes('crystal')) {
    return { collection: 'game-icons', icon: 'gem', color: '#00ffff' };
  }
  
  if (type.includes('fire') || type.includes('rapid')) {
    return { collection: 'game-icons', icon: 'fire-ray', color: '#ff6600' };
  }
  
  // Weapons
  if (type.includes('bullet') || type.includes('projectile')) {
    return { collection: 'game-icons', icon: 'bullet-impacts', color: '#ffff00' };
  }
  
  if (type.includes('laser') || type.includes('beam')) {
    return { collection: 'game-icons', icon: 'laser-blast', color: '#00ffff' };
  }
  
  // Obstacles
  if (type.includes('rock') || type.includes('stone') || type.includes('asteroid')) {
    return { collection: 'game-icons', icon: 'stone-pile', color: '#888888' };
  }
  
  if (type.includes('spike') || type.includes('trap')) {
    return { collection: 'game-icons', icon: 'spikes', color: '#ff0000' };
  }
  
  // Vehicles
  if (type.includes('car') || type.includes('vehicle')) {
    return { collection: 'game-icons', icon: 'race-car', color: '#ff0000' };
  }
  
  if (type.includes('tank')) {
    return { collection: 'game-icons', icon: 'tank', color: '#00ff00' };
  }
  
  // Board game pieces
  if (type.includes('dice') || type.includes('die')) {
    return { collection: 'game-icons', icon: 'dice-six-faces-six', color: '#ffffff' };
  }
  
  if (type.includes('pawn') || type.includes('piece')) {
    return { collection: 'game-icons', icon: 'chess-pawn', color: '#0000ff' };
  }
  
  // Default fallback
  return { collection: 'game-icons', icon: 'circle', color: '#ffffff' };
}

// Generate SVG icon code for embedding in games
export function generateIconSVG(mapping: IconMapping, size: number = 32): string {
  // For now, return a simple colored circle
  // In production, you'd fetch actual SVG from Iconify API
  const color = mapping.color || '#ffffff';
  
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" 
              fill="${color}" stroke="#000" stroke-width="2"/>
    </svg>
  `;
}

// Get icon URL from Iconify CDN
export function getIconifyURL(mapping: IconMapping): string {
  return `https://api.iconify.design/${mapping.collection}/${mapping.icon}.svg?color=${encodeURIComponent(mapping.color || '#ffffff')}`;
}

// Generate Phaser texture code using icon
export function generatePhaserIconTexture(
  entityName: string,
  mapping: IconMapping,
  size: number = 32
): string {
  const color = mapping.color || '#ffffff';
  const colorHex = color.replace('#', '0x');
  
  return `
    // Generate ${entityName} texture
    const ${entityName}Graphics = this.add.graphics();
    ${entityName}Graphics.fillStyle(${colorHex}, 1);
    ${entityName}Graphics.fillCircle(${size/2}, ${size/2}, ${size/2 - 2});
    ${entityName}Graphics.lineStyle(2, 0x000000, 1);
    ${entityName}Graphics.strokeCircle(${size/2}, ${size/2}, ${size/2 - 2});
    ${entityName}Graphics.generateTexture('${entityName}', ${size}, ${size});
    ${entityName}Graphics.destroy();
  `;
}
