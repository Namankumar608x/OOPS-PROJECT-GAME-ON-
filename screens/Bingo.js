import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Modal,Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== ENCAPSULATION ====================
class BingoCell {
  #number;
  #isMarked;
  
  constructor(number) {
    this.#number = number;
    this.#isMarked = false;
  }
  
  getNumber() {
    return this.#number;
  }
  
  isMarked() {
    return this.#isMarked;
  }
  
  mark() {
    this.#isMarked = true;
    return true;
  }
  
  reset() {
    this.#isMarked = false;
  }
}

// ==================== ABSTRACTION ====================
class GameBoard {
  constructor(size) {
    if (this.constructor === GameBoard) {
      throw new Error("Cannot instantiate abstract class GameBoard");
    }
    this.size = size;
    this.board = [];
    this.numbers = [];
  }
  
  generateBoard() {
    throw new Error("Method 'generateBoard()' must be implemented in subclass");
  }
  
  checkWin() {
    throw new Error("Method 'checkWin()' must be implemented in subclass");
  }
  
  resetBoard() {
    this.board.forEach(row => {
      row.forEach(cell => cell.reset());
    });
  }
}

// ==================== INHERITANCE ====================
class BingoBoard extends GameBoard {
  constructor(size = 5) {
    super(size);
    this.winPatterns = this.#initializeWinPatterns();
    this.completedLines = 0;
    this.generateBoard();
  }
  
  #initializeWinPatterns() {
    const patterns = [];
    
    // Rows
    for (let i = 0; i < this.size; i++) {
      patterns.push(Array.from({ length: this.size }, (_, j) => [i, j]));
    }
    
    // Columns
    for (let j = 0; j < this.size; j++) {
      patterns.push(Array.from({ length: this.size }, (_, i) => [i, j]));
    }
    
    // Diagonals
    patterns.push(Array.from({ length: this.size }, (_, i) => [i, i]));
    patterns.push(Array.from({ length: this.size }, (_, i) => [i, this.size - 1 - i]));
    
    return patterns;
  }
  
  generateBoard() {
    this.numbers = [];
    for (let i = 1; i <= this.size * this.size; i++) {
      this.numbers.push(i);
    }
    
    const shuffled = [...this.numbers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    let index = 0;
    this.board = [];
    for (let i = 0; i < this.size; i++) {
      const row = [];
      for (let j = 0; j < this.size; j++) {
        row.push(new BingoCell(shuffled[index++]));
      }
      this.board.push(row);
    }
    
    for (let i = this.numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.numbers[i], this.numbers[j]] = [this.numbers[j], this.numbers[i]];
    }
  }
  
  checkWin() {
    return this.board.every(row => row.every(cell => cell.isMarked()));
  }
  
  checkNewLine() {
    let currentLines = 0;
    
    this.winPatterns.forEach((pattern) => {
      if (pattern.every(([row, col]) => this.board[row][col].isMarked())) {
        currentLines++;
      }
    });
    
    if (currentLines > this.completedLines) {
      this.completedLines = currentLines;
      return true;
    }
    return false;
  }
  
  markCell(number) {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const cell = this.board[i][j];
        if (cell.getNumber() === number) {
          return cell.mark();
        }
      }
    }
    return false;
  }
  
  getCell(row, col) {
    return this.board[row][col];
  }
}

// ==================== POLYMORPHISM ====================
class TimedBingoBoard extends BingoBoard {
  constructor(size, difficulty) {
    super(size);
    this.difficulty = difficulty;
    this.callInterval = this.#getCallInterval();
  }
  
  #getCallInterval() {
    switch (this.difficulty) {
      case 'easy':
        return 3000;
      case 'medium':
        return 2500;
      case 'hard':
        return 2000;
      default:
        return 3000;
    }
  }
  
  getCallInterval() {
    return this.callInterval;
  }
  
  getBonusTime() {
    switch (this.difficulty) {
      case 'easy':
        return 15;
      case 'medium':
        return 12;
      case 'hard':
        return 10;
      default:
        return 10;
    }
  }
}

