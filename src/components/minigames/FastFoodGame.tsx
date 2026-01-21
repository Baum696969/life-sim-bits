import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface FastFoodGameProps {
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
}

interface Order {
  id: string;
  items: string[];
  timeRemaining: number;
}

const INGREDIENTS = ['🍔', '🍟', '🥤', '🌭', '🍦', '🥗'];
const GAME_DURATION = 120; // 2 minutes
const ORDERS_TO_WIN = 8;
const ORDER_TIME = 20;

const FastFoodGame = ({ onComplete }: FastFoodGameProps) => {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentTray, setCurrentTray] = useState<string[]>([]);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);

  const generateOrder = useCallback((): Order => {
    const itemCount = Math.floor(Math.random() * 3) + 2; // 2-4 items
    const items: string[] = [];
    for (let i = 0; i < itemCount; i++) {
      items.push(INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)]);
    }
    return {
      id: Math.random().toString(36).substring(7),
      items: items.sort(),
      timeRemaining: ORDER_TIME
    };
  }, []);

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(GAME_DURATION);
    setOrders([generateOrder(), generateOrder()]);
    setCurrentTray([]);
    setCompletedOrders(0);
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

      // Update order timers
      setOrders(prev => {
        const updated = prev.map(o => ({ ...o, timeRemaining: o.timeRemaining - 1 }));
        const expired = updated.filter(o => o.timeRemaining <= 0);
        if (expired.length > 0) {
          setMistakes(m => m + expired.length);
        }
        const remaining = updated.filter(o => o.timeRemaining > 0);
        
        // Add new order if less than 2
        while (remaining.length < 2 && remaining.length < 4) {
          remaining.push(generateOrder());
        }
        
        return remaining;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, generateOrder]);

  const addToTray = (item: string) => {
    if (currentTray.length < 5) {
      setCurrentTray(prev => [...prev, item].sort());
    }
  };

  const clearTray = () => {
    setCurrentTray([]);
  };

  const serveTray = () => {
    if (currentTray.length === 0) return;

    // Find matching order
    const matchingOrderIndex = orders.findIndex(
      o => JSON.stringify(o.items) === JSON.stringify(currentTray)
    );

    if (matchingOrderIndex !== -1) {
      const order = orders[matchingOrderIndex];
      const bonus = Math.floor(order.timeRemaining * 5);
      setScore(prev => prev + 100 + bonus);
      setCompletedOrders(prev => {
        const newCount = prev + 1;
        if (newCount >= ORDERS_TO_WIN) {
          setGameState('finished');
        }
        return newCount;
      });
      setOrders(prev => {
        const updated = [...prev];
        updated.splice(matchingOrderIndex, 1);
        updated.push(generateOrder());
        return updated;
      });
    } else {
      setMistakes(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 50));
    }
    
    setCurrentTray([]);
  };

  const handleComplete = () => {
    const won = completedOrders >= ORDERS_TO_WIN;
    const finalScore = score - mistakes * 25;
    onComplete({
      score: Math.max(0, finalScore),
      won,
      effects: won
        ? { moneyDelta: 150, fitnessDelta: 2 }
        : { moneyDelta: 50 }
    });
  };

  if (gameState === 'ready') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <span className="text-2xl">🍔</span> Fast Food Praktikum
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Nimm Bestellungen auf und serviere sie rechtzeitig!
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Erfülle {ORDERS_TO_WIN} Bestellungen in 2 Minuten</li>
            <li>• Klicke auf Zutaten, um sie hinzuzufügen</li>
            <li>• Serviere, wenn das Tablett zur Bestellung passt</li>
            <li>• Schneller = mehr Bonus!</li>
          </ul>
          <Button onClick={startGame} className="w-full">
            Praktikum starten
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'finished') {
    const won = completedOrders >= ORDERS_TO_WIN;
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {won ? '✅ Praktikum bestanden!' : '❌ Mehr Übung nötig'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-4xl font-bold">{Math.max(0, score - mistakes * 25)}</p>
            <p className="text-muted-foreground">Punkte</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-2 bg-muted rounded">
              <p className="font-bold">{completedOrders}/{ORDERS_TO_WIN}</p>
              <p className="text-xs text-muted-foreground">Bestellungen</p>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <p className="font-bold">{mistakes}</p>
              <p className="text-xs text-muted-foreground">Fehler</p>
            </div>
          </div>
          {won ? (
            <p className="text-center text-success">+€150 Praktikumsvergütung, +2 Fitness</p>
          ) : (
            <p className="text-center text-muted-foreground">+€50 Aufwandsentschädigung</p>
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
          <span className="text-sm font-medium">✅ {completedOrders}/{ORDERS_TO_WIN}</span>
        </div>
        <Progress value={(timeLeft / GAME_DURATION) * 100} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Orders */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Bestellungen:</p>
          <div className="grid gap-2">
            <AnimatePresence>
              {orders.slice(0, 3).map(order => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded"
                >
                  <div className="flex gap-1 text-2xl">
                    {order.items.map((item, i) => (
                      <span key={i}>{item}</span>
                    ))}
                  </div>
                  <Badge variant={order.timeRemaining < 5 ? 'destructive' : 'secondary'}>
                    {order.timeRemaining}s
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Current Tray */}
        <div className="p-3 bg-primary/10 rounded-lg min-h-[60px]">
          <p className="text-xs text-muted-foreground mb-2">Dein Tablett:</p>
          <div className="flex gap-2 text-3xl min-h-[40px]">
            {currentTray.map((item, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                {item}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div className="grid grid-cols-6 gap-2">
          {INGREDIENTS.map(item => (
            <Button
              key={item}
              variant="outline"
              className="text-2xl h-12"
              onClick={() => addToTray(item)}
            >
              {item}
            </Button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="destructive" onClick={clearTray} className="flex-1">
            Leeren
          </Button>
          <Button onClick={serveTray} className="flex-1 bg-success hover:bg-success/90">
            Servieren
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FastFoodGame;
