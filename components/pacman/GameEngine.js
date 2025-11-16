// GameEngine.js - Pac-Man Game Logic (Clean Rewrite)
import { Block } from './Block';

export class GameEngine {
  constructor(gameWidth, gameHeight) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    
    // Tile configuration
    this.tileSize = 32;
    this.rowCount = 21;
    this.columnCount = 19;
    this.boardWidth = this.columnCount * this.tileSize;
    this.boardHeight = this.rowCount * this.tileSize;
    
    // Game map (X = wall, ' ' = pellet, P = pacman, ghosts: r,p,b,o)
    this.tileMap = [
      "XXXXXXXXXXXXXXXXXXX",
      "X        X        X",
      "X XX XXX X XXX XX X",
      "X                 X",
      "X XX X XXXXX X XX X",
      "X    X       X    X",
      "XXXX XXXX XXXX XXXX",
      "OOOX X       X XOOO",
      "XXXX X XXrXX X XXXX",
      "O       bpo       O",
      "XXXX X XXXXX X XXXX",
      "OOOX X       X XOOO",
      "XXXX X XXXXX X XXXX",
      "X        X        X",
      "X XX XXX X XXX XX X",
      "X  X     P     X  X",
      "XX X X XXXXX X X XX",
      "X    X   X   X    X",
      "X XXXXXX X XXXXXX X",
      "X                 X",
      "XXXXXXXXXXXXXXXXXXX"
    ];
    
    // Game entities
    this.walls = [];
    this.pellets = [];
    this.ghosts = [];
    this.pacman = null;
    
    // Game state
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.isRunning = false;
    
    // Direction options for ghosts
    this.directions = ['U', 'D', 'L', 'R'];
    
