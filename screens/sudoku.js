import { useEffect, useState } from "react";
import { Alert, ImageBackground, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

class SudokuBoard {
  constructor() {
    this.size = 9;
    this.boxSize = 3;
    this.solution = this._emptyBoard();
  }

  _emptyBoard() {
    return Array(this.size)
      .fill(null)
      .map(() => Array(this.size).fill(0));
  }

  _canPlace(board, r, c, num) {
    for (let i = 0; i < this.size; i++) {
      if (board[r][i] === num) return false;
      if (board[i][c] === num) return false;
    }
    const br = Math.floor(r / this.boxSize) * this.boxSize;
    const bc = Math.floor(c / this.boxSize) * this.boxSize;
    for (let rr = 0; rr < this.boxSize; rr++) {
      for (let cc = 0; cc < this.boxSize; cc++) {
        if (board[br + rr][bc + cc] === num) return false;
      }
    }
    return true;
  }

  _solveBacktrack(board) {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (board[r][c] === 0) {
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          for (const n of nums) {
            if (this._canPlace(board, r, c, n)) {
              board[r][c] = n;
              if (this._solveBacktrack(board)) return true;
              board[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  generateSolvedBoard() {
    const board = this._emptyBoard();
    const firstRow = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    board[0] = firstRow.slice();
    const ok = this._solveBacktrack(board);
    if (!ok) return this.generateSolvedBoard();
    this.solution = board.map((r) => r.slice());
    return this.solution;
  }

  generatePuzzleFromSolution() {
    if (!this.solution || this.solution.flat().every((v) => v === 0)) {
      this.generateSolvedBoard();
    } 
    const sol = this.solution;
    const positionsByDigit = {};
    for (let d = 1; d <= 9; d++) positionsByDigit[d] = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        positionsByDigit[sol[r][c]].push([r, c]);
      }
    }

    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    const chosen = {
      thrice: [digits[0], digits[1]],
      twice: [digits[2], digits[3], digits[4]],
      singles: digits.slice(5, 8),
    };

    const requirements = {};
    requirements[chosen.thrice] = 3;
    for(const d of chosen.twice)requirements[d] = 2;
    for(const d of chosen.singles)requirements[d] = 1;

    const chosenPositions = [];
    for (const [digitStr, count] of Object.entries(requirements)) {
      const digit = parseInt(digitStr, 10);
      const available = positionsByDigit[digit].slice();
      for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
      }
      for (let k = 0; k < count; k++) {
        chosenPositions.push({ digit, pos: available[k] });
      }
    }

    if(chosenPositions.length !== 16){
      const allPositions = [];
      for(let r = 0; r < this.size; r++)
        for(let c = 0; c < this.size; c++) allPositions.push([r, c]);
      const sel = allPositions.sort(() => Math.random() - 0.5).slice(0, 16);
      const fallbackPositions = sel.map(([r, c]) => ({ digit: sol[r][c], pos: [r, c] }));
      for (let i = 0; i < fallbackPositions.length; i++) chosenPositions[i] = fallbackPositions[i];
    }

    const puzzle = this._emptyBoard();
    const givens = {};
    for (const entry of chosenPositions) {
      const [r, c] = entry.pos;
      puzzle[r][c] = entry.digit;
      givens[`${r}-${c}`] = true;
    }

    return { puzzleBoard: puzzle, givens, digitsChosen: chosen };
  }

  generateBoard() {
    this.generateSolvedBoard();
    const { puzzleBoard, givens, digitsChosen } = this.generatePuzzleFromSolution();
    return { puzzleBoard, givens, solution: this.solution.map((r) => r.slice()), digitsChosen };
  }

  isValidBoard(board) {
    const n = this.size;
    const seenRow = Array(n).fill(0).map(() => new Set());
    const seenCol = Array(n).fill(0).map(() => new Set());
    const seenBox = Array(n).fill(0).map(() => new Set());

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const v = board[r][c];
        if (v === 0) continue;
        if (seenRow[r].has(v)) return false;
        seenRow[r].add(v);
        if (seenCol[c].has(v)) return false;
        seenCol[c].add(v);
        const boxIndex = Math.floor(r / this.boxSize) * this.boxSize + Math.floor(c / this.boxSize);
        if (seenBox[boxIndex].has(v)) return false;
        seenBox[boxIndex].add(v);
      }
    }
    return true;
  }

  isSolved(board) {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (board[r][c] === 0) return false;
        if (board[r][c] !== this.solution[r][c]) return false;
      }
    }
    return true;
  }

  solveBoard(board) {
    const copy = board.map((r) => r.slice());
    const ok = this._solveBacktrack(copy);
    return ok ? copy : null;
  }
}

const sudokuBoard = new SudokuBoard();

const NumberPad = ({ onPick, onClear }) => {
  return (
    <View style={styles.numberPad}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <TouchableOpacity key={n} style={styles.numButton} onPress={() => onPick(n)}>
          <Text style={styles.numButtonText}>{n}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={[styles.numButton, styles.clearButton]} onPress={onClear}>
        <Text style={styles.numButtonText}>Clear</Text>
      </TouchableOpacity>
    </View>
  );
};

