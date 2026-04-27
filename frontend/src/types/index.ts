export interface OHLCV {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  t: number; // timestamp ms
}

export interface TickerInfo {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  volume: number;
}

export interface ChartData {
  symbol: string;
  timeframe: string;
  info: TickerInfo;
  ohlcv: OHLCV[];
}

export interface Alert {
  id: string;
  symbol: string;
  condition: 'above' | 'below' | 'rsi_above' | 'rsi_below';
  price: number;
  status: 'active' | 'triggered' | 'disabled';
  createdAt: string;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

export interface Indicators {
  ema20: boolean;
  ema50: boolean;
  bb: boolean;
  vwap: boolean;
  volume: boolean;
  rsi: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
}
