import { 
  Partner, 
  Child, 
  RelationshipState, 
  FamilyState,
  FamilyMember,
  FamilyActivity,
  Friend,
  YearlyActivityUsage,
  maleNames, 
  femaleNames, 
  meetingStories,
  childNames,
  parentNames,
  siblingNames,
  familyActivities,
  friendNames,
  friendPersonalities
} from '@/types/relationship';

// Generate a random partner
export const generatePartner = (playerAge: number, playerLooks: number): Partner => {
  const isMale = Math.random() > 0.5;
  const names = isMale ? maleNames : femaleNames;
  const name = names[Math.floor(Math.random() * names.length)];
  
  // Partner age within reasonable range
  const ageMin = Math.max(18, playerAge - 8);
  const ageMax = playerAge + 8;
  const age = Math.floor(Math.random() * (ageMax - ageMin + 1)) + ageMin;
  
  // Looks based on player looks with some variance
  const looks = Math.min(100, Math.max(20, playerLooks + (Math.random() * 40 - 20)));
  
  const personalities: Partner['personality'][] = ['romantic', 'adventurous', 'calm', 'ambitious', 'funny'];
  const personality = personalities[Math.floor(Math.random() * personalities.length)];
  
  // Compatibility based on looks match and random factor
  const looksMatch = 100 - Math.abs(looks - playerLooks);
  const compatibility = Math.floor((looksMatch * 0.5) + (Math.random() * 50));
  
  const meetingStory = meetingStories[Math.floor(Math.random() * meetingStories.length)];
  
  return {
    id: `partner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    age,
    gender: isMale ? 'male' : 'female',
    looks: Math.floor(looks),
    personality,
    compatibility: Math.min(100, Math.max(10, compatibility)),
    relationshipStatus: 'dating',
    yearsTogethere: 0,
    meetingStory
  };
};

// Generate multiple partner options
export const generatePartnerOptions = (playerAge: number, playerLooks: number, count: number = 3): Partner[] => {
  const partners: Partner[] = [];
  for (let i = 0; i < count; i++) {
    partners.push(generatePartner(playerAge, playerLooks));
  }
  return partners.sort((a, b) => b.compatibility - a.compatibility);
};

// Calculate marriage success chance
export const calculateMarriageSuccess = (partner: Partner, playerLuck: number): number => {
  const baseChance = partner.compatibility * 0.6;
  const luckBonus = playerLuck * 0.2;
  const yearsBonus = Math.min(20, partner.yearsTogethere * 4);
  return Math.min(95, baseChance + luckBonus + yearsBonus);
};

// Calculate divorce chance
export const calculateDivorceChance = (partner: Partner, playerMoney: number): number => {
  const baseChance = 5;
  const compatibilityPenalty = (100 - partner.compatibility) * 0.1;
  const moneyPenalty = playerMoney < 0 ? 10 : 0;
  const yearBonus = Math.min(15, partner.yearsTogethere * 3);
  return Math.max(1, baseChance + compatibilityPenalty + moneyPenalty - yearBonus);
};

// Generate a child
export const generateChild = (playerBirthYear: number, currentYear: number): Child => {
  const gender: 'male' | 'female' = Math.random() > 0.5 ? 'male' : 'female';
  const names = childNames[gender];
  const name = names[Math.floor(Math.random() * names.length)];
  
  return {
    id: `child-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    gender,
    age: 0,
    birthYear: currentYear,
    relationship: 80 + Math.floor(Math.random() * 20)
  };
};

// Calculate chance of having a child
export const calculateChildChance = (playerAge: number, partnerAge: number, existingChildren: number): number => {
  // Base chance
  let chance = 30;
  
  // Age factor (optimal between 25-35)
  if (playerAge < 25) chance -= (25 - playerAge) * 2;
  if (playerAge > 35) chance -= (playerAge - 35) * 3;
  
  // Existing children reduce chance
  chance -= existingChildren * 10;
  
  return Math.max(5, Math.min(50, chance));
};

// Age all children by one year
export const ageChildren = (children: Child[]): Child[] => {
  return children.map(child => ({
    ...child,
    age: child.age + 1
  }));
};

