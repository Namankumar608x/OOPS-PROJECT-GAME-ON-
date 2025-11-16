import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/*==============================
    TETRIS SHAPES
==============================*/
const TETROMINOS = {
  I: {
    shape: [
      [1,1,1,1]
    ],
    color: '#00bcd4'
  },
  O: {
    shape: [
      [1,1],
      [1,1]
    ],
    color: '#ffc107'
  },
  T: {
    shape: [
      [1,1,1],
      [0,1,0]
    ],
    color: '#9c27b0'
  },
  S: {
    shape: [
      [0,1,1],
      [1,1,0]
    ],
    color: '#8bc34a'
  },
  Z: {
    shape: [
      [1,1,0],
      [0,1,1]
    ],
    color: '#f44336'
  },
  J: {
    shape: [
      [1,0,0],
      [1,1,1]
    ],
    color: '#2196f3'
  },
  L: {
    shape: [
      [0,0,1],
      [1,1,1]
    ],
    color: '#ff9800'
  },
};

const TETROMINO_KEYS = Object.keys(TETROMINOS);

/*==============================
    CLASS: Tetromino
==============================*/
class Tetromino {
  constructor(type){
    this.type = type;
    this.shape = TETROMINOS[type].shape.map(r => [...r]);
    this.color = TETROMINOS[type].color;
    this.row = 0;
    this.col = 3; 
  }

  rotate(){
    const newShape = [];
    const rows = this.shape.length;
    const cols = this.shape[0].length;
    for(let c=0;c<cols;c++){
      const newRow = [];
      for(let r=rows-1;r>=0;r--){
        newRow.push(this.shape[r][c]);
      }
      newShape.push(newRow);
    }
    this.shape = newShape;
  }

  clone(){
    const t = new Tetromino(this.type);
    t.shape = this.shape.map(r => [...r]);
    t.color = this.color;
    t.row = this.row;
    t.col = this.col;
    return t;
  }
}

/*==============================
      CLASS: TetrisGrid
==============================*/
class TetrisGrid {
  constructor(rows = 20, cols = 10){
    this.rows = rows;
    this.cols = cols;
    this.matrix = Array(rows).fill(null).map(()=>Array(cols).fill(null));
  }

  clone(){
    const g = new TetrisGrid(this.rows, this.cols);
    g.matrix = this.matrix.map(r => [...r]);
    return g;
  }

  isValidPosition(tetromino){
    const { shape, row, col } = tetromino;
    for(let r=0; r<shape.length; r++){
      for(let c=0; c<shape[r].length; c++){
        if(shape[r][c]===1){
          const nr = row+r;
          const nc = col+c;

          if(nr<0 || nr>=this.rows || nc<0 || nc>=this.cols) return false;
          if(this.matrix[nr][nc] !== null) return false;
        }
      }
    }
    return true;
  }

  placeTetromino(tetromino){
    const { shape, row, col, color } = tetromino;
    for(let r=0; r<shape.length; r++){
      for(let c=0; c<shape[r].length; c++){
        if(shape[r][c]===1){
          this.matrix[row+r][col+c] = color;
        }
      }
    }
  }

  clearLines(){
    let cleared = 0;
    for(let r=this.rows-1; r>=0; r--){
      if(this.matrix[r].every(v => v !== null)){
        this.matrix.splice(r,1);
        this.matrix.unshift(Array(this.cols).fill(null));
        cleared++;
        r++;
      }
    }
    return cleared;
  }
}

/*==============================
   HELPER: generate new Tetro
==============================*/
function getRandomTetromino(){
  const r = Math.floor(Math.random()*TETROMINO_KEYS.length);
  return new Tetromino(TETROMINO_KEYS[r]);
}

