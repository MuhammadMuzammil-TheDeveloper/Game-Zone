import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 8;
const PADDLE_SPEED = 6;
const INITIAL_BALL_SPEED = 4;

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Paddle {
  y: number;
}

interface GameState {
  playerPaddle: Paddle;
  aiPaddle: Paddle;
  ball: Ball;
  playerScore: number;
  aiScore: number;
  isGameStarted: boolean;
  isGameOver: boolean;
  winner: 'player' | 'ai' | null;
}

export const Pong = ({ onRestart }: { onRestart: () => void }) => {
  const [gameState, setGameState] = useState<GameState>({
    playerPaddle: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
    aiPaddle: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
    ball: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, vx: INITIAL_BALL_SPEED, vy: INITIAL_BALL_SPEED },
    playerScore: 0,
    aiScore: 0,
    isGameStarted: false,
    isGameOver: false,
    winner: null,
  });

  const gameLoopRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const resetBall = useCallback((): Ball => {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const angle = (Math.random() - 0.5) * Math.PI / 3; // ±30 degrees
    return {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      vx: INITIAL_BALL_SPEED * direction * Math.cos(angle),
      vy: INITIAL_BALL_SPEED * Math.sin(angle),
    };
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      playerPaddle: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
      aiPaddle: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
      ball: resetBall(),
      playerScore: 0,
      aiScore: 0,
      isGameStarted: false,
      isGameOver: false,
      winner: null,
    });
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  }, [resetBall]);

  const updateAI = useCallback((ball: Ball, aiPaddle: Paddle): Paddle => {
    const paddleCenter = aiPaddle.y + PADDLE_HEIGHT / 2;
    const ballCenter = ball.y;
    
    let newY = aiPaddle.y;
    
    if (ballCenter < paddleCenter - 10) {
      newY = Math.max(0, aiPaddle.y - PADDLE_SPEED * 0.8);
    } else if (ballCenter > paddleCenter + 10) {
      newY = Math.min(GAME_HEIGHT - PADDLE_HEIGHT, aiPaddle.y + PADDLE_SPEED * 0.8);
    }
    
    return { y: newY };
  }, []);

  const gameLoop = useCallback(() => {
    if (!gameState.isGameStarted || gameState.isGameOver) return;

    setGameState(prev => {
      let newBall = { ...prev.ball };
      newBall.x += newBall.vx;
      newBall.y += newBall.vy;

      // Ball collision with top and bottom walls
      if (newBall.y <= BALL_SIZE || newBall.y >= GAME_HEIGHT - BALL_SIZE) {
        newBall.vy = -newBall.vy;
        newBall.y = Math.max(BALL_SIZE, Math.min(GAME_HEIGHT - BALL_SIZE, newBall.y));
      }

      // Ball collision with player paddle (left)
      if (
        newBall.x - BALL_SIZE <= PADDLE_WIDTH &&
        newBall.y >= prev.playerPaddle.y &&
        newBall.y <= prev.playerPaddle.y + PADDLE_HEIGHT &&
        newBall.vx < 0
      ) {
        newBall.vx = -newBall.vx;
        newBall.x = PADDLE_WIDTH + BALL_SIZE;
        // Add some spin based on where it hits the paddle
        const hitPos = (newBall.y - prev.playerPaddle.y) / PADDLE_HEIGHT;
        newBall.vy = (hitPos - 0.5) * 8;
      }

      // Ball collision with AI paddle (right)
      if (
        newBall.x + BALL_SIZE >= GAME_WIDTH - PADDLE_WIDTH &&
        newBall.y >= prev.aiPaddle.y &&
        newBall.y <= prev.aiPaddle.y + PADDLE_HEIGHT &&
        newBall.vx > 0
      ) {
        newBall.vx = -newBall.vx;
        newBall.x = GAME_WIDTH - PADDLE_WIDTH - BALL_SIZE;
        // Add some spin based on where it hits the paddle
        const hitPos = (newBall.y - prev.aiPaddle.y) / PADDLE_HEIGHT;
        newBall.vy = (hitPos - 0.5) * 8;
      }

      let newPlayerScore = prev.playerScore;
      let newAiScore = prev.aiScore;
      let isGameOver = false;
      let winner: 'player' | 'ai' | null = null;

      // Ball goes off left side (AI scores)
      if (newBall.x < 0) {
        newAiScore++;
        newBall = resetBall();
        toast.success("AI scores!");
        
        if (newAiScore >= 5) {
          isGameOver = true;
          winner = 'ai';
          toast.error("AI wins! Better luck next time!");
        }
      }

      // Ball goes off right side (Player scores)
      if (newBall.x > GAME_WIDTH) {
        newPlayerScore++;
        newBall = resetBall();
        toast.success("You scored!");
        
        if (newPlayerScore >= 5) {
          isGameOver = true;
          winner = 'player';
          toast.success("🎉 You win! 🎉");
        }
      }

      // Update AI paddle
      const newAiPaddle = updateAI(newBall, prev.aiPaddle);

      return {
        ...prev,
        ball: newBall,
        aiPaddle: newAiPaddle,
        playerScore: newPlayerScore,
        aiScore: newAiScore,
        isGameOver,
        winner,
      };
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState.isGameStarted, gameState.isGameOver, resetBall, updateAI]);

  useEffect(() => {
    if (gameState.isGameStarted && !gameState.isGameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isGameStarted, gameState.isGameOver, gameLoop]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current || !gameState.isGameStarted) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const paddleY = Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, mouseY - PADDLE_HEIGHT / 2));
      
      setGameState(prev => ({
        ...prev,
        playerPaddle: { y: paddleY }
      }));
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!gameState.isGameStarted) {
          setGameState(prev => ({ ...prev, isGameStarted: true }));
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameState.isGameStarted]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleStart = () => {
    setGameState(prev => ({ ...prev, isGameStarted: true }));
  };

  const handleRestart = () => {
    resetGame();
    onRestart();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      {/* Game Status */}
      <div className="flex items-center gap-6">
        <Badge variant="outline" className="text-lg px-4 py-2 bg-gradient-primary text-white">
          You: {gameState.playerScore}
        </Badge>
        <Badge variant="outline" className="text-lg px-4 py-2">
          First to 5 wins!
        </Badge>
        <Badge variant="outline" className="text-lg px-4 py-2 bg-gradient-secondary text-white">
          AI: {gameState.aiScore}
        </Badge>
      </div>

      {/* Game Area */}
      <div className="relative border-2 border-primary/30 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="block bg-black cursor-none"
        />
        
        <svg 
          width={GAME_WIDTH} 
          height={GAME_HEIGHT} 
          className="absolute inset-0 pointer-events-none"
        >
          {/* Center Line */}
          <line
            x1={GAME_WIDTH / 2}
            y1={0}
            x2={GAME_WIDTH / 2}
            y2={GAME_HEIGHT}
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="10,10"
            opacity="0.5"
          />
          
          {/* Player Paddle */}
          <rect
            x={0}
            y={gameState.playerPaddle.y}
            width={PADDLE_WIDTH}
            height={PADDLE_HEIGHT}
            fill="url(#playerGradient)"
          />
          
          {/* AI Paddle */}
          <rect
            x={GAME_WIDTH - PADDLE_WIDTH}
            y={gameState.aiPaddle.y}
            width={PADDLE_WIDTH}
            height={PADDLE_HEIGHT}
            fill="url(#aiGradient)"
          />
          
          {/* Ball */}
          <circle
            cx={gameState.ball.x}
            cy={gameState.ball.y}
            r={BALL_SIZE}
            fill="url(#ballGradient)"
            className="animate-pulse"
          />

          <defs>
            <linearGradient id="playerGradient">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="aiGradient">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
            <linearGradient id="ballGradient">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>

        {/* Game Overlay */}
        {(!gameState.isGameStarted || gameState.isGameOver) && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-center space-y-4">
              {!gameState.isGameStarted ? (
                <>
                  <h3 className="text-2xl font-bold text-white">Pong</h3>
                  <p className="text-white/80">Move mouse to control your paddle</p>
                  <p className="text-white/80">First to 5 points wins!</p>
                </>
              ) : gameState.winner === 'player' ? (
                <>
                  <h3 className="text-2xl font-bold text-green-400">🎉 You Win! 🎉</h3>
                  <p className="text-white/80">Final Score: {gameState.playerScore} - {gameState.aiScore}</p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-red-400">AI Wins!</h3>
                  <p className="text-white/80">Final Score: {gameState.playerScore} - {gameState.aiScore}</p>
                </>
              )}
              <Button variant="gaming" onClick={!gameState.isGameStarted ? handleStart : handleRestart}>
                {!gameState.isGameStarted ? "Start Game" : "Play Again"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground">
        Move your mouse up and down to control your paddle. Beat the AI to 5 points!
      </div>
    </div>
  );
};