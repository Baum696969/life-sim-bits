import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface OfficeGameProps {
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
}

interface Task {
  id: string;
  type: 'coffee' | 'clean' | 'copy' | 'mail';
  emoji: string;
  name: string;
  steps: string[];
  currentStep: number;
  completed: boolean;
}

const TASK_TYPES = [
  { type: 'coffee', emoji: '☕', name: 'Kaffee kochen', steps: ['Wasser', 'Filter', 'Kaffeepulver', 'Starten'] },
  { type: 'clean', emoji: '🧹', name: 'Aufräumen', steps: ['Müll', 'Wischen', 'Staubsaugen', 'Ordnen'] },
  { type: 'copy', emoji: '📄', name: 'Kopieren', steps: ['Papier', 'Dokument', 'Kopieren', 'Sortieren'] },
  { type: 'mail', emoji: '✉️', name: 'Post sortieren', steps: ['Öffnen', 'Lesen', 'Stempeln', 'Ablegen'] },
];

const GAME_DURATION = 120;
const TASKS_TO_WIN = 6;

const OfficeGame = ({ onComplete }: OfficeGameProps) => {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [availableActions, setAvailableActions] = useState<string[]>([]);

  const generateTask = useCallback((): Task => {
    const type = TASK_TYPES[Math.floor(Math.random() * TASK_TYPES.length)];
    return {
      id: Math.random().toString(36).substring(7),
      type: type.type as Task['type'],
      emoji: type.emoji,
      name: type.name,
      steps: [...type.steps],
      currentStep: 0,
      completed: false,
    };
  }, []);

  const shuffleActions = useCallback((correctAction: string) => {
    const allActions = TASK_TYPES.flatMap(t => t.steps);
    const uniqueActions = [...new Set(allActions)];
    const wrongActions = uniqueActions.filter(a => a !== correctAction);
    const shuffled = wrongActions.sort(() => Math.random() - 0.5).slice(0, 3);
    shuffled.push(correctAction);
    return shuffled.sort(() => Math.random() - 0.5);
  }, []);

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(GAME_DURATION);
    const initialTasks = [generateTask(), generateTask(), generateTask()];
    setTasks(initialTasks);
    setSelectedTask(null);
    setCompletedTasks(0);
    setMistakes(0);
    setScore(0);
    setAvailableActions([]);
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

    return () => clearInterval(timer);
  }, [gameState]);

  const selectTask = (task: Task) => {
    if (task.completed) return;
    setSelectedTask(task);
    const correctAction = task.steps[task.currentStep];
    setAvailableActions(shuffleActions(correctAction));
  };

  const performAction = (action: string) => {
    if (!selectedTask) return;

    const correctAction = selectedTask.steps[selectedTask.currentStep];
    
    if (action === correctAction) {
      const newStep = selectedTask.currentStep + 1;
      
      if (newStep >= selectedTask.steps.length) {
        // Task completed!
        setScore(prev => prev + 100);
        setCompletedTasks(prev => {
          const newCount = prev + 1;
          if (newCount >= TASKS_TO_WIN) {
            setGameState('finished');
          }
          return newCount;
        });
        
        setTasks(prev => {
          const updated = prev.map(t => 
            t.id === selectedTask.id ? { ...t, completed: true } : t
          );
          // Add new task
          return [...updated.filter(t => !t.completed), generateTask()];
        });
        setSelectedTask(null);
        setAvailableActions([]);
      } else {
        // Move to next step
        setTasks(prev => prev.map(t => 
          t.id === selectedTask.id ? { ...t, currentStep: newStep } : t
        ));
        setSelectedTask(prev => prev ? { ...prev, currentStep: newStep } : null);
        setAvailableActions(shuffleActions(selectedTask.steps[newStep]));
        setScore(prev => prev + 20);
      }
    } else {
      setMistakes(prev => prev + 1);
      setScore(prev => Math.max(0, prev - 30));
    }
  };

  const handleComplete = () => {
    const won = completedTasks >= TASKS_TO_WIN;
    const finalScore = score - mistakes * 15;
    onComplete({
      score: Math.max(0, finalScore),
      won,
      effects: won
        ? { moneyDelta: 150, iqDelta: 2 }
        : { moneyDelta: 50 }
    });
  };

  if (gameState === 'ready') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <span className="text-2xl">🏢</span> Büro Praktikum
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Erledige Büroaufgaben Schritt für Schritt!
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {TASK_TYPES.map(type => (
              <div key={type.type} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <span className="text-xl">{type.emoji}</span>
                <span>{type.name}</span>
              </div>
            ))}
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Erledige {TASKS_TO_WIN} Aufgaben in 2 Minuten</li>
            <li>• Wähle eine Aufgabe aus</li>
            <li>• Führe die Schritte in der richtigen Reihenfolge aus</li>
          </ul>
          <Button onClick={startGame} className="w-full">
            Praktikum starten
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'finished') {
    const won = completedTasks >= TASKS_TO_WIN;
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            {won ? '✅ Praktikum bestanden!' : '❌ Mehr Übung nötig'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-4xl font-bold">{Math.max(0, score - mistakes * 15)}</p>
            <p className="text-muted-foreground">Punkte</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-2 bg-muted rounded">
              <p className="font-bold">{completedTasks}/{TASKS_TO_WIN}</p>
              <p className="text-xs text-muted-foreground">Aufgaben</p>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <p className="font-bold">{mistakes}</p>
              <p className="text-xs text-muted-foreground">Fehler</p>
            </div>
          </div>
          {won ? (
            <p className="text-center text-success">+€150 Praktikumsvergütung, +2 IQ</p>
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
          <span className="text-sm font-medium">✅ {completedTasks}/{TASKS_TO_WIN}</span>
        </div>
        <Progress value={(timeLeft / GAME_DURATION) * 100} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Available Tasks */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Aufgaben:</p>
          <div className="grid gap-2">
            <AnimatePresence>
              {tasks.filter(t => !t.completed).map(task => (
                <motion.button
                  key={task.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={() => selectTask(task)}
                  className={`
                    flex items-center justify-between p-3 rounded-lg text-left transition-all
                    ${selectedTask?.id === task.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted/50 hover:bg-muted'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{task.emoji}</span>
                    <div>
                      <p className="font-medium">{task.name}</p>
                      <p className="text-xs opacity-70">
                        Schritt {task.currentStep + 1}/{task.steps.length}
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={(task.currentStep / task.steps.length) * 100} 
                    className="w-16 h-2" 
                  />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Current Step */}
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="p-3 bg-primary/20 rounded-lg text-center">
              <p className="text-sm">Nächster Schritt für <strong>{selectedTask.name}</strong>:</p>
              <p className="text-lg font-bold">{selectedTask.steps[selectedTask.currentStep]}</p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {availableActions.map(action => (
                <Button
                  key={action}
                  variant="outline"
                  onClick={() => performAction(action)}
                  className="h-12"
                >
                  {action}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {!selectedTask && (
          <p className="text-center text-muted-foreground py-4">
            Wähle eine Aufgabe aus der Liste
          </p>
        )}

        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <span>Score: {score}</span>
          <span>Fehler: {mistakes}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfficeGame;
