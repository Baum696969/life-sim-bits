import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface WarehouseGameProps {
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
}

interface Package {
  id: string;
  color: string;
  emoji: string;
}

const PACKAGE_TYPES = [
  { color: 'red', emoji: '📦', zone: 'A' },
  { color: 'blue', emoji: '📫', zone: 'B' },
  { color: 'green', emoji: '🎁', zone: 'C' },
  { color: 'yellow', emoji: '📮', zone: 'D' },
];

const GAME_DURATION = 120;
const PACKAGES_TO_WIN = 20;

const WarehouseGame = ({ onComplete }: WarehouseGameProps) => {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [conveyorBelt, setConveyorBelt] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [sortedCount, setSortedCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);

  const generatePackage = useCallback((): Package => {
    const type = PACKAGE_TYPES[Math.floor(Math.random() * PACKAGE_TYPES.length)];
    return {
      id: Math.random().toString(36).substring(7),
      color: type.color,
      emoji: type.emoji,
    };
  }, []);

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(GAME_DURATION);
    setConveyorBelt(Array.from({ length: 5 }, generatePackage));
    setSelectedPackage(null);
    setSortedCount(0);
    setMistakes(0);
    setScore(0);
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Add new packages periodically
    const packageTimer = setInterval(() => {
      setConveyorBelt(prev => {
        if (prev.length < 8) {
          return [...prev, generatePackage()];
        }
        // Package fell off - mistake!
        setMistakes(m => m + 1);
        return [...prev.slice(1), generatePackage()];
      });
    }, 2500);

    return () => {
      clearInterval(timer);
      clearInterval(packageTimer);
    };
  }, [gameState, generatePackage]);

  const selectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
  };

  const sortToZone = (zone: string) => {
    if (!selectedPackage) return;

    const expectedZone = PACKAGE_TYPES.find(t => t.color === selectedPackage.color)?.zone;
    
    if (zone === expectedZone) {
      setScore(prev => prev + 50);
      setSortedCount(prev => {
        const newCount = prev + 1;
        if (newCount >= PACKAGES_TO_WIN) {
          setGameState('finished');
        }
        return newCount;
      });
    } else {
      setMistakes(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 20));
    }

    setConveyorBelt(prev => prev.filter(p => p.id !== selectedPackage.id));
    setSelectedPackage(null);
  };

  const handleComplete = () => {
    const won = sortedCount >= PACKAGES_TO_WIN;
    const finalScore = score - mistakes * 10;
    onComplete({
      score: Math.max(0, finalScore),
      won,
      effects: won
        ? { moneyDelta: 150, fitnessDelta: 5 }
        : { moneyDelta: 50, fitnessDelta: 2 }
    });
  };

  if (gameState === 'ready') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <span className="text-2xl">📦</span> Lager Praktikum
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Sortiere Pakete in die richtigen Zonen!
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {PACKAGE_TYPES.map(type => (
              <div key={type.zone} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <span className="text-xl">{type.emoji}</span>
                <span>→ Zone {type.zone}</span>
              </div>
            ))}
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Sortiere {PACKAGES_TO_WIN} Pakete in 2 Minuten</li>
            <li>• Klicke Paket, dann Zone</li>
            <li>• Pakete fallen vom Band wenn du zu langsam bist!</li>
          </ul>
          <Button onClick={startGame} className="w-full">
            Praktikum starten
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'finished') {
    const won = sortedCount >= PACKAGES_TO_WIN;
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {won ? '✅ Praktikum bestanden!' : '❌ Mehr Übung nötig'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-4xl font-bold">{Math.max(0, score - mistakes * 10)}</p>
            <p className="text-muted-foreground">Punkte</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-2 bg-muted rounded">
              <p className="font-bold">{sortedCount}/{PACKAGES_TO_WIN}</p>
              <p className="text-xs text-muted-foreground">Sortiert</p>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <p className="font-bold">{mistakes}</p>
              <p className="text-xs text-muted-foreground">Fehler</p>
            </div>
          </div>
          {won ? (
            <p className="text-center text-success">+€150 Praktikumsvergütung, +5 Fitness</p>
          ) : (
            <p className="text-center text-muted-foreground">+€50 Aufwandsentschädigung, +2 Fitness</p>
          )}
          <Button onClick={handleComplete} className="w-full">
            Weiter
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          <span className="text-sm font-medium">✅ {sortedCount}/{PACKAGES_TO_WIN}</span>
        </div>
        <Progress value={(timeLeft / GAME_DURATION) * 100} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Conveyor Belt */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">Förderband:</p>
          <div className="flex gap-2 overflow-x-auto pb-2 touch-pan-x">
            <AnimatePresence>
              {conveyorBelt.map((pkg, i) => (
                <motion.button
                  key={pkg.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    scale: selectedPackage?.id === pkg.id ? 1.15 : 1
                  }}
                  exit={{ opacity: 0, x: -50 }}
                  onClick={() => selectPackage(pkg)}
                  onTouchStart={() => selectPackage(pkg)}
                  className={`
                    text-2xl md:text-3xl p-2 md:p-3 rounded-lg transition-all touch-manipulation shrink-0
                    ${selectedPackage?.id === pkg.id 
                      ? 'bg-primary ring-2 ring-primary' 
                      : 'bg-background hover:bg-muted active:bg-muted'
                    }
                  `}
                >
                  {pkg.emoji}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Selected Package */}
        {selectedPackage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-2 bg-primary/20 rounded"
          >
            <span className="text-2xl">{selectedPackage.emoji}</span>
            <span className="ml-2">← Wohin sortieren?</span>
          </motion.div>
        )}

        {/* Zones */}
        <div className="grid grid-cols-4 gap-1 md:gap-2">
          {PACKAGE_TYPES.map(type => (
            <Button
              key={type.zone}
              variant={selectedPackage ? 'default' : 'outline'}
              disabled={!selectedPackage}
              onClick={() => sortToZone(type.zone)}
              onTouchStart={(e) => { if (selectedPackage) { e.preventDefault(); sortToZone(type.zone); } }}
              className="h-14 md:h-16 flex flex-col touch-manipulation active:scale-95"
            >
              <span className="text-lg md:text-xl">{type.emoji}</span>
              <span className="text-[10px] md:text-xs">Zone {type.zone}</span>
            </Button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <span>Score: {score}</span>
          <span>Fehler: {mistakes}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WarehouseGame;
