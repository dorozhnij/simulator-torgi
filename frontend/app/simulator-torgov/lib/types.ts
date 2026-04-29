export type AuctionLot = {
  id: number;
  lotUrl: string;
  imageUrl: string;
  title: string;
  areaM2: number | null;
  areaSotok: number | null;
  districtName?: string;
  purpose: string;
  cadastralNumber: string;
  startPriceRub: number;
  finalPriceRub: number;
};

export type RoundAnswer = {
  lotId: number;
  guessRub: number;
  actualRub: number;
  deltaRub: number; // guess - actual
};

