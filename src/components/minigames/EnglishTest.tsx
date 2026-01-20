import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, Check, X, Clock } from 'lucide-react';
import { soundManager } from '@/lib/soundManager';

interface EnglishTestProps {
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
  playerAge?: number;
}

interface Question {
  question: string;
  correctAnswer: string;
  options: string[];
}

const TIME_PER_QUESTION = 12; // seconds

// Vocabulary by difficulty
const easyVocab: [string, string][] = [
  ['Apfel', 'Apple'], ['Hund', 'Dog'], ['Katze', 'Cat'], ['Haus', 'House'],
  ['Schule', 'School'], ['Buch', 'Book'], ['Wasser', 'Water'], ['Sonne', 'Sun'],
  ['Mond', 'Moon'], ['Baum', 'Tree'], ['Auto', 'Car'], ['Blume', 'Flower'],
];

const mediumVocab: [string, string][] = [
  ['Freiheit', 'Freedom'], ['Glück', 'Happiness'], ['Traum', 'Dream'],
  ['Freundschaft', 'Friendship'], ['Wissen', 'Knowledge'], ['Erfolg', 'Success'],
  ['Erfahrung', 'Experience'], ['Verantwortung', 'Responsibility'],
  ['Möglichkeit', 'Possibility'], ['Entwicklung', 'Development'],
];

const hardVocab: [string, string][] = [
  ['Wissenschaft', 'Science'], ['Umweltverschmutzung', 'Pollution'],
  ['Nachhaltigkeit', 'Sustainability'], ['Gerechtigkeit', 'Justice'],
  ['Unabhängigkeit', 'Independence'], ['Herausforderung', 'Challenge'],
  ['Selbstbewusstsein', 'Confidence'], ['Verständnis', 'Understanding'],
];

