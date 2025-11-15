import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

// ==================== ENCAPSULATION ====================
// Private data with public methods using # (private fields)
class BingoCell {
  #number;
  #isMarked;
  #isMissed;
  
  constructor(number) {
    this.#number = number;
    this.#isMarked = false;
    this.#isMissed = false;
  }
  
  // Getter methods (Encapsulation - controlled access)
  getNumber() {
    return this.#number;
  }
  
  isMarked() {
    return this.#isMarked;
  }
  
  isMissed() {
    return this.#isMissed;
  }
  
  // Setter methods
  mark() {
    if (!this.#isMissed) {
      this.#isMarked = true;
      return true;
    }
    return false;
  }
  
  miss() {
    if (!this.#isMarked) {
      this.#isMissed = true;
    }
  }
  
  reset() {
    this.#isMarked = false;
    this.#isMissed = false;
  }
}

// ==================== ABSTRACTION ====================
// Abstract base class for game boards
class GameBoard {
  constructor(size) {
    // Prevent instantiation of abstract class
    if (this.constructor === GameBoard) {
      throw new Error("Cannot instantiate abstract class GameBoard");
    }
    this.size = size;
    this.board = [];
    this.numbers = [];
  }
  
  // Abstract method - must be implemented by subclasses
  generateBoard() {
    throw new Error("Method 'generateBoard()' must be implemented in subclass");
  }
  
  // Abstract method - must be implemented by subclasses
  checkWin() {
    throw new Error("Method 'checkWin()' must be implemented in subclass");
  }
  
  // Concrete method available to all subclasses
  resetBoard() {
    this.board.forEach(row => {
      row.forEach(cell => cell.reset());
    });
  }
  
  getAllNumbers() {
    return [...this.numbers];
  }
}

// ==================== INHERITANCE ====================
// BingoBoard extends GameBoard (using 'extends' and 'super')
class BingoBoard extends GameBoard {
  constructor(size = 5) {
    super(size); // Using 'super' keyword to call parent constructor
    this.winPatterns = this.#initializeWinPatterns();
    this.completedLines = 0;
    this.generateBoard();
  }
  
  // Private method (Encapsulation)
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
  
  // Implementation of abstract method from parent
  generateBoard() {
    // Generate unique numbers from 1 to 25
    this.numbers = [];
    for (let i = 1; i <= this.size * this.size; i++) {
      this.numbers.push(i);
    }
    
    // Shuffle numbers for board placement
    const shuffled = [...this.numbers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Create board
    let index = 0;
    this.board = [];
    for (let i = 0; i < this.size; i++) {
      const row = [];
      for (let j = 0; j < this.size; j++) {
        row.push(new BingoCell(shuffled[index++]));
      }
      this.board.push(row);
    }
    
    // Shuffle numbers array for calling sequence
    for (let i = this.numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.numbers[i], this.numbers[j]] = [this.numbers[j], this.numbers[i]];
    }
  }
  
  // Implementation of abstract method
  checkWin() {
    // Check if all cells are marked
    return this.board.every(row => row.every(cell => cell.isMarked()));
  }
  
  checkNewLine() {
    let currentLines = 0;
    this.winPatterns.forEach(pattern => {
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
  
  missCell(number) {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const cell = this.board[i][j];
        if (cell.getNumber() === number) {
          cell.miss();
          return;
        }
      }
    }
  }
  
  getCell(row, col) {
    return this.board[row][col];
  }
  
  hasLost() {
    return this.board.some(row => row.some(cell => cell.isMissed()));
  }
}

// ==================== POLYMORPHISM ====================
// TimedBingoBoard with difficulty-based timing
class TimedBingoBoard extends BingoBoard {
  constructor(size, difficulty) {
    super(size); // Call parent constructor using 'super'
    this.difficulty = difficulty; // Using 'this' keyword for instance property
    this.callInterval = this.#getCallInterval();
  }
  
  // Private method to determine call interval based on difficulty
  #getCallInterval() {
    switch (this.difficulty) {
      case 'easy':
        return 3000; // 2 seconds
      case 'medium':
        return 2000; // 1.5 seconds
      case 'hard':
        return 1000; // 1 second
      default:
        return 3000;
    }
  }
  
  // Polymorphism: Override to add difficulty-specific behavior
  getCallInterval() {
    return this.callInterval;
  }
  
  getBonusTime() {
    // Different bonus time based on difficulty
    switch (this.difficulty) {
      case 'easy':
        return 15; // 15 seconds bonus
      case 'medium':
        return 12; // 12 seconds bonus
      case 'hard':
        return 10; // 10 seconds bonus
      default:
        return 10;
    }
  }
}

