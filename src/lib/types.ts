export interface Amendment {
  id: string;
  name: string;
  weight: number;
}

export interface Recipe {
  name: string;
  flourWeight: number;
  waterPercentage: number;
  saltPercentage: number;
  yeastPercentage: number;
  amendments: Amendment[];
}