const EnglishTest = ({ onComplete, playerAge = 10 }: EnglishTestProps) => {
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'result' | 'gameover'>('ready');
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);

  const getDifficulty = () => {
    if (playerAge <= 10) return 0;
    if (playerAge <= 14) return 1;
    return 2;
  };

  const generateQuestion = useCallback((): Question => {
    const difficulty = getDifficulty();
    let vocab: [string, string][];
    
    if (difficulty === 0) {
      vocab = easyVocab;
    } else if (difficulty === 1) {
      vocab = [...easyVocab, ...mediumVocab];
    } else {
      vocab = [...mediumVocab, ...hardVocab];
    }

    const [german, english] = vocab[Math.floor(Math.random() * vocab.length)];
    
    // Generate wrong answers from same difficulty level
    const wrongAnswers = new Set<string>();
    while (wrongAnswers.size < 3) {
      const [, wrongEnglish] = vocab[Math.floor(Math.random() * vocab.length)];
      if (wrongEnglish !== english) {
        wrongAnswers.add(wrongEnglish);
      }
    }

    const options = [english, ...Array.from(wrongAnswers)].sort(() => Math.random() - 0.5);

    return {
      question: `Was heißt "${german}" auf Englisch?`,
      correctAnswer: english,
      options,
    };
  }, [playerAge]);

  const startGame = () => {
    setQuestion(generateQuestion());
    setQuestionsAnswered(0);
    setCorrectAnswers(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setTimeLeft(TIME_PER_QUESTION);
    setGameState('playing');
  };

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - count as wrong
          handleAnswer('');
          return TIME_PER_QUESTION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, question]);

  const handleAnswer = (answer: string) => {
    if (gameState !== 'playing' || !question) return;
    
    const correct = answer === question.correctAnswer;
    setSelectedAnswer(answer || '(Zeit abgelaufen)');
    setIsCorrect(correct);
    setGameState('result');
    
    if (correct) {
      soundManager.playMatch();
      setCorrectAnswers(c => c + 1);
    } else {
      soundManager.playNegativeEffect();
    }
  };

  const nextQuestion = () => {
    const newCount = questionsAnswered + 1;
    setQuestionsAnswered(newCount);
    
    if (newCount >= 5) {
      setGameState('gameover');
      
      const score = correctAnswers + (isCorrect ? 1 : 0);
      const iqGain = score * 2 - (5 - score);
      
      if (score >= 3) {
        soundManager.playMinigameWin();
      } else {
        soundManager.playMinigameLose();
      }
      
      setTimeout(() => {
        onComplete({
          score,
          won: score >= 3,
          effects: {
            iqDelta: iqGain,
            moneyDelta: score >= 4 ? 20 : 0,
          },
        });
      }, 1500);
    } else {
      setQuestion(generateQuestion());
      setSelectedAnswer(null);
      setIsCorrect(null);
      setTimeLeft(TIME_PER_QUESTION);
      setGameState('playing');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 p-2">
      <h2 className="font-display text-xl md:text-2xl text-blue-400">Englisch Test</h2>
      
      {gameState === 'ready' ? (
        <div className="text-center">
          <p className="text-muted-foreground mb-4 text-sm md:text-base">Übersetze 5 Wörter ins Englische!</p>
          <p className="text-xs text-muted-foreground mb-4">⏱️ {TIME_PER_QUESTION} Sekunden pro Frage</p>
          <Button onClick={startGame} className="game-btn bg-blue-500 hover:bg-blue-600">
            <Play className="mr-2 h-4 w-4" /> Start
          </Button>
        </div>
      ) : gameState === 'gameover' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <p className="text-2xl md:text-3xl font-display text-blue-400 mb-2">
            {correctAnswers + (isCorrect ? 1 : 0)}/5 richtig!
          </p>
          <p className={`text-lg md:text-xl ${(correctAnswers + (isCorrect ? 1 : 0)) >= 3 ? 'text-success' : 'text-destructive'}`}>
            {(correctAnswers + (isCorrect ? 1 : 0)) >= 3 ? 'Good job! 🎉' : 'Keep practicing...'}
          </p>
        </motion.div>
      ) : (
        <>
          <div className="flex justify-between w-full max-w-md px-4">
            <span className="text-xs md:text-sm text-muted-foreground">
              Frage {questionsAnswered + 1}/5 | Richtig: {correctAnswers}
            </span>
            <span className={`text-xs md:text-sm flex items-center gap-1 ${timeLeft <= 3 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}>
              <Clock className="h-3 w-3" /> {timeLeft}s
            </span>
          </div>
          
          {/* Timer bar */}
          <div className="w-full max-w-md h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: '100%' }}
              animate={{ width: `${(timeLeft / TIME_PER_QUESTION) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={question?.question}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center w-full"
            >
              <p className="text-xl md:text-2xl font-display text-blue-400 mb-6 md:mb-8">
                {question?.question}
              </p>
              
              <div className="grid grid-cols-2 gap-2 md:gap-4 max-w-md mx-auto">
                {question?.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    disabled={gameState === 'result'}
                    className={`p-3 md:p-4 text-base md:text-lg font-display rounded-lg border-2 transition-all ${
                      gameState === 'result'
                        ? option === question.correctAnswer
                          ? 'bg-success/20 border-success text-success'
                          : option === selectedAnswer
                            ? 'bg-destructive/20 border-destructive text-destructive'
                            : 'bg-muted border-muted-foreground/20'
                        : 'bg-card border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 active:scale-95'
                    }`}
                    whileHover={gameState === 'playing' ? { scale: 1.02 } : {}}
                    whileTap={gameState === 'playing' ? { scale: 0.98 } : {}}
                  >
                    {option}
                    {gameState === 'result' && option === question.correctAnswer && (
                      <Check className="inline-block ml-2 h-4 w-4" />
                    )}
                    {gameState === 'result' && option === selectedAnswer && option !== question.correctAnswer && (
                      <X className="inline-block ml-2 h-4 w-4" />
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
              <p className={`text-lg md:text-xl mb-4 ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                {isCorrect ? 'Correct! 🎉' : 'Wrong! 😔'}
              </p>
              <Button onClick={nextQuestion} className="game-btn bg-blue-500 hover:bg-blue-600">
                {questionsAnswered >= 4 ? 'Ergebnis' : 'Weiter'}
              </Button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default EnglishTest;
