import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { haptics } from '@/lib/haptics';

interface PickpocketGameProps {
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
  playerMoney?: number;
}

interface Stage {
  speed: number;
  greenWidth: number;
  name: string;
}

const STAGES: Stage[] = [
  { speed: 2, greenWidth: 25, name: 'Tasche erspähen' },
  { speed: 3.5, greenWidth: 18, name: 'Zugreifen' },
  { speed: 5.5, greenWidth: 12, name: 'Entkommen' },
];

const PickpocketGame = ({ onComplete, playerMoney = 1000 }: PickpocketGameProps) => {
  // Speed multiplier based on player money: more money = faster (harder)
  // Range: 0.6x (poor, €0) to 1.8x (rich, €100k+)
  const speedMultiplier = Math.min(1.8, Math.max(0.6, 0.6 + (playerMoney / 100000) * 1.2));
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'success' | 'fail' | 'finished'>('ready');
  const [currentStage, setCurrentStage] = useState(0);
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const [score, setScore] = useState(0);
  const [stageResults, setStageResults] = useState<('perfect' | 'good' | 'miss')[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const stage = STAGES[currentStage];
  const greenStart = 50 - stage.greenWidth / 2;
  const greenEnd = 50 + stage.greenWidth / 2;

  const startGame = () => {
    setGameState('playing');
    setCurrentStage(0);
    setPosition(0);
    setDirection(1);
    setScore(0);
    setStageResults([]);
    lastTimeRef.current = performance.now();
  };

  const gameLoop = useCallback((timestamp: number) => {
    const deltaTime = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    setPosition(prev => {
      let newPos = prev + direction * stage.speed * speedMultiplier * deltaTime * 60;
      if (newPos >= 100) {
        newPos = 100;
        setDirection(-1);
      } else if (newPos <= 0) {
        newPos = 0;
        setDirection(1);
      }
      return newPos;
    });

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [direction, stage.speed, speedMultiplier]);

  useEffect(() => {
    if (gameState === 'playing') {
      lastTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, gameLoop]);

  const handleTap = () => {
    if (gameState !== 'playing') return;
    
    haptics.mediumTap();
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const perfectStart = greenStart + stage.greenWidth * 0.35;
    const perfectEnd = greenEnd - stage.greenWidth * 0.35;
    
    let result: 'perfect' | 'good' | 'miss';
    let stageScore = 0;

    if (position >= perfectStart && position <= perfectEnd) {
      result = 'perfect';
      stageScore = 100;
      haptics.success();
    } else if (position >= greenStart && position <= greenEnd) {
      result = 'good';
      stageScore = 50;
      haptics.lightTap();
    } else {
      result = 'miss';
      stageScore = 0;
      haptics.error();
    }

    setScore(prev => prev + stageScore);
    setStageResults(prev => [...prev, result]);

    if (result === 'miss') {
      setGameState('fail');
    } else if (currentStage >= STAGES.length - 1) {
      setGameState('success');
    } else {
      // Brief pause before next stage
      setGameState('success');
      setTimeout(() => {
        setCurrentStage(prev => prev + 1);
        setPosition(0);
        setDirection(1);
        setGameState('playing');
        lastTimeRef.current = performance.now();
      }, 600);
    }
  };

  const handleComplete = () => {
    const won = stageResults.length === STAGES.length && !stageResults.includes('miss');
    onComplete({
      score,
      won,
      effects: won 
        ? { moneyDelta: score * 3, iqDelta: 2 }
        : { healthDelta: -5 }
    });
  };

  if (gameState === 'ready') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <span className="text-2xl">🤏</span> Taschendiebstahl
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Drücke im richtigen Moment, wenn der Balken im grünen Bereich ist!
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 3 Stufen mit steigender Schwierigkeit</li>
            <li>• Treffe den grünen Bereich zum Erfolg</li>
            <li>• Triff die Mitte für Perfekt-Bonus!</li>
          </ul>
          <Button onClick={startGame} className="w-full touch-target">
            Starten
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'fail' || (gameState === 'success' && currentStage >= STAGES.length - 1)) {
    const won = !stageResults.includes('miss') && stageResults.length === STAGES.length;
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {won ? '✅ Erfolgreich!' : '❌ Erwischt!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-4xl font-bold">{score}</p>
            <p className="text-muted-foreground">Punkte</p>
          </div>
          
          <div className="flex justify-center gap-2">
            {STAGES.map((s, i) => (
              <div 
                key={i}
                className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center text-xs ${
                  stageResults[i] === 'perfect' 
                    ? 'bg-green-500/20 border-2 border-green-500' 
                    : stageResults[i] === 'good'
                      ? 'bg-yellow-500/20 border-2 border-yellow-500'
                      : stageResults[i] === 'miss'
                        ? 'bg-red-500/20 border-2 border-red-500'
                        : 'bg-muted border-2 border-muted'
                }`}
              >
                <span className="text-lg">
                  {stageResults[i] === 'perfect' ? '⭐' : stageResults[i] === 'good' ? '✓' : stageResults[i] === 'miss' ? '✗' : '?'}
                </span>
                <span className="text-muted-foreground mt-1">Stufe {i + 1}</span>
              </div>
            ))}
          </div>

          {won ? (
            <p className="text-center text-green-500">+€{score * 3} Beute, +2 IQ</p>
          ) : (
            <p className="text-center text-destructive">-5 Gesundheit (Flucht)</p>
          )}
          <Button onClick={handleComplete} className="w-full touch-target">
            Weiter
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto select-none">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Stufe {currentStage + 1}/3</span>
          <span className="text-sm font-medium">Score: {score}</span>
        </div>
        <p className="text-center text-lg font-semibold text-primary mt-2">
          {stage.name}
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {/* Timing Bar */}
        <div 
          className="relative h-16 bg-muted rounded-lg overflow-hidden cursor-pointer touch-manipulation"
          onClick={handleTap}
          onTouchStart={(e) => {
            e.preventDefault();
            handleTap();
          }}
        >
          {/* Red zones */}
          <div className="absolute inset-0 bg-red-500/30" />
          
          {/* Green zone */}
          <div 
            className="absolute top-0 bottom-0 bg-green-500/50"
            style={{ 
              left: `${greenStart}%`, 
              width: `${stage.greenWidth}%` 
            }}
          />
          
          {/* Perfect zone (center of green) */}
          <div 
            className="absolute top-0 bottom-0 bg-green-400/70"
            style={{ 
              left: `${greenStart + stage.greenWidth * 0.35}%`, 
              width: `${stage.greenWidth * 0.3}%` 
            }}
          />

          {/* Moving indicator */}
          <motion.div
            className="absolute top-1 bottom-1 w-2 bg-white rounded-full shadow-lg shadow-white/50"
            style={{ left: `calc(${position}% - 4px)` }}
          />

          {/* Stage indicators */}
          <div className="absolute bottom-1 left-2 flex gap-1">
            {STAGES.map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < currentStage 
                    ? 'bg-green-500' 
                    : i === currentStage 
                      ? 'bg-white animate-pulse' 
                      : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Large tap button for mobile */}
        <Button 
          onClick={handleTap}
          onTouchStart={(e) => {
            e.preventDefault();
            handleTap();
          }}
          className="w-full h-20 text-2xl font-bold touch-target touch-manipulation"
          variant="default"
        >
          ZUGREIFEN!
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Tippe wenn der Balken im grünen Bereich ist!
        </p>
      </CardContent>
    </Card>
  );
};

export default PickpocketGame;
