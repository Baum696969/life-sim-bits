import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, BlackjackHand, BlackjackState, Suit, Rank } from '@/types/game';
import { loadGame, saveGame, formatMoney } from '@/lib/gameUtils';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

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
  
  // Get best value (highest that's <= 21)
  const validValues = values.filter(v => v <= 21);
  if (validValues.length > 0) return Math.max(...validValues);
  return Math.min(...values);
};

const Casino = () => {
  const [playerMoney, setPlayerMoney] = useState(1000);
  const [bet, setBet] = useState(50);
  const [gamePhase, setGamePhase] = useState<'betting' | 'playing' | 'dealerTurn' | 'finished'>('betting');
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [winAmount, setWinAmount] = useState(0);

  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      setPlayerMoney(saved.player.money);
    }
  }, []);

  const dealCard = (currentDeck: Card[], faceUp = true): [Card, Card[]] => {
    const newDeck = [...currentDeck];
    const card = { ...newDeck.pop()!, faceUp };
    return [card, newDeck];
  };

  const startGame = () => {
    if (bet > playerMoney) return;
    
    let newDeck = createDeck();
    const newPlayerHand: Card[] = [];
    const newDealerHand: Card[] = [];
    
    // Deal initial cards
    let card: Card;
    [card, newDeck] = dealCard(newDeck);
    newPlayerHand.push(card);
    [card, newDeck] = dealCard(newDeck, false); // Dealer's first card face down
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
    
    // Check for blackjack
    const playerValue = calculateHandValue(newPlayerHand);
    if (playerValue === 21) {
      // Reveal dealer's card
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
    
    // Reveal dealer's hidden card
    const revealedDealerHand = dealerHand.map(c => ({ ...c, faceUp: true }));
    setDealerHand(revealedDealerHand);
    
    // Dealer draws
    let currentDeck = [...deck];
    let currentHand = [...revealedDealerHand];
    
    const dealerPlay = () => {
      let dealerValue = calculateHandValue(currentHand);
      
      if (dealerValue < 17) {
        setTimeout(() => {
          let [card, newDeck] = dealCard(currentDeck);
          currentHand = [...currentHand, card];
          currentDeck = newDeck;
          setDealerHand([...currentHand]);
          setDeck(currentDeck);
          dealerPlay();
        }, 500);
      } else {
        // Determine winner
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
      }
    };
    
    setTimeout(dealerPlay, 500);
  };

  const endGame = (resultType: string, amount: number) => {
    setGamePhase('finished');
    setWinAmount(amount);
    
    const newMoney = playerMoney + amount;
    setPlayerMoney(newMoney);
    
    // Save to game state
    const saved = loadGame();
    if (saved) {
      saved.player.money = newMoney;
      saveGame(saved);
    }
    
    switch (resultType) {
      case 'blackjack':
        setResult('BLACKJACK! 🎉');
        break;
      case 'win':
        setResult('Du gewinnst! 💰');
        break;
      case 'lose':
        setResult('Dealer gewinnt 😔');
        break;
      case 'bust':
        setResult('Überkauft! 💥');
        break;
      case 'push':
        setResult('Unentschieden');
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
        className={`playing-card ${isRed ? 'red' : 'black'} w-16 h-24 flex flex-col items-center justify-center ${
          !card.faceUp ? 'bg-primary text-primary-foreground' : ''
        }`}
      >
        {card.faceUp ? (
          <>
            <span className="text-lg font-bold">{card.rank}</span>
            <span className="text-2xl">{suitSymbol}</span>
          </>
        ) : (
          <span className="text-2xl">🎴</span>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
            </Button>
          </Link>
          <h1 className="font-display text-3xl text-primary text-glow">Casino</h1>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">
              {formatMoney(playerMoney)}
            </span>
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-card rounded-xl p-8 card-glow">
          {/* Dealer's Hand */}
          <div className="mb-8">
            <p className="text-muted-foreground mb-2">Dealer {gamePhase !== 'betting' && `(${calculateHandValue(dealerHand)})`}</p>
            <div className="flex gap-2 min-h-24">
              {dealerHand.map((card, i) => renderCard(card, i))}
            </div>
          </div>

          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center my-8"
            >
              <p className={`text-3xl font-display ${winAmount > 0 ? 'text-success' : winAmount < 0 ? 'text-destructive' : 'text-primary'}`}>
                {result}
              </p>
              {winAmount !== 0 && (
                <p className={`text-xl ${winAmount > 0 ? 'text-success' : 'text-destructive'}`}>
                  {winAmount > 0 ? '+' : ''}{formatMoney(winAmount)}
                </p>
              )}
            </motion.div>
          )}

          {/* Player's Hand */}
          <div className="mb-8">
            <p className="text-muted-foreground mb-2">Du {gamePhase !== 'betting' && `(${calculateHandValue(playerHand)})`}</p>
            <div className="flex gap-2 min-h-24">
              {playerHand.map((card, i) => renderCard(card, i))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-4">
            {gamePhase === 'betting' && (
              <>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setBet(Math.max(10, bet - 10))}
                    disabled={bet <= 10}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-2xl font-display text-primary w-24 text-center">
                    €{bet}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setBet(Math.min(playerMoney, bet + 10))}
                    disabled={bet >= playerMoney}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={startGame}
                  disabled={bet > playerMoney || playerMoney <= 0}
                  className="game-btn bg-primary text-primary-foreground px-8 py-4"
                >
                  Spielen
                </Button>
                {playerMoney <= 0 && (
                  <p className="text-destructive">Kein Geld mehr! Spiele im Hauptspiel, um Geld zu verdienen.</p>
                )}
              </>
            )}

            {gamePhase === 'playing' && (
              <div className="flex gap-4">
                <Button
                  onClick={hit}
                  className="game-btn bg-success text-success-foreground px-8 py-4"
                >
                  Hit
                </Button>
                <Button
                  onClick={stand}
                  className="game-btn bg-warning text-warning-foreground px-8 py-4"
                >
                  Stand
                </Button>
              </div>
            )}

            {gamePhase === 'dealerTurn' && (
              <p className="text-muted-foreground animate-pulse">Dealer zieht...</p>
            )}

            {gamePhase === 'finished' && (
              <Button
                onClick={() => setGamePhase('betting')}
                className="game-btn bg-primary text-primary-foreground px-8 py-4"
              >
                Nochmal spielen
              </Button>
            )}
          </div>
        </div>

        {/* Rules */}
        <div className="mt-8 text-center text-muted-foreground text-sm">
          <p>Blackjack zahlt 3:2 | Dealer zieht bis 17 | Versicherung nicht verfügbar</p>
        </div>
      </div>
    </div>
  );
};

export default Casino;
