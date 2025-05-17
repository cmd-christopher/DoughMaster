
export interface Amendment { // For custom, user-typed amendments
  id: string;
  name: string;
  weight: number;
}

export interface Recipe {
  name: string;
  flourWeight: number;
  waterPercentage: number; // Represents ADDED water's percentage relative to flour
  saltPercentage: number;
  yeastPercentage: number;
  amendments: Amendment[]; // Custom amendments

  // Predefined common additions
  useSugar?: boolean;
  sugarPercentage?: number; // Percentage of flourWeight
  useEgg?: boolean;
  eggCount?: number;       // Number of whole eggs
  useButter?: boolean;
  butterPercentage?: number; // Percentage of flourWeight
  useOil?: boolean;
  oilPercentage?: number;  // Percentage of flourWeight
}
