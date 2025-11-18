import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
  ImageBackground,
} from "react-native";

import ground from "../assets/images/flappy-ground.png"; 
import bg from "../assets/images/flappy-background.png";
import birdSprite from "../assets/images/flappybird.png";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const GAME_WIDTH = SCREEN_WIDTH;
const GAME_HEIGHT = SCREEN_HEIGHT;
const GRAVITY = 0.5;
const JUMP_VELOCITY = -10;
const GROUND_HEIGHT = 100;
const BIRD_SIZE = 120;
const PIPE_WIDTH = 60;
const PIPE_CAP_HEIGHT = 20; // New constant for the cap height
const PIPE_GAP = 300;
const PIPE_SPEED = 4;
const PIPE_SPAWN_INTERVAL = 1500;
const BIRD_START_X = GAME_WIDTH / 4;
const BIRD_CENTER_X = BIRD_START_X + BIRD_SIZE / 2;
const MAX_PIPE_Y = GAME_HEIGHT - GROUND_HEIGHT - PIPE_GAP - 50;
const MIN_PIPE_Y = 50;

class Bird {
  constructor(initialY) {
    this.y = initialY;
    this.velocity = 0;
    this.size = BIRD_SIZE;
  }

  applyGravity() {
    this.velocity += GRAVITY;
  }

  updatePosition() {
    this.y += this.velocity;
  }

  jump() {
    this.velocity = JUMP_VELOCITY;
  }

  getTop() {
    return this.y;
  }

  getBottom() {
    return this.y + this.size;
  }

  checkCollisionWithPipe(pipe) {
    const birdLeft = BIRD_START_X;
    const birdRight = BIRD_START_X + this.size;
    const birdTop = this.getTop();
    const birdBottom = this.getBottom();

    // 1. Check for horizontal overlap
    const horizontalOverlap =
      birdRight > pipe.getLeft() && birdLeft < pipe.getRight();

    if (!horizontalOverlap) {
      return false;
    }

    // 2. Check for vertical collision
    // Collision with top pipe: bird's top edge is above the top pipe's bottom edge
    const collisionWithTopPipe = birdTop < pipe.getTopPipeBottom();

    // Collision with bottom pipe: bird's bottom edge is below the bottom pipe's top edge
    const collisionWithBottomPipe = birdBottom > pipe.getBottomPipeTop();

    return collisionWithTopPipe || collisionWithBottomPipe;
  }
}

class Pipe {
  constructor(x, gapCenterY) {
    this.x = x;
    const halfGap = PIPE_GAP / 2;

    const topPipeBottom = gapCenterY - halfGap;
    const bottomPipeTop = gapCenterY + halfGap;

    this.topHeight = Math.max(0, topPipeBottom);
    this.bottomHeight = Math.max(
      0,
      GAME_HEIGHT - GROUND_HEIGHT - bottomPipeTop
    );

    this.width = PIPE_WIDTH;
    this.gap = PIPE_GAP;
    this.passed = false;
  }

  updatePosition() {
    this.x -= PIPE_SPEED;
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }

  getLeft() {
    return this.x;
  }

  getRight() {
    return this.x + this.width;
  }

  getTopPipeBottom() {
    return this.topHeight;
  }

  getBottomPipeTop() {
    return GAME_HEIGHT - GROUND_HEIGHT - this.bottomHeight;
  }
}

