import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchChart, OHLCV, TickerInfo } from '../services/api'

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w'

interface ChartState {
  symbol: string; timeframe: Timeframe; ohlcv: OHLCV[]
  info: TickerInfo | null; loading: boolean; error: string | null
}

export function useChartData(initialSymbol = 'AAPL') {
  const [state, setState] = useState<ChartState>({
    symbol: initialSymbol, timeframe: '1h', ohlcv: [],
    info: null, loading: true, error: null,
  })
  const wsRef = useRef<WebSocket | null>(null)

  const load = useCallback(async (symbol: string, timeframe: Timeframe) => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const data = await fetchChart(symbol, timeframe)
      setState(s => ({ ...s, symbol, timeframe, ohlcv: data.ohlcv, info: data.info, loading: false }))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load chart'
      setState(s => ({ ...s, loading: false, error: msg }))
    }
  }, [])

  useEffect(() => { load(initialSymbol, '1h') }, []) // eslint-disable-line

  useEffect(() => {
    const wsUrl = (import.meta.env.VITE_WS_URL || 'ws://localhost:3001') + '/ws'
    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws
      ws.onopen = () => ws.send(JSON.stringify({ type: 'subscribe', ticker: state.symbol }))
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'price' && msg.symbol === state.symbol) {
            setState(s => ({
              ...s,
              info: s.info ? { ...s.info, price: msg.price, change: msg.change, changePct: msg.changePct } : s.info,
              ohlcv: s.ohlcv.length > 0 ? [...s.ohlcv.slice(0, -1), { ...s.ohlcv[s.ohlcv.length - 1], c: msg.price }] : s.ohlcv,
            }))
          }
        } catch { /* ignore */ }
      }
    } catch { /* ignore */ }
    return () => { wsRef.current?.close() }
  }, [state.symbol]) // eslint-disable-line

  const setSymbol = (symbol: string) => load(symbol.toUpperCase(), state.timeframe)
  const setTimeframe = (tf: Timeframe) => load(state.symbol, tf)
  return { ...state, setSymbol, setTimeframe }
}

export function calcEMA(data: OHLCV[], period: number): number[] {
  if (data.length < 2) return data.map(d => d.c)
  const k = 2 / (period + 1)
  const result: number[] = [data[0].c]
  for (let i = 1; i < data.length; i++) result.push(data[i].c * k + result[i - 1] * (1 - k))
  return result
}

export function calcRSI(data: OHLCV[], period = 14): number[] {
  if (data.length < period + 1) return data.map(() => 50)
  let gains = 0, losses = 0
  for (let i = 1; i <= period; i++) { const d = data[i].c - data[i - 1].c; if (d > 0) gains += d; else losses -= d }
  let ag = gains / period, al = losses / period
  const result: number[] = new Array(period).fill(50)
  result.push(100 - 100 / (1 + ag / (al || 0.001)))
  for (let i = period + 1; i < data.length; i++) {
    const d = data[i].c - data[i - 1].c
    ag = (ag * (period - 1) + (d > 0 ? d : 0)) / period
    al = (al * (period - 1) + (d < 0 ? -d : 0)) / period
    result.push(100 - 100 / (1 + ag / (al || 0.001)))
  }
  return result
}

export function calcBollinger(data: OHLCV[], period = 20, mult = 2) {
  const upper: number[] = [], lower: number[] = [], mid: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < period) { upper.push(0); lower.push(0); mid.push(0); continue }
    const slice = data.slice(i - period, i).map(d => d.c)
    const mean = slice.reduce((a, b) => a + b, 0) / period
    const std = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period)
    upper.push(mean + mult * std); lower.push(mean - mult * std); mid.push(mean)
  }
  return { upper, lower, mid }
}
