// BlinkyGhost.js - Red Ghost (Most Aggressive)
import { Ghost } from './Ghost.js';

export class BlinkyGhost extends Ghost {
  constructor(x, y, spriteSheet) {
    // Red ghost sprite coordinates from sprite sheet
    const spriteCoords = [
      { x: 0, y: 32 },   // Animation frame 1
      { x: 16, y: 32 }   // Animation frame 2
    ];
    
    super(x, y, spriteSheet, 'red', spriteCoords);
    
    this.name = 'Blinky';
    
    // Blinky is the most aggressive ghost
    this.normalSpeed = 1.1; // Slightly faster than others
    this.speed = this.normalSpeed;
  }

  /**
   * Get scatter target (top-right corner)
   * @returns {Object} { x, y }
   */
  getScatterTarget() {
    return { 
      x: 25, // Top-right corner
      y: 0 
    };
  }

  /**
   * Get chase target - Blinky directly targets Pacman
   * @param {Object} pacman - Pacman instance
   * @param {Array} maze - 2D maze grid
   * @returns {Object} { x, y }
   */
  getChaseTarget(pacman, maze) {
    // Blinky's strategy: Direct chase
    // Simply target Pacman's current position
    const pacmanPos = pacman.getPosition();
    
    return {
      x: Math.floor(pacmanPos.x),
      y: Math.floor(pacmanPos.y)
    };
  }

  /**
   * Blinky becomes "Cruise Elroy" mode when few pellets remain
   * @param {number} pelletsRemaining - Number of pellets left
   */
  setCruiseElroy(pelletsRemaining) {
    // Speed up when only few pellets remain
    if (pelletsRemaining <= 20) {
      this.normalSpeed = 1.3; // Much faster
      this.speed = this.normalSpeed;
    } else if (pelletsRemaining <= 40) {
      this.normalSpeed = 1.2; // Faster
      this.speed = this.normalSpeed;
    }
  }
}