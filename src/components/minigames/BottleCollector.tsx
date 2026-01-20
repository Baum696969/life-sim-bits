import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { soundManager } from '@/lib/soundManager';

interface BottleCollectorProps {
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
}

interface Bottle {
  id: number;
  x: number;
  y: number;
  spawnTime: number;
}

const GAME_DURATION = 30; // 30 seconds
const SPAWN_INTERVAL = 1000; // 1 second
const BOTTLES_PER_SPAWN = 2;
const BOTTLES_PER_SPAWN_FINAL = 4; // 2x in last 10 seconds
const DESPAWN_TIME = 5000; // 5 seconds
const BOTTLE_VALUE = 0.25; // €0.25 per bottle
const FINAL_PHASE_START = 10; // Last 10 seconds

const BottleCollector = ({ onComplete }: BottleCollectorProps) => {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [collected, setCollected] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [canvasSize, setCanvasSize] = useState({ width: 350, height: 350 });
  
  const bottleIdRef = useRef(0);
  const gameLoopRef = useRef<number>();
  const spawnIntervalRef = useRef<NodeJS.Timeout>();

  // Responsive canvas
  useEffect(() => {
    const updateSize = () => {
      const maxWidth = Math.min(350, window.innerWidth - 32);
      setCanvasSize({ width: maxWidth, height: maxWidth });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const startGame = () => {
    setBottles([]);
    setCollected(0);
    setTimeLeft(GAME_DURATION);
    bottleIdRef.current = 0;
    setGameState('playing');
  };

  const spawnBottles = useCallback(() => {
    const now = Date.now();
    const newBottles: Bottle[] = [];
    
    // Double spawn rate in final 10 seconds
    const spawnCount = timeLeft <= FINAL_PHASE_START ? BOTTLES_PER_SPAWN_FINAL : BOTTLES_PER_SPAWN;
    
    for (let i = 0; i < spawnCount; i++) {
      newBottles.push({
        id: bottleIdRef.current++,
        x: Math.random() * (canvasSize.width - 40) + 20,
        y: Math.random() * (canvasSize.height - 40) + 20,
        spawnTime: now,
      });
    }
    
    setBottles(prev => {
      // Remove despawned bottles and add new ones
      const filtered = prev.filter(b => now - b.spawnTime < DESPAWN_TIME);
      return [...filtered, ...newBottles];
    });
  }, [canvasSize, timeLeft]);

  const collectBottle = (bottleId: number) => {
    setBottles(prev => prev.filter(b => b.id !== bottleId));
    setCollected(c => c + 1);
    soundManager.playCoins();
  };

  // Game timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('gameover');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Bottle spawning
  useEffect(() => {
    if (gameState !== 'playing') return;

    spawnBottles(); // Initial spawn
    spawnIntervalRef.current = setInterval(spawnBottles, SPAWN_INTERVAL);

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [gameState, spawnBottles]);

  // Bottle despawning (visual update)
  useEffect(() => {
    if (gameState !== 'playing') return;

    const updateLoop = () => {
      const now = Date.now();
      setBottles(prev => prev.filter(b => now - b.spawnTime < DESPAWN_TIME));
      gameLoopRef.current = requestAnimationFrame(updateLoop);
    };

    gameLoopRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState]);

  // Game over handling
  useEffect(() => {
    if (gameState === 'gameover') {
      const moneyEarned = collected * BOTTLE_VALUE;
      const won = collected >= 20;
      
      if (won) {
        soundManager.playMinigameWin();
      } else {
        soundManager.playMinigameLose();
      }

      setTimeout(() => {
        onComplete({
          score: collected,
          won,
          effects: {
            moneyDelta: moneyEarned,
            fitnessDelta: collected >= 30 ? 3 : collected >= 15 ? 1 : 0,
          },
        });
      }, 1500);
    }
  }, [gameState, collected, onComplete]);

  const getBottleOpacity = (bottle: Bottle) => {
    const elapsed = Date.now() - bottle.spawnTime;
    const remaining = DESPAWN_TIME - elapsed;
    if (remaining < 1000) {
      return remaining / 1000;
    }
    return 1;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="font-display text-xl md:text-2xl text-primary">Pfandflaschen sammeln</h2>
      
      <div 
        className="relative bg-gradient-to-b from-green-900/30 to-green-800/20 rounded-lg border-2 border-primary/30 overflow-hidden touch-none"
        style={{ width: canvasSize.width, height: canvasSize.height }}
      >
        {gameState === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
            <p className="text-muted-foreground mb-4 text-sm text-center px-4">
              Sammle so viele Pfandflaschen wie möglich in 30 Sekunden!
            </p>
            <p className="text-xs text-muted-foreground mb-4">€0,25 pro Flasche</p>
            <Button onClick={startGame} className="game-btn bg-primary">
              <Play className="mr-2 h-4 w-4" /> Start
            </Button>
          </div>
        )}

        {gameState === 'playing' && bottles.map(bottle => (
          <button
            key={bottle.id}
            onClick={() => collectBottle(bottle.id)}
            onTouchStart={(e) => {
              e.preventDefault();
              collectBottle(bottle.id);
            }}
            className="absolute w-10 h-10 text-2xl transition-opacity hover:scale-110 active:scale-90 cursor-pointer"
            style={{
              left: bottle.x - 20,
              top: bottle.y - 20,
              opacity: getBottleOpacity(bottle),
            }}
          >
            🍾
          </button>
        ))}

        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
            <p className="text-2xl font-display text-primary mb-2">Zeit vorbei!</p>
            <p className="text-xl text-success">
              {collected} Flaschen = €{(collected * BOTTLE_VALUE).toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between w-full max-w-[350px] px-2">
        <div className="text-center">
          <p className="text-2xl font-display text-primary">{collected}</p>
          <p className="text-xs text-muted-foreground">Gesammelt</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-display ${timeLeft <= 5 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
            {timeLeft}s
          </p>
          <p className="text-xs text-muted-foreground">Zeit</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-display text-success">€{(collected * BOTTLE_VALUE).toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Verdient</p>
        </div>
      </div>
    </div>
  );
};

export default BottleCollector;
