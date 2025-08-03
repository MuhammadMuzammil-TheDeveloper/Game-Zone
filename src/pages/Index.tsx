import { useState } from "react";
import { Header } from "@/components/Header";
import { GameCard } from "@/components/GameCard";
import { GameModal } from "@/components/GameModal";
import { TicTacToe } from "@/games/TicTacToe";
import { Snake } from "@/games/Snake";
import { Memory } from "@/games/Memory";
import { Game2048 } from "@/games/Game2048";
import { FlappyBird } from "@/games/FlappyBird";
import { Breakout } from "@/games/Breakout";
import { Tetris } from "@/games/Tetris";
import { Pong } from "@/games/Pong";
import { DinoRunner } from "@/games/DinoRunner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Users, Star } from "lucide-react";

// Import game images
import ticTacToeImage from "@/assets/tic-tac-toe.jpg";
import snakeImage from "@/assets/snake.jpg";
import game2048Image from "@/assets/2048.jpg";
import memoryImage from "@/assets/memory.jpg";
import flappyBirdImage from "@/assets/flappy-bird.jpg";
import breakoutImage from "@/assets/breakout.jpg";
import tetrisImage from "@/assets/tetris.jpg";
import pongImage from "@/assets/pong.jpg";
import dinoRunnerImage from "@/assets/dino-runner.jpg";

interface Game {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  isPopular?: boolean;
  component: React.ComponentType<{ onRestart: () => void }>;
}

const games: Game[] = [
  {
    id: "tic-tac-toe",
    title: "Tic Tac Toe",
    description: "Classic strategy game for two players. Get three in a row to win!",
    image: ticTacToeImage,
    category: "Strategy",
    difficulty: "Easy",
    isPopular: true,
    component: TicTacToe,
  },
  {
    id: "snake",
    title: "Snake Game",
    description: "Control the snake to eat food and grow longer. Don't hit the walls!",
    image: snakeImage,
    category: "Arcade",
    difficulty: "Medium",
    isPopular: true,
    component: Snake,
  },
  {
    id: "tetris",
    title: "Tetris",
    description: "Classic block puzzle game. Clear lines by filling rows completely!",
    image: tetrisImage,
    category: "Puzzle",
    difficulty: "Hard",
    isPopular: true,
    component: Tetris,
  },
  {
    id: "flappy-bird",
    title: "Flappy Bird",
    description: "Navigate the bird through pipes. Don't crash into obstacles!",
    image: flappyBirdImage,
    category: "Arcade",
    difficulty: "Hard",
    isPopular: true,
    component: FlappyBird,
  },
  {
    id: "breakout",
    title: "Breakout",
    description: "Break all the bricks with the ball. Don't let it fall!",
    image: breakoutImage,
    category: "Arcade",
    difficulty: "Medium",
    component: Breakout,
  },
  {
    id: "pong",
    title: "Pong",
    description: "Classic tennis game. Beat the AI paddle to 5 points!",
    image: pongImage,
    category: "Classic",
    difficulty: "Easy",
    component: Pong,
  },
  {
    id: "dino-runner",
    title: "Dino Runner",
    description: "Jump over cacti in this endless runner. How far can you go?",
    image: dinoRunnerImage,
    category: "Arcade",
    difficulty: "Medium",
    isPopular: true,
    component: DinoRunner,
  },
  {
    id: "2048",
    title: "2048 Puzzle",
    description: "Combine numbered tiles to reach 2048. A challenging math puzzle!",
    image: game2048Image,
    category: "Puzzle",
    difficulty: "Hard",
    component: Game2048,
  },
  {
    id: "memory",
    title: "Memory Match",
    description: "Flip cards to find matching pairs. Train your memory skills!",
    image: memoryImage,
    category: "Memory",
    difficulty: "Medium",
    component: Memory,
  },
];

const Index = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameKey, setGameKey] = useState(0);

  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
    setGameKey(prev => prev + 1); // Force game reset
  };

  const handleCloseGame = () => {
    setSelectedGame(null);
  };

  const handleRestartGame = () => {
    setGameKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center space-y-6 mb-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-glow-pulse">
              GameZone
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Your ultimate destination for classic browser games. Play instantly, no downloads required!
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="outline" className="text-base px-4 py-2 bg-gradient-card border-primary/30">
              <Sparkles className="w-4 h-4 mr-2" />
              9 Amazing Games
            </Badge>
            <Badge variant="outline" className="text-base px-4 py-2 bg-gradient-card border-secondary/30">
              <Zap className="w-4 h-4 mr-2" />
              Instant Play
            </Badge>
            <Badge variant="outline" className="text-base px-4 py-2 bg-gradient-card border-accent/30">
              <Users className="w-4 h-4 mr-2" />
              Multiplayer Ready
            </Badge>
          </div>

          <div className="pt-6">
            <Button 
              variant="gaming" 
              size="lg"
              className="text-lg px-8 py-6 animate-float"
              onClick={() => document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Star className="w-5 h-5 mr-2" />
              Start Playing Now
            </Button>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section id="games" className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Game
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From classic puzzles to fast-paced arcade action, we have something for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {games.map((game) => (
            <GameCard
              key={game.id}
              {...game}
              onClick={() => handleGameClick(game)}
            />
          ))}
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center bg-gradient-card border border-border/50 rounded-2xl p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            More Games Coming Soon!
          </h3>
          <p className="text-muted-foreground mb-6">
            We're working on exciting new games including Flappy Bird, Breakout, Dino Runner, and more!
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Flappy Bird", "Breakout", "Dino Runner", "Whack-a-Mole", "Car Racing", "Typing Test"].map((gameName) => (
              <Badge key={gameName} variant="outline" className="text-sm px-3 py-1">
                {gameName}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/10 backdrop-blur mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                GameZone
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                Built with React & TypeScript
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              A collection of classic browser games reimagined with modern design and smooth gameplay.
            </p>
            <div className="text-xs text-muted-foreground">
  © 2025 GameZone. Made with{" "}
  <a 
    href="https://www.linkedin.com" 
    target="_blank" 
    rel="noopener noreferrer" 
    className="text-blue-500 hover:underline"
  >
    Muhammad-Muzammil
  </a>{" "}
  for gamers everywhere.
</div>

          </div>
        </div>
      </footer>

      {/* Game Modal */}
      {selectedGame && (
        <GameModal
          isOpen={!!selectedGame}
          onClose={handleCloseGame}
          gameTitle={selectedGame.title}
          onRestart={handleRestartGame}
        >
          <selectedGame.component key={gameKey} onRestart={handleRestartGame} />
        </GameModal>
      )}
    </div>
  );
};

export default Index;