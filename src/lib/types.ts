
export interface Amendment { // For custom, user-typed solid amendments
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

export interface LiquidSpec {
  id: string;
  name: string;
  weight: number; // in grams
  isCustom: boolean;
  isPredefined?: boolean;
}

export interface Recipe {
  name: string;
  flourWeight: number; // This remains the TOTAL flour weight
  desiredHydrationPercentage: number; // User's target total hydration
  saltPercentage: number;
  yeastPercentage: number;
  
  useDetailedFlourComposition?: boolean;
  flourComposition?: FlourSpec[]; // Array of different flour types and their shares

  useCustomLiquidBlend?: boolean;
  liquidComposition?: LiquidSpec[]; // E.g., Milk, other custom liquids

  amendments: Amendment[]; // Custom solid amendments

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
