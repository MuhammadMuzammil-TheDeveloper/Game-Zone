import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CARD_VALUES = ['🎮', '🕹️', '👾', '🎯', '🏆', '⭐', '💎', '🔥'];

export const Memory = ({ onRestart }: { onRestart: () => void }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);

  const initializeGame = () => {
    const shuffledCards = [...CARD_VALUES, ...CARD_VALUES]
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsGameComplete(false);
    setTimeElapsed(0);
    setIsGameStarted(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameStarted && !isGameComplete) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameStarted, isGameComplete]);

  useEffect(() => {
    if (matches === CARD_VALUES.length) {
      setIsGameComplete(true);
      toast.success(`Congratulations! Completed in ${moves} moves and ${timeElapsed} seconds!`);
    }
  }, [matches, moves, timeElapsed]);

  const handleCardClick = (cardId: number) => {
    if (!isGameStarted) setIsGameStarted(true);
    
    if (flippedCards.length === 2 || cards[cardId].isFlipped || cards[cardId].isMatched) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    setCards(prevCards => 
      prevCards.map(card => 
        card.id === cardId ? { ...card, isFlipped: true } : card
      )
    );

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstCard, secondCard] = newFlippedCards.map(id => cards[id]);
      
      if (firstCard.value === secondCard.value) {
        // Match found
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(card => 
              newFlippedCards.includes(card.id) 
                ? { ...card, isMatched: true } 
                : card
            )
          );
          setMatches(prev => prev + 1);
          setFlippedCards([]);
          toast.success("Match found!");
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(card => 
              newFlippedCards.includes(card.id) 
                ? { ...card, isFlipped: false } 
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    initializeGame();
    onRestart();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      {/* Game Status */}
      <div className="flex items-center gap-6">
        <Badge variant="outline" className="text-lg px-4 py-2">
          Moves: {moves}
        </Badge>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Matches: {matches}/{CARD_VALUES.length}
        </Badge>
        <Badge variant="outline" className="text-lg px-4 py-2 bg-gradient-primary text-white">
          Time: {formatTime(timeElapsed)}
        </Badge>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-4 gap-3 p-6 bg-gradient-card rounded-lg border border-border/50">
        {cards.map((card) => (
          <Button
            key={card.id}
            variant="neon"
            className={`w-16 h-16 text-2xl font-bold transition-all duration-300 ${
              card.isFlipped || card.isMatched 
                ? 'bg-gradient-primary text-white shadow-neon' 
                : 'bg-muted hover:bg-muted/80'
            } ${card.isMatched ? 'animate-pulse' : ''}`}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isFlipped || card.isMatched || flippedCards.length === 2}
          >
            {card.isFlipped || card.isMatched ? card.value : '?'}
          </Button>
        ))}
      </div>

      {/* Game Complete Screen */}
      {isGameComplete && (
        <div className="text-center space-y-4 p-6 bg-gradient-card rounded-lg border border-primary/50">
          <h3 className="text-2xl font-bold text-primary">🎉 Congratulations! 🎉</h3>
          <div className="space-y-2">
            <p className="text-muted-foreground">Game completed in:</p>
            <div className="flex justify-center gap-4">
              <Badge variant="outline" className="text-lg px-4 py-2">
                {moves} moves
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {formatTime(timeElapsed)}
              </Badge>
            </div>
          </div>
          <Button variant="gaming" onClick={resetGame}>
            Play Again
          </Button>
        </div>
      )}

      {/* Instructions */}
      {!isGameStarted && !isGameComplete && (
        <div className="text-center text-sm text-muted-foreground max-w-md">
          Click on cards to flip them and find matching pairs. Try to complete the game with the fewest moves!
        </div>
      )}
    </div>
  );
};