/*==============================
      REACT COMPONENT
==============================*/
const Tetris = () => {
  const [grid,setGrid] = useState(() => new TetrisGrid());
  const [current,setCurrent] = useState(() => getRandomTetromino());
  const [next,setNext] = useState(() => getRandomTetromino());
  const [score,setScore] = useState(0);
  const [level,setLevel] = useState(1);
  const [highScore,setHighScore] = useState(0);
  const [gameOver,setGameOver] = useState(false);

  const intervalRef = useRef(null);

  /* Load highscore */
  useEffect(()=>{
    (async()=>{
      const s = await AsyncStorage.getItem('tetrisHighScore');
      if(s) setHighScore(parseInt(s,10));
    })();
  },[]);

  /* Save highscore */
  useEffect(()=>{
    if(score > highScore){
      setHighScore(score);
      AsyncStorage.setItem('tetrisHighScore',score.toString());
    }
  },[score,highScore]);

  /* Start gravity */
  useEffect(()=>{
    startInterval();
    return stopInterval;
  },[current,level,gameOver]);

  const startInterval = () => {
    stopInterval();
    if(!gameOver){
      const speed = Math.max(100, 600 - level*50);
      intervalRef.current = setInterval(()=>moveDown(), speed);
    }
  };

  const stopInterval = () => {
    if(intervalRef.current){
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const spawnNew = () => {
    const newPiece = next;
    newPiece.row = 0;
    newPiece.col = 3;

    if(!grid.isValidPosition(newPiece)){
      setGameOver(true);
      stopInterval();
      return;
    }

    setCurrent(newPiece);
    setNext(getRandomTetromino());
  };

  const moveDown = () => {
    if(gameOver) return;
    const clone = current.clone();
    clone.row++;

    if(grid.isValidPosition(clone)){
      setCurrent(clone);
    } else {
      const newGrid = grid.clone();
      newGrid.placeTetromino(current);
      const cleared = newGrid.clearLines();
      if(cleared>0){
        setScore(s=>s + cleared*100);
        setLevel(l=>l + Math.floor(cleared/2));
      }
      setGrid(newGrid);
      spawnNew();
    }
  };

  const moveLeft = () => {
    if(gameOver) return;
    const clone = current.clone();
    clone.col--;
    if(grid.isValidPosition(clone)) setCurrent(clone);
  };

  const moveRight = () => {
    if(gameOver) return;
    const clone = current.clone();
    clone.col++;
    if(grid.isValidPosition(clone)) setCurrent(clone);
  };

  const rotate = () => {
    if(gameOver) return;
    const clone = current.clone();
    clone.rotate();
    if(grid.isValidPosition(clone)) setCurrent(clone);
  };

  const drop = () => {
    if(gameOver) return;
    let clone = current.clone();
    while(grid.isValidPosition(clone)){
      clone.row++;
    }
    clone.row--;
    setCurrent(clone);
    moveDown();
  };

  const handleRestart = () => {
    setGrid(new TetrisGrid());
    setCurrent(getRandomTetromino());
    setNext(getRandomTetromino());
    setScore(0);
    setLevel(1);
    setGameOver(false);
  };

  /* Build display board */
  const displayGrid = grid.clone().matrix.map(r=>[...r]);
  const {shape,row,col,color} = current;

  for(let r=0;r<shape.length;r++){
    for(let c=0;c<shape[r].length;c++){
      if(shape[r][c]===1){
        const gr = row + r;
        const gc = col + c;
        if(gr>=0 && gr<grid.rows && gc>=0 && gc<grid.cols){
          displayGrid[gr][gc] = color;
        }
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tetris</Text>

      <View style={styles.scoreBox}>
        <Text style={styles.scoreText}>Score: {score}</Text>
        <Text style={styles.scoreText}>Level: {level}</Text>
        <Text style={styles.high}>High: {highScore}</Text>
      </View>

      <View style={styles.board}>
        {displayGrid.map((row,i)=>(
          <View key={i} style={styles.row}>
            {row.map((cell,j)=>(
              <View
                key={j}
                style={[
                  styles.cell,
                  cell && {backgroundColor: cell}
                ]}
              />
            ))}
          </View>
        ))}
      </View>

      <Text style={{marginTop:10,fontSize:16}}>Next:</Text>
      <View style={{marginVertical:10}}>
        {next.shape.map((r,i)=>(
          <View key={i} style={{flexDirection:'row'}}>
            {r.map((v,j)=>(
              <View
                key={j}
                style={{
                  width:20,height:20,
                  margin:1,
                  backgroundColor: v===1?next.color:'transparent',
                  borderWidth: v===1?1:0
                }}
              />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={moveLeft} style={styles.controlButton}><Text style={styles.ctrlTxt}>◀</Text></TouchableOpacity>
        <TouchableOpacity onPress={rotate} style={styles.controlButton}><Text style={styles.ctrlTxt}>⟳</Text></TouchableOpacity>
        <TouchableOpacity onPress={moveRight} style={styles.controlButton}><Text style={styles.ctrlTxt}>▶</Text></TouchableOpacity>
        <TouchableOpacity onPress={drop} style={styles.controlButton}><Text style={styles.ctrlTxt}>⬇</Text></TouchableOpacity>
      </View>

      {gameOver && (
        <View style={styles.overlay}>
          <Text style={styles.gameOver}>GAME OVER</Text>
          <TouchableOpacity onPress={handleRestart} style={styles.restartButton}>
            <Text style={styles.restartText}>RESTART</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

/*==============================
          STYLES
==============================*/
const styles = StyleSheet.create({
  container:{
    flex:1,
    alignItems:'center',
    backgroundColor:'#f5f5f5',
    paddingTop:40
  },
  title:{
    fontSize:32,
    fontWeight:'bold',
    marginBottom:10
  },
  scoreBox:{
    flexDirection:'row',
    justifyContent:'space-around',
    width:'80%',
    marginBottom:20
  },
  scoreText:{ fontSize:20, color:'#555' },
  high:{ fontSize:20, fontWeight:'bold', color:'#ff9800' },

  board:{
    borderWidth:2,
    borderColor:'#ccc',
    padding:3,
    backgroundColor:'#ffffff'
  },

  row:{ flexDirection:'row' },

  cell:{
    width:25,
    height:25,
    margin:1,
    backgroundColor:'#eee',
  },

  controls:{
    flexDirection:'row',
    marginTop:20
  },
  controlButton:{
    padding:10,
    backgroundColor:'#ddd',
    marginHorizontal:10,
    borderRadius:8
  },
  ctrlTxt:{ fontSize:24, fontWeight:'bold' },

  overlay:{
    position:'absolute',
    top:0,left:0,right:0,bottom:0,
    backgroundColor:'rgba(0,0,0,0.7)',
    justifyContent:'center',
    alignItems:'center'
  },
  gameOver:{
    color:'white',
    fontSize:40,
    fontWeight:'bold'
  },
  restartButton:{
    backgroundColor:'#ffc107',
    padding:15,
    borderRadius:10,
    marginTop:20
  },
  restartText:{
    fontSize:24,
    fontWeight:'bold',
    color:'#333'
  }
});

export default Tetris;
