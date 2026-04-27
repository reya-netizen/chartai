import { useState, useEffect } from 'react'
import { Timeframe } from '../hooks/useChartData'
import { TickerInfo } from '../services/api'
import { useAuth } from '../hooks/useAuth'

const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d', '1w']

interface Props {
  symbol: string; timeframe: Timeframe; info: TickerInfo | null
  onSymbolChange: (s: string) => void; onTimeframeChange: (tf: Timeframe) => void
}

export default function TopBar({ symbol, timeframe, info, onSymbolChange, onTimeframeChange }: Props) {
  const { email, isGuest, logout } = useAuth()
  const [input, setInput] = useState(symbol)
  const [clock, setClock] = useState('')

  useEffect(() => { setInput(symbol) }, [symbol])
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US', { hour12: false }))
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [])

  const submit = () => { const s = input.trim().toUpperCase(); if (s) onSymbolChange(s) }
  const up = info ? info.changePct >= 0 : true

  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, height:40, background:'var(--bg2)', borderBottom:'1px solid var(--border)', padding:'0 12px', flexShrink:0 }}>
      <span style={{ fontFamily:'var(--mono)', fontWeight:700, fontSize:14, color:'var(--blue)', letterSpacing:3, marginRight:12 }}>CHARTAI</span>
      <input value={input} onChange={e=>setInput(e.target.value.toUpperCase())} onKeyDown={e=>e.key==='Enter'&&submit()} onBlur={submit}
        style={{ background:'var(--bg3)', border:'1px solid var(--border2)', borderRadius:3, color:'var(--text)', fontFamily:'var(--mono)', fontSize:13, fontWeight:600, padding:'3px 8px', width:72, outline:'none', textTransform:'uppercase' }} />
      <div style={{ width:1, height:20, background:'var(--border)', margin:'0 4px' }} />
      {TIMEFRAMES.map(tf => (
        <button key={tf} onClick={() => onTimeframeChange(tf)} style={{ background:tf===timeframe?'var(--bg4)':'none', border:'none', borderRadius:2, color:tf===timeframe?'var(--text)':'var(--text2)', fontFamily:'var(--mono)', fontSize:11, padding:'3px 7px', cursor:'pointer' }}>{tf}</button>
      ))}
      <div style={{ width:1, height:20, background:'var(--border)', margin:'0 4px' }} />
      {info && <>
        <span style={{ fontFamily:'var(--mono)', fontSize:14, fontWeight:700, color:up?'var(--green)':'var(--red)' }}>${info.price.toFixed(2)}</span>
        <span style={{ fontFamily:'var(--mono)', fontSize:11, color:up?'var(--green)':'var(--red)' }}>{up?'+':''}{info.change.toFixed(2)} ({up?'+':''}{info.changePct.toFixed(2)}%)</span>
      </>}
      <div style={{ flex:1 }} />
      <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 6px var(--green)', animation:'pulse 2s infinite' }} />
      <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text2)' }}>LIVE</span>
      <div style={{ width:1, height:20, background:'var(--border)', margin:'0 6px' }} />
      <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text2)' }}>{clock}</span>
      <div style={{ width:1, height:20, background:'var(--border)', margin:'0 6px' }} />
      <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text2)' }}>{isGuest ? 'Guest' : email}</span>
      <button onClick={logout} style={{ background:'var(--bg4)', border:'1px solid var(--border2)', borderRadius:2, color:'var(--text2)', fontFamily:'var(--mono)', fontSize:9, padding:'2px 7px', cursor:'pointer' }}>LOGOUT</button>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  )
}
