import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const GRID_SIZE = 20;
const CELL_SIZE = 15;
const INITIAL_SPEED = 200;

class GameObject {
  #x;
  #y; 
  constructor(x, y) {
    this.#x = x; 
    this.#y = y;
  }
 
  get x() { return this.#x; }
  get y() { return this.#y; }
  set x(value) { this.#x = value; }
  set y(value) { this.#y = value; }

  getPosition() {
    return { x: this.#x, y: this.#y };
  }

  render() {
    throw new Error (' ERROR! RENDER SHOULD BE IMPLEMENTED BY SUBCLASS ');
  }
}

class Food extends GameObject {
  #type;
  #points;
  constructor(x, y, type='normal') {
    super(x, y);
    this.#type = type;
    this.#points = type==='special' ? 5 : 1;
  }

  get points() { return this.#points; }
  get type() { return this.#type; }

  render() {
    return {
      position: this.getPosition(),
      color: this.#type === 'special' ? '#FFD700' : '#c93434ff',
      size: this.#type === 'special' ? CELL_SIZE * 1.2 : CELL_SIZE
    };
  }

  isEatenBy(snakeHead) {
    return this.x===snakeHead.x && this.y===snakeHead.y;
  }
}

class SnakeSegment extends GameObject {
  #isHead;
  constructor(x, y, isHead = false) {
    super(x, y);
    this.#isHead = isHead;
  }

  get isHead() { return this.#isHead; }
  set isHead(value) { this.#isHead = value; }

  render() {
    return {
      position: this.getPosition(),
      color: this.#isHead ? '#278c27ff' : '#81f145ff',
      size: CELL_SIZE,
    };
  }
}

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
  
    for (let i = 0; i < initialLength; i++) {
      this.#segments.push(
        new SnakeSegment(initialLength - i, Math.floor(GRID_SIZE / 2), i === 0)
      );
    }
  }

  get head() { return this.#segments[0]; }
  get body() { return this.#segments; }
  get length() { return this.#segments.length; }
  get direction() { return this.#nextDirection; }

  setDirection(newDirection) {
    if (newDirection.x !== -this.#direction.x || newDirection.y !== -this.#direction.y) {
      this.#nextDirection = newDirection;
    }
  }

  grow() {
    this.#growing = true;
  }

  move() {
    this.#direction = this.#nextDirection;
    const newHead = new SnakeSegment(
      this.head.x + this.#direction.x,
      this.head.y + this.#direction.y,
      true
    );

    this.#segments[0].isHead = false;
    this.#segments.unshift(newHead);

    if (!this.#growing) {
      this.#segments.pop();
    }
    this.#growing = false;
  }

  checkSelfCollision() {
    for (let i = 1; i < this.#segments.length; i++) {
      if (this.head.x === this.#segments[i].x && 
          this.head.y === this.#segments[i].y) {
        return true;
      }
    }
    return false;
  }

  checkWallCollision() {
    return this.head.x < 0 || this.head.x >= GRID_SIZE ||
           this.head.y < 0 || this.head.y >= GRID_SIZE;
  }

  render() {
    return this.#segments.map(segment => segment.render());
  }
}

class GameManager {
  #snake;
  #food;
  #score;
  #isRunning;
  #speed;
  
  constructor() {
    this.#snake = new Snake();
    this.#food = null;
    this.#score = 0;
    this.#isRunning = false;
    this.#speed = INITIAL_SPEED;
    this.spawnFood();
  }

  get snake() { return this.#snake; }
  get food() { return this.#food; }
  get score() { return this.#score; }
  get isRunning() { return this.#isRunning; }
  get speed() { return this.#speed; }

  start() { this.#isRunning = true; }
  pause() { this.#isRunning = false; }

  spawnFood() {
    let x, y;
    do {
      x = Math.floor(Math.random() * GRID_SIZE);
      y = Math.floor(Math.random() * GRID_SIZE);
    } while (this.#snake.body.some(seg => seg.x === x && seg.y === y));
    
    const isSpecial = Math.random() < 0.2;
    this.#food = new Food(x, y, isSpecial ? 'special' : 'normal');
  }

  update() {
    if (!this.#isRunning) return { gameOver: false };

    const dir = this.#snake.direction;
    const nextX = this.#snake.head.x + dir.x;
    const nextY = this.#snake.head.y + dir.y;

    if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
      this.#isRunning = false;
      return { gameOver: true };
    }

    
    for (let i = 0; i < this.#snake.body.length; i++) {
      if (nextX === this.#snake.body[i].x && nextY === this.#snake.body[i].y) {
        this.#isRunning = false;
        return { gameOver: true };
      }
    }

    this.#snake.move();

    if (this.#food.isEatenBy(this.#snake.head)) {
      this.#score += this.#food.points;
      this.#snake.grow();
      this.spawnFood();
      const newLevel = Math.floor(this.#score / 10) + 1;
      this.#speed = Math.max(50, INITIAL_SPEED - (newLevel - 1) * 10);
    }

    return { gameOver: false };
  }

  reset() {
    this.#snake = new Snake();
    this.#score = 0;
    this.#speed = INITIAL_SPEED;
    this.#isRunning = false;
    this.spawnFood();
  }
}

export default function SnakeGame() {
  const [gameState, setGameState] = useState(null);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);
  const gameManagerRef = useRef(null);

  useEffect(() => {
    gameManagerRef.current = new GameManager();
    setGameState(gameManagerRef.current);
  }, []);

  useEffect(() => {
    if (!gameState?.isRunning) return;

    const interval = setInterval(() => {
      const result = gameState.update();
      if (result.gameOver) {
        setShowGameOver(true);
      }
      setRenderTrigger(prev => prev + 1);
    }, gameState.speed);

    return () => clearInterval(interval);
  }, [gameState?.isRunning, gameState?.speed, renderTrigger]);

  const handleDirection = (direction) => {
    if (gameState && !showGameOver) {
      gameState.snake.setDirection(direction);
      if (!gameState.isRunning) {
        gameState.start();
        setRenderTrigger(prev => prev + 1);
      }
    }
  };

  const handleStart = () => {
    if (gameState && !showGameOver) {
      if (gameState.isRunning) {
        gameState.pause();
      } else {
        gameState.start();
      }
      setRenderTrigger(prev => prev + 1);
    }
  };

  const handleReset = () => {
    if (gameState) {
      gameState.reset();
      setShowGameOver(false);
      setRenderTrigger(prev => prev + 1);
    }
  };

  if (!gameState) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Snake Game</Text>
        <View style={styles.scoreBoard}>
          <Text style={styles.score}>Score: {gameState.score}</Text>
          <Text style={styles.info}>
            Level: {Math.floor((INITIAL_SPEED - gameState.speed) / 10) + 1}
          </Text>
        </View>
      </View>

      <View style={styles.gameBoard}>
       
        {showGameOver && (
          <View style={styles.gameOverOverlay}>
            <View style={styles.gameOverBox}>
              <Text style={styles.gameOverTitle}>Game Over!</Text>
              <Text style={styles.gameOverScore}>Your Score</Text>
              <Text style={styles.gameOverScoreValue}>{gameState.score}</Text>
              <Text style={styles.gameOverLevel}>
                Level {Math.floor((INITIAL_SPEED - gameState.speed) / 10) + 1} Reached
              </Text>
              <TouchableOpacity
                style={styles.newGameButton}
                onPress={handleReset}
              >
                <Text style={styles.newGameButtonText}>New Game</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {gameState.food && (
          <View
            style={[
              styles.gameObject,
              {
                left: gameState.food.x * CELL_SIZE,
                top: gameState.food.y * CELL_SIZE,
                width: gameState.food.render().size,
                height: gameState.food.render().size,
                backgroundColor: gameState.food.render().color,
                borderRadius: gameState.food.type === 'special' ? CELL_SIZE : CELL_SIZE / 4,
              }
            ]}
          />
        )}

        {gameState.snake.render().map((segment, idx) => (
          <View
            key={idx}
            style={[
              styles.gameObject,
              {
                left: segment.position.x * CELL_SIZE,
                top: segment.position.y * CELL_SIZE,
                width: segment.size,
                height: segment.size,
                backgroundColor: segment.color,
                borderRadius: segment.color === '#4ECDC4' ? CELL_SIZE / 2 : CELL_SIZE / 4,
                borderWidth: segment.color === '#4ECDC4' ? 2 : 0,
                borderColor: '#fff',
              }
            ]}
          />
        ))}
      </View>

      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleDirection({ x: 0, y: -1 })}
            disabled={showGameOver}
          >
            <Text style={styles.buttonText}>↑</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleDirection({ x: -1, y: 0 })}
            disabled={showGameOver}
          >
            <Text style={styles.buttonText}>←</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.actionButton]}
            onPress={handleStart}
            disabled={showGameOver}
          >
            <Text style={styles.buttonText}>
              {gameState.isRunning ? '⏸' : '▶'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleDirection({ x: 1, y: 0 })}
            disabled={showGameOver}
          >
            <Text style={styles.buttonText}>→</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleDirection({ x: 0, y: 1 })}
            disabled={showGameOver}
          >
            <Text style={styles.buttonText}>↓</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleReset}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  scoreBoard: {
    flexDirection: 'row',
    gap: 30,
  },
  score: {
    fontSize: 18,
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
  info: {
    fontSize: 18,
    color: '#eac700',
    fontWeight: 'bold',
  },
  gameBoard: {
    width: GRID_SIZE * CELL_SIZE,
    height: GRID_SIZE * CELL_SIZE,
    backgroundColor: '#16213e',
    position: 'relative',
    borderWidth: 3,
    borderColor: '#4ECDC4',
    borderRadius: 8,
    overflow: 'hidden',
  },
  gameObject: {
    position: 'absolute',
  },
  controls: {
    marginTop: 25,
    alignItems: 'center',
    gap: 5,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 5,
  },
  button: {
    width: 42,
    height: 42,
    backgroundColor: '#4ECDC4',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 24,
    color: '#1a1a2e',
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#FFD700',
  },
  resetButton: {
    width: 120,
    backgroundColor: '#fac824ff',
    marginTop: 8,
  },
  legend: {
    marginTop: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#16213e',
    borderRadius: 8,
  },
  legendText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  oopInfo: {
    marginTop: 18,
    padding: 15,
    backgroundColor: '#16213e',
    borderRadius: 8,
    maxWidth: 350,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  oopTitle: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  oopText: {
    color: '#fff',
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 5,
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    zIndex: 1000,
  },
  gameOverBox: {
    backgroundColor: '#16213e',
    padding: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#4ECDC4',
    alignItems: 'center',
    minWidth: 280,
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffcd28ff',
    marginBottom: 18,
  },
  gameOverScore: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  gameOverScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 10,
  },
  gameOverLevel: {
    fontSize: 14,
    color: '#eac700',
    marginBottom: 25,
  },
  newGameButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 5,
  },
  newGameButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
});