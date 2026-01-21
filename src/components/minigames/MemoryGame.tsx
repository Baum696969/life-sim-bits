import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface MemoryGameProps {
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
}

const EMOJIS = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎵', '🎸'];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryGame = ({ onComplete }: MemoryGameProps) => {
  const isMobile = useIsMobile();
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);

  const initializeCards = () => {
    const shuffled = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
  };

  const startGame = () => {
    initializeCards();
    setGameState('playing');
  };

  const handleCardClick = (id: number) => {
    if (gameState !== 'playing') return;
    if (flippedCards.length >= 2) return;
    if (cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);
    setFlippedCards([...flippedCards, id]);
  };

  useEffect(() => {
    if (flippedCards.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = flippedCards;
      
      if (cards[first].emoji === cards[second].emoji) {
        // Match found
        setTimeout(() => {
          const newCards = [...cards];
          newCards[first].isMatched = true;
          newCards[second].isMatched = true;
          setCards(newCards);
          setFlippedCards([]);
          setMatches(m => m + 1);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const newCards = [...cards];
          newCards[first].isFlipped = false;
          newCards[second].isFlipped = false;
          setCards(newCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    if (matches === EMOJIS.length && gameState === 'playing') {
      setGameState('gameover');
      
      // Calculate score based on moves (fewer is better)
      const efficiency = Math.max(0, 100 - (moves - EMOJIS.length) * 5);
      const iqGain = Math.floor(efficiency / 20);
      const moneyGain = efficiency * 2;
      
      setTimeout(() => {
        onComplete({
          score: efficiency,
          won: true,
          effects: {
            iqDelta: iqGain,
            moneyDelta: moneyGain,
          },
        });
      }, 1500);
    }
  }, [matches, moves, gameState, onComplete]);

  // Responsive card size
  const cardSize = isMobile ? 'w-14 h-14 text-xl' : 'w-16 h-16 text-2xl';

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <h2 className="font-display text-xl md:text-2xl text-primary">Memory</h2>
      
      {gameState === 'ready' ? (
        <div className="text-center">
          <p className="text-muted-foreground mb-4 text-sm md:text-base">Finde alle Paare!</p>
          <Button onClick={startGame} className="game-btn bg-primary min-h-[48px] px-6">
            <Play className="mr-2 h-5 w-5" /> Start
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            {cards.map((card) => (
              <motion.button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleCardClick(card.id);
                }}
                className={`${cardSize} rounded-lg flex items-center justify-center transition-all touch-manipulation ${
                  card.isFlipped || card.isMatched
                    ? 'bg-primary/20 border-primary'
                    : 'bg-muted border-muted-foreground/20'
                } border-2 active:scale-95`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
                whileTap={{ scale: 0.95 }}
              >
                {(card.isFlipped || card.isMatched) ? card.emoji : '?'}
              </motion.button>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-base md:text-lg">Züge: {moves} | Paare: {matches}/{EMOJIS.length}</p>
          </div>
          
          {gameState === 'gameover' && (
            <div className="text-center animate-bounce-in">
              <p className="text-xl md:text-2xl font-display text-success mb-2">Geschafft!</p>
              <p className="text-muted-foreground">In {moves} Zügen</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MemoryGame;
