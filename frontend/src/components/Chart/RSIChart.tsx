import { useRef, useEffect } from 'react'
import { OHLCV } from '../../services/api'
import { calcRSI } from '../../hooks/useChartData'

export default function RSIChart({ ohlcv }: { ohlcv: OHLCV[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current
    if (!canvas || !wrap || ohlcv.length < 15) return
    const W = wrap.clientWidth, H = wrap.clientHeight
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')!
    const pad = { l: 10, r: 50, t: 4, b: 16 }
    const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b
    const rsi = calcRSI(ohlcv)
    const n = Math.min(rsi.length, 120), d = rsi.slice(-n)
    const xp = (i: number) => pad.l + i * (cw / n)
    const yp = (v: number) => pad.t + ch * (1 - v / 100)

    // Zones
    ctx.fillStyle = 'rgba(240,62,62,0.05)'
    ctx.fillRect(pad.l, pad.t, cw, ch * (1 - 70 / 100))
    ctx.fillStyle = 'rgba(0,208,132,0.05)'
    ctx.fillRect(pad.l, yp(30), cw, ch * 0.3)

    // Zone lines
    ;[30, 50, 70].forEach(v => {
      ctx.strokeStyle = v === 50 ? 'rgba(30,37,53,0.9)' : 'rgba(50,60,80,0.6)'
      ctx.lineWidth = 1; ctx.setLineDash(v === 50 ? [] : [3, 3])
      ctx.beginPath(); ctx.moveTo(pad.l, yp(v)); ctx.lineTo(W - pad.r, yp(v)); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = 'rgba(107,122,153,0.5)'; ctx.font = '9px IBM Plex Mono'
      ctx.fillText(String(v), W - pad.r + 4, yp(v) + 4)
    })

    // RSI line
    ctx.strokeStyle = '#4a9eff'; ctx.lineWidth = 1.5
    ctx.beginPath()
    d.forEach((v, i) => i === 0 ? ctx.moveTo(xp(i), yp(v)) : ctx.lineTo(xp(i), yp(v)))
    ctx.stroke()

    // Current RSI label
    const last = d[d.length - 1]
    ctx.fillStyle = last > 70 ? '#f03e3e' : last < 30 ? '#00d084' : '#4a9eff'
    ctx.font = 'bold 10px IBM Plex Mono'
    ctx.fillText(`RSI ${last.toFixed(1)}`, W - pad.r + 4, yp(last) + 4)
  }, [ohlcv])

  useEffect(() => {
    const wrap = wrapRef.current; if (!wrap) return
    const ro = new ResizeObserver(() => {
      if (canvasRef.current) { canvasRef.current.width = wrap.clientWidth; canvasRef.current.height = wrap.clientHeight }
    })
    ro.observe(wrap); return () => ro.disconnect()
  }, [])

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
    </div>
  )
}
