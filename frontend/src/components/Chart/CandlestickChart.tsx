import { useRef, useEffect } from 'react'
import { OHLCV, TickerInfo } from '../../services/api'
import { calcEMA, calcBollinger } from '../../hooks/useChartData'
import { IndicatorMap } from '../Dashboard'

interface Props { ohlcv:OHLCV[]; info:TickerInfo|null; loading:boolean; error:string|null; indicators:IndicatorMap; candleMode:boolean }

export default function CandlestickChart({ ohlcv, info, loading, error, indicators, candleMode }:Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current
    if (!canvas || !wrap || ohlcv.length === 0) return
    const W = wrap.clientWidth, H = wrap.clientHeight
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')!
    const pad = { l:10, r:65, t:12, b:24 }
    const cw = W-pad.l-pad.r, ch = H-pad.t-pad.b
    const n = Math.min(ohlcv.length, 120), d = ohlcv.slice(-n)
    let mn=Infinity, mx=-Infinity
    d.forEach(c => { mn=Math.min(mn,c.l); mx=Math.max(mx,c.h) })
    const margin=(mx-mn)*0.05, lo=mn-margin, hi=mx+margin, range=hi-lo
    const yp = (v:number) => pad.t + ch*(1-(v-lo)/range)
    const bw = Math.max(2, cw/n - 1.5)
    const xp = (i:number) => pad.l + i*(cw/n) + bw/2

    // Grid
    for (let i=0; i<=6; i++) {
      const y = pad.t + ch*i/6
      ctx.strokeStyle='rgba(30,37,53,0.9)'; ctx.lineWidth=1; ctx.setLineDash([])
      ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(W-pad.r,y); ctx.stroke()
      ctx.fillStyle='rgba(107,122,153,0.6)'; ctx.font='10px IBM Plex Mono'
      ctx.fillText((hi-range*i/6).toFixed(2), W-pad.r+4, y+4)
    }

    // Volume
    if (indicators.vol) {
      const maxV = Math.max(...d.map(c=>c.v))
      d.forEach((c,i) => {
        ctx.fillStyle = c.c>=c.o ? 'rgba(0,208,132,0.12)' : 'rgba(240,62,62,0.12)'
        ctx.fillRect(xp(i)-bw/2, H-pad.b-35*(c.v/maxV), bw, 35*(c.v/maxV))
      })
    }

    // Bollinger
    if (indicators.bb && d.length>=20) {
      const bb = calcBollinger(d)
      ctx.strokeStyle='rgba(74,158,255,0.3)'; ctx.lineWidth=1; ctx.setLineDash([4,4])
      ;(['upper','lower'] as const).forEach(band => {
        ctx.beginPath()
        bb[band].forEach((v,i) => { if(v===0) return; i===0 ? ctx.moveTo(xp(i),yp(v)) : ctx.lineTo(xp(i),yp(v)) })
        ctx.stroke()
      })
      ctx.setLineDash([])
    }

    // EMAs
    if (indicators.ema20) {
      const ema=calcEMA(d,20); ctx.strokeStyle='#f5c842'; ctx.lineWidth=1.2; ctx.setLineDash([])
      ctx.beginPath(); ema.forEach((v,i)=>i===0?ctx.moveTo(xp(i),yp(v)):ctx.lineTo(xp(i),yp(v))); ctx.stroke()
    }
    if (indicators.ema50) {
      const ema=calcEMA(d,Math.min(50,d.length)); ctx.strokeStyle='#a78bfa'; ctx.lineWidth=1.2
      ctx.beginPath(); ema.forEach((v,i)=>i===0?ctx.moveTo(xp(i),yp(v)):ctx.lineTo(xp(i),yp(v))); ctx.stroke()
    }

    // Candles or line
    if (candleMode) {
      d.forEach((c,i) => {
        const up=c.c>=c.o
        ctx.strokeStyle=up?'#00d084':'#f03e3e'; ctx.fillStyle=up?'rgba(0,208,132,0.85)':'rgba(240,62,62,0.85)'; ctx.lineWidth=1
        ctx.beginPath(); ctx.moveTo(xp(i),yp(c.h)); ctx.lineTo(xp(i),yp(c.l)); ctx.stroke()
        const bTop=yp(Math.max(c.o,c.c)), bH=Math.max(1,Math.abs(yp(c.o)-yp(c.c)))
        ctx.fillRect(xp(i)-bw/2,bTop,bw,bH); ctx.strokeRect(xp(i)-bw/2,bTop,bw,bH)
      })
    } else {
      ctx.strokeStyle='#4a9eff'; ctx.lineWidth=1.5
      ctx.beginPath(); d.forEach((c,i)=>i===0?ctx.moveTo(xp(i),yp(c.c)):ctx.lineTo(xp(i),yp(c.c))); ctx.stroke()
      ctx.lineTo(xp(d.length-1),H-pad.b); ctx.lineTo(xp(0),H-pad.b)
      const grad=ctx.createLinearGradient(0,pad.t,0,H-pad.b)
      grad.addColorStop(0,'rgba(74,158,255,0.15)'); grad.addColorStop(1,'rgba(74,158,255,0)')
      ctx.fillStyle=grad; ctx.fill()
    }

    // Current price line
    if (info) {
      const py=yp(info.price), up=info.changePct>=0
      ctx.strokeStyle=up?'rgba(0,208,132,0.5)':'rgba(240,62,62,0.5)'; ctx.lineWidth=1; ctx.setLineDash([3,3])
      ctx.beginPath(); ctx.moveTo(pad.l,py); ctx.lineTo(W-pad.r,py); ctx.stroke(); ctx.setLineDash([])
      ctx.fillStyle=up?'#00d084':'#f03e3e'; ctx.fillRect(W-pad.r+1,py-8,pad.r-2,16)
      ctx.fillStyle='#000'; ctx.font='bold 10px IBM Plex Mono'; ctx.fillText(info.price.toFixed(2),W-pad.r+4,py+4)
    }
  }, [ohlcv, indicators, candleMode, info])

  useEffect(() => {
    const wrap=wrapRef.current; if (!wrap) return
    const ro=new ResizeObserver(()=>{
      if (canvasRef.current && wrap) { canvasRef.current.width=wrap.clientWidth; canvasRef.current.height=wrap.clientHeight }
    })
    ro.observe(wrap); return ()=>ro.disconnect()
  }, [])

  const up = info ? info.changePct>=0 : true
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'6px 14px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        {info && <>
          <span style={{ fontFamily:'var(--mono)',fontSize:11,color:'var(--text2)' }}>O: <span style={{color:'var(--text)'}}>{ohlcv.at(-1)?.o.toFixed(2)}</span></span>
          <span style={{ fontFamily:'var(--mono)',fontSize:11,color:'var(--text2)' }}>H: <span style={{color:'var(--green)'}}>{ohlcv.at(-1)?.h.toFixed(2)}</span></span>
          <span style={{ fontFamily:'var(--mono)',fontSize:11,color:'var(--text2)' }}>L: <span style={{color:'var(--red)'}}>{ohlcv.at(-1)?.l.toFixed(2)}</span></span>
          <span style={{ fontFamily:'var(--mono)',fontSize:11,color:'var(--text2)' }}>C: <span style={{color:up?'var(--green)':'var(--red)'}}>{ohlcv.at(-1)?.c.toFixed(2)}</span></span>
          <span style={{ fontFamily:'var(--mono)',fontSize:11,color:'var(--text2)',marginLeft:'auto' }}>Vol: {((ohlcv.at(-1)?.v||0)/1e6).toFixed(2)}M</span>
        </>}
      </div>
      <div ref={wrapRef} style={{ flex:1, position:'relative', overflow:'hidden' }}>
        {loading && <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(10,12,15,0.8)',zIndex:10 }}><span style={{ fontFamily:'var(--mono)',fontSize:12,color:'var(--text2)' }}>Loading chart data...</span></div>}
        {error && <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:10 }}><span style={{ fontFamily:'var(--mono)',fontSize:12,color:'var(--red)' }}>{error}</span></div>}
        <canvas ref={canvasRef} style={{ position:'absolute',top:0,left:0,width:'100%',height:'100%' }} />
      </div>
    </div>
  )
}
