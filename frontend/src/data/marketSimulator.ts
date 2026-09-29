import type { CandleData, FnoStock, IndexData } from '../types';
import { FNO_CONFIGS } from './fnoUniverse';

// Helper to get today's market open timestamp (09:15 AM IST)
function getMarketSessionBaseTime(): number {
  const d = new Date();
  d.setHours(9, 15, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

/**
 * Generates realistic 5-minute candlestick bars for a trading day (75 candles: 09:15 to 15:30)
 */
export function generateCandleSeries(
  basePrice: number,
  targetLtp: number,
  volatilityPercent: number = 0.35,
  candleCount: number = 75
): CandleData[] {
  const candles: CandleData[] = [];
  const baseTime = getMarketSessionBaseTime();
  const totalChange = targetLtp - basePrice;

  let currentPrice = basePrice;

  for (let i = 0; i < candleCount; i++) {
    const time = baseTime + i * 300; // 5-minute intervals = 300s
    // Trend bias towards targetLtp
    const progress = (i + 1) / candleCount;
    const trendAnchor = basePrice + totalChange * progress;

    // Small random noise for each bar
    const noise = (Math.random() - 0.48) * (basePrice * (volatilityPercent / 100));
    const open = currentPrice;
    let close = trendAnchor + noise;

    // Ensure close on the final candle matches targetLtp exactly
    if (i === candleCount - 1) {
      close = targetLtp;
    }

    const high = Math.max(open, close) + Math.abs(Math.random() * (basePrice * 0.002));
    const low = Math.min(open, close) - Math.abs(Math.random() * (basePrice * 0.002));
    const volume = Math.floor(5000 + Math.random() * 45000);

    const roundP = (val: number) => Number(val.toFixed(2));

    candles.push({
      time,
      open: roundP(open),
      high: roundP(high),
      low: roundP(low),
      close: roundP(close),
      volume,
    });

    currentPrice = close;
  }

  return candles;
}

/**
 * Initializes all F&O stocks with real-world % changes and 5-min candles
 */
export function initializeFnoStocks(): FnoStock[] {
  return FNO_CONFIGS.map((cfg) => {
    const prevClose = cfg.basePrevClose;
    const ltp = Number((prevClose * (1 + cfg.targetPercent / 100)).toFixed(2));
    const change = Number((ltp - prevClose).toFixed(2));
    const changePercent = Number(((change / prevClose) * 100).toFixed(2));

    const candles = generateCandleSeries(prevClose, ltp, 0.4);

    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);

    return {
      symbol: cfg.symbol,
      name: cfg.name,
      category: cfg.category,
      strikeInterval: cfg.strikeInterval,
      lotSize: cfg.lotSize,
      basePrice: prevClose,
      prevClose,
      ltp,
      change,
      changePercent,
      volume: candles.reduce((acc, c) => acc + (c.volume || 0), 0),
      high: Math.max(...highs),
      low: Math.min(...lows),
      historicalCandles: candles,
    };
  });
}

/**
 * Generates realistic 5-min candles for Nifty 50 and Bank Nifty
 */
export function generateIndices(): { nifty: IndexData; bankNifty: IndexData } {
  // Nifty 50
  const niftyPrev = 24780.5;
  const niftyLtp = 24892.4;
  const niftyChange = Number((niftyLtp - niftyPrev).toFixed(2));
  const niftyChangePct = Number(((niftyChange / niftyPrev) * 100).toFixed(2));
  const niftyCandles = generateCandleSeries(niftyPrev, niftyLtp, 0.15);

  // Bank Nifty
  const bnfPrev = 50850.0;
  const bnfLtp = 51245.6;
  const bnfChange = Number((bnfLtp - bnfPrev).toFixed(2));
  const bnfChangePct = Number(((bnfChange / bnfPrev) * 100).toFixed(2));
  const bnfCandles = generateCandleSeries(bnfPrev, bnfLtp, 0.25);

  return {
    nifty: {
      symbol: 'NIFTY 50',
      name: 'NIFTY 50 INDEX',
      ltp: niftyLtp,
      prevClose: niftyPrev,
      change: niftyChange,
      changePercent: niftyChangePct,
      high: Math.max(...niftyCandles.map((c) => c.high)),
      low: Math.min(...niftyCandles.map((c) => c.low)),
      candles: niftyCandles,
    },
    bankNifty: {
      symbol: 'BANKNIFTY',
      name: 'NIFTY BANK INDEX',
      ltp: bnfLtp,
      prevClose: bnfPrev,
      change: bnfChange,
      changePercent: bnfChangePct,
      high: Math.max(...bnfCandles.map((c) => c.high)),
      low: Math.min(...bnfCandles.map((c) => c.low)),
      candles: bnfCandles,
    },
  };
}

/**
 * Synthesizes correlated Option 5-min candles based on the underlying Stock candles, Strike, and CE/PE
 */
export function generateOptionCandles(
  underlyingCandles: CandleData[],
  strike: number,
  optionType: 'CE' | 'PE'
): CandleData[] {
  const baseExtrinsic = strike * 0.022;

  const calculateOptionPrice = (stockPrice: number): number => {
    let intrinsic = 0;
    if (optionType === 'CE') {
      intrinsic = Math.max(0, stockPrice - strike);
    } else {
      intrinsic = Math.max(0, strike - stockPrice);
    }
    const moneyness = Math.abs(stockPrice - strike) / (strike * 0.05);
    const timeValue = baseExtrinsic * Math.exp(-0.5 * moneyness * moneyness);
    const premium = intrinsic + timeValue;
    return Math.max(0.5, Number(premium.toFixed(2)));
  };

  return underlyingCandles.map((sc) => {
    const open = calculateOptionPrice(sc.open);
    const close = calculateOptionPrice(sc.close);
    const maxOC = Math.max(open, close);
    const minOC = Math.min(open, close);
    const spread = Math.max(0.2, (maxOC - minOC) * 0.3 + Math.random() * 0.4);

    const high = Number((maxOC + spread).toFixed(2));
    const low = Number(Math.max(0.2, minOC - spread * 0.8).toFixed(2));
    const volume = Math.floor((sc.volume || 10000) * 1.5);

    return {
      time: sc.time,
      open,
      high,
      low,
      close,
      volume,
    };
  });
}
