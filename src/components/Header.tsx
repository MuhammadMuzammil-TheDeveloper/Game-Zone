import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon, Gamepad2, User, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "./AuthModal";
import { useState } from "react";
import { toast } from "sonner";

export const Header = () => {
  const { theme, setTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully!');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <>
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Gamepad2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                GameZone
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-card border border-border/50">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground truncate max-w-32">
                      {currentUser.email}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="hover:bg-destructive/10 hover:text-destructive"
                    title="Sign out"
                  >
                    <LogOut className="h-[1.2rem] w-[1.2rem]" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="gaming"
                  onClick={() => setShowAuthModal(true)}
                  className="hidden sm:flex"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="hover:bg-accent/10 hover:shadow-cyan"
              >
                <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {!currentUser && (
                <Button
                  variant="gaming"
                  size="icon"
                  onClick={() => setShowAuthModal(true)}
                  className="sm:hidden"
                  title="Sign In"
                >
                  <User className="h-[1.2rem] w-[1.2rem]" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};