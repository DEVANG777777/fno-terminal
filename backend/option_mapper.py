"""
Option Mapper & ATM Calculation Engine for F&O Terminal
Used for mapping historical candle close to ATM strike & CE/PE option token.
"""

def calculate_atm_strike(candle_close: float, strike_interval: float) -> float:
    """
    ATM Formula: Round(CandleClose / StrikeInterval) * StrikeInterval
    Example: Close 1428 with Interval 20 -> 1420
    """
    if strike_interval <= 0:
        return round(candle_close)
    factor = round(candle_close / strike_interval)
    strike = factor * strike_interval
    return round(strike, 2 if strike_interval % 1 != 0 else 0)

def determine_option_type(change_percent: float) -> str:
    """
    Gainer (% > 0) -> CALL (CE)
    Loser (% < 0)  -> PUT (PE)
    """
    return "CE" if change_percent >= 0 else "PE"

def map_atm_option(symbol: str, candle_close: float, strike_interval: float, change_percent: float) -> dict:
    atm_strike = calculate_atm_strike(candle_close, strike_interval)
    opt_type = determine_option_type(change_percent)
    option_symbol = f"{symbol} {int(atm_strike) if atm_strike.is_integer() else atm_strike} {opt_type}"
    
    return {
        "symbol": symbol,
        "candle_close": candle_close,
        "strike_interval": strike_interval,
        "atm_strike": atm_strike,
        "option_type": opt_type,
        "option_symbol": option_symbol,
    }
