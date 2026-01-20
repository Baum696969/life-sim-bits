import { 
  Partner, 
  Child, 
  RelationshipState, 
  maleNames, 
  femaleNames, 
  meetingStories,
  childNames 
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

// Create initial relationship state
export const createRelationshipState = (): RelationshipState => ({
  partner: null,
  children: [],
  exPartners: [],
  totalMarriages: 0,
  totalDivorces: 0
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
