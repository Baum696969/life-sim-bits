import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Lock, Shield, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { soundManager } from '@/lib/soundManager';
import { haptics } from '@/lib/haptics';

interface BankHeistProps {
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
}

interface Vault {
  id: number;
  combination: number[];
  cracked: boolean;
  value: number;
}

interface Guard {
  id: number;
  x: number;
  y: number;
  direction: 'left' | 'right';
  alertLevel: number;
}

const BankHeist = ({ onComplete }: BankHeistProps) => {
  const isMobile = useIsMobile();
  const [gameState, setGameState] = useState<'ready' | 'countdown' | 'cracking' | 'escaping' | 'gameover'>('ready');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(45);
  const [phase, setPhase] = useState<'vault' | 'escape'>('vault');
  
  // Vault cracking
  const [currentVault, setCurrentVault] = useState(0);
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [dialPosition, setDialPosition] = useState(0);
  const [enteredCombination, setEnteredCombination] = useState<number[]>([]);
  const [combinationIndex, setCombinationIndex] = useState(0);
  const [loot, setLoot] = useState(0);
  
  // Escape phase
  const [playerX, setPlayerX] = useState(50);
  const [playerY, setPlayerY] = useState(90);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [alertLevel, setAlertLevel] = useState(0);
  const [escaped, setEscaped] = useState(false);
  
  const gameLoopRef = useRef<number>();
  const keysRef = useRef<Set<string>>(new Set());
  const escapeLastFrameRef = useRef<number | null>(null);

  const initVaults = useCallback(() => {
    const newVaults: Vault[] = [
      { id: 1, combination: [25, 50, 75], cracked: false, value: 5000 },
      { id: 2, combination: [10, 40, 80], cracked: false, value: 8000 },
      { id: 3, combination: [30, 60, 90], cracked: false, value: 15000 },
    ];
    setVaults(newVaults);
    setCurrentVault(0);
    setDialPosition(0);
    setEnteredCombination([]);
    setCombinationIndex(0);
    setLoot(0);
    setTimeLeft(45);
  }, []);

  const initEscape = useCallback(() => {
    setPhase('escape');
    setPlayerX(50);
    setPlayerY(90);
    setGuards([
      { id: 1, x: 20, y: 20, direction: 'right', alertLevel: 0 },
      { id: 2, x: 80, y: 40, direction: 'left', alertLevel: 0 },
      { id: 3, x: 50, y: 60, direction: 'right', alertLevel: 0 },
    ]);
    setAlertLevel(0);
    setEscaped(false);
  }, []);

  const startGame = () => {
    setGameState('countdown');
    setCountdown(3);
    haptics.mediumTap();
  };

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      initVaults();
      setPhase('vault');
      setGameState('cracking');
      soundManager.playMinigameStart();
    }
  }, [gameState, countdown, initVaults]);

  // Timer
  useEffect(() => {
    if (gameState !== 'cracking' && gameState !== 'escaping') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('gameover');
          soundManager.playMinigameLose();
          haptics.error();
          return 0;
        }
        if (prev <= 10) {
          soundManager.playTimerWarning();
          haptics.timerWarning();
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState]);

  // Handle dial rotation
  const rotateDial = (direction: 'left' | 'right') => {
    if (gameState !== 'cracking') return;
    
    haptics.lightTap();
    soundManager.playClick();
    
    setDialPosition(prev => {
      let newPos = direction === 'right' ? prev + 5 : prev - 5;
      if (newPos < 0) newPos = 95;
      if (newPos >= 100) newPos = 0;
      return newPos;
    });
  };

  const confirmNumber = () => {
    if (gameState !== 'cracking') return;
    
    const vault = vaults[currentVault];
    if (!vault) return;
    
    const targetNumber = vault.combination[combinationIndex];
    const tolerance = 3;
    
    if (Math.abs(dialPosition - targetNumber) <= tolerance || 
        Math.abs(dialPosition - targetNumber + 100) <= tolerance ||
        Math.abs(dialPosition - targetNumber - 100) <= tolerance) {
      // Correct number!
      soundManager.playCorrectAnswer();
      haptics.success();
      
      const newCombination = [...enteredCombination, dialPosition];
      setEnteredCombination(newCombination);
      
      if (combinationIndex + 1 >= vault.combination.length) {
        // Vault cracked!
        soundManager.playCrimeSuccess();
        haptics.coins();
        setLoot(prev => prev + vault.value);
        
        const updatedVaults = [...vaults];
        updatedVaults[currentVault].cracked = true;
        setVaults(updatedVaults);
        
        if (currentVault + 1 < vaults.length) {
          // Move to next vault
          setCurrentVault(prev => prev + 1);
          setEnteredCombination([]);
          setCombinationIndex(0);
          setDialPosition(0);
        } else {
          // All vaults cracked, escape!
          initEscape();
          setGameState('escaping');
        }
      } else {
        setCombinationIndex(prev => prev + 1);
      }
    } else {
      // Wrong number
      soundManager.playWrongAnswer();
      haptics.error();
      setAlertLevel(prev => Math.min(100, prev + 15));
      setEnteredCombination([]);
      setCombinationIndex(0);
      
      if (alertLevel >= 85) {
        setGameState('gameover');
        soundManager.playCrimeFail();
        haptics.alarm();
      }
    }
  };

  // Escape phase game loop
  useEffect(() => {
    if (gameState !== 'escaping') return;

    const handleKeyDown = (e: KeyboardEvent) => keysRef.current.add(e.key.toLowerCase());
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = (ts: number) => {
      const keys = keysRef.current;
      const last = escapeLastFrameRef.current ?? ts;
      const dtMs = ts - last;
      escapeLastFrameRef.current = ts;
      const dtFactor = Math.min(3, Math.max(0.5, dtMs / (1000 / 60)));

      const speed = 2 * dtFactor;
      
      setPlayerX(prev => {
        let newX = prev;
        if (keys.has('a') || keys.has('arrowleft')) newX -= speed;
        if (keys.has('d') || keys.has('arrowright')) newX += speed;
        return Math.max(5, Math.min(95, newX));
      });
      
      setPlayerY(prev => {
        let newY = prev;
        if (keys.has('w') || keys.has('arrowup')) newY -= speed;
        if (keys.has('s') || keys.has('arrowdown')) newY += speed;
        
        // Check if reached exit
        if (newY <= 5) {
          setEscaped(true);
          setGameState('gameover');
          soundManager.playMinigameWin();
          haptics.celebration();
        }
        
        return Math.max(5, Math.min(95, newY));
      });
      
      // Move guards
      setGuards(prev => prev.map(guard => {
        let newX = guard.x + (guard.direction === 'right' ? 0.5 : -0.5) * dtFactor;
        let newDirection = guard.direction;
        
        if (newX <= 10) newDirection = 'right';
        if (newX >= 90) newDirection = 'left';
        
        return { ...guard, x: newX, direction: newDirection };
      }));
      
      // Check guard detection
      setGuards(prev => {
        let detected = false;
        prev.forEach(guard => {
          const dist = Math.sqrt(Math.pow(guard.x - playerX, 2) + Math.pow(guard.y - playerY, 2));
          if (dist < 15) {
            detected = true;
          }
        });
        
        if (detected) {
          setAlertLevel(al => {
            const newLevel = al + 2 * dtFactor;
            if (newLevel >= 100) {
              setGameState('gameover');
              soundManager.playCrimeFail();
              haptics.alarm();
            }
            return Math.min(100, newLevel);
          });
        }
        
        return prev;
      });
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    escapeLastFrameRef.current = null;
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, playerX, playerY]);

  // Mobile controls for escape
  const handleMobileMove = (dx: number, dy: number) => {
    if (gameState !== 'escaping') return;
    haptics.lightTap();
    
    setPlayerX(prev => Math.max(5, Math.min(95, prev + dx * 5)));
    setPlayerY(prev => {
      const newY = Math.max(5, Math.min(95, prev + dy * 5));
      if (newY <= 5) {
        setEscaped(true);
        setGameState('gameover');
        soundManager.playMinigameWin();
        haptics.celebration();
      }
      return newY;
    });
  };

  useEffect(() => {
    if (gameState === 'gameover') {
      const won = escaped && loot > 0;
      const score = won ? loot : 0;
      const moneyGain = won ? loot : 0;
      const prisonYears = !won && alertLevel >= 100 ? Math.floor(10 + Math.random() * 15) : 0;
      
      setTimeout(() => {
        onComplete({
          score,
          won,
          effects: {
            moneyDelta: moneyGain,
            prisonYears,
          },
        });
      }, 2000);
    }
  }, [gameState, escaped, loot, alertLevel, onComplete]);

  const dialSize = isMobile ? 180 : 220;
  const buttonSize = isMobile ? 'min-h-[56px] text-lg' : 'min-h-[48px]';

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto px-2">
      <div className="flex items-center gap-2 text-destructive">
        <Shield className="h-6 w-6" />
        <h2 className="font-display text-xl md:text-2xl">Banküberfall</h2>
      </div>

      {gameState === 'ready' && (
        <div className="text-center">
          <p className="text-muted-foreground mb-4 text-sm md:text-base">
            Knacke die Tresore und fliehe! Drehe das Rad und bestätige die richtigen Zahlen.
          </p>
          <Button onClick={startGame} className={`game-btn bg-destructive ${buttonSize}`}>
            <Play className="mr-2 h-5 w-5" /> Überfall starten
          </Button>
        </div>
      )}

      {gameState === 'countdown' && (
        <motion.div
          key={countdown}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="text-6xl font-display text-destructive"
        >
          {countdown}
        </motion.div>
      )}

      {gameState === 'cracking' && vaults[currentVault] && (
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Status Bar */}
          <div className="flex justify-between w-full text-sm">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Tresor {currentVault + 1}/{vaults.length}</span>
            </div>
            <div className={`font-bold ${timeLeft <= 10 ? 'text-destructive animate-pulse' : ''}`}>
              ⏱️ {timeLeft}s
            </div>
            <div className="text-success">💰 €{loot.toLocaleString()}</div>
          </div>
          
          {/* Alert Level */}
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Alarm
              </span>
              <span>{alertLevel}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${alertLevel > 60 ? 'bg-destructive' : alertLevel > 30 ? 'bg-warning' : 'bg-success'}`}
                style={{ width: `${alertLevel}%` }}
              />
            </div>
          </div>

          {/* Dial */}
          <div 
            className="relative rounded-full border-4 border-muted bg-card"
            style={{ width: dialSize, height: dialSize }}
          >
            {/* Numbers around dial */}
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(num => {
              const angle = (num / 100) * 360 - 90;
              const rad = angle * (Math.PI / 180);
              const radius = dialSize / 2 - 20;
              const x = Math.cos(rad) * radius + dialSize / 2;
              const y = Math.sin(rad) * radius + dialSize / 2;
              
              return (
                <span
                  key={num}
                  className="absolute text-xs text-muted-foreground"
                  style={{ 
                    left: x - 8, 
                    top: y - 8,
                    width: 16,
                    textAlign: 'center'
                  }}
                >
                  {num}
                </span>
              );
            })}
            
            {/* Dial pointer */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-2 bg-destructive rounded-full origin-bottom"
              style={{ 
                height: dialSize / 2 - 30,
                marginLeft: -4,
                marginTop: -(dialSize / 2 - 30),
              }}
              animate={{ rotate: (dialPosition / 100) * 360 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            
            {/* Center */}
            <div 
              className="absolute bg-primary rounded-full"
              style={{
                width: 20,
                height: 20,
                left: dialSize / 2 - 10,
                top: dialSize / 2 - 10,
              }}
            />
          </div>
          
          {/* Current dial position */}
          <div className="text-2xl font-display">{dialPosition}</div>
          
          {/* Combination progress */}
          <div className="flex gap-2">
            {vaults[currentVault].combination.map((_, i) => (
              <div 
                key={i}
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-display border-2 ${
                  i < combinationIndex ? 'bg-success/20 border-success' : 
                  i === combinationIndex ? 'border-primary animate-pulse' : 
                  'border-muted'
                }`}
              >
                {enteredCombination[i] ?? '?'}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-4 w-full justify-center">
            <Button
              onClick={() => rotateDial('left')}
              onTouchStart={(e) => { e.preventDefault(); rotateDial('left'); }}
              className={`${buttonSize} px-8 touch-manipulation`}
              variant="outline"
            >
              ← Links
            </Button>
            <Button
              onClick={confirmNumber}
              onTouchStart={(e) => { e.preventDefault(); confirmNumber(); }}
              className={`${buttonSize} px-8 bg-success touch-manipulation`}
            >
              ✓ OK
            </Button>
            <Button
              onClick={() => rotateDial('right')}
              onTouchStart={(e) => { e.preventDefault(); rotateDial('right'); }}
              className={`${buttonSize} px-8 touch-manipulation`}
              variant="outline"
            >
              Rechts →
            </Button>
          </div>
        </div>
      )}

      {gameState === 'escaping' && (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex justify-between w-full text-sm">
            <div className={`font-bold ${timeLeft <= 10 ? 'text-destructive animate-pulse' : ''}`}>
              ⏱️ {timeLeft}s
            </div>
            <div className="text-success">💰 €{loot.toLocaleString()}</div>
          </div>
          
          {/* Alert Level */}
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span>🚨 Alarm</span>
              <span>{alertLevel}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${alertLevel > 60 ? 'bg-destructive' : 'bg-warning'}`}
                style={{ width: `${alertLevel}%` }}
              />
            </div>
          </div>

          {/* Escape Map */}
          <div className="relative w-full aspect-square max-w-[300px] bg-muted/30 rounded-lg border-2 border-muted overflow-hidden">
            {/* Exit */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-success text-center text-xs text-white font-bold rounded-b">
              AUSGANG
            </div>
            
            {/* Guards */}
            {guards.map(guard => (
              <motion.div
                key={guard.id}
                className="absolute w-6 h-6 flex items-center justify-center text-xl"
                style={{ left: `${guard.x}%`, top: `${guard.y}%` }}
                animate={{ x: '-50%', y: '-50%' }}
              >
                👮
              </motion.div>
            ))}
            
            {/* Detection ranges */}
            {guards.map(guard => (
              <motion.div
                key={`range-${guard.id}`}
                className="absolute rounded-full bg-destructive/10 border border-destructive/30"
                style={{ 
                  left: `${guard.x}%`, 
                  top: `${guard.y}%`,
                  width: 60,
                  height: 60,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
            
            {/* Player */}
            <motion.div
              className="absolute w-6 h-6 flex items-center justify-center text-xl"
              style={{ left: `${playerX}%`, top: `${playerY}%` }}
              animate={{ x: '-50%', y: '-50%' }}
            >
              🏃
            </motion.div>
          </div>

          {/* Mobile Controls */}
          {isMobile && (
            <div className="grid grid-cols-3 gap-2 w-full max-w-[200px]">
              <div />
              <Button
                onTouchStart={(e) => { e.preventDefault(); handleMobileMove(0, -1); }}
                className="h-14 touch-manipulation"
                variant="outline"
              >
                ↑
              </Button>
              <div />
              <Button
                onTouchStart={(e) => { e.preventDefault(); handleMobileMove(-1, 0); }}
                className="h-14 touch-manipulation"
                variant="outline"
              >
                ←
              </Button>
              <div className="h-14 bg-muted/20 rounded-lg" />
              <Button
                onTouchStart={(e) => { e.preventDefault(); handleMobileMove(1, 0); }}
                className="h-14 touch-manipulation"
                variant="outline"
              >
                →
              </Button>
              <div />
              <Button
                onTouchStart={(e) => { e.preventDefault(); handleMobileMove(0, 1); }}
                className="h-14 touch-manipulation"
                variant="outline"
              >
                ↓
              </Button>
              <div />
            </div>
          )}
          
          {!isMobile && (
            <p className="text-xs text-muted-foreground">WASD oder Pfeiltasten zum Bewegen</p>
          )}
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="text-center animate-bounce-in">
          {escaped ? (
            <>
              <p className="text-2xl font-display text-success mb-2">🏃 Entkommen!</p>
              <p className="text-xl">💰 €{loot.toLocaleString()} erbeutet!</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-display text-destructive mb-2">🚔 Erwischt!</p>
              <p className="text-muted-foreground">Die Polizei hat dich geschnappt!</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BankHeist;
