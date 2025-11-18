// gameLogic.js

// =====================
// Bird class
// =====================
class Bird {
  /**
   * Represents the player bird.
   * x, y: initial position
   * radius: for collision
   */
  constructor({
    x = 60,
    y = 200,
    radius = 15,
    gravityLimit = 15,
    screenHeight = 600,
  } = {}) {
    this.initialX = x;
    this.initialY = y;
    this.x = x;
    this.y = y;

    this.radius = radius;
    this.screenHeight = screenHeight;

    // Vertical motion
    this.velocityY = 0;
    this.gravityLimit = gravityLimit; // max falling speed

    // State
    this.isAlive = true;
  }

  /**
   * Reset bird to initial position and stop motion.
   */
  reset() {
    this.x = this.initialX;
    this.y = this.initialY;
    this.velocityY = 0;
    this.isAlive = true;
  }

  /**
   * Apply gravity and update vertical position.
   * Called each frame from Game.update()
   */
  applyGravity(gravity, deltaTime) {
    if (!this.isAlive) return;

    // Add gravity to velocity
    this.velocityY += gravity;

    // Clamp vertical speed
    if (this.velocityY > this.gravityLimit) {
      this.velocityY = this.gravityLimit;
    }

    // Update Y using velocity and time
    this.y += this.velocityY * (deltaTime || 1);

    // Simple boundary handling (top and bottom of screen)
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.velocityY = 0;
    }

    if (this.y + this.radius > this.screenHeight) {
      this.y = this.screenHeight - this.radius;
      this.velocityY = 0;
      this.isAlive = false; // hit the ground
    }
  }

  /**
   * Jump / flap. Negative strength makes the bird go up.
   * Called from Game.flap()
   */
  jump(jumpStrength) {
    if (!this.isAlive) return;
    this.velocityY = jumpStrength;
  }

  /**
   * Simple circular collision bounds for the bird.
   * PipeManager can use these for collision detection.
   */
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      radius: this.radius,
    };
  }

  /**
   * Return current state for rendering in React Native.
   */
  getState() {
    return {
      x: this.x,
      y: this.y,
      radius: this.radius,
      isAlive: this.isAlive,
    };
  }
}

// =====================
// Pipe class
// =====================
class Pipe {
  /**
   * Represents a single pair of pipes (top + bottom).
   * gapCenterY: vertical center of the gap
   * gapHeight: total height of the gap
   */
  constructor({ x, gapCenterY, gapHeight, width, speed, screenHeight, id }) {
    this.id = id || Date.now();
    this.x = x;
    this.gapCenterY = gapCenterY;
    this.gapHeight = gapHeight;
    this.width = width;
    this.speed = speed;
    this.screenHeight = screenHeight;

    // Vertical boundaries of the gap
    this.topPipeBottomY = this.gapCenterY - this.gapHeight / 2;
    this.bottomPipeTopY = this.gapCenterY + this.gapHeight / 2;

    // Used for scoring when bird passes this pipe
    this.isPassed = false;
  }

  /**
   * Move pipe left over time.
   */
  update(deltaTime = 0) {
    this.x -= this.speed * (deltaTime || 0.016); // ~60 FPS default fallback
  }

  /**
   * Is this pipe completely off screen on the left?
   */
  isOffScreen() {
    return this.x + this.width < 0;
  }

  /**
   * Collision with bird (circle vs vertical gap).
   * birdBounds: { x, y, radius }
   */
  collidesWith(birdBounds) {
    const { x: bx, y: by, radius } = birdBounds;

    // If the bird is not horizontally overlapping the pipe, no collision
    const overlapsX = bx + radius > this.x && bx - radius < this.x + this.width;
    if (!overlapsX) return false;

    // Check if bird is inside the "hole"; if not, it's hitting pipe
    const hitsTop = by - radius < this.topPipeBottomY;
    const hitsBottom = by + radius > this.bottomPipeTopY;

    return hitsTop || hitsBottom;
  }

  /**
   * Check if the bird has just passed this pipe (for scoring).
   * Returns true only once per pipe.
   */
  checkPassed(birdX) {
    if (!this.isPassed && birdX > this.x + this.width) {
      this.isPassed = true;
      return true;
    }
    return false;
  }

  /**
   * Expose state for rendering.
   */
  getState() {
    return {
      id: this.id,
      x: this.x,
      width: this.width,
      gapCenterY: this.gapCenterY,
      gapHeight: this.gapHeight,
      topPipeBottomY: this.topPipeBottomY,
      bottomPipeTopY: this.bottomPipeTopY,
      isPassed: this.isPassed,
    };
  }
}

