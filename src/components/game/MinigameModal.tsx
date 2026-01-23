import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { X, Smartphone, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { lockLandscapeOnNative, lockPortraitOnNative } from '@/lib/screenOrientation';
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
import BankHeist from '../minigames/BankHeist';
import ArcadeFighter from '../minigames/ArcadeFighter';
import Blackjack from '../minigames/Blackjack';

interface MinigameModalProps {
  isOpen: boolean;
  minigame: string | null;
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
  onClose: () => void;
  playerMoney: number;
  playerAge?: number;
}

type OrientationChoice = 'portrait' | 'landscape' | null;

const MinigameModal = ({ isOpen, minigame, onComplete, onClose, playerMoney, playerAge }: MinigameModalProps) => {
  const isMobile = useIsMobile();
  const [orientationChoice, setOrientationChoice] = useState<OrientationChoice>(null);
  const [showOrientationPicker, setShowOrientationPicker] = useState(false);

  // Reset orientation choice when modal opens/closes
  useEffect(() => {
    if (isOpen && isMobile) {
      setShowOrientationPicker(true);
      setOrientationChoice(null);
    } else if (!isOpen) {
      setShowOrientationPicker(false);
      setOrientationChoice(null);
      // Reset to portrait when closing
      void lockPortraitOnNative();
    }
  }, [isOpen, isMobile]);

  const handleOrientationSelect = async (orientation: OrientationChoice) => {
    setOrientationChoice(orientation);
    setShowOrientationPicker(false);
    
    if (orientation === 'landscape') {
      await lockLandscapeOnNative();
    } else {
      await lockPortraitOnNative();
    }
  };

  const handleClose = async () => {
    // Reset to portrait when closing
    await lockPortraitOnNative();
    setOrientationChoice(null);
    setShowOrientationPicker(false);
    onClose();
  };

  const renderMinigame = () => {
    switch (minigame) {
      case 'blackjack':
        return <Blackjack onComplete={onComplete} playerMoney={playerMoney} playerAge={playerAge} />;
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
        return <PickpocketGame onComplete={onComplete} playerMoney={playerMoney} />;
      case 'stealth':
        return <StealthGame onComplete={onComplete} />;
      case 'fastfood':
        return <FastFoodGame onComplete={onComplete} />;
      case 'warehouse':
        return <WarehouseGame onComplete={onComplete} />;
      case 'office':
        return <OfficeGame onComplete={onComplete} />;
      case 'bankheist':
        return <BankHeist onComplete={onComplete} />;
      case 'arcadefighter':
        return <ArcadeFighter onComplete={onComplete} />;
      default:
        return <div className="text-center p-8">Minigame nicht gefunden</div>;
    }
  };

  // Mobile: Fullscreen overlay
  if (isMobile && isOpen) {
    // Show orientation picker first
    if (showOrientationPicker) {
      return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6 safe-area-top safe-area-bottom">
          <h2 className="font-display text-2xl text-primary mb-2">🎮 Minigame</h2>
          <p className="text-muted-foreground text-center mb-8">Wie möchtest du spielen?</p>
          
          <div className="flex gap-4">
            <button
              onClick={() => handleOrientationSelect('portrait')}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-primary/50 bg-card hover:bg-primary/10 hover:border-primary transition-all active:scale-95"
            >
              <div className="w-12 h-20 border-2 border-primary rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-10 text-primary" />
              </div>
              <span className="font-medium text-foreground">Hochformat</span>
            </button>
            
            <button
              onClick={() => handleOrientationSelect('landscape')}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-primary/50 bg-card hover:bg-primary/10 hover:border-primary transition-all active:scale-95"
            >
              <div className="w-20 h-12 border-2 border-primary rounded-lg flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-primary" />
              </div>
              <span className="font-medium text-foreground">Querformat</span>
            </button>
          </div>
          
          <Button
            variant="ghost"
            onClick={handleClose}
            className="mt-8 text-muted-foreground"
          >
            Abbrechen
          </Button>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col safe-area-top safe-area-bottom">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-3 border-b border-primary/30">
          <h2 className="font-display text-lg text-primary">Minigame</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-10 w-10 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Minigame Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
          <div className="w-full max-w-md">
            {renderMinigame()}
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Dialog
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl bg-card border-primary/30 max-h-[90vh] overflow-y-auto">
        {renderMinigame()}
      </DialogContent>
    </Dialog>
  );
};

export default MinigameModal;
