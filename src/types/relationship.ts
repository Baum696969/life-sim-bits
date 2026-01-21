// Relationship System Types

export interface Partner {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  looks: number;
  personality: 'romantic' | 'adventurous' | 'calm' | 'ambitious' | 'funny';
  compatibility: number; // 0-100
  relationshipStatus: RelationshipStatus;
  yearsTogethere: number;
  meetingStory: string;
}

export type RelationshipStatus = 
  | 'dating'
  | 'engaged'
  | 'married'
  | 'divorced'
  | 'widowed';

export interface Child {
  id: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  birthYear: number;
  relationship: number; // 0-100 relationship quality with player
}

// Family Members
export interface FamilyMember {
  id: string;
  name: string;
  role: 'mother' | 'father' | 'sibling';
  gender: 'male' | 'female';
  age: number;
  relationship: number; // 0-100 relationship quality
  isAlive: boolean;
}

export interface FamilyState {
  mother: FamilyMember;
  father: FamilyMember;
  siblings: FamilyMember[];
}

export interface FamilyActivity {
  id: string;
  name: string;
  emoji: string;
  description: string;
  minAge: number;
  maxAge: number;
  cost: number;
  effects: {
    relationshipBonus: number;
    healthDelta?: number;
    happinessDelta?: number;
  };
}

export interface RelationshipState {
  partner: Partner | null;
  children: Child[];
  exPartners: Partner[];
  totalMarriages: number;
  totalDivorces: number;
  family: FamilyState | null;
}

// Partner generation data
export const maleNames = [
  'Max', 'Leon', 'Paul', 'Felix', 'Lukas', 'Tim', 'Jonas', 'Ben', 'Elias', 'Noah',
  'Finn', 'David', 'Niklas', 'Tom', 'Moritz', 'Julian', 'Philipp', 'Luca', 'Jan', 'Erik'
];

export const femaleNames = [
  'Anna', 'Laura', 'Lisa', 'Marie', 'Lena', 'Sophie', 'Julia', 'Sarah', 'Emma', 'Mia',
  'Hannah', 'Lea', 'Emily', 'Amelie', 'Clara', 'Nina', 'Johanna', 'Charlotte', 'Elena', 'Maja'
];

export const parentNames = {
  mother: ['Maria', 'Sabine', 'Petra', 'Claudia', 'Monika', 'Susanne', 'Andrea', 'Martina', 'Birgit', 'Karin'],
  father: ['Thomas', 'Michael', 'Andreas', 'Stefan', 'Christian', 'Peter', 'Wolfgang', 'Markus', 'Jürgen', 'Klaus']
};

export const siblingNames = {
  male: ['Lukas', 'Maximilian', 'Leon', 'Felix', 'Jonas', 'Tim', 'Paul', 'Niklas', 'Finn', 'Ben'],
  female: ['Sophie', 'Marie', 'Anna', 'Lena', 'Emma', 'Mia', 'Hannah', 'Laura', 'Emily', 'Lea']
};

export const meetingStories = [
  'auf einer Party kennengelernt',
  'durch gemeinsame Freunde vorgestellt',
  'im Fitnessstudio getroffen',
  'über eine Dating-App gefunden',
  'im Café angesprochen',
  'bei der Arbeit kennengelernt',
  'im Park getroffen',
  'auf einem Konzert kennengelernt',
  'in der Bibliothek getroffen',
  'beim Sport kennengelernt'
];

export const personalityDescriptions: Record<Partner['personality'], string> = {
  romantic: 'romantisch und gefühlvoll',
  adventurous: 'abenteuerlustig und spontan',
  calm: 'ruhig und besonnen',
  ambitious: 'ehrgeizig und zielstrebig',
  funny: 'witzig und humorvoll'
};

export const childNames = {
  male: ['Maximilian', 'Alexander', 'Sebastian', 'Benjamin', 'Fabian', 'Tobias', 'Simon', 'Daniel', 'Michael', 'Christoph'],
  female: ['Sophia', 'Isabella', 'Olivia', 'Victoria', 'Valentina', 'Josephine', 'Katharina', 'Elisabeth', 'Theresa', 'Magdalena']
};

// Family Activities
export const familyActivities: FamilyActivity[] = [
  {
    id: 'playground',
    name: 'Spielplatz',
    emoji: '🛝',
    description: 'Mit der Familie auf den Spielplatz gehen',
    minAge: 0,
    maxAge: 12,
    cost: 0,
    effects: { relationshipBonus: 5, healthDelta: 2 }
  },
  {
    id: 'zoo',
    name: 'Zoo',
    emoji: '🦁',
    description: 'Einen Ausflug in den Zoo machen',
    minAge: 2,
    maxAge: 99,
    cost: 25,
    effects: { relationshipBonus: 8 }
  },
  {
    id: 'cinema',
    name: 'Kino',
    emoji: '🎬',
    description: 'Gemeinsam einen Film im Kino schauen',
    minAge: 4,
    maxAge: 99,
    cost: 15,
    effects: { relationshipBonus: 6 }
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    emoji: '🍽️',
    description: 'Zusammen essen gehen',
    minAge: 3,
    maxAge: 99,
    cost: 40,
    effects: { relationshipBonus: 7 }
  },
  {
    id: 'park',
    name: 'Picknick',
    emoji: '🧺',
    description: 'Ein Picknick im Park machen',
    minAge: 0,
    maxAge: 99,
    cost: 10,
    effects: { relationshipBonus: 5, healthDelta: 1 }
  },
  {
    id: 'themepark',
    name: 'Freizeitpark',
    emoji: '🎢',
    description: 'In den Freizeitpark fahren',
    minAge: 6,
    maxAge: 60,
    cost: 60,
    effects: { relationshipBonus: 12 }
  },
  {
    id: 'vacation',
    name: 'Urlaub',
    emoji: '✈️',
    description: 'Einen Familienurlaub machen',
    minAge: 0,
    maxAge: 99,
    cost: 500,
    effects: { relationshipBonus: 20, healthDelta: 5 }
  },
  {
    id: 'boardgames',
    name: 'Spieleabend',
    emoji: '🎲',
    description: 'Brettspiele zusammen spielen',
    minAge: 4,
    maxAge: 99,
    cost: 0,
    effects: { relationshipBonus: 6 }
  },
  {
    id: 'swimming',
    name: 'Schwimmbad',
    emoji: '🏊',
    description: 'Ins Schwimmbad gehen',
    minAge: 3,
    maxAge: 70,
    cost: 12,
    effects: { relationshipBonus: 7, healthDelta: 3 }
  },
  {
    id: 'birthday',
    name: 'Geburtstag feiern',
    emoji: '🎂',
    description: 'Eine Geburtstagsfeier organisieren',
    minAge: 0,
    maxAge: 99,
    cost: 50,
    effects: { relationshipBonus: 10 }
  }
];
