export interface StockConfig {
  symbol: string;
  name: string;
  category: string;
  strikeInterval: number;
  lotSize: number;
  basePrevClose: number;
  targetPercent: number; // For realistic gainer/loser simulation
}

export const FNO_CONFIGS: StockConfig[] = [
  // GAINERS (Bullish)
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', category: 'Energy', strikeInterval: 20, lotSize: 250, basePrevClose: 1380.0, targetPercent: 3.48 },
  { symbol: 'HAL', name: 'Hindustan Aeronautics Ltd', category: 'Defence', strikeInterval: 50, lotSize: 300, basePrevClose: 4210.0, targetPercent: 3.82 },
  { symbol: 'BEL', name: 'Bharat Electronics Ltd', category: 'Defence', strikeInterval: 5, lotSize: 5700, basePrevClose: 295.0, targetPercent: 3.10 },
  { symbol: 'DIXON', name: 'Dixon Technologies Ltd', category: 'Electronics', strikeInterval: 100, lotSize: 100, basePrevClose: 12450.0, targetPercent: 2.75 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', category: 'Telecom', strikeInterval: 20, lotSize: 475, basePrevClose: 1620.0, targetPercent: 2.45 },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd', category: 'Capital Goods', strikeInterval: 50, lotSize: 150, basePrevClose: 3540.0, targetPercent: 2.15 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', category: 'Finance', strikeInterval: 50, lotSize: 125, basePrevClose: 7120.0, targetPercent: 1.88 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', category: 'Banking', strikeInterval: 10, lotSize: 550, basePrevClose: 1640.0, targetPercent: 1.65 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', category: 'Banking', strikeInterval: 10, lotSize: 700, basePrevClose: 1220.0, targetPercent: 1.35 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India', category: 'Auto', strikeInterval: 100, lotSize: 50, basePrevClose: 11800.0, targetPercent: 1.10 },

  // LOSERS (Bearish)
  { symbol: 'TRENT', name: 'Trent Ltd', category: 'Retail', strikeInterval: 50, lotSize: 200, basePrevClose: 6780.0, targetPercent: -4.51 },
  { symbol: 'SBIN', name: 'State Bank of India', category: 'Banking', strikeInterval: 10, lotSize: 750, basePrevClose: 810.0, targetPercent: -3.80 },
  { symbol: 'INFY', name: 'Infosys Ltd', category: 'IT', strikeInterval: 20, lotSize: 400, basePrevClose: 1890.0, targetPercent: -3.25 },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', category: 'Metals', strikeInterval: 2.5, lotSize: 5500, basePrevClose: 175.0, targetPercent: -4.00 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', category: 'Auto', strikeInterval: 10, lotSize: 700, basePrevClose: 980.0, targetPercent: -2.75 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', category: 'IT', strikeInterval: 50, lotSize: 175, basePrevClose: 4150.0, targetPercent: -2.30 },
  { symbol: 'ITC', name: 'ITC Ltd', category: 'FMCG', strikeInterval: 5, lotSize: 1600, basePrevClose: 495.0, targetPercent: -1.95 },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd', category: 'Banking', strikeInterval: 10, lotSize: 625, basePrevClose: 1180.0, targetPercent: -1.60 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', category: 'Banking', strikeInterval: 20, lotSize: 400, basePrevClose: 1760.0, targetPercent: -1.25 },
  { symbol: 'COALINDIA', name: 'Coal India Ltd', category: 'Mining', strikeInterval: 5, lotSize: 2100, basePrevClose: 480.0, targetPercent: -0.90 },
];
