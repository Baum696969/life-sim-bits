import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, Rank, Suit } from '@/types/game';
import { formatMoney } from '@/lib/gameUtils';
import { soundManager } from '@/lib/soundManager';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const MIN_AGE = 16;
const DEALER_DELAY = 900;

type GamePhase = 'betting' | 'playing' | 'dealerTurn' | 'finished';

interface BlackjackMinigameProps {
  onComplete: (result: { score: number; won: boolean; effects: any }) => void;
  playerMoney: number;
  playerAge?: number;
}

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

const Blackjack = ({ onComplete, playerMoney, playerAge }: BlackjackMinigameProps) => {
  const safeAge = playerAge ?? 0;
  const [bet, setBet] = useState(50);
  const [phase, setPhase] = useState<GamePhase>('betting');
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [resultText, setResultText] = useState<string | null>(null);
  const [delta, setDelta] = useState(0);

  const maxBet = useMemo(() => Math.max(0, playerMoney), [playerMoney]);

  useEffect(() => {
    // Keep bet valid when playerMoney changes
    setBet(prev => Math.min(Math.max(10, prev), Math.max(10, maxBet)));
  }, [maxBet]);

  if (safeAge > 0 && safeAge < MIN_AGE) {
    return (
      <div className="w-full max-w-2xl mx-auto text-center space-y-4">
        <h2 className="font-display text-2xl text-primary">Casino</h2>
        <p className="text-muted-foreground">Du musst mindestens {MIN_AGE} Jahre alt sein, um Blackjack zu spielen.</p>
        <Button
          className="game-btn"
          onClick={() => onComplete({ score: 0, won: false, effects: {} })}
        >
          Zurück
        </Button>
      </div>
    );
  }

  const dealCard = (currentDeck: Card[], faceUp = true): [Card, Card[]] => {
    const newDeck = [...currentDeck];
    const card = { ...newDeck.pop()!, faceUp };
    return [card, newDeck];
  };

  const endRound = (type: 'blackjack' | 'win' | 'lose' | 'bust' | 'push', amount: number) => {
    setPhase('finished');
    setDelta(amount);

    const msg =
      type === 'blackjack'
        ? 'BLACKJACK!'
        : type === 'win'
          ? 'Du gewinnst!'
          : type === 'lose'
            ? 'Dealer gewinnt'
            : type === 'bust'
              ? 'Überkauft!'
              : 'Unentschieden';
    setResultText(msg);

    if (amount > 0) soundManager.playMinigameWin();
    else if (amount < 0) soundManager.playMinigameLose();
    else soundManager.playClick();
  };

  const startRound = () => {
    if (bet > playerMoney || playerMoney <= 0) return;
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
    setPhase('playing');
    setResultText(null);
    setDelta(0);

    const playerValue = calculateHandValue(newPlayerHand);
    if (playerValue === 21) {
      const revealedDealer = [{ ...newDealerHand[0], faceUp: true }, newDealerHand[1]];
      const dealerValue = calculateHandValue(revealedDealer.map(c => ({ ...c, faceUp: true })));
      setDealerHand(revealedDealer);
      if (dealerValue === 21) endRound('push', 0);
      else endRound('blackjack', Math.floor(bet * 1.5));
    }
  };

  const hit = () => {
    soundManager.playCardFlip();
    const [card, newDeck] = dealCard(deck);
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    setDeck(newDeck);

    const value = calculateHandValue(newHand);
    if (value > 21) {
      endRound('bust', -bet);
    }
  };

  const stand = () => {
    setPhase('dealerTurn');
    const revealedDealerHand = dealerHand.map(c => ({ ...c, faceUp: true }));
    setDealerHand(revealedDealerHand);

    let currentDeck = [...deck];
    let currentHand = [...revealedDealerHand];

    const dealerPlay = () => {
      let dealerValue = calculateHandValue(currentHand);

      if (dealerValue < 17) {
        setTimeout(() => {
          soundManager.playCardFlip();
          const [card, newDeck] = dealCard(currentDeck);
          currentHand = [...currentHand, card];
          currentDeck = newDeck;
          setDealerHand([...currentHand]);
          setDeck(currentDeck);
          dealerPlay();
        }, DEALER_DELAY);
      } else {
        setTimeout(() => {
          const playerValue = calculateHandValue(playerHand);
          dealerValue = calculateHandValue(currentHand);

          if (dealerValue > 21) endRound('win', bet);
          else if (playerValue > dealerValue) endRound('win', bet);
          else if (playerValue < dealerValue) endRound('lose', -bet);
          else endRound('push', 0);
        }, 450);
      }
    };

    setTimeout(dealerPlay, DEALER_DELAY);
  };

  const renderCard = (card: Card, index: number) => {
    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const suitSymbol =
      ({ hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' } as const)[card.suit];

    return (
      <motion.div
        key={`${card.suit}-${card.rank}-${index}`}
        initial={{ opacity: 0, y: -30, rotateY: 180 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        transition={{ delay: index * 0.08 }}
        className={`playing-card w-16 h-24 sm:w-20 sm:h-28 flex flex-col items-center justify-center rounded-lg shadow-lg ${
          !card.faceUp ? 'bg-primary text-primary-foreground' : 'bg-white'
        }`}
      >
        {card.faceUp ? (
          <>
            <span className={`text-xl sm:text-2xl font-bold ${isRed ? 'text-red-600' : 'text-gray-900'}`}>{card.rank}</span>
            <span className={`text-3xl sm:text-4xl ${isRed ? 'text-red-600' : 'text-gray-900'}`}>{suitSymbol}</span>
          </>
        ) : (
          <span className="text-3xl">🎴</span>
        )}
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl sm:text-3xl text-primary">Blackjack</h2>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Geld</div>
          <div className="font-display text-xl text-primary">{formatMoney(playerMoney)}</div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 sm:p-6 card-glow">
        <div className="mb-5">
          <p className="text-muted-foreground mb-2">
            Dealer {phase !== 'betting' && `(${calculateHandValue(dealerHand)})`}
          </p>
          <div className="flex gap-2 min-h-24">
            {dealerHand.map((c, i) => renderCard(c, i))}
          </div>
        </div>

        {resultText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center my-4"
          >
            <p className="font-display text-3xl text-primary">{resultText}</p>
            <p className={`text-lg mt-1 ${delta > 0 ? 'text-success' : delta < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {delta > 0 ? '+' : ''}{formatMoney(delta)}
            </p>
          </motion.div>
        )}

        <div className="mb-5">
          <p className="text-muted-foreground mb-2">
            Du {phase !== 'betting' && `(${calculateHandValue(playerHand)})`}
          </p>
          <div className="flex gap-2 min-h-24">
            {playerHand.map((c, i) => renderCard(c, i))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          {phase === 'betting' && (
            <>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setBet(b => Math.max(10, b - 10))}
                  disabled={bet <= 10}
                  className="h-12 w-12 rounded-full"
                >
                  -
                </Button>
                <div className="text-center w-32">
                  <div className="text-sm text-muted-foreground">Einsatz</div>
                  <div className="font-display text-3xl text-primary">€{bet}</div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setBet(b => Math.min(maxBet, b + 10))}
                  disabled={bet >= maxBet}
                  className="h-12 w-12 rounded-full"
                >
                  +
                </Button>
              </div>

              <Button
                onClick={startRound}
                disabled={bet > playerMoney || playerMoney <= 0}
                className="game-btn bg-primary text-primary-foreground px-10 py-5 text-lg"
              >
                Runde starten
              </Button>
            </>
          )}

          {phase === 'playing' && (
            <div className="flex gap-4">
              <Button onClick={hit} className="game-btn bg-success text-success-foreground px-10 py-5 text-lg">
                Hit
              </Button>
              <Button onClick={stand} className="game-btn bg-warning text-warning-foreground px-10 py-5 text-lg">
                Stand
              </Button>
            </div>
          )}

          {phase === 'dealerTurn' && (
            <p className="text-muted-foreground animate-pulse">Dealer zieht…</p>
          )}

          {phase === 'finished' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setPhase('betting')}
                className="game-btn bg-primary text-primary-foreground px-10 py-5 text-lg"
              >
                Nochmal
              </Button>
              <Button
                variant="outline"
                onClick={() => onComplete({ score: Math.abs(delta), won: delta >= 0, effects: { moneyDelta: delta } })}
                className="px-10 py-5 text-lg"
              >
                Ergebnis nehmen
              </Button>
            </div>
          )}
        </div>
      </div>

      <p className="mt-3 text-center text-muted-foreground text-sm">Blackjack zahlt 3:2 | Dealer zieht bis 17</p>
    </div>
  );
};

export default Blackjack;
