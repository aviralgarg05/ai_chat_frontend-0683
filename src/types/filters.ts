export const occasions = [
  'Diwali', 'Eid', 'Secret Santa', 'Thanksgiving', 'Holi', 'Birthday',
  'Anniversary', 'Wedding', 'Engagement', 'Retirement', 'Get Well',
  'Promotion', 'Ramadan', 'Christmas', 'Housewarming', 'New Baby',
  'New Job', 'Graduation', 'Valentine\'s Day', 'Mother\'s Day', 'Father\'s Day'
] as const;

export const personas = [
  'Friend', 'Best friend', 'Boyfriend', 'Girlfriend', 'Husband', 'Wife',
  'Grandma', 'Grandpa', 'Mom', 'Dad', 'Cousin', 'Co-worker', 'Boss',
  'Client', 'Uncle', 'Aunt', 'Fiancé', 'Self', 'Roommate', 'Neighbor'
] as const;

export const ageRanges = [
  '0–2', '2–4', '4–12', '12–18', '18–25', '26–40', '40–60', '60+'
] as const;

export const genders = [
  'Male', 'Female', 'Other', 'Prefer not to say'
] as const;

export const interests = [
  'Tech gadgets', 'Food', 'Drink', 'Snacks & sweets', 'Movie & TV', 'Music',
  'Clothing & accessories', 'Beauty', 'Sports & activities', 'Pets',
  'Health & wellness', 'Reading', 'Cooking', 'Home decor & improvement',
  'Games & puzzles', 'Art & design', 'Travel', 'Photography', 'Fitness',
  'Gardening', 'DIY', 'Board games', 'Collectibles', 'Stationery'
] as const;

export const priceRanges = [
  '200–300', '300–600', '600–1000', '1000–1600', '1600–2000',
  '2000–3000', '3000–4000', '4000–5100', '5100+'
] as const;

export type Occasion = typeof occasions[number];
export type Persona = typeof personas[number];
export type AgeRange = typeof ageRanges[number];
export type Gender = typeof genders[number];
export type Interest = typeof interests[number];
export type PriceRange = typeof priceRanges[number];

export interface FilterState {
  mode: 'guided' | 'direct';
  occasion?: Occasion;
  persona?: Persona;
  age?: AgeRange;
  gender?: Gender;
  interests: Interest[];
  priceRange?: PriceRange;
  extraDetails?: string;
  directPrompt?: string;
}

export const buildMessage = (filters: FilterState): string => {
  if (filters.mode === 'direct' && filters.directPrompt) {
    return filters.directPrompt.replace(/\s+/g, ' ').trim();
  }

  const parts: string[] = [];

  if (filters.occasion) {
    parts.push(filters.occasion);
  }

  if (filters.persona) {
    parts.push(`for ${filters.persona.toLowerCase()}`);
  }

  if (filters.age) {
    const ageGender = filters.gender && filters.gender !== 'Prefer not to say'
      ? `age ${filters.age}, ${filters.gender.toLowerCase()}`
      : `age ${filters.age}`;
    parts.push(`(${ageGender})`);
  }

  if (filters.interests.length > 0) {
    parts.push(`interested in ${filters.interests.map(i => i.toLowerCase()).join(',')}`);
  }

  if (filters.priceRange) {
    parts.push(`— budget ${filters.priceRange}`);
  }

  if (filters.extraDetails?.trim()) {
    parts.push(`— ${filters.extraDetails.trim()}`);
  }

  return parts.join(' ');
};
