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

export type FriendshipLevel = 
  | 'acquaintance'  // Bekannter (0-25)
  | 'casual'        // Kumpel (26-50)
  | 'good'          // Guter Freund (51-75)
  | 'best'          // Bester Freund (76-100);

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

export type FamilyType =
  | 'classic'        // mother + father
  | 'singleMother'   // mother only
  | 'singleFather'   // father only
  | 'orphan'         // neither, raised in foster care/grandparents
  | 'adopted'        // adoptive parents (still classic structure but tagged)
  | 'sameSexMothers' // two mothers
  | 'sameSexFathers'; // two fathers

export interface FamilyState {
  mother: FamilyMember | null;
  father: FamilyMember | null;
  // Optional second parent for same-sex households
  secondParent?: FamilyMember | null;
  siblings: FamilyMember[];
  familyType: FamilyType;
}

export interface FamilyActivity {
  id: string;
  name: string;
  emoji: string;
  description: string;
  minAge: number;
  maxAge: number;
  cost: number;
  maxPerYear: number; // Maximum times this activity can be done per year
  excuses: string[]; // Random excuses when limit is reached
  effects: {
    relationshipBonus: number;
    healthDelta?: number;
    happinessDelta?: number;
  };
}

// Friend type for friend activities
export interface Friend {
  id: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  friendship: number; // 0-100
  personality: 'gamer' | 'sporty' | 'creative' | 'chill' | 'adventurous';
  level: FriendshipLevel; // New: friendship tier
  metAt: string; // Where/how you met
  yearsKnown: number;
  hadFight: boolean; // Currently in a fight?
  fightCooldown: number; // Years until fight can be resolved
}

export interface FriendActivity {
  id: string;
  name: string;
  emoji: string;
  description: string;
  minAge: number;
  maxAge: number;
  cost: number;
  maxPerYear: number;
  effects: {
    friendshipBonus: number;
    healthDelta?: number;
    fitnessDelta?: number;
  };
}

// Activity usage tracking for year limits
export interface YearlyActivityUsage {
  [activityId: string]: number;
}

export interface RelationshipState {
  partner: Partner | null;
  children: Child[];
  exPartners: Partner[];
  totalMarriages: number;
  totalDivorces: number;
  family: FamilyState | null;
  friends: Friend[];
  yearlyActivityUsage: YearlyActivityUsage;
  yearlyFriendActivityUsage: YearlyActivityUsage;
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

// Excuses for when activities are exhausted
const playgroundExcuses = [
  'Es regnet zu stark draußen.',
  'Der Spielplatz ist heute wegen Wartung geschlossen.',
  'Wir waren gerade erst da!',
];

const zooExcuses = [
  'Der Zoo ist heute überfüllt.',
  'Die Tiere schlafen gerade.',
  'Wir waren erst letzte Woche im Zoo!',
];

const cinemaExcuses = [
  'Es gibt gerade keinen guten Film.',
  'Alle Vorstellungen sind ausverkauft.',
  'Ich habe Kopfschmerzen.',
];

const restaurantExcuses = [
  'Ich habe keinen Hunger.',
  'Das Restaurant ist ausgebucht.',
  'Lass uns lieber zu Hause essen.',
];

const genericExcuses = [
  'Ich bin zu müde.',
  'Vielleicht nächstes Mal.',
  'Heute passt es nicht.',
  'Ich muss noch was anderes erledigen.',
];

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
    maxPerYear: 1,
    excuses: playgroundExcuses,
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
    maxPerYear: 2,
    excuses: zooExcuses,
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
    maxPerYear: 3,
    excuses: cinemaExcuses,
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
    maxPerYear: 2,
    excuses: restaurantExcuses,
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
    maxPerYear: 3,
    excuses: genericExcuses,
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
    maxPerYear: 1,
    excuses: ['Der Freizeitpark ist heute geschlossen.', 'Einmal im Jahr reicht!', 'Die Schlangen sind zu lang.'],
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
    maxPerYear: 1,
    excuses: ['Wir können uns nur einen Urlaub pro Jahr leisten.', 'Die Urlaubstage sind aufgebraucht.'],
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
    maxPerYear: 5,
    excuses: genericExcuses,
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
    maxPerYear: 3,
    excuses: ['Das Schwimmbad ist überfüllt.', 'Ich habe meine Badesachen vergessen.', 'Das Wasser ist zu kalt.'],
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
    maxPerYear: 1,
    excuses: ['Jeder hat nur einmal im Jahr Geburtstag!'],
    effects: { relationshipBonus: 10 }
  }
];

