// Legacy/Meta-Progression System
import { Player, PlayerStats } from '@/types/game';

const LEGACY_KEY = 'gitlife_legacy';

export interface LegacyData {
  coins: number;
  totalLives: number;
  highestAge: number;
  totalEarnings: number;
  unlockedBonuses: LegacyBonus[];
}

export interface LegacyBonus {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  maxLevel: number;
  currentLevel: number;
  effect: Partial<PlayerStats> | { money?: number };
}

const defaultBonuses: LegacyBonus[] = [
  {
    id: 'smart_start',
    name: 'Super Schlau',
    description: '+10 IQ bei Spielbeginn',
    baseCost: 500,
    maxLevel: 5,
    currentLevel: 0,
    effect: { iq: 10 },
  },
  {
    id: 'healthy_start',
    name: 'Gesund gestartet',
    description: '+10 Gesundheit bei Spielbeginn',
    baseCost: 300,
    maxLevel: 5,
    currentLevel: 0,
    effect: { health: 10 },
  },
  {
    id: 'fit_start',
    name: 'Fit gestartet',
    description: '+10 Fitness bei Spielbeginn',
    baseCost: 400,
    maxLevel: 5,
    currentLevel: 0,
    effect: { fitness: 10 },
  },
  {
    id: 'beautiful_start',
    name: 'Gutes Aussehen',
    description: '+10 Aussehen bei Spielbeginn',
    baseCost: 400,
    maxLevel: 5,
    currentLevel: 0,
    effect: { looks: 10 },
  },
  {
    id: 'lucky_start',
    name: 'Glückskind',
    description: '+10 Glück bei Spielbeginn',
    baseCost: 600,
    maxLevel: 5,
    currentLevel: 0,
    effect: { luck: 10 },
  },
  {
    id: 'rich_start',
    name: 'Reiches Erbe',
    description: '+€500 bei Spielbeginn',
    baseCost: 1000,
    maxLevel: 5,
    currentLevel: 0,
    effect: { money: 500 },
  },
];

export const getLegacyData = (): LegacyData => {
  try {
    const saved = localStorage.getItem(LEGACY_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      // Merge with default bonuses for new bonuses
      const existingIds = data.unlockedBonuses.map((b: LegacyBonus) => b.id);
      const newBonuses = defaultBonuses.filter(b => !existingIds.includes(b.id));
      return {
        ...data,
        unlockedBonuses: [...data.unlockedBonuses, ...newBonuses],
      };
    }
  } catch (error) {
    console.error('Failed to load legacy data:', error);
  }
  return {
    coins: 0,
    totalLives: 0,
    highestAge: 0,
    totalEarnings: 0,
    unlockedBonuses: [...defaultBonuses],
  };
};

export const saveLegacyData = (data: LegacyData): void => {
  try {
    localStorage.setItem(LEGACY_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save legacy data:', error);
  }
};

export const addLegacyCoins = (amount: number): void => {
  const data = getLegacyData();
  data.coins += amount;
  saveLegacyData(data);
};

export const recordDeath = (player: Player): number => {
  const data = getLegacyData();
  const legacyCoins = Math.floor(player.money * 0.1); // 10% of final money
  
  data.coins += legacyCoins;
  data.totalLives += 1;
  data.highestAge = Math.max(data.highestAge, player.age);
  data.totalEarnings += player.money;
  
  saveLegacyData(data);
  return legacyCoins;
};

export const getBonusCost = (bonus: LegacyBonus): number => {
  // Each level costs more (2x previous level)
  return bonus.baseCost * Math.pow(2, bonus.currentLevel);
};

export const purchaseBonus = (bonusId: string): boolean => {
  const data = getLegacyData();
  const bonus = data.unlockedBonuses.find(b => b.id === bonusId);
  
  if (!bonus) return false;
  if (bonus.currentLevel >= bonus.maxLevel) return false;
  
  const cost = getBonusCost(bonus);
  if (data.coins < cost) return false;
  
  data.coins -= cost;
  bonus.currentLevel += 1;
  
  saveLegacyData(data);
  return true;
};

export const getStartBonuses = (): { stats: Partial<PlayerStats>; money: number } => {
  const data = getLegacyData();
  const bonuses: Partial<PlayerStats> = {};
  let extraMoney = 0;
  
  data.unlockedBonuses.forEach(bonus => {
    if (bonus.currentLevel > 0) {
      const effect = bonus.effect as any;
      if (effect.money) {
        extraMoney += effect.money * bonus.currentLevel;
      } else {
        Object.keys(effect).forEach(key => {
          const statKey = key as keyof PlayerStats;
          bonuses[statKey] = (bonuses[statKey] || 0) + effect[statKey] * bonus.currentLevel;
        });
      }
    }
  });
  
  return { stats: bonuses, money: extraMoney };
};
