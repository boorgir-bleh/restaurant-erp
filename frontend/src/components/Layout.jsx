import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/',             icon: '◈', label: 'Dashboard',    managerOnly: true,  end: true },
  { to: '/tables',       icon: '◻', label: 'Tables',       managerOnly: false },
  { to: '/orders',       icon: '≡',  label: 'Orders',       managerOnly: false },
  { to: '/reservations', icon: '⊡', label: 'Reservations', managerOnly: false },
  { to: '/billing',      icon: '◎', label: 'Billing',      managerOnly: true  },
  { to: '/menu',         icon: '✦',  label: 'Menu',         managerOnly: true  },
  { to: '/users',        icon: '◉', label: 'Users',        managerOnly: true  },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
  const [date, setDate] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }))

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const isManager = user.role === 'manager'
  const navItems  = NAV.filter(n => !n.managerOnly || isManager)

  useEffect(() => {
    if (!isManager && window.location.pathname === '/') {
      navigate('/tables', { replace: true })
    }
  }, [isManager, navigate])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, minWidth: 240, background: 'var(--bg2)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Logo */}
        <div style={{
          padding: '28px 24px 20px',
          borderBottom: '1px solid var(--border)',
          background: `linear-gradient(180deg, rgba(212,168,71,0.06) 0%, transparent 100%)`,
        }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: '#d4a847', letterSpacing: 0.5 }}>
            Rooftop
          </div>
          <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 3, textTransform: 'uppercase', marginTop: 3 }}>
            Restaurant & Bar
          </div>
          <div style={{
            marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
            background: isManager ? 'rgba(212,168,71,0.12)' : 'rgba(122,158,126,0.12)',
            color: isManager ? '#d4a847' : '#7a9e7e',
            border: `1px solid ${isManager ? 'rgba(212,168,71,0.3)' : 'rgba(122,158,126,0.3)'}`,
          }}>
            {isManager ? '👔' : '🧑‍🍳'} {user.role}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {navItems.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', marginBottom: 2,
              borderRadius: 8, cursor: 'pointer', fontSize: 13,
              textDecoration: 'none', transition: 'all .15s',
              background: isActive ? 'rgba(212,168,71,0.1)' : 'transparent',
              color: isActive ? '#d4a847' : 'var(--text2)',
              borderLeft: isActive ? '2px solid #d4a847' : '2px solid transparent',
              fontWeight: isActive ? 500 : 400,
            })}>
              <span style={{ fontSize: 15, width: 20, textAlign: 'center', opacity: 0.8 }}>{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom user */}
        <div style={{
          padding: '16px 20px', borderTop: '1px solid var(--border)',
          background: 'rgba(0,0,0,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: isManager ? 'rgba(212,168,71,0.15)' : 'rgba(122,158,126,0.15)',
              border: `1px solid ${isManager ? 'rgba(212,168,71,0.4)' : 'rgba(122,158,126,0.4)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 600,
              color: isManager ? '#d4a847' : '#7a9e7e', flexShrink: 0,
            }}>{user.name[0]}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'capitalize' }}>{user.role}</div>
            </div>
            <button onClick={() => { logout(); navigate('/login') }} style={{
              background: 'none', border: 'none', color: 'var(--text3)',
              cursor: 'pointer', fontSize: 16, padding: 4, flexShrink: 0,
              transition: 'color .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text3)'}
              title="Sign out">⏻</button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{
          height: 56, background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7a9e7e', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Live</span>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', fontFamily: 'Inter, sans-serif' }}>{time}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{date}</div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
