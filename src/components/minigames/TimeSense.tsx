import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Timer, Target, Play, RotateCcw } from 'lucide-react';

interface TimeSenseProps {
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
  playerAge?: number;
}

const DIFFICULTY_LEVELS = [
  { targetSeconds: 3, tolerance: 0.5, points: 50 },
  { targetSeconds: 5, tolerance: 0.6, points: 75 },
  { targetSeconds: 7, tolerance: 0.7, points: 100 },
  { targetSeconds: 10, tolerance: 0.8, points: 150 },
  { targetSeconds: 15, tolerance: 1.0, points: 200 },
];

const TimeSense = ({ onComplete, playerAge = 25 }: TimeSenseProps) => {
  const [gameState, setGameState] = useState<'ready' | 'waiting' | 'running' | 'result' | 'gameOver'>('ready');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [resultMessage, setResultMessage] = useState('');
  const [difference, setDifference] = useState(0);
  const [perfectStreak, setPerfectStreak] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [roundScores, setRoundScores] = useState<{ target: number; actual: number; score: number }[]>([]);
  
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  const currentDifficulty = DIFFICULTY_LEVELS[currentLevel] || DIFFICULTY_LEVELS[DIFFICULTY_LEVELS.length - 1];

  const startRound = useCallback(() => {
    setGameState('waiting');
    // Small countdown before starting
    setTimeout(() => {
      setGameState('running');
      startTimeRef.current = Date.now();
      setElapsedTime(0);
      
      // Hidden timer for internal tracking (not shown to player)
      const updateTime = () => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setElapsedTime(elapsed);
        if (elapsed < 30) { // Max 30 seconds
          animationFrameRef.current = requestAnimationFrame(updateTime);
        } else {
          handleStop();
        }
      };
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }, 1000);
  }, []);

  const handleStop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const actualTime = (Date.now() - startTimeRef.current) / 1000;
    const target = currentDifficulty.targetSeconds;
    const diff = Math.abs(actualTime - target);
    const tolerance = currentDifficulty.tolerance;
    
    let roundScore = 0;
    let message = '';
    let isPerfect = false;

    if (diff <= 0.1) {
      // Perfect!
      roundScore = currentDifficulty.points * 2;
      message = '🎯 PERFEKT!';
      isPerfect = true;
    } else if (diff <= tolerance * 0.5) {
      // Excellent
      roundScore = Math.round(currentDifficulty.points * 1.5);
      message = '⭐ Ausgezeichnet!';
    } else if (diff <= tolerance) {
      // Good
      roundScore = currentDifficulty.points;
      message = '✓ Gut!';
    } else if (diff <= tolerance * 2) {
      // Close
      roundScore = Math.round(currentDifficulty.points * 0.5);
      message = '→ Knapp daneben';
    } else {
      // Too far
      roundScore = 0;
      message = actualTime > target ? '⏰ Zu spät!' : '⚡ Zu früh!';
    }

    // Streak bonus
    if (isPerfect) {
      setPerfectStreak(prev => prev + 1);
      if (perfectStreak >= 2) {
        roundScore = Math.round(roundScore * 1.5);
        message += ` (${perfectStreak + 1}er Streak!)`;
      }
    } else {
      setPerfectStreak(0);
    }

    setDifference(diff);
    setResultMessage(message);
    setTotalScore(prev => prev + roundScore);
    setRoundScores(prev => [...prev, { target, actual: actualTime, score: roundScore }]);
    setAttempts(prev => prev + 1);
    setGameState('result');
  }, [currentDifficulty, perfectStreak]);

  const nextRound = () => {
    if (currentLevel < DIFFICULTY_LEVELS.length - 1) {
      setCurrentLevel(prev => prev + 1);
      startRound();
    } else {
      // Game over - all levels completed
      setGameState('gameOver');
    }
  };

  const handleFinish = () => {
    const avgAccuracy = roundScores.length > 0 
      ? roundScores.reduce((sum, r) => sum + Math.abs(r.target - r.actual), 0) / roundScores.length 
      : 999;
    const won = totalScore >= 200;
    
    const effects: any = {};
    if (won) {
      effects.iqDelta = Math.min(5, Math.floor(totalScore / 100));
      effects.luckDelta = Math.floor(totalScore / 150);
    }

    onComplete({ score: totalScore, won, effects });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="p-6 text-center">
      <h2 className="font-display text-2xl text-primary mb-2 flex items-center justify-center gap-2">
        <Timer className="h-6 w-6" /> Zeitgefühl
      </h2>
      <p className="text-muted-foreground text-sm mb-6">
        Stoppe genau nach der angegebenen Zeit - ohne Uhr!
      </p>

      <AnimatePresence mode="wait">
        {gameState === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="bg-muted/30 rounded-lg p-6">
              <h3 className="font-medium text-lg mb-3">Spielanleitung</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Dir wird eine Zielzeit angezeigt. Drücke "Stopp" wenn du glaubst, 
                dass genau diese Zeit vergangen ist. Je näher du dran bist, desto mehr Punkte!
              </p>
              <div className="text-sm space-y-1">
                <p>🎯 Perfekt (±0.1s): Doppelte Punkte</p>
                <p>⭐ Ausgezeichnet: 1.5x Punkte</p>
                <p>✓ Gut: Volle Punkte</p>
                <p>🔥 Perfekt-Streak: Bonus-Multiplikator</p>
              </div>
            </div>
            <Button 
              onClick={startRound} 
              onTouchStart={(e) => { e.preventDefault(); startRound(); }}
              size="lg" 
              className="gap-2 touch-manipulation"
            >
              <Play className="h-5 w-5" /> Spiel starten
            </Button>
          </motion.div>
        )}

        {gameState === 'waiting' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="py-12"
          >
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-xl text-muted-foreground">Mach dich bereit...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Ziel: <span className="text-primary font-bold text-2xl">{currentDifficulty.targetSeconds}</span> Sekunden
            </p>
          </motion.div>
        )}

        {gameState === 'running' && (
          <motion.div
            key="running"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8"
          >
            <div className="mb-6">
              <p className="text-lg text-muted-foreground mb-2">Stoppe bei</p>
              <div className="text-6xl font-display text-primary">
                {currentDifficulty.targetSeconds}s
              </div>
              <p className="text-sm text-muted-foreground mt-2">Level {currentLevel + 1} / {DIFFICULTY_LEVELS.length}</p>
            </div>
            
            {/* Pulsing indicator to show time is passing */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-24 h-24 mx-auto mb-8 rounded-full bg-primary/20 flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/40 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary" />
              </div>
            </motion.div>

            <Button 
              onClick={handleStop} 
              onTouchStart={(e) => { e.preventDefault(); handleStop(); }}
              size="lg" 
              variant="destructive"
              className="text-xl px-12 py-8 touch-manipulation active:scale-95 transition-transform"
            >
              <Target className="h-6 w-6 mr-2" /> STOPP!
            </Button>
          </motion.div>
        )}

        {gameState === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="py-6"
          >
            <div className="text-4xl mb-4">{resultMessage}</div>
            
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Ziel</p>
                  <p className="text-2xl font-display text-primary">{currentDifficulty.targetSeconds}s</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deine Zeit</p>
                  <p className="text-2xl font-display">{elapsedTime.toFixed(2)}s</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground">Abweichung</p>
                <p className={`text-xl font-bold ${difference <= currentDifficulty.tolerance ? 'text-success' : 'text-destructive'}`}>
                  {difference > 0 ? '+' : ''}{(elapsedTime - currentDifficulty.targetSeconds).toFixed(2)}s
                </p>
              </div>
            </div>

            <p className="text-lg mb-4">
              Runden-Punkte: <span className="text-primary font-bold">{roundScores[roundScores.length - 1]?.score || 0}</span>
            </p>
            <p className="text-xl mb-6">
              Gesamt: <span className="text-primary font-display text-2xl">{totalScore}</span> Punkte
            </p>

            {currentLevel < DIFFICULTY_LEVELS.length - 1 ? (
              <Button onClick={nextRound} size="lg" className="gap-2">
                Weiter zu Level {currentLevel + 2}
              </Button>
            ) : (
              <Button onClick={handleFinish} size="lg" className="gap-2">
                Spiel beenden
              </Button>
            )}
          </motion.div>
        )}

        {gameState === 'gameOver' && (
          <motion.div
            key="gameOver"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="py-6"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-display text-primary mb-4">Spiel beendet!</h3>
            
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <p className="text-lg mb-2">
                Endpunktzahl: <span className="text-primary font-display text-3xl">{totalScore}</span>
              </p>
              
              <div className="space-y-2 mt-4">
                <p className="text-sm text-muted-foreground">Deine Runden:</p>
                {roundScores.map((round, i) => (
                  <div key={i} className="flex justify-between text-sm bg-background/50 rounded p-2">
                    <span>Level {i + 1}: {round.target}s → {round.actual.toFixed(2)}s</span>
                    <span className="text-primary">+{round.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={handleFinish} size="lg">
                Ergebnis bestätigen
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimeSense;
