import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const { width, height } = Dimensions.get("window");
const BLOCK_SHAPES = {
  Dot: [[1]],
  Square2x2: [[1, 1], [1, 1]],
  Small_L_d_r: [[1, 0], [1, 0], [1, 1]],
  Small_L_d_l: [[0, 1], [0, 1], [1, 1]],
  Small_L_u_r: [[1, 1], [1, 0], [1, 0]],
  Small_L_u_l: [[1, 1], [0, 1], [0, 1]],
  Line_3_v: [[1], [1], [1]],
  Line_3_h: [[1, 1, 1]],
  Line_4_v: [[1], [1], [1], [1]],
  Line_4_h: [[1, 1, 1, 1]],
  Line_5_v: [[1], [1], [1], [1], [1]],
  Line_5_h: [[1, 1, 1, 1, 1]],
  Corner1: [[1, 1], [1, 0]],
  Corner2: [[1, 1], [0, 1]],
  Corner3: [[1, 0], [1, 1]],
  Corner4: [[0, 1], [1, 1]],
  Square3x3: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
  Large_L_d_r: [[1, 0, 0], [1, 0, 0], [1, 1, 1]],
  Large_L_u_r: [[1, 1, 1], [1, 0, 0], [1, 0, 0]],
  Large_L_d_l: [[0, 0, 1], [0, 0, 1], [1, 1, 1]],
  Large_L_u_l: [[1, 1, 1], [0, 0, 1], [0, 0, 1]],
  T_d: [[1, 1, 1], [0, 1, 0]],
  T_u: [[0, 1, 0], [1, 1, 1]],
  T_l: [[1, 0], [1, 1], [1, 0]],
  T_r: [[0, 1], [1, 1], [0, 1]],
};

class Block{
  constructor(shape,color){
    this.shape = shape;
    this.color=color;
  }
}

class BlockGenerator{
  constructor() {
    const colors = [
      "#ff5252", "#ff9800", "#ffeb3b","#9c27b0"
    ];

    this.allBlocks = Object.values(BLOCK_SHAPES).map(shape => {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      return new Block(shape, randomColor);
    });
  }

  getRandomBlock() {
    const randomIndex = Math.floor(Math.random() * this.allBlocks.length);
    return this.allBlocks[randomIndex];
  }

  getNewBlockSet() {
    const blocksCopy = [...this.allBlocks];
    for (var i = blocksCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [blocksCopy[i], blocksCopy[j]] = [blocksCopy[j], blocksCopy[i]];
    }
    return blocksCopy.slice(0, 3);
  }
}

class Grid {
  constructor(size = 8) {
    this.size = size;
    this.matrix = Array(size).fill(null).map(() => Array(size).fill(null));
  }

  clone() {
    const newGrid = new Grid(this.size);
    newGrid.matrix = JSON.parse(JSON.stringify(this.matrix));
    return newGrid;
  }

  canPlaceBlock(block, startRow, startCol) {
    for(let r = 0; r < block.shape.length; r++){
      for(let c = 0; c < block.shape[r].length; c++){
        if(block.shape[r][c] === 1){
          const boardRow = startRow + r;
          const boardCol = startCol + c;
          if(
            boardRow < 0 || boardCol < 0 ||
            boardRow >= this.size || boardCol >= this.size ||
            this.matrix[boardRow][boardCol] !== null
          )
            return false;
        }
      }
    }
    return true;
  }

  placeBlock(block, startRow, startCol){
    for(let r = 0; r < block.shape.length; r++){
      for(let c = 0; c < block.shape[r].length; c++){
        if(block.shape[r][c] === 1){
          this.matrix[startRow + r][startCol + c] = { filled: true, color: block.color };
        }
      }
    }
  }

  clearFullLines() {
    const rowsToClear = [];
    const colsToClear = [];

    for (let r = 0; r < this.size; r++) {
      if (this.matrix[r].every(cell => cell !== null)) {
        rowsToClear.push(r);
      }
    }

    for (let c = 0; c < this.size; c++) {
      if (this.matrix.every(row => row[c] !==null)) {
        colsToClear.push(c);
      }
    }

    for (const r of rowsToClear) {
      this.matrix[r] = Array(this.size).fill(null);
    }

    for (const c of colsToClear) {
      for (let r = 0; r < this.size; r++) {
        this.matrix[r][c] = null;
      }
    }

    return { clearedRows: rowsToClear.length, clearedCols: colsToClear.length };
  }
}

