import { HighscoreEntry, MinigameType } from '@/types/game';

const HIGHSCORE_KEY = 'gitlife_highscores';

export const saveHighscore = (
  minigame: MinigameType,
  score: number,
  playerName: string,
  lifeId: string
): HighscoreEntry | null => {
  const currentBest = getBestScore(minigame);
  
  // Only save if it's a new high score
  if (currentBest && currentBest.score >= score) {
    return null;
  }

  const entry: HighscoreEntry = {
    id: Math.random().toString(36).substring(2, 15),
    minigame,
    score,
    playerName,
    lifeId,
    date: Date.now(),
  };

  const allScores = getAllHighscores();
  
  // Remove old entry for this minigame if exists
  const filtered = allScores.filter(s => s.minigame !== minigame);
  filtered.push(entry);

  try {
    localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to save highscore:', error);
  }

  return entry;
};

export const getBestScore = (minigame: MinigameType): HighscoreEntry | null => {
  const all = getAllHighscores();
  return all.find(s => s.minigame === minigame) || null;
};

export const getAllHighscores = (): HighscoreEntry[] => {
  try {
    const saved = localStorage.getItem(HIGHSCORE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load highscores:', error);
  }
  return [];
};

export const getMinigameLabel = (type: MinigameType): string => {
  const labels: Record<MinigameType, string> = {
    flappy: 'Flappy Bird',
    snake: 'Snake',
    memory: 'Memory',
    puzzle: 'Puzzle',
    blackjack: 'Blackjack',
    math: 'Mathe-Test',
    sequence: 'Merkspiel',
    spaceshooter: 'Space Shooter',
    bottles: 'Flaschensammeln',
    english: 'Englisch-Test',
    german: 'Deutsch-Test',
  };
  return labels[type];
};

export const clearHighscores = (): void => {
  try {
    localStorage.removeItem(HIGHSCORE_KEY);
  } catch (error) {
    console.error('Failed to clear highscores:', error);
  }
};
