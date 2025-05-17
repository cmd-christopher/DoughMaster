
export interface Amendment { // For custom, user-typed amendments
  id: string;
  name: string;
  weight: number;
}

export interface FlourSpec {
  id: string;
  name: string;
  shareValue: number; // Represents a proportional share, not a direct percentage
  isCustom: boolean;
  isPredefined?: boolean; // To differentiate predefined from custom-added ones
}

export interface Recipe {
  name: string;
  flourWeight: number; // This remains the TOTAL flour weight
  waterPercentage: number; // Represents ADDED water's percentage relative to total flour
  saltPercentage: number;
  yeastPercentage: number;
  
  useDetailedFlourComposition?: boolean;
  flourComposition?: FlourSpec[]; // Array of different flour types and their shares

  amendments: Amendment[]; // Custom amendments

  // Predefined common additions
  useSugar?: boolean;
  sugarPercentage?: number; // Percentage of totalFlourWeight
  useEgg?: boolean;
  eggCount?: number;       // Number of whole eggs
  useButter?: boolean;
  butterPercentage?: number; // Percentage of totalFlourWeight
  useOil?: boolean;
  oilPercentage?: number;  // Percentage of totalFlourWeight
}
