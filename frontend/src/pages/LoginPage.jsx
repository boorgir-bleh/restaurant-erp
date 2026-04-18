import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const DEMO = [
  { email: 'manager@rooftop.local', role: 'manager', label: 'Full access to all modules', icon: '👔' },
  { email: 'staff@rooftop.local',   role: 'staff',   label: 'Orders, tables & reservations', icon: '🧑‍🍳' },
]

export default function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const result = await login(email, password)
    if (result.ok) navigate('/')
    else setError(result.error)
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid #4f4235',
    borderRadius: 8,
    padding: '11px 14px',
    color: '#f5ede0',
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    transition: 'border .2s',
  }

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
    }}>
      {/* Left — image panel */}
      <div style={{
        flex: 1,
        background: `linear-gradient(rgba(20,14,8,0.45), rgba(20,14,8,0.7)),
          url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop') center/cover no-repeat`,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '48px',
      }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 48, fontWeight: 700, color: '#f5ede0', lineHeight: 1.1, marginBottom: 16 }}>
          Rooftop<br /><span style={{ color: '#d4a847' }}>Restaurant</span>
        </div>
        <div style={{ fontSize: 15, color: '#c4a882', lineHeight: 1.7, maxWidth: 360 }}>
          An elevated dining experience above the city skyline — where every meal tells a story.
        </div>
        <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
          {['Fine Dining', 'Rooftop Views', 'Curated Menu'].map(tag => (
            <span key={tag} style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12,
              border: '1px solid rgba(212,168,71,0.4)', color: '#d4a847',
              background: 'rgba(212,168,71,0.08)',
            }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Right — login panel */}
      <div style={{
        width: 440, background: '#1a1510',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '48px 40px',
        borderLeft: '1px solid #3d3328',
      }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 600, color: '#f5ede0', marginBottom: 6 }}>
            Welcome back
          </div>
          <div style={{ fontSize: 14, color: '#8a7560' }}>Sign in to manage your restaurant</div>
        </div>

        {/* Role cards */}
        <div style={{ marginBottom: 8, fontSize: 11, color: '#8a7560', textTransform: 'uppercase', letterSpacing: 1.5 }}>
          Quick access
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
          {DEMO.map(d => (
            <div key={d.role} onClick={() => { setEmail(d.email); setPassword('rooftop@123') }}
              style={{
                background: email === d.email ? 'rgba(212,168,71,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${email === d.email ? '#d4a847' : '#3d3328'}`,
                borderRadius: 10, padding: '14px', cursor: 'pointer', transition: 'all .2s',
              }}
              onMouseEnter={e => { if (email !== d.email) e.currentTarget.style.borderColor = '#4f4235' }}
              onMouseLeave={e => { if (email !== d.email) e.currentTarget.style.borderColor = '#3d3328' }}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>{d.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: email === d.email ? '#d4a847' : '#f5ede0', textTransform: 'capitalize', marginBottom: 3 }}>{d.role}</div>
              <div style={{ fontSize: 11, color: '#8a7560', lineHeight: 1.4 }}>{d.label}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8a7560', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="email@rooftop.local" required style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#d4a847'}
              onBlur={e => e.target.style.borderColor = '#4f4235'} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#8a7560', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••" required style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#d4a847'}
              onBlur={e => e.target.style.borderColor = '#4f4235'} />
          </div>

          {error && <div style={{ color: '#e07070', fontSize: 13, marginBottom: 14, padding: '8px 12px', background: 'rgba(224,112,112,0.1)', borderRadius: 6, border: '1px solid rgba(224,112,112,0.2)' }}>{error}</div>}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px 18px', borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg, #d4a847, #b8912e)',
            color: '#1a1510', fontSize: 14, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif',
            opacity: loading ? .7 : 1,
            transition: 'opacity .2s',
            letterSpacing: .3,
          }}>{loading ? 'Signing in…' : 'Sign In'}</button>
        </form>

        <div style={{ marginTop: 24, fontSize: 12, color: '#4f4235', textAlign: 'center' }}>
          Default password: <span style={{ color: '#8a7560', fontFamily: 'monospace' }}>rooftop@123</span>
        </div>
      </div>
    </div>
  )
}
