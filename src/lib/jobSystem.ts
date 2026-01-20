import { Job, EducationLevel, Player, PlayerStats } from '@/types/game';

export interface JobOffer extends Job {
  description: string;
  requirements: JobRequirements;
}

export interface JobRequirements {
  minIQ: number;
  minFitness: number;
  minHealth: number;
  minLooks: number;
  minEducation: EducationLevel;
  noCriminalRecord?: boolean; // If true, cannot have been in prison
  minAge?: number;
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
    requirements: { minIQ: 0, minFitness: 20, minHealth: 30, minLooks: 0, minEducation: 'none' },
  },
  {
    id: 'waiter',
    title: 'Kellner/in',
    salary: 1800,
    requiredIQ: 30,
    requiredEducation: 'none',
    description: 'Serviere Essen und Getränke.',
    requirements: { minIQ: 30, minFitness: 30, minHealth: 40, minLooks: 30, minEducation: 'none' },
  },
  {
    id: 'cashier',
    title: 'Kassierer/in',
    salary: 1700,
    requiredIQ: 35,
    requiredEducation: 'highschool',
    description: 'Arbeite an der Kasse.',
    requirements: { minIQ: 35, minFitness: 20, minHealth: 40, minLooks: 20, minEducation: 'highschool' },
  },
  
  // Apprenticeship jobs
  {
    id: 'mechanic',
    title: 'KFZ-Mechaniker/in',
    salary: 2500,
    requiredIQ: 45,
    requiredEducation: 'apprenticeship',
    description: 'Repariere Fahrzeuge.',
    requirements: { minIQ: 45, minFitness: 50, minHealth: 50, minLooks: 0, minEducation: 'apprenticeship' },
  },
  {
    id: 'electrician',
    title: 'Elektriker/in',
    salary: 2800,
    requiredIQ: 50,
    requiredEducation: 'apprenticeship',
    description: 'Installiere elektrische Systeme.',
    requirements: { minIQ: 50, minFitness: 40, minHealth: 50, minLooks: 0, minEducation: 'apprenticeship' },
  },
  {
    id: 'nurse',
    title: 'Krankenpfleger/in',
    salary: 2600,
    requiredIQ: 55,
    requiredEducation: 'apprenticeship',
    description: 'Pflege Patienten im Krankenhaus.',
    requirements: { minIQ: 55, minFitness: 40, minHealth: 60, minLooks: 0, minEducation: 'apprenticeship' },
  },
  {
    id: 'officeclerk',
    title: 'Bürokaufmann/frau',
    salary: 2400,
    requiredIQ: 50,
    requiredEducation: 'apprenticeship',
    description: 'Erledige Büroarbeiten.',
    requirements: { minIQ: 50, minFitness: 0, minHealth: 40, minLooks: 30, minEducation: 'apprenticeship' },
  },
  
  // Extended education jobs
  {
    id: 'teacher',
    title: 'Lehrer/in',
    salary: 3500,
    requiredIQ: 65,
    requiredEducation: 'extended',
    description: 'Unterrichte Schüler.',
    requirements: { minIQ: 65, minFitness: 20, minHealth: 60, minLooks: 0, minEducation: 'extended', noCriminalRecord: true },
  },
  {
    id: 'banker',
    title: 'Bankangestellte/r',
    salary: 3800,
    requiredIQ: 60,
    requiredEducation: 'extended',
    description: 'Arbeite in einer Bank.',
    requirements: { minIQ: 60, minFitness: 0, minHealth: 40, minLooks: 40, minEducation: 'extended', noCriminalRecord: true },
  },
  
  // Special jobs with specific requirements
  {
    id: 'police',
    title: 'Polizist/in',
    salary: 3200,
    requiredIQ: 55,
    requiredEducation: 'highschool',
    description: 'Schütze die Bürger und bekämpfe Verbrechen.',
    requirements: { minIQ: 55, minFitness: 70, minHealth: 70, minLooks: 0, minEducation: 'highschool', noCriminalRecord: true },
  },
  {
    id: 'model',
    title: 'Model',
    salary: 4500,
    requiredIQ: 30,
    requiredEducation: 'none',
    description: 'Posiere für Fotos und laufe auf dem Laufsteg.',
    requirements: { minIQ: 30, minFitness: 60, minHealth: 60, minLooks: 80, minEducation: 'none', minAge: 18 },
  },
  {
    id: 'firefighter',
    title: 'Feuerwehrmann/frau',
    salary: 3000,
    requiredIQ: 45,
    requiredEducation: 'highschool',
    description: 'Lösche Brände und rette Leben.',
    requirements: { minIQ: 45, minFitness: 80, minHealth: 80, minLooks: 0, minEducation: 'highschool' },
  },
  
  // University jobs
  {
    id: 'engineer',
    title: 'Ingenieur/in',
    salary: 5000,
    requiredIQ: 70,
    requiredEducation: 'university',
    description: 'Entwickle technische Lösungen.',
    requirements: { minIQ: 70, minFitness: 0, minHealth: 40, minLooks: 0, minEducation: 'university' },
  },
  {
    id: 'doctor',
    title: 'Arzt/Ärztin',
    salary: 7000,
    requiredIQ: 80,
    requiredEducation: 'university',
    description: 'Heile Patienten.',
    requirements: { minIQ: 80, minFitness: 30, minHealth: 60, minLooks: 0, minEducation: 'university', noCriminalRecord: true },
  },
  {
    id: 'lawyer',
    title: 'Anwalt/Anwältin',
    salary: 6500,
    requiredIQ: 75,
    requiredEducation: 'university',
    description: 'Vertrete Mandanten vor Gericht.',
    requirements: { minIQ: 75, minFitness: 0, minHealth: 40, minLooks: 40, minEducation: 'university' },
  },
  {
    id: 'programmer',
    title: 'Softwareentwickler/in',
    salary: 5500,
    requiredIQ: 72,
    requiredEducation: 'university',
    description: 'Entwickle Software.',
    requirements: { minIQ: 72, minFitness: 0, minHealth: 40, minLooks: 0, minEducation: 'university' },
  },
  {
    id: 'artist',
    title: 'Künstler/in',
    salary: 2000,
    requiredIQ: 40,
    requiredEducation: 'none',
    description: 'Erschaffe Kunst.',
    requirements: { minIQ: 40, minFitness: 0, minHealth: 30, minLooks: 30, minEducation: 'none' },
  },
  {
    id: 'manager',
    title: 'Manager/in',
    salary: 8000,
    requiredIQ: 75,
    requiredEducation: 'university',
    description: 'Leite ein Team.',
    requirements: { minIQ: 75, minFitness: 30, minHealth: 50, minLooks: 50, minEducation: 'university' },
  },
  {
    id: 'ceo',
    title: 'CEO',
    salary: 15000,
    requiredIQ: 85,
    requiredEducation: 'university',
    description: 'Führe ein Unternehmen.',
    requirements: { minIQ: 85, minFitness: 30, minHealth: 60, minLooks: 50, minEducation: 'university', minAge: 30 },
  },
];

