import React, { useEffect, useState } from 'react'
import { PageHeader, Card, Table } from '../components/UI'
import api from '../api'

const PERMISSIONS = [
  ['Dashboard',    true,  false],
  ['Tables',       true,  true ],
  ['Orders',       true,  true ],
  ['Reservations', true,  true ],
  ['Billing',      true,  false],
  ['Menu',         true,  false],
  ['Users',        true,  false],
]

export default function UsersPage() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/users').then(r => { setUsers(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      <PageHeader title="Our Team" subtitle="Manage staff access and permissions" />

      {loading
        ? <div style={{ color: 'var(--text3)' }}>Loading…</div>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {users.map(u => (
              <div key={u.id} style={{
                background: 'var(--bg2)',
                border: `1px solid ${u.role === 'manager' ? 'rgba(212,168,71,0.3)' : 'rgba(122,174,212,0.3)'}`,
                borderRadius: 12, padding: 22, transition: 'border-color .2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: '50%',
                    background: u.role === 'manager'
                      ? `url('https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&crop=face') center/cover`
                      : `url('https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=100&auto=format&fit=crop&crop=face') center/cover`,
                    border: `2px solid ${u.role === 'manager' ? 'rgba(212,168,71,0.4)' : 'rgba(122,174,212,0.4)'}`,
                    flexShrink: 0,
                  }} />
                  <div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, color: 'var(--text)' }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: u.role === 'manager' ? 'var(--gold)' : 'var(--blue)', textTransform: 'capitalize', marginTop: 3 }}>
                      {u.role === 'manager' ? '👔 Manager' : '🧑‍🍳 Staff'}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'monospace', marginBottom: 8 }}>{u.email}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
                  {u.role === 'manager'
                    ? 'Full system access — dashboard, billing, menu, users & operations'
                    : 'Operational access — tables, orders & reservations'}
                </div>
              </div>
            ))}
          </div>
        )
      }

      <Card title="Access Permissions">
        <Table
          columns={['Module', 'Manager', 'Staff']}
          rows={PERMISSIONS.map(([mod, manager, staff]) => [
            <span style={{ fontWeight: 500, color: 'var(--text)' }}>{mod}</span>,
            <span style={{ color: manager ? 'var(--gold)'  : 'var(--text3)' }}>{manager ? '✓ Full access' : '—'}</span>,
            <span style={{ color: staff   ? 'var(--sage)'  : 'var(--text3)' }}>{staff   ? '✓ Full access' : '—'}</span>,
          ])}
        />
      </Card>
    </div>
  )
}
