import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const GAME_WIDTH = 300;
const GAME_HEIGHT = 600;
const GRID_SIZE = 30;
const BOARD_WIDTH = GAME_WIDTH / GRID_SIZE;
const BOARD_HEIGHT = GAME_HEIGHT / GRID_SIZE;

type Piece = number[][];

const PIECES: Piece[] = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]], // Z
  [[1, 0, 0], [1, 1, 1]], // J
  [[0, 0, 1], [1, 1, 1]], // L
];

const COLORS = [
  '#00f0f0', // I - cyan
  '#f0f000', // O - yellow
  '#a000f0', // T - purple
  '#00f000', // S - green
  '#f00000', // Z - red
  '#0000f0', // J - blue
  '#f0a000', // L - orange
];

interface GameState {
  board: number[][];
  currentPiece: Piece;
  currentColor: number;
  currentX: number;
  currentY: number;
  score: number;
  lines: number;
  level: number;
  isGameOver: boolean;
}

export const Tetris = ({ onRestart }: { onRestart: () => void }) => {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)),
    currentPiece: PIECES[0],
    currentColor: 0,
    currentX: Math.floor(BOARD_WIDTH / 2) - 1,
    currentY: 0,
    score: 0,
    lines: 0,
    level: 1,
    isGameOver: false,
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const rotatePiece = (piece: Piece): Piece => {
    const rotated = piece[0].map((_, i) => piece.map(row => row[i]).reverse());
    return rotated;
  };

  const isValidPosition = useCallback((board: number[][], piece: Piece, x: number, y: number): boolean => {
    for (let py = 0; py < piece.length; py++) {
      for (let px = 0; px < piece[py].length; px++) {
        if (piece[py][px]) {
          const newX = x + px;
          const newY = y + py;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          
          if (newY >= 0 && board[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const placePiece = useCallback((board: number[][], piece: Piece, x: number, y: number, color: number): number[][] => {
    const newBoard = board.map(row => [...row]);
    for (let py = 0; py < piece.length; py++) {
      for (let px = 0; px < piece[py].length; px++) {
        if (piece[py][px]) {
          const newX = x + px;
          const newY = y + py;
          if (newY >= 0) {
            newBoard[newY][newX] = color + 1;
          }
        }
      }
    }
    return newBoard;
  }, []);

  const clearLines = useCallback((board: number[][]): { newBoard: number[][]; linesCleared: number } => {
    let linesCleared = 0;
    const newBoard = board.filter(row => {
      if (row.every(cell => cell !== 0)) {
        linesCleared++;
        return false;
      }
      return true;
    });

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }

    return { newBoard, linesCleared };
  }, []);

  const spawnNewPiece = useCallback(() => {
    const pieceIndex = Math.floor(Math.random() * PIECES.length);
    return {
      piece: PIECES[pieceIndex],
      color: pieceIndex,
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0,
    };
  }, []);

  const moveDown = useCallback(() => {
    setGameState(prev => {
      if (prev.isGameOver || !isPlaying || isPaused) return prev;

      const newY = prev.currentY + 1;
      
      if (isValidPosition(prev.board, prev.currentPiece, prev.currentX, newY)) {
        return { ...prev, currentY: newY };
      } else {
        // Piece has landed
        const newBoard = placePiece(prev.board, prev.currentPiece, prev.currentX, prev.currentY, prev.currentColor);
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
        
        const newPiece = spawnNewPiece();
        
        // Check game over
        if (!isValidPosition(clearedBoard, newPiece.piece, newPiece.x, newPiece.y)) {
          toast.error("Game Over!");
          return { ...prev, isGameOver: true, board: clearedBoard };
        }

        const scoreGain = linesCleared * 100 * prev.level;
        const newLines = prev.lines + linesCleared;
        const newLevel = Math.floor(newLines / 10) + 1;

        if (linesCleared > 0) {
          toast.success(`${linesCleared} line${linesCleared > 1 ? 's' : ''} cleared! +${scoreGain} points`);
        }

        return {
          ...prev,
          board: clearedBoard,
          currentPiece: newPiece.piece,
          currentColor: newPiece.color,
          currentX: newPiece.x,
          currentY: newPiece.y,
          score: prev.score + scoreGain,
          lines: newLines,
          level: newLevel,
        };
      }
    });
  }, [isValidPosition, placePiece, clearLines, spawnNewPiece, isPlaying, isPaused]);

  const movePiece = useCallback((dx: number, dy: number) => {
    setGameState(prev => {
      if (prev.isGameOver || !isPlaying || isPaused) return prev;

      const newX = prev.currentX + dx;
      const newY = prev.currentY + dy;
      
      if (isValidPosition(prev.board, prev.currentPiece, newX, newY)) {
        return { ...prev, currentX: newX, currentY: newY };
      }
      
      return prev;
    });
  }, [isValidPosition, isPlaying, isPaused]);

  const rotatePieceAction = useCallback(() => {
    setGameState(prev => {
      if (prev.isGameOver || !isPlaying || isPaused) return prev;

      const rotated = rotatePiece(prev.currentPiece);
      
      if (isValidPosition(prev.board, rotated, prev.currentX, prev.currentY)) {
        return { ...prev, currentPiece: rotated };
      }
      
      return prev;
    });
  }, [rotatePiece, isValidPosition, isPlaying, isPaused]);

  const gameLoop = useCallback((timestamp: number) => {
    if (!isPlaying || isPaused || gameState.isGameOver) return;

    const dropTime = Math.max(50, 1000 - (gameState.level - 1) * 100);
    
    if (timestamp - lastTimeRef.current > dropTime) {
      moveDown();
      lastTimeRef.current = timestamp;
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, isPaused, gameState.isGameOver, gameState.level, moveDown]);

  useEffect(() => {
    if (isPlaying && !isPaused && !gameState.isGameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, isPaused, gameState.isGameOver, gameLoop]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || isPaused || gameState.isGameOver) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          e.preventDefault();
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          rotatePieceAction();
          break;
        case ' ':
          e.preventDefault();
          // Hard drop
          while (isValidPosition(gameState.board, gameState.currentPiece, gameState.currentX, gameState.currentY + 1)) {
            movePiece(0, 1);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePiece, rotatePieceAction, isPlaying, isPaused, gameState, isValidPosition]);

  const startGame = () => {
    const newPiece = spawnNewPiece();
    setGameState({
      board: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)),
      currentPiece: newPiece.piece,
      currentColor: newPiece.color,
      currentX: newPiece.x,
      currentY: newPiece.y,
      score: 0,
      lines: 0,
      level: 1,
      isGameOver: false,
    });
    setIsPlaying(true);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const resetGame = () => {
    setIsPlaying(false);
    setIsPaused(false);
    onRestart();
  };

  const renderBoard = () => {
    const displayBoard = gameState.board.map(row => [...row]);
    
    // Add current piece to display board
    if (isPlaying && !gameState.isGameOver) {
      for (let py = 0; py < gameState.currentPiece.length; py++) {
        for (let px = 0; px < gameState.currentPiece[py].length; px++) {
          if (gameState.currentPiece[py][px]) {
            const x = gameState.currentX + px;
            const y = gameState.currentY + py;
            if (x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT) {
              displayBoard[y][x] = gameState.currentColor + 1;
            }
          }
        }
      }
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={x}
            className="w-6 h-6 border border-gray-600"
            style={{
              backgroundColor: cell ? COLORS[cell - 1] : '#000',
            }}
          />
        ))}
      </div>
    ));
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      {/* Game Status */}
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="text-sm px-3 py-1">
          Score: {gameState.score}
        </Badge>
        <Badge variant="outline" className="text-sm px-3 py-1">
          Lines: {gameState.lines}
        </Badge>
        <Badge variant="outline" className="text-sm px-3 py-1 bg-gradient-primary text-white">
          Level: {gameState.level}
        </Badge>
      </div>

      {/* Game Area */}
      <div className="relative border-2 border-primary/30 rounded-lg overflow-hidden bg-black">
        <div className="p-2">
          {renderBoard()}
        </div>

        {/* Game Overlay */}
        {(!isPlaying || gameState.isGameOver || isPaused) && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-center space-y-4">
              {!isPlaying ? (
                <>
                  <h3 className="text-2xl font-bold text-white">Tetris</h3>
                  <p className="text-white/80">Use arrow keys to control</p>
                </>
              ) : isPaused ? (
                <h3 className="text-2xl font-bold text-yellow-400">Paused</h3>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-red-400">Game Over!</h3>
                  <p className="text-white/80">Final Score: {gameState.score}</p>
                </>
              )}
              <div className="space-x-2">
                {!isPlaying ? (
                  <Button variant="gaming" onClick={startGame}>
                    Start Game
                  </Button>
                ) : isPaused ? (
                  <Button variant="gaming" onClick={togglePause}>
                    Resume
                  </Button>
                ) : (
                  <Button variant="gaming" onClick={startGame}>
                    Play Again
                  </Button>
                )}
                <Button variant="neon" onClick={resetGame}>
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-2 max-w-48">
        <div></div>
        <Button variant="neon" size="sm" onClick={rotatePieceAction} disabled={!isPlaying || isPaused}>
          ↻
        </Button>
        <div></div>
        <Button variant="neon" size="sm" onClick={() => movePiece(-1, 0)} disabled={!isPlaying || isPaused}>
          ←
        </Button>
        <Button variant="gaming" size="sm" onClick={togglePause} disabled={!isPlaying || gameState.isGameOver}>
          {isPaused ? "Resume" : "Pause"}
        </Button>
        <Button variant="neon" size="sm" onClick={() => movePiece(1, 0)} disabled={!isPlaying || isPaused}>
          →
        </Button>
        <div></div>
        <Button variant="neon" size="sm" onClick={() => movePiece(0, 1)} disabled={!isPlaying || isPaused}>
          ↓
        </Button>
        <div></div>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground max-w-md">
        Use arrow keys: ← → to move, ↑ to rotate, ↓ to drop faster, Space for hard drop
      </div>
    </div>
  );
};