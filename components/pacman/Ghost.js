// Ghost.js - Base class for all ghosts
import { Character } from './Character.js';

export class Ghost extends Character {
  constructor(x, y, spriteSheet, color, spriteCoords) {
    super(x, y, spriteSheet);
    
    this.color = color; // Ghost color identifier
    this.spriteCoords = spriteCoords; // Sprite coordinates for this ghost
    
    // Ghost modes
    this.mode = 'scatter'; // 'scatter', 'chase', 'frightened', 'eaten'
    this.modeTimer = 0;
    this.scatterDuration = 420; // 7 seconds at 60fps
    this.chaseDuration = 1200; // 20 seconds at 60fps
    
    // Frightened mode (when Pacman eats power pellet)
    this.frightenedTimer = 0;
    this.frightenedDuration = 360; // 6 seconds at 60fps
    this.isFrightened = false;
    
    // Speed modifiers
    this.normalSpeed = 1;
    this.frightenedSpeed = 0.5;
    this.speed = this.normalSpeed;
    
    // Target tile for pathfinding
    this.targetTile = { x: 0, y: 0 };
    
    // Home/spawn position
    this.homeX = x;
    this.homeY = y;
    
    // Animation for frightened mode
    this.frightenedSpriteIndex = 0;
  }

  /**
   * Update ghost behavior
   * @param {Array} maze - 2D maze grid
   * @param {Object} pacman - Pacman instance
   * @param {number} dt - Delta time
   */
  update(maze, pacman, dt) {
    // Update mode timer
    this.updateMode();
    
    // Update frightened state
    if (this.isFrightened) {
      this.updateFrightened();
    }
    
    // Calculate target based on current mode
    this.calculateTarget(pacman, maze);
    
    // Find best direction to move
    this.findBestDirection(maze);
    
    // Call parent update for movement and animation
    super.update(maze, dt);
  }

  /**
   * Update ghost mode (scatter/chase)
   */
  updateMode() {
    if (this.isFrightened) return;
    
    this.modeTimer++;
    
    if (this.mode === 'scatter' && this.modeTimer >= this.scatterDuration) {
      this.mode = 'chase';
      this.modeTimer = 0;
    } else if (this.mode === 'chase' && this.modeTimer >= this.chaseDuration) {
      this.mode = 'scatter';
      this.modeTimer = 0;
    }
  }

  /**
   * Update frightened mode timer
   */
  updateFrightened() {
    this.frightenedTimer--;
    
    if (this.frightenedTimer <= 0) {
      this.isFrightened = false;
      this.speed = this.normalSpeed;
      this.mode = 'scatter';
    }
  }

  /**
   * Activate frightened mode
   */
  setFrightened() {
    this.isFrightened = true;
    this.frightenedTimer = this.frightenedDuration;
    this.speed = this.frightenedSpeed;
    
    // Reverse direction
    this.direction.x *= -1;
    this.direction.y *= -1;
  }

  /**
   * Calculate target tile based on mode
   * @param {Object} pacman - Pacman instance
   * @param {Array} maze - 2D maze grid
   */
  calculateTarget(pacman, maze) {
    if (this.mode === 'scatter') {
      // Each ghost has its own scatter target (corner)
      this.targetTile = this.getScatterTarget();
    } else if (this.mode === 'chase') {
      // Each ghost implements its own chase strategy
      this.targetTile = this.getChaseTarget(pacman, maze);
    } else if (this.isFrightened) {
      // Random movement when frightened
      this.targetTile = this.getRandomTarget(maze);
    }
  }

  /**
   * Get scatter target (override in child classes)
   * @returns {Object} { x, y }
   */
  getScatterTarget() {
    // Default to top-left corner
    return { x: 0, y: 0 };
  }

  /**
   * Get chase target (override in child classes)
   * @param {Object} pacman - Pacman instance
   * @param {Array} maze - 2D maze grid
   * @returns {Object} { x, y }
   */
  getChaseTarget(pacman, maze) {
    // Default: target Pacman's position
    return pacman.getPosition();
  }

  /**
   * Get random target for frightened mode
   * @param {Array} maze - 2D maze grid
   * @returns {Object} { x, y }
   */
  getRandomTarget(maze) {
    return {
      x: Math.floor(Math.random() * maze[0].length),
      y: Math.floor(Math.random() * maze.length)
    };
  }

  /**
   * Find best direction to move towards target
   * @param {Array} maze - 2D maze grid
   */
  findBestDirection(maze) {
    const possibleDirections = [
      { x: 0, y: -1 }, // Up
      { x: 0, y: 1 },  // Down
      { x: -1, y: 0 }, // Left
      { x: 1, y: 0 }   // Right
    ];

    let bestDirection = this.direction;
    let minDistance = Infinity;

    for (const dir of possibleDirections) {
      // Don't reverse direction (unless frightened)
      if (!this.isFrightened && 
          dir.x === -this.direction.x && 
          dir.y === -this.direction.y) {
        continue;
      }

      if (this.canMove(dir, maze)) {
        const nextX = this.x + dir.x;
        const nextY = this.y + dir.y;
        
        const distance = Math.sqrt(
          Math.pow(nextX - this.targetTile.x, 2) + 
          Math.pow(nextY - this.targetTile.y, 2)
        );

        if (distance < minDistance) {
          minDistance = distance;
          bestDirection = dir;
        }
      }
    }

    this.nextDirection = bestDirection;
  }

  /**
   * Draw ghost on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    let coords;
    
    if (this.isFrightened) {
      // Use frightened sprite (blue ghost)
      coords = {
        x: 128 + (this.animationFrame * 16),
        y: 32
      };
    } else {
      // Use normal ghost sprite
      coords = this.spriteCoords[this.animationFrame % this.spriteCoords.length];
    }
    
    super.draw(ctx, coords);
  }

  /**
   * Reset ghost to home position
   */
  reset() {
    this.x = this.homeX;
    this.y = this.homeY;
    this.direction = { x: 0, y: 0 };
    this.nextDirection = { x: 0, y: 0 };
    this.mode = 'scatter';
    this.modeTimer = 0;
    this.isFrightened = false;
    this.speed = this.normalSpeed;
  }
}