// =====================
// PipeManager class
// =====================
class PipeManager {
  /**
   * Manages creation, movement, and collision of multiple pipes.
   * Pipes spawn at a fixed horizontal spacing.
   * Gap size depends on score, with randomness and a minimum gap.
   */
  constructor({
    screenWidth = 360,
    screenHeight = 640,
    pipeWidth = 60,
    pipeSpeed = 120, // pixels per second
    pipeSpacing = 220, // fixed horizontal distance between pipes
    baseGapHeight = 200, // large gap at score 0
    minGapHeight = 110, // minimum allowed gap
    difficultyFactor = 4, // how fast gap shrinks with score
  } = {}) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.pipeWidth = pipeWidth;
    this.pipeSpeed = pipeSpeed;
    this.pipeSpacing = pipeSpacing;

    this.baseGapHeight = baseGapHeight;
    this.minGapHeight = minGapHeight;
    this.difficultyFactor = difficultyFactor;

    this.pipes = [];
  }

  /**
   * Reset all pipes (used by Game.reset()).
   */
  reset() {
    this.pipes = [];
  }

  /**
   * Main update. Call from Game.update(deltaTime, score).
   * currentScore is used to control gap difficulty.
   */
  update(deltaTime, currentScore = 0) {
    // Move all pipes
    this.pipes.forEach((pipe) => pipe.update(deltaTime));

    // Remove off-screen pipes
    this.pipes = this.pipes.filter((pipe) => !pipe.isOffScreen());

    // Spawn new pipes if needed
    this._spawnIfNeeded(currentScore);
  }

  /**
   * Collision check with the bird.
   */
  checkCollision(bird) {
    if (!bird || typeof bird.getBounds !== "function") return false;
    const birdBounds = bird.getBounds();

    for (const pipe of this.pipes) {
      if (pipe.collidesWith(birdBounds)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if the bird has passed any pipe during this frame.
   * Returns true if at least one pipe was newly passed.
   */
  checkAndHandlePass(bird) {
    if (!bird || typeof bird.getBounds !== "function") return false;
    const { x: birdX } = bird.getBounds();

    let passed = false;
    for (const pipe of this.pipes) {
      if (pipe.checkPassed(birdX)) {
        passed = true;
      }
    }
    return passed;
  }

  /**
   * Return pipes for rendering.
   */
  getState() {
    return this.pipes.map((pipe) => pipe.getState());
  }

  /**
   * Spawn pipe(s) when the last one is far enough to the left.
   * Pipes are spaced at a fixed distance along the X axis.
   */
  _spawnIfNeeded(currentScore) {
    if (this.pipes.length === 0) {
      this._spawnPipe(currentScore);
      return;
    }

    // Find the rightmost pipe
    const rightMostX = this.pipes.reduce(
      (max, pipe) => Math.max(max, pipe.x),
      -Infinity
    );

    // If the rightmost pipe has moved left enough, spawn a new one
    if (rightMostX < this.screenWidth - this.pipeSpacing) {
      this._spawnPipe(currentScore);
    }
  }

  /**
   * Create a single new pipe off-screen to the right.
   */
  _spawnPipe(currentScore) {
    const gapHeight = this._computeGapHeight(currentScore);
    const gapCenterY = this._randomGapCenter(gapHeight);

    const x = this.screenWidth + this.pipeWidth; // spawn slightly off-screen on the right

    const pipe = new Pipe({
      x,
      gapCenterY,
      gapHeight,
      width: this.pipeWidth,
      speed: this.pipeSpeed,
      screenHeight: this.screenHeight,
    });

    this.pipes.push(pipe);
  }

  /**
   * Gap height: starts big and shrinks as score grows,
   * but with some randomness and a strict minimum gap.
   */
  _computeGapHeight(score) {
    // Add a small random component to keep it unpredictable
    const randomBoost = Math.random() * 2; // tiny variation per score unit

    const effectiveScore = score + randomBoost;

    let gap = this.baseGapHeight - this.difficultyFactor * effectiveScore;

    // Never go below min gap
    if (gap < this.minGapHeight) {
      gap = this.minGapHeight;
    }

    return gap;
  }

  /**
   * Random vertical position of the gap, keeping it fully on screen.
   */
  _randomGapCenter(gapHeight) {
    const verticalMargin = 40; // keep gap away from exact edges

    const minCenterY = verticalMargin + gapHeight / 2;
    const maxCenterY = this.screenHeight - verticalMargin - gapHeight / 2;

    return minCenterY + Math.random() * (maxCenterY - minCenterY);
  }
}

// =====================
// Game class
// =====================
class Game {
  /**
   * Game coordinates and physics are abstract.
   * React Native will just read state from getState()
   * and render visuals accordingly.
   */
  constructor({ bird, pipeManager, gravity = 0.4, jumpStrength = -7 }) {
    // Composition: Game "has a" bird and "has" pipes
    this.bird = bird; // instance of Bird class
    this.pipeManager = pipeManager; // instance of PipeManager class

    // Core game properties
    this.gravity = gravity;
    this.jumpStrength = jumpStrength;
    this.score = 0;
    this.isRunning = false;
    this.isGameOver = false;

    // Time tracking for smooth updates
    this.lastUpdateTime = null;

    // Callbacks for UI layer
    this.onGameOver = null; // (finalScore) => {}
    this.onScore = null; // (newScore) => {}
  }

  /**
   * Initialize or restart the game.
   */
  start() {
    this.reset();
    this.isRunning = true;
    this.isGameOver = false;
    this.lastUpdateTime = Date.now();
  }

  /**
   * Reset game state but do not start the loop yet.
   */
  reset() {
    this.score = 0;
    this.isRunning = false;
    this.isGameOver = false;
    this.lastUpdateTime = null;

    // Delegate reset to child objects
    if (this.bird && typeof this.bird.reset === "function") {
      this.bird.reset();
    }

    if (this.pipeManager && typeof this.pipeManager.reset === "function") {
      this.pipeManager.reset();
    }
  }

  /**
   * Main game loop tick. Call this from a setInterval or requestAnimationFrame.
   */
  update() {
    if (!this.isRunning || this.isGameOver) return;

    const now = Date.now();
    const deltaTime = this.lastUpdateTime
      ? (now - this.lastUpdateTime) / 1000 // seconds
      : 0;
    this.lastUpdateTime = now;

    // 1. Update bird physics
    if (this.bird && typeof this.bird.applyGravity === "function") {
      this.bird.applyGravity(this.gravity, deltaTime);
    }

    // 2. Update pipes position (pass score so gap reacts to difficulty)
    if (this.pipeManager && typeof this.pipeManager.update === "function") {
      this.pipeManager.update(deltaTime, this.score);
    }

    // 3. Collision detection
    if (
      this.pipeManager &&
      typeof this.pipeManager.checkCollision === "function" &&
      this.pipeManager.checkCollision(this.bird)
    ) {
      this.gameOver();
      return;
    }

    // 4. Check if bird passed a pipe and increment score
    if (
      this.pipeManager &&
      typeof this.pipeManager.checkAndHandlePass === "function"
    ) {
      const passedPipe = this.pipeManager.checkAndHandlePass(this.bird);
      if (passedPipe) {
        this.incrementScore();
      }
    }
  }

  /**
   * User input: bird jump / flap.
   */
  flap() {
    if (!this.isRunning || this.isGameOver) return;

    if (this.bird && typeof this.bird.jump === "function") {
      this.bird.jump(this.jumpStrength);
    }
  }

  /**
   * Internal method: increase score and notify UI.
   */
  incrementScore() {
    this.score += 1;

    if (typeof this.onScore === "function") {
      this.onScore(this.score);
    }
  }

  /**
   * Trigger game over, stop updates, and notify UI.
   */
  gameOver() {
    this.isRunning = false;
    this.isGameOver = true;

    if (typeof this.onGameOver === "function") {
      this.onGameOver(this.score);
    }
  }

  /**
   * Expose a read-only snapshot of current state
   * for React Native to render.
   */
  getState() {
    return {
      score: this.score,
      isRunning: this.isRunning,
      isGameOver: this.isGameOver,
      bird:
        this.bird && typeof this.bird.getState === "function"
          ? this.bird.getState()
          : null,
      pipes:
        this.pipeManager && typeof this.pipeManager.getState === "function"
          ? this.pipeManager.getState()
          : [],
    };
  }

  /**
   * Optional: allow setting callbacks from outside.
   */
  setOnGameOver(callback) {
    this.onGameOver = callback;
  }

  setOnScore(callback) {
    this.onScore = callback;
  }
}

// =====================
// Exports
// =====================
export { Bird, Pipe, PipeManager };
export default Game;