    // Initialize game
    this.loadMap();
  }

  /**
   * Load map and create entities
   */
  loadMap() {
    this.walls = [];
    this.pellets = [];
    this.ghosts = [];
    
    for (let r = 0; r < this.rowCount; r++) {
      for (let c = 0; c < this.columnCount; c++) {
        const tileChar = this.tileMap[r][c];
        const x = c * this.tileSize;
        const y = r * this.tileSize;
        
        if (tileChar === 'X') {
          // Wall
          const wall = new Block(x, y, this.tileSize, this.tileSize, '#2121DE');
          this.walls.push(wall);
        } else if (tileChar === ' ') {
          // Pellet
          const pellet = new Block(
            x + this.tileSize / 2 - 4,
            y + this.tileSize / 2 - 4,
            8,
            8,
            '#FFB897'
          );
          this.pellets.push(pellet);
        } else if (tileChar === 'r') {
          // Red ghost (Blinky)
          const ghost = new Block(x, y, this.tileSize, this.tileSize, '#FF0000');
          ghost.name = 'Blinky';
          this.ghosts.push(ghost);
        } else if (tileChar === 'p') {
          // Pink ghost (Pinky)
          const ghost = new Block(x, y, this.tileSize, this.tileSize, '#FFB8FF');
          ghost.name = 'Pinky';
          this.ghosts.push(ghost);
        } else if (tileChar === 'b') {
          // Blue ghost (Inky)
          const ghost = new Block(x, y, this.tileSize, this.tileSize, '#00FFFF');
          ghost.name = 'Inky';
          this.ghosts.push(ghost);
        } else if (tileChar === 'o') {
          // Orange ghost (Clyde)
          const ghost = new Block(x, y, this.tileSize, this.tileSize, '#FFB852');
          ghost.name = 'Clyde';
          this.ghosts.push(ghost);
        } else if (tileChar === 'P') {
          // Pacman
          this.pacman = new Block(x, y, this.tileSize, this.tileSize, '#FFFF00');
        }
      }
    }
    
    // Initialize ghost directions
    this.ghosts.forEach(ghost => {
      const randomDir = this.directions[Math.floor(Math.random() * 4)];
      ghost.updateDirection(randomDir, this.tileSize / 4);
    });
  }

  /**
   * Start the game
   */
  start() {
    this.isRunning = true;
    this.gameOver = false;
  }

  /**
   * Main game update loop
   */
  update() {
    if (this.gameOver || !this.isRunning) {
      return;
    }
    
    // Move Pacman
    this.movePacman();
    
    // Move ghosts
    this.moveGhosts();
    
    // Check collisions
    this.checkCollisions();
  }

  /**
   * Move Pacman with collision detection
   */
  movePacman() {
    if (!this.pacman) return;
    
    const newX = this.pacman.x + this.pacman.velocityX;
    const newY = this.pacman.y + this.pacman.velocityY;
    
    // Create temporary block at new position
    const testBlock = new Block(newX, newY, this.tileSize, this.tileSize);
    
    // Check wall collision
    let hitWall = false;
    for (let wall of this.walls) {
      if (testBlock.collidesWith(wall)) {
        hitWall = true;
        break;
      }
    }
    
    // Move if no collision
    if (!hitWall) {
      this.pacman.x = newX;
      this.pacman.y = newY;
    }
  }

  /**
   * Move ghosts with collision detection
   */
  moveGhosts() {
    this.ghosts.forEach(ghost => {
      const newX = ghost.x + ghost.velocityX;
      const newY = ghost.y + ghost.velocityY;
      
      // Create temporary block at new position
      const testBlock = new Block(newX, newY, this.tileSize, this.tileSize);
      
      // Check wall collision and boundaries
      let hitWall = false;
      for (let wall of this.walls) {
        if (testBlock.collidesWith(wall)) {
          hitWall = true;
          break;
        }
      }
      
      // Check boundaries
      if (newX <= 0 || newX + ghost.width >= this.boardWidth) {
        hitWall = true;
      }
      
      // If hit wall, change direction randomly
      if (hitWall) {
        const randomDir = this.directions[Math.floor(Math.random() * 4)];
        ghost.updateDirection(randomDir, this.tileSize / 4);
      } else {
        ghost.x = newX;
        ghost.y = newY;
      }
    });
  }

  /**
   * Check all collisions
   */
  checkCollisions() {
    if (!this.pacman) return;
    
    // Check pellet collision
    for (let i = this.pellets.length - 1; i >= 0; i--) {
      if (this.pacman.collidesWith(this.pellets[i])) {
        this.pellets.splice(i, 1);
        this.score += 10;
      }
    }
    
    // Check ghost collision
    for (let ghost of this.ghosts) {
      if (this.pacman.collidesWith(ghost)) {
        this.lives--;
        if (this.lives <= 0) {
          this.gameOver = true;
        } else {
          this.resetPositions();
        }
        break;
      }
    }
    
    // Check level complete
    if (this.pellets.length === 0) {
      this.loadMap();
      this.resetPositions();
    }
  }

  /**
   * Handle player input
   * @param {string} direction - 'up', 'down', 'left', 'right'
   */
  handleInput(direction) {
    if (!this.pacman || this.gameOver) return;
    
    const dirMap = {
      up: 'U',
      down: 'D',
      left: 'L',
      right: 'R'
    };
    
    const dir = dirMap[direction];
    if (dir) {
      this.pacman.updateDirection(dir, this.tileSize / 4);
    }
    
    // Start game on first input
    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * Reset positions after death
   */
  resetPositions() {
    if (this.pacman) {
      this.pacman.reset();
      this.pacman.velocityX = 0;
      this.pacman.velocityY = 0;
    }
    
    this.ghosts.forEach(ghost => {
      ghost.reset();
      const randomDir = this.directions[Math.floor(Math.random() * 4)];
      ghost.updateDirection(randomDir, this.tileSize / 4);
    });
  }

  /**
   * Reset game
   */
  reset() {
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.isRunning = false;
    this.loadMap();
  }

  /**
   * Get current game state for rendering
   * @returns {Object}
   */
  getGameState() {
    return {
      pacman: this.pacman,
      ghosts: this.ghosts,
      walls: this.walls,
      pellets: this.pellets,
      score: this.score,
      lives: this.lives,
      gameOver: this.gameOver,
      isRunning: this.isRunning,
      boardWidth: this.boardWidth,
      boardHeight: this.boardHeight,
      tileSize: this.tileSize
    };
  }
}