import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '@/lib/soundManager';

interface SequenceGameProps {
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
}

const SYMBOLS = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];

const SequenceGame = ({ onComplete }: SequenceGameProps) => {
  const [gameState, setGameState] = useState<'ready' | 'showing' | 'input' | 'gameover'>('ready');
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [level, setLevel] = useState(1);
  const [showingIndex, setShowingIndex] = useState(-1);
  const [highlightedSymbol, setHighlightedSymbol] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const generateSequence = useCallback((length: number) => {
    const newSeq: number[] = [];
    for (let i = 0; i < length; i++) {
      newSeq.push(Math.floor(Math.random() * SYMBOLS.length));
    }
    return newSeq;
  }, []);

  const startGame = () => {
    const initialSequence = generateSequence(3);
    setSequence(initialSequence);
    setPlayerSequence([]);
    setLevel(1);
    setScore(0);
    setGameState('showing');
    showSequence(initialSequence);
  };

  const showSequence = (seq: number[]) => {
    setShowingIndex(-1);
    seq.forEach((symbolIndex, i) => {
      setTimeout(() => {
        setShowingIndex(i);
        setHighlightedSymbol(symbolIndex);
        soundManager.playClick();
        
        setTimeout(() => {
          setHighlightedSymbol(null);
        }, 500);
      }, i * 800 + 500);
    });

    setTimeout(() => {
      setShowingIndex(-1);
      setGameState('input');
    }, seq.length * 800 + 800);
  };

  const handleSymbolClick = (index: number) => {
    if (gameState !== 'input') return;

    soundManager.playClick();
    const newPlayerSeq = [...playerSequence, index];
    setPlayerSequence(newPlayerSeq);

    // Check if correct so far
    const correctSoFar = newPlayerSeq.every((s, i) => s === sequence[i]);

    if (!correctSoFar) {
      // Wrong!
      soundManager.playNegativeEffect();
      setGameState('gameover');
      
      const finalScore = score + (level - 1) * 10;
      const iqGain = Math.floor(finalScore / 20);
      const moneyGain = finalScore * 5;
      
      setTimeout(() => {
        onComplete({
          score: finalScore,
          won: level > 3,
          effects: {
            iqDelta: iqGain,
            moneyDelta: moneyGain,
          },
        });
      }, 1500);
      return;
    }

    // Check if sequence complete
    if (newPlayerSeq.length === sequence.length) {
      soundManager.playMatch();
      setScore(s => s + level * 10);
      setLevel(l => l + 1);
      setPlayerSequence([]);

      if (level >= 5) {
        // Won!
        soundManager.playMinigameWin();
        setGameState('gameover');
        
        const finalScore = score + level * 20;
        const iqGain = Math.floor(finalScore / 10);
        const moneyGain = finalScore * 10;
        
        setTimeout(() => {
          onComplete({
            score: finalScore,
            won: true,
            effects: {
              iqDelta: iqGain,
              moneyDelta: moneyGain,
            },
          });
        }, 1500);
        return;
      }

      // Next level
      const newSequence = generateSequence(3 + level);
      setSequence(newSequence);
      setGameState('showing');
      setTimeout(() => showSequence(newSequence), 500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="font-display text-2xl text-primary">Merkspiel</h2>
      
      {gameState === 'ready' ? (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Merke dir die Reihenfolge der Symbole!
          </p>
          <Button onClick={startGame} className="game-btn bg-primary">
            <Play className="mr-2 h-4 w-4" /> Start
          </Button>
        </div>
      ) : (
        <>
          <div className="text-center mb-2">
            <p className="text-lg">Level: {level} | Punkte: {score}</p>
            {gameState === 'showing' && (
              <p className="text-primary animate-pulse">Merke dir die Reihenfolge...</p>
            )}
            {gameState === 'input' && (
              <p className="text-primary">Gib die Reihenfolge ein!</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {SYMBOLS.map((symbol, index) => (
              <motion.button
                key={index}
                onClick={() => handleSymbolClick(index)}
                disabled={gameState !== 'input'}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-xl text-3xl flex items-center justify-center transition-all border-2 ${
                  highlightedSymbol === index
                    ? 'bg-primary/30 border-primary scale-110 shadow-lg'
                    : 'bg-muted border-muted-foreground/20'
                } ${gameState === 'input' ? 'hover:bg-primary/20 cursor-pointer' : 'cursor-default'}`}
                whileHover={gameState === 'input' ? { scale: 1.05 } : {}}
                whileTap={gameState === 'input' ? { scale: 0.95 } : {}}
              >
                {symbol}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-1 mt-2">
            {sequence.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < playerSequence.length
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          {gameState === 'gameover' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center mt-4"
            >
              <p className={`text-2xl font-display ${level > 3 ? 'text-primary' : 'text-destructive'}`}>
                {level > 3 ? 'Super gemacht!' : 'Leider falsch!'}
              </p>
              <p className="text-muted-foreground">
                Level {level} erreicht • {score + (level > 3 ? level * 20 : (level - 1) * 10)} Punkte
              </p>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default SequenceGame;
