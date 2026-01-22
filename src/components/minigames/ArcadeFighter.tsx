import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { soundManager } from '@/lib/soundManager';
import { haptics } from '@/lib/haptics';

interface ArcadeFighterProps {
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
}

type FighterType = 'woman' | 'man';

interface Fighter {
  type: FighterType;
  x: number;
  health: number;
  maxHealth: number;
  isAttacking: boolean;
  attackFrame: number;
  damage: number;
  range: number;
  emoji: string;
  name: string;
}

const ArcadeFighter = ({ onComplete }: ArcadeFighterProps) => {
  const isMobile = useIsMobile();
  const [gameState, setGameState] = useState<'select' | 'ready' | 'countdown' | 'playing' | 'gameover'>('select');
  const [countdown, setCountdown] = useState(3);
  const [selectedFighter, setSelectedFighter] = useState<FighterType | null>(null);
  
  const [player, setPlayer] = useState<Fighter | null>(null);
  const [enemy, setEnemy] = useState<Fighter | null>(null);
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);
  
  const gameLoopRef = useRef<number>();
  const keysRef = useRef<Set<string>>(new Set());
  const lastAIActionRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const createFighter = (type: FighterType, isPlayer: boolean): Fighter => {
    if (type === 'woman') {
      return {
        type: 'woman',
        x: isPlayer ? 20 : 80,
        health: 100,
        maxHealth: 100,
        isAttacking: false,
        attackFrame: 0,
        damage: 5,
        range: 25, // Good range
        emoji: '👩',
        name: 'Kickerin',
      };
    } else {
      return {
        type: 'man',
        x: isPlayer ? 20 : 80,
        health: 100,
        maxHealth: 100,
        isAttacking: false,
        attackFrame: 0,
        damage: 8,
        range: 12, // Low range
        emoji: '👨',
        name: 'Boxer',
      };
    }
  };

  const selectFighter = (type: FighterType) => {
    haptics.mediumTap();
    soundManager.playClick();
    setSelectedFighter(type);
    setGameState('ready');
  };

  const startGame = () => {
    if (!selectedFighter) return;
    
    const playerFighter = createFighter(selectedFighter, true);
    const enemyType: FighterType = selectedFighter === 'woman' ? 'man' : 'woman';
    const enemyFighter = createFighter(enemyType, false);
    
    setPlayer(playerFighter);
    setEnemy(enemyFighter);
    setGameState('countdown');
    setCountdown(3);
    haptics.mediumTap();
  };

  // Countdown
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      setGameState('playing');
      soundManager.playMinigameStart();
    }
  }, [gameState, countdown]);

  // Attack function
  const performAttack = useCallback((attacker: Fighter, defender: Fighter, isPlayer: boolean) => {
    const distance = Math.abs(attacker.x - defender.x);
    
    if (distance <= attacker.range && !attacker.isAttacking) {
      soundManager.playHit();
      haptics.hit();
      
      const newDefenderHealth = Math.max(0, defender.health - attacker.damage);
      
      if (isPlayer) {
        setEnemy(prev => prev ? { ...prev, health: newDefenderHealth } : null);
        setPlayer(prev => prev ? { ...prev, isAttacking: true, attackFrame: 10 } : null);
      } else {
        setPlayer(prev => prev ? { ...prev, health: newDefenderHealth } : null);
        setEnemy(prev => prev ? { ...prev, isAttacking: true, attackFrame: 10 } : null);
      }
      
      return newDefenderHealth;
    }
    return defender.health;
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing' || !player || !enemy) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      const keys = keysRef.current;
      const now = Date.now();
      
      // Player movement
      setPlayer(prev => {
        if (!prev) return null;
        let newX = prev.x;
        const speed = 2;
        
        if (keys.has('a') || keys.has('arrowleft')) newX -= speed;
        if (keys.has('d') || keys.has('arrowright')) newX += speed;
        
        newX = Math.max(5, Math.min(95, newX));
        
        // Decrease attack frame
        const newAttackFrame = prev.attackFrame > 0 ? prev.attackFrame - 1 : 0;
        
        return { ...prev, x: newX, attackFrame: newAttackFrame, isAttacking: newAttackFrame > 0 };
      });

      // Player attack
      if ((keys.has(' ') || keys.has('enter')) && player && enemy && !player.isAttacking) {
        performAttack(player, enemy, true);
      }

      // AI movement and attack
      setEnemy(prev => {
        if (!prev || !player) return null;
        
        let newX = prev.x;
        const distance = player.x - prev.x;
        const absDistance = Math.abs(distance);
        
        // AI logic: move towards player, attack when in range
        if (absDistance > prev.range + 5) {
          // Move towards player
          newX += distance > 0 ? 1 : -1;
        } else if (absDistance < prev.range - 3) {
          // Too close, back off slightly
          newX += distance > 0 ? -0.5 : 0.5;
        }
        
        newX = Math.max(5, Math.min(95, newX));
        
        // AI attack with cooldown
        if (now - lastAIActionRef.current > 800 && absDistance <= prev.range && !prev.isAttacking) {
          lastAIActionRef.current = now;
          setTimeout(() => {
            setPlayer(p => {
              if (!p || !prev) return p;
              const newHealth = Math.max(0, p.health - prev.damage);
              soundManager.playHit();
              haptics.hit();
              return { ...p, health: newHealth };
            });
            setEnemy(e => e ? { ...e, isAttacking: true, attackFrame: 10 } : null);
          }, 200);
        }
        
        const newAttackFrame = prev.attackFrame > 0 ? prev.attackFrame - 1 : 0;
        
        return { ...prev, x: newX, attackFrame: newAttackFrame, isAttacking: newAttackFrame > 0 };
      });

      // Check for game over
      if (player && player.health <= 0) {
        setWinner('enemy');
        setGameState('gameover');
        soundManager.playMinigameLose();
        haptics.error();
        return;
      }
      
      if (enemy && enemy.health <= 0) {
        setWinner('player');
        setGameState('gameover');
        soundManager.playMinigameWin();
        haptics.celebration();
        return;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, player, enemy, performAttack]);

  // Mobile controls
  const handleMobileMove = (direction: 'left' | 'right') => {
    if (gameState !== 'playing') return;
    haptics.lightTap();
    
    setPlayer(prev => {
      if (!prev) return null;
      const speed = 5;
      let newX = prev.x + (direction === 'left' ? -speed : speed);
      return { ...prev, x: Math.max(5, Math.min(95, newX)) };
    });
  };

  const handleMobileAttack = () => {
    if (gameState !== 'playing' || !player || !enemy || player.isAttacking) return;
    haptics.hit();
    performAttack(player, enemy, true);
  };

  // Game over effect
  useEffect(() => {
    if (gameState === 'gameover' && winner) {
      const won = winner === 'player';
      const score = won ? (player?.health || 0) : 0;
      
      setTimeout(() => {
        onComplete({
          score,
          won,
          effects: {
            moneyDelta: won ? 50 + score : 0,
            fitnessDelta: won ? 3 : -2,
            healthDelta: won ? 0 : -5,
          },
        });
      }, 2000);
    }
  }, [gameState, winner, player, onComplete]);

  const buttonSize = isMobile ? 'min-h-[56px] text-lg' : 'min-h-[48px]';

  // Health bar component
  const HealthBar = ({ fighter, isPlayer }: { fighter: Fighter; isPlayer: boolean }) => (
    <div className={`flex flex-col ${isPlayer ? 'items-start' : 'items-end'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{fighter.emoji}</span>
        <span className="text-sm font-medium">{fighter.name}</span>
      </div>
      <div className="w-32 h-4 bg-muted rounded-full overflow-hidden border border-primary/30">
        <motion.div
          className={`h-full ${fighter.health > 30 ? 'bg-success' : 'bg-destructive'}`}
          initial={{ width: '100%' }}
          animate={{ width: `${(fighter.health / fighter.maxHealth) * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>
      <span className="text-xs mt-1">{fighter.health} HP</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto px-2">
      <h2 className="font-display text-xl md:text-2xl text-primary">🎮 Arcade Fighter</h2>

      {/* Character Selection */}
      {gameState === 'select' && (
        <div className="text-center w-full">
          <p className="text-muted-foreground mb-6">Wähle deinen Kämpfer:</p>
          
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              onClick={() => selectFighter('woman')}
              className="p-6 rounded-xl border-2 border-primary/30 bg-card hover:border-primary transition-all touch-manipulation"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-6xl mb-3">👩</div>
              <h3 className="font-display text-lg text-primary">Kickerin</h3>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>⚔️ Schaden: <span className="text-warning">5</span></p>
                <p>📏 Reichweite: <span className="text-success">Hoch</span></p>
                <p className="italic mt-2">Tritttechnik mit großer Reichweite</p>
              </div>
            </motion.button>

            <motion.button
              onClick={() => selectFighter('man')}
              className="p-6 rounded-xl border-2 border-primary/30 bg-card hover:border-primary transition-all touch-manipulation"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-6xl mb-3">👨</div>
              <h3 className="font-display text-lg text-destructive">Boxer</h3>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p>⚔️ Schaden: <span className="text-success">8</span></p>
                <p>📏 Reichweite: <span className="text-destructive">Niedrig</span></p>
                <p className="italic mt-2">Starke Fäuste, muss nah ran</p>
              </div>
            </motion.button>
          </div>
        </div>
      )}

      {/* Ready Screen */}
      {gameState === 'ready' && selectedFighter && (
        <div className="text-center">
          <div className="text-6xl mb-4">{selectedFighter === 'woman' ? '👩' : '👨'}</div>
          <p className="text-muted-foreground mb-4">
            Du spielst als <span className="text-primary font-bold">
              {selectedFighter === 'woman' ? 'Kickerin' : 'Boxer'}
            </span>
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            {isMobile ? 'Tippe links/rechts zum Bewegen, Angriff-Button zum Schlagen' : 'A/D oder Pfeiltasten zum Bewegen, Leertaste zum Angreifen'}
          </p>
          <Button onClick={startGame} className={`game-btn bg-primary ${buttonSize}`}>
            <Play className="mr-2 h-5 w-5" /> Kampf starten
          </Button>
        </div>
      )}

      {/* Countdown */}
      {gameState === 'countdown' && (
        <motion.div
          key={countdown}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="text-6xl font-display text-primary"
        >
          {countdown === 0 ? 'FIGHT!' : countdown}
        </motion.div>
      )}

      {/* Game Arena */}
      {(gameState === 'playing' || gameState === 'gameover') && player && enemy && (
        <div className="w-full">
          {/* Health Bars */}
          <div className="flex justify-between mb-4">
            <HealthBar fighter={player} isPlayer={true} />
            <div className="text-2xl font-display text-muted-foreground">VS</div>
            <HealthBar fighter={enemy} isPlayer={false} />
          </div>

          {/* Arena */}
          <div className="relative w-full h-48 bg-gradient-to-b from-muted/30 to-muted/60 rounded-xl border-2 border-primary/30 overflow-hidden">
            {/* Floor */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-muted/50 border-t border-primary/20" />
            
            {/* Player */}
            <motion.div
              className="absolute bottom-8 flex flex-col items-center"
              style={{ left: `${player.x}%` }}
              animate={{ 
                x: '-50%',
                scale: player.isAttacking ? 1.2 : 1,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <span className={`text-4xl ${player.isAttacking ? 'animate-pulse' : ''}`}>
                {player.emoji}
              </span>
              {player.isAttacking && (
                <span className="text-2xl absolute -right-6">
                  {player.type === 'woman' ? '🦵' : '👊'}
                </span>
              )}
              <div className="w-12 h-1 bg-success/50 rounded mt-1" />
            </motion.div>

            {/* Enemy */}
            <motion.div
              className="absolute bottom-8 flex flex-col items-center"
              style={{ left: `${enemy.x}%` }}
              animate={{ 
                x: '-50%',
                scale: enemy.isAttacking ? 1.2 : 1,
                scaleX: -1, // Face the player
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <span className={`text-4xl ${enemy.isAttacking ? 'animate-pulse' : ''}`}>
                {enemy.emoji}
              </span>
              {enemy.isAttacking && (
                <span className="text-2xl absolute -left-6" style={{ transform: 'scaleX(-1)' }}>
                  {enemy.type === 'woman' ? '🦵' : '👊'}
                </span>
              )}
              <div className="w-12 h-1 bg-destructive/50 rounded mt-1" />
            </motion.div>

            {/* Range indicators (subtle) */}
            <motion.div
              className="absolute bottom-8 border-2 border-dashed border-success/20 rounded-full"
              style={{ 
                left: `${player.x}%`,
                width: player.range * 2,
                height: 40,
                transform: 'translateX(-50%)',
              }}
            />
          </div>

          {/* Mobile Controls */}
          {isMobile && gameState === 'playing' && (
            <div className="flex justify-between gap-4 mt-4">
              <div className="flex gap-2">
                <Button
                  onTouchStart={(e) => { e.preventDefault(); handleMobileMove('left'); }}
                  className="h-16 w-16 text-2xl touch-manipulation"
                  variant="outline"
                >
                  ←
                </Button>
                <Button
                  onTouchStart={(e) => { e.preventDefault(); handleMobileMove('right'); }}
                  className="h-16 w-16 text-2xl touch-manipulation"
                  variant="outline"
                >
                  →
                </Button>
              </div>
              <Button
                onTouchStart={(e) => { e.preventDefault(); handleMobileAttack(); }}
                className="h-16 px-8 text-xl bg-destructive touch-manipulation"
              >
                {player.type === 'woman' ? '🦵 Tritt' : '👊 Schlag'}
              </Button>
            </div>
          )}

          {!isMobile && gameState === 'playing' && (
            <p className="text-center text-xs text-muted-foreground mt-2">
              A/D = Bewegen | Leertaste = Angriff
            </p>
          )}
        </div>
      )}

      {/* Game Over */}
      {gameState === 'gameover' && (
        <div className="text-center animate-bounce-in">
          {winner === 'player' ? (
            <>
              <p className="text-2xl font-display text-success mb-2">🏆 Sieg!</p>
              <p className="text-muted-foreground">Du hast den Kampf gewonnen!</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-display text-destructive mb-2">💀 Niederlage</p>
              <p className="text-muted-foreground">Du wurdest besiegt...</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ArcadeFighter;
