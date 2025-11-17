/**
 * TypeScript interfaces for flag coloring pages
 * Based on the flagMetadata structure from Sanity
 */

export interface FlagGeography {
  continent: string;
  subRegion: string;
  countryName: string;
}

export interface FlagCountryInfo {
  capital: string;
  officialLanguage: string;
  population?: number;
  currency: string;
}

export interface FlagLocationInfo {
  borderingCountries: string[];
  coastline?: string[];
  isIsland: boolean;
  hemisphere: string[];
}

export interface FlagInfo {
  flagColors: string[];
  flagSymbol?: string;
  flagPattern?: string;
  colorCount: number;
  flagType?: string;
}

export interface FlagNature {
  climateZone?: string;
  famousLandmark?: string;
  nativeAnimal?: string;
}

export interface FlagCulture {
  traditionalFood?: string;
  famousSport?: string;
  greeting?: string;
  localName?: string;
  whenIndependent?: string;
  majorFestival?: string;
  nationalFlower?: string;
}

export interface FlagFunLearning {
  funFact: string;
}

export interface FlagMetadata {
  geography: FlagGeography;
  countryInfo: FlagCountryInfo;
  locationInfo: FlagLocationInfo;
  flagInfo: FlagInfo;
  nature?: FlagNature;
  culture?: FlagCulture;
  funLearning?: FlagFunLearning;
}

export interface FlagDrawing {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  thumbnail: {
    url?: string;
    alt?: string;
    lqip?: string;
  };
  displayImage: {
    url?: string;
    alt?: string;
    lqip?: string;
  };
  difficulty?: 'easy' | 'medium' | 'hard';
  order?: number;
  isActive?: boolean;
  flagMetadata?: FlagMetadata;
}

export interface FlagFilterState {
  search: string;
  continent: string;
  colors: string[];
  colorCount: string;
  difficulty: string;
  region: string;
  hemisphere: string[];
  isIsland?: boolean;
}

export interface FlagFilterOptions {
  continents: string[];
  colors: string[];
  difficulties: string[];
  regions: string[];
  hemispheres: string[];
}
