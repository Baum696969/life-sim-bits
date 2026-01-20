import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { soundManager } from '@/lib/soundManager';

interface FlappyBirdProps {
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
}

const GRAVITY = 0.5;
const JUMP_FORCE = -8;
const PIPE_SPEED = 3;
const PIPE_GAP = 150;
const PIPE_WIDTH = 60;
const BIRD_SIZE = 30;

const FlappyBird = ({ onComplete }: FlappyBirdProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [score, setScore] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });
  
  const birdRef = useRef({ y: 200, velocity: 0 });
  const pipesRef = useRef<{ x: number; topHeight: number; passed: boolean }[]>([]);
  const frameRef = useRef<number>();
  const scoreRef = useRef(0);

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

  const jump = useCallback(() => {
    if (gameState === 'playing') {
      birdRef.current.velocity = JUMP_FORCE;
      soundManager.playClick();
    }
  }, [gameState]);

  const startGame = () => {
    birdRef.current = { y: canvasSize.height / 2, velocity: 0 };
    pipesRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    setGameState('playing');
  };

  const endGame = useCallback(() => {
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
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvasSize;

    const gameLoop = () => {
      if (gameState !== 'playing') return;

      birdRef.current.velocity += GRAVITY;
      birdRef.current.y += birdRef.current.velocity;

      if (pipesRef.current.length === 0 || pipesRef.current[pipesRef.current.length - 1].x < width - 200) {
        const topHeight = Math.random() * (height - PIPE_GAP - 100) + 50;
        pipesRef.current.push({ x: width, topHeight, passed: false });
      }

      pipesRef.current = pipesRef.current.filter(pipe => pipe.x > -PIPE_WIDTH);
      pipesRef.current.forEach(pipe => {
        pipe.x -= PIPE_SPEED;
        
        if (!pipe.passed && pipe.x + PIPE_WIDTH < 50) {
          pipe.passed = true;
          scoreRef.current += 1;
          setScore(scoreRef.current);
          soundManager.playCoins();
        }
      });

      const birdY = birdRef.current.y;
      const birdX = 50;
      
      if (birdY < 0 || birdY + BIRD_SIZE > height) {
        endGame();
        return;
      }

      for (const pipe of pipesRef.current) {
        if (birdX + BIRD_SIZE > pipe.x && birdX < pipe.x + PIPE_WIDTH) {
          if (birdY < pipe.topHeight || birdY + BIRD_SIZE > pipe.topHeight + PIPE_GAP) {
            endGame();
            return;
          }
        }
      }

      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#22c55e';
      pipesRef.current.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, height);
        
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, PIPE_WIDTH + 10, 20);
        ctx.fillRect(pipe.x - 5, pipe.topHeight + PIPE_GAP, PIPE_WIDTH + 10, 20);
        ctx.fillStyle = '#22c55e';
      });

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(birdX + BIRD_SIZE / 2, birdY + BIRD_SIZE / 2, BIRD_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(birdX + BIRD_SIZE / 2 + 5, birdY + BIRD_SIZE / 2 - 5, 4, 0, Math.PI * 2);
      ctx.fill();

      frameRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameState === 'playing') {
      frameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [gameState, endGame, canvasSize]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'ready') {
          startGame();
        } else {
          jump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, jump]);

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="font-display text-xl md:text-2xl text-primary">Flappy Bird</h2>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="rounded-lg border-2 border-primary/30 cursor-pointer touch-none"
          onClick={() => {
            if (gameState === 'ready') startGame();
            else jump();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            if (gameState === 'ready') startGame();
            else jump();
          }}
        />
        
        {gameState === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-lg">
            <p className="text-muted-foreground mb-4 text-sm md:text-base text-center px-4">Tippe oder drücke Space zum Springen!</p>
            <Button onClick={startGame} className="game-btn bg-primary">
              <Play className="mr-2 h-4 w-4" /> Start
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
