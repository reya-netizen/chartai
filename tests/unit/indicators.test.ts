import { describe, it, expect } from 'vitest'
import { calcEMA, calcRSI, calcBollinger } from '../hooks/useChartData'
import { OHLCV } from '../services/api'

// Generate synthetic OHLCV data for testing
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
    const data = makeOHLCV(50)
    expect(calcEMA(data, 20).length).toBe(50)
  })

  it('first value equals first close price', () => {
    const data = makeOHLCV(30)
    const ema = calcEMA(data, 10)
    expect(ema[0]).toBe(data[0].c)
  })

  it('EMA values stay within reasonable range of prices', () => {
    const data = makeOHLCV(60, 200)
    const ema = calcEMA(data, 20)
    const prices = data.map(d => d.c)
    const minPrice = Math.min(...prices) - 5
    const maxPrice = Math.max(...prices) + 5
    ema.forEach(v => {
      expect(v).toBeGreaterThan(minPrice)
      expect(v).toBeLessThan(maxPrice)
    })
  })
})

describe('calcRSI', () => {
  it('returns same length as input', () => {
    const data = makeOHLCV(50)
    expect(calcRSI(data, 14).length).toBe(50)
  })

  it('RSI values are between 0 and 100', () => {
    const data = makeOHLCV(60)
    const rsi = calcRSI(data, 14)
    rsi.forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(100)
    })
  })

  it('returns 50 for short data', () => {
    const data = makeOHLCV(5)
    const rsi = calcRSI(data, 14)
    expect(rsi[0]).toBe(50)
  })
})

describe('calcBollinger', () => {
  it('returns upper, lower, mid arrays of same length as input', () => {
    const data = makeOHLCV(50)
    const bb = calcBollinger(data)
    expect(bb.upper.length).toBe(50)
    expect(bb.lower.length).toBe(50)
    expect(bb.mid.length).toBe(50)
  })

  it('upper band is always >= lower band after warmup period', () => {
    const data = makeOHLCV(60)
    const bb = calcBollinger(data, 20)
    for (let i = 20; i < bb.upper.length; i++) {
      expect(bb.upper[i]).toBeGreaterThanOrEqual(bb.lower[i])
    }
  })

  it('mid band equals simple moving average', () => {
    const data = makeOHLCV(30, 100)
    const bb = calcBollinger(data, 5)
    // Check at index 5 — first valid calculation
    const expectedMid = data.slice(0, 5).reduce((a, b) => a + b.c, 0) / 5
    expect(bb.mid[4]).toBeCloseTo(expectedMid, 5)
  })
})
