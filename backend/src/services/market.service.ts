// Fetches real market data from Polygon.io
// Free tier: 5 API calls/minute, 2 years of history

export interface OHLCV {
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
  t: number; // timestamp (ms)
}

export interface TickerInfo {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  volume: number;
}

const BASE_URL = 'https://api.polygon.io';

async function polygonFetch(path: string): Promise<unknown> {
  const key = process.env.POLYGON_API_KEY;
  if (!key || key === 'YOUR_POLYGON_KEY_HERE') {
    throw new Error('POLYGON_API_KEY not configured');
  }
  const url = `${BASE_URL}${path}&apiKey=${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Polygon API ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function getOHLCV(
  symbol: string,
  timeframe: string = '1h',
  limit: number = 120
): Promise<OHLCV[]> {
  // Map our timeframe codes to Polygon's format
  const tfMap: Record<string, { mult: number; span: string }> = {
    '1m': { mult: 1, span: 'minute' },
    '5m': { mult: 5, span: 'minute' },
    '15m': { mult: 15, span: 'minute' },
    '1h': { mult: 1, span: 'hour' },
    '4h': { mult: 4, span: 'hour' },
    '1d': { mult: 1, span: 'day' },
    '1w': { mult: 1, span: 'week' },
  };

  const tf = tfMap[timeframe] || tfMap['1h'];
  const to = new Date().toISOString().split('T')[0];
  const from = new Date(Date.now() - 90 * 24 * 3600000).toISOString().split('T')[0];

  try {
    const data = await polygonFetch(
      `/v2/aggs/ticker/${symbol.toUpperCase()}/range/${tf.mult}/${tf.span}/${from}/${to}?adjusted=true&sort=asc&limit=${limit}`
    ) as { results?: Array<{ o: number; h: number; l: number; c: number; v: number; t: number }> };

    if (!data.results?.length) return generateMockOHLCV(symbol, limit);

    return data.results.map(r => ({
      o: r.o, h: r.h, l: r.l, c: r.c, v: r.v, t: r.t,
    }));
  } catch (err) {
    console.warn(`Polygon fetch failed for ${symbol}, using mock data:`, err);
    return generateMockOHLCV(symbol, limit);
  }
}

export async function getTickerInfo(symbol: string): Promise<TickerInfo> {
  try {
    const data = await polygonFetch(
      `/v2/snapshot/locale/us/markets/stocks/tickers/${symbol.toUpperCase()}?`
    ) as { ticker?: { day: { c: number; v: number }; prevDay: { c: number }; todaysChangePerc: number; todaysChange: number } };

    const t = data.ticker;
    if (!t) throw new Error('No ticker data');

    return {
      symbol,
      price: t.day.c,
      change: t.todaysChange,
      changePct: t.todaysChangePerc,
      volume: t.day.v,
    };
  } catch {
    // Fallback to mock if API fails or not configured
    return generateMockTickerInfo(symbol);
  }
}

// ─── MOCK DATA (used when Polygon key not set or rate limited) ─────────────────
function generateMockOHLCV(symbol: string, limit: number): OHLCV[] {
  const bases: Record<string, number> = {
    AAPL: 184, MSFT: 415, NVDA: 875, TSLA: 242, META: 510,
    GOOGL: 175, AMZN: 192, SPY: 524, BTC: 67000, ETH: 3500,
  };
  let price = bases[symbol.toUpperCase()] || 100 + Math.random() * 200;
  const vol = price * 0.015;
  return Array.from({ length: limit }, (_, i) => {
    const o = price;
    const c = price + (Math.random() - 0.48) * vol * 2;
    const h = Math.max(o, c) + Math.random() * vol * 0.6;
    const l = Math.min(o, c) - Math.random() * vol * 0.6;
    const v = Math.floor(200000 + Math.random() * 900000);
    price = c;
    return { o, h, l, c, v, t: Date.now() - (limit - i) * 3600000 };
  });
}

function generateMockTickerInfo(symbol: string): TickerInfo {
  const bases: Record<string, number> = {
    AAPL: 184, MSFT: 415, NVDA: 875, TSLA: 242, META: 510,
    GOOGL: 175, AMZN: 192, SPY: 524,
  };
  const price = bases[symbol.toUpperCase()] || 100 + Math.random() * 200;
  const change = (Math.random() - 0.5) * price * 0.03;
  return { symbol, price, change, changePct: (change / price) * 100, volume: Math.floor(1e6 + Math.random() * 9e6) };
}
