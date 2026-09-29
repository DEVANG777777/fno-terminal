import type { AtmResult } from '../types';

/**
 * Calculates the Nearest ATM (At-The-Money) Strike based on Historical Candle Close
 * ATM Formula: Round(CandleClose / StrikeInterval) * StrikeInterval
 */
export function calculateATM(candleClose: number, strikeInterval: number): number {
  if (strikeInterval <= 0) return Math.round(candleClose);
  const factor = Math.round(candleClose / strikeInterval);
  const strike = factor * strikeInterval;
  return Number(strike.toFixed(strikeInterval % 1 !== 0 ? 2 : 0));
}

/**
 * Determines Option Type (CE vs PE) based on Stock Gainer / Loser Status
 * % Change >= 0 -> Call Option (CE)
 * % Change < 0  -> Put Option (PE)
 */
export function getOptionType(changePercent: number): 'CE' | 'PE' {
  return changePercent >= 0 ? 'CE' : 'PE';
}

/**
 * Computes current monthly expiry string
 */
export function getExpiryLabel(): string {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const lastDay = new Date(year, month + 1, 0);
  const dayOfWeek = lastDay.getDay();
  const daysToThursday = dayOfWeek >= 4 ? dayOfWeek - 4 : dayOfWeek + 3;
  const expiryDate = new Date(year, month + 1, -daysToThursday);

  return `${expiryDate.getDate()} ${months[month]} ${year}`;
}

/**
 * Main ATM engine selector given a stock and candle close
 */
export function evaluateAtmOption(
  symbol: string,
  candleClose: number,
  candleTime: number,
  strikeInterval: number,
  changePercent: number
): AtmResult {
  const atmStrike = calculateATM(candleClose, strikeInterval);
  const optionType = getOptionType(changePercent);
  const expiry = getExpiryLabel();
  const optionSymbol = `${symbol} ${atmStrike} ${optionType}`;

  return {
    symbol,
    candleClose,
    candleTime,
    strikeInterval,
    atmStrike,
    optionType,
    optionSymbol,
    expiry,
  };
}
