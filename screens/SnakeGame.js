import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GRID_SIZE = 20;
const CELL_SIZE = 15;
const INITIAL_SPEED = 200;

// ========================================
// BASE CLASS - GameObject (Parent Class)
// ========================================
class GameObject {
  #x;
  #y;

  constructor(x, y) {
    this.#x = x;
    this.#y = y;
  }

  // Getter methods (Encapsulation)
  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }

  // Setter methods (Encapsulation)
  set x(value) {
    this.#x = value;
  }

  set y(value) {
    this.#y = value;
  }

  // Public method
  getPosition() {
    return { x: this.#x, y: this.#y };
  }

  // Method to be overridden by child classes (Polymorphism)
  render() {
    throw new Error('ERROR! RENDER SHOULD BE IMPLEMENTED BY SUBCLASS');
  }
}

// ========================================
// CHILD CLASS - Food (Inheritance from GameObject)
// ========================================
class Food extends GameObject {
  #type;
  #points;
  #color;

  constructor(x, y, type = 'normal') {
    super(x, y); // Call parent constructor (Inheritance)
    this.#type = type;
    this.#points = type === 'special' ? 5 : 1;
    this.#color = type === 'special' ? '#fbbf24' : '#ef4444';
  }

  // Getter methods (Encapsulation)
  get type() {
    return this.#type;
  }

  get points() {
    return this.#points;
  }

  get color() {
    return this.#color;
  }

  // Override parent method (Polymorphism)
  render() {
    return {
      position: this.getPosition(),
      color: this.#color,
      size: this.#type === 'special' ? CELL_SIZE * 1.2 : CELL_SIZE,
      borderRadius: this.#type === 'special' ? 50 : 2,
    };
  }

  // Check if food is eaten
  isEatenBy(snakeHead) {
    return this.x === snakeHead.x && this.y === snakeHead.y;
  }
}

// ========================================
// CHILD CLASS - SnakeSegment (Inheritance from GameObject)
// ========================================
class SnakeSegment extends GameObject {
  #isHead;
  #color;

  constructor(x, y, isHead = false) {
    super(x, y); // Call parent constructor (Inheritance)
    this.#isHead = isHead;
    this.#color = isHead ? '#a78bfa' : '#8b5cf6';
  }

  // Getter and Setter (Encapsulation)
  get isHead() {
    return this.#isHead;
  }

  set isHead(value) {
    this.#isHead = value;
    this.#color = value ? '#a78bfa' : '#8b5cf6';
  }

  get color() {
    return this.#color;
  }

  // Override parent method (Polymorphism)
  render() {
    return {
      position: this.getPosition(),
      isHead: this.#isHead,
      color: this.#color,
      size: CELL_SIZE,
    };
  }
}

// ========================================
// SNAKE CLASS - Manages snake behavior
// ========================================
class Snake {
  #segments;
  #direction;
  #nextDirection;
  #growing;

