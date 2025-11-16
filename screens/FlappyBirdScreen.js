// screens/FlappyBirdScreen.js - Fixed Restart Version
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const BIRD_SIZE = 40;
const PIPE_WIDTH = 60;
const PIPE_GAP = 200;
const GRAVITY = 0.5;          // ← Increased from 0.3 (faster fall)
const JUMP_STRENGTH = -9;     // ← Increased from -7 (higher jump)

// Obstacle types
const OBSTACLE_TYPES = ['PIPE', 'CLOUD', 'SPIKE'];

const FlappyBirdScreen = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [wingFlap, setWingFlap] = useState(false); // ← Wing animation state

  // Bird position
  const birdY = useRef(new Animated.Value(SCREEN_HEIGHT / 2)).current;
  const birdVelocity = useRef(0);

  // Game state refs
  const gameStateRef = useRef({
    isPlaying: false,
    isGameOver: false,
    currentScore: 0,
    currentSpeed: 2, // ← Initial obstacle speed
    difficultyLevel: 1, // ← Track difficulty
  });

  // Game loop
  const gameLoopRef = useRef(null);
  const frameCountRef = useRef(0);

  // Update game - using useRef to avoid stale closure
  const updateGameRef = useRef(() => {});

  useEffect(() => {
    updateGameRef.current = () => {
      if (!gameStateRef.current.isPlaying || gameStateRef.current.isGameOver) {
        return;
      }

      // Update bird physics
      birdVelocity.current += GRAVITY;
      const currentBirdY = birdY._value;
      const newY = currentBirdY + birdVelocity.current;

      // Check ground collision
      if (newY >= SCREEN_HEIGHT - 100 - BIRD_SIZE) {
        birdY.setValue(SCREEN_HEIGHT - 100 - BIRD_SIZE);
        endGame();
        return;
      }

      // Check ceiling collision
      if (newY <= 0) {
        birdY.setValue(0);
        birdVelocity.current = 0;
        return;
      }

      // Update bird position
      birdY.setValue(newY);

      // Spawn pipes
      frameCountRef.current++;
      if (frameCountRef.current % 120 === 0) {
        spawnPipe();
      }

      // Update pipes
      setPipes((currentPipes) => {
        const birdX = 50;

        return currentPipes
          .map((pipe) => {
            const newX = pipe.x - 2;

            // Check collision
            if (
              birdX + BIRD_SIZE > newX &&
              birdX < newX + PIPE_WIDTH &&
              (newY < pipe.topHeight || newY + BIRD_SIZE > pipe.topHeight + PIPE_GAP)
            ) {
              endGame();
            }

            // Check score
            if (!pipe.passed && newX + PIPE_WIDTH < birdX) {
              pipe.passed = true;
              gameStateRef.current.currentScore++;
              setScore(gameStateRef.current.currentScore);
            }

            return { ...pipe, x: newX };
          })
          .filter((pipe) => pipe.x > -PIPE_WIDTH);
      });
    };
  }, []);

  // End game
  const endGame = () => {
    if (gameStateRef.current.isGameOver) return; // Prevent multiple calls
    
    gameStateRef.current.isGameOver = true;
    gameStateRef.current.isPlaying = false;
    
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    setGameOver(true);
    
    // Update high score
    if (gameStateRef.current.currentScore > highScore) {
      setHighScore(gameStateRef.current.currentScore);
    }
  };

  // Spawn pipe
  const spawnPipe = () => {
    const minHeight = 100;
    const maxHeight = SCREEN_HEIGHT - PIPE_GAP - 200;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

    // Random obstacle type
    const obstacleType = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];

    setPipes((currentPipes) => [
      ...currentPipes,
      {
        id: Date.now() + Math.random(),
        x: SCREEN_WIDTH,
        topHeight,
        passed: false,
        type: obstacleType, // ← Add obstacle type
      },
    ]);
  };

  // Start game
  const startGame = () => {
    console.log('🎮 Starting game...');
    
    // Clear existing interval
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    // Reset state
    gameStateRef.current = {
      isPlaying: true,
      isGameOver: false,
      currentScore: 0,
    };

    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setPipes([]);
    frameCountRef.current = 0;

    // Reset bird
    birdY.setValue(SCREEN_HEIGHT / 2);
    birdVelocity.current = 0;

    // Start game loop
    gameLoopRef.current = setInterval(() => {
      updateGameRef.current();
    }, 16); // ~60 FPS

    console.log('✅ Game started!');
  };

  // Jump
  const jump = () => {
    if (!gameStarted || gameOver) {
      // Start or restart
      startGame();
      setTimeout(() => {
        birdVelocity.current = JUMP_STRENGTH;
        animateWing();
      }, 50);
    } else {
      // Normal jump
      birdVelocity.current = JUMP_STRENGTH;
      animateWing();
    }
  };

  // Animate wing flap
  const animateWing = () => {
    setWingFlap(true);
    setTimeout(() => setWingFlap(false), 150);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={jump}
      style={styles.container}
    >
      {/* Background */}
      <View style={styles.background} />

      {/* Bird */}
      <Animated.View
        style={[
          styles.bird,
          {
            left: 50,
            top: birdY,
          },
        ]}
      >
        <View style={styles.birdBody}>
          {/* Wing with animation */}
          <View style={[
            styles.birdWing, 
            wingFlap && styles.birdWingFlap
          ]} />
          <View style={styles.birdEye} />
          <View style={styles.birdBeak} />
          {/* Shine effect */}
          <View style={styles.birdShine} />
        </View>
      </Animated.View>

      {/* Obstacles */}
      {pipes.map((pipe) => (
        <View key={pipe.id} style={[styles.pipeContainer, { left: pipe.x }]}>
          {pipe.type === 'PIPE' ? (
            <>
              {/* Traditional Pipe */}
              <View
                style={[
                  styles.pipe,
                  styles.pipeTop,
                  { height: pipe.topHeight },
                ]}
              >
                <View style={[styles.pipeCap, { bottom: -10 }]} />
              </View>
              
              <View
                style={[
                  styles.pipe,
                  styles.pipeBottom,
                  { top: pipe.topHeight + PIPE_GAP },
                ]}
              >
                <View style={[styles.pipeCap, { top: -10 }]} />
              </View>
            </>
          ) : pipe.type === 'CLOUD' ? (
            <>
              {/* Cloud Obstacle */}
              <View style={[styles.cloudObstacle, { top: pipe.topHeight - 30 }]}>
                <View style={styles.cloudCircle1} />
                <View style={styles.cloudCircle2} />
                <View style={styles.cloudCircle3} />
              </View>
              <View style={[styles.cloudObstacle, { top: pipe.topHeight + PIPE_GAP }]}>
                <View style={styles.cloudCircle1} />
                <View style={styles.cloudCircle2} />
                <View style={styles.cloudCircle3} />
              </View>
            </>
          ) : (
            <>
              {/* Spike Obstacle */}
              <View style={[styles.spikeTop, { height: pipe.topHeight }]} />
              <View style={[styles.spikeBottom, { top: pipe.topHeight + PIPE_GAP }]} />
            </>
          )}
        </View>
      ))}

      {/* Ground */}
      <View style={styles.ground} />

      {/* Score */}
      {gameStarted && !gameOver && (
        <Text style={styles.score}>{score}</Text>
      )}

      {/* Start Screen */}
      {!gameStarted && (
        <View style={styles.overlay}>
          <Text style={styles.title}>🐦 FLAPPY BIRD 🐦</Text>
          <Text style={styles.subtitle}>Tap to Start</Text>
          <Text style={styles.highScoreText}>High Score: {highScore}</Text>
        </View>
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <View style={styles.overlay}>
          <Text style={styles.gameOverText}>GAME OVER</Text>
          <Text style={styles.finalScore}>Score: {score}</Text>
          <Text style={styles.bestScore}>Best: {highScore}</Text>
          <Text style={styles.restartText}>Tap to Restart</Text>
        </View>
      )}

      {/* Bottom UI */}
      <View style={styles.bottomUI}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxBest]}>
          <Text style={styles.statLabel}>Best</Text>
          <Text style={styles.statValue}>{highScore}</Text>
        </View>
      </View>

      {/* Instructions */}
      {!gameStarted && (
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>📱 Tap screen to flap</Text>
          <Text style={styles.instructionText}>🎯 Avoid the pipes!</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16042dff',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:  '#16042dff',
  },
  bird: {
    position: 'absolute',
    width: BIRD_SIZE,
    height: BIRD_SIZE,
    zIndex: 10,
  },
  birdBody: {
    width: BIRD_SIZE,
    height: BIRD_SIZE,
    backgroundColor: '#FFD700',
    borderRadius: BIRD_SIZE / 2,
    borderWidth: 3,
    borderColor: '#FFA500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  birdEye: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: '#000',
    borderRadius: 5,
    top: 10,
    right: 8,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  birdBeak: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 12,
    borderRightWidth: 0,
    borderBottomWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: '#FF6B35',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    right: -12,
    top: 12,
  },
  birdWing: {
    position: 'absolute',
    width: 18,
    height: 12,
    backgroundColor: '#FFA500',
    borderRadius: 6,
    left: 5,
    top: 20,
    borderWidth: 2,
    borderColor: '#FF8C00',
    transform: [{ rotate: '-15deg' }],
  },
  birdWingFlap: {
    transform: [{ rotate: '15deg' }],
    top: 15,
  },
  birdShine: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 6,
    top: 5,
    left: 8,
  },
  // Cloud Obstacle
  cloudObstacle: {
    position: 'absolute',
    width: PIPE_WIDTH + 20,
    height: 50,
    left: -10,
  },
  cloudCircle1: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    bottom: 0,
    left: 0,
    opacity: 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  cloudCircle2: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    bottom: 5,
    left: 20,
    opacity: 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  cloudCircle3: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    bottom: 0,
    right: 0,
    opacity: 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  // Spike Obstacle
  spikeTop: {
    position: 'absolute',
    top: 0,
    width: PIPE_WIDTH,
    backgroundColor: '#E74C3C',
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderBottomWidth: 40,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#C0392B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  spikeBottom: {
    position: 'absolute',
    width: PIPE_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#E74C3C',
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderTopWidth: 40,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#C0392B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  pipeContainer: {
    position: 'absolute',
    width: PIPE_WIDTH,
    height: SCREEN_HEIGHT,
  },
  pipe: {
    position: 'absolute',
    width: PIPE_WIDTH,
    backgroundColor: '#2ECC71',
    borderWidth: 4,
    borderColor: '#27AE60',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  pipeTop: {
    top: 0,
  },
  pipeBottom: {
    bottom: 100,
    height: SCREEN_HEIGHT,
  },
  pipeCap: {
    position: 'absolute',
    width: PIPE_WIDTH + 12,
    height: 30,
    backgroundColor: '#27AE60',
    left: -6,
    borderRadius: 6,
    borderWidth: 4,
    borderColor: '#229954',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 8,
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    width: SCREEN_WIDTH,
    height: 100,
    backgroundColor: '#8B4513',
    borderTopWidth: 8,
    borderTopColor: '#654321',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  score: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    fontSize: 60,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    zIndex: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 24,
    color: '#FFF',
    marginBottom: 10,
  },
  highScoreText: {
    fontSize: 18,
    color: '#FFF',
  },
  gameOverText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF0000',
    marginBottom: 20,
  },
  finalScore: {
    fontSize: 32,
    color: '#FFF',
    marginBottom: 10,
  },
  bestScore: {
    fontSize: 32,
    color: '#FFD700',
    marginBottom: 20,
  },
  restartText: {
    fontSize: 24,
    color: '#FFF',
  },
  bottomUI: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  statBox: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFD700',
    minWidth: 120,
    alignItems: 'center',
  },
  statBoxBest: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    borderColor: '#FF6B35',
  },
  statLabel: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
  instructions: {
    position: 'absolute',
    bottom: 200,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#FFF',
    marginVertical: 2,
  },
});

export default FlappyBirdScreen;