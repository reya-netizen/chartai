import { useState, useEffect } from 'react'
import { fetchAlerts, createAlert, deleteAlert, Alert } from '../../services/api'

export default function AlertList() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ symbol: '', condition: 'above', price: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAlerts().then(setAlerts).catch(() => {})
  }, [])

  const add = async () => {
    if (!form.symbol || !form.price) return
    setLoading(true)
    try {
      const a = await createAlert({
        symbol: form.symbol.toUpperCase(),
        condition: form.condition,
        price: parseFloat(form.price),
      })
      setAlerts(prev => [...prev, a])
      setForm({ symbol: '', condition: 'above', price: '' })
      setAdding(false)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const remove = async (id: string) => {
    await deleteAlert(id).catch(() => {})
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const statusColor: Record<string, string> = {
    active: 'var(--green)',
    triggered: 'var(--yellow)',
    disabled: 'var(--text3)',
  }

  const inp: React.CSSProperties = {
    background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 3,
    color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 11,
    padding: '4px 6px', outline: 'none', width: '100%',
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '5px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase' }}>Alerts</span>
        <button onClick={() => setAdding(v => !v)} style={{
          background: adding ? 'var(--bg4)' : 'none', border: '1px solid var(--border2)',
          borderRadius: 2, color: 'var(--blue)', fontFamily: 'var(--mono)', fontSize: 9,
          padding: '2px 7px', cursor: 'pointer', letterSpacing: 1,
        }}>
          {adding ? '✕ Cancel' : '+ New'}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
          <input
            placeholder="Symbol (AAPL)"
            value={form.symbol}
            onChange={e => setForm(f => ({ ...f, symbol: e.target.value.toUpperCase() }))}
            style={inp}
          />
          <div style={{ display: 'flex', gap: 4 }}>
            <select
              value={form.condition}
              onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
              style={{ ...inp, width: 'auto', flex: 1 }}
            >
              <option value="above">Price above</option>
              <option value="below">Price below</option>
              <option value="rsi_above">RSI above</option>
              <option value="rsi_below">RSI below</option>
            </select>
            <input
              placeholder="Price"
              type="number"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              style={{ ...inp, flex: 1 }}
            />
          </div>
          <button
            onClick={add}
            disabled={loading || !form.symbol || !form.price}
            style={{
              background: 'var(--blue)', border: 'none', borderRadius: 2,
              color: '#000', fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
              padding: '5px', cursor: 'pointer', opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? 'Creating...' : 'Create Alert'}
          </button>
        </div>
      )}

      {/* Alert list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {alerts.length === 0 && (
          <div style={{ padding: '20px 0', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)' }}>
            No alerts yet
          </div>
        )}
        {alerts.map(a => (
          <div key={a.id} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
            background: 'var(--bg3)', borderRadius: 3, border: '1px solid var(--border)',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor[a.status] || 'var(--text3)', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: 'var(--text)', width: 42 }}>{a.symbol}</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text2)', flex: 1 }}>
              {a.condition === 'above' ? '≥' : a.condition === 'below' ? '≤' : a.condition}
            </span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--yellow)' }}>{a.price}</span>
            <button onClick={() => remove(a.id)} style={{
              background: 'none', border: 'none', color: 'var(--text3)',
              fontFamily: 'var(--mono)', fontSize: 11, cursor: 'pointer', padding: '0 2px',
              lineHeight: 1,
            }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
