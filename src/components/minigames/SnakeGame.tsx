import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SnakeGameProps {
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
}

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const SnakeGame = ({ onComplete }: SnakeGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [score, setScore] = useState(0);
  const isMobile = useIsMobile();
  
  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Direction>('RIGHT');
  const foodRef = useRef<Position>({ x: 15, y: 10 });
  const scoreRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  
  // Dynamic cell size for responsive canvas
  const CELL_SIZE = isMobile ? 14 : 20;
  const canvasSize = GRID_SIZE * CELL_SIZE;

  const generateFood = useCallback(() => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snakeRef.current.some(seg => seg.x === newFood.x && seg.y === newFood.y));
    foodRef.current = newFood;
  }, []);

  const startGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = 'RIGHT';
    scoreRef.current = 0;
    setScore(0);
    generateFood();
    setGameState('playing');
  };

  const endGame = useCallback(() => {
    setGameState('gameover');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    const finalScore = scoreRef.current;
    const moneyEarned = finalScore * 15;
    const fitnessGain = finalScore >= 5 ? 1 : 0;
    
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

    const gameLoop = () => {
      const snake = snakeRef.current;
      const direction = directionRef.current;
      const food = foodRef.current;

      // Move snake
      const head = { ...snake[0] };
      switch (direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        endGame();
        return;
      }

      // Check self collision
      if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        endGame();
        return;
      }

      snake.unshift(head);

      // Check food
      if (head.x === food.x && head.y === food.y) {
        scoreRef.current += 1;
        setScore(scoreRef.current);
        generateFood();
      } else {
        snake.pop();
      }

      // Draw
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // Grid lines (skip on mobile for performance)
      if (!isMobile) {
        ctx.strokeStyle = '#1a1a2f';
        for (let i = 0; i <= GRID_SIZE; i++) {
          ctx.beginPath();
          ctx.moveTo(i * CELL_SIZE, 0);
          ctx.lineTo(i * CELL_SIZE, canvasSize);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i * CELL_SIZE);
          ctx.lineTo(canvasSize, i * CELL_SIZE);
          ctx.stroke();
        }
      }

      // Draw snake
      snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#22c55e' : '#16a34a';
        ctx.fillRect(
          segment.x * CELL_SIZE + 1,
          segment.y * CELL_SIZE + 1,
          CELL_SIZE - 2,
          CELL_SIZE - 2
        );
      });

      // Draw food
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    };

    // Initial draw
    gameLoop();

    if (gameState === 'playing') {
      intervalRef.current = setInterval(gameLoop, INITIAL_SPEED);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameState, endGame, generateFood, CELL_SIZE, canvasSize, isMobile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      const direction = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (direction !== 'DOWN') directionRef.current = 'UP';
          break;
        case 'ArrowDown':
        case 's':
          if (direction !== 'UP') directionRef.current = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'a':
          if (direction !== 'RIGHT') directionRef.current = 'LEFT';
          break;
        case 'ArrowRight':
        case 'd':
          if (direction !== 'LEFT') directionRef.current = 'RIGHT';
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Mobile touch direction handler
  const handleDirection = (dir: Direction) => {
    if (gameState !== 'playing') return;
    const current = directionRef.current;
    if (
      (dir === 'UP' && current !== 'DOWN') ||
      (dir === 'DOWN' && current !== 'UP') ||
      (dir === 'LEFT' && current !== 'RIGHT') ||
      (dir === 'RIGHT' && current !== 'LEFT')
    ) {
      directionRef.current = dir;
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <h2 className="font-display text-xl md:text-2xl text-primary">Snake</h2>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="rounded-lg border-2 border-primary/30 touch-none"
        />
        
        {gameState === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-lg">
            <p className="text-muted-foreground mb-4 text-sm md:text-base text-center px-4">
              {isMobile ? 'Steuerkreuz zum Bewegen' : 'Pfeiltasten oder WASD'}
            </p>
            <Button onClick={startGame} className="game-btn bg-primary">
              <Play className="mr-2 h-4 w-4" /> Start
            </Button>
          </div>
        )}
        
        {gameState === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-lg">
            <p className="text-xl md:text-2xl font-display text-destructive mb-2">Game Over!</p>
            <p className="text-primary text-lg md:text-xl mb-4">Äpfel: {score}</p>
            <p className="text-success mb-4">+€{score * 15}</p>
          </div>
        )}
      </div>

      {/* Mobile D-Pad Controls */}
      {isMobile && gameState === 'playing' && (
        <div className="grid grid-cols-3 gap-1 w-36">
          <div />
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 touch-manipulation"
            onTouchStart={() => handleDirection('UP')}
          >
            <ArrowUp className="h-6 w-6" />
          </Button>
          <div />
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 touch-manipulation"
            onTouchStart={() => handleDirection('LEFT')}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div />
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 touch-manipulation"
            onTouchStart={() => handleDirection('RIGHT')}
          >
            <ArrowRight className="h-6 w-6" />
          </Button>
          <div />
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 touch-manipulation"
            onTouchStart={() => handleDirection('DOWN')}
          >
            <ArrowDown className="h-6 w-6" />
          </Button>
          <div />
        </div>
      )}
      
      <div className="text-center">
        <p className="text-xl md:text-2xl font-display text-primary">Äpfel: {score}</p>
        <p className="text-xs md:text-sm text-muted-foreground">€15 pro Apfel</p>
      </div>
    </div>
  );
};

export default SnakeGame;
