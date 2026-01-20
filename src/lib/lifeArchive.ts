import { LifeRecord, Player, PlayerStats, TimelineEvent, EducationLevel } from '@/types/game';

const ARCHIVE_KEY = 'gitlife_life_archive';

export const saveLifeToArchive = (
  player: Player,
  timeline: TimelineEvent[],
  causeOfDeath: string
): LifeRecord => {
  const record: LifeRecord = {
    id: Math.random().toString(36).substring(2, 15),
    playerName: player.name,
    birthYear: player.birthYear,
    deathYear: player.birthYear + player.age,
    ageAtDeath: player.age,
    maxMoney: Math.max(player.money, ...timeline.map(e => {
      // Estimate max money from timeline
      let sum = 0;
      if (e.effects.moneyDelta && e.effects.moneyDelta > 0) {
        sum += e.effects.moneyDelta;
      }
      return sum;
    })),
    finalMoney: player.money,
    causeOfDeath,
    topEvents: timeline.slice(0, 5).map(e => ({ title: e.title, age: e.age })),
    finalStats: { ...player.stats },
    education: player.education,
    job: player.job?.title || null,
    createdAt: Date.now(),
  };

  const archive = getLifeArchive();
  archive.unshift(record);
  
  // Keep only last 50 lives
  const trimmed = archive.slice(0, 50);
  
  try {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save life archive:', error);
  }

  return record;
};

export const getLifeArchive = (): LifeRecord[] => {
  try {
    const saved = localStorage.getItem(ARCHIVE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load life archive:', error);
  }
  return [];
};

export const clearLifeArchive = (): void => {
  try {
    localStorage.removeItem(ARCHIVE_KEY);
  } catch (error) {
    console.error('Failed to clear life archive:', error);
  }
};

export const getEducationLabel = (level: EducationLevel): string => {
  const labels: Record<EducationLevel, string> = {
    none: 'Keine',
    kindergarten: 'Kindergarten',
    elementary: 'Grundschule',
    middleschool: 'Mittelstufe',
    highschool: 'Oberstufe',
    extended: 'Abitur',
    apprenticeship: 'Ausbildung',
    university: 'Universität',
  };
  return labels[level];
};
