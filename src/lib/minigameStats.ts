// Minigame Statistics Tracking

export interface MinigameStats {
  playCount: number;
  totalScore: number;
  highScore: number;
  lowScore: number;
  wins: number;
  losses: number;
  lastPlayed: number;
}

export type MinigameStatsRecord = Record<string, MinigameStats>;

const STATS_KEY = 'gitlife_minigame_stats';

const getDefaultStats = (): MinigameStats => ({
  playCount: 0,
  totalScore: 0,
  highScore: 0,
  lowScore: Infinity,
  wins: 0,
  losses: 0,
  lastPlayed: 0,
});

export const getAllMinigameStats = (): MinigameStatsRecord => {
  try {
    const saved = localStorage.getItem(STATS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Fix Infinity serialization issue
      Object.keys(parsed).forEach(key => {
        if (parsed[key].lowScore === null) {
          parsed[key].lowScore = Infinity;
        }
      });
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load minigame stats:', error);
  }
  return {};
};

export const getMinigameStats = (minigameId: string): MinigameStats => {
  const allStats = getAllMinigameStats();
  return allStats[minigameId] || getDefaultStats();
};

export const recordMinigamePlay = (
  minigameId: string,
  score: number,
  won: boolean
): MinigameStats => {
  const allStats = getAllMinigameStats();
  const current = allStats[minigameId] || getDefaultStats();

  const updated: MinigameStats = {
    playCount: current.playCount + 1,
    totalScore: current.totalScore + score,
    highScore: Math.max(current.highScore, score),
    lowScore: Math.min(current.lowScore === Infinity ? score : current.lowScore, score),
    wins: current.wins + (won ? 1 : 0),
    losses: current.losses + (won ? 0 : 1),
    lastPlayed: Date.now(),
  };

  allStats[minigameId] = updated;

  try {
    // Handle Infinity for JSON serialization
    const toSave = JSON.stringify(allStats, (key, value) => {
      if (value === Infinity) return null;
      return value;
    });
    localStorage.setItem(STATS_KEY, toSave);
  } catch (error) {
    console.error('Failed to save minigame stats:', error);
  }

  return updated;
};

export const getAverageScore = (minigameId: string): number => {
  const stats = getMinigameStats(minigameId);
  if (stats.playCount === 0) return 0;
  return Math.round(stats.totalScore / stats.playCount);
};

export const getWinRate = (minigameId: string): number => {
  const stats = getMinigameStats(minigameId);
  const total = stats.wins + stats.losses;
  if (total === 0) return 0;
  return Math.round((stats.wins / total) * 100);
};

export const getTotalPlays = (): number => {
  const allStats = getAllMinigameStats();
  return Object.values(allStats).reduce((sum, s) => sum + s.playCount, 0);
};

export const getMostPlayedMinigame = (): { id: string; count: number } | null => {
  const allStats = getAllMinigameStats();
  let maxId = '';
  let maxCount = 0;
  
  Object.entries(allStats).forEach(([id, stats]) => {
    if (stats.playCount > maxCount) {
      maxId = id;
      maxCount = stats.playCount;
    }
  });

  return maxId ? { id: maxId, count: maxCount } : null;
};

export const clearMinigameStats = (): void => {
  try {
    localStorage.removeItem(STATS_KEY);
  } catch (error) {
    console.error('Failed to clear minigame stats:', error);
  }
};

export const formatLastPlayed = (timestamp: number): string => {
  if (!timestamp) return 'Nie';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Gerade eben';
  if (minutes < 60) return `Vor ${minutes}m`;
  if (hours < 24) return `Vor ${hours}h`;
  if (days < 7) return `Vor ${days}d`;
  
  return new Date(timestamp).toLocaleDateString('de-DE');
};
