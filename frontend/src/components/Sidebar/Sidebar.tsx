import { IndicatorMap } from '../Dashboard'
const WATCHLIST = ['AAPL','MSFT','NVDA','TSLA','META','GOOGL','AMZN','SPY']
const IND_LABELS: Record<keyof IndicatorMap,string> = { ema20:'EMA 20',ema50:'EMA 50',bb:'Bollinger',vwap:'VWAP',vol:'Volume',rsi:'RSI' }

function Toggle({ on, onToggle }: { on:boolean; onToggle:()=>void }) {
  return <div onClick={onToggle} style={{ width:28,height:14,borderRadius:7,cursor:'pointer',position:'relative',background:on?'var(--blue)':'var(--border2)',transition:'background .2s',flexShrink:0 }}>
    <div style={{ position:'absolute',top:2,left:2,width:10,height:10,borderRadius:'50%',background:'white',transition:'transform .2s',transform:on?'translateX(14px)':'translateX(0)' }} />
  </div>
}

interface Props {
  currentSymbol:string; onSymbolSelect:(s:string)=>void
  indicators:IndicatorMap; onToggleIndicator:(k:keyof IndicatorMap)=>void
  candleMode:boolean; onToggleCandleMode:()=>void
}

export default function Sidebar({ currentSymbol,onSymbolSelect,indicators,onToggleIndicator,candleMode,onToggleCandleMode }:Props) {
  const sectionTitle = (t:string) => <div style={{ fontFamily:'var(--mono)',fontSize:9,color:'var(--text3)',letterSpacing:2,textTransform:'uppercase',padding:'10px 12px 6px' }}>{t}</div>
  return (
    <div style={{ display:'flex',flexDirection:'column',height:'100%',overflowY:'auto' }}>
      <div style={{ borderBottom:'1px solid var(--border)' }}>
        {sectionTitle('Watchlist')}
        {WATCHLIST.map(sym=>(
          <div key={sym} onClick={()=>onSymbolSelect(sym)} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'5px 12px',cursor:'pointer',background:sym===currentSymbol?'var(--bg4)':'none',transition:'background .1s' }}>
            <span style={{ fontFamily:'var(--mono)',fontSize:12,fontWeight:600,color:'var(--text)' }}>{sym}</span>
          </div>
        ))}
      </div>
      <div style={{ borderBottom:'1px solid var(--border)' }}>
        {sectionTitle('Indicators')}
        {(Object.keys(indicators) as (keyof IndicatorMap)[]).map(key=>(
          <div key={key} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'5px 12px' }}>
            <span style={{ fontSize:11,color:'var(--text2)' }}>{IND_LABELS[key]}</span>
            <Toggle on={indicators[key]} onToggle={()=>onToggleIndicator(key)} />
          </div>
        ))}
      </div>
      <div>
        {sectionTitle('Chart Type')}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'5px 12px' }}>
          <span style={{ fontSize:11,color:'var(--text2)' }}>{candleMode?'Candlestick':'Line'}</span>
          <Toggle on={candleMode} onToggle={onToggleCandleMode} />
        </div>
      </div>
    </div>
  )
}
