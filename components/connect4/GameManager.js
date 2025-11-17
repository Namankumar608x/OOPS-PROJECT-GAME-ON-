// GameManager.js - Connect 4 React Component (FIXED)
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameEngine } from './GameEngine';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CELL_SIZE = Math.min(SCREEN_WIDTH / 8, 60);

export default function GameManager() {
  const [gameState, setGameState] = useState(null);
  const [selectedCol, setSelectedCol] = useState(null);
  const gameEngineRef = useRef(null);
  const dropAnimations = useRef({});

  // Initialize game engine
  useEffect(() => {
    gameEngineRef.current = new GameEngine();
    setGameState(gameEngineRef.current.getGameState());
  }, []);

  // AI move after player's turn
  useEffect(() => {
    if (
      gameState &&
      gameState.gameMode === 'pvai' &&
      gameState.currentPlayer === 2 &&
      !gameState.gameOver
    ) {
      // Use a timeout to give visual feedback before AI moves
      const aiTimeout = setTimeout(() => {
        const aiMove = gameEngineRef.current.makeAIMove();
        if (aiMove !== -1) {
          // Update state to show AI's piece first
          setGameState({ ...gameEngineRef.current.getGameState() });
          
          // Then check for win after a delay so user can see the piece
          setTimeout(() => {
            const gameEnded = gameEngineRef.current.checkGameEnd();
            if (gameEnded) {
              setGameState({ ...gameEngineRef.current.getGameState() });
            }
          }, 500); // Delay to show the winning piece before victory message
        }
      }, 600);

      return () => clearTimeout(aiTimeout);
    }
  }, [gameState?.currentPlayer, gameState?.gameMode, gameState?.gameOver]);

  const handleColumnPress = (col) => {
    if (!gameEngineRef.current || gameState.gameOver || (gameState.gameMode === 'pvai' && gameState.currentPlayer === 2)) return;

    const success = gameEngineRef.current.makeMove(col);
    if (success) {
      setGameState({ ...gameEngineRef.current.getGameState() });
    }
  };

  const handleModeSelect = (mode) => {
    gameEngineRef.current.setGameMode(mode);
    setGameState({ ...gameEngineRef.current.getGameState() });
  };

  const handleRestart = () => {
    gameEngineRef.current.reset();
    setGameState({ ...gameEngineRef.current.getGameState() });
  };

  const handleBackToMenu = () => {
    gameEngineRef.current.setGameMode('menu');
    setGameState({ ...gameEngineRef.current.getGameState() });
  };

  if (!gameState) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Menu Screen
  if (gameState.gameMode === 'menu') {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={require('../../assets/images/background_main.png')}
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.backgroundOverlay} />
          <View style={styles.menuContainer}>
            <Text style={styles.title}>CONNECT 4</Text>
            <Text style={styles.subtitle}>Choose Game Mode</Text>

            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => handleModeSelect('pvp')}
            >
              <Ionicons name="people" size={30} color="#fff" />
              <Text style={styles.menuButtonText}>Player vs Player</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuButton, styles.aiButton]}
              onPress={() => handleModeSelect('pvai')}
            >
              <Ionicons name="desktop" size={30} color="#fff" />
              <Text style={styles.menuButtonText}>Player vs AI</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    );
  }

  // Game Screen
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/background_main.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.backgroundOverlay} />
        <View style={styles.gameContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackToMenu}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.playerIndicator}>
              <Text style={styles.playerText}>
                {gameState.gameOver
                  ? gameState.isDraw
                    ? "IT'S A DRAW!"
                    : `PLAYER ${gameState.winner} WINS!`
                  : `PLAYER ${gameState.currentPlayer}'S TURN`}
              </Text>
              {!gameState.gameOver && (
                <View
                  style={[
                    styles.currentPlayerDot,
                    {
                      backgroundColor:
                        gameState.currentPlayer === 1 ? '#FF6B9D' : '#FFD93D',
                    },
                  ]}
                />
              )}
            </View>

            <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Game Board */}
          <View style={styles.boardContainer}>
            <View style={styles.board}>
              {/* Grid */}
              {gameState.board.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.row}>
                  {row.map((cell, colIndex) => {
                    const isWinning = gameState.winningPositions.some(
                      (pos) => pos.row === rowIndex && pos.col === colIndex
                    );

                    return (
                      <View
                        key={`cell-${rowIndex}-${colIndex}`}
                        style={styles.cell}
                      >
                        {cell !== 0 && (
                          <View
                            style={[
                              styles.piece,
                              {
                                backgroundColor:
                                  cell === 1 ? '#FF6B9D' : '#FFD93D',
                              },
                              isWinning && styles.winningPiece,
                            ]}
                          />
                        )}
                      </View>
                    );
                  })}
                </View>
              ))}

              {/* Board frame (blue holes) */}
              <View style={styles.boardFrame}>
                {gameState.board.map((row, rowIndex) => (
                  <View key={`frame-row-${rowIndex}`} style={styles.frameRow}>
                    {row.map((_, colIndex) => (
                      <View
                        key={`frame-cell-${rowIndex}-${colIndex}`}
                        style={styles.frameCell}
                      >
                        <View style={styles.hole} />
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </View>

            {/* Column buttons */}
            <View style={styles.columnButtons}>
              {[0, 1, 2, 3, 4, 5, 6].map((col) => (
                <TouchableOpacity
                  key={`col-${col}`}
                  style={[
                    styles.columnButton,
                    selectedCol === col && styles.columnButtonSelected,
                  ]}
                  onPress={() => handleColumnPress(col)}
                  onPressIn={() => setSelectedCol(col)}
                  onPressOut={() => setSelectedCol(null)}
                  disabled={gameState.gameOver || (gameState.gameMode === 'pvai' && gameState.currentPlayer === 2)}
                >
                  <Ionicons name="chevron-down" size={24} color="#fff" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Game Over Overlay */}
          {gameState.gameOver && (
            <View style={styles.overlay}>
              <View style={styles.gameOverContainer}>
                <Text style={styles.gameOverTitle}>
                  {gameState.isDraw ? "IT'S A DRAW!" : `PLAYER ${gameState.winner} WINS!`}
                </Text>

                <View style={styles.gameOverButtons}>
                  <TouchableOpacity
                    style={styles.gameOverButton}
                    onPress={handleRestart}
                  >
                    <Ionicons name="refresh" size={24} color="#fff" />
                    <Text style={styles.gameOverButtonText}>PLAY AGAIN</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.gameOverButton, styles.menuButtonSecondary]}
                    onPress={handleBackToMenu}
                  >
                    <Ionicons name="home" size={24} color="#fff" />
                    <Text style={styles.gameOverButtonText}>MENU</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0033',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 0, 51, 0.4)',
  },
  loadingText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },

  // Menu Styles
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#FF6B9D',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#FFD93D',
    marginBottom: 50,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 157, 0.9)',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 15,
    marginVertical: 10,
    minWidth: 280,
    borderWidth: 2,
    borderColor: '#FF6B9D',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  aiButton: {
    backgroundColor: 'rgba(255, 217, 61, 0.9)',
    borderColor: '#FFD93D',
    shadowColor: '#FFD93D',
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },

  // Game Styles
  gameContainer: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  playerIndicator: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  playerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: '#FF6B9D',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  currentPlayerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  restartButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  // Board Styles
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  board: {
    backgroundColor: 'rgba(100, 50, 200, 0.9)',
    borderRadius: 20,
    padding: 10,
    borderWidth: 4,
    borderColor: '#9D4EDD',
    position: 'relative',
    shadowColor: '#9D4EDD',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  piece: {
    width: CELL_SIZE - 8,
    height: CELL_SIZE - 8,
    borderRadius: (CELL_SIZE - 8) / 2,
    borderWidth: 3,
    borderColor: '#fff',
  },
  winningPiece: {
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },

  // Board Frame (Blue holes overlay)
  boardFrame: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
  },
  frameRow: {
    flexDirection: 'row',
  },
  frameCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  hole: {
    width: CELL_SIZE - 12,
    height: CELL_SIZE - 12,
    borderRadius: (CELL_SIZE - 12) / 2,
    backgroundColor: 'rgba(0, 0, 50, 0.7)',
    borderWidth: 2,
    borderColor: 'rgba(157, 78, 221, 0.5)',
  },

  // Column Buttons
  columnButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  columnButton: {
    width: CELL_SIZE,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  columnButtonSelected: {
    backgroundColor: 'rgba(255, 107, 157, 0.7)',
    borderColor: '#FF6B9D',
  },

  // Game Over Overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverContainer: {
    backgroundColor: 'rgba(100, 50, 200, 0.95)',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FF6B9D',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  gameOverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textShadowColor: '#FFD93D',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  gameOverButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  gameOverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 157, 0.9)',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  menuButtonSecondary: {
    backgroundColor: 'rgba(255, 217, 61, 0.9)',
  },
  gameOverButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});