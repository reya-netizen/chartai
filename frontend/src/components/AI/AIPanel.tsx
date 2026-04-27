import { useState, useRef, useEffect } from 'react'
import { analyzeChart, fetchModels, OHLCV, TickerInfo } from '../../services/api'
import { calcRSI } from '../../hooks/useChartData'

interface Props {
  symbol: string
  info: TickerInfo | null
  ohlcv: OHLCV[]
}

interface Message { role: 'system' | 'user' | 'assistant' | 'thinking'; content: string }
interface Model { id: string; name: string; provider: string }

const QUICK_ACTIONS = ['Analyze trend', 'Key support/resistance', 'RSI signal', 'Bull vs Bear case']

export default function AIPanel({ symbol, info, ohlcv }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'ChartAI ready. Select a ticker and ask about patterns, price targets, or trading signals.' }
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [model, setModel] = useState('anthropic/claude-sonnet-4-5')
  const [models, setModels] = useState<Model[]>([])
  const [history, setHistory] = useState<Array<{ role: string; content: string }>>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { fetchModels().then(setModels).catch(() => {}) }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Reset conversation when ticker changes
  useEffect(() => {
    setMessages([{ role: 'system', content: `Switched to ${symbol}. Ask me anything about this chart.` }])
    setHistory([])
  }, [symbol])

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || sending) return

    setMessages(prev => [...prev, { role: 'user', content: q }])
    setInput('')
    setSending(true)
    setMessages(prev => [...prev, { role: 'thinking', content: `Analyzing ${symbol} chart data...` }])

    try {
      const rsiArr = calcRSI(ohlcv)
      const rsi = rsiArr[rsiArr.length - 1] ?? 50

      const result = await analyzeChart({
        ticker: symbol,
        price: info?.price ?? 0,
        change: info?.changePct ?? 0,
        ohlcv: ohlcv.slice(-20),
        rsi,
        question: q,
        model,
        conversationHistory: history,
      })

      setMessages(prev => [
        ...prev.filter(m => m.role !== 'thinking'),
        { role: 'assistant', content: result.reply }
      ])
      setHistory(prev => [
        ...prev,
        { role: 'user', content: q },
        { role: 'assistant', content: result.reply }
      ])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed'
      setMessages(prev => [
        ...prev.filter(m => m.role !== 'thinking'),
        { role: 'system', content: `⚠ ${msg}` }
      ])
    } finally {
      setSending(false)
    }
  }

  const msgStyle = {
    system:    { border: 'var(--blue)',   bg: 'rgba(74,158,255,0.05)',  label: 'System' },
    user:      { border: 'var(--purple)', bg: 'rgba(167,139,250,0.05)', label: 'You' },
    assistant: { border: 'var(--green)',  bg: 'rgba(0,208,132,0.05)',   label: 'AI Analysis' },
    thinking:  { border: 'var(--yellow)', bg: 'rgba(245,200,66,0.05)',  label: 'Thinking…' },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--blue)', fontWeight: 600, letterSpacing: 1 }}>
          AI ANALYSIS
        </span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', background: 'var(--bg4)', border: '1px solid var(--border2)', borderRadius: 2, padding: '1px 5px' }}>
          {symbol}
        </span>
        <div style={{ flex: 1 }} />
        <select value={model} onChange={e => setModel(e.target.value)} style={{
          background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text2)',
          fontFamily: 'var(--mono)', fontSize: 9, padding: '2px 4px', borderRadius: 2, outline: 'none', maxWidth: 140,
        }}>
          {models.length > 0
            ? models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)
            : <option value="anthropic/claude-sonnet-4-5">Claude Sonnet</option>
          }
        </select>
      </div>

      {/* Quick action chips */}
      <div style={{ display: 'flex', gap: 4, padding: '6px 8px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', flexShrink: 0 }}>
        {QUICK_ACTIONS.map(q => (
          <button key={q} onClick={() => send(q)} disabled={sending} style={{
            background: 'var(--bg4)', border: '1px solid var(--border2)', borderRadius: 2,
            color: 'var(--text2)', fontFamily: 'var(--mono)', fontSize: 9,
            padding: '3px 7px', cursor: 'pointer', transition: 'border-color .15s',
          }}>{q}</button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.map((msg, i) => {
          const s = msgStyle[msg.role]
          return (
            <div key={i} style={{ borderLeft: `2px solid ${s.border}`, background: s.bg, borderRadius: '0 4px 4px 0', padding: '7px 10px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                {s.label}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: 8, borderTop: '1px solid var(--border)', display: 'flex', gap: 6, flexShrink: 0 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
          placeholder="Ask about this chart… (Enter to send)"
          rows={2}
          style={{
            flex: 1, background: 'var(--bg3)', border: '1px solid var(--border2)',
            borderRadius: 3, color: 'var(--text)', fontFamily: 'var(--mono)',
            fontSize: 11, padding: '6px 8px', outline: 'none', resize: 'none', lineHeight: 1.5,
          }}
        />
        <button onClick={() => send(input)} disabled={sending || !input.trim()} style={{
          background: 'var(--blue)', border: 'none', borderRadius: 3,
          color: '#000', fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700,
          padding: '0 14px', cursor: 'pointer', opacity: sending ? 0.4 : 1, transition: 'opacity .15s',
        }}>▶</button>
      </div>
    </div>
  )
}
