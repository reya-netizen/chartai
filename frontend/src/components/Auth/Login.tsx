import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Login() {
  const { login, register, loginAsGuest } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (fn: () => Promise<void>) => {
    setLoading(true)
    setError('')
    try {
      await fn()
      navigate('/')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', flexDirection: 'column', gap: 24,
    }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 28, fontWeight: 700, color: 'var(--blue)', letterSpacing: 4 }}>
        CHARTAI
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)', marginTop: -16 }}>
        AI-Powered Trading Charts
      </div>

      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8,
        padding: '28px 32px', width: 340, display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '8px 0', background: 'none', border: 'none',
              fontFamily: 'var(--mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1,
              color: mode === m ? 'var(--blue)' : 'var(--text2)',
              borderBottom: mode === m ? '2px solid var(--blue)' : '2px solid transparent',
              cursor: 'pointer', transition: 'all .15s',
            }}>{m}</button>
          ))}
        </div>

        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handle(() => mode === 'login' ? login(email, password) : register(email, password))}
          style={inputStyle}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handle(() => mode === 'login' ? login(email, password) : register(email, password))}
          style={inputStyle}
        />

        {error && (
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--red)', background: 'rgba(240,62,62,.08)', padding: '6px 10px', borderRadius: 4 }}>
            {error}
          </div>
        )}

        <button
          disabled={loading || !email || !password}
          onClick={() => handle(() => mode === 'login' ? login(email, password) : register(email, password))}
          style={{ ...btnStyle, background: 'var(--blue)', color: '#000', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <div style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)' }}>— or —</div>

        <button
          disabled={loading}
          onClick={() => handle(loginAsGuest)}
          style={{ ...btnStyle, background: 'var(--bg4)', color: 'var(--text2)', border: '1px solid var(--border2)' }}
        >
          Continue as Guest
        </button>

        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', textAlign: 'center' }}>
          Guest sessions expire after 24 hours
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 4,
  color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 12,
  padding: '8px 12px', outline: 'none', width: '100%',
}

const btnStyle: React.CSSProperties = {
  padding: '10px', borderRadius: 4, border: 'none',
  fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600,
  cursor: 'pointer', transition: 'opacity .15s', width: '100%',
}
