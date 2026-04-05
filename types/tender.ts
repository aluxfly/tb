export interface Tender {
  id: string;
  title: string;
  region: string;
  industry: string;
  budget: number;
  matchScore: number;
  predictedWinRate: number;
  suggestedBidPrice: number;
  qualifications: string[];
  predictionBasis: string[];
  risks: string[];
}

export interface WinRateBadgeProps {
  rate: number;
}

export interface BidPriceProps {
  price: number;
}