const FlappyBirdApp = () => {
  const [gameState, setGameState] = useState("ready");
  const [highScore, setHighScore] = useState(0);
  const [renderTrigger, setRenderTrigger] = useState(0);

  const gameStateRef = useRef({
    bird: new Bird(GAME_HEIGHT / 2),
    pipes: [],
    score: 0,
  });

  const lastSpawnTimeRef = useRef(0);

  const updateHighScore = (newScore) => {
    if (newScore > highScore) {
      setHighScore(newScore);
    }
  };

  const spawnPipe = () => {
    const gapCenterY = Math.random() * (MAX_PIPE_Y - MIN_PIPE_Y) + MIN_PIPE_Y;

    const newPipe = new Pipe(GAME_WIDTH, gapCenterY);

    gameStateRef.current.pipes.push(newPipe);

    lastSpawnTimeRef.current = Date.now();
  };

  const endGame = () => {
    const finalScore = gameStateRef.current.score;
    updateHighScore(finalScore);

    setTimeout(() => {
      setGameState("gameover");
    }, 0);
  };

  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();
    const frameDuration = 1000 / 60;

    const gameLoop = (currentTime) => {
      const state = gameStateRef.current;
      const deltaTime = currentTime - lastTime;

      if (deltaTime > frameDuration) {
        lastTime = currentTime - (deltaTime % frameDuration);

        if (gameState !== "playing") {
          cancelAnimationFrame(animationFrameId);
          return;
        }

        // 1. Bird Physics Update
        state.bird.applyGravity();
        state.bird.updatePosition();

        // 2. Ground and Ceiling Collision (Ends game on ground hit)
        const groundCollisionY = GAME_HEIGHT - GROUND_HEIGHT - state.bird.size;
        if (state.bird.getBottom() >= GAME_HEIGHT - GROUND_HEIGHT) {
          state.bird.y = groundCollisionY;
          state.bird.velocity = 0;
          endGame();
          return;
        }

        if (state.bird.getTop() <= 0) {
          state.bird.y = 0;
          state.bird.velocity = 0;
        }

        // 3. Pipe Updates and Cleanup
        state.pipes.forEach((pipe) => pipe.updatePosition());
        state.pipes = state.pipes.filter((pipe) => !pipe.isOffScreen());

        // 4. Pipe Spawning
        if (Date.now() - lastSpawnTimeRef.current > PIPE_SPAWN_INTERVAL) {
          spawnPipe();
        }

        // 5. Check Collision and Score
        for (let i = 0; i < state.pipes.length; i++) {
          const pipe = state.pipes[i];

          // Collision Check
          if (state.bird.checkCollisionWithPipe(pipe)) {
            endGame();
            return;
          }

          // Score Check: Bird's center has passed the pipe's right edge
          if (BIRD_CENTER_X > pipe.getRight() && !pipe.passed) {
            state.score += 1;
            pipe.passed = true;
          }
        }

        setRenderTrigger((prev) => prev + 1);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    if (gameState === "playing") {
      gameLoop(performance.now());
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState]);

  const jump = () => {
    if (gameState === "ready" || gameState === "gameover") {
      startGame();
    } else if (gameState === "playing") {
      gameStateRef.current.bird.jump();
    }
  };

  const startGame = () => {
    setGameState("playing");
    gameStateRef.current = {
      bird: new Bird(GAME_HEIGHT / 2),
      pipes: [],
      score: 0,
    };
    lastSpawnTimeRef.current = 0;
    spawnPipe();
  };

  const renderGameContent = () => {
    if (gameState === "ready") {
      return (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>High Score: {highScore}</Text>
          <Text style={styles.messageText}>Tap to Start</Text>
        </View>
      );
    }
    if (gameState === "gameover") {
      return (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>
            Game Over! Score: {gameStateRef.current.score}
          </Text>
          <Text style={styles.messageTextSmall}>High Score: {highScore}</Text>
          <Text style={styles.messageText} onPress={startGame}>
            Tap to Play Again
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderPipes = () => {
    return gameStateRef.current.pipes.map((pipe, index) => {
      const bottomPipeTop = GAME_HEIGHT - GROUND_HEIGHT - pipe.bottomHeight;

      return (
        <React.Fragment key={index}>
          {/* Top Pipe */}
          <View
            style={[
              styles.pipe,
              {
                position: "absolute",
                left: pipe.x,
                width: pipe.width,
                height: pipe.topHeight,
                top: 0,
              },
            ]}
          />

          {/* Bottom Pipe (touches ground) */}
          <View
            style={[
              styles.pipe,
              {
                position: "absolute",
                left: pipe.x,
                width: pipe.width,
                height: pipe.bottomHeight,
                top: bottomPipeTop,
              },
            ]}
          />
        </React.Fragment>
      );
    });
  };



  return (
    <TouchableWithoutFeedback onPress={jump}>
      <View style={styles.container}>
        <ImageBackground source={bg} style={styles.sky} resizeMode="cover">
          {renderGameContent()}
          {renderPipes()}

          <Image
            source={birdSprite}
            style={[
              styles.bird,
              {
                top: gameStateRef.current.bird.y,
                left: BIRD_START_X,
              },
            ]}
            resizeMode="contain"
          />

          <Text style={styles.scoreText}>
            Score: {gameStateRef.current.score}
          </Text>
        </ImageBackground>

        <Image source={ground} style={styles.ground} resizeMode="stretch" />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050014", // deep space base
  },

  // SKY / BACKGROUND
  sky: {
    flex: 1,
    backgroundColor: "#120026", // dark violet base
  },

  // GROUND (uses the synthwave sprite)
  ground: {
    height: GROUND_HEIGHT,
    backgroundColor: "#1B2035",
    borderTopWidth: 4,
    borderTopColor: "#34E9FF", // neon cyan edge
    overflow: "hidden",
    zIndex: 4,
  },
  groundImage: {
    position: "absolute",
    top: -10, // pulls texture slightly up so it kisses the border line
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "120%",
  },

  // PIPES
  pipe: {
    position: "absolute",
    backgroundColor: "#200834", // dark purple body
    borderWidth: 3,
    borderColor: "#34E9FF", // neon cyan outline
    borderRadius: 6,
    shadowColor: "#FF2BD8", // magenta glow
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
    zIndex: 3,
  },

  // Optional caps if you want later
  pipeTopCap: {
    height: PIPE_CAP_HEIGHT,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopWidth: 0,
    top: 0,
  },
  pipeBottomCap: {
    height: PIPE_CAP_HEIGHT,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 0,
    bottom: 0,
  },

  // BIRD
  bird: {
    position: "absolute",
    width: BIRD_SIZE,
    height: BIRD_SIZE,
    borderRadius: BIRD_SIZE / 2,
    // backgroundColor: "#FF2BD8", // neon magenta
    // borderWidth: 6,
    // borderColor: "#34E9FF", // cyan rim
    // shadowColor: "#FF9AFC", // soft glow
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
    zIndex: 5,
  },

  // OVERLAY / MESSAGES
  messageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    backgroundColor: "rgba(5,0,20,0.65)", // dark translucent overlay
  },
  messageText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#34E9FF",
    textShadowColor: "#FF2BD8",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginVertical: 10,
  },
  messageTextSmall: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF9AFC",
    textShadowColor: "#200834",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    marginVertical: 5,
  },

  // SCORE
  scoreText: {
    position: "absolute",
    top: 40,
    width: "100%",
    textAlign: "center",
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#34E9FF",
    textShadowColor: "#FF2BD8",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    zIndex: 6,
  },
});


export default FlappyBirdApp;
