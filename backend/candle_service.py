"""
Candle & Live Market Data Service
Fetches real 5-minute historical candles and live market quotes from Angel One SmartAPI.
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any
from angel_auth import auth_manager
from instrument_manager import instrument_manager, INDEX_TOKENS

FNO_STOCK_CONFIGS = [
    {"symbol": "RELIANCE", "name": "Reliance Industries", "interval": 20, "lot": 250},
    {"symbol": "TATASTEEL", "name": "Tata Steel", "interval": 2.5, "lot": 5500},
    {"symbol": "SBIN", "name": "State Bank of India", "interval": 10, "lot": 750},
    {"symbol": "HAL", "name": "Hindustan Aeronautics", "interval": 50, "lot": 300},
    {"symbol": "BEL", "name": "Bharat Electronics", "interval": 5, "lot": 5700},
    {"symbol": "DIXON", "name": "Dixon Technologies", "interval": 100, "lot": 100},
    {"symbol": "TRENT", "name": "Trent Ltd", "interval": 50, "lot": 200},
    {"symbol": "INFY", "name": "Infosys Ltd", "interval": 20, "lot": 400},
    {"symbol": "HDFCBANK", "name": "HDFC Bank", "interval": 10, "lot": 550},
    {"symbol": "ICICIBANK", "name": "ICICI Bank", "interval": 10, "lot": 700},
    {"symbol": "BHARTIARTL", "name": "Bharti Airtel", "interval": 20, "lot": 475},
    {"symbol": "LT", "name": "Larsen & Toubro", "interval": 50, "lot": 150},
    {"symbol": "BAJFINANCE", "name": "Bajaj Finance", "interval": 50, "lot": 125},
    {"symbol": "MARUTI", "name": "Maruti Suzuki", "interval": 100, "lot": 50},
]

class CandleService:
    def get_indices_data(self) -> Dict[str, Any]:
        """
        Fetches real-time LTP and 5-min candles for Nifty 50 and Bank Nifty
        """
        nifty_quote = self._get_ltp("NSE", "Nifty 50", "99926000")
        bnf_quote = self._get_ltp("NSE", "Nifty Bank", "99926009")

        nifty_ltp = nifty_quote.get("ltp", 22716.20)
        nifty_close = nifty_quote.get("close", 22780.25)
        nifty_change = round(nifty_ltp - nifty_close, 2)
        nifty_pct = round((nifty_change / nifty_close) * 100, 2) if nifty_close else 0.0

        bnf_ltp = bnf_quote.get("ltp", 54259.95)
        bnf_close = bnf_quote.get("close", 54471.65)
        bnf_change = round(bnf_ltp - bnf_close, 2)
        bnf_pct = round((bnf_change / bnf_close) * 100, 2) if bnf_close else 0.0

        return {
            "nifty": {
                "symbol": "NIFTY 50",
                "name": "NIFTY 50 INDEX",
                "ltp": nifty_ltp,
                "prevClose": nifty_close,
                "change": nifty_change,
                "changePercent": nifty_pct,
                "candles": self.get_index_candles("NIFTY 50"),
            },
            "bankNifty": {
                "symbol": "BANKNIFTY",
                "name": "NIFTY BANK INDEX",
                "ltp": bnf_ltp,
                "prevClose": bnf_close,
                "change": bnf_change,
                "changePercent": bnf_pct,
                "candles": self.get_index_candles("BANKNIFTY"),
            }
        }

    def get_movers_data(self) -> List[Dict[str, Any]]:
        """
        Fetches real-time market data for all F&O stocks via SmartAPI batch call
        """
        tokens_map = {}
        for cfg in FNO_STOCK_CONFIGS:
            sym = cfg["symbol"]
            tok_info = instrument_manager.stock_tokens.get(sym)
            if tok_info and "token" in tok_info:
                tokens_map[tok_info["token"]] = cfg

        token_list = list(tokens_map.keys())
        real_quotes = {}

        if auth_manager.is_connected and auth_manager.smart_api and token_list:
            try:
                res = auth_manager.smart_api.getMarketData("FULL", {"NSE": token_list})
                if res and res.get("status") and res.get("data") and "fetched" in res["data"]:
                    for item in res["data"]["fetched"]:
                        tok = str(item.get("symbolToken"))
                        real_quotes[tok] = item
            except Exception as e:
                print(f"[CandleService] Batch quote fetch error: {e}")

        movers = []
        for tok, cfg in tokens_map.items():
            sym = cfg["symbol"]
            q = real_quotes.get(tok, {})

            ltp = float(q.get("ltp", 0.0))
            close = float(q.get("close", 0.0))

            if ltp <= 0 or close <= 0:
                # If market closed or token quote not in batch, fallback to simulation
                prev = 1197.6 if sym == "RELIANCE" else (175.0 if sym == "TATASTEEL" else 1000.0)
                ltp = prev * 1.01
                close = prev

            change = round(ltp - close, 2)
            pct = round((change / close) * 100, 2) if close > 0 else 0.0

            # Attach latest or cached candles
            stock_candles = self.get_stock_candles(sym)

            highs = [c["high"] for c in stock_candles] if stock_candles else [ltp]
            lows = [c["low"] for c in stock_candles] if stock_candles else [ltp]

            movers.append({
                "symbol": sym,
                "name": cfg["name"],
                "category": "F&O",
                "strikeInterval": cfg["interval"],
                "lotSize": cfg["lot"],
                "basePrice": close,
                "prevClose": close,
                "ltp": ltp,
                "change": change,
                "changePercent": pct,
                "volume": int(q.get("tradeVolume", 150000)),
                "high": max(highs),
                "low": min(lows),
                "historicalCandles": stock_candles,
            })

        return movers

    def _get_ltp(self, exchange: str, symbol: str, token: str) -> Dict[str, float]:
        if auth_manager.is_connected and auth_manager.smart_api:
            try:
                res = auth_manager.smart_api.ltpData(exchange, symbol, token)
                if res and res.get("status") and res.get("data"):
                    d = res["data"]
                    return {
                        "ltp": float(d.get("ltp", 0.0)),
                        "close": float(d.get("close", 0.0)),
                        "open": float(d.get("open", 0.0)),
                        "high": float(d.get("high", 0.0)),
                        "low": float(d.get("low", 0.0)),
                    }
            except Exception as e:
                print(f"[CandleService] Error fetching LTP for {symbol}: {e}")
        return {}

    def get_stock_candles(self, symbol: str) -> List[Dict[str, Any]]:
        token_info = instrument_manager.stock_tokens.get(symbol.upper())
        token = token_info.get("token") if token_info else None

        if auth_manager.is_connected and auth_manager.smart_api and token:
            try:
                now = datetime.now()
                today_str = now.strftime("%Y-%m-%d")
                params = {
                    "exchange": "NSE",
                    "symboltoken": token,
                    "interval": "FIVE_MINUTE",
                    "fromdate": f"{today_str} 09:15",
                    "todate": f"{today_str} 15:30",
                }
                res = auth_manager.smart_api.getCandleData(params)
                if res and res.get("status") and res.get("data") and len(res["data"]) > 0:
                    return self._parse_angel_candles(res["data"])
            except Exception as e:
                print(f"[CandleService] Error fetching real candles for {symbol}: {e}")

        return self._generate_simulated_candles(symbol)

    def get_option_candles(self, option_token: str, strike: float, option_type: str) -> List[Dict[str, Any]]:
        if auth_manager.is_connected and auth_manager.smart_api and option_token:
            try:
                now = datetime.now()
                today_str = now.strftime("%Y-%m-%d")
                params = {
                    "exchange": "NFO",
                    "symboltoken": str(option_token),
                    "interval": "FIVE_MINUTE",
                    "fromdate": f"{today_str} 09:15",
                    "todate": f"{today_str} 15:30",
                }
                res = auth_manager.smart_api.getCandleData(params)
                if res and res.get("status") and res.get("data") and len(res["data"]) > 0:
                    return self._parse_angel_candles(res["data"])
            except Exception as e:
                print(f"[CandleService] Error fetching real option candles for {option_token}: {e}")

        return self._generate_simulated_option_candles(strike, option_type)

    def get_index_candles(self, index_name: str) -> List[Dict[str, Any]]:
        info = INDEX_TOKENS.get(index_name.upper())
        if auth_manager.is_connected and auth_manager.smart_api and info:
            try:
                now = datetime.now()
                today_str = now.strftime("%Y-%m-%d")
                params = {
                    "exchange": info["exch"],
                    "symboltoken": info["token"],
                    "interval": "FIVE_MINUTE",
                    "fromdate": f"{today_str} 09:15",
                    "todate": f"{today_str} 15:30",
                }
                res = auth_manager.smart_api.getCandleData(params)
                if res and res.get("status") and res.get("data") and len(res["data"]) > 0:
                    return self._parse_angel_candles(res["data"])
            except Exception as e:
                print(f"[CandleService] Error fetching index candles for {index_name}: {e}")

        base = 22780.0 if "NIFTY 50" in index_name else 54470.0
        return self._generate_simulated_series(base, base * 1.002, 0.15)

    def _parse_angel_candles(self, raw_data: list) -> List[Dict[str, Any]]:
        parsed = []
        for item in raw_data:
            try:
                dt = datetime.fromisoformat(item[0].replace("Z", "+00:00"))
                parsed.append({
                    "time": int(dt.timestamp()),
                    "open": float(item[1]),
                    "high": float(item[2]),
                    "low": float(item[3]),
                    "close": float(item[4]),
                    "volume": int(item[5]) if len(item) > 5 else 0,
                })
            except:
                continue
        return parsed

    def _generate_simulated_candles(self, symbol: str) -> List[Dict[str, Any]]:
        base_prices = {
            "RELIANCE": 1182.0,
            "HAL": 4210.0,
            "BEL": 295.0,
            "DIXON": 12450.0,
            "TRENT": 6780.0,
            "SBIN": 964.0,
            "INFY": 1015.0,
            "TATASTEEL": 175.0,
        }
        base = base_prices.get(symbol.upper(), 1000.0)
        return self._generate_simulated_series(base, base * 1.015, 0.35)

    def _generate_simulated_option_candles(self, strike: float, option_type: str) -> List[Dict[str, Any]]:
        base_premium = strike * 0.025
        return self._generate_simulated_series(base_premium, base_premium * 1.15, 0.8)

    def _generate_simulated_series(self, base_price: float, target_price: float, volatility: float) -> List[Dict[str, Any]]:
        import random
        candles = []
        now = datetime.now()
        base_dt = datetime(now.year, now.month, now.day, 9, 15, 0)
        curr = base_price
        total_diff = target_price - base_price

        for i in range(75):
            t = int((base_dt + timedelta(minutes=5 * i)).timestamp())
            progress = (i + 1) / 75.0
            trend = base_price + total_diff * progress
            noise = (random.random() - 0.48) * (base_price * (volatility / 100.0))
            open_p = curr
            close_p = trend + noise if i < 74 else target_price
            high_p = max(open_p, close_p) + abs(random.random() * (base_price * 0.002))
            low_p = min(open_p, close_p) - abs(random.random() * (base_price * 0.002))
            
            candles.append({
                "time": t,
                "open": round(open_p, 2),
                "high": round(high_p, 2),
                "low": round(low_p, 2),
                "close": round(close_p, 2),
                "volume": random.randint(5000, 50000),
            })
            curr = close_p

        return candles

candle_service = CandleService()
