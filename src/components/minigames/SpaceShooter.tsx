import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { soundManager } from '@/lib/soundManager';

interface SpaceShooterProps {
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
}

interface Bullet {
  x: number;
  y: number;
  id: number;
}

interface Enemy {
  x: number;
  y: number;
  id: number;
  type: 'basic' | 'fast' | 'tank';
  health: number;
}

const SpaceShooter = ({ onComplete }: SpaceShooterProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'ready' | 'countdown' | 'playing' | 'gameover'>('ready');
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  
  // Game state refs for animation loop
  const playerRef = useRef({ x: 150, y: 280 });
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const gameOverRef = useRef(false);
  const scoreRef = useRef(0);
  const waveRef = useRef(1);
  const lastShotRef = useRef(0);
  const bulletIdRef = useRef(0);
  const enemyIdRef = useRef(0);
  const touchRef = useRef<{ x: number; shooting: boolean }>({ x: 150, shooting: false });
  const frameTimeRef = useRef<number | null>(null);
  const tapControlsRef = useRef<{ left: boolean; right: boolean; shoot: boolean }>({ left: false, right: false, shoot: false });

  const startGame = () => {
    setGameState('countdown');
    setCountdown(3);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          initGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const initGame = () => {
    playerRef.current = { x: 150, y: 280 };
    bulletsRef.current = [];
    enemiesRef.current = [];
    gameOverRef.current = false;
    scoreRef.current = 0;
    waveRef.current = 1;
    setScore(0);
    setWave(1);
    setGameState('playing');
    soundManager.playMinigameStart();
  };

  const spawnWave = useCallback(() => {
    const count = 3 + waveRef.current * 2;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (gameOverRef.current) return;
        
        const type = Math.random() < 0.7 ? 'basic' : Math.random() < 0.5 ? 'fast' : 'tank';
        enemiesRef.current.push({
          id: enemyIdRef.current++,
          x: Math.random() * 260 + 20,
          y: -30 - Math.random() * 100,
          type,
          health: type === 'tank' ? 3 : 1,
        });
      }, i * 300);
    }
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Key handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      if (e.key === ' ') e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    // Touch handlers
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      touchRef.current.x = touch.clientX - rect.left;
      touchRef.current.shooting = true;
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      touchRef.current.x = touch.clientX - rect.left;
    };
    const handleTouchEnd = () => {
      touchRef.current.shooting = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    spawnWave();

    let animationId: number;
    
    const gameLoop = (ts: number) => {
      if (gameOverRef.current) return;

      // Delta-time scaling (normalize to ~60fps)
      const last = frameTimeRef.current ?? ts;
      const dtMs = ts - last;
      frameTimeRef.current = ts;
      const dtFactor = Math.min(3, Math.max(0.5, dtMs / (1000 / 60)));

      // Clear
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, 300, 320);

      // Stars background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      for (let i = 0; i < 30; i++) {
        ctx.fillRect(
          (ts / 50 + i * 100) % 300,
          (i * 37) % 320,
          1, 1
        );
      }

      // Move player
      const speed = 5 * dtFactor;
      const tap = tapControlsRef.current;
      if (keysRef.current['ArrowLeft'] || keysRef.current['a'] || tap.left) {
        playerRef.current.x = Math.max(15, playerRef.current.x - speed);
      }
      if (keysRef.current['ArrowRight'] || keysRef.current['d'] || tap.right) {
        playerRef.current.x = Math.min(285, playerRef.current.x + speed);
      }

      // Touch movement
      if (touchRef.current.shooting) {
        const targetX = touchRef.current.x;
        const diff = targetX - playerRef.current.x;
        playerRef.current.x += diff * Math.min(1, 0.2 * dtFactor);
        playerRef.current.x = Math.max(15, Math.min(285, playerRef.current.x));
      }

      // Shoot
      const now = ts;
      if ((keysRef.current[' '] || touchRef.current.shooting || tap.shoot) && now - lastShotRef.current > 150) {
        bulletsRef.current.push({
          id: bulletIdRef.current++,
          x: playerRef.current.x,
          y: playerRef.current.y - 15,
        });
        lastShotRef.current = now;
        soundManager.playClick();
      }

      // Update bullets
      bulletsRef.current = bulletsRef.current.filter(bullet => {
        bullet.y -= 8 * dtFactor;
        return bullet.y > -10;
      });

      // Update enemies
      enemiesRef.current.forEach(enemy => {
        const speed = (enemy.type === 'fast' ? 2.5 : enemy.type === 'tank' ? 1 : 1.5) * dtFactor;
        enemy.y += speed;

        // Check collision with player
        const dx = enemy.x - playerRef.current.x;
        const dy = enemy.y - playerRef.current.y;
        if (Math.sqrt(dx * dx + dy * dy) < 20) {
          gameOverRef.current = true;
        }

        // Check off screen
        if (enemy.y > 340) {
          gameOverRef.current = true;
        }
      });

      // Bullet-enemy collision
      bulletsRef.current.forEach((bullet, bi) => {
        enemiesRef.current.forEach((enemy, ei) => {
          const dx = bullet.x - enemy.x;
          const dy = bullet.y - enemy.y;
          if (Math.sqrt(dx * dx + dy * dy) < 15) {
            bulletsRef.current.splice(bi, 1);
            enemy.health--;
            if (enemy.health <= 0) {
              enemiesRef.current.splice(ei, 1);
              const points = enemy.type === 'tank' ? 30 : enemy.type === 'fast' ? 15 : 10;
              scoreRef.current += points;
              setScore(scoreRef.current);
              soundManager.playPositiveEffect();
            }
          }
        });
      });

      // Check wave complete
      if (enemiesRef.current.length === 0 && !gameOverRef.current) {
        waveRef.current++;
        setWave(waveRef.current);
        if (waveRef.current > 5) {
          // Won!
          gameOverRef.current = true;
          soundManager.playMinigameWin();
          setGameState('gameover');
          
          const finalScore = scoreRef.current + 500;
          setTimeout(() => {
            onComplete({
              score: finalScore,
              won: true,
              effects: {
                moneyDelta: finalScore * 2,
                fitnessDelta: 5,
                luckDelta: 3,
              },
            });
          }, 1500);
          return;
        }
        spawnWave();
      }

      // Draw player (spaceship)
      ctx.fillStyle = '#00ff88';
      ctx.beginPath();
      ctx.moveTo(playerRef.current.x, playerRef.current.y - 15);
      ctx.lineTo(playerRef.current.x - 12, playerRef.current.y + 10);
      ctx.lineTo(playerRef.current.x + 12, playerRef.current.y + 10);
      ctx.closePath();
      ctx.fill();

      // Draw bullets
      ctx.fillStyle = '#00ffff';
      bulletsRef.current.forEach(bullet => {
        ctx.fillRect(bullet.x - 2, bullet.y, 4, 10);
      });

      // Draw enemies
      enemiesRef.current.forEach(enemy => {
        ctx.fillStyle = enemy.type === 'tank' ? '#ff4444' : enemy.type === 'fast' ? '#ffaa00' : '#ff6666';
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.type === 'tank' ? 15 : 10, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw UI
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px monospace';
      ctx.fillText(`Score: ${scoreRef.current}`, 10, 20);
      ctx.fillText(`Wave: ${waveRef.current}/5`, 230, 20);

      if (gameOverRef.current && waveRef.current <= 5) {
        soundManager.playMinigameLose();
        setGameState('gameover');
        
        setTimeout(() => {
          onComplete({
            score: scoreRef.current,
            won: false,
            effects: {
              moneyDelta: Math.floor(scoreRef.current / 2),
            },
          });
        }, 1500);
        return;
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    frameTimeRef.current = null;
    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState, spawnWave, onComplete]);

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="font-display text-2xl text-primary">Space Shooter</h2>

      {gameState === 'ready' && (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Steuere mit WASD/Pfeiltasten, Leertaste zum Schießen.
            <br />
            <span className="text-sm">Touch: Berühre und ziehe!</span>
          </p>
          <Button onClick={startGame} className="game-btn bg-primary">
            <Play className="mr-2 h-4 w-4" /> Start
          </Button>
        </div>
      )}

      {gameState === 'countdown' && (
        <div className="flex items-center justify-center w-[300px] h-[320px] bg-muted rounded-lg">
          <motion.span
            key={countdown}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-display text-primary"
          >
            {countdown}
          </motion.span>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'gameover') && (
        <div className="flex flex-col items-center gap-3">
          <canvas
            ref={canvasRef}
            width={300}
            height={320}
            className="rounded-lg border-2 border-primary/30 touch-none"
          />

          {/* Mobile tap-only controls (buttons) */}
          <div className="md:hidden flex items-center justify-between w-[300px] gap-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-14 w-14 text-xl touch-manipulation"
                onTouchStart={(e) => { e.preventDefault(); tapControlsRef.current.left = true; }}
                onTouchEnd={() => { tapControlsRef.current.left = false; }}
                onMouseDown={() => { tapControlsRef.current.left = true; }}
                onMouseUp={() => { tapControlsRef.current.left = false; }}
                onMouseLeave={() => { tapControlsRef.current.left = false; }}
              >
                ←
              </Button>
              <Button
                variant="outline"
                className="h-14 w-14 text-xl touch-manipulation"
                onTouchStart={(e) => { e.preventDefault(); tapControlsRef.current.right = true; }}
                onTouchEnd={() => { tapControlsRef.current.right = false; }}
                onMouseDown={() => { tapControlsRef.current.right = true; }}
                onMouseUp={() => { tapControlsRef.current.right = false; }}
                onMouseLeave={() => { tapControlsRef.current.right = false; }}
              >
                →
              </Button>
            </div>
            <Button
              className="h-14 px-6 bg-primary touch-manipulation"
              onTouchStart={(e) => { e.preventDefault(); tapControlsRef.current.shoot = true; }}
              onTouchEnd={() => { tapControlsRef.current.shoot = false; }}
              onMouseDown={() => { tapControlsRef.current.shoot = true; }}
              onMouseUp={() => { tapControlsRef.current.shoot = false; }}
              onMouseLeave={() => { tapControlsRef.current.shoot = false; }}
            >
              Schießen
            </Button>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className={`text-2xl font-display ${wave > 5 ? 'text-primary' : 'text-destructive'}`}>
            {wave > 5 ? 'Mission erfolgreich!' : 'Game Over!'}
          </p>
          <p className="text-muted-foreground">
            Punkte: {score} • Welle: {wave}/5
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default SpaceShooter;
