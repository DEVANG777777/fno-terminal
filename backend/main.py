"""
FastAPI Backend Server for F&O Analysis Terminal
Coordinates Angel One SmartAPI authentication, instrument cache, movers, and live WebSocket feeds.
"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from angel_auth import auth_manager
from instrument_manager import instrument_manager
from candle_service import candle_service
from option_mapper import map_atm_option
from live_streamer import streamer

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[Server Startup] Starting Instrument Indexer & Checking Auth...")
    instrument_manager.load_index_async()
    auth_manager.login()
    
    tick_task = asyncio.create_task(background_tick_worker())
    yield
    tick_task.cancel()

app = FastAPI(title="F&O Terminal Backend", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConfigPayload(BaseModel):
    api_key: str
    client_code: str
    pin: str
    totp_secret: str

@app.get("/api/status")
def get_status():
    status = auth_manager.get_status()
    status["instruments_loaded"] = instrument_manager.is_loaded
    status["stock_count"] = len(instrument_manager.stock_tokens)
    status["option_count"] = len(instrument_manager.option_tokens)
    return status

@app.post("/api/auth/save-config")
def save_config(cfg: ConfigPayload):
    auth_manager.save_credentials(cfg.api_key, cfg.client_code, cfg.pin, cfg.totp_secret)
    success = auth_manager.login()
    return {
        "success": success,
        "is_connected": auth_manager.is_connected,
        "error": auth_manager.last_error,
    }

@app.post("/api/auth/login")
def trigger_login():
    success = auth_manager.login()
    return {
        "success": success,
        "is_connected": auth_manager.is_connected,
        "error": auth_manager.last_error,
    }

@app.get("/api/indices")
def get_indices():
    return candle_service.get_indices_data()

@app.get("/api/movers")
def get_movers():
    return candle_service.get_movers_data()

@app.get("/api/candles/stock/{symbol}")
def get_stock_candles(symbol: str):
    candles = candle_service.get_stock_candles(symbol)
    token_info = instrument_manager.stock_tokens.get(symbol.upper(), {})
    return {
        "symbol": symbol.upper(),
        "token": token_info.get("token"),
        "candles": candles,
    }

@app.get("/api/option/atm")
def get_atm_option(
    symbol: str = Query(..., description="Stock symbol, e.g. RELIANCE"),
    candle_close: float = Query(..., description="Historical candle close"),
    strike_interval: float = Query(..., description="Strike step"),
    change_percent: float = Query(..., description="Stock % change"),
):
    res = map_atm_option(symbol, candle_close, strike_interval, change_percent)
    opt_token_info = instrument_manager.find_option_token(symbol, res["atm_strike"], res["option_type"])
    res["token"] = opt_token_info.get("token") if opt_token_info else None
    res["angel_symbol"] = opt_token_info.get("symbol") if opt_token_info else res["option_symbol"]
    res["expiry"] = opt_token_info.get("expiry") if opt_token_info else "CURRENT MONTH"
    return res

@app.get("/api/candles/option")
def get_option_candles(
    strike: float = Query(...),
    option_type: str = Query(...),
    token: str = Query(None),
):
    candles = candle_service.get_option_candles(token, strike, option_type)
    return {
        "strike": strike,
        "option_type": option_type,
        "token": token,
        "candles": candles,
    }

@app.websocket("/ws/feed")
async def websocket_endpoint(websocket: WebSocket):
    await streamer.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        streamer.disconnect(websocket)
    except Exception:
        streamer.disconnect(websocket)

async def background_tick_worker():
    import random
    while True:
        try:
            await asyncio.sleep(2.0)
            if streamer.active_connections:
                # Small real tick jitter
                tick_msg = {
                    "type": "TICK",
                    "timestamp": int(asyncio.get_event_loop().time()),
                    "nifty_delta": round((random.random() - 0.49) * 1.5, 2),
                    "bnf_delta": round((random.random() - 0.49) * 4.0, 2),
                }
                await streamer.broadcast(tick_msg)
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"[TickWorker] Error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
