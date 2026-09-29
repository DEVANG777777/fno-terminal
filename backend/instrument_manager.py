"""
Instrument Manager for Angel One
Manages local caching and indexing of Angel One Scrip Master for instantaneous lookup.
"""
import os
import json
import threading
import urllib.request
from typing import Optional, List, Dict, Any

SCRIP_MASTER_URL = "https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json"
CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache")
CACHE_FILE = os.path.join(CACHE_DIR, "scrip_master.json")
INDEX_FILE = os.path.join(CACHE_DIR, "fno_index.json")

INDEX_TOKENS = {
    "NIFTY 50": {"token": "99926000", "symbol": "Nifty 50", "exch": "NSE"},
    "BANKNIFTY": {"token": "99926009", "symbol": "Nifty Bank", "exch": "NSE"},
}

class InstrumentManager:
    def __init__(self):
        self.is_loaded = False
        self.is_downloading = False
        self.stock_tokens: Dict[str, Dict[str, Any]] = {}
        self.option_tokens: Dict[str, Dict[str, Any]] = {}
        self.available_expiries: Dict[str, List[str]] = {}
        self.load_fallback_universe()

    def ensure_cache_dir(self):
        if not os.path.exists(CACHE_DIR):
            os.makedirs(CACHE_DIR, exist_ok=True)

    def load_fallback_universe(self):
        """
        Instant in-memory map for key F&O stocks and sample ATM tokens
        """
        self.stock_tokens = {
            "RELIANCE": {"token": "2885", "symbol": "RELIANCE-EQ", "lotsize": "250"},
            "HAL": {"token": "2303", "symbol": "HAL-EQ", "lotsize": "300"},
            "BEL": {"token": "383", "symbol": "BEL-EQ", "lotsize": "5700"},
            "DIXON": {"token": "649", "symbol": "DIXON-EQ", "lotsize": "100"},
            "TRENT": {"token": "1964", "symbol": "TRENT-EQ", "lotsize": "200"},
            "SBIN": {"token": "3045", "symbol": "SBIN-EQ", "lotsize": "750"},
            "INFY": {"token": "1594", "symbol": "INFY-EQ", "lotsize": "400"},
            "TATASTEEL": {"token": "3499", "symbol": "TATASTEEL-EQ", "lotsize": "5500"},
            "HDFCBANK": {"token": "1333", "symbol": "HDFCBANK-EQ", "lotsize": "550"},
            "ICICIBANK": {"token": "4963", "symbol": "ICICIBANK-EQ", "lotsize": "700"},
            "BHARTIARTL": {"token": "10604", "symbol": "BHARTIARTL-EQ", "lotsize": "475"},
            "LT": {"token": "11483", "symbol": "LT-EQ", "lotsize": "150"},
            "BAJFINANCE": {"token": "317", "symbol": "BAJFINANCE-EQ", "lotsize": "125"},
            "MARUTI": {"token": "10999", "symbol": "MARUTI-EQ", "lotsize": "50"},
        }
        # Pre-seed popular option strikes
        sample_strikes = [
            ("RELIANCE", 1400, "CE", "148201"),
            ("RELIANCE", 1420, "CE", "148202"),
            ("RELIANCE", 1440, "CE", "148203"),
            ("RELIANCE", 1420, "PE", "148212"),
            ("TATASTEEL", 170, "PE", "139101"),
            ("TATASTEEL", 167.5, "PE", "139102"),
            ("SBIN", 810, "PE", "125401"),
            ("HAL", 4200, "CE", "118901"),
        ]
        for sym, stk, otype, tok in sample_strikes:
            k = f"{sym}_{int(stk) if stk == int(stk) else stk}_{otype}"
            self.option_tokens[k] = {
                "token": tok,
                "symbol": f"{sym} {stk} {otype}",
                "name": sym,
                "strike": stk,
                "option_type": otype,
                "expiry": "26 SEP 2024",
            }
        self.is_loaded = True

    def load_index_async(self):
        """
        Starts background download and indexing of full Scrip Master without blocking server startup
        """
        thread = threading.Thread(target=self._background_index_worker, daemon=True)
        thread.start()

    def _background_index_worker(self):
        self.ensure_cache_dir()
        if os.path.exists(INDEX_FILE):
            try:
                with open(INDEX_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.stock_tokens.update(data.get("stocks", {}))
                    self.option_tokens.update(data.get("options", {}))
                    self.available_expiries.update(data.get("expiries", {}))
                    print(f"[InstrumentManager] Loaded {len(self.stock_tokens)} stocks from cached index.")
                    return
            except Exception as e:
                print(f"[InstrumentManager] Cache read error: {e}")

        if not os.path.exists(CACHE_FILE):
            print("[InstrumentManager] Downloading full Angel One Scrip Master in background...")
            self.is_downloading = True
            try:
                urllib.request.urlretrieve(SCRIP_MASTER_URL, CACHE_FILE)
                print("[InstrumentManager] Download complete.")
            except Exception as e:
                print(f"[InstrumentManager] Download error: {e}")
                self.is_downloading = False
                return
            self.is_downloading = False

        self._parse_scrip_file()

    def _parse_scrip_file(self):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                scrips = json.load(f)
            for item in scrips:
                exch = item.get("exch_seg")
                name = item.get("name")
                token = item.get("token")
                symbol = item.get("symbol")
                inst_type = item.get("instrumenttype")

                if exch == "NSE" and inst_type == "":
                    clean_name = item.get("name", "").upper()
                    if clean_name:
                        self.stock_tokens[clean_name] = {
                            "token": token,
                            "symbol": symbol,
                            "name": clean_name,
                            "lotsize": item.get("lotsize", "1"),
                        }
                elif exch == "NFO" and inst_type in ["OPTSTK", "OPTIDX"]:
                    strike_str = item.get("strike", "0")
                    try:
                        strike_float = float(strike_str) / 100.0
                    except:
                        strike_float = float(strike_str)
                    clean_sym = name.upper() if name else ""
                    opt_type = "CE" if symbol.endswith("CE") else ("PE" if symbol.endswith("PE") else "")
                    k = f"{clean_sym}_{int(strike_float) if strike_float == int(strike_float) else strike_float}_{opt_type}"
                    self.option_tokens[k] = {
                        "token": token,
                        "symbol": symbol,
                        "name": clean_sym,
                        "strike": strike_float,
                        "option_type": opt_type,
                        "expiry": item.get("expiry", ""),
                        "lotsize": item.get("lotsize", "1"),
                    }

            with open(INDEX_FILE, "w", encoding="utf-8") as f:
                json.dump({
                    "stocks": self.stock_tokens,
                    "options": self.option_tokens,
                }, f)
            print(f"[InstrumentManager] Full indexing finished. Total stocks: {len(self.stock_tokens)}, options: {len(self.option_tokens)}")
        except Exception as e:
            print(f"[InstrumentManager] Parsing error: {e}")

    def find_option_token(self, symbol: str, strike: float, option_type: str) -> Optional[Dict[str, Any]]:
        clean_strike = int(strike) if strike == int(strike) else strike
        key = f"{symbol.upper()}_{clean_strike}_{option_type.upper()}"
        return self.option_tokens.get(key)

instrument_manager = InstrumentManager()
