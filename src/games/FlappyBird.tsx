import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const GAME_HEIGHT = 400;
const GAME_WIDTH = 600;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 60;
const PIPE_GAP = 120;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const PIPE_SPEED = 3;

interface Bird {
  y: number;
  velocity: number;
}

interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  passed: boolean;
}

export const FlappyBird = ({ onRestart }: { onRestart: () => void }) => {
  const [bird, setBird] = useState<Bird>({ y: GAME_HEIGHT / 2, velocity: 0 });
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('flappy-bird-high-score') || '0');
  });
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const gameLoopRef = useRef<number>();

  const createPipe = (x: number): Pipe => {
    const topHeight = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50;
    return {
      x,
      topHeight,
      bottomY: topHeight + PIPE_GAP,
      passed: false
    };
  };

  const resetGame = useCallback(() => {
    setBird({ y: GAME_HEIGHT / 2, velocity: 0 });
    setPipes([createPipe(GAME_WIDTH)]);
    setScore(0);
    setIsGameStarted(false);
    setIsGameOver(false);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  }, []);

  const jump = useCallback(() => {
    if (!isGameStarted) {
      setIsGameStarted(true);
      return;
    }
    if (isGameOver) {
      resetGame();
      return;
    }
    setBird(prev => ({ ...prev, velocity: JUMP_FORCE }));
  }, [isGameStarted, isGameOver, resetGame]);

  const checkCollision = useCallback((bird: Bird, pipes: Pipe[]): boolean => {
    // Ground and ceiling collision
    if (bird.y <= 0 || bird.y >= GAME_HEIGHT - BIRD_SIZE) {
      return true;
    }

    // Pipe collision
    for (const pipe of pipes) {
      if (
        bird.y + BIRD_SIZE / 2 >= GAME_WIDTH / 2 - BIRD_SIZE / 2 &&
        bird.y + BIRD_SIZE / 2 <= GAME_WIDTH / 2 + BIRD_SIZE / 2 &&
        pipe.x <= GAME_WIDTH / 2 + BIRD_SIZE / 2 &&
        pipe.x + PIPE_WIDTH >= GAME_WIDTH / 2 - BIRD_SIZE / 2
      ) {
        if (bird.y <= pipe.topHeight || bird.y + BIRD_SIZE >= pipe.bottomY) {
          return true;
        }
      }
    }
    return false;
  }, []);

  const gameLoop = useCallback(() => {
    if (!isGameStarted || isGameOver) return;

    setBird(prev => ({
      ...prev,
      y: prev.y + prev.velocity,
      velocity: prev.velocity + GRAVITY
    }));

    setPipes(prev => {
      const newPipes = prev.map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }));
      
      // Add new pipe
      if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < GAME_WIDTH - 200) {
        newPipes.push(createPipe(GAME_WIDTH));
      }

      // Remove off-screen pipes and update score
      return newPipes.filter(pipe => {
        if (pipe.x + PIPE_WIDTH < 0) {
          if (!pipe.passed) {
            setScore(prev => {
              const newScore = prev + 1;
              if (newScore > highScore) {
                setHighScore(newScore);
                localStorage.setItem('flappy-bird-high-score', newScore.toString());
                toast.success("New high score!");
              }
              return newScore;
            });
          }
          return false;
        }
        
        // Mark pipe as passed
        if (!pipe.passed && pipe.x + PIPE_WIDTH < GAME_WIDTH / 2) {
          pipe.passed = true;
        }
        
        return true;
      });
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [isGameStarted, isGameOver, highScore]);

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

  useEffect(() => {
    if (checkCollision(bird, pipes)) {
      setIsGameOver(true);
      toast.error("Game Over!");
    }
  }, [bird, pipes, checkCollision]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
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
      </div>

      {/* Game Area */}
      <div className="relative border-2 border-primary/30 rounded-lg overflow-hidden bg-gradient-to-b from-cyan-400 to-blue-600">
        <svg width={GAME_WIDTH} height={GAME_HEIGHT} className="block">
          {/* Background */}
          <rect width={GAME_WIDTH} height={GAME_HEIGHT} fill="url(#skyGradient)" />
          
          {/* Pipes */}
          {pipes.map((pipe, index) => (
            <g key={index}>
              {/* Top pipe */}
              <rect
                x={pipe.x}
                y={0}
                width={PIPE_WIDTH}
                height={pipe.topHeight}
                fill="url(#pipeGradient)"
                stroke="#2d5016"
                strokeWidth="2"
              />
              {/* Bottom pipe */}
              <rect
                x={pipe.x}
                y={pipe.bottomY}
                width={PIPE_WIDTH}
                height={GAME_HEIGHT - pipe.bottomY}
                fill="url(#pipeGradient)"
                stroke="#2d5016"
                strokeWidth="2"
              />
            </g>
          ))}
          
          {/* Bird */}
          <circle
            cx={GAME_WIDTH / 2}
            cy={bird.y}
            r={BIRD_SIZE / 2}
            fill="url(#birdGradient)"
            stroke="#f59e0b"
            strokeWidth="2"
          />
          
          {/* Ground */}
          <rect
            x={0}
            y={GAME_HEIGHT - 10}
            width={GAME_WIDTH}
            height={10}
            fill="url(#groundGradient)"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#87CEEB" />
              <stop offset="100%" stopColor="#4682B4" />
            </linearGradient>
            <linearGradient id="pipeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <linearGradient id="birdGradient">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="groundGradient">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>

        {/* Game Overlay */}
        {(!isGameStarted || isGameOver) && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center space-y-4">
              {!isGameStarted ? (
                <>
                  <h3 className="text-2xl font-bold text-white">Flappy Bird</h3>
                  <p className="text-white/80">Click or press Space to start!</p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-red-400">Game Over!</h3>
                  <p className="text-white/80">Score: {score}</p>
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
        <div className="flex gap-2">
          <Button variant="neon" onClick={jump} disabled={!isGameStarted || isGameOver}>
            Jump
          </Button>
          <Button variant="gaming" onClick={handleRestart}>
            Restart
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Click Jump button or press Spacebar to fly
        </p>
      </div>
    </div>
  );
};