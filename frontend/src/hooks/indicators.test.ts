import { describe, it, expect } from 'vitest'
import { calcEMA, calcRSI, calcBollinger } from './useChartData'
import { OHLCV } from '../services/api'

function makeOHLCV(n: number, startPrice = 100): OHLCV[] {
  let price = startPrice
  return Array.from({ length: n }, (_, i) => {
    const o = price
    const c = price + (Math.random() - 0.5) * 2
    price = c
    return { o, h: Math.max(o, c) + 0.5, l: Math.min(o, c) - 0.5, c, v: 100000, t: Date.now() - (n - i) * 3600000 }
  })
}

describe('calcEMA', () => {
  it('returns same length as input', () => {
    expect(calcEMA(makeOHLCV(50), 20).length).toBe(50)
  })
  it('first value equals first close price', () => {
    const data = makeOHLCV(30)
    expect(calcEMA(data, 10)[0]).toBe(data[0].c)
  })
  it('EMA stays within price range', () => {
    const data = makeOHLCV(60, 200)
    const ema = calcEMA(data, 20)
    const min = Math.min(...data.map(d => d.c)) - 5
    const max = Math.max(...data.map(d => d.c)) + 5
    ema.forEach(v => { expect(v).toBeGreaterThan(min); expect(v).toBeLessThan(max) })
  })
})

describe('calcRSI', () => {
  it('returns same length as input', () => {
    expect(calcRSI(makeOHLCV(50), 14).length).toBe(50)
  })
  it('RSI values are 0–100', () => {
    calcRSI(makeOHLCV(60), 14).forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(100)
    })
  })
  it('returns 50 for short data', () => {
    expect(calcRSI(makeOHLCV(5), 14)[0]).toBe(50)
  })
})

describe('calcBollinger', () => {
  it('returns three arrays of same length', () => {
    const bb = calcBollinger(makeOHLCV(50))
    expect(bb.upper.length).toBe(50)
    expect(bb.lower.length).toBe(50)
    expect(bb.mid.length).toBe(50)
  })
  it('upper >= lower after warmup', () => {
    const bb = calcBollinger(makeOHLCV(60), 20)
    for (let i = 20; i < bb.upper.length; i++) {
      expect(bb.upper[i]).toBeGreaterThanOrEqual(bb.lower[i])
    }
  })
})
