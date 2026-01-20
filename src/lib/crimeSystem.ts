import { CrimeType, Player, CriminalRecord, EventEffects } from '@/types/game';

export interface CrimeOption {
  id: CrimeType;
  name: string;
  description: string;
  minReward: number;
  maxReward: number;
  baseSuccessRate: number;
  basePrisonYears: number;
  maxPrisonYears: number;
}

export const crimeOptions: CrimeOption[] = [
  {
    id: 'pickpocket',
    name: 'Taschendiebstahl',
    description: 'Stehle Geld von Passanten',
    minReward: 50,
    maxReward: 500,
    baseSuccessRate: 0.7,
    basePrisonYears: 1,
    maxPrisonYears: 3,
  },
  {
    id: 'packagetheft',
    name: 'Paketdiebstahl',
    description: 'Stehle Pakete von Haustüren',
    minReward: 100,
    maxReward: 800,
    baseSuccessRate: 0.65,
    basePrisonYears: 1,
    maxPrisonYears: 4,
  },
  {
    id: 'fraud',
    name: 'Betrug',
    description: 'Täusche andere für Profit',
    minReward: 500,
    maxReward: 5000,
    baseSuccessRate: 0.5,
    basePrisonYears: 2,
    maxPrisonYears: 8,
  },
  {
    id: 'cartheft',
    name: 'Autodiebstahl',
    description: 'Stehle Fahrzeuge und verkaufe sie',
    minReward: 2000,
    maxReward: 15000,
    baseSuccessRate: 0.4,
    basePrisonYears: 3,
    maxPrisonYears: 10,
  },
  {
    id: 'bankrobbery',
    name: 'Bankraub',
    description: 'Überfall eine Bank - hohes Risiko!',
    minReward: 10000,
    maxReward: 100000,
    baseSuccessRate: 0.2,
    basePrisonYears: 10,
    maxPrisonYears: 25,
  },
];

export const calculateSuccessRate = (
  baseRate: number,
  player: Player
): number => {
  // IQ bonus (up to +15%)
  const iqBonus = (player.stats.iq - 50) / 100 * 0.3;
  
  // Luck bonus (up to +20%)
  const luckBonus = (player.stats.luck - 50) / 100 * 0.4;
  
  // Criminal record penalty (-5% per offense)
  const recordPenalty = player.criminalRecord.filter(r => r.caught).length * 0.05;
  
  const finalRate = Math.max(0.05, Math.min(0.95, baseRate + iqBonus + luckBonus - recordPenalty));
  
  return finalRate;
};

export const calculatePrisonTime = (
  crime: CrimeOption,
  player: Player
): number => {
  const priorOffenses = player.criminalRecord.filter(r => r.caught).length;
  
  // Base time + additional for repeat offenders
  const baseTime = crime.basePrisonYears + Math.floor(priorOffenses * 1.5);
  
  // Random variance
  const variance = Math.floor(Math.random() * (crime.maxPrisonYears - crime.basePrisonYears));
  
  return Math.min(crime.maxPrisonYears + priorOffenses * 2, baseTime + variance);
};

export const attemptCrime = (
  crime: CrimeOption,
  player: Player
): {
  success: boolean;
  reward: number;
  prisonYears: number;
  record: CriminalRecord;
} => {
  const successRate = calculateSuccessRate(crime.baseSuccessRate, player);
  const success = Math.random() < successRate;
  
  const reward = success
    ? Math.floor(Math.random() * (crime.maxReward - crime.minReward) + crime.minReward)
    : 0;
  
  const prisonYears = success ? 0 : calculatePrisonTime(crime, player);
  
  const record: CriminalRecord = {
    id: Math.random().toString(36).substring(2, 15),
    crimeType: crime.id,
    year: new Date().getFullYear(),
    caught: !success,
    prisonYears,
  };
  
  return { success, reward, prisonYears, record };
};

export const getPrisonEvents = (): {
  title: string;
  description: string;
  effects: EventEffects;
}[] => [
  {
    title: 'Gefängnisalltag',
    description: 'Ein weiteres Jahr hinter Gittern vergeht.',
    effects: { healthDelta: -5, fitnessDelta: -3 },
  },
  {
    title: 'Schlägerei',
    description: 'Du wirst in eine Schlägerei verwickelt.',
    effects: { healthDelta: -15, fitnessDelta: 5 },
  },
  {
    title: 'Bibliothek',
    description: 'Du liest viele Bücher und bildest dich weiter.',
    effects: { iqDelta: 5, healthDelta: -2 },
  },
  {
    title: 'Training',
    description: 'Du trainierst im Gefängnishof.',
    effects: { fitnessDelta: 10, healthDelta: -2 },
  },
  {
    title: 'Krankheit',
    description: 'Die Haftbedingungen machen dich krank.',
    effects: { healthDelta: -20 },
  },
];
