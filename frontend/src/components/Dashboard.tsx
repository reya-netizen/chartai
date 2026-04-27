import { useState } from 'react'
import { useChartData, Timeframe } from '../hooks/useChartData'
import TopBar from './TopBar'
import Sidebar from './Sidebar/Sidebar'
import CandlestickChart from './Chart/CandlestickChart'
import AIPanel from './AI/AIPanel'
import RSIChart from './Chart/RSIChart'
import AlertList from './Alerts/AlertList'

export type IndicatorMap = {
  ema20: boolean; ema50: boolean; bb: boolean; vwap: boolean; vol: boolean; rsi: boolean
}

export default function Dashboard() {
  const chart = useChartData('AAPL')
  const [candleMode, setCandleMode] = useState(true)
  const [indicators, setIndicators] = useState<IndicatorMap>({
    ema20: true, ema50: true, bb: false, vwap: false, vol: true, rsi: true,
  })

  const toggleIndicator = (key: keyof IndicatorMap) =>
    setIndicators(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TopBar
        symbol={chart.symbol}
        timeframe={chart.timeframe as Timeframe}
        info={chart.info}
        onSymbolChange={chart.setSymbol}
        onTimeframeChange={chart.setTimeframe}
      />

      <div style={{
        flex: 1, display: 'grid', overflow: 'hidden',
        gridTemplateColumns: '200px 1fr 300px',
        gridTemplateRows: '1fr 200px',
      }}>
        {/* Sidebar — spans both rows */}
        <div style={{ gridRow: '1 / 3', borderRight: '1px solid var(--border)', background: 'var(--bg2)', overflow: 'hidden' }}>
          <Sidebar
            currentSymbol={chart.symbol}
            onSymbolSelect={chart.setSymbol}
            indicators={indicators}
            onToggleIndicator={toggleIndicator}
            candleMode={candleMode}
            onToggleCandleMode={() => setCandleMode(v => !v)}
          />
        </div>

        {/* Main chart */}
        <div style={{ background: 'var(--bg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <CandlestickChart
            ohlcv={chart.ohlcv}
            info={chart.info}
            loading={chart.loading}
            error={chart.error}
            indicators={indicators}
            candleMode={candleMode}
          />
        </div>

        {/* AI panel — spans both rows */}
        <div style={{ gridRow: '1 / 3', borderLeft: '1px solid var(--border)', background: 'var(--bg2)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <AIPanel symbol={chart.symbol} info={chart.info} ohlcv={chart.ohlcv} />
        </div>

        {/* Bottom row: RSI + Alerts */}
        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg2)', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 220px' }}>
          {/* RSI chart */}
          <div style={{ overflow: 'hidden', borderRight: '1px solid var(--border)' }}>
            <div style={{ padding: '5px 12px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase' }}>
              RSI (14)
            </div>
            <div style={{ height: 'calc(100% - 28px)' }}>
              <RSIChart ohlcv={chart.ohlcv} />
            </div>
          </div>
          {/* Alerts */}
          <AlertList />
        </div>
      </div>
    </div>
  )
}
