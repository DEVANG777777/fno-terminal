const BACKEND_URL = 'http://127.0.0.1:8000';

export interface AngelStatus {
  is_connected: boolean;
  has_credentials: boolean;
  client_code: string;
  last_error: string | null;
  instruments_loaded: boolean;
  stock_count: number;
  option_count: number;
}

export interface AngelConfig {
  api_key: string;
  client_code: string;
  pin: string;
  totp_secret: string;
}

export async function fetchBackendStatus(): Promise<AngelStatus | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/status`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchIndices() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/indices`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchMovers() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/movers`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function saveAngelConfig(cfg: AngelConfig): Promise<{ success: boolean; is_connected: boolean; error: string | null }> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/save-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg),
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, is_connected: false, error: e.message };
  }
}

export async function fetchAtmOption(
  symbol: string,
  candleClose: number,
  strikeInterval: number,
  changePercent: number
) {
  try {
    const url = `${BACKEND_URL}/api/option/atm?symbol=${encodeURIComponent(symbol)}&candle_close=${candleClose}&strike_interval=${strikeInterval}&change_percent=${changePercent}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchStockCandles(symbol: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/candles/stock/${encodeURIComponent(symbol)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchOptionCandles(strike: number, optionType: string, token?: string) {
  try {
    const url = `${BACKEND_URL}/api/candles/option?strike=${strike}&option_type=${optionType}${token ? `&token=${token}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