  constructor(initialLength = 3) {
    this.#segments = [];
    this.#direction = { x: 1, y: 0 };
    this.#nextDirection = { x: 1, y: 0 };
    this.#growing = false;

    // Create initial snake segments
    for (let i = 0; i < initialLength; i++) {
      this.#segments.push(
        new SnakeSegment(
          initialLength - i,
          Math.floor(GRID_SIZE / 2),
          i === 0
        )
      );
    }
  }

  // Getter methods (Encapsulation)
  get head() {
    return this.#segments[0];
  }

  get body() {
    return this.#segments;
  }

  get length() {
    return this.#segments.length;
  }

  get direction() {
    return this.#nextDirection;
  }

  // Set direction (prevent 180-degree turns)
  setDirection(newDirection) {
    if (
      newDirection.x !== -this.#direction.x ||
      newDirection.y !== -this.#direction.y
    ) {
      this.#nextDirection = newDirection;
    }
  }

  // Mark snake to grow on next move
  grow() {
    this.#growing = true;
  }

  // Move snake forward
  move() {
    this.#direction = this.#nextDirection;

    // Create new head
    const newHead = new SnakeSegment(
      this.head.x + this.#direction.x,
      this.head.y + this.#direction.y,
      true
    );

    // Update old head
    this.#segments[0].isHead = false;

    // Add new head to front
    this.#segments.unshift(newHead);

    // Remove tail if not growing
    if (!this.#growing) {
      this.#segments.pop();
    }
    this.#growing = false;
  }

  // Check if snake hit itself
  checkSelfCollision() {
    for (let i = 1; i < this.#segments.length; i++) {
      if (
        this.head.x === this.#segments[i].x &&
        this.head.y === this.#segments[i].y
      ) {
        return true;
      }
    }
    return false;
  }

  // Check if snake hit wall
  checkWallCollision() {
    return (
      this.head.x < 0 ||
      this.head.x >= GRID_SIZE ||
      this.head.y < 0 ||
      this.head.y >= GRID_SIZE
    );
  }

  // Render all segments
  render() {
    return this.#segments.map((segment) => segment.render());
  }
}

// ========================================
// GAME MANAGER CLASS - Controls entire game
// ========================================
class GameManager {
  #snake;
  #food;
  #score;
  #isRunning;
  #speed;
  #level;

  constructor() {
    this.#snake = new Snake();
    this.#food = null;
    this.#score = 0;
    this.#isRunning = false;
    this.#speed = INITIAL_SPEED;
    this.#level = 1;
    this.spawnFood();
  }

  // Getter methods (Encapsulation)
  get snake() {
    return this.#snake;
  }

  get food() {
    return this.#food;
  }

  get score() {
    return this.#score;
  }

  get isRunning() {
    return this.#isRunning;
  }

  get speed() {
    return this.#speed;
  }

  get level() {
    return this.#level;
  }

  // Game state methods
  start() {
    this.#isRunning = true;
  }

  pause() {
    this.#isRunning = false;
  }

  // Spawn food at random position
  spawnFood() {
    let x, y;
    do {
      x = Math.floor(Math.random() * GRID_SIZE);
      y = Math.floor(Math.random() * GRID_SIZE);
    } while (this.#snake.body.some((seg) => seg.x === x && seg.y === y));

    const isSpecial = Math.random() < 0.2;
    this.#food = new Food(x, y, isSpecial ? 'special' : 'normal');
  }

  // Update game state
  update() {
    if (!this.#isRunning) return { gameOver: false };

    const dir = this.#snake.direction;
    const nextX = this.#snake.head.x + dir.x;
    const nextY = this.#snake.head.y + dir.y;

    // Check wall collision
    if (
      nextX < 0 ||
      nextX >= GRID_SIZE ||
      nextY < 0 ||
      nextY >= GRID_SIZE
    ) {
      this.#isRunning = false;
      return { gameOver: true };
    }

    // Check self collision
    for (let i = 0; i < this.#snake.body.length; i++) {
      if (
        nextX === this.#snake.body[i].x &&
        nextY === this.#snake.body[i].y
      ) {
        this.#isRunning = false;
        return { gameOver: true };
      }
    }

    // Move snake
    this.#snake.move();

    // Check if food eaten
    if (this.#food.isEatenBy(this.#snake.head)) {
      this.#score += this.#food.points;
      this.#snake.grow();
      this.spawnFood();
      this.#updateLevel();
    }

    return { gameOver: false };
  }

  // Private method to update level and speed
  #updateLevel() {
    this.#level = Math.floor(this.#score / 10) + 1;
    this.#speed = Math.max(50, INITIAL_SPEED - (this.#level - 1) * 10);
  }

  // Reset game
  reset() {
    this.#snake = new Snake();
    this.#score = 0;
    this.#speed = INITIAL_SPEED;
    this.#level = 1;
    this.#isRunning = false;
    this.spawnFood();
  }
}

// ========================================
// STORAGE MANAGER CLASS - Handles data persistence
// ========================================
class StorageManager {
  #storageKey;

