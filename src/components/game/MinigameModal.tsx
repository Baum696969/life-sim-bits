import { Dialog, DialogContent } from '@/components/ui/dialog';
import FlappyBird from '../minigames/FlappyBird';
import SnakeGame from '../minigames/SnakeGame';
import MemoryGame from '../minigames/MemoryGame';
import PuzzleGame from '../minigames/PuzzleGame';
import MathGame from '../minigames/MathGame';
import SequenceGame from '../minigames/SequenceGame';
import SpaceShooter from '../minigames/SpaceShooter';
import BottleCollector from '../minigames/BottleCollector';
import EnglishTest from '../minigames/EnglishTest';
import GermanTest from '../minigames/GermanTest';
import TimeSense from '../minigames/TimeSense';
import PickpocketGame from '../minigames/PickpocketGame';
import StealthGame from '../minigames/StealthGame';
import FastFoodGame from '../minigames/FastFoodGame';
import WarehouseGame from '../minigames/WarehouseGame';
import OfficeGame from '../minigames/OfficeGame';

interface MinigameModalProps {
  isOpen: boolean;
  minigame: string | null;
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
  onClose: () => void;
  playerMoney: number;
  playerAge?: number;
}

const MinigameModal = ({ isOpen, minigame, onComplete, onClose, playerMoney, playerAge }: MinigameModalProps) => {
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
      case 'sequence':
        return <SequenceGame onComplete={onComplete} playerAge={playerAge} />;
      case 'shooter':
      case 'spaceshooter':
        return <SpaceShooter onComplete={onComplete} />;
      case 'bottles':
        return <BottleCollector onComplete={onComplete} />;
      case 'english':
        return <EnglishTest onComplete={onComplete} playerAge={playerAge} />;
      case 'german':
        return <GermanTest onComplete={onComplete} playerAge={playerAge} />;
      case 'timesense':
        return <TimeSense onComplete={onComplete} playerAge={playerAge} />;
      case 'pickpocket':
        return <PickpocketGame onComplete={onComplete} />;
      case 'stealth':
        return <StealthGame onComplete={onComplete} />;
      case 'fastfood':
        return <FastFoodGame onComplete={onComplete} />;
      case 'warehouse':
        return <WarehouseGame onComplete={onComplete} />;
      case 'office':
        return <OfficeGame onComplete={onComplete} />;
      default:
        return <div className="text-center p-8">Minigame nicht gefunden</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-card border-primary/30 max-h-[90vh] overflow-y-auto">
        {renderMinigame()}
      </DialogContent>
    </Dialog>
  );
};

export default MinigameModal;
