// components/flappybird/GameEngine.js
import { Bird } from '/Bird.js';
import { Pipe } from '/Pipe.js';

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Game state
    this.isPlaying = false;
    this.gameOver = false;
    this.score = 0;
    this.highScore = this.loadHighScore();
    
    // Game objects
    this.bird = new Bird(150, 250);  // ← Moved right (was 80)
    this.pipes = [];
    
    // Timing
    this.frameCount = 0;
    this.pipeSpawnInterval = 120; // ← Slower spawn (was 90)
    
    // Canvas dimensions
    this.groundY = canvas.height - 60;
  }

  /**
   * Start/Restart the game
   */
  start() {
    this.isPlaying = true;
    this.gameOver = false;
    this.score = 0;
    this.frameCount = 0;
    this.pipes = [];
    this.bird.reset(150, 250);  // ← Updated position
  }

  /**
   * Update game state
   */
  update() {
    if (!this.isPlaying || this.gameOver) return;

    // Update bird
    this.bird.update(this.groundY);

    // Check if bird died
    if (!this.bird.isAlive) {
      this.gameOver = true;
      this.updateHighScore();
      return;
    }

    // Update pipes
    this.frameCount++;
    
    // Spawn new pipe
    if (this.frameCount % this.pipeSpawnInterval === 0) {
      this.pipes.push(new Pipe(this.canvas.width, this.canvas.height));
    }

    // Update each pipe
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.update();

      // Check collision
      if (this.bird.checkCollision(pipe)) {
        this.gameOver = true;
        this.updateHighScore();
        return;
      }

      // Check score
      if (pipe.hasPassed(this.bird)) {
        this.score++;
      }

      // Remove off-screen pipes
      if (pipe.isOffScreen()) {
        this.pipes.splice(i, 1);
      }
    }
  }

  /**
   * Draw everything
   */
  draw() {
    // Draw background
    this.drawBackground();

    // Draw pipes
    this.pipes.forEach(pipe => pipe.draw(this.ctx));

    // Draw bird
    this.bird.draw(this.ctx);

    // Draw ground
    this.drawGround();

    // Draw UI
    this.drawUI();

    // Draw overlays
    if (!this.isPlaying) {
      this.drawStartScreen();
    } else if (this.gameOver) {
      this.drawGameOverScreen();
    }
  }

  /**
   * Draw background
   */
  drawBackground() {
    // Sky gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Clouds
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // Cloud 1
    this.ctx.beginPath();
    this.ctx.arc(100, 100, 30, 0, Math.PI * 2);
    this.ctx.arc(140, 100, 40, 0, Math.PI * 2);
    this.ctx.arc(180, 100, 30, 0, Math.PI * 2);
    this.ctx.fill();

    // Cloud 2
    this.ctx.beginPath();
    this.ctx.arc(300, 150, 25, 0, Math.PI * 2);
    this.ctx.arc(330, 150, 35, 0, Math.PI * 2);
    this.ctx.arc(360, 150, 25, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Draw ground
   */
  drawGround() {
    // Ground
    this.ctx.fillStyle = '#DEB887';
    this.ctx.fillRect(0, this.groundY, this.canvas.width, 60);
    
    // Ground top border
    this.ctx.fillStyle = '#8B7355';
    this.ctx.fillRect(0, this.groundY - 5, this.canvas.width, 5);
  }

  /**
   * Draw UI (score)
   */
  drawUI() {
    // Draw score
    this.ctx.fillStyle = '#FFF';
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 3;
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.strokeText(this.score, this.canvas.width / 2, 80);
    this.ctx.fillText(this.score, this.canvas.width / 2, 80);
  }

  /**
   * Draw start screen
   */
  drawStartScreen() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#FFF';
    this.ctx.font = 'bold 56px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('FLAPPY BIRD', this.canvas.width / 2, this.canvas.height / 2 - 60);

    this.ctx.font = '28px Arial';
    this.ctx.fillText('Click to Start', this.canvas.width / 2, this.canvas.height / 2 + 20);

    this.ctx.font = '20px Arial';
    this.ctx.fillText(`High Score: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 60);
  }

  /**
   * Draw game over screen
   */
  drawGameOverScreen() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#FFF';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 60);

    this.ctx.font = 'bold 32px Arial';
    this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.fillText(`Best: ${this.highScore}`, this.canvas.width / 2, this.canvas.height / 2 + 40);

    this.ctx.font = '24px Arial';
    this.ctx.fillText('Click to Restart', this.canvas.width / 2, this.canvas.height / 2 + 100);
  }

  /**
   * Handle jump action
   */
  handleJump() {
    if (!this.isPlaying && !this.gameOver) {
      this.start();
      this.bird.jump();
    } else if (this.gameOver) {
      this.start();
    } else if (this.isPlaying) {
      this.bird.jump();
    }
  }

  /**
   * Load high score from localStorage
   * @returns {number} High score
   */
  loadHighScore() {
    try {
      const saved = localStorage.getItem('flappyHighScore');
      return saved ? parseInt(saved) : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Update high score
   */
  updateHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      try {
        localStorage.setItem('flappyHighScore', this.highScore);
      } catch (error) {
        console.warn('Could not save high score');
      }
    }
  }

  /**
   * Get current game state
   * @returns {Object} Game state
   */
  getState() {
    return {
      score: this.score,
      highScore: this.highScore,
      isPlaying: this.isPlaying,
      gameOver: this.gameOver
    };
  }
}