function canAnyBlockBePlaced(grid, blocks) {
  for (const block of blocks) {
    if (!block) continue;
    for (let r = 0; r < grid.size; r++) {
      for (let c = 0; c < grid.size; c++) {
        if (grid.canPlaceBlock(block, r, c)) {
          return true;
        }
      }
    }
  }
  return false;
}

const blockGenerator = new BlockGenerator();

const Cell = ({ value }) => {
  if(!value) return <View style={[styles.cell, styles.emptyCell]} />;
  return (
    <View
      style={[
        styles.cell,
        { backgroundColor: value.color }
      ]}
    />
  );
};


const BlockComponent = ({ block, onSelect, isSelected }) => {
  const wrapperStyle = isSelected ? [styles.blockWrapper, styles.selectedBlock] : styles.blockWrapper;
  return (
    <TouchableOpacity onPress={onSelect} style={wrapperStyle} disabled={!onSelect}>
      {block.shape.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cellValue, colIndex) => (
            <View
              key={colIndex}
              style={[
                styles.blockCell,
                cellValue === 1
                ? { backgroundColor: block.color, borderColor: '#000', borderWidth: 1 }
                : styles.emptyBlockCell
              ]}
            />
          ))}
        </View>
      ))}
    </TouchableOpacity>
  );
};

const Blockoduko = () => {
  const [grid, setGrid] = useState(() => new Grid());
  const [availableBlocks, setAvailableBlocks] = useState(() => blockGenerator.getNewBlockSet());
  const [score, setScore] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    (async () => {
      const savedScore = await AsyncStorage.getItem('highScore');
      if (savedScore) setHighScore(parseInt(savedScore, 10));
    })();
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      AsyncStorage.setItem('highScore', score.toString());
    }
  }, [score, highScore]);

  useEffect(() => {
    if (availableBlocks.length > 0 && !isGameOver) {
      if (!canAnyBlockBePlaced(grid, availableBlocks)) {
        setIsGameOver(true);
      }
    }
  }, [grid, availableBlocks, isGameOver]);

  const handleRestart = () => {
    setGrid(new Grid());
    setScore(0);
    setAvailableBlocks(blockGenerator.getNewBlockSet());
    setSelectedBlock(null);
    setIsGameOver(false);
    setMultiplier(1);
  };

  const handleCellPress = (rowIndex, colIndex) => {
    if (isGameOver || !selectedBlock) {
      if (!selectedBlock && !isGameOver) {
        Alert.alert("No Block Selected", "Please select a block from the bottom first.");
      }
      return;
    }

    const blockHeight = selectedBlock.shape.length;
    const blockWidth = selectedBlock.shape[0].length;

    let startRow = rowIndex - Math.floor(blockHeight / 2);
    let startCol = colIndex - Math.floor(blockWidth / 2);

    startRow = Math.max(0, Math.min(grid.size - blockHeight, startRow));
    startCol = Math.max(0, Math.min(grid.size - blockWidth, startCol));

    if (grid.canPlaceBlock(selectedBlock, startRow, startCol)) {
      const newGrid = grid.clone();
      newGrid.placeBlock(selectedBlock, startRow, startCol);

      const blockCells = selectedBlock.shape.flat().reduce((sum, cell) => sum + cell, 0);
      let scoreToAdd = blockCells;

      const { clearedRows, clearedCols } = newGrid.clearFullLines();

      if (clearedRows > 0 || clearedCols > 0) {
        const lineClearBonus = (clearedRows + clearedCols + multiplier) * 9;
        scoreToAdd += lineClearBonus;

        const newMultiplier = multiplier + clearedRows + clearedCols;
        setMultiplier(newMultiplier);
      } else setMultiplier(1);

      setScore(prev => prev + scoreToAdd);

      setGrid(newGrid);

      const remainingBlocks = availableBlocks.filter(b => b !== selectedBlock);
      setSelectedBlock(null);

      if (remainingBlocks.length === 0) {
        setAvailableBlocks(blockGenerator.getNewBlockSet());
      } else {
        setAvailableBlocks(remainingBlocks);
      }
    } else {
      Alert.alert("Invalid Move", "Cannot place the block here.");
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/background_main.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.container}>

        <Text style={styles.title}>Blockodoku</Text>

        <View style={styles.scoreContainer}>
          <Text style={styles.score}>Score: {score}</Text>
          <Text style={styles.highScore}>High Score: {highScore}</Text>
          <Text style={styles.multiplier}>Multiplier: {multiplier}x</Text>
        </View>

        <View>
          {grid.matrix.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cellValue, colIndex) => (
                <TouchableOpacity
                  key={colIndex}
                  onPress={() => handleCellPress(rowIndex, colIndex)}
                  disabled={isGameOver}
                >
                  <Cell value={cellValue} />
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.instructions}>Select a block, then tap the grid to place it.</Text>

        <View style={styles.blockContainer}>
          {availableBlocks.map((block, index) => (
            <BlockComponent
              key={index}
              block={block}
              isSelected={block === selectedBlock}
              onSelect={!isGameOver ? () => setSelectedBlock(block) : null}
            />
          ))}
        </View>

        {isGameOver && (
          <View style={styles.gameOverOverlay}>
            <Text style={styles.gameOverText}>Game Over</Text>
            <Text style={styles.finalScoreText}>Final Score: {score}</Text>

            <TouchableOpacity onPress={handleRestart} style={styles.restartButton}>
              <Text style={styles.restartButtonText}>Play Again</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  container:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.3)",  
  },

  title: {
  fontSize: 36,
  fontWeight: 'bold',
  color: "#fff",
  textShadowColor: '#9900ff',
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 12,
  marginBottom: 10,
},
scoreContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between', 
  alignItems: 'center',
  width: '100%',                   
  paddingHorizontal: 20,           
  marginBottom: 20,
},
multiplier: {
  fontSize: 16,
  color: '#ff33cc',
  fontWeight: 'bold',
  textShadowColor: '#ff00ff',
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 10,
  transform: [{ scale: 1.2 }],
  minWidth: 80,          
  textAlign: 'center',
},

