import { X, RotateCcw, Home } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameTitle: string;
  children: React.ReactNode;
  onRestart?: () => void;
}

export const GameModal = ({ isOpen, onClose, gameTitle, children, onRestart }: GameModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-gradient-dark border-primary/20">
        {/* Game Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/10 backdrop-blur">
          <h2 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {gameTitle}
          </h2>
          <div className="flex items-center gap-2">
            {onRestart && (
              <Button 
                variant="neon" 
                size="sm"
                onClick={onRestart}
                className="mr-2"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Restart
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="hover:bg-destructive/20 hover:text-destructive"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* Game Content */}
        <div className="flex-1 overflow-hidden p-4">
          {children}
        </div>
        
        {/* Game Footer */}
        <div className="flex items-center justify-center p-4 border-t border-border/50 bg-background/10 backdrop-blur">
          <Button 
            variant="gaming" 
            onClick={onClose}
            className="min-w-32"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Games
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};