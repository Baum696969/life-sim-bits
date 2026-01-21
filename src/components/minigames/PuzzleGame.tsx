import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface PuzzleGameProps {
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
}

const GRID_SIZE = 3;

const PuzzleGame = ({ onComplete }: PuzzleGameProps) => {
  const isMobile = useIsMobile();
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const initializePuzzle = () => {
    // Create solved puzzle first
    const solved = Array.from({ length: GRID_SIZE * GRID_SIZE - 1 }, (_, i) => i + 1);
    solved.push(0); // 0 represents empty space
    
    // Shuffle with valid moves
    let shuffled = [...solved];
    for (let i = 0; i < 100; i++) {
      const emptyIndex = shuffled.indexOf(0);
      const validMoves = getValidMoves(emptyIndex);
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      [shuffled[emptyIndex], shuffled[randomMove]] = [shuffled[randomMove], shuffled[emptyIndex]];
    }
    
    setTiles(shuffled);
    setMoves(0);
    setStartTime(Date.now());
  };

  const getValidMoves = (emptyIndex: number): number[] => {
    const moves: number[] = [];
    const row = Math.floor(emptyIndex / GRID_SIZE);
    const col = emptyIndex % GRID_SIZE;
    
    if (row > 0) moves.push(emptyIndex - GRID_SIZE); // Up
    if (row < GRID_SIZE - 1) moves.push(emptyIndex + GRID_SIZE); // Down
    if (col > 0) moves.push(emptyIndex - 1); // Left
    if (col < GRID_SIZE - 1) moves.push(emptyIndex + 1); // Right
    
    return moves;
  };

  const startGame = () => {
    initializePuzzle();
    setGameState('playing');
  };

  const handleTileClick = (index: number) => {
    if (gameState !== 'playing') return;
    
    const emptyIndex = tiles.indexOf(0);
    const validMoves = getValidMoves(emptyIndex);
    
    if (validMoves.includes(index)) {
      const newTiles = [...tiles];
      [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
      setTiles(newTiles);
      setMoves(m => m + 1);
    }
  };

  const isSolved = () => {
    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i] !== i + 1) return false;
    }
    return tiles[tiles.length - 1] === 0;
  };

  useEffect(() => {
    if (gameState === 'playing' && tiles.length > 0 && isSolved()) {
      setGameState('gameover');
      
      const timeTaken = (Date.now() - startTime) / 1000;
      const efficiency = Math.max(0, 100 - moves - Math.floor(timeTaken / 2));
      const iqGain = Math.floor(efficiency / 15);
      const moneyGain = efficiency * 3;
      
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
  }, [tiles, gameState, moves, startTime, onComplete]);

  // Responsive tile size
  const tileSize = isMobile ? 'w-16 h-16 text-xl' : 'w-20 h-20 text-2xl';

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <h2 className="font-display text-xl md:text-2xl text-primary">Sliding Puzzle</h2>
      
      {gameState === 'ready' ? (
        <div className="text-center">
          <p className="text-muted-foreground mb-4 text-sm md:text-base">Sortiere die Zahlen von 1-8!</p>
          <Button onClick={startGame} className="game-btn bg-primary min-h-[48px] px-6">
            <Play className="mr-2 h-5 w-5" /> Start
          </Button>
        </div>
      ) : (
        <>
          <div 
            className="grid gap-1.5 md:gap-2 p-3 bg-muted/50 rounded-lg"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
          >
            {tiles.map((tile, index) => (
              <motion.button
                key={index}
                onClick={() => handleTileClick(index)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleTileClick(index);
                }}
                className={`${tileSize} rounded-lg font-display flex items-center justify-center transition-all touch-manipulation ${
                  tile === 0
                    ? 'bg-transparent'
                    : 'bg-primary text-primary-foreground active:bg-primary/80'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
                whileTap={tile !== 0 ? { scale: 0.95 } : {}}
                layout
              >
                {tile !== 0 && tile}
              </motion.button>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-base md:text-lg">Züge: {moves}</p>
          </div>
          
          {gameState === 'gameover' && (
            <div className="text-center animate-bounce-in">
              <p className="text-xl md:text-2xl font-display text-success mb-2">Gelöst!</p>
              <p className="text-muted-foreground">In {moves} Zügen</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PuzzleGame;