// ==================== ENCAPSULATION (Game Manager) ====================
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
    this.#timeRemaining = 60; // Start with 60 seconds
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
      return null; // All numbers called
    }
    
    return this.#board.numbers[this.#currentNumberIndex];
  }
  
  #findCell(number) {
    for (let i = 0; i < this.#board.size; i++) {
      for (let j = 0; j < this.#board.size; j++) {
        if (this.#board.getCell(i, j).getNumber() === number) {
          return this.#board.getCell(i, j);
        }
      }
    }
    return null;
  }
  
  markNumber(number) {
    const marked = this.#board.markCell(number);
    if (marked) {
      this.#score += 10;
      
      // Check for new line completion
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
    
    return { success: false, message: 'Already marked!' };
  }
  
  checkGameStatus() {
    if (this.#timeRemaining <= 0) {
      return { status: 'lost', reason: 'timeout' };
    }
    
    if (this.#board.checkWin()) {
      return { status: 'won' };
    }
    
    return { status: 'playing' };
  }
}

// ==================== REACT COMPONENT ====================
export default function App() {
  const [difficulty, setDifficulty] = useState('medium');
  const [gameManager, setGameManager] = useState(() => new GameManager('medium'));
  const [board, setBoard] = useState(gameManager.getBoard().board);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [score, setScore] = useState(0);
  const [linesCompleted, setLinesCompleted] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameStatus, setGameStatus] = useState('ready');
  
  const gameTimerRef = useRef(null);
  const callTimerRef = useRef(null);
  
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, []);
  
  const startGame = () => {
    setIsPlaying(true);
    setGameStatus('playing');
    
    // Call first number immediately
    const firstNum = gameManager.callNextNumber();
    setCurrentNumber(firstNum);
    
    // Set up game timer (1 second countdown)
    gameTimerRef.current = setInterval(() => {
      const newTime = gameManager.decrementTime();
      setTimeRemaining(newTime);
      
      if (newTime <= 0) {
        endGame('timeout');
      }
    }, 1000);
    
    // Set up number calling timer
    const interval = gameManager.getBoard().getCallInterval();
    callTimerRef.current = setInterval(() => {
      const nextNum = gameManager.callNextNumber();
      
      if (nextNum === null) {
        // All numbers called, check if won
        const status = gameManager.checkGameStatus();
        if (status.status === 'won') {
          endGame('won');
        }
      } else {
        setCurrentNumber(nextNum);
        setBoard([...gameManager.getBoard().board]);
      }
    }, interval);
  };
  
  const endGame = (reason) => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    
    setIsPlaying(false);
    setGameStatus(reason);
    
    let title, message;
    if (reason === 'won') {
      title = '🎉 BINGO! YOU WON! 🎉';
      message = `Congratulations!\n\nScore: ${gameManager.getScore()}\nLines Completed: ${gameManager.getLinesCompleted()}\nTime Remaining: ${timeRemaining}s`;
    } else {
      title = '⏰ TIME\'S UP!';
      message = `Time ran out!\n\nScore: ${gameManager.getScore()}\nLines Completed: ${gameManager.getLinesCompleted()}`;
    }
    
    Alert.alert(title, message, [
      { text: 'New Game', onPress: handleNewGame }
    ]);
  };
  
  const handleCellPress = (row, col) => {
    if (!isPlaying) return;
    
    const cell = gameManager.getBoard().getCell(row, col);
    const number = cell.getNumber();
    
    // Check if this number matches the currently displayed number
    if (number !== currentNumber) {
      return; // Can't mark numbers that aren't currently displayed
    }
    
    const result = gameManager.markNumber(number);
    
    if (result.success) {
      setBoard([...gameManager.getBoard().board]);
      setScore(gameManager.getScore());
      
      if (result.lineCompleted) {
        setLinesCompleted(gameManager.getLinesCompleted());
        setTimeRemaining(gameManager.getTimeRemaining());
        Alert.alert(
          '🎊 LINE COMPLETED!',
          `+${result.bonusTime} seconds bonus!`,
          [{ text: 'Continue', style: 'default' }],
          { cancelable: true }
        );
      }
      
      // Check win condition
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
  };
  
  const handleDifficultyChange = (newDifficulty) => {
    if (isPlaying) {
      Alert.alert('Game in Progress', 'Please finish or restart the current game first.');
      return;
    }
    
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SPEED BINGO</Text>
        <Text style={styles.subtitle}>Mark numbers before time runs out!</Text>
      </View>
      
      <View style={styles.currentNumberContainer}>
        <Text style={styles.currentNumberLabel}>Current Number:</Text>
        <Text style={styles.currentNumber}>
          {currentNumber !== null ? currentNumber : '--'}
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Time</Text>
          <Text style={[styles.statValue, timeRemaining <= 10 && styles.statDanger]}>
            {timeRemaining}s
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Lines</Text>
          <Text style={styles.statValue}>{linesCompleted}</Text>
        </View>
      </View>
      
      <View style={styles.difficultyContainer}>
        <Text style={styles.difficultyLabel}>Difficulty:</Text>
        {['easy', 'medium', 'hard'].map(diff => (
          <TouchableOpacity
            key={diff}
            style={[
              styles.difficultyButton,
              difficulty === diff && styles.difficultyButtonActive
            ]}
            onPress={() => handleDifficultyChange(diff)}
            disabled={isPlaying}
          >
            <Text style={[
              styles.difficultyText,
              difficulty === diff && styles.difficultyTextActive
            ]}>
              {diff.toUpperCase()}
            </Text>
            <Text style={[
              styles.difficultyTime,
              difficulty === diff && styles.difficultyTextActive
            ]}>
              {diff === 'easy' ? '2s' : diff === 'medium' ? '1.5s' : '1s'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.boardContainer}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                style={[
                  styles.cell,
                  cell.isMarked() && styles.cellMarked,
                  cell.isMissed() && styles.cellMissed
                ]}
                onPress={() => handleCellPress(rowIndex, colIndex)}
                disabled={!isPlaying || cell.isMarked()}
              >
                <Text style={[
                  styles.cellText,
                  cell.isMarked() && styles.cellTextMarked,
                  cell.isMissed() && styles.cellTextMissed
                ]}>
                  {cell.getNumber()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
      
      {!isPlaying && gameStatus === 'ready' && (
        <TouchableOpacity style={styles.startButton} onPress={startGame}>
          <Text style={styles.startButtonText}>START GAME</Text>
        </TouchableOpacity>
      )}
      
      {!isPlaying && gameStatus !== 'ready' && (
        <TouchableOpacity style={styles.resetButton} onPress={handleNewGame}>
          <Text style={styles.resetButtonText}>NEW GAME</Text>
        </TouchableOpacity>
      )}
      
     
   
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#00d4ff',
    letterSpacing: 3,
    textShadowColor: '#00d4ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#8b9dc3',
    marginTop: 5,
  },
  currentNumberContainer: {
    backgroundColor: '#1a1f3a',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#00d4ff',
  },
  currentNumberLabel: {
    color: '#8b9dc3',
    fontSize: 16,
    marginBottom: 10,
  },
  currentNumber: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#00d4ff',
    textShadowColor: '#00d4ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: '#1a1f3a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 90,
    borderWidth: 1,
    borderColor: '#2a3f5f',
  },
  statLabel: {
    color: '#8b9dc3',
    fontSize: 12,
    marginBottom: 5,
  },
  statValue: {
    color: '#00d4ff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statDanger: {
    color: '#ff4757',
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  difficultyLabel: {
    color: '#8b9dc3',
    marginRight: 10,
    fontSize: 16,
  },
  difficultyButton: {
    backgroundColor: '#1a1f3a',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#2a3f5f',
    alignItems: 'center',
  },
  difficultyButtonActive: {
    backgroundColor: '#00d4ff',
    borderColor: '#00d4ff',
  },
  difficultyText: {
    color: '#8b9dc3',
    fontSize: 12,
    fontWeight: '700',
  },
  difficultyTime: {
    color: '#666',
    fontSize: 10,
    marginTop: 2,
  },
  difficultyTextActive: {
    color: '#0a0e27',
  },
  boardContainer: {
    alignSelf: 'center',
    backgroundColor: '#1a1f3a',
    padding: 10,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#2a3f5f',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 60,
    height: 60,
    backgroundColor: '#0f1729',
    margin: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2a3f5f',
  },
  cellActive: {
    borderColor: '#00d4ff',
    backgroundColor: '#1a2f4a',
    borderWidth: 3,
  },
  cellMarked: {
    backgroundColor: '#2ecc71',
    borderColor: '#27ae60',
  },
  cellMissed: {
    backgroundColor: '#ff4757',
    borderColor: '#e84118',
  },
  cellText: {
    color: '#8b9dc3',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cellTextMarked: {
    color: '#fff',
  },
  cellTextMissed: {
    color: '#fff',
    textDecorationLine: 'line-through',
  },
  startButton: {
    backgroundColor: '#2ecc71',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  resetButton: {
    backgroundColor: '#ff4757',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  rulesContainer: {
    backgroundColor: '#1a1f3a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a3f5f',
  },
  rulesTitle: {
    color: '#00d4ff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rulesText: {
    color: '#8b9dc3',
    fontSize: 12,
    marginVertical: 3,
    lineHeight: 18,
  },
  conceptsContainer: {
    backgroundColor: '#1a1f3a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#2a3f5f',
  },
  conceptsTitle: {
    color: '#00d4ff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  conceptText: {
    color: '#8b9dc3',
    fontSize: 11,
    marginVertical: 3,
    lineHeight: 16,
  },
});