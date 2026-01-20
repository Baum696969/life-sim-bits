import { Dialog, DialogContent } from '@/components/ui/dialog';
import FlappyBird from '../minigames/FlappyBird';
import SnakeGame from '../minigames/SnakeGame';
import MemoryGame from '../minigames/MemoryGame';
import PuzzleGame from '../minigames/PuzzleGame';
import MathGame from '../minigames/MathGame';

interface MinigameModalProps {
  isOpen: boolean;
  minigame: string | null;
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
  onClose: () => void;
  playerMoney: number;
}

const MinigameModal = ({ isOpen, minigame, onComplete, onClose, playerMoney }: MinigameModalProps) => {
  const renderMinigame = () => {
    switch (minigame) {
      case 'flappy':
        return <FlappyBird onComplete={onComplete} />;
      case 'snake':
        return <SnakeGame onComplete={onComplete} />;
      case 'memory':
        return <MemoryGame onComplete={onComplete} />;
      case 'puzzle':
        return <PuzzleGame onComplete={onComplete} />;
      case 'math':
        return <MathGame onComplete={onComplete} />;
      default:
        return <div>Minigame nicht gefunden</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-card border-primary/30">
        {renderMinigame()}
      </DialogContent>
    </Dialog>
  );
};

export default MinigameModal;
