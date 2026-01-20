import { Player, PlayerStats, GameState, TimelineEvent, EventEffects, AgeGroup, EducationLevel } from '@/types/game';

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const createNewPlayer = (name: string): Player => {
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear;
  
  return {
    id: generateId(),
    name,
    birthYear,
    age: 0,
    money: 0,
    stats: {
      iq: 50 + Math.floor(Math.random() * 30),
      health: 80 + Math.floor(Math.random() * 20),
      fitness: 50 + Math.floor(Math.random() * 30),
      looks: 30 + Math.floor(Math.random() * 50),
      luck: 30 + Math.floor(Math.random() * 40),
    },
    job: null,
    education: 'kindergarten',
    relationship: null,
    isAlive: true,
    createdAt: Date.now(),
    // New fields
    inSchool: false,
    schoolYearsCompleted: 0,
    hasNewspaperJob: false,
    criminalRecord: [],
    inPrison: false,
    prisonYearsRemaining: 0,
    extraSchoolYears: 0,
  };
};

export const createNewGameState = (player: Player): GameState => {
  return {
    player,
    timeline: [],
    currentEvent: null,
    year: new Date().getFullYear(),
    gameOver: false,
  };
};

export const getAgeGroup = (age: number): AgeGroup => {
  if (age <= 5) return 'baby';
  if (age <= 12) return 'child';
  if (age <= 17) return 'teen';
  if (age <= 25) return 'youngAdult';
  if (age <= 60) return 'adult';
  return 'senior';
};

export const getAgeGroupLabel = (ageGroup: AgeGroup): string => {
  const labels: Record<AgeGroup, string> = {
    baby: 'Kleinkind',
    child: 'Kind',
    teen: 'Teenager',
    youngAdult: 'Junger Erwachsener',
    adult: 'Erwachsener',
    senior: 'Senior',
  };
  return labels[ageGroup];
};

export const clampStat = (value: number): number => {
  return Math.max(0, Math.min(100, value));
};

export const applyEffects = (player: Player, effects: EventEffects): Player => {
  const newStats: PlayerStats = {
    iq: clampStat(player.stats.iq + (effects.iqDelta || 0)),
    health: clampStat(player.stats.health + (effects.healthDelta || 0)),
    fitness: clampStat(player.stats.fitness + (effects.fitnessDelta || 0)),
    looks: clampStat(player.stats.looks + (effects.looksDelta || 0)),
    luck: clampStat(player.stats.luck + (effects.luckDelta || 0)),
  };

  const newMoney = player.money + (effects.moneyDelta || 0);

  return {
    ...player,
    money: Math.max(0, newMoney),
    stats: newStats,
    isAlive: newStats.health > 0,
  };
};

export const updateEducation = (player: Player): Player => {
  let newEducation: EducationLevel = player.education;
  
  // Automatic school progression
  if (player.age === 6) {
    newEducation = 'elementary';
  } else if (player.age === 10) {
    newEducation = 'middleschool';
  } else if (player.age === 13) {
    newEducation = 'highschool';
  }
  
  return {
    ...player,
    education: newEducation,
    inSchool: player.age >= 6 && player.age <= 16 + player.extraSchoolYears,
  };
};

export const agePlayer = (player: Player): Player => {
  // Passive stat changes based on age and lifestyle
  const passiveEffects: EventEffects = {};
  
  // Health declines with age
  if (player.age > 40) {
    passiveEffects.healthDelta = -Math.floor(Math.random() * 2);
  }
  if (player.age > 60) {
    passiveEffects.healthDelta = (passiveEffects.healthDelta || 0) - Math.floor(Math.random() * 3);
  }
  
  // Fitness declines if not maintained
  if (player.stats.fitness > 30) {
    passiveEffects.fitnessDelta = -Math.floor(Math.random() * 2);
  }
  
  // Looks decline with age
  if (player.age > 35) {
    if (Math.random() < 0.3) {
      passiveEffects.looksDelta = -1;
    }
  }

  // Prison effects
  if (player.inPrison && player.prisonYearsRemaining > 0) {
    passiveEffects.healthDelta = (passiveEffects.healthDelta || 0) - 5;
    passiveEffects.luckDelta = -2;
  }

  const agedPlayer = applyEffects(player, passiveEffects);
  
  // Update education
  const educatedPlayer = updateEducation(agedPlayer);
  
  // Add newspaper job income
  let income = 0;
  if (educatedPlayer.hasNewspaperJob && educatedPlayer.age >= 13) {
    income += 50; // Yearly newspaper income
  }
  
  // Add job income
  if (educatedPlayer.job && !educatedPlayer.inPrison) {
    income += educatedPlayer.job.salary;
  }
  
  // Handle prison time
  let prisonRemaining = educatedPlayer.prisonYearsRemaining;
  let stillInPrison = educatedPlayer.inPrison;
  if (stillInPrison && prisonRemaining > 0) {
    prisonRemaining--;
    if (prisonRemaining <= 0) {
      stillInPrison = false;
    }
  }
  
  return {
    ...educatedPlayer,
    age: player.age + 1,
    money: educatedPlayer.money + income,
    inPrison: stillInPrison,
    prisonYearsRemaining: prisonRemaining,
  };
};

export const createTimelineEvent = (
  year: number,
  age: number,
  title: string,
  description: string,
  effects: EventEffects
): TimelineEvent => {
  return {
    id: generateId(),
    year,
    age,
    title,
    description,
    effects,
    timestamp: Date.now(),
  };
};

export const formatMoney = (amount: number): string => {
  if (amount >= 1000000) {
    return `€${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `€${(amount / 1000).toFixed(1)}K`;
  }
  return `€${amount}`;
};

export const formatEffects = (effects: EventEffects): string[] => {
  const formatted: string[] = [];
  
  if (effects.moneyDelta) {
    const sign = effects.moneyDelta > 0 ? '+' : '';
    formatted.push(`${sign}${formatMoney(effects.moneyDelta)}`);
  }
  if (effects.iqDelta) {
    const sign = effects.iqDelta > 0 ? '+' : '';
    formatted.push(`${sign}${effects.iqDelta} IQ`);
  }
  if (effects.healthDelta) {
    const sign = effects.healthDelta > 0 ? '+' : '';
    formatted.push(`${sign}${effects.healthDelta} Gesundheit`);
  }
  if (effects.fitnessDelta) {
    const sign = effects.fitnessDelta > 0 ? '+' : '';
    formatted.push(`${sign}${effects.fitnessDelta} Fitness`);
  }
  if (effects.looksDelta) {
    const sign = effects.looksDelta > 0 ? '+' : '';
    formatted.push(`${sign}${effects.looksDelta} Aussehen`);
  }
  if (effects.luckDelta) {
    const sign = effects.luckDelta > 0 ? '+' : '';
    formatted.push(`${sign}${effects.luckDelta} Glück`);
  }
  
  return formatted;
};

// Save/Load game state
const STORAGE_KEY = 'gitlife_save';

export const saveGame = (state: GameState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save game:', error);
  }
};

export const loadGame = (): GameState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load game:', error);
  }
  return null;
};

export const clearSave = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear save:', error);
  }
};

export const hasSavedGame = (): boolean => {
  return localStorage.getItem(STORAGE_KEY) !== null;
};