score: {
  fontSize: 16,
  color: '#ff33cc',
  fontWeight: 'bold',
  textShadowColor: '#ff00ff',
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 10,
  transform: [{ scale: 1.2 }],
  minWidth: 80,
  textAlign: 'center',
},

highScore: {
  fontSize: 16,
  color: '#ff33cc',
  fontWeight: 'bold',
  textShadowColor: '#ff00ff',
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 10,
  transform: [{ scale: 1.2 }],
  minWidth: 80,
  textAlign: 'center',
},


  instructions: { marginTop: 20, fontSize: 16, color: '#eee' },

  row: { flexDirection: 'row' },

  cell: {
  width: Math.min(width / 10, 36),
  height: Math.min(width / 10, 36),
  borderWidth: 1, borderColor: '#ccc' },
  emptyCell: { backgroundColor: 'rgba(255,255,255,0.2)',
   },
  blockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    width: '100%',
    paddingVertical: 20,
    marginTop: 10,
    height: 120,
  },

  blockWrapper: { padding: 2 },
  selectedBlock: {
    borderWidth: 2,
    borderColor: '#00bcd4',
    transform: [{ scale: 1.1 }],
    borderRadius: 5,
    backgroundColor: 'rgba(0, 188, 212, 0.2)'
  },

  blockCell: { width: 18, height: 18 },
  emptyBlockCell: { backgroundColor: 'transparent' },
  filledBlockCell: {
    backgroundColor: '#9900ffff',
    borderWidth: 1,
    borderColor: '#6800aeff',
  },

  gameOverOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  gameOverText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },

  finalScoreText: {
    fontSize: 24,
    color: 'white',
    marginTop: 10,
    marginBottom: 30,
  },

  restartButton: {
    backgroundColor: '#9900ffff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 5,
  },

  restartButtonText: {
    color: '#333',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Blockoduko;
