// components/flappybird/Pipe.js
export class Pipe {
  constructor(x, canvasHeight, gap = 150, width = 60) {
    this.x = x;
    this.width = width;
    this.gap = gap;
    this.canvasHeight = canvasHeight;
    
    // Calculate random pipe heights
    const minHeight = 50;
    const maxHeight = canvasHeight - gap - minHeight - 60; // 60 = ground height
    this.topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
    this.bottomY = this.topHeight + gap;
    
    // Movement
    this.speed = 1.5;  // ← Slower pipe speed (was 2)
    
    // Score tracking
    this.passed = false;
  }

  /**
   * Update pipe position
   */
  update() {
    this.x -= this.speed;
  }

  /**
   * Draw pipe on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    // Top pipe body
    ctx.fillStyle = '#4ECDC4';
    ctx.fillRect(this.x, 0, this.width, this.topHeight);
    
    // Top pipe border
    ctx.strokeStyle = '#2C3E50';
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x, 0, this.width, this.topHeight);
    
    // Top pipe cap
    ctx.fillStyle = '#45B7AF';
    ctx.fillRect(this.x - 5, this.topHeight - 30, this.width + 10, 30);
    ctx.strokeRect(this.x - 5, this.topHeight - 30, this.width + 10, 30);
    
    // Bottom pipe body
    ctx.fillStyle = '#4ECDC4';
    ctx.fillRect(this.x, this.bottomY, this.width, this.canvasHeight - this.bottomY);
    ctx.strokeRect(this.x, this.bottomY, this.width, this.canvasHeight - this.bottomY);
    
    // Bottom pipe cap
    ctx.fillStyle = '#45B7AF';
    ctx.fillRect(this.x - 5, this.bottomY, this.width + 10, 30);
    ctx.strokeRect(this.x - 5, this.bottomY, this.width + 10, 30);
  }

  /**
   * Check if pipe is off screen
   * @returns {boolean} Is off screen
   */
  isOffScreen() {
    return this.x + this.width < 0;
  }

  /**
   * Check if bird passed this pipe
   * @param {Bird} bird - Bird object
   * @returns {boolean} Has bird passed
   */
  hasPassed(bird) {
    if (!this.passed && this.x + this.width < bird.x) {
      this.passed = true;
      return true;
    }
    return false;
  }

  /**
   * Get pipe's bounding boxes for collision detection
   * @returns {Array} Array of bounding boxes [{x, y, width, height}]
   */
  getBoundingBoxes() {
    return [
      // Top pipe
      {
        x: this.x,
        y: 0,
        width: this.width,
        height: this.topHeight
      },
      // Bottom pipe
      {
        x: this.x,
        y: this.bottomY,
        width: this.width,
        height: this.canvasHeight - this.bottomY
      }
    ];
  }
}