// Property/Real Estate System Types

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  purchasePrice: number;
  monthlyRent: number;
  condition: number; // 0-100
  appreciation: number; // yearly value increase percentage
  owned: boolean;
  isRented: boolean;
  rentedSince?: number;
}

export type PropertyType = 
  | 'apartment'     // Wohnung
  | 'house'         // Haus
  | 'villa'         // Villa
  | 'mansion';      // Herrenhaus

export interface PropertyState {
  currentHome: Property | null;
  ownedProperties: Property[];
  rentedProperty: Property | null;
  totalPropertyValue: number;
}

// Available properties by tier
export const availableProperties: Property[] = [
  // Apartments (Wohnungen)
  {
    id: 'apartment-small',
    name: 'Kleine Einzimmerwohnung',
    type: 'apartment',
    purchasePrice: 50000,
    monthlyRent: 400,
    condition: 100,
    appreciation: 2,
    owned: false,
    isRented: false
  },
  {
    id: 'apartment-medium',
    name: 'Zweizimmerwohnung',
    type: 'apartment',
    purchasePrice: 120000,
    monthlyRent: 700,
    condition: 100,
    appreciation: 2.5,
    owned: false,
    isRented: false
  },
  {
    id: 'apartment-large',
    name: 'Penthouse-Wohnung',
    type: 'apartment',
    purchasePrice: 350000,
    monthlyRent: 1500,
    condition: 100,
    appreciation: 3,
    owned: false,
    isRented: false
  },
  // Houses (Häuser)
  {
    id: 'house-small',
    name: 'Kleines Reihenhaus',
    type: 'house',
    purchasePrice: 200000,
    monthlyRent: 900,
    condition: 100,
    appreciation: 3,
    owned: false,
    isRented: false
  },
  {
    id: 'house-medium',
    name: 'Einfamilienhaus',
    type: 'house',
    purchasePrice: 400000,
    monthlyRent: 1400,
    condition: 100,
    appreciation: 3.5,
    owned: false,
    isRented: false
  },
  {
    id: 'house-large',
    name: 'Großes Landhaus',
    type: 'house',
    purchasePrice: 750000,
    monthlyRent: 2500,
    condition: 100,
    appreciation: 4,
    owned: false,
    isRented: false
  },
  // Villas
  {
    id: 'villa-standard',
    name: 'Moderne Villa',
    type: 'villa',
    purchasePrice: 1500000,
    monthlyRent: 5000,
    condition: 100,
    appreciation: 4.5,
    owned: false,
    isRented: false
  },
  {
    id: 'villa-luxury',
    name: 'Luxusvilla mit Pool',
    type: 'villa',
    purchasePrice: 3000000,
    monthlyRent: 10000,
    condition: 100,
    appreciation: 5,
    owned: false,
    isRented: false
  },
  // Mansions (Herrenhäuser)
  {
    id: 'mansion',
    name: 'Historisches Herrenhaus',
    type: 'mansion',
    purchasePrice: 10000000,
    monthlyRent: 25000,
    condition: 100,
    appreciation: 6,
    owned: false,
    isRented: false
  }
];

export const propertyTypeLabels: Record<PropertyType, string> = {
  apartment: 'Wohnung',
  house: 'Haus',
  villa: 'Villa',
  mansion: 'Herrenhaus'
};

export const propertyTypeEmojis: Record<PropertyType, string> = {
  apartment: '🏢',
  house: '🏠',
  villa: '🏡',
  mansion: '🏰'
};

// Create initial property state
export const createPropertyState = (): PropertyState => ({
  currentHome: null,
  ownedProperties: [],
  rentedProperty: null,
  totalPropertyValue: 0
});

// Calculate yearly rent cost
export const calculateYearlyRent = (property: Property | null): number => {
  if (!property || !property.isRented) return 0;
  return property.monthlyRent * 12;
};

// Calculate property value after appreciation
export const calculatePropertyValue = (property: Property, yearsOwned: number): number => {
  const appreciatedValue = property.purchasePrice * Math.pow(1 + property.appreciation / 100, yearsOwned);
  return Math.floor(appreciatedValue);
};
