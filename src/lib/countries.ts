// Birth countries with stat modifiers and tags for event filtering.
import { PlayerStats } from '@/types/game';

export interface CountryDef {
  code: string;
  name: string;
  flag: string;
  region: string;
  // Stat additions applied at character creation
  bonus: Partial<PlayerStats> & { money?: number };
  // Tags appended to player for region-specific events
  tags: string[];
  description: string;
}

export const COUNTRIES: CountryDef[] = [
  { code: 'DE', name: 'Deutschland',     flag: '🇩🇪', region: 'EU', bonus: { iq: 5, money: 0 },                   tags: ['country:de', 'region:eu'], description: '+5 IQ' },
  { code: 'AT', name: 'Österreich',      flag: '🇦🇹', region: 'EU', bonus: { iq: 3, looks: 2 },                   tags: ['country:at', 'region:eu'], description: '+3 IQ, +2 Aussehen' },
  { code: 'CH', name: 'Schweiz',         flag: '🇨🇭', region: 'EU', bonus: { iq: 4, money: 500 },                 tags: ['country:ch', 'region:eu'], description: '+4 IQ, +500€ Startgeld' },
  { code: 'US', name: 'USA',             flag: '🇺🇸', region: 'NA', bonus: { luck: 5, money: 200 },               tags: ['country:us', 'region:na'], description: '+5 Glück, +200€' },
  { code: 'JP', name: 'Japan',           flag: '🇯🇵', region: 'AS', bonus: { iq: 8, fitness: -2 },                tags: ['country:jp', 'region:as'], description: '+8 IQ, -2 Fitness' },
  { code: 'BR', name: 'Brasilien',       flag: '🇧🇷', region: 'SA', bonus: { fitness: 8, looks: 4, iq: -2 },      tags: ['country:br', 'region:sa'], description: '+8 Fitness, +4 Aussehen' },
  { code: 'IT', name: 'Italien',         flag: '🇮🇹', region: 'EU', bonus: { looks: 6, luck: 2 },                 tags: ['country:it', 'region:eu'], description: '+6 Aussehen, +2 Glück' },
  { code: 'FR', name: 'Frankreich',      flag: '🇫🇷', region: 'EU', bonus: { looks: 5, iq: 2 },                   tags: ['country:fr', 'region:eu'], description: '+5 Aussehen, +2 IQ' },
  { code: 'ES', name: 'Spanien',         flag: '🇪🇸', region: 'EU', bonus: { looks: 4, fitness: 3 },              tags: ['country:es', 'region:eu'], description: '+4 Aussehen, +3 Fitness' },
  { code: 'GB', name: 'Großbritannien',  flag: '🇬🇧', region: 'EU', bonus: { iq: 4, luck: 1 },                    tags: ['country:gb', 'region:eu'], description: '+4 IQ, +1 Glück' },
  { code: 'KR', name: 'Südkorea',        flag: '🇰🇷', region: 'AS', bonus: { iq: 7, looks: 3 },                   tags: ['country:kr', 'region:as'], description: '+7 IQ, +3 Aussehen' },
  { code: 'CN', name: 'China',           flag: '🇨🇳', region: 'AS', bonus: { iq: 6, fitness: 2 },                 tags: ['country:cn', 'region:as'], description: '+6 IQ, +2 Fitness' },
  { code: 'IN', name: 'Indien',          flag: '🇮🇳', region: 'AS', bonus: { iq: 5, luck: 3 },                    tags: ['country:in', 'region:as'], description: '+5 IQ, +3 Glück' },
  { code: 'NG', name: 'Nigeria',         flag: '🇳🇬', region: 'AF', bonus: { fitness: 6, luck: 4, money: -200 },  tags: ['country:ng', 'region:af'], description: '+6 Fitness, +4 Glück, -200€' },
  { code: 'ZA', name: 'Südafrika',       flag: '🇿🇦', region: 'AF', bonus: { fitness: 5, luck: 2 },               tags: ['country:za', 'region:af'], description: '+5 Fitness, +2 Glück' },
  { code: 'AU', name: 'Australien',      flag: '🇦🇺', region: 'OC', bonus: { fitness: 5, luck: 3, looks: 2 },     tags: ['country:au', 'region:oc'], description: '+5 Fitness, +3 Glück, +2 Aussehen' },
  { code: 'CA', name: 'Kanada',          flag: '🇨🇦', region: 'NA', bonus: { iq: 3, luck: 3, health: 2 },         tags: ['country:ca', 'region:na'], description: '+3 IQ, +3 Glück, +2 Health' },
  { code: 'MX', name: 'Mexiko',          flag: '🇲🇽', region: 'NA', bonus: { fitness: 4, looks: 3, luck: 2 },     tags: ['country:mx', 'region:na'], description: '+4 Fitness, +3 Aussehen' },
  { code: 'RU', name: 'Russland',        flag: '🇷🇺', region: 'EU', bonus: { fitness: 5, health: -2, iq: 3 },     tags: ['country:ru', 'region:eu'], description: '+5 Fitness, +3 IQ, -2 Health' },
  { code: 'TR', name: 'Türkei',          flag: '🇹🇷', region: 'EU', bonus: { looks: 3, fitness: 3, luck: 2 },     tags: ['country:tr', 'region:eu'], description: '+3 Aussehen, +3 Fitness' },
];

export const getCountry = (code: string): CountryDef => {
  return COUNTRIES.find(c => c.code === code) || COUNTRIES[0];
};

// Skin tones (Fitzpatrick-inspired, applied to emoji modifiers and avatar tint)
export interface SkinToneDef {
  id: string;
  label: string;
  emojiModifier: string; // Unicode modifier
  hex: string; // For UI swatch
}

export const SKIN_TONES: SkinToneDef[] = [
  { id: 'light',     label: 'Sehr hell', emojiModifier: '\u{1F3FB}', hex: '#F3D5B5' },
  { id: 'mediumLight', label: 'Hell',    emojiModifier: '\u{1F3FC}', hex: '#E5B894' },
  { id: 'medium',    label: 'Mittel',    emojiModifier: '\u{1F3FD}', hex: '#C68A5E' },
  { id: 'mediumDark', label: 'Dunkel',   emojiModifier: '\u{1F3FE}', hex: '#8D5524' },
  { id: 'dark',      label: 'Sehr dunkel', emojiModifier: '\u{1F3FF}', hex: '#5C3317' },
];

export const getSkinTone = (id: string): SkinToneDef => {
  return SKIN_TONES.find(s => s.id === id) || SKIN_TONES[0];
};

// Apply emoji modifier to person emoji (e.g. 👨 + 🏽)
export const tintEmoji = (baseEmoji: string, skinToneId: string): string => {
  const tone = getSkinTone(skinToneId);
  return baseEmoji + tone.emojiModifier;
};