// ==================== GAME MANAGER ====================
class GameManager {
  #board;
  #currentNumberIndex;
  #timeRemaining;
  #score;
  #linesCompleted;
  
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
    this.#board = new TimedBingoBoard(5, difficulty);
    this.#currentNumberIndex = -1;
    this.#timeRemaining = 60;
    this.#score = 0;
    this.#linesCompleted = 0;
  }
  
  getBoard() {
    return this.#board;
  }
  
  getCurrentNumber() {
    if (this.#currentNumberIndex >= 0 && this.#currentNumberIndex < this.#board.numbers.length) {
      return this.#board.numbers[this.#currentNumberIndex];
    }
    return null;
  }
  
  getTimeRemaining() {
    return this.#timeRemaining;
  }
  
  getScore() {
    return this.#score;
  }
  
  getLinesCompleted() {
    return this.#linesCompleted;
  }
  
  decrementTime() {
    this.#timeRemaining--;
    return this.#timeRemaining;
  }
  
  addBonusTime() {
    const bonus = this.#board.getBonusTime();
    this.#timeRemaining += bonus;
    return bonus;
  }
  
  callNextNumber() {
    this.#currentNumberIndex++;
    
    if (this.#currentNumberIndex >= this.#board.numbers.length) {
      this.#currentNumberIndex = 0;
    }
    
    return this.#board.numbers[this.#currentNumberIndex];
  }
  
  markNumber(number) {
    const marked = this.#board.markCell(number);
    if (marked) {
      this.#score += 10;
      
      if (this.#board.checkNewLine()) {
        this.#linesCompleted++;
        const bonus = this.addBonusTime();
        return { 
          success: true, 
          lineCompleted: true, 
          bonusTime: bonus
        };
      }
      
      return { success: true };
    }
    
    return { success: false };
  }
  
  checkGameStatus() {
    if (this.#timeRemaining <= 0) {
      return { status: 'lost' };
    }
    
    if (this.#board.checkWin()) {
      return { status: 'won' };
    }
    
    return { status: 'playing' };
  }
}

// ==================== STORAGE MANAGER ====================
class StorageManager {
  async saveScore(scoreData) {
    try {
      const timestamp = Date.now();
      await AsyncStorage.setItem(
        `bingo-score:${timestamp}`,
        JSON.stringify(scoreData)
      );
      return true;
    } catch (error) {
      console.error('Error saving score:', error);
      return false;
    }
  }
  
  async loadHighScores() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const bingoKeys = allKeys.filter(key => key.startsWith('bingo-score:'));
      
      if (bingoKeys.length === 0) return [];
      
      const scores = await AsyncStorage.multiGet(bingoKeys);
      const validScores = scores
        .map(([key, value]) => (value ? JSON.parse(value) : null))
        .filter(s => s !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      
      return validScores;
    } catch (error) {
      console.log('No previous scores found');
      return [];
    }
  }
}

