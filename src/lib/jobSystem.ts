import { Job, EducationLevel, Player } from '@/types/game';

export interface JobOffer extends Job {
  description: string;
}

const allJobs: JobOffer[] = [
  // Entry level jobs (no education required)
  {
    id: 'cleaner',
    title: 'Reinigungskraft',
    salary: 1500,
    requiredIQ: 0,
    requiredEducation: 'none',
    description: 'Halte Gebäude sauber.',
  },
  {
    id: 'waiter',
    title: 'Kellner/in',
    salary: 1800,
    requiredIQ: 30,
    requiredEducation: 'none',
    description: 'Serviere Essen und Getränke.',
  },
  {
    id: 'cashier',
    title: 'Kassierer/in',
    salary: 1700,
    requiredIQ: 35,
    requiredEducation: 'highschool',
    description: 'Arbeite an der Kasse.',
  },
  
  // Apprenticeship jobs
  {
    id: 'mechanic',
    title: 'KFZ-Mechaniker/in',
    salary: 2500,
    requiredIQ: 45,
    requiredEducation: 'apprenticeship',
    description: 'Repariere Fahrzeuge.',
  },
  {
    id: 'electrician',
    title: 'Elektriker/in',
    salary: 2800,
    requiredIQ: 50,
    requiredEducation: 'apprenticeship',
    description: 'Installiere elektrische Systeme.',
  },
  {
    id: 'nurse',
    title: 'Krankenpfleger/in',
    salary: 2600,
    requiredIQ: 55,
    requiredEducation: 'apprenticeship',
    description: 'Pflege Patienten im Krankenhaus.',
  },
  {
    id: 'officeclerk',
    title: 'Bürokaufmann/frau',
    salary: 2400,
    requiredIQ: 50,
    requiredEducation: 'apprenticeship',
    description: 'Erledige Büroarbeiten.',
  },
  
  // Extended education jobs
  {
    id: 'teacher',
    title: 'Lehrer/in',
    salary: 3500,
    requiredIQ: 65,
    requiredEducation: 'extended',
    description: 'Unterrichte Schüler.',
  },
  {
    id: 'banker',
    title: 'Bankangestellte/r',
    salary: 3800,
    requiredIQ: 60,
    requiredEducation: 'extended',
    description: 'Arbeite in einer Bank.',
  },
  
  // University jobs
  {
    id: 'engineer',
    title: 'Ingenieur/in',
    salary: 5000,
    requiredIQ: 70,
    requiredEducation: 'university',
    description: 'Entwickle technische Lösungen.',
  },
  {
    id: 'doctor',
    title: 'Arzt/Ärztin',
    salary: 7000,
    requiredIQ: 80,
    requiredEducation: 'university',
    description: 'Heile Patienten.',
  },
  {
    id: 'lawyer',
    title: 'Anwalt/Anwältin',
    salary: 6500,
    requiredIQ: 75,
    requiredEducation: 'university',
    description: 'Vertrete Mandanten vor Gericht.',
  },
  {
    id: 'programmer',
    title: 'Softwareentwickler/in',
    salary: 5500,
    requiredIQ: 72,
    requiredEducation: 'university',
    description: 'Entwickle Software.',
  },
  {
    id: 'artist',
    title: 'Künstler/in',
    salary: 2000,
    requiredIQ: 40,
    requiredEducation: 'none',
    description: 'Erschaffe Kunst.',
  },
  {
    id: 'manager',
    title: 'Manager/in',
    salary: 8000,
    requiredIQ: 75,
    requiredEducation: 'university',
    description: 'Leite ein Team.',
  },
  {
    id: 'ceo',
    title: 'CEO',
    salary: 15000,
    requiredIQ: 85,
    requiredEducation: 'university',
    description: 'Führe ein Unternehmen.',
  },
];

const educationRank: Record<EducationLevel, number> = {
  none: 0,
  kindergarten: 1,
  elementary: 2,
  middleschool: 3,
  highschool: 4,
  extended: 5,
  apprenticeship: 4,
  university: 6,
};

export const getAvailableJobs = (player: Player): JobOffer[] => {
  const playerRank = educationRank[player.education];
  const criminalPenalty = player.criminalRecord.filter(r => r.caught).length > 0;
  
  return allJobs.filter(job => {
    // Check education requirement
    const requiredRank = educationRank[job.requiredEducation];
    if (playerRank < requiredRank) return false;
    
    // Check IQ requirement
    if (player.stats.iq < job.requiredIQ) return false;
    
    // Criminal record affects high-end jobs
    if (criminalPenalty && job.salary > 5000) {
      return Math.random() > 0.7; // 30% chance to still get offered
    }
    
    return true;
  });
};

export const getRandomJobOffers = (player: Player, count: number = 3): JobOffer[] => {
  const available = getAvailableJobs(player);
  const shuffled = available.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const getNewspaperJobSalary = (): number => {
  return 50; // €50 per year for newspaper delivery
};

export const canGetPromotion = (player: Player): boolean => {
  if (!player.job) return false;
  
  // Chance based on IQ and luck
  const baseChance = 0.1;
  const iqBonus = (player.stats.iq - 50) / 100 * 0.1;
  const luckBonus = (player.stats.luck - 50) / 100 * 0.1;
  
  return Math.random() < (baseChance + iqBonus + luckBonus);
};

export const getPromotionSalaryIncrease = (currentSalary: number): number => {
  return Math.floor(currentSalary * (0.1 + Math.random() * 0.2)); // 10-30% raise
};
