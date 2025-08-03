import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const GAME_WIDTH = 600;
const GAME_HEIGHT = 150;
const DINO_SIZE = 40;
const CACTUS_WIDTH = 20;
const CACTUS_HEIGHT = 40;
const GROUND_HEIGHT = 20;
const JUMP_FORCE = -15;
const GRAVITY = 0.8;
const GAME_SPEED = 5;

interface Dino {
  x: number;
  y: number;
  velocity: number;
  isJumping: boolean;
}

interface Obstacle {
  x: number;
  width: number;
  height: number;
}

export const DinoRunner = ({ onRestart }: { onRestart: () => void }) => {
  const [dino, setDino] = useState<Dino>({
    x: 80,
    y: GAME_HEIGHT - GROUND_HEIGHT - DINO_SIZE,
    velocity: 0,
    isJumping: false,
  });
  
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('dino-runner-high-score') || '0');
  });
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(GAME_SPEED);
  
  const gameLoopRef = useRef<number>();
  const scoreIntervalRef = useRef<NodeJS.Timeout>();

  const groundY = GAME_HEIGHT - GROUND_HEIGHT;

  const createObstacle = (x: number): Obstacle => {
    const types = [
      { width: 20, height: 40 }, // tall cactus
      { width: 30, height: 25 }, // wide cactus
      { width: 15, height: 35 }, // thin cactus
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
      x,
      width: type.width,
      height: type.height,
    };
  };

  const resetGame = useCallback(() => {
    setDino({
      x: 80,
      y: groundY - DINO_SIZE,
      velocity: 0,
      isJumping: false,
    });
    setObstacles([]);
    setScore(0);
    setIsGameStarted(false);
    setIsGameOver(false);
    setGameSpeed(GAME_SPEED);
    
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    if (scoreIntervalRef.current) {
      clearInterval(scoreIntervalRef.current);
    }
  }, [groundY]);

  const jump = useCallback(() => {
    if (!isGameStarted) {
      setIsGameStarted(true);
      return;
    }
    
    if (isGameOver) {
      resetGame();
      return;
    }

    setDino(prev => {
      if (!prev.isJumping) {
        return {
          ...prev,
          velocity: JUMP_FORCE,
          isJumping: true,
        };
      }
      return prev;
    });
  }, [isGameStarted, isGameOver, resetGame]);

  const checkCollision = useCallback((dino: Dino, obstacles: Obstacle[]): boolean => {
    for (const obstacle of obstacles) {
      if (
        dino.x < obstacle.x + obstacle.width &&
        dino.x + DINO_SIZE > obstacle.x &&
        dino.y < groundY - obstacle.height + 5 && // small tolerance
        dino.y + DINO_SIZE > groundY - obstacle.height
      ) {
        return true;
      }
    }
    return false;
  }, [groundY]);

  const gameLoop = useCallback(() => {
    if (!isGameStarted || isGameOver) return;

    // Update dino physics
    setDino(prev => {
      let newY = prev.y + prev.velocity;
      let newVelocity = prev.velocity + GRAVITY;
      let newIsJumping = prev.isJumping;

      // Ground collision
      if (newY >= groundY - DINO_SIZE) {
        newY = groundY - DINO_SIZE;
        newVelocity = 0;
        newIsJumping = false;
      }

      return {
        ...prev,
        y: newY,
        velocity: newVelocity,
        isJumping: newIsJumping,
      };
    });

    // Update obstacles
    setObstacles(prev => {
      const newObstacles = prev
        .map(obstacle => ({ ...obstacle, x: obstacle.x - gameSpeed }))
        .filter(obstacle => obstacle.x + obstacle.width > 0);

      // Add new obstacles
      if (newObstacles.length === 0 || newObstacles[newObstacles.length - 1].x < GAME_WIDTH - 300) {
        const distance = 200 + Math.random() * 200; // Random spacing
        newObstacles.push(createObstacle(GAME_WIDTH + distance));
      }

      return newObstacles;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [isGameStarted, isGameOver, gameSpeed]);

  useEffect(() => {
    if (isGameStarted && !isGameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isGameStarted, isGameOver, gameLoop]);

  // Score system
  useEffect(() => {
    if (isGameStarted && !isGameOver) {
      scoreIntervalRef.current = setInterval(() => {
        setScore(prev => {
          const newScore = prev + 1;
          
          // Increase speed every 100 points
          if (newScore % 100 === 0) {
            setGameSpeed(prevSpeed => Math.min(prevSpeed + 0.5, 10));
            toast.success("Speed increased!");
          }
          
          return newScore;
        });
      }, 100);
    }
    
    return () => {
      if (scoreIntervalRef.current) {
        clearInterval(scoreIntervalRef.current);
      }
    };
  }, [isGameStarted, isGameOver]);

  // Collision detection
  useEffect(() => {
    if (checkCollision(dino, obstacles)) {
      setIsGameOver(true);
      
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('dino-runner-high-score', score.toString());
        toast.success("New high score!");
      }
      
      toast.error("Game Over!");
    }
  }, [dino, obstacles, score, highScore, checkCollision]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleRestart = () => {
    resetGame();
    onRestart();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      {/* Game Status */}
      <div className="flex items-center gap-6">
        <Badge variant="outline" className="text-lg px-4 py-2">
          Score: {score}
        </Badge>
        <Badge variant="outline" className="text-lg px-4 py-2 bg-gradient-secondary text-white">
          High Score: {highScore}
        </Badge>
        <Badge variant="outline" className="text-lg px-4 py-2 bg-gradient-primary text-white">
          Speed: {gameSpeed.toFixed(1)}x
        </Badge>
      </div>

      {/* Game Area */}
      <div className="relative border-2 border-primary/30 rounded-lg overflow-hidden">
        <svg width={GAME_WIDTH} height={GAME_HEIGHT} className="block bg-gradient-to-b from-blue-200 to-blue-100">
          {/* Ground */}
          <rect
            x={0}
            y={groundY}
            width={GAME_WIDTH}
            height={GROUND_HEIGHT}
            fill="url(#groundGradient)"
          />
          
          {/* Ground pattern */}
          {Array.from({ length: Math.ceil(GAME_WIDTH / 40) }, (_, i) => (
            <line
              key={i}
              x1={i * 40 - (score * gameSpeed / 2) % 40}
              y1={groundY}
              x2={i * 40 - (score * gameSpeed / 2) % 40}
              y2={GAME_HEIGHT}
              stroke="#059669"
              strokeWidth="2"
              opacity="0.3"
            />
          ))}
          
          {/* Clouds */}
          {Array.from({ length: 3 }, (_, i) => (
            <g key={i}>
              <circle cx={150 + i * 200 - (score / 3) % GAME_WIDTH} cy={30} r="12" fill="white" opacity="0.8" />
              <circle cx={160 + i * 200 - (score / 3) % GAME_WIDTH} cy={30} r="15" fill="white" opacity="0.8" />
              <circle cx={170 + i * 200 - (score / 3) % GAME_WIDTH} cy={30} r="12" fill="white" opacity="0.8" />
            </g>
          ))}
          
          {/* Dino */}
          <rect
            x={dino.x}
            y={dino.y}
            width={DINO_SIZE}
            height={DINO_SIZE}
            fill="url(#dinoGradient)"
            rx="5"
          />
          
          {/* Dino eye */}
          <circle
            cx={dino.x + 28}
            cy={dino.y + 12}
            r="3"
            fill="#000"
          />
          
          {/* Obstacles (Cacti) */}
          {obstacles.map((obstacle, index) => (
            <g key={index}>
              <rect
                x={obstacle.x}
                y={groundY - obstacle.height}
                width={obstacle.width}
                height={obstacle.height}
                fill="url(#cactusGradient)"
                rx="3"
              />
              {/* Cactus spikes */}
              <rect x={obstacle.x + 5} y={groundY - obstacle.height + 5} width="3" height="8" fill="#065f46" />
              <rect x={obstacle.x + obstacle.width - 8} y={groundY - obstacle.height + 10} width="3" height="8" fill="#065f46" />
            </g>
          ))}

          <defs>
            <linearGradient id="groundGradient">
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            <linearGradient id="dinoGradient">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="cactusGradient">
              <stop offset="0%" stopColor="#16a34a" />
              <stop offset="100%" stopColor="#166534" />
            </linearGradient>
          </defs>
        </svg>

        {/* Game Overlay */}
        {(!isGameStarted || isGameOver) && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center space-y-4">
              {!isGameStarted ? (
                <>
                  <h3 className="text-2xl font-bold text-white">Dino Runner</h3>
                  <p className="text-white/80">Press Space or click Jump to start!</p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-red-400">Game Over!</h3>
                  <p className="text-white/80">Score: {score}</p>
                  {score === highScore && score > 0 && (
                    <p className="text-yellow-400 font-bold">🎉 New High Score! 🎉</p>
                  )}
                </>
              )}
              <Button variant="gaming" onClick={jump}>
                {!isGameStarted ? "Start Game" : "Play Again"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="text-center space-y-2">
        <div className="flex gap-2 justify-center">
          <Button variant="neon" onClick={jump} disabled={!isGameStarted || isGameOver}>
            Jump
          </Button>
          <Button variant="gaming" onClick={handleRestart}>
            Restart
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Press Spacebar or Up Arrow to jump over cacti
        </p>
      </div>
    </div>
  );
};