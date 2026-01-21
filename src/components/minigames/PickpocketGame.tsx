import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface PickpocketGameProps {
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
}

const WORDS = [
  'greifen', 'schnell', 'leise', 'unauffällig', 'wegnehmen',
  'tasche', 'geldbörse', 'flink', 'geschickt', 'vorsichtig',
  'beobachten', 'ablenken', 'zugreifen', 'entwenden', 'schleichen',
  'heimlich', 'blitzschnell', 'verschwinden', 'flucht', 'beute'
];

const TIME_LIMIT = 30; // seconds
const WORDS_TO_WIN = 5;

const PickpocketGame = ({ onComplete }: PickpocketGameProps) => {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [currentWord, setCurrentWord] = useState('');
  const [typedText, setTypedText] = useState('');
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);

  const getRandomWord = useCallback(() => {
    return WORDS[Math.floor(Math.random() * WORDS.length)];
  }, []);

  const startGame = () => {
    setGameState('playing');
    setCurrentWord(getRandomWord());
    setTypedText('');
    setWordsCompleted(0);
    setTimeLeft(TIME_LIMIT);
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
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.length === 1 && e.key.match(/[a-züöä]/i)) {
        const nextChar = currentWord[typedText.length];
        if (e.key.toLowerCase() === nextChar?.toLowerCase()) {
          const newTyped = typedText + e.key.toLowerCase();
          setTypedText(newTyped);
          
          if (newTyped === currentWord) {
            const wordScore = Math.ceil(timeLeft * 10 - mistakes * 5);
            setScore(prev => prev + Math.max(wordScore, 10));
            setWordsCompleted(prev => {
              const newCount = prev + 1;
              if (newCount >= WORDS_TO_WIN) {
                setGameState('finished');
              }
              return newCount;
            });
            setTypedText('');
            setCurrentWord(getRandomWord());
          }
        } else {
          setMistakes(prev => prev + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentWord, typedText, timeLeft, mistakes, getRandomWord]);

  const handleComplete = () => {
    const won = wordsCompleted >= WORDS_TO_WIN;
    onComplete({
      score,
      won,
      effects: won 
        ? { moneyDelta: score * 2, iqDelta: 2 }
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
            Tippe die Wörter so schnell wie möglich, um den Taschendiebstahl erfolgreich durchzuführen!
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Tippe {WORDS_TO_WIN} Wörter in {TIME_LIMIT} Sekunden</li>
            <li>• Fehler verringern deinen Score</li>
            <li>• Schneller = mehr Beute!</li>
          </ul>
          <Button onClick={startGame} className="w-full">
            Starten
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'finished') {
    const won = wordsCompleted >= WORDS_TO_WIN;
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
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-2 bg-muted rounded">
              <p className="font-bold">{wordsCompleted}/{WORDS_TO_WIN}</p>
              <p className="text-xs text-muted-foreground">Wörter</p>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <p className="font-bold">{mistakes}</p>
              <p className="text-xs text-muted-foreground">Fehler</p>
            </div>
          </div>
          {won ? (
            <p className="text-center text-success">+€{score * 2} Beute, +2 IQ</p>
          ) : (
            <p className="text-center text-destructive">-5 Gesundheit (Flucht)</p>
          )}
          <Button onClick={handleComplete} className="w-full">
            Weiter
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Zeit: {timeLeft}s</span>
          <span className="text-sm font-medium">{wordsCompleted}/{WORDS_TO_WIN} Wörter</span>
        </div>
        <Progress value={(timeLeft / TIME_LIMIT) * 100} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 pt-4">
        <div className="text-center">
          <p className="text-2xl md:text-3xl font-mono tracking-wider">
            {currentWord.split('').map((char, i) => (
              <motion.span
                key={i}
                className={
                  i < typedText.length 
                    ? 'text-success' 
                    : i === typedText.length 
                      ? 'text-primary underline' 
                      : 'text-muted-foreground'
                }
                initial={i === typedText.length - 1 ? { scale: 1.2 } : {}}
                animate={{ scale: 1 }}
              >
                {char}
              </motion.span>
            ))}
          </p>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          Tippe das Wort!
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Score: {score}</span>
          <span>Fehler: {mistakes}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PickpocketGame;
