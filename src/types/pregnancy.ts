// Pregnancy and Birth Control System Types

export interface PregnancyState {
  isPregnant: boolean;
  pregnancyMonth: number; // 0-9
  expectedBabies: number; // 1 or 2 (twins)
  babyGenders: ('male' | 'female')[];
  partnerOnBirthControl: boolean;
  playerOnBirthControl: boolean;
}

export interface PendingBirth {
  babies: {
    gender: 'male' | 'female';
    suggestedName: string;
  }[];
}

// Baby name suggestions
export const boyNames = [
  'Maximilian', 'Alexander', 'Sebastian', 'Benjamin', 'Fabian', 
  'Tobias', 'Simon', 'Daniel', 'Michael', 'Christoph',
  'Leon', 'Paul', 'Felix', 'Lukas', 'Tim', 
  'Jonas', 'Ben', 'Elias', 'Noah', 'Finn'
];

export const girlNames = [
  'Sophia', 'Isabella', 'Olivia', 'Victoria', 'Valentina', 
  'Josephine', 'Katharina', 'Elisabeth', 'Theresa', 'Magdalena',
  'Anna', 'Laura', 'Lisa', 'Marie', 'Lena', 
  'Sophie', 'Julia', 'Sarah', 'Emma', 'Mia'
];

// Create initial pregnancy state
export const createPregnancyState = (): PregnancyState => ({
  isPregnant: false,
  pregnancyMonth: 0,
  expectedBabies: 0,
  babyGenders: [],
  partnerOnBirthControl: false,
  playerOnBirthControl: false
});

// Generate baby genders and check for twins
export const generatePregnancy = (): { count: number; genders: ('male' | 'female')[] } => {
  // 25% chance of twins
  const isTwins = Math.random() < 0.25;
  const count = isTwins ? 2 : 1;
  
  const genders: ('male' | 'female')[] = [];
  for (let i = 0; i < count; i++) {
    // 50/50 chance for each baby
    genders.push(Math.random() < 0.5 ? 'male' : 'female');
  }
  
  return { count, genders };
};

// Get suggested names for babies
export const getSuggestedNames = (genders: ('male' | 'female')[]): string[] => {
  return genders.map(gender => {
    const names = gender === 'male' ? boyNames : girlNames;
    return names[Math.floor(Math.random() * names.length)];
  });
};

// Check if pregnancy can occur
export const canGetPregnant = (
  playerAge: number,
  playerGender: 'male' | 'female',
  partnerExists: boolean,
  isMarried: boolean,
  playerOnBirthControl: boolean,
  partnerOnBirthControl: boolean,
  isAlreadyPregnant: boolean
): boolean => {
  // Must have partner and be married
  if (!partnerExists || !isMarried) return false;
  
  // Age restrictions (20-45 for women, no upper limit for men but need female partner)
  if (playerGender === 'female') {
    if (playerAge < 20 || playerAge > 45) return false;
    if (isAlreadyPregnant) return false;
    if (playerOnBirthControl) return false;
  } else {
    // Male player - partner must not be on birth control
    if (partnerOnBirthControl) return false;
    // Assume partner age is similar to player
    if (playerAge < 20 || playerAge > 50) return false;
  }
  
  return true;
};