// ==================== REACT NATIVE COMPONENT ====================
export default function SpeedBingo() {
  const [difficulty, setDifficulty] = useState('medium');
  const [gameManager, setGameManager] = useState(() => new GameManager('medium'));
  const [board, setBoard] = useState(gameManager.getBoard().board);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [score, setScore] = useState(0);
  const [linesCompleted, setLinesCompleted] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameStatus, setGameStatus] = useState('ready');
  const [highScores, setHighScores] = useState([]);
  const [showWinPopup, setShowWinPopup] = useState(false);
  
  const gameTimerRef = useRef(null);
  const callTimerRef = useRef(null);
  const storageManagerRef = useRef(new StorageManager());
  
  useEffect(() => {
    loadHighScores();
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, []);
  
  const loadHighScores = async () => {
    const scores = await storageManagerRef.current.loadHighScores();
    setHighScores(scores);
  };
  
  const saveScore = async (finalScore, finalLines, finalTime) => {
    const scoreData = {
      score: finalScore,
      lines: finalLines,
      timeRemaining: finalTime,
      difficulty: difficulty,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now()
    };
    
    await storageManagerRef.current.saveScore(scoreData);
    await loadHighScores();
  };
  
  const startGame = () => {
    setIsPlaying(true);
    setGameStatus('playing');
    
    const firstNum = gameManager.callNextNumber();
    setCurrentNumber(firstNum);
    
    gameTimerRef.current = setInterval(() => {
      const newTime = gameManager.decrementTime();
      setTimeRemaining(newTime);
      
      if (newTime <= 0) {
        endGame('timeout');
      }
    }, 1000);
    
    const interval = gameManager.getBoard().getCallInterval();
    callTimerRef.current = setInterval(() => {
      const nextNum = gameManager.callNextNumber();
      setCurrentNumber(nextNum);
      setBoard([...gameManager.getBoard().board]);
    }, interval);
  };
  
  const endGame = async (reason) => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    
    setIsPlaying(false);
    setGameStatus(reason);
    
    await saveScore(gameManager.getScore(), gameManager.getLinesCompleted(), timeRemaining);
    
    if (reason === 'won') {
      setShowWinPopup(true);
    }
  };
  
  const handleCellPress = (row, col) => {
    if (!isPlaying) return;
    
    const cell = gameManager.getBoard().getCell(row, col);
    const number = cell.getNumber();
    
    if (number !== currentNumber) return;
    
    const result = gameManager.markNumber(number);
    
    if (result.success) {
      setBoard([...gameManager.getBoard().board]);
      setScore(gameManager.getScore());
      
      if (result.lineCompleted) {
        setLinesCompleted(gameManager.getLinesCompleted());
        setTimeRemaining(gameManager.getTimeRemaining());
      }
      
      const status = gameManager.checkGameStatus();
      if (status.status === 'won') {
        endGame('won');
      }
    }
  };
  
  const handleNewGame = () => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    
    const newManager = new GameManager(difficulty);
    setGameManager(newManager);
    setBoard(newManager.getBoard().board);
    setCurrentNumber(null);
    setTimeRemaining(60);
    setScore(0);
    setLinesCompleted(0);
    setIsPlaying(false);
    setGameStatus('ready');
    setShowWinPopup(false);
    
    loadHighScores();
  };
  
  const handleDifficultyChange = (newDifficulty) => {
    if (isPlaying) return;
    
    setDifficulty(newDifficulty);
    const newManager = new GameManager(newDifficulty);
    setGameManager(newManager);
    setBoard(newManager.getBoard().board);
    setCurrentNumber(null);
    setTimeRemaining(60);
    setScore(0);
    setLinesCompleted(0);
    setGameStatus('ready');
  };
  
  return (
    <ImageBackground
      source={require('../assets/images/background(1).png')}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.topBarRight}>
              <Text style={styles.topBarLabel}>Difficulty:</Text>
              {['easy', 'medium', 'hard'].map(diff => (
                <TouchableOpacity
                  key={diff}
                  style={[
                    styles.diffButton,
                    difficulty === diff && styles.diffButtonActive
                  ]}
                  onPress={() => handleDifficultyChange(diff)}
                  disabled={isPlaying}
                >
                  <Text style={[
                    styles.diffButtonText,
                    difficulty === diff && styles.diffButtonTextActive
                  ]}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        
        <Image
        source={require('../assets/images/Bingo_logo.png')}
           style={styles.titleImage}
           />
          
          {/* Current Number Box */}
          <View style={styles.currentNumberBox}>
            <Text style={styles.currentNumberLabel}>CURRENT</Text>
            <Text style={styles.currentNumber}>
              {currentNumber !== null ? currentNumber : '--'}
            </Text>
          </View>
          
          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>⏱️</Text>
              <Text style={[
                styles.statValue,
                timeRemaining <= 10 && styles.statValueDanger
              ]}>
                {timeRemaining}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>🎯</Text>
              <Text style={styles.statValue}>{score}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>📊</Text>
              <Text style={styles.statValue}>{linesCompleted}</Text>
            </View>
          </View>
          
          {/* Board */}
          <View style={styles.boardContainer}>
            {board.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.boardRow}>
                {row.map((cell, colIndex) => (
                  <TouchableOpacity
                    key={colIndex}
                    style={[
                      styles.cell,
                      cell.isMarked() && styles.cellMarked
                    ]}
                    onPress={() => handleCellPress(rowIndex, colIndex)}
                    disabled={!isPlaying || cell.isMarked()}
                  >
                    <Text style={[
                      styles.cellText,
                      cell.isMarked() && styles.cellTextMarked
                    ]}>
                      {cell.getNumber()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
          
      
        {/* Action Button */}
{!isPlaying && (
  <View style={styles.centerActionButton}>
    <TouchableOpacity
      style={[
        styles.actionButton,
        gameStatus === 'ready' ? styles.startButton : styles.newGameButton
      ]}
      onPress={gameStatus === 'ready' ? startGame : handleNewGame}
    >
      <Image
        source={
          gameStatus === 'ready'
            ? require('../assets/images/startgame.png')
            : require('../assets/images/new_image.png')
        }
        style={styles.actionButtonIcon}
      />
    </TouchableOpacity>
  </View>
)}


        </View>
      </ScrollView>
      
      {/* Win Popup Modal */}
      <Modal
        visible={showWinPopup}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.popup}>
            <Text style={styles.bingoText}>BINGO!</Text>
            <Text style={styles.popupEmoji}>🎉</Text>
            <Text style={styles.popupTitle}>YOU WON!</Text>
            <View style={styles.popupStats}>
              <Text style={styles.popupStatText}>
                Score: <Text style={styles.popupStatBold}>{score}</Text>
              </Text>
              <Text style={styles.popupStatText}>
                Lines: <Text style={styles.popupStatBold}>{linesCompleted}</Text>
              </Text>
              <Text style={styles.popupStatText}>
                Time Left: <Text style={styles.popupStatBold}>{timeRemaining}s</Text>
              </Text>
            </View>
            <TouchableOpacity style={styles.popupButton} onPress={handleNewGame}>
              <Text style={styles.popupButtonText}>PLAY AGAIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

// ========================================
// STYLES - Simple and Easy to Understand
// ========================================
const styles = StyleSheet.create({
  // Background
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  
  // Main container
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  
  // ========== TOP BAR ==========
  topBar: {
    backgroundColor: 'rgba(64, 0, 128, 0.4)',
    borderColor:'#ffffff',
    borderWidth:1,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  

  
  topBarLabel: {
    color:'#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  topBarValue: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  // Difficulty buttons
  diffButton: {
  backgroundColor: 'rgba(294,100, 188, 0.64)',   // purple pixel panel
  borderWidth: 2,
  borderColor: '#ffffff',                     // neon pink border
  paddingVertical: 6,
  paddingHorizontal: 12,
  marginLeft:10,
  borderRadius: 6,
},

diffButtonActive: {
  backgroundColor: '#ff2dac',                 // neon pink active fill
  borderColor: '#ffffff',                     // white outline
  shadowColor: '#ffffff',

},

diffButtonText: {
  color: '#ffffff',                            // soft neon lavender text
  fontSize: 12,
  fontWeight: '800',
  letterSpacing: 1,
},

diffButtonTextActive: {
  color: '#0a0018',                             // dark purple text
  fontWeight: '900',
},

  // ========== TITLE ==========
  titleImage: {
  width: 140,
  height: 60,
  resizeMode: 'contain',
  marginBottom: 15,
},

  
  // ========== CURRENT NUMBER ==========
  currentNumberBox: {
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  
  currentNumberLabel: {
    color: '#ffffff',
    fontSize: 10,
    marginBottom: 4,
  },
  
  currentNumber: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 212, 255, 0.7)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  
  // ========== STATS ROW ==========
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  
  statBox: {
    backgroundColor: 'rgba(205, 250, 255, 0.15)',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    minWidth: 70,
  },
  
  statIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  
  statValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  statValueDanger: {
    color: '#ff4444',
  },
  
  // ========== BOARD ==========
  boardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 8,
    marginBottom: 10,
  },
  
  boardRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 5,
  },
  
  cell: {
    width: 55,
    height: 55,
    backgroundColor: '#1a1f3a',
    borderWidth: 2,
    borderColor: '#2a3f5f',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  cellMarked: {
    backgroundColor: '#2ecc71',
    borderColor: '#27ae60',
  },
  
  cellText: {
    color: '#8b9dc3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  cellTextMarked: {
    color: '#fff',
  },
  
  // ========== ACTION BUTTON ==========
  centerActionButton: {
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 20,
},

actionButton: {
  padding: 0,
  borderRadius: 10,
  borderColor:'#ffffff',
  borderWidth:2,
  alignItems: 'center',
  justifyContent: 'center',
 
},

actionButtonIcon: {
  width: 140,   // adjust size as needed
  height: 60,   // adjust for your image
  resizeMode: 'contain',
},

  
  // ========== WIN POPUP ==========
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  popup: {
    width: '85%',
    maxWidth: 350,
    backgroundColor: '#667eea',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  
  bingoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 10,
    letterSpacing: 8,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  
  popupEmoji: {
    fontSize: 64,
    marginBottom: 15,
  },
  
  popupTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  
  popupStats: {
    marginBottom: 25,
    alignItems: 'center',
  },
  
  popupStatText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  
  popupStatBold: {
    fontWeight: 'bold',
  },
  
  popupButton: {
    backgroundColor: '#ffd700',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  
  popupButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});