// Generate initial family with varied structures (parents and possibly siblings)
export const generateFamily = (playerBirthYear: number): FamilyState => {
  // Pick a family type with weights
  const roll = Math.random();
  let familyType: FamilyState['familyType'] = 'classic';
  if (roll < 0.62) familyType = 'classic';
  else if (roll < 0.74) familyType = 'singleMother';
  else if (roll < 0.80) familyType = 'singleFather';
  else if (roll < 0.86) familyType = 'adopted';
  else if (roll < 0.92) familyType = 'sameSexMothers';
  else if (roll < 0.96) familyType = 'sameSexFathers';
  else familyType = 'orphan';

  const buildMember = (role: 'mother' | 'father', gender: 'male' | 'female'): FamilyMember => {
    const namePool = gender === 'female' ? parentNames.mother : parentNames.father;
    const name = namePool[Math.floor(Math.random() * namePool.length)];
    const age = 20 + Math.floor(Math.random() * 18);
    return {
      id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      role,
      gender,
      age,
      relationship: 65 + Math.floor(Math.random() * 35),
      isAlive: true,
    };
  };

  let mother: FamilyMember | null = null;
  let father: FamilyMember | null = null;
  let secondParent: FamilyMember | null = null;

  switch (familyType) {
    case 'classic':
    case 'adopted':
      mother = buildMember('mother', 'female');
      father = buildMember('father', 'male');
      break;
    case 'singleMother':
      mother = buildMember('mother', 'female');
      break;
    case 'singleFather':
      father = buildMember('father', 'male');
      break;
    case 'sameSexMothers':
      mother = buildMember('mother', 'female');
      secondParent = buildMember('mother', 'female');
      break;
    case 'sameSexFathers':
      father = buildMember('father', 'male');
      secondParent = buildMember('father', 'male');
      break;
    case 'orphan':
      // No parents
      break;
  }

  // Sibling generation: variable count 0-4, occasional twin
  const siblings: FamilyMember[] = [];
  const siblingRoll = Math.random();
  let siblingCount = 0;
  if (siblingRoll < 0.30) siblingCount = 0;
  else if (siblingRoll < 0.60) siblingCount = 1;
  else if (siblingRoll < 0.85) siblingCount = 2;
  else if (siblingRoll < 0.96) siblingCount = 3;
  else siblingCount = 4;

  for (let i = 0; i < siblingCount; i++) {
    const gender: 'male' | 'female' = Math.random() > 0.5 ? 'male' : 'female';
    const names = siblingNames[gender];
    const name = names[Math.floor(Math.random() * names.length)];
    // Twin chance for first sibling: 8%
    const isTwin = i === 0 && Math.random() < 0.08;
    const ageDiff = isTwin ? 0 : Math.floor(Math.random() * 16) - 5;

    siblings.push({
      id: `sibling-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
      name,
      role: 'sibling',
      gender,
      age: Math.max(0, ageDiff),
      relationship: 55 + Math.floor(Math.random() * 45),
      isAlive: true,
    });
  }

  return { mother, father, secondParent, siblings, familyType };
};

// Age family members
export const ageFamily = (family: FamilyState): FamilyState => {
  const ageParent = (p: FamilyMember | null | undefined, deathStartAge: number, factor: number): FamilyMember | null => {
    if (!p) return p ?? null;
    const aged = { ...p, age: p.age + 1 };
    if (aged.isAlive && aged.age > deathStartAge) {
      const deathChance = (aged.age - deathStartAge) * factor;
      if (Math.random() < deathChance) aged.isAlive = false;
    }
    return aged;
  };

  const agedSiblings = family.siblings.map(sibling => ({
    ...sibling,
    age: sibling.age + 1,
  }));

  return {
    ...family,
    mother: ageParent(family.mother, 60, 0.02),
    father: ageParent(family.father, 58, 0.025),
    secondParent: ageParent(family.secondParent ?? null, 60, 0.022),
    siblings: agedSiblings,
  };
};

// Add a new sibling (when parents have another child)
export const addSibling = (family: FamilyState): FamilyState => {
  const gender: 'male' | 'female' = Math.random() > 0.5 ? 'male' : 'female';
  const names = siblingNames[gender];
  const name = names[Math.floor(Math.random() * names.length)];

  const newSibling: FamilyMember = {
    id: `sibling-${Date.now()}`,
    name,
    role: 'sibling',
    gender,
    age: 0,
    relationship: 50 + Math.floor(Math.random() * 30),
    isAlive: true,
  };

  return {
    ...family,
    siblings: [...family.siblings, newSibling],
  };
};

// Get available activities for age
export const getAvailableActivities = (playerAge: number): FamilyActivity[] => {
  return familyActivities.filter(
    activity => playerAge >= activity.minAge && playerAge <= activity.maxAge
  );
};

// Do an activity with family member
export const doFamilyActivity = (
  family: FamilyState,
  memberId: string,
  activity: FamilyActivity
): FamilyState => {
  const updateRelationship = (member: FamilyMember | null): FamilyMember | null => {
    if (!member) return member;
    if (member.id === memberId) {
      return {
        ...member,
        relationship: Math.min(100, member.relationship + activity.effects.relationshipBonus),
      };
    }
    return member;
  };

  return {
    ...family,
    mother: updateRelationship(family.mother),
    father: updateRelationship(family.father),
    secondParent: updateRelationship(family.secondParent ?? null),
    siblings: family.siblings.map(m => updateRelationship(m) as FamilyMember),
  };
};

// Create initial relationship state
export const createRelationshipState = (playerBirthYear?: number): RelationshipState => ({
  partner: null,
  children: [],
  exPartners: [],
  totalMarriages: 0,
  totalDivorces: 0,
  family: playerBirthYear ? generateFamily(playerBirthYear) : null,
  friends: [],
  yearlyActivityUsage: {},
  yearlyFriendActivityUsage: {}
});

// Generate initial friends based on age
export const generateInitialFriends = (playerAge: number, playerGender: 'male' | 'female'): Friend[] => {
  if (playerAge < 4) return [];
  
  const numFriends = Math.min(Math.floor(playerAge / 3), 5) + Math.floor(Math.random() * 2);
  const friends: Friend[] = [];
  const meetPlaces = ['Kindergarten', 'Schule', 'Nachbarschaft', 'Sportverein', 'Spielplatz'];
  
  for (let i = 0; i < numFriends; i++) {
    const gender: 'male' | 'female' = Math.random() < 0.5 ? 'male' : 'female';
    const names = friendNames[gender];
    const usedNames = friends.map(f => f.name);
    const availableNames = names.filter(n => !usedNames.includes(n));
    const friendship = 50 + Math.floor(Math.random() * 30);
    
    const friend: Friend = {
      id: `friend-${Date.now()}-${i}`,
      name: availableNames[Math.floor(Math.random() * availableNames.length)] || `Freund ${i + 1}`,
      gender,
      age: playerAge + Math.floor(Math.random() * 3) - 1,
      friendship,
      personality: friendPersonalities[Math.floor(Math.random() * friendPersonalities.length)],
      level: getFriendshipLevel(friendship),
      metAt: meetPlaces[Math.floor(Math.random() * meetPlaces.length)],
      yearsKnown: Math.floor(Math.random() * Math.max(1, playerAge - 4)),
      hadFight: false,
      fightCooldown: 0
    };
    friends.push(friend);
  }
  
  return friends;
};

// Get friendship level from score
export const getFriendshipLevel = (friendship: number): Friend['level'] => {
  if (friendship >= 76) return 'best';
  if (friendship >= 51) return 'good';
  if (friendship >= 26) return 'casual';
  return 'acquaintance';
};

// Generate a random friend name
export const generateFriendName = (): string => {
  const gender: 'male' | 'female' = Math.random() < 0.5 ? 'male' : 'female';
  const names = friendNames[gender];
  return names[Math.floor(Math.random() * names.length)];
};

// Generate a new friend
export const generateNewFriend = (playerAge: number, forcedName?: string): Friend => {
  const gender: 'male' | 'female' = Math.random() < 0.5 ? 'male' : 'female';
  const names = friendNames[gender];
  const meetPlaces = ['Party', 'Arbeit', 'Online', 'Fitnessstudio', 'Café', 'Konzert', 'Uni'];
  const friendship = 20 + Math.floor(Math.random() * 20);
  
  return {
    id: `friend-${Date.now()}-${Math.random()}`,
    name: forcedName || names[Math.floor(Math.random() * names.length)],
    gender,
    age: playerAge + Math.floor(Math.random() * 10) - 5,
    friendship,
    personality: friendPersonalities[Math.floor(Math.random() * friendPersonalities.length)],
    level: getFriendshipLevel(friendship),
    metAt: meetPlaces[Math.floor(Math.random() * meetPlaces.length)],
    yearsKnown: 0,
    hadFight: false,
    fightCooldown: 0
  };
};

// Reset yearly activity usage (call at start of new year)
export const resetYearlyActivityUsage = (state: RelationshipState): RelationshipState => ({
  ...state,
  yearlyActivityUsage: {},
  yearlyFriendActivityUsage: {}
});

// Check if activity can be done this year
export const canDoActivity = (activityId: string, maxPerYear: number, usage: YearlyActivityUsage): boolean => {
  const currentUsage = usage[activityId] || 0;
  return currentUsage < maxPerYear;
};

// Record activity usage
export const recordActivityUsage = (activityId: string, usage: YearlyActivityUsage): YearlyActivityUsage => ({
  ...usage,
  [activityId]: (usage[activityId] || 0) + 1
});

// Get random excuse for an activity
export const getRandomExcuse = (excuses: string[]): string => {
  return excuses[Math.floor(Math.random() * excuses.length)];
};

// Check if player can marry
export const canMarry = (partner: Partner | null): boolean => {
  return partner !== null && partner.relationshipStatus === 'dating' && partner.yearsTogethere >= 1;
};

// Check if player can have children
export const canHaveChildren = (partner: Partner | null, playerAge: number): boolean => {
  if (!partner) return false;
  if (partner.relationshipStatus !== 'married') return false;
  if (playerAge < 20 || playerAge > 50) return false;
  return true;
};
