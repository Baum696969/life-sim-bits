// Game Types for GitLife

export interface PlayerStats {
  iq: number;
  health: number;
  fitness: number;
  looks: number;
  luck: number;
}

export interface Player {
  id: string;
  name: string;
  birthYear: number;
  age: number;
  money: number;
  stats: PlayerStats;
  job: string | null;
  education: string | null;
  relationship: string | null;
  isAlive: boolean;
  createdAt: number;
}

export interface GameState {
  player: Player;
  timeline: TimelineEvent[];
  currentEvent: GameEvent | null;
  year: number;
  gameOver: boolean;
}

export interface TimelineEvent {
  id: string;
  year: number;
  age: number;
  title: string;
  description: string;
  effects: EventEffects;
  timestamp: number;
}

export interface EventEffects {
  moneyDelta?: number;
  iqDelta?: number;
  healthDelta?: number;
  fitnessDelta?: number;
  looksDelta?: number;
  luckDelta?: number;
}

export interface EventOption {
  id: string;
  label: string;
  effects: EventEffects;
  resultText: string;
  minigame?: MinigameType;
  nextEventId?: string;
}

export interface GameEvent {
  id: string;
  title: string;
  text: string;
  minAge: number;
  maxAge: number;
  category: EventCategory;
  weight: number;
  tags: string[];
  options: EventOption[];
}

export type EventCategory =
  | 'school'
  | 'career'
  | 'health'
  | 'social'
  | 'random'
  | 'minigame'
  | 'financial'
  | 'education'
  | 'relationship';

export type MinigameType =
  | 'flappy'
  | 'snake'
  | 'memory'
  | 'puzzle'
  | 'blackjack'
  | 'math';

export interface MinigameResult {
  type: MinigameType;
  score: number;
  won: boolean;
  effects: EventEffects;
}

export type AgeGroup =
  | 'baby'        // 0-5
  | 'child'       // 6-12
  | 'teen'        // 13-17
  | 'youngAdult'  // 18-25
  | 'adult'       // 26-60
  | 'senior';     // 61+

export interface MathQuestion {
  question: string;
  correctAnswer: number;
  options: number[];
  difficulty: number;
}

// Card types for Blackjack
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

export interface BlackjackHand {
  cards: Card[];
  value: number;
  isBusted: boolean;
  isBlackjack: boolean;
}

export interface BlackjackState {
  playerHand: BlackjackHand;
  dealerHand: BlackjackHand;
  deck: Card[];
  bet: number;
  gamePhase: 'betting' | 'playing' | 'dealerTurn' | 'finished';
  result: 'win' | 'lose' | 'push' | 'blackjack' | null;
}
