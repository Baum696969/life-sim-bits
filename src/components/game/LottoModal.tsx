import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Sparkles, Trophy, XCircle } from 'lucide-react';
import { soundManager } from '@/lib/soundManager';
import Confetti from './Confetti';

interface LottoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (won: boolean, amount: number) => void;
  playerMoney: number;
}

const TICKET_COST = 5;
const JACKPOT = 10000;
const WIN_CHANCE = 0.01; // 1%

const LottoModal = ({ isOpen, onClose, onResult, playerMoney }: LottoModalProps) => {
  const [phase, setPhase] = useState<'buy' | 'rolling' | 'result'>('buy');
  const [numbers, setNumbers] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [winningNumbers, setWinningNumbers] = useState<number[]>([]);
  const [won, setWon] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPhase('buy');
      setNumbers([0, 0, 0, 0, 0, 0]);
      setWinningNumbers([]);
      setWon(false);
      setShowConfetti(false);
    }
  }, [isOpen]);

  const generateNumbers = (): number[] => {
    const nums: number[] = [];
    while (nums.length < 6) {
      const n = Math.floor(Math.random() * 49) + 1;
      if (!nums.includes(n)) nums.push(n);
    }
    return nums.sort((a, b) => a - b);
  };

  const handleBuyTicket = () => {
    if (playerMoney < TICKET_COST) return;
    
    soundManager.playClick();
    setPhase('rolling');
    
    // Generate player's numbers
    const playerNums = generateNumbers();
    setNumbers(playerNums);
    
    // Determine if won (1% chance)
    const didWin = Math.random() < WIN_CHANCE;
    setWon(didWin);
    
    // Generate winning numbers (match if won)
    const winning = didWin ? [...playerNums] : generateNumbers();
    setWinningNumbers(winning);
    
    // Animate number reveal
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setNumbers(generateNumbers());
      rollCount++;
      soundManager.playClick();
      
      if (rollCount >= 15) {
        clearInterval(rollInterval);
        setNumbers(playerNums);
        
        setTimeout(() => {
          setPhase('result');
          if (didWin) {
            soundManager.playLottoWin();
            setShowConfetti(true);
          } else {
            soundManager.playLottoLose();
          }
        }, 500);
      }
    }, 100);
  };

  const handleClose = () => {
    if (phase === 'result') {
      onResult(won, won ? JACKPOT : -TICKET_COST);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-card to-card/80 border-yellow-500/50">
        {showConfetti && <Confetti />}
        
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-yellow-500 flex items-center gap-2">
            <Ticket className="h-6 w-6" />
            Lotto - Jackpot €{JACKPOT.toLocaleString()}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          <AnimatePresence mode="wait">
            {phase === 'buy' && (
              <motion.div
                key="buy"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-6"
              >
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 rounded-xl border border-yellow-500/30">
                  <p className="text-4xl mb-2">🎰</p>
                  <p className="text-lg text-foreground">
                    Kaufe einen Lottoschein für <span className="text-yellow-500 font-bold">€{TICKET_COST}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Gewinnchance: <span className="text-yellow-400">1%</span>
                  </p>
                </div>
                
                <Button
                  onClick={handleBuyTicket}
                  disabled={playerMoney < TICKET_COST}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold px-8 py-6 text-lg"
                >
                  <Ticket className="mr-2 h-5 w-5" />
                  Lottoschein kaufen (€{TICKET_COST})
                </Button>
                
                {playerMoney < TICKET_COST && (
                  <p className="text-destructive text-sm">Nicht genug Geld!</p>
                )}
              </motion.div>
            )}

            {phase === 'rolling' && (
              <motion.div
                key="rolling"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <p className="text-lg text-muted-foreground">Die Zahlen werden gezogen...</p>
                
                <div className="flex justify-center gap-2">
                  {numbers.map((num, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        rotateY: [0, 180, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 0.3,
                        repeat: Infinity,
                        delay: i * 0.05
                      }}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-black font-bold text-lg shadow-lg"
                    >
                      {num}
                    </motion.div>
                  ))}
                </div>
                
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                </div>
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                {won ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 10 }}
                    >
                      <Trophy className="h-20 w-20 text-yellow-500 mx-auto" />
                    </motion.div>
                    
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-4xl font-display text-yellow-500"
                    >
                      JACKPOT! 🎉
                    </motion.h2>
                    
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-2xl text-success font-bold"
                    >
                      +€{JACKPOT.toLocaleString()}
                    </motion.p>
                    
                    <div className="flex justify-center gap-2">
                      {numbers.map((num, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold shadow-lg"
                        >
                          {num}
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-16 w-16 text-muted-foreground mx-auto" />
                    
                    <h2 className="text-2xl font-display text-muted-foreground">
                      Leider nicht gewonnen
                    </h2>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Deine Zahlen:</p>
                      <div className="flex justify-center gap-2">
                        {numbers.map((num, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium text-sm"
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-4">Gewinnzahlen:</p>
                      <div className="flex justify-center gap-2">
                        {winningNumbers.map((num, i) => (
                          <div
                            key={i}
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                              numbers.includes(num) 
                                ? 'bg-yellow-500/30 text-yellow-500' 
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-sm text-destructive">-€{TICKET_COST}</p>
                  </>
                )}
                
                <Button onClick={handleClose} className="mt-4">
                  Schließen
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LottoModal;