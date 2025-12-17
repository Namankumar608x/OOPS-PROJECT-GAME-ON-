import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// TicTacToe Game Class - OOP Implementation with Minimax
class TicTacToeGame {
  constructor(gridSize, isSinglePlayer) {
    this.gridSize = gridSize;
    this.isSinglePlayer = isSinglePlayer;
    this.board = Array(gridSize * gridSize).fill(null);
    this.currentPlayer = 'X';
    this.winner = null;
    this.winningLine = [];
    this.moveCount = 0;
  }

  makeMove(index) {
    if (this.board[index] || this.winner) return false;
    
    this.board[index] = this.currentPlayer;
    this.moveCount++;
    this.checkWinner();
    
    if (!this.winner) {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }
    
    return true;
  }

  checkWinner() {
    const size = this.gridSize;
    const winCondition = this.gridSize;
    
    for (let row = 0; row < size; row++) {
      for (let col = 0; col <= size - winCondition; col++) {
        const line = [];
        for (let i = 0; i < winCondition; i++) {
          line.push(row * size + col + i);
        }
        if (this.checkLine(line)) return;
      }
    }
    
    for (let col = 0; col < size; col++) {
      for (let row = 0; row <= size - winCondition; row++) {
        const line = [];
        for (let i = 0; i < winCondition; i++) {
          line.push((row + i) * size + col);
        }
        if (this.checkLine(line)) return;
      }
    }
    
    for (let row = 0; row <= size - winCondition; row++) {
      for (let col = 0; col <= size - winCondition; col++) {
        const line = [];
        for (let i = 0; i < winCondition; i++) {
          line.push((row + i) * size + col + i);
        }
        if (this.checkLine(line)) return;
      }
    }
    
    for (let row = 0; row <= size - winCondition; row++) {
      for (let col = winCondition - 1; col < size; col++) {
        const line = [];
        for (let i = 0; i < winCondition; i++) {
          line.push((row + i) * size + col - i);
        }
        if (this.checkLine(line)) return;
      }
    }
    
    if (this.moveCount === size * size) {
      this.winner = 'Draw';
    }
  }

  checkLine(line) {
    const values = line.map(i => this.board[i]);
    if (values[0] && values.every(v => v === values[0])) {
      this.winner = values[0];
      this.winningLine = line;
      return true;
    }
    return false;
  }

  // Minimax Algorithm with Alpha-Beta Pruning
  minimax(board, depth, isMaximizing, alpha, beta) {
    const tempBoard = this.board;
    const tempWinner = this.winner;
    const tempWinningLine = this.winningLine;
    const tempMoveCount = this.moveCount;
    
    this.board = [...board];
    this.moveCount = board.filter(cell => cell !== null).length;
    this.winner = null;
    this.winningLine = [];
    this.checkWinner();
    
    const winner = this.winner;
    
    this.board = tempBoard;
    this.winner = tempWinner;
    this.winningLine = tempWinningLine;
    this.moveCount = tempMoveCount;
    
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (winner === 'Draw') return 0;
    
    if (this.gridSize > 3 && depth >= 4) return 0;
    
    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          const evalScore = this.minimax(board, depth + 1, false, alpha, beta);
          board[i] = null;
          maxEval = Math.max(maxEval, evalScore);
          alpha = Math.max(alpha, evalScore);
          if (beta <= alpha) break;
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          const evalScore = this.minimax(board, depth + 1, true, alpha, beta);
          board[i] = null;
          minEval = Math.min(minEval, evalScore);
          beta = Math.min(beta, evalScore);
          if (beta <= alpha) break;
        }
      }
      return minEval;
    }
  }

  getAIMove() {
    if (this.gridSize > 3) {
      for (let i = 0; i < this.board.length; i++) {
        if (!this.board[i]) {
          this.board[i] = 'O';
          this.checkWinner();
          if (this.winner === 'O') {
            this.board[i] = null;
            this.winner = null;
            this.winningLine = [];
            return i;
          }
          this.board[i] = null;
          this.winner = null;
        }
      }
      
      for (let i = 0; i < this.board.length; i++) {
        if (!this.board[i]) {
          this.board[i] = 'X';
          this.checkWinner();
          if (this.winner === 'X') {
            this.board[i] = null;
            this.winner = null;
            this.winningLine = [];
            return i;
          }
          this.board[i] = null;
          this.winner = null;
        }
      }
      
      const center = Math.floor(this.board.length / 2);
      if (this.board[center] === null) return center;
      
      const emptySpots = this.board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
      return emptySpots[Math.floor(Math.random() * emptySpots.length)];
    }
    
    let bestMove = -1;
    let bestValue = -Infinity;
    
    for (let i = 0; i < this.board.length; i++) {
      if (this.board[i] === null) {
        this.board[i] = 'O';
        const moveValue = this.minimax([...this.board], 0, false, -Infinity, Infinity);
        this.board[i] = null;
        
        if (moveValue > bestValue) {
          bestValue = moveValue;
          bestMove = i;
        }
      }
    }
    
    return bestMove;
  }

  reset() {
    this.board = Array(this.gridSize * this.gridSize).fill(null);
    this.currentPlayer = 'X';
    this.winner = null;
    this.winningLine = [];
    this.moveCount = 0;
  }
}

