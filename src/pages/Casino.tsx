import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Minus, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, BlackjackHand, BlackjackState, Suit, Rank } from '@/types/game';
import { loadGame, saveGame, formatMoney, hasSavedGame } from '@/lib/gameUtils';
import { soundManager } from '@/lib/soundManager';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const MIN_AGE = 16;
const DEALER_DELAY = 1000; // Slower dealer animation (was 500)

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, faceUp: true });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
};

const getCardValue = (card: Card): number[] => {
  if (card.rank === 'A') return [1, 11];
  if (['J', 'Q', 'K'].includes(card.rank)) return [10];
  return [parseInt(card.rank)];
};

const calculateHandValue = (cards: Card[]): number => {
  let values = [0];
  
  for (const card of cards) {
    if (!card.faceUp) continue;
    const cardValues = getCardValue(card);
    const newValues: number[] = [];
    
    for (const v of values) {
      for (const cv of cardValues) {
        newValues.push(v + cv);
      }
    }
    values = [...new Set(newValues)];
  }
  
  const validValues = values.filter(v => v <= 21);
  if (validValues.length > 0) return Math.max(...validValues);
  return Math.min(...values);
};

const Casino = () => {
  const navigate = useNavigate();
  const [playerMoney, setPlayerMoney] = useState(1000);
  const [playerAge, setPlayerAge] = useState(0);
  const [bet, setBet] = useState(50);
  const [gamePhase, setGamePhase] = useState<'betting' | 'playing' | 'dealerTurn' | 'finished'>('betting');
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [winAmount, setWinAmount] = useState(0);
  const [hasActiveGame, setHasActiveGame] = useState(false);

  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      setPlayerMoney(saved.player.money);
      setPlayerAge(saved.player.age);
      setHasActiveGame(true);
    } else {
      setHasActiveGame(hasSavedGame());
    }
  }, []);

  const handleBack = () => {
    // If there's an active game, go back to continue playing
    if (hasActiveGame) {
      navigate('/');
      // The Index page will detect the saved game and continue
    } else {
      navigate('/');
    }
  };

  // Check age restriction
  if (playerAge < MIN_AGE && playerAge > 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-display text-3xl text-primary mb-4">Casino</h1>
          <p className="text-muted-foreground mb-6">
            Du musst mindestens {MIN_AGE} Jahre alt sein, um das Casino zu betreten.
          </p>
          <p className="text-lg text-foreground mb-6">
            Dein Alter: {playerAge} Jahre
          </p>
          <Button className="game-btn" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Zurück zum Spiel
          </Button>
        </div>
      </div>
    );
  }

  const dealCard = (currentDeck: Card[], faceUp = true): [Card, Card[]] => {
    const newDeck = [...currentDeck];
    const card = { ...newDeck.pop()!, faceUp };
    return [card, newDeck];
  };

  const startGame = () => {
    if (bet > playerMoney) return;
    
    soundManager.playCardFlip();
    let newDeck = createDeck();
    const newPlayerHand: Card[] = [];
    const newDealerHand: Card[] = [];
    
    let card: Card;
    [card, newDeck] = dealCard(newDeck);
    newPlayerHand.push(card);
    [card, newDeck] = dealCard(newDeck, false);
    newDealerHand.push(card);
    [card, newDeck] = dealCard(newDeck);
    newPlayerHand.push(card);
    [card, newDeck] = dealCard(newDeck);
    newDealerHand.push(card);
    
    setDeck(newDeck);
    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setGamePhase('playing');
    setResult(null);
    setWinAmount(0);
    
    const playerValue = calculateHandValue(newPlayerHand);
    if (playerValue === 21) {
      newDealerHand[0].faceUp = true;
      setDealerHand([...newDealerHand]);
      const dealerValue = calculateHandValue(newDealerHand);
      
      if (dealerValue === 21) {
        endGame('push', 0);
      } else {
        endGame('blackjack', Math.floor(bet * 1.5));
      }
    }
  };

  const hit = () => {
    soundManager.playCardFlip();
    let [card, newDeck] = dealCard(deck);
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    setDeck(newDeck);
    
    const value = calculateHandValue(newHand);
    if (value > 21) {
      endGame('bust', -bet);
    }
  };

  const stand = () => {
    setGamePhase('dealerTurn');
    
    const revealedDealerHand = dealerHand.map(c => ({ ...c, faceUp: true }));
    setDealerHand(revealedDealerHand);
    
    let currentDeck = [...deck];
    let currentHand = [...revealedDealerHand];
    
    const dealerPlay = () => {
      let dealerValue = calculateHandValue(currentHand);
      
      if (dealerValue < 17) {
        setTimeout(() => {
          soundManager.playCardFlip();
          let [card, newDeck] = dealCard(currentDeck);
          currentHand = [...currentHand, card];
          currentDeck = newDeck;
          setDealerHand([...currentHand]);
          setDeck(currentDeck);
          dealerPlay();
        }, DEALER_DELAY); // Slower dealer animation
      } else {
        // Wait before showing result
        setTimeout(() => {
          const playerValue = calculateHandValue(playerHand);
          dealerValue = calculateHandValue(currentHand);
          
          if (dealerValue > 21) {
            endGame('win', bet);
          } else if (playerValue > dealerValue) {
            endGame('win', bet);
          } else if (playerValue < dealerValue) {
            endGame('lose', -bet);
          } else {
            endGame('push', 0);
          }
        }, 500);
      }
    };
    
    setTimeout(dealerPlay, DEALER_DELAY);
  };

  const endGame = (resultType: string, amount: number) => {
    setGamePhase('finished');
    setWinAmount(amount);
    
    const newMoney = playerMoney + amount;
    setPlayerMoney(newMoney);
    
    const saved = loadGame();
    if (saved) {
      saved.player.money = newMoney;
      saveGame(saved);
    }
    
    switch (resultType) {
      case 'blackjack':
        setResult('BLACKJACK! 🎉');
        soundManager.playMinigameWin();
        break;
      case 'win':
        setResult('Du gewinnst! 💰');
        soundManager.playMinigameWin();
        break;
      case 'lose':
        setResult('Dealer gewinnt 😔');
        soundManager.playMinigameLose();
        break;
      case 'bust':
        setResult('Überkauft! 💥');
        soundManager.playMinigameLose();
        break;
      case 'push':
        setResult('Unentschieden');
        soundManager.playClick();
        break;
    }
  };

  const renderCard = (card: Card, index: number) => {
    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const suitSymbol = {
      hearts: '♥',
      diamonds: '♦',
      clubs: '♣',
      spades: '♠',
    }[card.suit];

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: -50, rotateY: 180 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`playing-card ${isRed ? 'red' : 'black'} w-20 h-32 md:w-24 md:h-36 flex flex-col items-center justify-center rounded-lg shadow-lg ${
          !card.faceUp ? 'bg-primary text-primary-foreground' : 'bg-white'
        }`}
      >
        {card.faceUp ? (
          <>
            <span className={`text-2xl md:text-3xl font-bold ${isRed ? 'text-red-600' : 'text-gray-900'}`}>{card.rank}</span>
            <span className={`text-4xl md:text-5xl ${isRed ? 'text-red-600' : 'text-gray-900'}`}>{suitSymbol}</span>
          </>
        ) : (
          <span className="text-4xl">🎴</span>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <Button variant="ghost" className="text-muted-foreground" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Zurück zum Spiel
          </Button>
          <h1 className="font-display text-4xl md:text-5xl text-primary text-glow">Casino</h1>
          <div className="text-right">
            <span className="text-2xl md:text-3xl font-bold text-primary">
              {formatMoney(playerMoney)}
            </span>
          </div>
        </div>

        {/* Game Area - Larger */}
        <div className="bg-card rounded-2xl p-6 md:p-12 card-glow min-h-[500px] md:min-h-[600px]">
          {/* Dealer's Hand */}
          <div className="mb-8 md:mb-12">
            <p className="text-muted-foreground mb-3 text-lg">Dealer {gamePhase !== 'betting' && `(${calculateHandValue(dealerHand)})`}</p>
            <div className="flex gap-3 md:gap-4 min-h-32 md:min-h-36">
              {dealerHand.map((card, i) => renderCard(card, i))}
            </div>
          </div>

          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center my-8 md:my-12"
            >
              <p className={`text-4xl md:text-5xl font-display ${winAmount > 0 ? 'text-success' : winAmount < 0 ? 'text-destructive' : 'text-primary'}`}>
                {result}
              </p>
              {winAmount !== 0 && (
                <p className={`text-2xl md:text-3xl mt-2 ${winAmount > 0 ? 'text-success' : 'text-destructive'}`}>
                  {winAmount > 0 ? '+' : ''}{formatMoney(winAmount)}
                </p>
              )}
            </motion.div>
          )}

          {/* Player's Hand */}
          <div className="mb-8 md:mb-12">
            <p className="text-muted-foreground mb-3 text-lg">Du {gamePhase !== 'betting' && `(${calculateHandValue(playerHand)})`}</p>
            <div className="flex gap-3 md:gap-4 min-h-32 md:min-h-36">
              {playerHand.map((card, i) => renderCard(card, i))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-6">
            {gamePhase === 'betting' && (
              <>
                <div className="flex items-center gap-6">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setBet(Math.max(10, bet - 10))}
                    disabled={bet <= 10}
                    className="h-14 w-14 rounded-full"
                  >
                    <Minus className="h-6 w-6" />
                  </Button>
                  <span className="text-4xl md:text-5xl font-display text-primary w-32 text-center">
                    €{bet}
                  </span>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setBet(Math.min(playerMoney, bet + 10))}
                    disabled={bet >= playerMoney}
                    className="h-14 w-14 rounded-full"
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>
                <Button
                  onClick={startGame}
                  disabled={bet > playerMoney || playerMoney <= 0}
                  className="game-btn bg-primary text-primary-foreground px-12 py-6 text-xl"
                >
                  Spielen
                </Button>
                {playerMoney <= 0 && (
                  <p className="text-destructive text-lg">Kein Geld mehr! Spiele im Hauptspiel, um Geld zu verdienen.</p>
                )}
              </>
            )}

            {gamePhase === 'playing' && (
              <div className="flex gap-6">
                <Button
                  onClick={hit}
                  className="game-btn bg-success text-success-foreground px-10 py-6 text-xl"
                >
                  Hit
                </Button>
                <Button
                  onClick={stand}
                  className="game-btn bg-warning text-warning-foreground px-10 py-6 text-xl"
                >
                  Stand
                </Button>
              </div>
            )}

            {gamePhase === 'dealerTurn' && (
              <p className="text-muted-foreground animate-pulse text-xl">Dealer zieht...</p>
            )}

            {gamePhase === 'finished' && (
              <Button
                onClick={() => setGamePhase('betting')}
                className="game-btn bg-primary text-primary-foreground px-12 py-6 text-xl"
              >
                Nochmal spielen
              </Button>
            )}
          </div>
        </div>

        {/* Rules */}
        <div className="mt-8 text-center text-muted-foreground">
          <p className="text-lg">Blackjack zahlt 3:2 | Dealer zieht bis 17</p>
        </div>
      </div>
    </div>
  );
};

export default Casino;
