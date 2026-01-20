import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MathGameProps {
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
}

interface MathQuestion {
  question: string;
  correctAnswer: number;
  options: number[];
}

const MathGame = ({ onComplete }: MathGameProps) => {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'result' | 'gameover'>('ready');
  const [question, setQuestion] = useState<MathQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [difficulty, setDifficulty] = useState(1);

  const generateQuestion = (diff: number): MathQuestion => {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * (diff > 2 ? 3 : 2))];
    
    let a: number, b: number, answer: number;
    
    switch (operation) {
      case '+':
        a = Math.floor(Math.random() * (10 * diff)) + 1;
        b = Math.floor(Math.random() * (10 * diff)) + 1;
        answer = a + b;
        break;
      case '-':
        a = Math.floor(Math.random() * (10 * diff)) + 10;
        b = Math.floor(Math.random() * a);
        answer = a - b;
        break;
      case '*':
        a = Math.floor(Math.random() * (5 * diff)) + 1;
        b = Math.floor(Math.random() * 10) + 1;
        answer = a * b;
        break;
      default:
        a = 1;
        b = 1;
        answer = 2;
    }

    // Generate wrong answers
    const wrongAnswers = new Set<number>();
    while (wrongAnswers.size < 3) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const wrong = answer + offset;
      if (wrong !== answer && wrong >= 0) {
        wrongAnswers.add(wrong);
      }
    }

    const options = [answer, ...Array.from(wrongAnswers)].sort(() => Math.random() - 0.5);

    return {
      question: `${a} ${operation} ${b} = ?`,
      correctAnswer: answer,
      options,
    };
  };

  const startGame = () => {
    setQuestion(generateQuestion(difficulty));
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setGameState('playing');
  };

  const handleAnswer = (answer: number) => {
    if (gameState !== 'playing' || !question) return;
    
    const correct = answer === question.correctAnswer;
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    setGameState('result');
    
    if (correct) {
      setCorrectAnswers(c => c + 1);
    }
  };

  const nextQuestion = () => {
    const newCount = questionsAnswered + 1;
    setQuestionsAnswered(newCount);
    
    if (newCount >= 5) {
      // Game over after 5 questions
      setGameState('gameover');
      
      const score = correctAnswers + (isCorrect ? 1 : 0);
      const iqGain = score * 3 - (5 - score) * 2;
      
      setTimeout(() => {
        onComplete({
          score,
          won: score >= 3,
          effects: {
            iqDelta: iqGain,
          },
        });
      }, 1500);
    } else {
      // Next question with potentially higher difficulty
      if (correctAnswers >= 2) {
        setDifficulty(d => Math.min(d + 1, 3));
      }
      setQuestion(generateQuestion(difficulty));
      setSelectedAnswer(null);
      setIsCorrect(null);
      setGameState('playing');
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="font-display text-2xl text-primary">Mathetest</h2>
      
      {gameState === 'ready' ? (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Beantworte 5 Mathe-Fragen!</p>
          <Button onClick={startGame} className="game-btn bg-primary">
            <Play className="mr-2 h-4 w-4" /> Start
          </Button>
        </div>
      ) : gameState === 'gameover' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <p className="text-3xl font-display text-primary mb-2">
            {correctAnswers + (isCorrect ? 1 : 0)}/5 richtig!
          </p>
          <p className={`text-xl ${(correctAnswers + (isCorrect ? 1 : 0)) >= 3 ? 'text-success' : 'text-destructive'}`}>
            {(correctAnswers + (isCorrect ? 1 : 0)) >= 3 ? 'Bestanden!' : 'Durchgefallen...'}
          </p>
        </motion.div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            Frage {questionsAnswered + 1}/5 | Richtig: {correctAnswers}
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={question?.question}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <p className="text-4xl font-display text-primary mb-8">
                {question?.question}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {question?.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    disabled={gameState === 'result'}
                    className={`p-6 text-2xl font-display rounded-lg border-2 transition-all ${
                      gameState === 'result'
                        ? option === question.correctAnswer
                          ? 'bg-success/20 border-success text-success'
                          : option === selectedAnswer
                            ? 'bg-destructive/20 border-destructive text-destructive'
                            : 'bg-muted border-muted-foreground/20'
                        : 'bg-card border-primary/30 hover:border-primary hover:bg-primary/10'
                    }`}
                    whileHover={gameState === 'playing' ? { scale: 1.05 } : {}}
                    whileTap={gameState === 'playing' ? { scale: 0.95 } : {}}
                  >
                    {option}
                    {gameState === 'result' && option === question.correctAnswer && (
                      <Check className="inline-block ml-2 h-6 w-6" />
                    )}
                    {gameState === 'result' && option === selectedAnswer && option !== question.correctAnswer && (
                      <X className="inline-block ml-2 h-6 w-6" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
          
          {gameState === 'result' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className={`text-xl mb-4 ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                {isCorrect ? 'Richtig! 🎉' : 'Falsch! 😔'}
              </p>
              <Button onClick={nextQuestion} className="game-btn bg-primary">
                {questionsAnswered >= 4 ? 'Ergebnis' : 'Weiter'}
              </Button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default MathGame;
