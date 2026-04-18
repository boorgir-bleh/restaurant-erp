import React, { useEffect, useState, useCallback } from 'react'
import api from '../api'
import socket from '../socket'
import { MetricCard, Card, PageHeader, statusBadge, calcBill } from '../components/UI'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await api.get('/dashboard')
      setData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    socket.on('order:update', load)
    socket.on('table:update', load)
    socket.on('reservation:update', load)
    return () => {
      socket.off('order:update', load)
      socket.off('table:update', load)
      socket.off('reservation:update', load)
    }
  }, [load])

  if (loading) return <div style={{ color: 'var(--text3)', padding: 20 }}>Loading…</div>
  if (!data)   return <div style={{ color: 'var(--red)', padding: 20 }}>Failed to load dashboard</div>

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>
      {/* Hero banner */}
      <div style={{
        borderRadius: 14, overflow: 'hidden', marginBottom: 24, position: 'relative', height: 160,
        background: `linear-gradient(90deg, rgba(26,21,16,0.95) 40%, rgba(26,21,16,0.6) 100%),
          url('https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1200&auto=format&fit=crop') center/cover no-repeat`,
      }}>
        <div style={{ position: 'absolute', inset: 0, padding: '28px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 6 }}>{greeting}</div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 600, color: 'var(--text)' }}>
            {user.name}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
            Here's what's happening at Rooftop today
          </div>
        </div>
        <div style={{ position: 'absolute', top: 20, right: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7a9e7e', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>Live updates</span>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
        <MetricCard icon="₹" label="Revenue Today"    value={`₹${Number(data.revenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} valueColor="var(--gold)" sub="From settled bills" />
        <MetricCard icon="🍽" label="Active Orders"   value={data.active_orders}   valueColor="var(--text)" sub="In kitchen / served" />
        <MetricCard icon="◻" label="Tables Free"     value={`${data.available_tables}/${data.total_tables}`} sub="Available right now" />
        <MetricCard icon="📅" label="Bookings Today"  value={data.reservations_today} valueColor="var(--blue)" sub="Confirmed reservations" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card title="Recent Orders">
          {data.recent_orders.length === 0
            ? <div style={{ color: 'var(--text3)', fontSize: 13, padding: '12px 0' }}>No orders yet today</div>
            : data.recent_orders.map(o => (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', fontFamily: 'Playfair Display, serif' }}>
                    Table {o.table_id}
                    <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'Inter, sans-serif', fontWeight: 400, marginLeft: 6 }}>#{o.id}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{new Date(o.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, color: 'var(--gold)', fontWeight: 500, marginBottom: 4 }}>₹{Number(o.total).toFixed(0)}</div>
                  {statusBadge(o.status)}
                </div>
              </div>
            ))
          }
        </Card>

        <Card title="At a Glance">
          {[
            { label: 'Total Tables',      val: data.total_tables,                              icon: '◻' },
            { label: 'Occupied',          val: data.total_tables - data.available_tables,       icon: '🔴' },
            { label: 'Available',         val: data.available_tables,                           icon: '🟢' },
            { label: 'Active Orders',     val: data.active_orders,                              icon: '🍽' },
            { label: 'Today\'s Bookings', val: data.reservations_today,                         icon: '📅' },
          ].map(({ label, val, icon }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>{icon}</span>{label}
              </span>
              <span style={{ color: 'var(--text)', fontWeight: 500 }}>{val}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
