// components/flappybird/Bird.js
export class Bird {
  constructor(x, y, width = 34, height = 24) {
    // Position
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    
    // Physics
    this.velocity = 0;
    this.gravity = 0.4;        // ← Slower gravity (was 0.5)
    this.jumpStrength = -8;    // ← Weaker jump (was -10)
    this.maxVelocity = 8;      // ← Lower max speed (was 10)
    
    // Animation
    this.rotation = 0;
    this.maxRotation = 90;
    
    // State
    this.isAlive = true;
  }

  /**
   * Make bird jump
   */
  jump() {
    if (this.isAlive) {
      this.velocity = this.jumpStrength;
    }
  }

  /**
   * Update bird physics
   * @param {number} groundY - Ground Y position
   */
  update(groundY) {
    if (!this.isAlive) return;

    // Apply gravity
    this.velocity += this.gravity;
    
    // Limit max velocity
    if (this.velocity > this.maxVelocity) {
      this.velocity = this.maxVelocity;
    }
    
    // Update position
    this.y += this.velocity;
    
    // Update rotation based on velocity
    this.rotation = Math.min(this.velocity * 3, this.maxRotation);
    
    // Check ground collision
    if (this.y + this.height >= groundY) {
      this.y = groundY - this.height;
      this.velocity = 0;
      this.isAlive = false;
    }
    
    // Check ceiling collision
    if (this.y <= 0) {
      this.y = 0;
      this.velocity = 0;
    }
  }

  /**
   * Draw bird on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    ctx.save();
    
    // Move to bird center for rotation
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.rotate((this.rotation * Math.PI) / 180);
    
    // Draw bird body (yellow circle)
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw bird outline
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(8, -4, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eye white
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(9, -5, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw beak
    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.moveTo(this.width / 2, 0);
    ctx.lineTo(this.width / 2 + 10, -5);
    ctx.lineTo(this.width / 2 + 10, 5);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  /**
   * Check collision with pipe
   * @param {Pipe} pipe - Pipe object
   * @returns {boolean} Is colliding
   */
  checkCollision(pipe) {
    // Check if bird is in pipe's X range
    if (
      this.x + this.width > pipe.x &&
      this.x < pipe.x + pipe.width
    ) {
      // Check if bird hits top or bottom pipe
      if (
        this.y < pipe.topHeight ||
        this.y + this.height > pipe.bottomY
      ) {
        this.isAlive = false;
        return true;
      }
    }
    return false;
  }

  /**
   * Reset bird to initial state
   * @param {number} x - Initial X position
   * @param {number} y - Initial Y position
   */
  reset(x, y) {
    this.x = x;
    this.y = y;
    this.velocity = 0;
    this.rotation = 0;
    this.isAlive = true;
  }

  /**
   * Get bird's bounding box for collision detection
   * @returns {Object} Bounding box {x, y, width, height}
   */
  getBoundingBox() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}