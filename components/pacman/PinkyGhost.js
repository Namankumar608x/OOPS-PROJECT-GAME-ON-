// PinkyGhost.js - Pink Ghost (The Ambusher)
import { Ghost } from './Ghost.js';

export class PinkyGhost extends Ghost {
  constructor(x, y, spriteSheet) {
    // Pink ghost sprite coordinates from sprite sheet
    const spriteCoords = [
      { x: 32, y: 32 },  // Animation frame 1
      { x: 48, y: 32 }   // Animation frame 2
    ];
    
    super(x, y, spriteSheet, 'pink', spriteCoords);
    
    this.name = 'Pinky';
  }

  /**
   * Get scatter target (top-left corner)
   * @returns {Object} { x, y }
   */
  getScatterTarget() {
    return { 
      x: 2,  // Top-left corner
      y: 0 
    };
  }

  /**
   * Get chase target - Pinky targets 4 tiles ahead of Pacman
   * @param {Object} pacman - Pacman instance
   * @param {Array} maze - 2D maze grid
   * @returns {Object} { x, y }
   */
  getChaseTarget(pacman, maze) {
    // Pinky's strategy: Ambush by targeting 4 tiles ahead of Pacman
    const pacmanPos = pacman.getPosition();
    const pacmanDir = pacman.getDirection();
    
    // Calculate 4 tiles ahead of Pacman's direction
    let targetX = Math.floor(pacmanPos.x + (pacmanDir.x * 4));
    let targetY = Math.floor(pacmanPos.y + (pacmanDir.y * 4));
    
    // Original Pac-Man bug: If Pacman facing up, offset 4 tiles up AND 4 left
    if (pacmanDir.y === -1 && pacmanDir.x === 0) {
      targetX -= 4; // Bug from original game
    }
    
    // Clamp to maze bounds
    targetX = Math.max(0, Math.min(targetX, maze[0].length - 1));
    targetY = Math.max(0, Math.min(targetY, maze.length - 1));
    
    return {
      x: targetX,
      y: targetY
    };
  }
}