// Side jobs for students
export interface SideJob {
  id: string;
  title: string;
  salary: number;
  minAge: number;
  description: string;
}

export const sideJobs: SideJob[] = [
  { id: 'newspaper', title: 'Zeitung austragen', salary: 50, minAge: 13, description: 'Liefere jeden Tag die Zeitung.' },
  { id: 'babysitter', title: 'Babysitter', salary: 80, minAge: 14, description: 'Pass auf Kinder auf.' },
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

export interface JobEligibility {
  job: JobOffer;
  eligible: boolean;
  missingRequirements: string[];
  blockedByPrison: boolean;
}

export const checkJobEligibility = (player: Player, job: JobOffer): JobEligibility => {
  const missing: string[] = [];
  const hasBeenInPrison = player.criminalRecord.some(r => r.caught);
  
  // Check education
  const playerRank = educationRank[player.education];
  const requiredRank = educationRank[job.requirements.minEducation];
  if (playerRank < requiredRank) {
    missing.push(`Bildung: ${job.requirements.minEducation}`);
  }
  
  // Check stats
  if (player.stats.iq < job.requirements.minIQ) {
    missing.push(`IQ +${job.requirements.minIQ - player.stats.iq} nötig`);
  }
  if (player.stats.fitness < job.requirements.minFitness) {
    missing.push(`Fitness +${job.requirements.minFitness - player.stats.fitness} nötig`);
  }
  if (player.stats.health < job.requirements.minHealth) {
    missing.push(`Gesundheit +${job.requirements.minHealth - player.stats.health} nötig`);
  }
  if (player.stats.looks < job.requirements.minLooks) {
    missing.push(`Aussehen +${job.requirements.minLooks - player.stats.looks} nötig`);
  }
  
  // Check age
  if (job.requirements.minAge && player.age < job.requirements.minAge) {
    missing.push(`Mindestalter: ${job.requirements.minAge}`);
  }
  
  // Check criminal record
  const blockedByPrison = job.requirements.noCriminalRecord === true && hasBeenInPrison;
  if (blockedByPrison) {
    missing.push('Vorstrafe verhindert diesen Job');
  }
  
  return {
    job,
    eligible: missing.length === 0,
    missingRequirements: missing,
    blockedByPrison,
  };
};

export const getAvailableJobs = (player: Player): JobEligibility[] => {
  return allJobs.map(job => checkJobEligibility(player, job));
};

export const getEligibleJobs = (player: Player): JobOffer[] => {
  return allJobs.filter(job => checkJobEligibility(player, job).eligible);
};

export const getRandomJobOffers = (player: Player, count: number = 3): JobOffer[] => {
  const eligible = getEligibleJobs(player);
  const shuffled = eligible.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const getNewspaperJobSalary = (): number => {
  return 50; // €50 per year for newspaper delivery
};

export const getBabysitterJobSalary = (): number => {
  return 80; // €80 per year for babysitting
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

export const getAllJobs = (): JobOffer[] => allJobs;
