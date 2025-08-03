import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_SIZE = 10;
const BRICK_WIDTH = 75;
const BRICK_HEIGHT = 20;
const BRICK_ROWS = 8;
const BRICK_COLS = 10;

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Paddle {
  x: number;
}

interface Brick {
  x: number;
  y: number;
  hit: boolean;
  color: string;
}

export const Breakout = ({ onRestart }: { onRestart: () => void }) => {
  const [ball, setBall] = useState<Ball>({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50, vx: 3, vy: -3 });
  const [paddle, setPaddle] = useState<Paddle>({ x: GAME_WIDTH / 2 - PADDLE_WIDTH / 2 });
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const gameLoopRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e'];

  const initializeBricks = useCallback(() => {
    const newBricks: Brick[] = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        newBricks.push({
          x: col * (BRICK_WIDTH + 5) + 35,
          y: row * (BRICK_HEIGHT + 5) + 50,
          hit: false,
          color: colors[row % colors.length]
        });
      }
    }
    setBricks(newBricks);
  }, []);

  const resetGame = useCallback(() => {
    setBall({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50, vx: 3, vy: -3 });
    setPaddle({ x: GAME_WIDTH / 2 - PADDLE_WIDTH / 2 });
    setScore(0);
    setLives(3);
    setIsGameStarted(false);
    setIsGameOver(false);
    setIsWon(false);
    initializeBricks();
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  }, [initializeBricks]);

  const gameLoop = useCallback(() => {
    if (!isGameStarted || isGameOver || isWon) return;

    setBall(prevBall => {
      let newBall = { ...prevBall };
      newBall.x += newBall.vx;
      newBall.y += newBall.vy;

      // Wall collisions
      if (newBall.x <= BALL_SIZE || newBall.x >= GAME_WIDTH - BALL_SIZE) {
        newBall.vx = -newBall.vx;
      }
      if (newBall.y <= BALL_SIZE) {
        newBall.vy = -newBall.vy;
      }

      // Paddle collision
      if (
        newBall.y + BALL_SIZE >= GAME_HEIGHT - PADDLE_HEIGHT - 10 &&
        newBall.x >= paddle.x &&
        newBall.x <= paddle.x + PADDLE_WIDTH &&
        newBall.vy > 0
      ) {
        newBall.vy = -newBall.vy;
        // Add some angle based on where it hits the paddle
        const hitPos = (newBall.x - paddle.x) / PADDLE_WIDTH;
        newBall.vx = (hitPos - 0.5) * 6;
      }

      // Bottom wall (lose life)
      if (newBall.y > GAME_HEIGHT) {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setIsGameOver(true);
            toast.error("Game Over!");
          } else {
            toast.warning(`${newLives} lives remaining!`);
          }
          return newLives;
        });
        return { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50, vx: 3, vy: -3 };
      }

      return newBall;
    });

    setBricks(prevBricks => {
      const newBricks = prevBricks.map(brick => {
        if (brick.hit) return brick;

        // Check collision with ball
        if (
          ball.x + BALL_SIZE >= brick.x &&
          ball.x - BALL_SIZE <= brick.x + BRICK_WIDTH &&
          ball.y + BALL_SIZE >= brick.y &&
          ball.y - BALL_SIZE <= brick.y + BRICK_HEIGHT
        ) {
          setBall(prev => ({ ...prev, vy: -prev.vy }));
          setScore(prev => prev + 10);
          toast.success("+10 points!");
          return { ...brick, hit: true };
        }
        return brick;
      });

      // Check if all bricks are hit
      if (newBricks.every(brick => brick.hit)) {
        setIsWon(true);
        toast.success("🎉 You Won! 🎉");
      }

      return newBricks;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [isGameStarted, isGameOver, isWon, ball, paddle]);

  useEffect(() => {
    if (isGameStarted && !isGameOver && !isWon) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isGameStarted, isGameOver, isWon, gameLoop]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current || !isGameStarted) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      setPaddle({ x: Math.max(0, Math.min(GAME_WIDTH - PADDLE_WIDTH, mouseX - PADDLE_WIDTH / 2)) });
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isGameStarted) {
          setIsGameStarted(true);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isGameStarted]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleStart = () => {
    setIsGameStarted(true);
  };

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
          Lives: {lives}
        </Badge>
      </div>

      {/* Game Area */}
      <div className="relative border-2 border-primary/30 rounded-lg overflow-hidden bg-gradient-dark">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="block bg-black"
        />
        
        {/* Game Canvas Content */}
        <svg 
          width={GAME_WIDTH} 
          height={GAME_HEIGHT} 
          className="absolute inset-0 pointer-events-none"
        >
          {/* Bricks */}
          {bricks.map((brick, index) => (
            !brick.hit && (
              <rect
                key={index}
                x={brick.x}
                y={brick.y}
                width={BRICK_WIDTH}
                height={BRICK_HEIGHT}
                fill={brick.color}
                stroke="#fff"
                strokeWidth="1"
                rx="3"
              />
            )
          ))}
          
          {/* Ball */}
          <circle
            cx={ball.x}
            cy={ball.y}
            r={BALL_SIZE}
            fill="url(#ballGradient)"
            className="animate-pulse"
          />
          
          {/* Paddle */}
          <rect
            x={paddle.x}
            y={GAME_HEIGHT - PADDLE_HEIGHT - 10}
            width={PADDLE_WIDTH}
            height={PADDLE_HEIGHT}
            fill="url(#paddleGradient)"
            rx="7"
          />

          <defs>
            <linearGradient id="ballGradient">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="paddleGradient">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>

        {/* Game Overlay */}
        {(!isGameStarted || isGameOver || isWon) && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-center space-y-4">
              {!isGameStarted ? (
                <>
                  <h3 className="text-2xl font-bold text-white">Breakout</h3>
                  <p className="text-white/80">Move mouse to control paddle</p>
                  <p className="text-white/80">Break all the bricks to win!</p>
                </>
              ) : isWon ? (
                <>
                  <h3 className="text-2xl font-bold text-green-400">🎉 You Won! 🎉</h3>
                  <p className="text-white/80">Final Score: {score}</p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-red-400">Game Over!</h3>
                  <p className="text-white/80">Final Score: {score}</p>
                </>
              )}
              <Button variant="gaming" onClick={!isGameStarted ? handleStart : handleRestart}>
                {!isGameStarted ? "Start Game" : "Play Again"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground">
        Move your mouse to control the paddle. Break all bricks to win!
      </div>
    </div>
  );
};