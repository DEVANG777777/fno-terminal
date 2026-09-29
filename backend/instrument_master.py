"""
Instrument Master Caching Engine for Angel One SmartAPI
Downloads and locally indexes Angel One Scrip Master for ultra-fast token lookups.
"""
import os
import json
import urllib.request
from typing import Optional, Dict

SCRIP_MASTER_URL = "https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json"
CACHE_FILE = os.path.join(os.path.dirname(__file__), "scrip_master_cache.json")

class InstrumentMaster:
    def __init__(self):
        self.instruments: list[dict] = []
        self.lookup_cache: Dict[str, dict] = {}

    def load_or_download(self):
        if os.path.exists(CACHE_FILE):
            print(f"Loading cached instruments from {CACHE_FILE}...")
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                self.instruments = json.load(f)
        else:
            print("Downloading Angel One Instrument Master...")
            urllib.request.urlretrieve(SCRIP_MASTER_URL, CACHE_FILE)
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                self.instruments = json.load(f)
        
        # Build quick lookup index: (name, strike, opt_type, expiry) -> token
        for item in self.instruments:
            if item.get("exch_seg") == "NFO":
                key = f"{item.get('name')}_{item.get('strike')}_{item.get('instrumenttype')}"
                self.lookup_cache[key] = item

    def find_option_token(self, symbol: str, strike: float, option_type: str) -> Optional[dict]:
        """
        Fast lookup without network latency
        """
        # Convert strike to paise if needed by Angel One (e.g. 1420 * 100)
        strike_paise = str(int(strike * 100))
        key = f"{symbol}_{strike_paise}_{'OPTSTK' if option_type in ['CE', 'PE'] else 'OPTIDX'}"
        return self.lookup_cache.get(key)
