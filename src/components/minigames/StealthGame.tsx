import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface StealthGameProps {
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
}

const GRID_SIZE = 8;
const GUARD_COUNT = 3;
const LOOT_COUNT = 3;

interface Position {
  x: number;
  y: number;
}

interface Guard {
  position: Position;
  direction: 'up' | 'down' | 'left' | 'right';
  visionRange: number;
}

const StealthGame = ({ onComplete }: StealthGameProps) => {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [guards, setGuards] = useState<Guard[]>([]);
  const [loot, setLoot] = useState<Position[]>([]);
  const [collectedLoot, setCollectedLoot] = useState(0);
  const [exitPos] = useState<Position>({ x: GRID_SIZE - 1, y: GRID_SIZE - 1 });
  const [moves, setMoves] = useState(0);
  const [detected, setDetected] = useState(false);
  const [won, setWon] = useState(false);
  const gameRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const initGame = useCallback(() => {
    // Place guards
    const newGuards: Guard[] = [];
    for (let i = 0; i < GUARD_COUNT; i++) {
      let pos: Position;
      do {
        pos = {
          x: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1,
          y: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1
        };
      } while (
        (pos.x === 0 && pos.y === 0) ||
        (pos.x === GRID_SIZE - 1 && pos.y === GRID_SIZE - 1) ||
        newGuards.some(g => g.position.x === pos.x && g.position.y === pos.y)
      );
      
      newGuards.push({
        position: pos,
        direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)] as Guard['direction'],
        visionRange: 2
      });
    }
    setGuards(newGuards);

    // Place loot
    const newLoot: Position[] = [];
    for (let i = 0; i < LOOT_COUNT; i++) {
      let pos: Position;
      do {
        pos = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE)
        };
      } while (
        (pos.x === 0 && pos.y === 0) ||
        (pos.x === GRID_SIZE - 1 && pos.y === GRID_SIZE - 1) ||
        newGuards.some(g => g.position.x === pos.x && g.position.y === pos.y) ||
        newLoot.some(l => l.x === pos.x && l.y === pos.y)
      );
      newLoot.push(pos);
    }
    setLoot(newLoot);
    
    setPlayerPos({ x: 0, y: 0 });
    setCollectedLoot(0);
    setMoves(0);
    setDetected(false);
    setWon(false);
    setGameState('playing');
  }, []);

  const isInVision = useCallback((guard: Guard, pos: Position): boolean => {
    const { x: gx, y: gy } = guard.position;
    const { x: px, y: py } = pos;
    
    switch (guard.direction) {
      case 'up':
        return px === gx && py < gy && gy - py <= guard.visionRange;
      case 'down':
        return px === gx && py > gy && py - gy <= guard.visionRange;
      case 'left':
        return py === gy && px < gx && gx - px <= guard.visionRange;
      case 'right':
        return py === gy && px > gx && px - gx <= guard.visionRange;
      default:
        return false;
    }
  }, []);

  const checkDetection = useCallback((pos: Position) => {
    for (const guard of guards) {
      if (isInVision(guard, pos) || 
          (guard.position.x === pos.x && guard.position.y === pos.y)) {
        return true;
      }
    }
    return false;
  }, [guards, isInVision]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameState !== 'playing') return;

    const newX = Math.max(0, Math.min(GRID_SIZE - 1, playerPos.x + dx));
    const newY = Math.max(0, Math.min(GRID_SIZE - 1, playerPos.y + dy));
    const newPos = { x: newX, y: newY };
    
    setPlayerPos(newPos);
    setMoves(prev => prev + 1);

    // Check loot collection
    const lootIndex = loot.findIndex(l => l.x === newX && l.y === newY);
    if (lootIndex !== -1) {
      setLoot(prev => prev.filter((_, i) => i !== lootIndex));
      setCollectedLoot(prev => prev + 1);
    }

    // Rotate guards
    setGuards(prev => prev.map(g => ({
      ...g,
      direction: ['up', 'right', 'down', 'left'][
        (['up', 'right', 'down', 'left'].indexOf(g.direction) + 1) % 4
      ] as Guard['direction']
    })));

    // Check detection
    if (checkDetection(newPos)) {
      setDetected(true);
      setGameState('finished');
      return;
    }

    // Check win (reached exit)
    if (newX === exitPos.x && newY === exitPos.y) {
      setWon(true);
      setGameState('finished');
    }
  }, [gameState, playerPos, loot, checkDetection, exitPos]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movePlayer(1, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, movePlayer]);

  const handleComplete = () => {
    const score = won ? (collectedLoot * 100 + Math.max(0, 50 - moves) * 10) : 0;
    onComplete({
      score,
      won,
      effects: won
        ? { moneyDelta: collectedLoot * 500, iqDelta: 3, luckDelta: 2 }
        : { healthDelta: -10 }
    });
  };

  const getVisionCells = useCallback((guard: Guard): Position[] => {
    const cells: Position[] = [];
    const { x, y } = guard.position;
    
    for (let i = 1; i <= guard.visionRange; i++) {
      switch (guard.direction) {
        case 'up':
          if (y - i >= 0) cells.push({ x, y: y - i });
          break;
        case 'down':
          if (y + i < GRID_SIZE) cells.push({ x, y: y + i });
          break;
        case 'left':
          if (x - i >= 0) cells.push({ x: x - i, y });
          break;
        case 'right':
          if (x + i < GRID_SIZE) cells.push({ x: x + i, y });
          break;
      }
    }
    return cells;
  }, []);

  if (gameState === 'ready') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <span className="text-2xl">🥷</span> Einbruch
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Schleiche dich durch das Gebäude, sammle Beute und erreiche den Ausgang ohne entdeckt zu werden!
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 🟢 Du startest oben links</li>
            <li>• 🚪 Ausgang unten rechts</li>
            <li>• 💎 Sammle Beute für mehr Geld</li>
            <li>• 👮 Vermeide die Sichtlinien der Wachen</li>
            <li>• Pfeiltasten oder WASD zum Bewegen</li>
          </ul>
          <Button onClick={initGame} className="w-full">
            Starten
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'finished') {
    const score = won ? (collectedLoot * 100 + Math.max(0, 50 - moves) * 10) : 0;
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {won ? '✅ Entkommen!' : '❌ Erwischt!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-4xl font-bold">{score}</p>
            <p className="text-muted-foreground">Punkte</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-2 bg-muted rounded">
              <p className="font-bold">{collectedLoot}/{LOOT_COUNT}</p>
              <p className="text-xs text-muted-foreground">Beute</p>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <p className="font-bold">{moves}</p>
              <p className="text-xs text-muted-foreground">Züge</p>
            </div>
          </div>
          {won ? (
            <p className="text-center text-success">+€{collectedLoot * 500} Beute, +3 IQ, +2 Glück</p>
          ) : (
            <p className="text-center text-destructive">-10 Gesundheit (Verhaftet)</p>
          )}
          <Button onClick={handleComplete} className="w-full">
            Weiter
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Collect all vision cells
  const allVisionCells = guards.flatMap(g => getVisionCells(g));
  
  const cellSize = isMobile ? 'text-sm' : 'text-lg';

  return (
    <Card className="w-full max-w-lg mx-auto" ref={gameRef}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center text-sm">
          <span>💎 Beute: {collectedLoot}/{LOOT_COUNT}</span>
          <span>Züge: {moves}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          className="grid gap-0.5 md:gap-1 mx-auto touch-none"
          style={{ 
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            maxWidth: isMobile ? '280px' : '320px'
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isPlayer = playerPos.x === x && playerPos.y === y;
            const isGuard = guards.some(g => g.position.x === x && g.position.y === y);
            const isLoot = loot.some(l => l.x === x && l.y === y);
            const isExit = exitPos.x === x && exitPos.y === y;
            const isVision = allVisionCells.some(c => c.x === x && c.y === y);
            const guard = guards.find(g => g.position.x === x && g.position.y === y);

            return (
              <motion.div
                key={i}
                className={`
                  aspect-square rounded flex items-center justify-center ${cellSize}
                  ${isVision && !isPlayer ? 'bg-red-500/30' : 'bg-muted/50'}
                  ${isExit && !isPlayer ? 'bg-green-500/30 border border-green-500' : ''}
                  ${isPlayer ? 'bg-primary' : ''}
                `}
                animate={isPlayer ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.2 }}
              >
                {isPlayer && '🟢'}
                {isGuard && (
                  <span className="relative">
                    👮
                    {!isMobile && (
                      <span className="absolute -top-1 -right-1 text-xs">
                        {guard?.direction === 'up' && '⬆️'}
                        {guard?.direction === 'down' && '⬇️'}
                        {guard?.direction === 'left' && '⬅️'}
                        {guard?.direction === 'right' && '➡️'}
                      </span>
                    )}
                  </span>
                )}
                {isLoot && !isPlayer && '💎'}
                {isExit && !isPlayer && !isLoot && '🚪'}
              </motion.div>
            );
          })}
        </div>
        
        {/* Mobile D-Pad Controls */}
        {isMobile && gameState === 'playing' && (
          <div className="grid grid-cols-3 gap-1 w-36 mx-auto">
            <div />
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 touch-manipulation"
              onTouchStart={() => movePlayer(0, -1)}
            >
              <ArrowUp className="h-6 w-6" />
            </Button>
            <div />
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 touch-manipulation"
              onTouchStart={() => movePlayer(-1, 0)}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div />
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 touch-manipulation"
              onTouchStart={() => movePlayer(1, 0)}
            >
              <ArrowRight className="h-6 w-6" />
            </Button>
            <div />
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 touch-manipulation"
              onTouchStart={() => movePlayer(0, 1)}
            >
              <ArrowDown className="h-6 w-6" />
            </Button>
            <div />
          </div>
        )}
        
        {!isMobile && (
          <p className="text-xs text-center text-muted-foreground">
            Pfeiltasten oder WASD zum Bewegen
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StealthGame;
