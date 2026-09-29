export interface CandleData {
  time: number; // Unix timestamp in seconds (Lightweight-charts format)
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface FnoStock {
  symbol: string;
  name: string;
  category: string;
  strikeInterval: number;
  lotSize: number;
  basePrice: number;
  prevClose: number;
  ltp: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  historicalCandles: CandleData[];
}

export interface AtmResult {
  symbol: string;
  candleClose: number;
  candleTime: number;
  strikeInterval: number;
  atmStrike: number;
  optionType: 'CE' | 'PE';
  optionSymbol: string;
  expiry: string;
}

export interface IndexData {
  symbol: string;
  name: string;
  ltp: number;
  prevClose: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  candles: CandleData[];
}
