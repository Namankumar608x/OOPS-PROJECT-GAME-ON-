// GameEngine.js - Connect 4 Game Logic with Minimax AI
import { Board } from './Board';

export class GameEngine {
  constructor() {
    this.board = new Board();
    this.currentPlayer = 1; 
    this.gameMode = 'menu';
    this.gameOver = false;
    this.winner = null;
    this.isDraw = false;
    this.winningPositions = [];
    this.isAnimating = false;
    this.aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
  }

  /**
   * Set game mode
   */
  setGameMode(mode) {
    this.gameMode = mode;
    this.reset();
  }

  /**
   * Make a move
   */
  makeMove(col, skipWinCheck = false) {
    if (this.gameOver || this.isAnimating || this.board.isColumnFull(col)) {
      return false;
    }

    const row = this.board.dropPiece(col, this.currentPlayer);
    
    if (row === -1) return false;

    // Check for win (unless skipped for animation)
    if (!skipWinCheck && this.board.checkWin(this.currentPlayer)) {
      this.gameOver = true;
      this.winner = this.currentPlayer;
      this.winningPositions = this.board.getWinningPositions(this.currentPlayer);
      return true;
    }

    // Check for draw
    if (!skipWinCheck && this.board.isFull()) {
      this.gameOver = true;
      this.isDraw = true;
      return true;
    }

    // Switch player
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;

    return true;
  }

  /**
   * Check and apply win/draw conditions
   */
  checkGameEnd() {
    // Switch back to check the player who just moved
    const lastPlayer = this.currentPlayer === 1 ? 2 : 1;
    
    if (this.board.checkWin(lastPlayer)) {
      this.gameOver = true;
      this.winner = lastPlayer;
      this.winningPositions = this.board.getWinningPositions(lastPlayer);
      return true;
    }

    if (this.board.isFull()) {
      this.gameOver = true;
      this.isDraw = true;
      return true;
    }

    return false;
  }

  /**
   * AI makes a move (Minimax algorithm)
   */
  makeAIMove() {
    if (this.gameOver || this.currentPlayer !== 2) return -1;

    const depth = this.aiDifficulty === 'easy' ? 2 : 
                  this.aiDifficulty === 'medium' ? 4 : 6;

    const bestMove = this.findBestMove(depth);
    
    if (bestMove !== -1) {
      // Make move without checking win immediately
      this.makeMove(bestMove, true);
      return bestMove;
    }
    
    return -1;
  }

  /**
   * Find best move using Minimax with Alpha-Beta Pruning
   */
  findBestMove(depth) {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let col = 0; col < this.board.cols; col++) {
      if (!this.board.isColumnFull(col)) {
        const boardCopy = this.board.clone();
        boardCopy.dropPiece(col, 2); // AI is player 2

        const score = this.minimax(boardCopy, depth - 1, false, -Infinity, Infinity);

        if (score > bestScore) {
          bestScore = score;
          bestMove = col;
        }
      }
    }

    return bestMove;
  }

  /**
   * Minimax algorithm with Alpha-Beta Pruning
   */
  minimax(board, depth, isMaximizing, alpha, beta) {
    // Terminal conditions
    if (board.checkWin(2)) return 1000 + depth; // AI wins (prefer faster wins)
    if (board.checkWin(1)) return -1000 - depth; // Human wins
    if (board.isFull() || depth === 0) return this.evaluateBoard(board);

    if (isMaximizing) {
      let maxScore = -Infinity;

      for (let col = 0; col < board.cols; col++) {
        if (!board.isColumnFull(col)) {
          const boardCopy = board.clone();
          boardCopy.dropPiece(col, 2);

          const score = this.minimax(boardCopy, depth - 1, false, alpha, beta);
          maxScore = Math.max(maxScore, score);
          alpha = Math.max(alpha, score);

          if (beta <= alpha) break; // Alpha-Beta pruning
        }
      }

      return maxScore;
    } else {
      let minScore = Infinity;

      for (let col = 0; col < board.cols; col++) {
        if (!board.isColumnFull(col)) {
          const boardCopy = board.clone();
          boardCopy.dropPiece(col, 1);

          const score = this.minimax(boardCopy, depth - 1, true, alpha, beta);
          minScore = Math.min(minScore, score);
          beta = Math.min(beta, score);

          if (beta <= alpha) break; // Alpha-Beta pruning
        }
      }

      return minScore;
    }
  }

  /**
   * Evaluate board position (Heuristic)
   */
  evaluateBoard(board) {
    let score = 0;

    // Center column control (highly valuable)
    const centerCol = 3;
    const centerArray = board.board.map(row => row[centerCol]);
    const centerCount = centerArray.filter(cell => cell === 2).length;
    score += centerCount * 3;

    // Evaluate all possible windows of 4
    score += this.scorePosition(board, 2);
    score -= this.scorePosition(board, 1);

    return score;
  }

  scorePosition(board, player) {
    let score = 0;

    // Score horizontal
    for (let row = 0; row < board.rows; row++) {
      for (let col = 0; col < board.cols - 3; col++) {
        const window = [
          board.board[row][col],
          board.board[row][col + 1],
          board.board[row][col + 2],
          board.board[row][col + 3]
        ];
        score += this.evaluateWindow(window, player);
      }
    }

    // Score vertical
    for (let col = 0; col < board.cols; col++) {
      for (let row = 0; row < board.rows - 3; row++) {
        const window = [
          board.board[row][col],
          board.board[row + 1][col],
          board.board[row + 2][col],
          board.board[row + 3][col]
        ];
        score += this.evaluateWindow(window, player);
      }
    }

    // Score diagonal (down-right)
    for (let row = 0; row < board.rows - 3; row++) {
      for (let col = 0; col < board.cols - 3; col++) {
        const window = [
          board.board[row][col],
          board.board[row + 1][col + 1],
          board.board[row + 2][col + 2],
          board.board[row + 3][col + 3]
        ];
        score += this.evaluateWindow(window, player);
      }
    }

    // Score diagonal (down-left)
    for (let row = 0; row < board.rows - 3; row++) {
      for (let col = 3; col < board.cols; col++) {
        const window = [
          board.board[row][col],
          board.board[row + 1][col - 1],
          board.board[row + 2][col - 2],
          board.board[row + 3][col - 3]
        ];
        score += this.evaluateWindow(window, player);
      }
    }

    return score;
  }

 
  evaluateWindow(window, player) {
    let score = 0;
    const opponent = player === 1 ? 2 : 1;

    const playerCount = window.filter(cell => cell === player).length;
    const emptyCount = window.filter(cell => cell === 0).length;
    const opponentCount = window.filter(cell => cell === opponent).length;

    if (playerCount === 4) score += 100;
    else if (playerCount === 3 && emptyCount === 1) score += 5;
    else if (playerCount === 2 && emptyCount === 2) score += 2;

    if (opponentCount === 3 && emptyCount === 1) score -= 4; // Block opponent

    return score;
  }

  reset() {
    this.board.reset();
    this.currentPlayer = 1;
    this.gameOver = false;
    this.winner = null;
    this.isDraw = false;
    this.winningPositions = [];
    this.isAnimating = false;
  }

  
  getGameState() {
    return {
      board: this.board.getBoard(),
      currentPlayer: this.currentPlayer,
      gameMode: this.gameMode,
      gameOver: this.gameOver,
      winner: this.winner,
      isDraw: this.isDraw,
      winningPositions: this.winningPositions,
      isAnimating: this.isAnimating
    };
  }
}