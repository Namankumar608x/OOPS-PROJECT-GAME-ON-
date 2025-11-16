// Board.js - Connect 4 Board Logic
export class Board {
  constructor() {
    this.rows = 6;
    this.cols = 7;
    this.board = this.createEmptyBoard();
  }

  /**
   * Create empty board
   */
  createEmptyBoard() {
    return Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
  }

  /**
   * Drop piece in column
   * @param {number} col - Column index (0-6)
   * @param {number} player - Player number (1 or 2)
   * @returns {number} Row where piece landed, or -1 if column full
   */
  dropPiece(col, player) {
    // Find lowest empty row in this column
    for (let row = this.rows - 1; row >= 0; row--) {
      if (this.board[row][col] === 0) {
        this.board[row][col] = player;
        return row;
      }
    }
    return -1; // Column is full
  }

  /**
   * Check if column is full
   */
  isColumnFull(col) {
    return this.board[0][col] !== 0;
  }

  /**
   * Check if board is full (draw)
   */
  isFull() {
    return this.board[0].every(cell => cell !== 0);
  }

  /**
   * Check for winner
   * @param {number} player - Player to check (1 or 2)
   * @returns {boolean}
   */
  checkWin(player) {
    // Check horizontal
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols - 3; col++) {
        if (
          this.board[row][col] === player &&
          this.board[row][col + 1] === player &&
          this.board[row][col + 2] === player &&
          this.board[row][col + 3] === player
        ) {
          return true;
        }
      }
    }

    // Check vertical
    for (let row = 0; row < this.rows - 3; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (
          this.board[row][col] === player &&
          this.board[row + 1][col] === player &&
          this.board[row + 2][col] === player &&
          this.board[row + 3][col] === player
        ) {
          return true;
        }
      }
    }

    // Check diagonal (down-right)
    for (let row = 0; row < this.rows - 3; row++) {
      for (let col = 0; col < this.cols - 3; col++) {
        if (
          this.board[row][col] === player &&
          this.board[row + 1][col + 1] === player &&
          this.board[row + 2][col + 2] === player &&
          this.board[row + 3][col + 3] === player
        ) {
          return true;
        }
      }
    }

    // Check diagonal (down-left)
    for (let row = 0; row < this.rows - 3; row++) {
      for (let col = 3; col < this.cols; col++) {
        if (
          this.board[row][col] === player &&
          this.board[row + 1][col - 1] === player &&
          this.board[row + 2][col - 2] === player &&
          this.board[row + 3][col - 3] === player
        ) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get winning positions
   */
  getWinningPositions(player) {
    const positions = [];

    // Check horizontal
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols - 3; col++) {
        if (
          this.board[row][col] === player &&
          this.board[row][col + 1] === player &&
          this.board[row][col + 2] === player &&
          this.board[row][col + 3] === player
        ) {
          return [
            { row, col },
            { row, col: col + 1 },
            { row, col: col + 2 },
            { row, col: col + 3 }
          ];
        }
      }
    }

    // Check vertical
    for (let row = 0; row < this.rows - 3; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (
          this.board[row][col] === player &&
          this.board[row + 1][col] === player &&
          this.board[row + 2][col] === player &&
          this.board[row + 3][col] === player
        ) {
          return [
            { row, col },
            { row: row + 1, col },
            { row: row + 2, col },
            { row: row + 3, col }
          ];
        }
      }
    }

    // Check diagonal (down-right)
    for (let row = 0; row < this.rows - 3; row++) {
      for (let col = 0; col < this.cols - 3; col++) {
        if (
          this.board[row][col] === player &&
          this.board[row + 1][col + 1] === player &&
          this.board[row + 2][col + 2] === player &&
          this.board[row + 3][col + 3] === player
        ) {
          return [
            { row, col },
            { row: row + 1, col: col + 1 },
            { row: row + 2, col: col + 2 },
            { row: row + 3, col: col + 3 }
          ];
        }
      }
    }

    // Check diagonal (down-left)
    for (let row = 0; row < this.rows - 3; row++) {
      for (let col = 3; col < this.cols; col++) {
        if (
          this.board[row][col] === player &&
          this.board[row + 1][col - 1] === player &&
          this.board[row + 2][col - 2] === player &&
          this.board[row + 3][col - 3] === player
        ) {
          return [
            { row, col },
            { row: row + 1, col: col - 1 },
            { row: row + 2, col: col - 2 },
            { row: row + 3, col: col - 3 }
          ];
        }
      }
    }

    return positions;
  }

  /**
   * Clone board for AI simulation
   */
  clone() {
    const newBoard = new Board();
    newBoard.board = this.board.map(row => [...row]);
    return newBoard;
  }

  /**
   * Reset board
   */
  reset() {
    this.board = this.createEmptyBoard();
  }

  /**
   * Get board state
   */
  getBoard() {
    return this.board;
  }
}