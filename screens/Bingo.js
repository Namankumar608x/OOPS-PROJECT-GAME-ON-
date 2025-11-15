import React, { useState, useEffect, useRef } from 'react';

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
      this.#currentNumberIndex = 0; // Loop back to start
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
  const [highScores, setHighScores] = useState([]);
  const [showWinPopup, setShowWinPopup] = useState(false);
  
  const gameTimerRef = useRef(null);
  const callTimerRef = useRef(null);
  
  useEffect(() => {
    loadHighScores();
    return () => {
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, []);
  
  const loadHighScores = async () => {
    try {
      const result = await window.storage.list('bingo-score:', false);
      if (result && result.keys) {
        const scores = await Promise.all(
          result.keys.map(async (key) => {
            const data = await window.storage.get(key, false);
            return data ? JSON.parse(data.value) : null;
          })
        );
        const validScores = scores.filter(s => s !== null)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
        setHighScores(validScores);
      }
    } catch (error) {
      console.log('No previous scores found');
    }
  };
  
  const saveScore = async (finalScore, finalLines, finalTime) => {
    try {
      const timestamp = Date.now();
      const scoreData = {
        score: finalScore,
        lines: finalLines,
        timeRemaining: finalTime,
        difficulty: difficulty,
        date: new Date().toLocaleDateString(),
        timestamp: timestamp
      };
      
      await window.storage.set(`bingo-score:${timestamp}`, JSON.stringify(scoreData), false);
      await loadHighScores();
    } catch (error) {
      console.error('Error saving score:', error);
    }
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
    
    if (number !== currentNumber) {
      return;
    }
    
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
    
    // Reload high scores after game ends
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
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Top Bar - High Score */}
        <div style={styles.topBar}>
          <div style={styles.topBarLeft}>
            <span style={styles.topBarIcon}>🏆</span>
            <span style={styles.topBarLabel}>High Score:</span>
            <span style={styles.topBarValue}>
              {highScores.length > 0 ? highScores[0].score : '0'}
            </span>
          </div>
          <div style={styles.topBarRight}>
            <span style={styles.topBarLabel}>Difficulty:</span>
            {['easy', 'medium', 'hard'].map(diff => (
              <button
                key={diff}
                style={{
                  ...styles.topBarDiffBtn,
                  ...(difficulty === diff ? styles.topBarDiffBtnActive : {}),
                }}
                onClick={() => handleDifficultyChange(diff)}
                disabled={isPlaying}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Main Game Area */}
        <div style={styles.mainArea}>
          <h1 style={styles.title}>SPEED BINGO</h1>
          
          <div style={styles.gameRow}>
            {/* Center - Board */}
            <div style={styles.centerColumn}>
              <div style={styles.currentNumberBox}>
                <div style={styles.currentNumberLabel}>CURRENT</div>
                <div style={styles.currentNumber}>
                  {currentNumber !== null ? currentNumber : '--'}
                </div>
              </div>
              
              <div style={styles.statsRow}>
                <div style={styles.statBox}>
                  <div style={styles.statIcon}>⏱️</div>
                  <div style={{...styles.statValue, ...(timeRemaining <= 10 ? {color: '#ff4444'} : {})}}>
                    {timeRemaining}
                  </div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statIcon}>🎯</div>
                  <div style={styles.statValue}>{score}</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statIcon}>📊</div>
                  <div style={styles.statValue}>{linesCompleted}</div>
                </div>
              </div>
              
              <div style={styles.boardContainer}>
                {board.map((row, rowIndex) => (
                  <div key={rowIndex} style={styles.boardRow}>
                    {row.map((cell, colIndex) => (
                      <button
                        key={colIndex}
                        style={{
                          ...styles.cell,
                          ...(cell.isMarked() ? styles.cellMarked : {}),
                        }}
                        onClick={() => handleCellPress(rowIndex, colIndex)}
                        disabled={!isPlaying || cell.isMarked()}
                      >
                        {cell.getNumber()}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
              
              {!isPlaying && (
                <button
                  style={{
                    ...styles.actionBtn,
                    ...(gameStatus === 'ready' ? styles.startBtn : styles.newGameBtn)
                  }}
                  onClick={gameStatus === 'ready' ? startGame : handleNewGame}
                >
                  {gameStatus === 'ready' ? 'START GAME' : 'NEW GAME'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Win Popup */}
      {showWinPopup && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <div style={styles.bingoText}>BINGO!</div>
            <div style={styles.popupEmoji}>🎉</div>
            <div style={styles.popupTitle}>YOU WON!</div>
            <div style={styles.popupStats}>
              <div>Score: <strong>{score}</strong></div>
              <div>Lines: <strong>{linesCompleted}</strong></div>
              <div>Time Left: <strong>{timeRemaining}s</strong></div>
            </div>
            <button style={styles.popupBtn} onClick={handleNewGame}>
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
      
      <style>{`
        .danger {
          color: #ff4444 !important;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px',
    fontFamily: 'Arial, sans-serif'
  },
  content: {
    maxWidth: '800px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  topBar: {
    background: 'rgba(192, 192, 192, 0.15)',
    borderRadius: '10px',
    padding: '8px 15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '40px'
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  topBarIcon: {
    fontSize: '20px',
  },
  topBarLabel: {
    color: '#9A7C2F',
    fontSize: '11px'
  },
  topBarValue: {
    color: '#9A7C2F',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  topBarDiffBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#888',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '10px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  topBarDiffBtnActive: {
    background: '#00d4ff',
    color: '#0a0e27',
    border: '1px solid #00d4ff'
  },
  mainArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  title: {
    color: '#00d4ff',
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0',
    textShadow: '0 0 15px rgba(0, 212, 255, 0.5)',
    letterSpacing: '3px'
  },
  gameRow: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  scoresColumn: {
    width: '110px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    padding: '10px',
    maxHeight: '400px',
    overflow: 'auto'
  },
  scoresSectionTitle: {
    color: '#00d4ff',
    fontSize: '10px',
    fontWeight: 'bold',
    marginBottom: '8px',
    textAlign: 'center'
  },
  noScores: {
    color: '#888',
    fontSize: '9px',
    textAlign: 'center',
    marginTop: '15px'
  },
  scoreItem: {
    background: 'rgba(0, 212, 255, 0.1)',
    borderRadius: '6px',
    padding: '6px',
    marginBottom: '5px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  scoreRank: {
    color: '#00d4ff',
    fontSize: '10px',
    fontWeight: 'bold'
  },
  scorePoints: {
    color: '#fff',
    fontSize: '11px',
    fontWeight: 'bold'
  },
  centerColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  rightColumn: {
    width: '110px'
  },
  currentNumberBox: {
    background: 'rgba(0, 212, 255, 0.1)',
    border: '2px solid #00d4ff',
    borderRadius: '10px',
    padding: '8px 20px',
    textAlign: 'center',
    boxShadow: '0 0 15px rgba(0, 212, 255, 0.3)'
  },
  currentNumberLabel: {
    color: '#888',
    fontSize: '9px',
    marginBottom: '2px'
  },
  currentNumber: {
    color: '#00d4ff',
    fontSize: '32px',
    fontWeight: 'bold',
    textShadow: '0 0 15px rgba(0, 212, 255, 0.7)'
  },
  statsRow: {
    display: 'flex',
    gap: '8px'
  },
  statBox: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '6px 12px',
    textAlign: 'center',
    minWidth: '60px'
  },
  statIcon: {
    fontSize: '16px',
    marginBottom: '2px'
  },
  statValue: {
    color: '#00d4ff',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  boardContainer: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  boardRow: {
    display: 'flex',
    gap: '5px'
  },
  cell: {
    width: '48px',
    height: '48px',
    background: '#1a1f3a',
    border: '2px solid #2a3f5f',
    borderRadius: '8px',
    color: '#8b9dc3',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cellMarked: {
    background: '#2ecc71',
    color: '#fff',
    borderColor: '#27ae60',
    boxShadow: '0 0 12px rgba(46, 204, 113, 0.5)',
    cursor: 'not-allowed'
  },
  actionBtn: {
    width: '100%',
    maxWidth: '260px',
    padding: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    marginTop: '5px'
  },
  startBtn: {
    background: '#2ecc71',
    color: '#fff'
  },
  newGameBtn: {
    background: '#ff4757',
    color: '#fff'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  popup: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    padding: '30px',
    textAlign: 'center',
    maxWidth: '350px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
  },
  bingoText: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#ffd700',
    textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
    marginBottom: '10px',
    letterSpacing: '8px'
  },
  popupEmoji: {
    fontSize: '64px',
    marginBottom: '15px'
  },
  popupTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '20px'
  },
  popupStats: {
    color: '#fff',
    fontSize: '16px',
    marginBottom: '25px',
    lineHeight: '1.8'
  },
  popupBtn: {
    background: '#ffd700',
    color: '#333',
    border: 'none',
    padding: '12px 30px',
    fontSize: '16px',
    fontWeight: 'bold',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
    transition: 'all 0.2s'
  }
};