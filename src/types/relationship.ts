// Relationship System Types

export interface Partner {
  id: string;
  name: string;
  age: number;
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

export interface RelationshipState {
  partner: Partner | null;
  children: Child[];
  exPartners: Partner[];
  totalMarriages: number;
  totalDivorces: number;
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
