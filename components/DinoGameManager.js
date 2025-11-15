
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Pressable,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameEngine } from './dino/GameEngine';
import { LinearGradient } from 'expo-linear-gradient';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GAME_WIDTH = SCREEN_WIDTH;
const GAME_HEIGHT = SCREEN_HEIGHT * 0.6;

export default function DinoGameManager() {
  const [gameState, setGameState] = useState(null);
  const [runFrame, setRunFrame] = useState(0);
  const gameEngineRef = useRef(null);
  const animationFrameRef = useRef(null);


  useEffect(() => {
    if (gameState?.isRunning && !gameState?.dino.isJumping) {
      const interval = setInterval(() => {
        setRunFrame(prev => (prev + 1) % 3); 
      }, 100);
      return () => clearInterval(interval);
    }
  }, [gameState?.isRunning, gameState?.dino.isJumping]);


  useEffect(() => {
    gameEngineRef.current = new GameEngine(GAME_WIDTH, GAME_HEIGHT);
    setGameState(gameEngineRef.current.getGameState());
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);


  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyPress = (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
          e.preventDefault();
          handleJump();
        }
      };
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, []);


  useEffect(() => {
    const gameLoop = () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.update();
        setGameState({ ...gameEngineRef.current.getGameState() });
      }
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleJump = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.jump();
    }
  };

  if (!gameState) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <Pressable style={styles.container} onPress={handleJump}>
      {/* Header with scores */}
      <View style={styles.header}>
        <Text style={styles.scoreText}>HI: {gameState.highScore}</Text>
        <Text style={styles.scoreText}>
          {String(gameState.score).padStart(5, '0')}
        </Text>
      </View>

      {/* Game Area */}
  <LinearGradient
  colors={['#90cfe8ff', '#f9f9f9ff']}
  start={{ x: 0, y: 0 }}
  end={{ x: 0, y: 1 }}
  style={[styles.gameArea, { height: GAME_HEIGHT }]}
>

        {/* Start Screen */}
        {!gameState.isRunning && !gameState.isGameOver && (
          <View style={styles.overlay}>
            <Ionicons name="logo-octocat" size={80} color="#535353" />
            <Text style={styles.startText}>TAP TO START</Text>
            <Text style={styles.instructionText}>
              {Platform.OS === 'web' 
                ? 'Press SPACE or ↑ to jump' 
                : 'Tap anywhere to jump'}
            </Text>
          </View>
        )}

        {/* Game Over Screen */}
        {gameState.isGameOver && (
          <View style={styles.overlay}>
            <Text style={styles.gameOverText}>GAME OVER</Text>
            <Text style={styles.finalScoreText}>
              Score: {gameState.score}
            </Text>
            {gameState.score === gameState.highScore && gameState.score > 0 && (
              <Text style={styles.newHighScoreText}>🎉 NEW HIGH SCORE!</Text>
            )}
            <TouchableOpacity style={styles.restartButton} onPress={handleJump}>
              <Ionicons name="refresh" size={24} color="#fff" />
              <Text style={styles.restartButtonText}>RESTART</Text>
            </TouchableOpacity>
          </View>
        )}
        
       {gameState.clouds.map((cloud, index) => (
  <Image
    key={`cloud-${index}`}
    source={require('../assets/images/cloud.png')}
    style={[
      styles.cloud,
      {
        left: cloud.x,
        top: cloud.y,
        width: cloud.width,
        height: cloud.height,
        tintColor: '#999999',  // Gray color
      },
    ]}
    resizeMode="contain"
  />
))}

        {/* Dino */}
        <View
          style={[
            styles.dino,
            {
              left: gameState.dino.x,
              bottom: GAME_HEIGHT - gameState.dino.y - 47,
            },
          ]}
        >
     {gameState.dino.isJumping ? (
     <Image
    source={require('../assets/images/dino-jump.png')}
    style={styles.dinoImage}
    resizeMode="contain"
  />
    ) : (
    <Image
    source={
      runFrame === 0
        ? require('../assets/images/dino-run-1.png')
        : runFrame === 1
        ? require('../assets/images/dino-run-2.png')
        : require('../assets/images/dino-run-3.png')
    }
    style={styles.dinoImage}
    resizeMode="contain"
   />
   )}

        </View>

        {/* Obstacles */}
        {gameState.obstacles.map((obstacle, index) => (
  <View
    key={`obstacle-${index}`}
    style={[
      styles.obstacle,
      {
        left: obstacle.x,
        bottom: GAME_HEIGHT - obstacle.y - obstacle.height,
        width: obstacle.width,
        height: obstacle.height,
      },
    ]}
  >
    <Image
      source={
        obstacle.height >= 60
          ? require('../assets/images/big-cactus.png')
          : require('../assets/images/small-cactus.png')
      }
      style={{ width: obstacle.width, height: obstacle.height }}
      resizeMode="contain"
    />
  </View>
))}

        {/* Ground */}
        <View 
          style={[
            styles.ground, 
            { 
              height: gameState.groundHeight,
              bottom: 0,
            }
          ]} 
        />

        {/* Ground line */}
        <View 
          style={[
            styles.groundLine,
            { bottom: gameState.groundHeight }
          ]}
        />
      </LinearGradient>

      {/* Controls for mobile */}
      {Platform.OS !== 'web' && (
        <View style={styles.controls}>
          <TouchableOpacity style={styles.jumpButton} onPress={handleJump}>
            <Ionicons name="arrow-up" size={40} color="#fff" />
            <Text style={styles.jumpButtonText}>JUMP</Text>
          </TouchableOpacity>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#535353',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
 gameArea: {
  position: 'relative',
  overflow: 'hidden',
},
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 247, 247, 0.95)',
    zIndex: 10,
  },
  startText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#535353',
    marginTop: 20,
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  gameOverText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#535353',
    marginBottom: 20,
  },
  finalScoreText: {
    fontSize: 24,
    color: '#757575',
    marginBottom: 10,
  },
  newHighScoreText: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#535353',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  dino: {
    position: 'absolute',
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dinoText: {
    fontSize: 50,
  },
  obstacle: {
    position: 'absolute',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 1,
  },
  cactusEmoji: {
    fontSize: 35,
    lineHeight: 40,
  },
  ground: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#e0e0e0',
  },
  groundLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#535353',
  },
  controls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  jumpButton: {
    backgroundColor: '#535353',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  jumpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  cloud: {
  position: 'absolute',
  opacity: 0.9,  // Increase opacity (was 0.7)
  zIndex: 0,
  tintColor: '#888888',
},
});