// Friend Activities
export const friendActivities: FriendActivity[] = [
  {
    id: 'gaming',
    name: 'Gaming Session',
    emoji: '🎮',
    description: 'Zusammen Videospiele spielen',
    minAge: 8,
    maxAge: 99,
    cost: 0,
    maxPerYear: 10,
    effects: { friendshipBonus: 5 }
  },
  {
    id: 'sport',
    name: 'Sport machen',
    emoji: '⚽',
    description: 'Gemeinsam Sport treiben',
    minAge: 6,
    maxAge: 70,
    cost: 0,
    maxPerYear: 5,
    effects: { friendshipBonus: 6, fitnessDelta: 3, healthDelta: 2 }
  },
  {
    id: 'hangout',
    name: 'Abhängen',
    emoji: '🛋️',
    description: 'Einfach zusammen chillen',
    minAge: 10,
    maxAge: 99,
    cost: 0,
    maxPerYear: 10,
    effects: { friendshipBonus: 4 }
  },
  {
    id: 'party',
    name: 'Party',
    emoji: '🎉',
    description: 'Auf eine Party gehen',
    minAge: 14,
    maxAge: 40,
    cost: 20,
    maxPerYear: 3,
    effects: { friendshipBonus: 10 }
  },
  {
    id: 'concert',
    name: 'Konzert',
    emoji: '🎵',
    description: 'Zusammen ein Konzert besuchen',
    minAge: 12,
    maxAge: 70,
    cost: 50,
    maxPerYear: 2,
    effects: { friendshipBonus: 12 }
  },
  {
    id: 'shopping',
    name: 'Shoppen gehen',
    emoji: '🛍️',
    description: 'Einen Shopping-Trip machen',
    minAge: 12,
    maxAge: 99,
    cost: 30,
    maxPerYear: 3,
    effects: { friendshipBonus: 7 }
  },
  {
    id: 'movie',
    name: 'Kino',
    emoji: '🍿',
    description: 'Zusammen ins Kino gehen',
    minAge: 8,
    maxAge: 99,
    cost: 15,
    maxPerYear: 4,
    effects: { friendshipBonus: 6 }
  },
  {
    id: 'trip',
    name: 'Ausflug',
    emoji: '🚗',
    description: 'Einen Tagesausflug machen',
    minAge: 16,
    maxAge: 99,
    cost: 40,
    maxPerYear: 2,
    effects: { friendshipBonus: 15, healthDelta: 2 }
  }
];

// Friend names for generation
export const friendNames = {
  male: ['Max', 'Leon', 'Paul', 'Felix', 'Tim', 'Jonas', 'Ben', 'Niklas', 'Tom', 'Moritz', 'David', 'Erik', 'Kevin', 'Marcel', 'Dennis'],
  female: ['Anna', 'Lisa', 'Laura', 'Marie', 'Sophie', 'Julia', 'Sarah', 'Emma', 'Mia', 'Hannah', 'Lea', 'Emily', 'Nina', 'Clara', 'Maja']
};

export const friendPersonalities: Friend['personality'][] = ['gamer', 'sporty', 'creative', 'chill', 'adventurous'];

export const personalityLabels: Record<Friend['personality'], string> = {
  gamer: 'Gamer',
  sporty: 'Sportlich',
  creative: 'Kreativ',
  chill: 'Entspannt',
  adventurous: 'Abenteuerlustig'
};