const SudokuApp = () => {
  const [puzzle, setPuzzle] = useState(() => sudokuBoard._emptyBoard());
  const [givens, setGivens] = useState({});
  const [solution, setSolution] = useState(() => sudokuBoard._emptyBoard());
  const [selected, setSelected] = useState(null);
  const [digitsChosen, setDigitsChosen] = useState(null);

  useEffect(() => {
    handleNewGame();
  }, []);

  function handleNewGame() {
    const { puzzleBoard, givens: g, solution: sol, digitsChosen } = sudokuBoard.generateBoard();
    setPuzzle(puzzleBoard.map((r) => r.slice()));
    setGivens({ ...g });
    setSolution(sol.map((r) => r.slice()));
    setDigitsChosen(digitsChosen);
    setSelected(null);
  }

  function handlePickNumber(num) {
    if (!selected) {
      Alert.alert("No cell selected", "Tap a non-red cell first.");
      return;
    }
    const [r, c] = selected;
    if (givens[`${r}-${c}`]) return;
    const newBoard = puzzle.map((row) => row.slice());
    newBoard[r][c] = num;
    if (!sudokuBoard.isValidBoard(newBoard)) {
      Alert.alert("Invalid move", "This placement violates Sudoku rules.");
      return;
    }
    setPuzzle(newBoard);
    setSelected(null);
    if (sudokuBoard.isSolved(newBoard)) {
      Alert.alert("Solved!", "Congratulations — you solved the puzzle.");
    }
  }

  function handleClear() {
    if (!selected) {
      Alert.alert("No cell selected", "Tap a non-red cell first.");
      return;
    }
    const [r, c] = selected;
    if (givens[`${r}-${c}`]) return;
    const newBoard = puzzle.map((row) => row.slice());
    newBoard[r][c] = 0;
    setPuzzle(newBoard);
    setSelected(null);
  }

  function handleCellPress(r, c) {
    if (givens[`${r}-${c}`]) return;
    setSelected((prev) => {
      if (prev && prev[0] === r && prev[1] === c) return null;
      return [r, c];
    });
  }

  function handleSolveBoard() {
    const solved = sudokuBoard.solveBoard(puzzle);
    if (!solved) {
      Alert.alert("Unsolvable", "Current board appears unsolvable.");
      return;
    }
    setPuzzle(solved);
    Alert.alert("Solved", "Board filled by solver.");
  }

  return (
    <ImageBackground
      source={require("../assets/images/background_main.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <Text style={styles.title}>Sudoku</Text>

      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.controlButton} onPress={handleNewGame}>
          <Text style={styles.controlText}>New Game</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={handleSolveBoard}>
          <Text style={styles.controlText}>Solve</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {puzzle.map((row, r) => (
          <View key={r} style={styles.gridRow}>
            {row.map((val, c) => {
              const key = `${r}-${c}`;
              const isGiven = !!givens[key];
              const isSelected = selected && selected[0] === r && selected[1] === c;

              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => handleCellPress(r, c)}
                  activeOpacity={isGiven ? 1 : 0.6}
                >
                  <View
                    style={[
                      styles.cell,
                      (c % 3 === 0) && styles.leftThickBorder,
                      (r % 3 === 0) && styles.topThickBorder,
                      (c === 8) && styles.rightThickBorder,
                      (r === 8) && styles.bottomThickBorder,
                      isGiven && styles.givenCell,
                      isSelected && styles.selectedCell,
                    ]}
                  >
                    <Text style={[styles.cellText, isGiven && styles.givenText]}>
                      {val === 0 ? "" : val}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
      <NumberPad onPick={handlePickNumber} onClear={handleClear} />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    padding: StatusBar.currentHeight,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 10, color: "#fff" },
  controlsRow: { flexDirection: "row", marginBottom: 12 },
  controlButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#9900ffff",
    marginHorizontal: 6,
    borderRadius: 6,
  },
  controlText: { color: "white", fontWeight: "600" },
  grid: {
    width: 9 * 38,
    height: 9 * 38,
    backgroundColor: "#ffffffdd",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 0,
    borderRadius: 4,
  },
  gridRow: { flexDirection: "row" },
  cell: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "#aaa",
    backgroundColor: "#fff",
  },
  cellText: { fontSize: 18 },
  givenCell: { backgroundColor: "#9900ffff" },
  givenText: { color: "#ffffffff", fontWeight: "700" },
  selectedCell: { backgroundColor: "#fdfbe3ff" },
  leftThickBorder: { borderLeftWidth: 2 },
  topThickBorder: { borderTopWidth: 2 },
  rightThickBorder: { borderRightWidth: 2 },
  bottomThickBorder: { borderBottomWidth: 2 },
  numberPad: {
    marginTop: 14,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  numButton: {
    width: 74,
    height: 42,
    margin: 4,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9900ffff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  numButtonText: { fontSize: 16, color: "#ffffffff", fontWeight: "600" },
  clearButton: { color: "#ffffffff", backgroundColor: "#9900ffff" },
});

export default SudokuApp;
