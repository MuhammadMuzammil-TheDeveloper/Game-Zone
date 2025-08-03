import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Board = number[][];

const BOARD_SIZE = 4;
const INITIAL_BOARD = () => Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));

export const Game2048 = ({ onRestart }: { onRestart: () => void }) => {
  const [board, setBoard] = useState<Board>(INITIAL_BOARD);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem('2048-best-score') || '0');
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const addRandomTile = useCallback((currentBoard: Board) => {
    const emptyCells: [number, number][] = [];
    
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (currentBoard[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }
    
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const newBoard = currentBoard.map(row => [...row]);
      newBoard[row][col] = Math.random() < 0.9 ? 2 : 4;
      return newBoard;
    }
    
    return currentBoard;
  }, []);

  const initializeGame = useCallback(() => {
    let newBoard = INITIAL_BOARD();
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setIsGameOver(false);
    setHasWon(false);
  }, [addRandomTile]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const moveLeft = (board: Board): [Board, number] => {
    let newScore = 0;
    const newBoard = board.map(row => {
      const filteredRow = row.filter(cell => cell !== 0);
      const mergedRow: number[] = [];
      
      for (let i = 0; i < filteredRow.length; i++) {
        if (i < filteredRow.length - 1 && filteredRow[i] === filteredRow[i + 1]) {
          const mergedValue = filteredRow[i] * 2;
          mergedRow.push(mergedValue);
          newScore += mergedValue;
          
          if (mergedValue === 2048 && !hasWon) {
            setHasWon(true);
            toast.success("🎉 You reached 2048! 🎉");
          }
          
          i++; // Skip the next element as it's been merged
        } else {
          mergedRow.push(filteredRow[i]);
        }
      }
      
      while (mergedRow.length < BOARD_SIZE) {
        mergedRow.push(0);
      }
      
      return mergedRow;
    });
    
    return [newBoard, newScore];
  };

  const rotateBoard = (board: Board): Board => {
    const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        newBoard[j][BOARD_SIZE - 1 - i] = board[i][j];
      }
    }
    return newBoard;
  };

  const boardsEqual = (board1: Board, board2: Board): boolean => {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board1[i][j] !== board2[i][j]) {
          return false;
        }
      }
    }
    return true;
  };

  const checkGameOver = (board: Board): boolean => {
    // Check for empty cells
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] === 0) return false;
      }
    }
    
    // Check for possible merges
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (
          (i < BOARD_SIZE - 1 && board[i][j] === board[i + 1][j]) ||
          (j < BOARD_SIZE - 1 && board[i][j] === board[i][j + 1])
        ) {
          return false;
        }
      }
    }
    
    return true;
  };

  const makeMove = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (isGameOver) return;
    
    let rotations = 0;
    if (direction === 'up') rotations = 3;
    else if (direction === 'right') rotations = 2;
    else if (direction === 'down') rotations = 1;
    
    let currentBoard = board;
    for (let i = 0; i < rotations; i++) {
      currentBoard = rotateBoard(currentBoard);
    }
    
    const [movedBoard, scoreGained] = moveLeft(currentBoard);
    
    for (let i = 0; i < (4 - rotations) % 4; i++) {
      currentBoard = rotateBoard(movedBoard);
    }
    
    if (!boardsEqual(board, currentBoard)) {
      const newBoard = addRandomTile(currentBoard);
      setBoard(newBoard);
      
      const newScore = score + scoreGained;
      setScore(newScore);
      
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('2048-best-score', newScore.toString());
        toast.success("New best score!");
      }
      
      if (checkGameOver(newBoard)) {
        setIsGameOver(true);
        toast.error("Game Over!");
      }
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          makeMove('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          makeMove('right');
          break;
        case 'ArrowUp':
          e.preventDefault();
          makeMove('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          makeMove('down');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [board, isGameOver, score, bestScore, hasWon]);

  const resetGame = () => {
    initializeGame();
    onRestart();
  };

  const getTileColor = (value: number) => {
    const colors: { [key: number]: string } = {
      2: 'bg-slate-200 text-slate-800',
      4: 'bg-slate-300 text-slate-800',
      8: 'bg-orange-300 text-white',
      16: 'bg-orange-400 text-white',
      32: 'bg-orange-500 text-white',
      64: 'bg-red-400 text-white',
      128: 'bg-gradient-primary text-white shadow-neon',
      256: 'bg-gradient-secondary text-white shadow-cyan',
      512: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-neon',
      1024: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-neon animate-pulse',
      2048: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-neon animate-glow-pulse'
    };
    
    return colors[value] || 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-neon animate-glow-pulse';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      {/* Game Status */}
      <div className="flex items-center gap-6">
        <Badge variant="outline" className="text-lg px-4 py-2">
          Score: {score}
        </Badge>
        <Badge variant="outline" className="text-lg px-4 py-2 bg-gradient-secondary text-white">
          Best: {bestScore}
        </Badge>
        {hasWon && (
          <Badge variant="outline" className="text-lg px-4 py-2 bg-gradient-primary text-white animate-pulse">
            🏆 Winner!
          </Badge>
        )}
      </div>

      {/* Game Board */}
      <div className="relative">
        <div className="grid grid-cols-4 gap-2 p-4 bg-gradient-card rounded-lg border border-border/50">
          {board.map((row, i) =>
            row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-lg transition-all duration-200 ${
                  cell === 0 
                    ? 'bg-muted/20' 
                    : getTileColor(cell)
                }`}
              >
                {cell !== 0 && cell}
              </div>
            ))
          )}
        </div>
        
        {isGameOver && (
          <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-red-400">Game Over!</h3>
              <p className="text-muted-foreground">Final Score: {score}</p>
              <Button variant="gaming" onClick={resetGame}>
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-2 max-w-48">
        <div></div>
        <Button variant="neon" size="sm" onClick={() => makeMove('up')}>↑</Button>
        <div></div>
        <Button variant="neon" size="sm" onClick={() => makeMove('left')}>←</Button>
        <Button variant="gaming" size="sm" onClick={resetGame}>Reset</Button>
        <Button variant="neon" size="sm" onClick={() => makeMove('right')}>→</Button>
        <div></div>
        <Button variant="neon" size="sm" onClick={() => makeMove('down')}>↓</Button>
        <div></div>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground max-w-md">
        Use arrow keys or buttons to move tiles. Combine tiles with the same number to reach 2048!
      </div>
    </div>
  );
};