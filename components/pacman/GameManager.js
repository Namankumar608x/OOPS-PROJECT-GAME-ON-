import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameEngine } from './GameEngine';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function GameManager() {
  const [gameState, setGameState] = useState(null);
  const gameEngineRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialize game engine
  useEffect(() => {
    gameEngineRef.current = new GameEngine(SCREEN_WIDTH, 800);
    setGameState(gameEngineRef.current.getGameState());

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Keyboard controls (web)
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyPress = (e) => {
        if (!gameEngineRef.current) return;

        if (gameEngineRef.current.gameOver) {
          if (e.code === 'Space' || e.code === 'Enter') {
            gameEngineRef.current.reset();
            gameEngineRef.current.start();
          }
          return;
        }

        switch (e.code) {
          case 'ArrowUp':
          case 'KeyW':
            e.preventDefault();
            gameEngineRef.current.handleInput('up');
            break;
          case 'ArrowDown':
          case 'KeyS':
            e.preventDefault();
            gameEngineRef.current.handleInput('down');
            break;
          case 'ArrowLeft':
          case 'KeyA':
            e.preventDefault();
            gameEngineRef.current.handleInput('left');
            break;
          case 'ArrowRight':
          case 'KeyD':
            e.preventDefault();
            gameEngineRef.current.handleInput('right');
            break;
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameEngineRef.current) return;

    const gameLoop = () => {
      gameEngineRef.current.update();
      setGameState({ ...gameEngineRef.current.getGameState() });
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleDirectionPress = (direction) => {
    if (gameEngineRef.current) {
      gameEngineRef.current.handleInput(direction);
    }
  };

  const handleRestart = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.reset();
      gameEngineRef.current.start();
    }
  };

  if (!gameState) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading Pac-Man...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreText}>{String(gameState.score).padStart(6, '0')}</Text>
        </View>

        <View style={styles.livesContainer}>
          <Text style={styles.livesLabel}>LIVES</Text>
          <View style={styles.livesIcons}>
            {[...Array(gameState.lives)].map((_, i) => (
              <Text key={i} style={styles.lifeIcon}>🟡</Text>
            ))}
          </View>
        </View>
      </View>

      {/* Game Board */}
      <View
        style={[
          styles.gameBoard,
          {
            width: gameState.boardWidth,
            height: gameState.boardHeight,
          },
        ]}
      >
        {/* Walls */}
        {gameState.walls.map((wall, index) => (
          <View
            key={`wall-${index}`}
            style={[
              styles.entity,
              {
                left: wall.x,
                top: wall.y,
                width: wall.width,
                height: wall.height,
                backgroundColor: wall.color,
                borderRadius: 4,
              },
            ]}
          />
        ))}

        {/* Pellets */}
        {gameState.pellets.map((pellet, index) => (
          <View
            key={`pellet-${index}`}
            style={[
              styles.entity,
              {
                left: pellet.x,
                top: pellet.y,
                width: pellet.width,
                height: pellet.height,
                backgroundColor: pellet.color,
                borderRadius: pellet.width / 2,
              },
            ]}
          />
        ))}

        {/* Pacman */}
        {gameState.pacman && (
          <View
            style={[
              styles.entity,
              {
                left: gameState.pacman.x,
                top: gameState.pacman.y,
                width: gameState.pacman.width,
                height: gameState.pacman.height,
                backgroundColor: gameState.pacman.color,
                borderRadius: gameState.pacman.width / 2,
              },
            ]}
          />
        )}

        {/* Ghosts */}
        {gameState.ghosts.map((ghost, index) => (
          <View
            key={`ghost-${index}`}
            style={[
              styles.entity,
              {
                left: ghost.x,
                top: ghost.y,
                width: ghost.width,
                height: ghost.height,
                backgroundColor: ghost.color,
                borderRadius: ghost.width / 2,
              },
            ]}
          />
        ))}

        {/* Game Over Overlay */}
        {gameState.gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.gameOverText}>GAME OVER</Text>
            <Text style={styles.finalScoreText}>Score: {gameState.score}</Text>
            <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
              <Ionicons name="refresh" size={24} color="#fff" />
              <Text style={styles.restartButtonText}>PLAY AGAIN</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Start Instructions */}
        {!gameState.isRunning && !gameState.gameOver && (
          <View style={styles.overlay}>
            <Text style={styles.readyText}>READY!</Text>
            <Text style={styles.instructionText}>
              {Platform.OS === 'web' ? 'Press Arrow Keys or WASD to Start' : 'Use D-Pad to Start'}
            </Text>
          </View>
        )}
      </View>

      {/* Mobile Controls */}
      {Platform.OS !== 'web' && (
        <View style={styles.controls}>
          <View style={styles.dpad}>
            <TouchableOpacity
              style={[styles.dpadButton, styles.dpadUp]}
              onPress={() => handleDirectionPress('up')}
            >
              <Ionicons name="arrow-up" size={30} color="#fff" />
            </TouchableOpacity>

            <View style={styles.dpadMiddle}>
              <TouchableOpacity
                style={[styles.dpadButton, styles.dpadLeft]}
                onPress={() => handleDirectionPress('left')}
              >
                <Ionicons name="arrow-back" size={30} color="#fff" />
              </TouchableOpacity>

              <View style={styles.dpadCenter} />

              <TouchableOpacity
                style={[styles.dpadButton, styles.dpadRight]}
                onPress={() => handleDirectionPress('right')}
              >
                <Ionicons name="arrow-forward" size={30} color="#fff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.dpadButton, styles.dpadDown]}
              onPress={() => handleDirectionPress('down')}
            >
              <Ionicons name="arrow-down" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 24,
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#000',
  },
  scoreContainer: {
    flex: 1,
  },
  scoreLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreText: {
    color: '#ffff00',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  livesContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  livesLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  livesIcons: {
    flexDirection: 'row',
  },
  lifeIcon: {
    fontSize: 20,
    marginLeft: 5,
  },
  gameBoard: {
    position: 'relative',
    backgroundColor: '#000',
    marginTop: 20,
  },
  entity: {
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  readyText: {
    color: '#ffff00',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  gameOverText: {
    color: '#ff0000',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  finalScoreText: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 30,
  },
  instructionText: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2121ff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  controls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dpad: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpadButton: {
    width: 60,
    height: 60,
    backgroundColor: '#2121ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  dpadUp: {
    marginBottom: 5,
  },
  dpadDown: {
    marginTop: 5,
  },
  dpadMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dpadLeft: {
    marginRight: 5,
  },
  dpadRight: {
    marginLeft: 5,
  },
  dpadCenter: {
    width: 60,
    height: 60,
  },
});