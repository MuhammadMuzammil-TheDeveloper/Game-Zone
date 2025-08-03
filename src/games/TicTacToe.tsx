import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Player = 'X' | 'O';
type Board = (Player | null)[];

export const TicTacToe = ({ onRestart }: { onRestart: () => void }) => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  const checkWinner = (board: Board): Player | 'draw' | null => {
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a] as Player;
      }
    }
    
    if (board.every(cell => cell !== null)) {
      return 'draw';
    }
    
    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameResult = checkWinner(newBoard);
    if (gameResult) {
      setWinner(gameResult);
      const newScores = { ...scores };
      if (gameResult === 'draw') {
        newScores.draws++;
        toast("It's a draw!");
      } else {
        newScores[gameResult]++;
        toast(`Player ${gameResult} wins!`);
      }
      setScores(newScores);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    onRestart();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      {/* Game Status */}
      <div className="text-center space-y-2">
        {winner ? (
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">
              {winner === 'draw' ? "It's a Draw!" : `Player ${winner} Wins!`}
            </h3>
            <Button variant="gaming" onClick={resetGame}>
              Play Again
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Current Player:</h3>
            <Badge variant="outline" className="text-lg px-4 py-2 bg-gradient-primary text-white">
              Player {currentPlayer}
            </Badge>
          </div>
        )}
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-2 bg-muted/20 p-4 rounded-lg">
        {board.map((cell, index) => (
          <Button
            key={index}
            variant="neon"
            className="w-20 h-20 text-2xl font-bold hover:scale-105 transition-transform"
            onClick={() => handleCellClick(index)}
            disabled={!!cell || !!winner}
          >
            {cell}
          </Button>
        ))}
      </div>

      {/* Scoreboard */}
      <div className="flex gap-4 text-center">
        <div className="bg-gradient-card p-3 rounded-lg border border-border/50">
          <div className="text-sm text-muted-foreground">Player X</div>
          <div className="text-xl font-bold text-primary">{scores.X}</div>
        </div>
        <div className="bg-gradient-card p-3 rounded-lg border border-border/50">
          <div className="text-sm text-muted-foreground">Draws</div>
          <div className="text-xl font-bold text-accent">{scores.draws}</div>
        </div>
        <div className="bg-gradient-card p-3 rounded-lg border border-border/50">
          <div className="text-sm text-muted-foreground">Player O</div>
          <div className="text-xl font-bold text-secondary">{scores.O}</div>
        </div>
      </div>
    </div>
  );
};