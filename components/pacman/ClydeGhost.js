// ClydeGhost.js - Orange Ghost (The Shy One)
import { Ghost } from './Ghost.js';

export class ClydeGhost extends Ghost {
  constructor(x, y, spriteSheet) {
    // Orange ghost sprite coordinates from sprite sheet
    const spriteCoords = [
      { x: 96, y: 32 },   // Animation frame 1
      { x: 112, y: 32 }   // Animation frame 2
    ];
    
    super(x, y, spriteSheet, 'orange', spriteCoords);
    
    this.name = 'Clyde';
    this.shyDistance = 8; // Tiles - if closer than this, he runs away
  }

  /**
   * Get scatter target (bottom-left corner)
   * @returns {Object} { x, y }
   */
  getScatterTarget() {
    return { 
      x: 0,  // Bottom-left corner
      y: 30 
    };
  }

  /**
   * Get chase target - Clyde is "shy" and runs away when too close
   * @param {Object} pacman - Pacman instance
   * @param {Array} maze - 2D maze grid
   * @returns {Object} { x, y }
   */
  getChaseTarget(pacman, maze) {
    // Clyde's strategy: Chase when far, scatter when close
    
    const pacmanPos = pacman.getPosition();
    
    // Calculate distance to Pacman
    const distance = this.getDistance(pacman);
    
    // If Clyde is more than 8 tiles away from Pacman, target him directly
    if (distance > this.shyDistance) {
      return {
        x: Math.floor(pacmanPos.x),
        y: Math.floor(pacmanPos.y)
      };
    } else {
      // If too close, go to scatter corner (run away!)
      return this.getScatterTarget();
    }
  }

  /**
   * Clyde is more cautious in frightened mode
   * @param {Array} maze - 2D maze grid
   * @returns {Object} { x, y }
   */
  getRandomTarget(maze) {
    // Clyde prefers corners even when frightened
    const corners = [
      { x: 0, y: 0 },                          // Top-left
      { x: maze[0].length - 1, y: 0 },         // Top-right
      { x: 0, y: maze.length - 1 },            // Bottom-left
      { x: maze[0].length - 1, y: maze.length - 1 } // Bottom-right
    ];
    
    return corners[Math.floor(Math.random() * corners.length)];
  }
}