  constructor(storageKey = 'snake_high_score') {
    this.#storageKey = storageKey;
  }

  // Save high score
  async saveHighScore(score) {
    try {
      await AsyncStorage.setItem(this.#storageKey, score.toString());
      return true;
    } catch (error) {
      console.error('Failed to save high score:', error);
      return false;
    }
  }

  // Load high score
  async loadHighScore() {
    try {
      const score = await AsyncStorage.getItem(this.#storageKey);
      return score ? parseInt(score) : 0;
    } catch (error) {
      console.log('No high score found');
      return 0;
    }
  }

  // Clear high score
  async clearHighScore() {
    try {
      await AsyncStorage.removeItem(this.#storageKey);
      return true;
    } catch (error) {
      console.error('Failed to clear high score:', error);
      return false;
    }
  }
}

// ========================================
// MAIN COMPONENT
// ========================================
export default function SnakeGame() {
  const [gameState, setGameState] = useState(null);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  
  const gameManagerRef = useRef(null);
  const storageManagerRef = useRef(null);

  // Initialize storage manager
  useEffect(() => {
    storageManagerRef.current = new StorageManager();
  }, []);

  // Load high score
  useEffect(() => {
    const loadHighScore = async () => {
      if (storageManagerRef.current) {
        const score = await storageManagerRef.current.loadHighScore();
        setHighScore(score);
      }
    };
    loadHighScore();
  }, []);

  // Save high score when game ends
  useEffect(() => {
    const saveHighScore = async () => {
      if (
        showGameOver &&
        gameState &&
        gameState.score > highScore &&
        storageManagerRef.current
      ) {
        const success = await storageManagerRef.current.saveHighScore(
          gameState.score
        );
        if (success) {
          setHighScore(gameState.score);
        }
      }
    };
    saveHighScore();
  }, [showGameOver, gameState, highScore]);

  // Initialize game
  useEffect(() => {
    gameManagerRef.current = new GameManager();
    setGameState(gameManagerRef.current);
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameState?.isRunning) return;

    const interval = setInterval(() => {
      const result = gameState.update();
      if (result.gameOver) {
        setShowGameOver(true);
      }
      setRenderTrigger((prev) => prev + 1);
    }, gameState.speed);

    return () => clearInterval(interval);
  }, [gameState?.isRunning, gameState?.speed, renderTrigger]);

  // Handle direction change
  const handleDirection = (direction) => {
    if (gameState && !showGameOver) {
      gameState.snake.setDirection(direction);
      if (!gameState.isRunning) {
        gameState.start();
        setRenderTrigger((prev) => prev + 1);
      }
    }
  };

  // Handle start/pause
  const handleStart = () => {
    if (gameState && !showGameOver) {
      if (gameState.isRunning) {
        gameState.pause();
      } else {
        gameState.start();
      }
      setRenderTrigger((prev) => prev + 1);
    }
  };

  // Handle reset
  const handleReset = () => {
    if (gameState) {
      gameState.reset();
      setShowGameOver(false);
      setRenderTrigger((prev) => prev + 1);
    }
  };

  if (!gameState) return null;

  return (
    <ImageBackground
      source={{
        uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
      }}
      style={styles.background}
    >
      <View style={styles.container}>
        {/* Header with Score and Controls */}
        <View style={styles.header}>
          {/* Score Section */}
          <View style={styles.scoreSection}>
            <Text style={styles.scoreLabel}>SCORE</Text>
            <Text style={styles.scoreValue}>{gameState.score}</Text>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Image
              source={require('../assets/images/snakelogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.levelText}>Level {gameState.level}</Text>
          </View>

          {/* High Score and Play Button */}
          <View style={styles.rightSection}>
            <View style={styles.highScoreSection}>
              <Text style={styles.highScoreLabel}>HIGH SCORE</Text>
              <Text style={styles.highScoreValue}>
                {Math.max(highScore, gameState.score)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleStart}
              disabled={showGameOver}
              style={[
                styles.playButton,
                showGameOver && styles.playButtonDisabled,
              ]}
            >
              <Text style={styles.playButtonText}>
                {gameState.isRunning ? '⏸' : '▶'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Game Board */}
        <View style={styles.gameBoard}>
          {/* Grid Lines */}
          {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
            <React.Fragment key={`grid-${i}`}>
              <View
                style={[
                  styles.gridLine,
                  {
                    left: i * CELL_SIZE,
                    top: 0,
                    width: 1,
                    height: GRID_SIZE * CELL_SIZE,
                  },
                ]}
              />
              <View
                style={[
                  styles.gridLine,
                  {
                    left: 0,
                    top: i * CELL_SIZE,
                    width: GRID_SIZE * CELL_SIZE,
                    height: 1,
                  },
                ]}
              />
            </React.Fragment>
          ))}

          {/* Food */}
          {gameState.food && (
            <View
              style={[
                styles.food,
                {
                  left: gameState.food.x * CELL_SIZE,
                  top: gameState.food.y * CELL_SIZE,
                  width: gameState.food.render().size,
                  height: gameState.food.render().size,
                  backgroundColor: gameState.food.color,
                  borderRadius: gameState.food.render().borderRadius,
                },
              ]}
            />
          )}

          {/* Snake */}
          {gameState.snake.render().map((segment, idx) => (
            <View
              key={idx}
              style={[
                styles.snakeSegment,
                {
                  left: segment.position.x * CELL_SIZE,
                  top: segment.position.y * CELL_SIZE,
                  width: segment.size,
                  height: segment.size,
                  backgroundColor: segment.color,
                  borderWidth: segment.isHead ? 1 : 0,
                  borderColor: '#e0e0ff',
                },
              ]}
            >
              {segment.isHead && <Text style={styles.snakeEmoji}>🐍</Text>}
            </View>
          ))}

          {/* Game Over Overlay */}
          {showGameOver && (
            <View style={styles.gameOverOverlay}>
              <View style={styles.gameOverBox}>
                <Text style={styles.gameOverTitle}>GAME OVER</Text>

                <Text style={styles.gameOverScoreLabel}>SCORE</Text>
                <Text style={styles.gameOverScoreValue}>
                  {gameState.score}
                </Text>

                {gameState.score === highScore && gameState.score > 0 && (
                  <Text style={styles.newHighScore}>
                    🏆 NEW HIGH SCORE! 🏆
                  </Text>
                )}

                <Text style={styles.gameOverLevel}>
                  Level {gameState.level}
                </Text>

                <TouchableOpacity
                  onPress={handleReset}
                  style={styles.playAgainButton}
                >
                  <Text style={styles.playAgainButtonText}>PLAY AGAIN</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Control Buttons */}
        <View style={styles.controls}>
          {/* Up Button */}
          <View style={styles.controlRow}>
            <TouchableOpacity
              onPress={() => handleDirection({ x: 0, y: -1 })}
              disabled={showGameOver}
              style={[
                styles.controlButton,
                showGameOver && styles.controlButtonDisabled,
              ]}
            >
              <Text style={styles.controlButtonText}>▲</Text>
            </TouchableOpacity>
          </View>

          {/* Left, Right Buttons */}
          <View style={styles.controlRow}>
            <TouchableOpacity
              onPress={() => handleDirection({ x: -1, y: 0 })}
              disabled={showGameOver}
              style={[
                styles.controlButton,
                showGameOver && styles.controlButtonDisabled,
              ]}
            >
              <Text style={styles.controlButtonText}>◀</Text>
            </TouchableOpacity>

            <View style={styles.controlButtonSpacer} />

            <TouchableOpacity
              onPress={() => handleDirection({ x: 1, y: 0 })}
              disabled={showGameOver}
              style={[
                styles.controlButton,
                showGameOver && styles.controlButtonDisabled,
              ]}
            >
              <Text style={styles.controlButtonText}>▶</Text>
            </TouchableOpacity>
          </View>

          {/* Down Button */}
          <View style={styles.controlRow}>
            <TouchableOpacity
              onPress={() => handleDirection({ x: 0, y: 1 })}
              disabled={showGameOver}
              style={[
                styles.controlButton,
                showGameOver && styles.controlButtonDisabled,
              ]}
            >
              <Text style={styles.controlButtonText}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Reset Button */}
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>RESET</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

// ========================================
// STYLES - Simple and Easy to Understand
// ========================================
const styles = StyleSheet.create({
  // Background image
  background: {
    width: '100%',
    height: '100%',
  },

  // Main container
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },

  // ========== HEADER SECTION ==========
  header: {
    width: GRID_SIZE * CELL_SIZE,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  // Score section (left)
  scoreSection: {
    alignItems: 'flex-start',
  },
  scoreLabel: {
    fontSize: 11,
    color: '#e0e0ff',
    opacity: 0.7,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ec4899',
  },

  // Title section (center)
  titleSection: {
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 30,
    marginBottom: 4,
  },
  levelText: {
    fontSize: 11,
    color: '#e0e0ff',
    opacity: 0.8,
  },

  // Right section (high score + play button)
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  highScoreSection: {
    alignItems: 'flex-end',
  },
  highScoreLabel: {
    fontSize: 11,
    color: '#e0e0ff',
    opacity: 0.7,
    marginBottom: 4,
  },
  highScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },

  // Play/Pause button
  playButton: {
    width: 40,
    height: 40,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  playButtonDisabled: {
    opacity: 0.5,
  },
  playButtonText: {
    fontSize: 18,
    color: '#fbbf24',
    fontWeight: 'bold',
  },

  // ========== GAME BOARD ==========
  gameBoard: {
    width: GRID_SIZE * CELL_SIZE,
    height: GRID_SIZE * CELL_SIZE,
    backgroundColor: '#0f0f2e',
    borderWidth: 3,
    borderColor: '#5b4fb5',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },

  // Grid lines
  gridLine: {
    position: 'absolute',
    backgroundColor: '#2d2d5f',
    opacity: 0.3,
  },

  // Food
  food: {
    position: 'absolute',
  },

  // Snake segment
  snakeSegment: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  snakeEmoji: {
    fontSize: 8,
  },

  // ========== GAME OVER OVERLAY ==========
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  gameOverBox: {
    backgroundColor: '#0f0f2e',
    padding: 32,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#ec4899',
    alignItems: 'center',
    minWidth: 250,
  },
  gameOverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginBottom: 16,
  },
  gameOverScoreLabel: {
    fontSize: 12,
    color: '#10b981',
    marginBottom: 8,
  },
  gameOverScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ec4899',
    marginBottom: 12,
  },
  newHighScore: {
    fontSize: 12,
    color: '#fbbf24',
    marginBottom: 8,
  },
  gameOverLevel: {
    fontSize: 12,
    color: '#8b5cf6',
    marginBottom: 24,
  },
  playAgainButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 6,
  },
  playAgainButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f0f2e',
  },

  // ========== CONTROLS ==========
  controls: {
    marginTop: 32,
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
    gap: 4,
  },
  controlButton: {
    width: 48,
    height: 48,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  controlButtonText: {
    fontSize: 20,
    color: '#fbbf24',
    fontWeight: 'bold',
  },
  controlButtonSpacer: {
    width: 48,
    height: 48,
  },

  // Reset button
  resetButton: {
    width: 128,
    height: 40,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginTop: 12,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f0f2e',
  },
});