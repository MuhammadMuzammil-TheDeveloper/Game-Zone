import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const BOARD_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };

export const Snake = ({ onRestart }: { onRestart: () => void }) => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snake-high-score') || '0');
  });
  const [isPlaying, setIsPlaying] = useState(false);

  const generateFood = useCallback((snakeBody: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE)
      };
    } while (snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const moveSnake = useCallback(() => {
    if (isGameOver || !isPlaying) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        setIsGameOver(true);
        setIsPlaying(false);
        toast.error("Game Over! Hit the wall!");
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setIsGameOver(true);
        setIsPlaying(false);
        toast.error("Game Over! Hit yourself!");
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => {
          const newScore = prev + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snake-high-score', newScore.toString());
            toast.success("New High Score!");
          }
          return newScore;
        });
        setFood(generateFood(newSnake));
        toast.success("+10 points!");
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, isGameOver, isPlaying, generateFood, highScore]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, 150);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setDirection(prev => prev !== 'DOWN' ? 'UP' : prev);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setDirection(prev => prev !== 'UP' ? 'DOWN' : prev);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setDirection(prev => prev !== 'RIGHT' ? 'LEFT' : prev);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setDirection(prev => prev !== 'LEFT' ? 'RIGHT' : prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  const startGame = () => {
    setIsPlaying(true);
    setIsGameOver(false);
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection('RIGHT');
    setIsGameOver(false);
    setScore(0);
    setIsPlaying(false);
    onRestart();
  };

  const renderCell = (x: number, y: number) => {
    const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
    const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
    const isFood = food.x === x && food.y === y;

    let cellClass = "w-4 h-4 border border-border/20 ";
    
    if (isSnakeHead) {
      cellClass += "bg-gradient-primary shadow-neon rounded-sm";
    } else if (isSnakeBody) {
      cellClass += "bg-primary/80 rounded-sm";
    } else if (isFood) {
      cellClass += "bg-secondary shadow-cyan rounded-full animate-pulse";
    } else {
      cellClass += "bg-muted/10";
    }

    return <div key={`${x}-${y}`} className={cellClass} />;
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

      {/* Game Board */}
      <div className="relative">
        <div 
          className="grid gap-0 p-4 bg-gradient-card rounded-lg border border-border/50"
          style={{ 
            gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`
          }}
        >
          {Array.from({ length: BOARD_SIZE }, (_, y) =>
            Array.from({ length: BOARD_SIZE }, (_, x) => renderCell(x, y))
          )}
        </div>
        
        {(!isPlaying || isGameOver) && (
          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-4">
              {isGameOver ? (
                <>
                  <h3 className="text-2xl font-bold text-red-400">Game Over!</h3>
                  <p className="text-muted-foreground">Final Score: {score}</p>
                </>
              ) : (
                <h3 className="text-2xl font-bold">Ready to Play?</h3>
              )}
              <div className="space-x-2">
                {!isPlaying && !isGameOver && (
                  <Button variant="gaming" onClick={startGame}>
                    Start Game
                  </Button>
                )}
                {isGameOver && (
                  <Button variant="gaming" onClick={resetGame}>
                    Play Again
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground">
        {isPlaying ? "Use arrow keys to control the snake" : "Click Start Game and use arrow keys to move"}
      </div>
    </div>
  );
};