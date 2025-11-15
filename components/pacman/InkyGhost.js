// InkyGhost.js - Blue Ghost (The Unpredictable One)
import { Ghost } from './Ghost.js';

export class InkyGhost extends Ghost {
  constructor(x, y, spriteSheet) {
    // Blue ghost sprite coordinates from sprite sheet
    const spriteCoords = [
      { x: 64, y: 32 },  // Animation frame 1
      { x: 80, y: 32 }   // Animation frame 2
    ];
    
    super(x, y, spriteSheet, 'cyan', spriteCoords);
    
    this.name = 'Inky';
  }

  /**
   * Get scatter target (bottom-right corner)
   * @returns {Object} { x, y }
   */
  getScatterTarget() {
    return { 
      x: 27, // Bottom-right corner
      y: 30 
    };
  }

  /**
   * Get chase target - Inky uses complex calculation with Blinky's position
   * @param {Object} pacman - Pacman instance
   * @param {Array} maze - 2D maze grid
   * @param {Object} blinky - Blinky ghost instance (optional)
   * @returns {Object} { x, y }
   */
  getChaseTarget(pacman, maze, blinky = null) {
    // Inky's strategy: Most complex AI
    // Uses both Pacman's position AND Blinky's position
    
    const pacmanPos = pacman.getPosition();
    const pacmanDir = pacman.getDirection();
    
    // Step 1: Get 2 tiles ahead of Pacman
    let intermediateX = Math.floor(pacmanPos.x + (pacmanDir.x * 2));
    let intermediateY = Math.floor(pacmanPos.y + (pacmanDir.y * 2));
    
    // Original bug: If Pacman facing up, offset 2 left as well
    if (pacmanDir.y === -1 && pacmanDir.x === 0) {
      intermediateX -= 2;
    }
    
    // Step 2: If Blinky exists, create vector from Blinky to intermediate point
    if (blinky) {
      const blinkyPos = blinky.getPosition();
      
      // Vector from Blinky to intermediate point
      const vectorX = intermediateX - Math.floor(blinkyPos.x);
      const vectorY = intermediateY - Math.floor(blinkyPos.y);
      
      // Double the vector (target is twice as far from Blinky)
      intermediateX = Math.floor(blinkyPos.x + (vectorX * 2));
      intermediateY = Math.floor(blinkyPos.y + (vectorY * 2));
    }
    
    // Clamp to maze bounds
    intermediateX = Math.max(0, Math.min(intermediateX, maze[0].length - 1));
    intermediateY = Math.max(0, Math.min(intermediateY, maze.length - 1));
    
    return {
      x: intermediateX,
      y: intermediateY
    };
  }

  /**
   * Override update to pass Blinky reference if needed
   * @param {Array} maze - 2D maze grid
   * @param {Object} pacman - Pacman instance
   * @param {number} dt - Delta time
   * @param {Object} blinky - Blinky ghost instance
   */
  update(maze, pacman, dt, blinky = null) {
    // Store blinky reference for chase target calculation
    this.blinkyRef = blinky;
    super.update(maze, pacman, dt);
  }

  /**
   * Override calculateTarget to include Blinky
   * @param {Object} pacman - Pacman instance
   * @param {Array} maze - 2D maze grid
   */
  calculateTarget(pacman, maze) {
    if (this.mode === 'scatter') {
      this.targetTile = this.getScatterTarget();
    } else if (this.mode === 'chase') {
      this.targetTile = this.getChaseTarget(pacman, maze, this.blinkyRef);
    } else if (this.isFrightened) {
      this.targetTile = this.getRandomTarget(maze);
    }
  }
}