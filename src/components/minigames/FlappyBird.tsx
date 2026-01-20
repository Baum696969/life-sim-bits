import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Heart } from 'lucide-react';
import { soundManager } from '@/lib/soundManager';

interface FlappyBirdProps {
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
}

// Much slower and easier initial settings
const BASE_GRAVITY = 0.15; // Very low gravity - falls slowly
const BASE_JUMP_FORCE = -4; // Gentle jump
const BASE_PIPE_SPEED = 1.5; // Slow pipe movement
const PIPE_GAP = 200; // Wide gap
const PIPE_WIDTH = 60;
const BIRD_SIZE = 30;
const MAX_LIVES = 3;
const MAX_FALL_SPEED = 4; // Limit fall speed

// Difficulty scaling - very gradual
const getDynamicValues = (score: number) => {
  const tier = Math.min(Math.floor(score / 7), 4); // Slower scaling
  
  return {
    gravity: BASE_GRAVITY + (tier * 0.02),
    jumpForce: BASE_JUMP_FORCE - (tier * 0.3),
    pipeSpeed: BASE_PIPE_SPEED + (tier * 0.25),
  };
};

const FlappyBird = ({ onComplete }: FlappyBirdProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'hit' | 'gameover'>('ready');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });
  
  const birdRef = useRef({ y: 200, velocity: 0 });
  const pipesRef = useRef<{ x: number; topHeight: number; passed: boolean }[]>([]);
  const frameRef = useRef<number>();
  const scoreRef = useRef(0);
  const livesRef = useRef(MAX_LIVES);
  const gameStartedRef = useRef(false);

  // Responsive canvas size
  useEffect(() => {
    const updateSize = () => {
      const maxWidth = Math.min(400, window.innerWidth - 32);
      setCanvasSize({ width: maxWidth, height: maxWidth });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Draw idle state when ready
  useEffect(() => {
    if (gameState === 'ready') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width, height } = canvasSize;
      
      // Draw background
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, width, height);
      
      // Draw bird floating in center
      const birdX = 50;
      const birdY = height / 2;
      
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(birdX + BIRD_SIZE / 2, birdY + BIRD_SIZE / 2, BIRD_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(birdX + BIRD_SIZE / 2 + 5, birdY + BIRD_SIZE / 2 - 5, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [gameState, canvasSize]);

  const jump = useCallback(() => {
    if (gameState === 'ready') {
      // First jump starts the game - bird doesn't fall until first jump
      gameStartedRef.current = true;
      birdRef.current = { y: canvasSize.height / 2, velocity: 0 };
      pipesRef.current = [];
      setGameState('playing');
      soundManager.playMinigameStart();
      
      // Apply first jump
      const { jumpForce } = getDynamicValues(0);
      birdRef.current.velocity = jumpForce;
      soundManager.playClick();
    } else if (gameState === 'playing') {
      const { jumpForce } = getDynamicValues(scoreRef.current);
      birdRef.current.velocity = jumpForce;
      soundManager.playClick();
    }
  }, [gameState, canvasSize.height]);

  const resetPosition = useCallback(() => {
    birdRef.current = { y: canvasSize.height / 2, velocity: 0 };
  }, [canvasSize.height]);

  const handleHit = useCallback(() => {
    soundManager.playHit();
    livesRef.current -= 1;
    setLives(livesRef.current);
    
    if (livesRef.current <= 0) {
      // Game over
      setGameState('gameover');
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      const finalScore = scoreRef.current;
      const moneyEarned = finalScore * 10;
      const fitnessGain = finalScore >= 5 ? 2 : 0;
      
      if (finalScore >= 3) {
        soundManager.playMinigameWin();
      } else {
        soundManager.playMinigameLose();
      }
      
      setTimeout(() => {
        onComplete({
          score: finalScore,
          won: finalScore >= 3,
          effects: {
            moneyDelta: moneyEarned,
            fitnessDelta: fitnessGain,
          },
        });
      }, 1500);
    } else {
      // Respawn with invincibility frame
      setGameState('hit');
      soundManager.playHealthDown();
      resetPosition();
      
      setTimeout(() => {
        setGameState('playing');
      }, 1000);
    }
  }, [onComplete, resetPosition]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvasSize;

    const gameLoop = () => {
      if (gameState !== 'playing' && gameState !== 'hit') return;

      const { gravity, pipeSpeed } = getDynamicValues(scoreRef.current);

      // Apply gravity but limit fall speed
      birdRef.current.velocity += gravity;
      birdRef.current.velocity = Math.min(birdRef.current.velocity, MAX_FALL_SPEED);
      birdRef.current.y += birdRef.current.velocity;

      // Spawn pipes with more space between them
      if (pipesRef.current.length === 0 || pipesRef.current[pipesRef.current.length - 1].x < width - 250) {
        const topHeight = Math.random() * (height - PIPE_GAP - 120) + 60;
        pipesRef.current.push({ x: width, topHeight, passed: false });
      }

      pipesRef.current = pipesRef.current.filter(pipe => pipe.x > -PIPE_WIDTH);
      pipesRef.current.forEach(pipe => {
        pipe.x -= pipeSpeed;
        
        if (!pipe.passed && pipe.x + PIPE_WIDTH < 50) {
          pipe.passed = true;
          scoreRef.current += 1;
          setScore(scoreRef.current);
          soundManager.playCoins();
        }
      });

      const birdY = birdRef.current.y;
      const birdX = 50;
      
      // Collision detection only when not in hit state
      if (gameState === 'playing') {
        if (birdY < 0 || birdY + BIRD_SIZE > height) {
          handleHit();
          return;
        }

        for (const pipe of pipesRef.current) {
          if (birdX + BIRD_SIZE > pipe.x && birdX < pipe.x + PIPE_WIDTH) {
            if (birdY < pipe.topHeight || birdY + BIRD_SIZE > pipe.topHeight + PIPE_GAP) {
              handleHit();
              return;
            }
          }
        }
      }

      // Draw background
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, width, height);

      // Draw pipes
      ctx.fillStyle = '#22c55e';
      pipesRef.current.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, height);
        
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, PIPE_WIDTH + 10, 20);
        ctx.fillRect(pipe.x - 5, pipe.topHeight + PIPE_GAP, PIPE_WIDTH + 10, 20);
        ctx.fillStyle = '#22c55e';
      });

      // Draw bird (flashing when hit)
      const isFlashing = gameState === 'hit' && Math.floor(Date.now() / 100) % 2 === 0;
      if (!isFlashing) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(birdX + BIRD_SIZE / 2, birdY + BIRD_SIZE / 2, BIRD_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(birdX + BIRD_SIZE / 2 + 5, birdY + BIRD_SIZE / 2 - 5, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameState === 'playing' || gameState === 'hit') {
      frameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [gameState, handleHit, canvasSize]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  const handleRestart = () => {
    birdRef.current = { y: canvasSize.height / 2, velocity: 0 };
    pipesRef.current = [];
    scoreRef.current = 0;
    livesRef.current = MAX_LIVES;
    gameStartedRef.current = false;
    setScore(0);
    setLives(MAX_LIVES);
    setGameState('ready');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-[400px]">
        <h2 className="font-display text-xl md:text-2xl text-primary">Flappy Bird</h2>
        <div className="flex items-center gap-1">
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <Heart
              key={i}
              className={`h-5 w-5 ${i < lives ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`}
            />
          ))}
        </div>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="rounded-lg border-2 border-primary/30 cursor-pointer touch-none"
          onClick={jump}
          onTouchStart={(e) => {
            e.preventDefault();
            jump();
          }}
        />
        
        {gameState === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-lg">
            <p className="text-muted-foreground mb-2 text-sm md:text-base text-center px-4">
              Tippe zum Starten und Springen!
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Du hast {MAX_LIVES} Leben
            </p>
            <Button onClick={jump} className="game-btn bg-primary">
              <Play className="mr-2 h-4 w-4" /> Los geht's!
            </Button>
          </div>
        )}
        
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-lg">
            <p className="text-xl md:text-2xl font-display text-destructive mb-2">Game Over!</p>
            <p className="text-primary text-lg md:text-xl mb-4">Score: {score}</p>
            <p className="text-success mb-4">+€{score * 10}</p>
          </div>
        )}
      </div>
      
      <div className="text-center">
        <p className="text-xl md:text-2xl font-display text-primary">Score: {score}</p>
        <p className="text-xs md:text-sm text-muted-foreground">€10 pro Pipe</p>
      </div>
    </div>
  );
};

export default FlappyBird;
