import { Play, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GameCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  isPopular?: boolean;
  onClick: () => void;
}

export const GameCard = ({ 
  title, 
  description, 
  image, 
  category, 
  difficulty, 
  isPopular, 
  onClick 
}: GameCardProps) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "Easy": return "bg-green-500/20 text-green-400";
      case "Medium": return "bg-yellow-500/20 text-yellow-400";  
      case "Hard": return "bg-red-500/20 text-red-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/60 transition-all duration-500 cursor-pointer hover:shadow-glow hover:scale-105 transform"
      onClick={onClick}
    >
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
        {isPopular && (
          <div className="absolute top-4 right-4 z-10">
            <Badge variant="secondary" className="bg-gradient-secondary text-secondary-foreground font-bold shadow-lg">
              <Star className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
          <Badge 
            variant="outline" 
            className={`text-xs px-3 py-1 font-medium ${getDifficultyColor(difficulty)}`}
          >
            {difficulty}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>
        
        <div className="flex items-center justify-between pt-2">
          <Badge variant="secondary" className="text-xs bg-muted/50 hover:bg-muted">
            {category}
          </Badge>
          <Button variant="gaming" size="sm" className="text-sm font-semibold">
            <Play className="w-4 h-4 mr-2" />
            Play Now
          </Button>
        </div>
      </div>
    </div>
  );
};