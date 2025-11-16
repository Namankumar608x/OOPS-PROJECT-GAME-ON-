// Block.js - Simple entity class for all game objects
export class Block {
  constructor(x, y, width, height, color = '#fff') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    
    // Store starting position for reset
    this.startX = x;
    this.startY = y;
    
    // Velocity for movement
    this.velocityX = 0;
    this.velocityY = 0;
    
    // Direction tracking
    this.direction = 'R'; // U, D, L, R
  }

  /**
   * Update direction and velocity
   * @param {string} newDirection - 'U', 'D', 'L', 'R'
   * @param {number} speed - Movement speed
   */
  updateDirection(newDirection, speed = 8) {
    this.direction = newDirection;
    
    if (newDirection === 'U') {
      this.velocityX = 0;
      this.velocityY = -speed;
    } else if (newDirection === 'D') {
      this.velocityX = 0;
      this.velocityY = speed;
    } else if (newDirection === 'L') {
      this.velocityX = -speed;
      this.velocityY = 0;
    } else if (newDirection === 'R') {
      this.velocityX = speed;
      this.velocityY = 0;
    }
  }

  /**
   * Move the block
   */
  move() {
    this.x += this.velocityX;
    this.y += this.velocityY;
  }

  /**
   * Check collision with another block
   * @param {Block} other - Other block
   * @returns {boolean}
   */
  collidesWith(other) {
    return this.x < other.x + other.width &&
           this.x + this.width > other.x &&
           this.y < other.y + other.height &&
           this.y + this.height > other.y;
  }

  /**
   * Reset to starting position
   */
  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.velocityX = 0;
    this.velocityY = 0;
  }

  /**
   * Get bounds for collision detection
   * @returns {Object}
   */
  getBounds() {
    return {
      left: this.x,
      right: this.x + this.width,
      top: this.y,
      bottom: this.y + this.height
    };
  }
}