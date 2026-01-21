// Game Types for GitLife

export interface PlayerStats {
  iq: number;
  health: number;
  fitness: number;
  looks: number;
  luck: number;
}

export type PlayerGender = 'male' | 'female';

export interface Player {
  id: string;
  name: string;
  gender: PlayerGender;
  birthYear: number;
  age: number;
  money: number;
  stats: PlayerStats;
  job: Job | null;
  education: EducationLevel;
  relationship: string | null;
  isAlive: boolean;
  createdAt: number;
  // New fields for extended gameplay
  inSchool: boolean;
  schoolYearsCompleted: number;
  hasNewspaperJob: boolean;
  criminalRecord: CriminalRecord[];
  inPrison: boolean;
  prisonYearsRemaining: number;
  extraSchoolYears: number; // Optional +2 years after age 16
}

export interface Job {
  id: string;
  title: string;
  salary: number;
  requiredIQ: number;
  requiredEducation: EducationLevel;
}

export type EducationLevel = 
  | 'none'
  | 'kindergarten'
  | 'elementary'      // Grundschule (6-10)
  | 'middleschool'    // Mittelstufe (11-13)
  | 'highschool'      // Oberstufe (14-16)
  | 'extended'        // Extra 2 Jahre (17-18)
  | 'apprenticeship'  // Ausbildung
  | 'university';     // Studium

export interface CriminalRecord {
  id: string;
  crimeType: CrimeType;
  year: number;
  caught: boolean;
  prisonYears: number;
}

export type CrimeType = 
  | 'pickpocket'      // Taschendiebstahl
  | 'bankrobbery'     // Bankraub
  | 'packagetheft'    // Paketdiebstahl
  | 'fraud'           // Betrug
  | 'cartheft';       // Autodiebstahl

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
  | 'relationship'
  | 'crime'
  | 'prison';

export type MinigameType =
  | 'flappy'
  | 'snake'
  | 'memory'
  | 'puzzle'
  | 'blackjack'
  | 'math'
  | 'sequence'
  | 'spaceshooter'
  | 'bottles'
  | 'english'
  | 'german'
  | 'timesense';

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

// Life History / Death Archive
export interface LifeRecord {
  id: string;
  playerName: string;
  birthYear: number;
  deathYear: number;
  ageAtDeath: number;
  maxMoney: number;
  finalMoney: number;
  causeOfDeath: string;
  topEvents: { title: string; age: number }[];
  finalStats: PlayerStats;
  education: EducationLevel;
  job: string | null;
  createdAt: number;
}

// Highscore System
export interface HighscoreEntry {
  id: string;
  minigame: MinigameType;
  score: number;
  playerName: string;
  lifeId: string;
  date: number;
}

// Admin Logging
export interface AdminLog {
  id: string;
  action: 'create' | 'update' | 'delete';
  eventId: string;
  eventTitle: string;
  timestamp: number;
}
