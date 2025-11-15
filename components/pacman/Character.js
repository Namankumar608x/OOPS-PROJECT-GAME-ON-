// Character.js - Base class for all game characters
export class Character {
  constructor(x, y, spriteSheet, tileSize = 16) {
    this.x = x;
    this.y = y;
    this.spriteSheet = spriteSheet;
    this.tileSize = tileSize;
    
    // Movement properties
    this.speed = 1; // tiles per frame
    this.direction = { x: 0, y: 0 }; // Current direction
    this.nextDirection = { x: 0, y: 0 }; // Next direction to move
    
    // Animation
    this.animationFrame = 0;
    this.animationCounter = 0;
    this.animationSpeed = 10; // frames between animation change
  }

  /**
   * Update character position and animation
   * @param {Array} maze - 2D maze grid
   * @param {number} dt - Delta time
   */
  update(maze, dt) {
    this.updateAnimation();
    this.move(maze);
  }

  /**
   * Move character based on direction
   * @param {Array} maze - 2D maze grid
   */
  move(maze) {
    // Try to move in nextDirection first (player input)
    if (this.canMove(this.nextDirection, maze)) {
      this.direction = { ...this.nextDirection };
    }

    // Move in current direction
    if (this.canMove(this.direction, maze)) {
      this.x += this.direction.x * this.speed;
      this.y += this.direction.y * this.speed;

      // Wrap around edges
      this.wrapAround(maze);
    }
  }

  /**
   * Check if character can move in given direction
   * @param {Object} direction - { x, y }
   * @param {Array} maze - 2D maze grid
   * @returns {boolean}
   */
  canMove(direction, maze) {
    if (direction.x === 0 && direction.y === 0) return false;

    const nextX = this.x + direction.x * this.speed;
    const nextY = this.y + direction.y * this.speed;

    const gridX = Math.floor(nextX);
    const gridY = Math.floor(nextY);

    // Check bounds
    if (gridY < 0 || gridY >= maze.length || gridX < 0 || gridX >= maze[0].length) {
      return true; // Allow wrapping
    }

    // Check if tile is walkable (0 = walkable, 1 = wall)
    return maze[gridY] && maze[gridY][gridX] === 0;
  }

  /**
   * Handle tunnel wrapping at maze edges
   * @param {Array} maze - 2D maze grid
   */
  wrapAround(maze) {
    if (this.x < 0) {
      this.x = maze[0].length - 1;
    } else if (this.x >= maze[0].length) {
      this.x = 0;
    }

    if (this.y < 0) {
      this.y = maze.length - 1;
    } else if (this.y >= maze.length) {
      this.y = 0;
    }
  }

  /**
   * Update animation frame
   */
  updateAnimation() {
    this.animationCounter++;
    if (this.animationCounter >= this.animationSpeed) {
      this.animationCounter = 0;
      this.animationFrame = (this.animationFrame + 1) % 2; // Toggle between 0 and 1
    }
  }

  /**
   * Draw character on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} spriteCoords - Sprite coordinates { x, y }
   */
  draw(ctx, spriteCoords) {
    if (!spriteCoords) return;

    const canvasX = this.x * this.tileSize;
    const canvasY = this.y * this.tileSize;

    ctx.drawImage(
      this.spriteSheet,
      spriteCoords.x,           // Source X
      spriteCoords.y,           // Source Y
      this.tileSize,            // Source width
      this.tileSize,            // Source height
      canvasX,                  // Dest X
      canvasY,                  // Dest Y
      this.tileSize,            // Dest width
      this.tileSize             // Dest height
    );
  }

  /**
   * Get current position
   * @returns {Object} { x, y }
   */
  getPosition() {
    return { x: this.x, y: this.y };
  }

  /**
   * Get direction
   * @returns {Object} { x, y }
   */
  getDirection() {
    return { ...this.direction };
  }

  /**
   * Check distance to another character
   * @param {Character} other - Other character
   * @returns {number} Distance in tiles
   */
  getDistance(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}