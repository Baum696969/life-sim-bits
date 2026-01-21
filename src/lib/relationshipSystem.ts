import { 
  Partner, 
  Child, 
  RelationshipState, 
  FamilyState,
  FamilyMember,
  FamilyActivity,
  maleNames, 
  femaleNames, 
  meetingStories,
  childNames,
  parentNames,
  siblingNames,
  familyActivities
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

// Generate initial family (parents and possibly siblings)
export const generateFamily = (playerBirthYear: number): FamilyState => {
  const motherName = parentNames.mother[Math.floor(Math.random() * parentNames.mother.length)];
  const fatherName = parentNames.father[Math.floor(Math.random() * parentNames.father.length)];
  
  // Parents are 20-35 years older
  const motherAge = 20 + Math.floor(Math.random() * 16);
  const fatherAge = 22 + Math.floor(Math.random() * 16);
  
  const mother: FamilyMember = {
    id: `mother-${Date.now()}`,
    name: motherName,
    role: 'mother',
    gender: 'female',
    age: motherAge,
    relationship: 70 + Math.floor(Math.random() * 30),
    isAlive: true
  };
  
  const father: FamilyMember = {
    id: `father-${Date.now()}`,
    name: fatherName,
    role: 'father',
    gender: 'male',
    age: fatherAge,
    relationship: 70 + Math.floor(Math.random() * 30),
    isAlive: true
  };
  
  // 50% chance of having 1-3 siblings
  const siblings: FamilyMember[] = [];
  if (Math.random() > 0.5) {
    const siblingCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < siblingCount; i++) {
      const gender: 'male' | 'female' = Math.random() > 0.5 ? 'male' : 'female';
      const names = siblingNames[gender];
      const name = names[Math.floor(Math.random() * names.length)];
      // Siblings are -5 to +10 years from player (can be older or younger)
      const ageDiff = Math.floor(Math.random() * 16) - 5;
      
      siblings.push({
        id: `sibling-${Date.now()}-${i}`,
        name,
        role: 'sibling',
        gender,
        age: Math.max(0, ageDiff), // Will be adjusted each year
        relationship: 60 + Math.floor(Math.random() * 40),
        isAlive: true
      });
    }
  }
  
  return { mother, father, siblings };
};

// Age family members
export const ageFamily = (family: FamilyState): FamilyState => {
  const agedMother = { ...family.mother, age: family.mother.age + 1 };
  const agedFather = { ...family.father, age: family.father.age + 1 };
  
  // Check if parents die (chance increases with age)
  if (agedMother.isAlive && agedMother.age > 60) {
    const deathChance = (agedMother.age - 60) * 0.02;
    if (Math.random() < deathChance) {
      agedMother.isAlive = false;
    }
  }
  if (agedFather.isAlive && agedFather.age > 58) {
    const deathChance = (agedFather.age - 58) * 0.025;
    if (Math.random() < deathChance) {
      agedFather.isAlive = false;
    }
  }
  
  const agedSiblings = family.siblings.map(sibling => ({
    ...sibling,
    age: sibling.age + 1
  }));
  
  return {
    mother: agedMother,
    father: agedFather,
    siblings: agedSiblings
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
    isAlive: true
  };
  
  return {
    ...family,
    siblings: [...family.siblings, newSibling]
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
  const updateRelationship = (member: FamilyMember): FamilyMember => {
    if (member.id === memberId) {
      return {
        ...member,
        relationship: Math.min(100, member.relationship + activity.effects.relationshipBonus)
      };
    }
    return member;
  };
  
  return {
    mother: updateRelationship(family.mother),
    father: updateRelationship(family.father),
    siblings: family.siblings.map(updateRelationship)
  };
};

// Create initial relationship state
export const createRelationshipState = (playerBirthYear?: number): RelationshipState => ({
  partner: null,
  children: [],
  exPartners: [],
  totalMarriages: 0,
  totalDivorces: 0,
  family: playerBirthYear ? generateFamily(playerBirthYear) : null
});

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