const TicTacToeScreen = () => {
  const navigation = useNavigation();
  const [screen, setScreen] = useState('menu');
  const [game, setGame] = useState(null);
  const [boardState, setBoardState] = useState([]);
  const [isSinglePlayer, setIsSinglePlayer] = useState(false);

  const startGame = (gridSize) => {
    const newGame = new TicTacToeGame(gridSize, isSinglePlayer);
    setGame(newGame);
    setBoardState([...newGame.board]);
    setScreen('game');
  };

  const handleCellPress = (index) => {
    if (game.makeMove(index)) {
      setBoardState([...game.board]);
      
      if (isSinglePlayer && !game.winner && game.currentPlayer === 'O') {
        setTimeout(() => {
          const aiMove = game.getAIMove();
          game.makeMove(aiMove);
          setBoardState([...game.board]);
        }, 500);
      }
    }
  };

  const resetGame = () => {
    game.reset();
    setBoardState([...game.board]);
  };

  const renderCell = (index) => {
    const value = boardState[index];
    const isWinning = game.winningLine.includes(index);
    
    const boardWidth = Math.min(width * 0.9, 500);
    const cellSize = (boardWidth / game.gridSize) - 8;
    
    return (
      <TouchableOpacity
        key={index}
        style={[styles.cell, { width: cellSize, height: cellSize }]}
        onPress={() => handleCellPress(index)}
        disabled={!!game.winner}
        activeOpacity={0.7}
      >
        <View style={[
          styles.cellInner,
          isWinning && styles.winningCell
        ]}>
          {value && (
            <Text style={[
              styles.cellText,
              value === 'X' ? styles.xText : styles.oText,
              isWinning && styles.winningText,
              { fontSize: cellSize * 0.6 }
            ]}>
              {value}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (screen === 'menu') {
    return (
      <View style={styles.container}>
        <View style={styles.gradientOverlay} />
        <View style={styles.menuContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>TIC</Text>
            <Text style={[styles.title, styles.xSymbol]}>X</Text>
            <Text style={styles.title}>TAC</Text>
            <Text style={[styles.title, styles.oSymbol]}>O</Text>
            <Text style={styles.title}>TOE</Text>
          </View>

          <View style={styles.glowCircle} />

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              setIsSinglePlayer(true);
              setScreen('gridSelect');
            }}
            activeOpacity={0.8}
          >
            <View style={styles.buttonGradient}>
              <Text style={styles.menuButtonText}>🎮 1 Player</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => {
              setIsSinglePlayer(false);
              setScreen('gridSelect');
            }}
            activeOpacity={0.8}
          >
            <View style={styles.buttonGradient}>
              <Text style={styles.menuButtonText}>👥 2 Players</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (screen === 'gridSelect') {
    return (
      <View style={styles.container}>
        <View style={styles.gradientOverlay} />
        <View style={styles.menuContainer}>
          <Text style={styles.subtitle}>CHOOSE GRID SIZE</Text>

          <View style={styles.gridOptions}>
            {[3, 5].map(size => (
              <TouchableOpacity
                key={size}
                style={styles.gridOption}
                onPress={() => startGame(size)}
                activeOpacity={0.8}
              >
                <View style={styles.gridOptionInner}>
                  <View style={styles.gridPreview}>
                    {Array(size * size).fill(0).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.gridPreviewCell,
                          { 
                            width: (110 / size) - 1, 
                            height: (110 / size) - 1 
                          }
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.gridOptionText}>{size} × {size}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setScreen('menu')}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const boardWidth = Math.min(width * 0.9, 500);
  
  return (
    <View style={styles.container}>
      <View style={styles.gradientOverlay} />
      <View style={styles.gameContainer}>
        <View style={styles.turnContainer}>
          <Text style={styles.turnText}>
            {game.winner === 'Draw' ? "🤝 It's a Draw!" : game.winner ? `🎉 Player ${game.winner} Wins!` : `Player ${game.currentPlayer}'s Turn`}
          </Text>
        </View>

        <View style={[styles.board, { width: boardWidth }]}>
          {boardState.map((_, index) => renderCell(index))}
        </View>

        <View style={styles.gameButtons}>
          <TouchableOpacity 
            style={styles.gameButton} 
            onPress={resetGame}
            activeOpacity={0.8}
          >
            <Text style={styles.gameButtonText}>🔄 Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gameButton}
            onPress={() => setScreen('menu')}
            activeOpacity={0.8}
          >
            <Text style={styles.gameButtonText}>🏠 Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0a3e',
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#1a0a3e',
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 80,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  title: {
    fontSize: 52,
    fontWeight: '900',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    marginHorizontal: 5,
    letterSpacing: 2,
  },
  xSymbol: {
    color: '#ff6b6b',
  },
  oSymbol: {
    color: '#4ecdc4',
  },
  subtitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    marginBottom: 50,
    letterSpacing: 1,
  },
  glowCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    top: '30%',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 100,
  },
  menuButton: {
    width: width * 0.7,
    marginVertical: 12,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    backgroundColor: 'rgba(255, 0, 255, 0.3)',
    paddingHorizontal: 40,
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 30,
  },
  menuButtonText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  gridOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  gridOption: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  gridOptionInner: {
    backgroundColor: 'rgba(255, 0, 255, 0.3)',
    padding: 20,
    alignItems: 'center',
    borderRadius: 20,
  },
  gridPreview: {
    width: 110,
    height: 110,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridPreviewCell: {
    backgroundColor: '#ffffff',
    margin: 0.5,
    borderRadius: 2,
    opacity: 0.8,
  },
  gridOptionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 0, 255, 0.5)',
    borderRadius: 15,
  },
  backButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  gameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 1,
  },
  turnContainer: {
    backgroundColor: 'rgba(255, 0, 255, 0.3)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 30,
  },
  turnText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 1,
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  cell: {
    margin: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cellInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a1a5e',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  winningCell: {
    backgroundColor: '#ffff00',
    transform: [{ scale: 1.05 }],
  },
  cellText: {
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  xText: {
    color: '#ff6b6b',
  },
  oText: {
    color: '#00ffff',
  },
  winningText: {
    transform: [{ scale: 1.15 }],
  },
  gameButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '85%',
    gap: 15,
  },
  gameButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 0, 255, 0.3)',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  gameButtonText: {
    fontSize: 18,
    fontWeight: 'light',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});

export default TicTacToeScreen;